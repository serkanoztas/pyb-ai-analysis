import express from "express";

import {
    generateCommitteeReport,
    downloadCommitteeReport,
} from "../controllers/committeeReportController.js";

import {
    protect,
} from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post(
    "/:analysisId",
    protect,
    generateCommitteeReport
);

router.post(
    "/:analysisId/download",
    protect,
    downloadCommitteeReport
);

export default router;