
import { GoogleGenAI, Modality } from "@google/genai";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });
const model = ai.models;

const fileToGenerativePart = (dataUrl: string) => {
  const [header, base64Data] = dataUrl.split(',');
  const mimeType = header.match(/:(.*?);/)?.[1] ?? 'image/jpeg';
  return {
    inlineData: {
      data: base64Data,
      mimeType
    },
  };
};

const extractImageFromResult = (result: any) => {
    for (const part of result.candidates[0].content.parts) {
        if (part.inlineData) {
            return {
                base64Data: part.inlineData.data,
                mimeType: part.inlineData.mimeType,
            };
        }
    }
    throw new Error("No image part found in the API response.");
};

export const convertToCartoon = async (dataUrl: string) => {
  const imagePart = fileToGenerativePart(dataUrl);
  const prompt = "Convert this photo into a vibrant, high-quality cartoon style. Use bold outlines, saturated colors, and simplify the details while preserving the person's key features and likeness. The final result should be a fun and artistic cartoon portrait.";

  const result = await model.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [imagePart, { text: prompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  return extractImageFromResult(result);
};

export const editImage = async (dataUrl: string, prompt: string) => {
  const imagePart = fileToGenerativePart(dataUrl);
  const fullPrompt = `Based on this cartoon image, apply the following edit: "${prompt}". IMPORTANT: Only modify what is requested and maintain the existing cartoon style, character, and composition for all other elements.`;

  const result = await model.generateContent({
    model: 'gemini-2.5-flash-image-preview',
    contents: {
      parts: [imagePart, { text: fullPrompt }],
    },
    config: {
      responseModalities: [Modality.IMAGE, Modality.TEXT],
    },
  });

  return extractImageFromResult(result);
};
