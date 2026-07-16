import { GoogleGenAI } from "@google/genai";

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// tekrar çalışabilme kontrolü
const isRetryableGeminiError = (error) => {
  const status = error?.status;
  const message = error?.message || "";
  const causeCode = error?.cause?.code || "";
  const causeMessage = error?.cause?.message || "";

  return (
    status === 408 ||
    status === 429 ||
    status === 500 ||
    status === 502 ||
    status === 503 ||
    status === 504 ||
    causeCode === "UND_ERR_CONNECT_TIMEOUT" ||
    causeCode === "UND_ERR_HEADERS_TIMEOUT" ||
    causeCode === "UND_ERR_SOCKET" ||
    message.includes('"code":429') ||
    message.includes('"code":503') ||
    message.includes("high demand") ||
    message.includes("UNAVAILABLE") ||
    message.includes("fetch failed") ||
    causeMessage.includes("Connect Timeout") ||
    causeMessage.includes("Headers Timeout")
  );
};

const calculateRetryDelay = (attempt) => {
  const baseDelay = 3000;
  const exponentialDelay = baseDelay * 2 ** (attempt - 1);
  const jitter = Math.floor(Math.random() * 2000);

  return exponentialDelay + jitter;
};

const analyzeWithAI = async (prompt) => {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY .env dosyasında tanımlanmamış."
    );
  }

  const ai = new GoogleGenAI({
    apiKey,
  });

  const maxAttempts = 4;
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      console.log(
        `Gemini analiz isteği gönderiliyor. Deneme ${attempt}/${maxAttempts}`
      );

      const response = await ai.models.generateContent({
        model: process.env.GEMINI_MODEL,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const outputText = response.text;

      if (!outputText) {
        throw new Error(
          "Gemini tarafından analiz sonucu üretilemedi."
        );
      }

      try {
        return JSON.parse(outputText);
      } catch {
        console.error("Gemini ham cevabı:", outputText);

        throw new Error(
          "Gemini cevabı geçerli JSON formatında alınamadı."
        );
      }
    } catch (error) {
      lastError = error;

      console.error(`Gemini deneme ${attempt} başarısız:`, {
        status: error?.status,
        message: error?.message,
        cause: error?.cause?.message,
        code: error?.cause?.code,
      });

      const canRetry =
        isRetryableGeminiError(error) &&
        attempt < maxAttempts;

      if (!canRetry) {
        break;
      }

      const delayMs = calculateRetryDelay(attempt);

      console.log(
        `${Math.round(
          delayMs / 1000
        )} saniye sonra yeniden denenecek.`
      );

      await sleep(delayMs);
    }
  }

  if (isRetryableGeminiError(lastError)) {
    const serviceError = new Error(
      "Yapay zeka servisine şu anda bağlantı kurulamıyor. Lütfen birkaç dakika sonra tekrar deneyin."
    );

    serviceError.statusCode = 503;
    throw serviceError;
  }

  throw lastError;
};

export default analyzeWithAI;