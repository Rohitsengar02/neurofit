import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

const extractJsonFromText = (text: string) => {
  try {
    // Try to parse the entire text as JSON first
    return JSON.parse(text);
  } catch (e) {
    // If that fails, try to extract JSON from the text
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Error parsing extracted JSON:', e);
        throw new Error('Could not parse JSON from response');
      }
    }
    console.error('No JSON found in text');
    throw new Error('No JSON found in response');
  }
};

export interface NutritionInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
  sodium: number;
  cholesterol: number;
}

export const generateNutritionFacts = async ({
  name,
  ingredients,
  servings,
  instructions
}: {
  name: string;
  ingredients: string[];
  servings: number;
  instructions: string[];
}): Promise<{
  success: boolean;
  data?: NutritionInfo & { imagePrompt?: string };
  error?: string;
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(`Analyze the nutrition facts for this recipe:
    Name: ${name}
    Ingredients: ${ingredients.join(', ')}
    Servings: ${servings}
    Instructions: ${instructions.join(', ')}

    Return ONLY a JSON object in this exact format, with no additional text or markdown:
    {
      "calories": number (per serving),
      "protein": number (grams per serving),
      "carbs": number (grams per serving),
      "fat": number (grams per serving),
      "fiber": number (grams per serving),
      "sugar": number (grams per serving),
      "sodium": number (milligrams per serving),
      "cholesterol": number (milligrams per serving),
      "imagePrompt": string (a detailed prompt for generating an appetizing, professional food photo of this dish - make it descriptive for AI image generation)
    }`);

    const response = result.response;
    const text = response.text();
    const nutritionInfo = extractJsonFromText(text);

    return {
      success: true,
      data: {
        calories: Math.round(nutritionInfo.calories),
        protein: Math.round(nutritionInfo.protein),
        carbs: Math.round(nutritionInfo.carbs),
        fat: Math.round(nutritionInfo.fat),
        fiber: Math.round(nutritionInfo.fiber),
        sugar: Math.round(nutritionInfo.sugar),
        sodium: Math.round(nutritionInfo.sodium),
        cholesterol: Math.round(nutritionInfo.cholesterol),
        imagePrompt: nutritionInfo.imagePrompt || `Appetizing photo of ${name} dish with ${ingredients.slice(0, 3).join(', ')}`
      }
    };
  } catch (error) {
    console.error('Error generating nutrition facts:', error);
    return {
      success: false,
      error: 'Failed to generate nutrition facts. Please try again or enter manually.'
    };
  }
};

export const analyzeDietPlan = async (meals: { 
  type: string;
  name: string;
  ingredients: string[];
  servings?: number;
}[]): Promise<{
  success: boolean;
  data?: {
    totalCalories: number;
    nutritionBreakdown: NutritionInfo;
    recommendations: string[];
  };
  error?: string;
}> => {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(`Analyze the nutrition facts for this diet plan:
    ${meals.map(meal => `
    ${meal.type.toUpperCase()}:
    Name: ${meal.name}
    Ingredients: ${meal.ingredients.join(', ')}
    Servings: ${meal.servings || 1}
    `).join('\n')}

    Return ONLY a JSON object in this exact format, with no additional text or markdown:
    {
      "totalCalories": number (total calories for the day),
      "nutritionBreakdown": {
        "calories": number (per day),
        "protein": number (grams per day),
        "carbs": number (grams per day),
        "fat": number (grams per day),
        "fiber": number (grams per day),
        "sugar": number (grams per day),
        "sodium": number (milligrams per day),
        "cholesterol": number (milligrams per day)
      },
      "recommendations": [
        "recommendation 1",
        "recommendation 2",
        "recommendation 3"
      ]
    }`);

    const response = result.response;
    const text = response.text();
    const data = extractJsonFromText(text);

    return {
      success: true,
      data: {
        totalCalories: Math.round(data.totalCalories),
        nutritionBreakdown: {
          calories: Math.round(data.nutritionBreakdown.calories),
          protein: Math.round(data.nutritionBreakdown.protein),
          carbs: Math.round(data.nutritionBreakdown.carbs),
          fat: Math.round(data.nutritionBreakdown.fat),
          fiber: Math.round(data.nutritionBreakdown.fiber),
          sugar: Math.round(data.nutritionBreakdown.sugar),
          sodium: Math.round(data.nutritionBreakdown.sodium),
          cholesterol: Math.round(data.nutritionBreakdown.cholesterol)
        },
        recommendations: data.recommendations
      }
    };
  } catch (error) {
    console.error('Error analyzing diet plan:', error);
    return {
      success: false,
      error: 'Failed to analyze diet plan. Please try again.'
    };
  }
};
