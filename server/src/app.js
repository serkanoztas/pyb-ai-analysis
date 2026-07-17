import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(
    cors({
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    })
);

app.use(express.json({ limit: "20mb" }));
app.use(express.urlencoded({ extended: true, limit: "20mb" }));

// Test route
app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "PYB AI Backend çalışıyor",
    });
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route bulunamadı",
    });
});

// Genel hata yakalama
app.use((err, req, res, next) => {
    console.error("Server hatası:", err);

    res.status(err.statusCode || 500).json({
        success: false,
        message: err.message || "Sunucu hatası",
    });
});

export default app;