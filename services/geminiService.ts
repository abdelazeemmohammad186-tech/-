import { GoogleGenAI, Type, Modality } from "@google/genai";
import { WordExample } from '../types';

// Strict adherence to using process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' for Gemini API
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || 'FAKE_API_KEY_FOR_DEVELOPMENT' as string });

export const generateWordsForLetter = async (letter: string): Promise<WordExample[]> => {
  const model = "gemini-3-flash-preview";
  const prompt = `For the English letter "${letter}", generate an array of 5 simple English words suitable for a 5-year-old Arabic-speaking child. Ensure the words demonstrate the letter's position at the beginning, middle, and end. For each word, provide its Arabic translation. Return ONLY a valid JSON array of objects, where each object has "word" and "translation" keys.`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              word: {
                type: Type.STRING,
                description: "The English word.",
              },
              translation: {
                type: Type.STRING,
                description: "The Arabic translation of the word.",
              },
            },
            required: ["word", "translation"],
          },
        },
      },
    });

    const jsonString = response.text || "[]";
    const words: WordExample[] = JSON.parse(jsonString);
    return words;
  } catch (error) {
    console.error("Error generating words:", error);
    throw new Error("Failed to fetch words from Gemini API.");
  }
};


export const generateSpeech = async (text: string): Promise<string> => {
    const model = "gemini-2.5-flash-preview-tts";
    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: [{ parts: [{ text: `Say: ${text}` }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });

        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (!base64Audio) {
            throw new Error("No audio data received from API.");
        }
        return base64Audio;
    } catch (error) {
        console.error("Error generating speech:", error);
        throw new Error("Failed to generate speech.");
    }
};

export const generateImageForWord = async (word: string): Promise<string> => {
    const model = 'gemini-2.5-flash-image';
    const prompt = `A simple, cute, child-friendly cartoon illustration of a "${word}", with a plain white background. No text.`;

    try {
        const response = await ai.models.generateContent({
            model: model,
            contents: {
                parts: [{ text: prompt }],
            },
            config: {
                imageConfig: {
                    aspectRatio: "1:1"
                }
            }
        });

        for (const part of response.candidates?.[0]?.content?.parts || []) {
            if (part.inlineData) {
                const base64ImageBytes: string = part.inlineData.data;
                const imageUrl = `data:${part.inlineData.mimeType};base64,${base64ImageBytes}`;
                return imageUrl;
            }
        }
        throw new Error("No image data received from API.");
    } catch (error) {
        console.error(`Error generating image for "${word}":`, error);
        throw new Error(`Failed to generate image for ${word}.`);
    }
};