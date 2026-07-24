import analyzeWithAI from "./aiService.js";

import {
    evaluationCategories,
} from "../constants/evaluationCriteria.js";

const generateCommitteeReportWithAI = async (
    prompt,
    preparedEvaluationScores
) => {
    const aiResult = await analyzeWithAI(prompt);

    if (!Array.isArray(aiResult?.categories)) {
        throw new Error(
            "AI komite raporu geçerli kategori listesi içermiyor."
        );
    }

    const aiCategoriesMap = new Map(
        aiResult.categories.map((category) => [
            String(category.code),
            category,
        ])
    );

    const categories = evaluationCategories.map((category) => {
        const aiCategory = aiCategoriesMap.get(
            String(category.code)
        );

        if (!aiCategory) {
            throw new Error(
                `${category.code} numaralı kategori AI cevabında bulunamadı.`
            );
        }

        const categoryCriteria =
            preparedEvaluationScores.filter(
                (criterion) =>
                    String(criterion.categoryCode) ===
                    String(category.code)
            );

        const aiCriteriaMap = new Map(
            Array.isArray(aiCategory.criteria)
                ? aiCategory.criteria.map((criterion) => [
                    criterion.code,
                    criterion,
                ])
                : []
        );

        const criteria = categoryCriteria.map(
            (definedCriterion) => {
                const aiCriterion = aiCriteriaMap.get(
                    definedCriterion.code
                );

                if (!aiCriterion) {
                    throw new Error(
                        `${definedCriterion.code} kriteri komite raporu cevabında bulunamadı.`
                    );
                }

                return {
                    code: definedCriterion.code,
                    question: definedCriterion.question,
                    score: definedCriterion.score,
                    maxScore: definedCriterion.maxScore,
                    comment:
                        aiCriterion.comment ||
                        "Bu kriter için değerlendirme yorumu oluşturulamadı.",
                };
            }
        );

        const totalScore = criteria.reduce(
            (total, criterion) => total + criterion.score,
            0
        );

        const calculatedMaxScore = criteria.reduce(
            (total, criterion) =>
                total + criterion.maxScore,
            0
        );

        return {
            code: category.code,
            title: category.title,
            criteria,
            positiveComment:
                aiCategory.positiveComment ||
                "Olumlu başlık yorumu oluşturulamadı.",
            negativeComment:
                aiCategory.negativeComment ||
                "Olumsuz bir yorum bulunmamaktadır.",
            totalScore,
            maxScore: calculatedMaxScore,
        };
    });

    const totalScore = preparedEvaluationScores.reduce(
        (total, criterion) => total + criterion.score,
        0
    );

    const maximumScore = preparedEvaluationScores.reduce(
        (total, criterion) =>
            total + criterion.maxScore,
        0
    );

    return {
        categories,
        totalScore,
        maximumScore,
        overallPositive:
            aiResult.overallPositive ||
            "Genel olumlu açıklama oluşturulamadı.",
        overallNegative:
            aiResult.overallNegative ||
            "Olumsuz bir açıklama bulunmamaktadır.",
    };
};

export default generateCommitteeReportWithAI;