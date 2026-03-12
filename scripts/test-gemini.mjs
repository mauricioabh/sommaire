/**
 * Prueba local de la API key de Gemini.
 * Carga .env.local y hace una llamada mínima a generateContent.
 *
 * Ejecutar desde la raíz del proyecto:
 *   node scripts/test-gemini.mjs
 */
import { readFileSync, existsSync } from "fs";
import { join } from "path";

const envPath = join(process.cwd(), ".env.local");
if (!existsSync(envPath)) {
  console.error("No se encontró .env.local en la raíz del proyecto.");
  process.exit(1);
}

const content = readFileSync(envPath, "utf8").replace(/\r\n/g, "\n");
for (const line of content.split("\n")) {
  const trimmed = line.trim();
  if (!trimmed || trimmed.startsWith("#")) continue;
  const eq = trimmed.indexOf("=");
  if (eq <= 0) continue;
  const key = trimmed.slice(0, eq).trim();
  let val = trimmed.slice(eq + 1).trim();
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1);
  }
  process.env[key] = val;
}

const apiKey = process.env.GEMINI_API_KEY?.trim();
if (!apiKey) {
  console.error("GEMINI_API_KEY no está definida en .env.local");
  process.exit(1);
}

const { GoogleGenerativeAI } = await import("@google/generative-ai");
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  generationConfig: { temperature: 0.3, maxOutputTokens: 100 },
});

console.log("Probando API key de Gemini (gemini-2.5-flash)...");
try {
  const result = await model.generateContent("Responde en una sola palabra: OK");
  const text = result.response.text()?.trim() || "";
  console.log("Respuesta:", text || "(vacía)");
  console.log("\n API key válida.");
} catch (err) {
  console.error("\nError:", err.message ?? err);
  process.exit(1);
}
