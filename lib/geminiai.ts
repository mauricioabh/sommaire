import { GoogleGenerativeAI } from "@google/generative-ai";
import { SUMMARY_SYSTEM_PROMPT } from "@/utils/prompts";

export const generateSummaryFromGemini = async (pdfText: string) => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it in Vercel (Settings → Environment Variables) or in .env.local for local dev."
    );
  }
  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    // gemini-1.5-flash suele tener cuota gratuita; gemini-2.0-flash a veces sale "limit: 0" en free tier
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
    });

    const prompt = {
      contents: [
        {
          role: "user",
          parts: [
            {
              text: SUMMARY_SYSTEM_PROMPT,
            },
            {
              text: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting.\n\n--- Document content ---\n\n${pdfText}`,
            },
          ],
        },
      ],
    };

    const result = await model.generateContent(prompt);
    const response = await result.response;

    if (!response.text()) {
        throw new Error('Empty response from Gemini API')
    }

    return response.text();
  } catch (error: unknown) {
    const err = error as Error & { status?: number; statusText?: string; message?: string };
    const rawMessage = err?.message ?? String(error);
    const details = {
      message: rawMessage,
      name: err?.name,
      status: err?.status,
      statusText: err?.statusText,
      stack: err?.stack,
      cause: err?.cause,
    };
    console.error("[Gemini] API error (full):", JSON.stringify(details, null, 2));
    console.error("[Gemini] Raw error:", error);

    const is429 = err?.status === 429 || /429|Too Many Requests|quota exceeded|rate limit/i.test(rawMessage);
    if (is429) {
      const retryMatch = rawMessage.match(/retry in (\d+(?:\.\d+)?)\s*s/i);
      const seconds = retryMatch ? Math.ceil(Number(retryMatch[1])) : 60;
      throw new Error(
        `Límite de uso de Gemini alcanzado (plan gratuito). Intenta de nuevo en ~${seconds} segundos, o revisa tu cuota en https://ai.google.dev/gemini-api/docs/rate-limits`
      );
    }

    throw new Error(rawMessage);
  }
}
