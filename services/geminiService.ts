
import { GoogleGenAI, Type } from "@google/genai";
import { Job, User, Language } from "../types";

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getSmartRecommendations = async (user: User, availableJobs: Job[], lang: Language): Promise<string[]> => {
  // Always have a safe fallback
  const fallbackIds = availableJobs.slice(0, 2).map(j => j.id);
  
  if (!process.env.API_KEY) return fallbackIds;

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const jobSummary = availableJobs.map(j => ({ id: j.id, title: j.title, category: j.category }));
  
  try {
    // Recommendation matching involves reasoning, so using gemini-3-pro-preview
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `Recommend the best 2 jobs for this worker based on their profile.
      Worker: ${JSON.stringify({ skills: user.skills, location: user.location })}
      Jobs: ${JSON.stringify(jobSummary)}
      User Preferred Language: ${lang === 'GE' ? 'Georgian' : 'English'}
      
      Return ONLY the IDs of the recommended jobs as a JSON array.`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: { type: Type.STRING }
        }
      }
    });

    const result = JSON.parse(response.text?.trim() || '[]');
    return Array.isArray(result) ? result : fallbackIds;
  } catch (error: any) {
    console.warn("Gemini Service: Quota exceeded or error occurred. Using fallback.", error?.message);
    // If it's a 429, we just return the fallback immediately to keep the app snappy
    return fallbackIds;
  }
};

export const generateJobDescription = async (title: string, category: string, lang: Language): Promise<string> => {
  if (!process.env.API_KEY) return lang === 'GE' ? "აღწერა მალე დაემატება." : "Description coming soon.";
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const languageName = lang === 'GE' ? 'Georgian' : 'English';
  try {
    // Basic text generation task
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Create a professional and attractive job description in ${languageName} for title: "${title}" in category: "${category}". Be concise (max 3 sentences).`,
    });
    return response.text || (lang === 'GE' ? "აღწერა ვერ გენერირდა." : "Description could not be generated.");
  } catch (error) {
    console.error("Gemini Description Error:", error);
    return lang === 'GE' ? "პროფესიონალური მომსახურება გარანტირებულია." : "Professional service guaranteed.";
  }
};
