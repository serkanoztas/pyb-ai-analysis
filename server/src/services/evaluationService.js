import analyzeWithAI from "./aiService.js";

import {
  evaluationCategories,
} from "../constants/evaluationCriteria.js";

const isEmptyValue = (value) =>
  value === "" ||
  value === null ||
  value === undefined;

const createCriteriaMap = (criteria) =>
  new Map(
    criteria.map((criterion) => [
      String(criterion.code),
      criterion,
    ])
  );

const validateAIScore = (
  aiCriterion,
  definedCriterion
) => {
  if (isEmptyValue(aiCriterion.score)) {
    throw new Error(
      `${definedCriterion.code} kriteri için AI tarafından puan üretilmedi.`
    );
  }

  const score = Number(aiCriterion.score);

  if (!Number.isInteger(score)) {
    throw new Error(
      `${definedCriterion.code} kriteri için oluşturulan puan tam sayı değil.`
    );
  }

  if (
    score < 0 ||
    score > definedCriterion.maxScore
  ) {
    throw new Error(
      `${definedCriterion.code} kriteri için oluşturulan puan 0 ile ${definedCriterion.maxScore} arasında olmalıdır.`
    );
  }

  return score;
};

const normalizeCriteriaModeResult = ({
  aiCriteriaMap,
  preparedEvaluationScores,
}) =>
  preparedEvaluationScores.map(
    (definedCriterion) => {
      const aiCriterion = aiCriteriaMap.get(
        String(definedCriterion.code)
      );

      if (!aiCriterion) {
        throw new Error(
          `${definedCriterion.code} değerlendirme kriteri AI cevabında bulunamadı.`
        );
      }

      return {
        code: definedCriterion.code,
        categoryCode:
          definedCriterion.categoryCode,
        category: definedCriterion.category,
        question: definedCriterion.question,

        // Kullanıcının verdiği puan korunur.
        score: definedCriterion.score,
        maxScore: definedCriterion.maxScore,

        reason:
          aiCriterion.reason ||
          "Puan gerekçesi oluşturulmadı.",

        evidence: Array.isArray(
          aiCriterion.evidence
        )
          ? aiCriterion.evidence.slice(0, 3)
          : [],

        improvement:
          aiCriterion.improvement ||
          "Ek bir geliştirme önerisi belirtilmedi.",

        reviewRequired: Boolean(
          aiCriterion.reviewRequired
        ),
      };
    }
  );

const normalizeTotalModeResult = ({
  aiCriteriaMap,
  evaluationCriteria,
}) =>
  evaluationCriteria.map(
    (definedCriterion) => {
      const aiCriterion = aiCriteriaMap.get(
        String(definedCriterion.code)
      );

      if (!aiCriterion) {
        throw new Error(
          `${definedCriterion.code} değerlendirme kriteri AI cevabında bulunamadı.`
        );
      }

      const score = validateAIScore(
        aiCriterion,
        definedCriterion
      );

      return {
        code: definedCriterion.code,
        categoryCode:
          definedCriterion.categoryCode,
        category: definedCriterion.category,
        question: definedCriterion.question,

        // Toplam puan modunda puan AI tarafından üretilir.
        score,
        maxScore: definedCriterion.maxScore,

        reason:
          aiCriterion.reason ||
          "Puan gerekçesi oluşturulmadı.",

        evidence: Array.isArray(
          aiCriterion.evidence
        )
          ? aiCriterion.evidence.slice(0, 3)
          : [],

        improvement:
          aiCriterion.improvement ||
          "Ek bir geliştirme önerisi belirtilmedi.",

        reviewRequired: Boolean(
          aiCriterion.reviewRequired
        ),
      };
    }
  );

const createCategoryScores = (
  normalizedCriteria
) =>
  evaluationCategories.map((category) => {
    const categoryCriteria =
      normalizedCriteria.filter(
        (criterion) =>
          criterion.categoryCode === category.code
      );

    const score = categoryCriteria.reduce(
      (total, criterion) =>
        total + criterion.score,
      0
    );

    return {
      code: category.code,
      title: category.title,
      score,
      maxScore: category.maxScore,
    };
  });

const evaluateApplicationWithAI = async (
  prompt,
  {
    scoringMode,
    evaluationScores,
    requestedTotalScore,
    evaluationCriteria,
  }
) => {
  if (
    !["criteria", "total"].includes(
      scoringMode
    )
  ) {
    throw new Error(
      "Geçersiz değerlendirme yöntemi."
    );
  }

  const aiResult = await analyzeWithAI(prompt);

  if (!Array.isArray(aiResult?.criteria)) {
    throw new Error(
      "AI değerlendirme sonucu geçerli kriter listesi içermiyor."
    );
  }

  const aiCriteriaMap = createCriteriaMap(
    aiResult.criteria
  );

  let normalizedCriteria;

  if (scoringMode === "criteria") {
    if (!Array.isArray(evaluationScores)) {
      throw new Error(
        "Kullanıcı değerlendirme puanları bulunamadı."
      );
    }

    normalizedCriteria =
      normalizeCriteriaModeResult({
        aiCriteriaMap,
        preparedEvaluationScores:
          evaluationScores,
      });
  } else {
    if (!Array.isArray(evaluationCriteria)) {
      throw new Error(
        "Değerlendirme kriterleri bulunamadı."
      );
    }

    normalizedCriteria =
      normalizeTotalModeResult({
        aiCriteriaMap,
        evaluationCriteria,
      });
  }

  const totalScore = normalizedCriteria.reduce(
    (total, criterion) =>
      total + criterion.score,
    0
  );

  const maxScore = normalizedCriteria.reduce(
    (total, criterion) =>
      total + criterion.maxScore,
    0
  );

  if (
    scoringMode === "total" &&
    totalScore !== Number(requestedTotalScore)
  ) {
    throw new Error(
      `AI tarafından dağıtılan kriter puanlarının toplamı hatalı. Beklenen toplam: ${requestedTotalScore}, oluşturulan toplam: ${totalScore}.`
    );
  }

  const categoryScores =
    createCategoryScores(
      normalizedCriteria
    );

  return {
    criteria: normalizedCriteria,
    categoryScores,
    totalScore,
    maxScore,

    overallComment:
      aiResult.overallComment ||
      "Genel değerlendirme oluşturulmadı.",

    expertNote:
      aiResult.expertNote ||
      "Bu puanlama yapay zekâ destekli bir ön değerlendirmedir ve uzman komisyon tarafından doğrulanmalıdır.",
  };
};

export default evaluateApplicationWithAI;