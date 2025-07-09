import { GoogleGenerativeAI } from "@google/generative-ai";
import config from "../config/env.js";
///import { content } from "googleapis/build/src/apis/content/index.js";

const GEMINI_API_KEY = config.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error("❌ API Key no encontrada. Verifica el archivo .env");
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

const geminiAiService = async (prompt) => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const chat = model.startChat();
    const result = await chat.sendMessage(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error("❌ Error al obtener respuesta de Gemini.", error);
    throw error;
  }
};

export default geminiAiService;