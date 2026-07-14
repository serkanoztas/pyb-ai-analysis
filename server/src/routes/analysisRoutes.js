import express from "express";

import {
  analyzeApplication,
} from "../controllers/analysisController.js";

import {
  protect,
} from "../middlewares/authMiddleware.js";

import {
  uploadAnalysis,
} from "../middlewares/uploadMiddleware.js";

const router = express.Router();

router.post(
  "/",
  protect,
  uploadAnalysis.fields([
    {
      name: "applicationForm",
      maxCount: 1,
    },
    {
      name: "technicalSpec",
      maxCount: 1,
    },
    {
      name: "signatureDeclaration",
      maxCount: 1,
    },
    {
      name: "priceOffers",
      maxCount: 1,
    },
  ]),
  analyzeApplication
);

export default router;