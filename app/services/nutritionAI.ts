import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyD624JPggYA0eMf7QVDjXFFYYkNUSh5MRs');

export interface NutritionData {
  name: string;
  category: string;
  calories: number;
  macros: {
    protein: number;
    carbs: number;
    fats: number;
    fiber: number;
  };
  vitamins: string[];
  minerals: string[];
  healthBenefits: string[];
  servingSize: string;
  imagePrompt: string;
}

export const getFoodNutritionInfo = async (query: string): Promise<NutritionData[]> => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Act as a professional nutritionist and provide detailed nutrition information for "${query}" or similar foods.
    Return the response as a JSON array with exactly 3 food items. Each item should have this exact format:
    {
      "name": "Food name",
      "category": "Category (e.g., Fruits, Vegetables, Proteins, etc.)",
      "calories": number (per 100g),
      "macros": {
        "protein": number (g),
        "carbs": number (g),
        "fats": number (g),
        "fiber": number (g)
      },
      "vitamins": ["Vitamin A", "Vitamin C", etc.],
      "minerals": ["Iron", "Calcium", etc.],
      "healthBenefits": ["Benefit 1", "Benefit 2", "Benefit 3"],
      "servingSize": "Typical serving size (e.g., 1 cup, 100g)",
      "imagePrompt": "A brief description for generating an image of this food"
    }`;

    const result = await model.generateContent(prompt);
    if (!result.response) {
      throw new Error('No response from Gemini');
    }

    const text = result.response.text();
    console.log('Gemini response:', text);

    try {
      const data = JSON.parse(text);
      if (!Array.isArray(data)) {
        throw new Error('Invalid response format');
      }
      return data;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', parseError);
      throw new Error('Failed to process nutrition data');
    }
  } catch (error) {
    console.error('Gemini API Error:', error);
    throw error;
  }
};
