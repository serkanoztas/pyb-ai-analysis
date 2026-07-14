import { GoogleGenAI } from "@google/genai";

const analyzeWithAI = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY .env dosyasında tanımlanmamış."
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
    httpOptions: {
      timeout: 10 * 60 * 1000,
    },
  });

  try {
    
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        maxOutputTokens: 12000,
      },
    });

    // const response = await ai.models.generateContent({
    //   model: process.env.GEMINI_MODEL || "gemini-3.5-flash",
    //   contents: "Sadece geçerli JSON döndür: {\"status\":\"ok\"}",
    //   config: {
    //     responseMimeType: "application/json",
    //   },
    // });

    const outputText = response.text;

    if (!outputText) {
      throw new Error("Gemini analiz sonucu üretmedi.");
    }

    return JSON.parse(outputText);
  } catch (error) {
    console.error("Gemini request error:", {
      message: error.message,
      cause: error.cause?.message,
      code: error.cause?.code,
    });

    if (error.cause?.code === "UND_ERR_HEADERS_TIMEOUT") {
      throw new Error(
        "AI isteği zaman aşımına uğradı. Gönderilen belgeler veya rehber içeriği çok uzun olabilir."
      );
    }

    throw error;
  }
};

export default analyzeWithAI;