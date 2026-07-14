import multer from "multer";
import path from "path";
import fs from "fs";

/*
Frontend dosyayı FormData ile gönderir
↓
Multer isteği yakalar
↓
Dosya türünü kontrol eder
↓
Boyutunu kontrol eder
↓
Dosyayı uploads/temp içine kaydeder
↓
Bilgileri req.file içine koyar
↓
Controller metni çıkarır
↓
MongoDB’ye kaydeder
↓
Geçici dosya silinir
*/

const uploadDirectory = path.join(process.cwd(), "uploads", "temp");

if (!fs.existsSync(uploadDirectory)) {
    fs.mkdirSync(uploadDirectory, {
        recursive: true,
    });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDirectory);
    },

    //dosya isim düzenleme
    filename: (req, file, cb) => {
        const safeFileName = file.originalname
            .replace(/\s+/g, "-")
            .replace(/[^a-zA-Z0-9ğüşöçıİĞÜŞÖÇ._-]/g, "");

        cb(null, `${Date.now()}-${safeFileName}`);
    },
});

const allowedMimeTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
    "text/plain",
];

const fileFilter = (req, file, cb) => {
    if (!allowedMimeTypes.includes(file.mimetype)) {
        return cb(
            new Error("Yalnızca PDF, DOC, DOCX ve TXT dosyaları yüklenebilir."),
            false
        );
    }

    cb(null, true);
};

// 15mb kısıtlaması ve tek dosya yükleme limiti
const uploadTemplate = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024,
        files: 1,
    },
});

const uploadAnalysis = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 15 * 1024 * 1024,
        files: 4,
    },
});

export { uploadTemplate, uploadAnalysis };