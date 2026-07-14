import express from "express";

import {
    createTemplate,
    getActiveTemplates,
    getTemplateById,
    deleteTemplate,
} from "../controllers/templateController.js";

import {
    protect,
    authorizeRoles,
} from "../middlewares/authMiddleware.js";

import {
    uploadTemplate,
} from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", getActiveTemplates);
router.get("/:id", getTemplateById);
router.post("/", authorizeRoles("admin"), uploadTemplate.single("file"), createTemplate);
router.delete("/:id", authorizeRoles("admin"), deleteTemplate);

export default router;