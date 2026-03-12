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
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    generationConfig: { temperature: 0.7, maxOutputTokens: 1500 },
  });

  const prompt = {
    contents: [
      {
        role: "user",
        parts: [
          { text: SUMMARY_SYSTEM_PROMPT },
          {
            text: `Transform this document into an engaging, easy-to-read summary with contextually relevant emojis and proper markdown formatting.\n\n--- Document content ---\n\n${pdfText}`,
          },
        ],
      },
    ],
  };

  try {
    const result = await model.generateContent(prompt);
    const response = result.response;
    if (!response.text()) throw new Error("Empty response from Gemini API");
    return response.text();
  } catch (error: unknown) {
    const err = error as Error & { status?: number };
    const rawMessage = err?.message ?? String(error);
    console.error("[Gemini] API error:", rawMessage, err?.stack);

    const is429 =
      err?.status === 429 ||
      /429|Too Many Requests|quota exceeded|rate limit|limit: 0|resource exhausted/i.test(rawMessage);
    if (is429) {
      throw new Error(
        "Límite de cuota de Gemini. Revisa que tu API key sea de Google AI Studio y tenga cuota: https://aistudio.google.com/apikey"
      );
    }
    throw new Error(rawMessage);
  }
}
