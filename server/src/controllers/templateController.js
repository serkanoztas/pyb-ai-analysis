import Template from "../models/Template.js";

import extractTextFromFile from "../services/textExtractionService.js";
import deleteTemporaryFile from "../services/fileCleanupService.js";

const allowedTemplateTypes = [
    "guide",
    "technical_spec_template",
    "signature_declaration_template",
    "committee_example",
];

const createTemplate = async (req, res) => {
    try {
        const { name, type } = req.body;


        if (!name?.trim()) {
            return res.status(400).json({ success: false, message: "Döküman adı zorunludur." });
        }
        if (!type) {
            return res.status(400).json({ success: false, message: "Doküman türü zorunludur." });
        }
        if (!allowedTemplateTypes.includes(type)) {
            return res.status(400).json({ success: false, message: "Geçersiz doküman türü." });
        }
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Yüklenecek dosya bulunamadı." });
        }

        const extractedText = await extractTextFromFile(req.file);

        if (type !== "committee_example") {
            await Template.updateMany(
                {
                    type,
                    isActive: true,
                },
                {
                    isActive: false,
                }
            );
        }

        const template = await Template.create({
            name: name.trim(),
            type,
            originalFileName: req.file.originalname,
            mimeType: req.file.mimetype,
            fileSize: req.file.size,
            extractedText,
            extractionStatus: "ready",
            extractionError: null,
            isActive: true,
            uploadedBy: req.user?._id || null,
        });

        return res.status(201).json({ success: true, message: "Döküman başarıyla yüklendi.", template: formatTemplateResponse(template) })

    }
    catch (error) {
        console.error("Create template error:", error);

        return res.status(500).json({
            success: false,
            message:
                error.message ||
                "Doküman yüklenirken sunucu hatası oluştu.",
        });
    }
    finally {
        await deleteTemporaryFile(req.file?.path);
    }
}

const getActiveTemplates = async (req, res) => {
    try {
        const templates = await Template.find({
            isActive: true,
        })
            .sort({
                type: 1,
                createdAt: -1,
            })
            .select("-extractedText");

        return res.status(200).json({
            success: true,
            count: templates.length,
            templates: templates.map(formatTemplateResponse),
        });
    } catch (error) {
        console.error("Get active templates error:", error);

        return res.status(500).json({
            success: false,
            message:
                "Aktif dokümanlar alınırken sunucu hatası oluştu.",
        });
    }
};

const getTemplateById = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Doküman bulunamadı.",
            });
        }

        return res.status(200).json({
            success: true,
            template: formatTemplateResponse(template, true),
        });
    } catch (error) {
        console.error("Get template by id error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Geçersiz doküman ID değeri.",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Doküman alınırken sunucu hatası oluştu.",
        });
    }
};

const deleteTemplate = async (req, res) => {
    try {
        const template = await Template.findById(req.params.id);

        if (!template) {
            return res.status(404).json({
                success: false,
                message: "Doküman bulunamadı.",
            });
        }

        await template.deleteOne();

        return res.status(200).json({
            success: true,
            message: "Doküman başarıyla silindi.",
        });
    } catch (error) {
        console.error("Delete template error:", error);

        if (error.name === "CastError") {
            return res.status(400).json({
                success: false,
                message: "Geçersiz doküman ID değeri.",
            });
        }

        return res.status(500).json({
            success: false,
            message:
                "Doküman silinirken sunucu hatası oluştu.",
        });
    }
};

const formatTemplateResponse = (
    template,
    includeExtractedText = false
) => {
    const response = {
        id: template._id,
        name: template.name,
        type: template.type,
        originalFileName: template.originalFileName,
        mimeType: template.mimeType,
        fileSize: template.fileSize,
        extractionStatus: template.extractionStatus,
        extractionError: template.extractionError,
        isActive: template.isActive,
        uploadedBy: template.uploadedBy,
        createdAt: template.createdAt,
        updatedAt: template.updatedAt,
    };

    if (includeExtractedText) {
        response.extractedText = template.extractedText;
    }

    return response;
};

export {
    createTemplate,
    getActiveTemplates,
    getTemplateById,
    deleteTemplate,
};