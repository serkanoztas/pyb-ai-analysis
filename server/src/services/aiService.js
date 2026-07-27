import { GoogleGenAI } from "@google/genai";

const sleep = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const extractBalancedJsonObject = (text) => {
  const startIndex = text.indexOf("{");

  if (startIndex === -1) {
    return null;
  }

  let depth = 0;
  let inString = false;
  let isEscaped = false;

  for (let index = startIndex; index < text.length; index += 1) {
    const character = text[index];

    if (isEscaped) {
      isEscaped = false;
      continue;
    }

    if (character === "\\" && inString) {
      isEscaped = true;
      continue;
    }

    if (character === '"') {
      inString = !inString;
      continue;
    }

    if (inString) {
      continue;
    }

    if (character === "{") {
      depth += 1;
    }

    if (character === "}") {
      depth -= 1;

      if (depth === 0) {
        return text.slice(startIndex, index + 1);
      }
    }
  }

  return null;
};

const parseGeminiJson = (outputText) => {
  const cleanedText = outputText
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/i, "")
    .replace(/^\uFEFF/, "")
    .trim();

  try {
    return JSON.parse(cleanedText);
  } catch (firstParseError) {
    const balancedJson =
      extractBalancedJsonObject(cleanedText);

    if (!balancedJson) {
      const error = new Error(
        "Gemini cevabında tamamlanmış bir JSON nesnesi bulunamadı."
      );

      error.code = "INVALID_JSON_RESPONSE";
      error.cause = firstParseError;
      throw error;
    }

    try {
      return JSON.parse(balancedJson);
    } catch (secondParseError) {
      const error = new Error(
        "Gemini cevabı geçerli JSON formatında alınamadı."
      );

      error.code = "INVALID_JSON_RESPONSE";
      error.cause = secondParseError;
      throw error;
    }
  }
};

const isRetryableGeminiError = (error) => {
  const status = error?.status;
  const message = error?.message || "";
  const causeCode = error?.cause?.code || "";
  const causeMessage = error?.cause?.message || "";

  return (
    error?.code === "INVALID_JSON_RESPONSE" ||
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
  const exponentialDelay =
    baseDelay * 2 ** (attempt - 1);
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

  const ai = new GoogleGenAI({ apiKey });

  const models = [
    process.env.GEMINI_MODEL ||
    "gemini-3.1-flash-lite",
    process.env.GEMINI_FALLBACK_MODEL ||
    "gemini-3.5-flash-lite",
  ];

  const maxAttemptsPerModel = 2;
  let lastError;

  console.log({
    promptLength: prompt.length,
    promptCharsKB: (prompt.length / 1024).toFixed(1),
  });

  for (const model of models) {
    for (
      let attempt = 1;
      attempt <= maxAttemptsPerModel;
      attempt += 1
    ) {
      try {
        console.log(
          `${model} analiz isteği gönderiliyor. Deneme ${attempt}/${maxAttemptsPerModel}`
        );

        const response =
          await ai.models.generateContent({
            model,
            contents: prompt,
            config: {
              responseMimeType: "application/json",
            },
          });

        const outputText = response.text;

        if (!outputText) {
          const error = new Error(
            "Gemini tarafından analiz sonucu üretilemedi."
          );

          error.code = "EMPTY_AI_RESPONSE";
          throw error;
        }

        try {
          return parseGeminiJson(outputText);
        } catch (parseError) {
          console.error("Gemini JSON parse hatası:", {
            message: parseError.message,
            outputLength: outputText.length,
            firstCharacters:
              outputText.slice(0, 300),
            lastCharacters:
              outputText.slice(-500),
          });

          throw parseError;
        }
      } catch (error) {
        lastError = error;

        console.error(
          `${model} deneme ${attempt} başarısız:`,
          {
            status: error?.status,
            message: error?.message,
            cause: error?.cause?.message,
            code:
              error?.code ||
              error?.cause?.code,
          }
        );

        const retryable =
          isRetryableGeminiError(error);

        if (!retryable) {
          throw error;
        }

        const hasAnotherAttempt =
          attempt < maxAttemptsPerModel;

        if (hasAnotherAttempt) {
          const delayMs =
            calculateRetryDelay(attempt);

          console.log(
            `${Math.round(
              delayMs / 1000
            )} saniye sonra aynı model yeniden denenecek.`
          );

          await sleep(delayMs);
        }
      }
    }

    console.warn(
      `${model} kullanılamadı. Sonraki modele geçiliyor.`
    );
  }

  const serviceError = new Error(
    "Yapay zeka servisi şu anda yoğun. Lütfen birkaç dakika sonra tekrar deneyin."
  );

  serviceError.statusCode = 503;
  serviceError.cause = lastError;

  throw serviceError;
};

export default analyzeWithAI;