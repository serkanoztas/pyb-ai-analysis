import mongoose from "mongoose";

import Analysis from "../models/Analysis.js";
import buildCommitteeReportPrompt from "../prompts/committeeReportPrompt.js";
import generateCommitteeReportWithAI from "../services/committeeReportService.js";
import generateCommitteeReportWord from "../services/committeeReportWordService.js";
import Template from "../models/Template.js";

const generateCommitteeReport = async (
    req,
    res
) => {
    try {
        const { analysisId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(analysisId)) {
            return res.status(400).json({
                success: false,
                message: "Geçersiz analiz kimliği.",
            });
        }

        const analysis = await Analysis.findById(
            analysisId
        );

        const committeeExamples = await Template.find({
            type: "committee_example",
            isActive: true,
        })
            .select("name extractedText")
            .lean();

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: "Analiz kaydı bulunamadı.",
            });
        }

        // Kullanıcı kontrolü uygulanıyorsa aç
        if (
            analysis.createdBy &&
            req.user?._id &&
            analysis.createdBy.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Bu analiz için komite raporu oluşturma yetkiniz yok.",
            });
        }

        if (
            !Array.isArray(analysis.evaluationScores) ||
            analysis.evaluationScores.length !== 9
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "Analiz kaydında geçerli değerlendirme puanları bulunmuyor.",
            });
        }

        const committeeExamplesText = committeeExamples
            .map(
                (doc, index) => `
==================================================
GERÇEK KOMİTE RAPORU ${index + 1}
==================================================

Belge Adı:
${doc.name}

${doc.extractedText}
`
            )
            .join("\n");

        const prompt = buildCommitteeReportPrompt({
            referenceDocuments:
                analysis.referenceDocuments,
            applicationDocuments:
                analysis.applicationDocuments,
            analysisResult: analysis.analysisResult,
            evaluationScores:
                analysis.evaluationScores,
            totalScore:
                analysis.totalEvaluationScore,
            maximumScore:
                analysis.totalMaximumScore,
            committeeExamples: committeeExamplesText
        });

        if (analysis.committeeReport) {
            return res.status(200).json({
                success: true,
                message:
                    "Daha önce oluşturulan komite üyesi raporu getirildi.",
                analysisId: analysis._id,
                committeeReport:
                    analysis.committeeReport,
                cached: true,
            });
        }

        const committeeReport =
            await generateCommitteeReportWithAI(
                prompt,
                analysis.evaluationScores
            );

        analysis.committeeReport =
            committeeReport;

        analysis.committeeReportGeneratedAt =
            new Date();

        await analysis.save();

        return res.status(200).json({
            success: true,
            message:
                "Komite üyesi raporu başarıyla oluşturuldu.",
            analysisId: analysis._id,
            committeeReport,
        });
    } catch (error) {
        console.error(
            "Generate committee report error:",
            error
        );

        const statusCode =
            error.statusCode || 500;

        return res.status(statusCode).json({
            success: false,
            message:
                error.message ||
                "Komite üyesi raporu oluşturulurken sunucu hatası meydana geldi.",
        });
    }
};

const downloadCommitteeReport = async (req, res) => {
    try {
        const { analysisId } = req.params;
        const { regenerate = false } = req.body ?? {};

        if (!mongoose.Types.ObjectId.isValid(analysisId)) {
            return res.status(400).json({
                success: false,
                message: "Geçersiz analiz kimliği.",
            });
        }

        const analysis = await Analysis.findById(
            analysisId
        );

        const committeeExamples = await Template.find({
            type: "committee_example",
            isActive: true,
        })
            .select("name extractedText")
            .lean();

        if (!analysis) {
            return res.status(404).json({
                success: false,
                message: "Analiz kaydı bulunamadı.",
            });
        }

        if (
            analysis.createdBy &&
            req.user?._id &&
            analysis.createdBy.toString() !==
            req.user._id.toString()
        ) {
            return res.status(403).json({
                success: false,
                message:
                    "Bu analiz için rapor indirme yetkiniz bulunmuyor.",
            });
        }

        let committeeReport =
            analysis.committeeReport;

        if (!committeeReport || regenerate) {
            if (
                !Array.isArray(
                    analysis.evaluationScores
                ) ||
                analysis.evaluationScores.length !== 9
            ) {
                return res.status(400).json({
                    success: false,
                    message:
                        "Analiz kaydında geçerli değerlendirme puanları bulunmuyor.",
                });
            }

            const committeeExamplesText = committeeExamples
                .map(
                    (doc, index) => `
==================================================
GERÇEK KOMİTE RAPORU ${index + 1}
==================================================

Belge Adı:
${doc.name}

${doc.extractedText ?? ""}
`
                )
                .join("\n");

            const prompt = buildCommitteeReportPrompt({
                referenceDocuments: analysis.referenceDocuments,
                committeeExamples: committeeExamplesText,
                applicationDocuments: analysis.applicationDocuments,
                analysisResult: analysis.analysisResult,
                evaluationScores: analysis.evaluationScores,
                totalScore: analysis.totalEvaluationScore,
                maximumScore: analysis.totalMaximumScore,
            });

            committeeReport =
                await generateCommitteeReportWithAI(
                    prompt,
                    analysis.evaluationScores
                );

            analysis.committeeReport =
                committeeReport;

            analysis.committeeReportGeneratedAt =
                new Date();

            await analysis.save();
        }

        const wordBuffer =
            await generateCommitteeReportWord({
                committeeReport,
                analysisId: analysis._id.toString(),
            });

        const fileName =
            `komite-uyesi-raporu-${analysis._id}.docx`;

        res.setHeader(
            "Content-Type",
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        );

        res.setHeader(
            "Content-Disposition",
            `attachment; filename="${fileName}"`
        );

        res.setHeader(
            "Content-Length",
            wordBuffer.length
        );

        return res.status(200).send(wordBuffer);
    } catch (error) {
        console.error(
            "Download committee report error:",
            error
        );

        return res.status(
            error.statusCode || 500
        ).json({
            success: false,
            message:
                error.message ||
                "Komite raporu Word dosyası oluşturulurken hata meydana geldi.",
        });
    }
};

export { generateCommitteeReport, downloadCommitteeReport };