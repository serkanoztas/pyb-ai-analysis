import mongoose from "mongoose";

const evaluationScoreSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
        },
        categoryCode: {
            type: String,
            required: true,
        },
        category: {
            type: String,
            required: true,
        },
        question: {
            type: String,
            required: true,
        },
        score: {
            type: Number,
            required: true,
        },
        maxScore: {
            type: Number,
            required: true,
        },
    },
    {
        _id: false,
    }
);

const analysisSchema = new mongoose.Schema(
    {
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: false,
        },

        applicationDocuments: {
            type: String,
            required: true,
        },

        referenceDocuments: {
            type: String,
            required: true,
        },

        uploadedDocumentStatus: {
            type: String,
            default: "",
        },

        evaluationScores: {
            type: [evaluationScoreSchema],
            required: true,
        },

        totalEvaluationScore: {
            type: Number,
            required: true,
        },

        totalMaximumScore: {
            type: Number,
            required: true,
        },

        analysisResult: {
            type: mongoose.Schema.Types.Mixed,
            required: true,
        },

        finalEvaluation: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        committeeReport: {
            type: mongoose.Schema.Types.Mixed,
            default: null,
        },

        committeeReportGeneratedAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

const Analysis = mongoose.model(
    "Analysis",
    analysisSchema
);

export default Analysis;