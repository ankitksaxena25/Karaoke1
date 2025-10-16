import { GoogleGenAI, Type } from "@google/genai";
import { KaraokeData } from '../types';

const MODEL_NAME = "gemini-2.5-flash";

export const generateKaraokeLyrics = async (
  lyricsText: string,
  duration: number,
  language: string
): Promise<KaraokeData> => {
    const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;
    if (!apiKey) {
        throw new Error("VITE_GOOGLE_API_KEY environment variable not set.");
    }
    const ai = new GoogleGenAI({apiKey});

  const prompt = `
    You are an AI system powering a karaoke app. Your task is to process the given lyrics and song duration to create perfectly timed karaoke-style lyric data.

    **Instructions:**
    1.  **Clean and Split:** Take the input lyrics and split them into short, singable lines. Each line should ideally be a natural phrase and not exceed 8 words.
    2.  **Timestamping:** Accurately assign a 'start' and 'end' timestamp in seconds for each line. The timestamps must be sequential and cover the entire song duration. Distribute the time proportionally across the lines based on their length and natural pauses. The last line's 'end' time should match the total track 'duration'.
    3.  **Translation (Optional):** If a language other than the original is specified, provide a translated version of the lyrics with the same timing structure. The translation should be natural and singable.
    4.  **JSON Output:** The final output MUST be a valid JSON object. Do not include any text, explanations, or markdown formatting outside of the JSON block.

    **Input:**
    - Lyrics Text:
    \`\`\`
    ${lyricsText}
    \`\`\`
    - Total Duration: ${duration} seconds
    - Target Language: ${language}

    **Output Format:**
    - If lyrics are found and processed, use the primary 'lyrics' key. If translation is requested, also include the 'translatedLyrics' key.
    - If no valid lyrics can be extracted from the input text, return a JSON object with an 'error' key.

    **Example Success Output (with translation):**
    {
      "lyrics": [
        {"start": 0.0, "end": 4.5, "text": "Hello, it's me"},
        {"start": 4.6, "end": 8.2, "text": "I was wondering if after all these years"}
      ],
      "translatedLyrics": [
        {"start": 0.0, "end": 4.5, "text": "नमस्ते, यह मैं हूँ"},
        {"start": 4.6, "end": 8.2, "text": "मैं सोच रहा था कि इतने सालों बाद"}
      ]
    }

    **Example Error Output:**
    {"error": "No lyrics found for this song"}

    Now, process the provided input.
    `;

    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        lyrics: {
            type: Type.ARRAY,
            items: {
                type: Type.OBJECT,
                properties: {
                    start: { type: Type.NUMBER },
                    end: { type: Type.NUMBER },
                    text: { type: Type.STRING },
                },
                required: ['start', 'end', 'text']
            }
        },
        translatedLyrics: {
            type: Type.ARRAY,
            nullable: true,
            items: {
                type: Type.OBJECT,
                properties: {
                    start: { type: Type.NUMBER },
                    end: { type: Type.NUMBER },
                    text: { type: Type.STRING },
                },
                required: ['start', 'end', 'text']
            }
        },
        error: {
            type: Type.STRING,
            nullable: true,
        }
      },
    };

  try {
    const response = await ai.models.generateContent({
        model: MODEL_NAME,
        contents: prompt,
        config: {
            responseMimeType: 'application/json',
            responseSchema: responseSchema,
            temperature: 0.3,
        }
    });

    const text = response.text.trim();
    const parsedJson = JSON.parse(text) as KaraokeData;

    // Post-processing to ensure data integrity
    if(parsedJson.lyrics && parsedJson.lyrics.length > 0) {
      // Ensure the last line ends at the provided duration
      const lastLyric = parsedJson.lyrics[parsedJson.lyrics.length - 1];
      if (lastLyric.end > duration || lastLyric.end < duration - 5) {
        lastLyric.end = duration;
      }
    }
    if(parsedJson.translatedLyrics && parsedJson.translatedLyrics.length > 0) {
      const lastTranslatedLyric = parsedJson.translatedLyrics[parsedJson.translatedLyrics.length - 1];
      if (lastTranslatedLyric.end > duration || lastTranslatedLyric.end < duration - 5) {
        lastTranslatedLyric.end = duration;
      }
    }

    return parsedJson;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // FIX: Add 'lyrics: []' to the returned object to satisfy the KaraokeData type.
    return { lyrics: [], error: "Failed to parse response from AI model. Please check your input and try again." };
  }
};