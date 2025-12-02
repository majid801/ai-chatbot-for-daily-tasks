import { GoogleGenAI } from "@google/genai";
import { Message } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
const MODEL_NAME = 'gemini-2.5-flash';

export const generateChatResponse = async (
  history: Message[],
  currentMessage: string,
  contextFiles: string = ""
): Promise<string> => {
  try {
    const systemInstruction = `You are a highly intelligent Daily Task Assistant. 
    You help the user manage their day, answer questions, summarize texts, and analyze files.
    
    Traits:
    - Professional yet friendly.
    - Concise and action-oriented.
    - If a file context is provided, prioritize answering based on that file.
    - You can help draft emails, creating study plans, and breaking down goals.
    `;

    // Construct the prompt with context if available
    let fullPrompt = currentMessage;
    if (contextFiles) {
      fullPrompt = `[CONTEXT FROM UPLOADED FILES]:\n${contextFiles}\n\n[USER QUESTION]:\n${currentMessage}`;
    }

    // Convert internal history to Gemini format (simplified for single turn or limited context)
    // We will send the last few messages to maintain context
    const chatHistory = history.slice(-10).map(msg => ({
      role: msg.role === 'model' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }));

    const chat = ai.chats.create({
      model: MODEL_NAME,
      config: {
        systemInstruction: systemInstruction,
      },
      history: chatHistory
    });

    const result = await chat.sendMessage({ message: fullPrompt });
    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Gemini Chat Error:", error);
    return "I'm sorry, I encountered an error communicating with the AI service. Please check your connection or API key.";
  }
};

export const summarizeText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Summarize the following text concisely in bullet points:\n\n${text}`,
    });
    return response.text || "Could not generate summary.";
  } catch (error) {
    console.error("Gemini Summarize Error:", error);
    return "Error generating summary.";
  }
};

export const generateTaskPlan = async (goal: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: MODEL_NAME,
      contents: `Create a step-by-step actionable plan (To-Do List) for the following goal: "${goal}". 
      Format the output as a clean Markdown list. Do not add conversational filler.`,
    });
    return response.text || "Could not generate plan.";
  } catch (error) {
    console.error("Gemini Plan Error:", error);
    return "Error generating plan.";
  }
};
