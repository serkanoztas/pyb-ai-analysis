import fs from "fs";
import { PDFParse } from "pdf-parse";

const extractTextFromPdf = async (filePath) => {
  const fileBuffer = fs.readFileSync(filePath);

  const parser = new PDFParse({
    data: fileBuffer,
  });

  try {
    const result = await parser.getText();

    const text = result?.text;

    if (typeof text !== "string") {
      throw new Error("PDF içeriğinden geçerli metin alınamadı.");
    }

    return text.trim();
  } finally {
    await parser.destroy();
  }
};

export default extractTextFromPdf;