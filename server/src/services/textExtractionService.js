import fs from "fs/promises";

import extractTextFromPdf from "./pdfService.js";
import extractTextFromDocx from "./docxService.js";

const extractTextFromFile = async (file) => {
  if (!file) {
    throw new Error("Metni çıkarılacak dosya bulunamadı.");
  }

  let extractedText;

  switch (file.mimetype) {
    case "application/pdf":
      extractedText = await extractTextFromPdf(file.path);
      break;

    case "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
      extractedText = await extractTextFromDocx(file.path);
      break;

    case "text/plain":
      extractedText = await fs.readFile(file.path, "utf-8");
      break;

    default:
      throw new Error("Desteklenmeyen dosya türü.");
  }

  if (typeof extractedText !== "string") {
    console.log("Metin çıkarma sonucu:", extractedText);

    throw new Error(
      "Metin çıkarma servisi geçerli bir metin döndürmedi."
    );
  }

  const normalizedText = extractedText
    .replace(/--\s*\d+\s+of\s+\d+\s*--/gi, "")
    .replace(/\u0000/g, "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

  if (!normalizedText) {
    throw new Error(
      "Dosyadan metin çıkarılamadı. Belge taranmış veya metin içermiyor olabilir."
    );
  }

  return normalizedText;
};

export default extractTextFromFile;