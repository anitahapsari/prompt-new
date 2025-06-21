
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { FormData, CharacterDetail } from '../types'; // Ensured relative path

const API_KEY = process.env.API_KEY;
const MODEL_NAME = 'gemini-2.5-flash-preview-04-17';

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
} else {
  console.warn(
    "API_KEY environment variable not set. Gemini API calls will likely fail. Ensure it is configured in your environment for the application to function correctly with the Gemini API."
  );
}

function constructInitialPrompt(data: FormData): string {
  let prompt = `${data.sceneTitle}. `;
  prompt += `${data.setting}. `;

  data.characters.forEach((char, index) => {
    if (char.description || char.voice || char.action || char.expression || char.dialogue) {
      prompt += `Karakter ${index + 1}: ${char.description || 'Tidak ada deskripsi'}. `;
      if (char.voice) prompt += `Suaranya ${char.voice}. `;
      if (char.action) prompt += `Dia sedang ${char.action}. `;
      if (char.expression) prompt += `Ekspresinya ${char.expression}. `;
      if (char.dialogue) prompt += `Dia berkata: "${char.dialogue}". `;
    }
  });

  if (data.cameraMovement) prompt += `Gerakan kamera: ${data.cameraMovement}. `;
  if (data.lighting) prompt += `Pencahayaan: ${data.lighting}. `;
  if (data.videoStyle) prompt += `Gaya video: ${data.videoStyle}. `;
  if (data.overallMood) prompt += `Suasana keseluruhan: ${data.overallMood}. `;
  if (data.ambientSound) prompt += `Suara lingkungan: ${data.ambientSound}. `;
  if (data.additionalDetails) prompt += `Detail tambahan: ${data.additionalDetails}.`;

  return prompt.trim();
}

export const enhancePromptIndonesian = async (data: FormData): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini AI client not initialized. This could be due to a missing or invalid API_KEY environment variable.");
  }
  
  const initialPrompt = constructInitialPrompt(data);

  const geminiPrompt = `Anda adalah asisten penulis skenario video AI yang sangat kreatif dan ahli dalam membuat prompt untuk model generasi video seperti Veo 3. Berdasarkan input berikut, buatlah sebuah prompt video dalam Bahasa Indonesia yang sangat detail, kaya, imajinatif, dan sinematik. Pastikan semua elemen yang diberikan terintegrasi secara alami dan logis. Jika ada detail karakter atau dialog yang kosong, abaikan karakter tersebut atau bagian dialog tersebut. Kembangkan deskripsi, aksi, dan suasana untuk menciptakan narasi visual yang kuat. Hasil akhir harus berupa satu paragraf narasi yang mengalir dan siap digunakan. Berikut adalah elemen-elemennya: ${initialPrompt}`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: geminiPrompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error enhancing Indonesian prompt with Gemini API:", error);
    throw new Error("Gagal mengembangkan prompt dalam Bahasa Indonesia. Periksa konsol untuk detail error API.");
  }
};

export const translatePromptEnglish = async (indonesianPrompt: string): Promise<string> => {
  if (!ai) {
    throw new Error("Gemini AI client not initialized. This could be due to a missing or invalid API_KEY environment variable.");
  }

  const geminiPrompt = `Translate the following Indonesian video prompt into English. This prompt is intended for a video generation model. It is CRITICAL that any spoken dialogue, which is usually enclosed in quotation marks (e.g., "Ini dialognya") or follows phrases like 'berkata:', 'mengatakan:', 'ucapnya:', etc., MUST remain in the original Indonesian language. Translate all other descriptive text, scene settings, character actions, camera directions, and narrative elements into fluent and natural English. Indonesian Prompt: ${indonesianPrompt}`;
  
  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: geminiPrompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error translating prompt to English with Gemini API:", error);
    throw new Error("Gagal menerjemahkan prompt ke Bahasa Inggris. Periksa konsol untuk detail error API.");
  }
};
