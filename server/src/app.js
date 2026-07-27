import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import templateRoutes from "./routes/templateRoutes.js";
import analysisRoutes from "./routes/analysisRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import committeeReportRoutes from "./routes/committeeReportRoutes.js";

const app = express();

const allowedOrigins = [
    "http://localhost:5173",
    process.env.CLIENT_URL,
].filter(Boolean);

app.use(
    cors({
        origin(origin, callback) {
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
                return;
            }

            callback(new Error("Bu origin için CORS izni bulunmuyor."));
        },
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

//health
app.get("/api/health", (req, res) => {
    res.status(200).json({
        success: true,
        message: "PYB AI API çalışıyor",
    });
});

// ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/users", userRoutes);
app.use("/api/committee-report", committeeReportRoutes);

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