import analyzeWithAI from "./aiService.js";

import {
  evaluationCriteria,
  evaluationCategories,
} from "../constants/evaluationCriteria.js";

const evaluateApplicationWithAI = async (prompt) => {
  const aiResult = await analyzeWithAI(prompt);

  if (!Array.isArray(aiResult?.criteria)) {
    throw new Error(
      "AI değerlendirme sonucu geçerli kriter listesi içermiyor."
    );
  }

  const normalizedCriteria = evaluationCriteria.map(
    (definedCriterion) => {
      const aiCriterion = aiResult.criteria.find(
        (item) => item.code === definedCriterion.code
      );

      if (!aiCriterion) {
        throw new Error(
          `${definedCriterion.code} değerlendirme kriteri AI cevabında bulunamadı.`
        );
      }

      const numericScore = Number(aiCriterion.score);

      if (!Number.isFinite(numericScore)) {
        throw new Error(
          `${definedCriterion.code} kriterinin puanı geçerli değil.`
        );
      }

      const safeScore = Math.min(
        definedCriterion.maxScore,
        Math.max(0, Math.round(numericScore))
      );

      return {
        code: definedCriterion.code,
        categoryCode: definedCriterion.categoryCode,
        category: definedCriterion.category,
        question: definedCriterion.question,
        maxScore: definedCriterion.maxScore,
        score: safeScore,
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

  return {
    criteria: normalizedCriteria,
    categoryScores,
    totalScore,
    maxScore: 100,
    overallComment:
      aiResult.overallComment ||
      "Genel değerlendirme oluşturulmadı.",
    expertNote:
      aiResult.expertNote ||
      "Bu puanlama yapay zeka destekli bir ön değerlendirmedir ve uzman komisyon tarafından doğrulanmalıdır.",
  };
};

export default evaluateApplicationWithAI;