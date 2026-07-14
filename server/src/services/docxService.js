import mammoth from "mammoth";

const extractTextFromDocx = async (filePath) => {
  const result = await mammoth.extractRawText({
    path: filePath,
  });

  const text = result?.value;

  if (typeof text !== "string") {
    throw new Error("DOCX içeriğinden geçerli metin alınamadı.");
  }

  return text.trim();
};

export default extractTextFromDocx;