import Template from "../models/Template.js";

import extractTextFromFile from "../services/textExtractionService.js";
import deleteTemporaryFile from "../services/fileCleanupService.js";
import analyzeWithAI from "../services/aiService.js";
import buildAnalysisPrompt from "../prompts/analysisPrompt.js";

const requiredFileFields = [
  "applicationForm",
  "technicalSpec",
  "signatureDeclaration",
  "priceOffers",
];

const requiredTemplateTypes = [
  "guide",
  "technical_spec_template",
  "signature_declaration_template",
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

const analyzeApplication = async (req, res) => {
  const uploadedFiles = getAllUploadedFiles(req.files);

  try {
    // 1. Yüklenmesi gereken başvuru belgelerini kontrol et
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

    // 2. MongoDB'deki aktif rehber ve şablonları getir
    const activeTemplates = await Template.find({
      isActive: true,
      extractionStatus: "ready",
      type: {
        $in: requiredTemplateTypes,
      },
    }).select(
      "name type originalFileName extractedText"
    );

    // 3. Dört zorunlu referans dokümanın da mevcut olduğunu kontrol et
    const missingTemplateTypes = requiredTemplateTypes.filter(
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

    // 4. Başvuru belgelerinden metin çıkar
    const applicationTexts = {};

    for (const field of requiredFileFields) {
      const file = req.files[field][0];

      applicationTexts[field] =
        await extractTextFromFile(file);
    }

    // 5. Referans ve başvuru dokümanlarını prompt için düzenle
    const referenceDocuments =
      formatReferenceDocuments(activeTemplates);

    const applicationDocuments =
      formatApplicationDocuments(applicationTexts);

    // 6. Prompt oluştur
    const prompt = buildAnalysisPrompt({
      referenceDocuments,
      applicationDocuments,
    });

    // 7. AI analizini çalıştır
    const analysisResult = await analyzeWithAI(prompt);

    return res.status(200).json({
      success: true,
      message:
        "Başvuru analizi başarıyla tamamlandı.",
      result: analysisResult,
    });
  } catch (error) {
    console.error(
      "Analyze application error:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Başvuru analizi sırasında sunucu hatası oluştu.",
    });
  } finally {
    // Başarılı veya hatalı olsa da geçici dosyaları sil
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
  return requiredFileFields
    .map(
      (field, index) => `
BAŞVURU BELGESİ ${index + 1}

Belge türü: ${documentLabels[field]}

İçerik:
${documents[field]}
`
    )
    .join("\n\n");
};

export { analyzeApplication };