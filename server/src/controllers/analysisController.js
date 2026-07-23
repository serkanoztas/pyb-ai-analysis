import Template from "../models/Template.js";

import extractTextFromFile from "../services/textExtractionService.js";
import deleteTemporaryFile from "../services/fileCleanupService.js";
import analyzeWithAI from "../services/aiService.js";
import buildAnalysisPrompt from "../prompts/analysisPrompt.js";
import buildEvaluationPrompt from "../prompts/evaluationPrompt.js";
import evaluateApplicationWithAI from "../services/evaluationService.js";

import {
  evaluationCriteria,
} from "../constants/evaluationCriteria.js";


const requiredFileFields = [
  "applicationForm",
];

const optionalFileFields = [
  "technicalSpec",
  "signatureDeclaration",
  "priceOffers",
];

const allFileFields = [
  ...requiredFileFields,
  ...optionalFileFields,
];

const requiredTemplateTypes = [
  "guide",
];

const documentLabels = {
  applicationForm: "Başvuru Formu",
  technicalSpec: "Teknik Şartname",
  signatureDeclaration: "Tatbiki İmza Beyanı",
  priceOffers: "Fiyat Teklifleri",
};

const templateLabels = {
  guide: "Başvuru Rehberi",
  technical_spec_template: "Teknik Şartname Şablonu",
  signature_declaration_template: "Tatbiki İmza Beyanı Şablonu",
};

const prepareEvaluationScores = (submittedScores) => {
  if (
    !submittedScores ||
    typeof submittedScores !== "object" ||
    Array.isArray(submittedScores)
  ) {
    throw new Error(
      "Değerlendirme puanları geçerli bir nesne olmalıdır."
    );
  }

  return evaluationCriteria.map((criterion) => {
    const rawScore = submittedScores[criterion.code];

    if (
      rawScore === "" ||
      rawScore === null ||
      rawScore === undefined
    ) {
      throw new Error(
        `${criterion.code} numaralı kriterin puanı girilmemiş.`
      );
    }

    const score = Number(rawScore);

    if (!Number.isFinite(score)) {
      throw new Error(
        `${criterion.code} numaralı kriterin puanı geçersiz.`
      );
    }

    if (score < 0 || score > criterion.maxScore) {
      throw new Error(
        `${criterion.code} numaralı kriterin puanı 0 ile ${criterion.maxScore} arasında olmalıdır.`
      );
    }

    return {
      code: criterion.code,
      categoryCode: criterion.categoryCode,
      category: criterion.category,
      question: criterion.question,
      score,
      maxScore: criterion.maxScore,
    };
  });
};

const analyzeApplication = async (req, res) => {
  const uploadedFiles = getAllUploadedFiles(req.files);

  try {
    // 1. Zorunlu başvuru belgesini kontrol et
    const missingFiles = requiredFileFields.filter(
      (field) => !req.files?.[field]?.[0]
    );

    if (missingFiles.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Analiz için gerekli belgeler eksik.",
        missingFiles: missingFiles.map(
          (field) => documentLabels[field]
        ),
      });
    }

    // 2. Kullanıcının girdiği değerlendirme puanlarını JSON olarak al
    let parsedEvaluationScores;

    try {
      parsedEvaluationScores = JSON.parse(
        req.body.evaluationScores || "{}"
      );
    } catch {
      return res.status(400).json({
        success: false,
        message:
          "Değerlendirme puanları geçerli JSON formatında değil.",
      });
    }

    // 3. Puanları doğrula ve kriter bilgileriyle birleştir
    let preparedEvaluationScores;

    try {
      preparedEvaluationScores = prepareEvaluationScores(
        parsedEvaluationScores
      );
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }

    const totalEvaluationScore =
      preparedEvaluationScores.reduce(
        (total, criterion) => total + criterion.score,
        0
      );

    const totalMaximumScore =
      preparedEvaluationScores.reduce(
        (total, criterion) => total + criterion.maxScore,
        0
      );

    // 4. Kullanılacak referans doküman türlerini belirle
    const templateTypes = ["guide"];

    if (req.files?.technicalSpec?.[0]) {
      templateTypes.push("technical_spec_template");
    }

    if (req.files?.signatureDeclaration?.[0]) {
      templateTypes.push(
        "signature_declaration_template"
      );
    }

    // 5. Aktif rehber ve şablonları getir
    const activeTemplates = await Template.find({
      isActive: true,
      extractionStatus: "ready",
      type: {
        $in: templateTypes,
      },
    }).select(
      "name type originalFileName extractedText"
    );

    // 6. Gerekli referans dokümanlarını kontrol et
    const missingTemplateTypes = templateTypes.filter(
      (type) =>
        !activeTemplates.some(
          (template) => template.type === type
        )
    );

    if (missingTemplateTypes.length > 0) {
      return res.status(400).json({
        success: false,
        message:
          "Analiz için gerekli aktif rehber veya şablonlar eksik.",
        missingTemplates: missingTemplateTypes.map(
          (type) => templateLabels[type] || type
        ),
      });
    }

    // 7. Yüklenen belgelerden metin çıkar
    const applicationTexts = {};

    for (const field of allFileFields) {
      const file = req.files?.[field]?.[0];

      if (!file) continue;

      applicationTexts[field] =
        await extractTextFromFile(file);
    }

    // 8. Dokümanları prompt için düzenle
    const referenceDocuments =
      formatReferenceDocuments(activeTemplates);

    const applicationDocuments =
      formatApplicationDocuments(applicationTexts);

    const uploadedDocumentStatus = allFileFields
      .map((field) => {
        const uploaded = req.files?.[field]?.[0];

        return `${uploaded ? "✓" : "✗"} ${documentLabels[field]
          }`;
      })
      .join("\n");

    // 9. Genel analiz promptunu oluştur ve çalıştır
    const analysisPrompt = buildAnalysisPrompt({
      referenceDocuments,
      applicationDocuments,
      uploadedDocumentStatus,
    });

    console.log({
      analysisPromptLength: analysisPrompt.length,
      analysisPromptCharsKB: (
        analysisPrompt.length / 1024
      ).toFixed(1),
      totalEvaluationScore,
      totalMaximumScore,
    });

    const analysisResult =
      await analyzeWithAI(analysisPrompt);

    // 10. Nihai değerlendirme gerekçe promptunu oluştur
    const evaluationPrompt = buildEvaluationPrompt({
      referenceDocuments,
      applicationDocuments,
      analysisResult,
      uploadedDocumentStatus,
      evaluationScores: preparedEvaluationScores,
      totalEvaluationScore,
      totalMaximumScore,
    });

    // 11. AI'dan yalnızca gerekçeleri al
    const evaluationResult =
      await evaluateApplicationWithAI(
        evaluationPrompt,
        preparedEvaluationScores
      );
    return res.status(200).json({
      success: true,
      message:
        "Başvuru analizi ve nihai değerlendirme gerekçeleri başarıyla oluşturuldu.",
      result: {
        ...analysisResult,
        finalEvaluation: evaluationResult,
      },
    });
  } catch (error) {
    console.error(
      "Analyze application error:",
      error
    );

    const statusCode = error.statusCode || 500;

    return res.status(statusCode).json({
      success: false,
      message:
        error.message ||
        "Başvuru analizi sırasında sunucu hatası oluştu.",
    });
  } finally {
    await Promise.all(
      uploadedFiles.map((file) =>
        deleteTemporaryFile(file.path)
      )
    );
  }
};


const getAllUploadedFiles = (files = {}) => {
  return Object.values(files).flat();
};

const formatReferenceDocuments = (templates) => {
  return templates
    .map(
      (template, index) => `
REFERANS DOKÜMAN ${index + 1}

Doküman adı: ${template.name}
Doküman türü: ${templateLabels[template.type] || template.type}
Orijinal dosya adı: ${template.originalFileName}

İçerik:
${template.extractedText}
`
    )
    .join("\n\n");
};

const formatApplicationDocuments = (documents) => {
  return Object.entries(documents)
    .map(([field, text], index) => `
BAŞVURU BELGESİ ${index + 1}

Belge türü: ${documentLabels[field]}

İçerik:
${text}
`)
    .join("\n\n");
};

export { analyzeApplication };