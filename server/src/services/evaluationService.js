import analyzeWithAI from "./aiService.js";

import {
  evaluationCategories,
} from "../constants/evaluationCriteria.js";

const evaluateApplicationWithAI = async (
  prompt,
  preparedEvaluationScores
) => {
  const aiResult = await analyzeWithAI(prompt);

  if (!Array.isArray(aiResult?.criteria)) {
    throw new Error(
      "AI değerlendirme sonucu geçerli kriter listesi içermiyor."
    );
  }

  const aiCriteriaMap = new Map(
    aiResult.criteria.map((criterion) => [
      criterion.code,
      criterion,
    ])
  );

  const normalizedCriteria = preparedEvaluationScores.map(
    (definedCriterion) => {
      const aiCriterion = aiCriteriaMap.get(
        definedCriterion.code
      );

      if (!aiCriterion) {
        throw new Error(
          `${definedCriterion.code} değerlendirme kriteri AI cevabında bulunamadı.`
        );
      }

      return {
        code: definedCriterion.code,
        categoryCode: definedCriterion.categoryCode,
        category: definedCriterion.category,
        question: definedCriterion.question,

        score: definedCriterion.score,
        maxScore: definedCriterion.maxScore,

        reason:
          aiCriterion.reason ||
          "Puan gerekçesi oluşturulmadı.",

        evidence: Array.isArray(aiCriterion.evidence)
          ? aiCriterion.evidence.slice(0, 3)
          : [],

        improvement:
          aiCriterion.improvement ||
          "Ek bir geliştirme önerisi belirtilmedi.",

        reviewRequired:
          Boolean(aiCriterion.reviewRequired),
      };
    }
  );

  const categoryScores = evaluationCategories.map(
    (category) => {
      const categoryCriteria = normalizedCriteria.filter(
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
    }
  );

  const totalScore = normalizedCriteria.reduce(
    (total, criterion) =>
      total + criterion.score,
    0
  );
  const maxScore =
    normalizedCriteria.reduce(
      (total, item) => total + item.maxScore,
      0
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
      "Bu puanlama yapay zeka destekli bir ön değerlendirmedir ve uzman komisyon tarafından doğrulanmalıdır.",
  };
};

export default evaluateApplicationWithAI;