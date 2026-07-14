import fs from "fs/promises";

const deleteTemporaryFile = async (filePath) => {
  if (!filePath) return;

  try {
    await fs.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error("Geçici dosya silinemedi:", error.message);
    }
  }
};

export default deleteTemporaryFile;