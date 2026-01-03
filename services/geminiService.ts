
import { GoogleGenAI, Type, GenerateContentResponse } from "@google/genai";
import { AnalysisResponse } from "../types";

const API_KEY = process.env.API_KEY || '';

export class GeminiService {
  private ai: GoogleGenAI;

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: API_KEY });
  }

  async analyzeFrame(base64Image: string, gameContext: string): Promise<AnalysisResponse | null> {
    try {
      const response = await this.ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: [
          {
            parts: [
              {
                inlineData: {
                  mimeType: 'image/jpeg',
                  data: base64Image.split(',')[1] || base64Image,
                },
              },
              {
                text: `You are an expert AI gamer. Analyze this screenshot of a game (Current context: ${gameContext}).
                1. What have you learned about the current situation?
                2. What is the single best next input action (e.g., 'Move Left', 'Press X', 'Talk to NPC')?
                3. Provide a quick pro coaching tip.
                Return only JSON.`,
              },
            ],
          },
        ],
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              learning: { type: Type.STRING },
              action: { type: Type.STRING },
              coaching_tip: { type: Type.STRING },
            },
            required: ['learning', 'action', 'coaching_tip'],
          },
        },
      });

      const text = response.text;
      if (!text) return null;
      return JSON.parse(text) as AnalysisResponse;
    } catch (error) {
      console.error("Error analyzing frame:", error);
      return null;
    }
  }

  async chatWithAI(messages: {role: string, content: string}[], latestFrame?: string) {
    try {
      const chat = this.ai.chats.create({
        model: 'gemini-3-flash-preview',
        config: {
          systemInstruction: 'You are GameGhost, a helpful and witty AI gaming companion. You help players beat difficult games like Undertale by providing strategies and analysis.',
        }
      });

      const lastMsg = messages[messages.length - 1].content;
      
      let response: GenerateContentResponse;
      if (latestFrame) {
        response = await this.ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: {
                parts: [
                    { inlineData: { mimeType: 'image/jpeg', data: latestFrame.split(',')[1] || latestFrame } },
                    { text: lastMsg }
                ]
            }
        });
      } else {
        response = await chat.sendMessage({ message: lastMsg });
      }

      return response.text;
    } catch (error) {
      console.error("Error in chat:", error);
      return "I'm having trouble connecting to my central brain. Try again in a second!";
    }
  }
}

export const gemini = new GeminiService();
