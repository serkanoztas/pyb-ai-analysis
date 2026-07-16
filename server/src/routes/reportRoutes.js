import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { generatePreliminaryReport } from "../controllers/reportController.js";

const router = express.Router();

router.post("/pdf", protect, generatePreliminaryReport);

export default router;