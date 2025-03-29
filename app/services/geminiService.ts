import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || '');

interface RecipeData {
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  cuisine: string;
  restrictions: string[];
  servings: number;
}

interface MealPlan {
  breakfast: {
    options: Array<{
      name: string;
      description: string;
      ingredients: string[];
      calories: number;
    }>;
  };
  lunch: {
    options: Array<{
      name: string;
      description: string;
      ingredients: string[];
      calories: number;
    }>;
  };
  dinner: {
    options: Array<{
      name: string;
      description: string;
      ingredients: string[];
      calories: number;
    }>;
  };
  snacks: {
    options: Array<{
      name: string;
      description: string;
      ingredients: string[];
      calories: number;
    }>;
  };
}

interface DietPlanData {
  name: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  restrictions: string[];
  goals: string[];
  servings: number;
  mealPlan: MealPlan;
}

function extractJsonFromText(text: string): any {
  const jsonStr = text.replace(/```json\n|\n```/g, '').trim();
  try {
    return JSON.parse(jsonStr);
  } catch (error) {
    const jsonMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw error;
  }
}

export async function generateRecipe(prompt: string): Promise<{ success: boolean; data?: RecipeData; error?: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(`Create a recipe based on this prompt: "${prompt}". 
    Return ONLY a JSON object in this exact format, with no additional text or markdown:
    {
      "name": "Recipe name",
      "description": "Brief description",
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["step 1", "step 2"],
      "duration": "cooking time (e.g., 30 minutes)",
      "difficulty": "easy/medium/hard",
      "cuisine": "cuisine type",
      "restrictions": ["vegetarian", "gluten-free"],
      "servings": 4
    }`);

    const response = result.response;
    const text = response.text();
    const data = extractJsonFromText(text);

    // Validate the data structure
    if (!data.name || !data.ingredients || !data.instructions) {
      throw new Error('Invalid recipe data structure');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error generating recipe:', error);
    return { success: false, error: 'Failed to generate recipe. Please try again.' };
  }
}

export async function generateDietPlan(prompt: string): Promise<{ success: boolean; data?: DietPlanData; error?: string }> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(`Create a comprehensive diet plan based on this prompt: "${prompt}". 
    Return ONLY a JSON object in this exact format, with no additional text or markdown:
    {
      "name": "Diet plan name",
      "description": "Detailed description of the diet plan",
      "duration": "duration (e.g., 7 days, 4 weeks)",
      "difficulty": "easy/medium/hard",
      "restrictions": ["restriction1", "restriction2"],
      "goals": ["goal1", "goal2"],
      "servings": 1,
      "mealPlan": {
        "breakfast": {
          "options": [
            {
              "name": "Breakfast option 1",
              "description": "Description of breakfast 1",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 300
            },
            {
              "name": "Breakfast option 2",
              "description": "Description of breakfast 2",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 300
            },
            {
              "name": "Breakfast option 3",
              "description": "Description of breakfast 3",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 300
            },
            {
              "name": "Breakfast option 4",
              "description": "Description of breakfast 4",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 300
            }
          ]
        },
        "lunch": {
          "options": [
            {
              "name": "Lunch option 1",
              "description": "Description of lunch 1",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 500
            },
            {
              "name": "Lunch option 2",
              "description": "Description of lunch 2",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 500
            },
            {
              "name": "Lunch option 3",
              "description": "Description of lunch 3",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 500
            },
            {
              "name": "Lunch option 4",
              "description": "Description of lunch 4",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 500
            }
          ]
        },
        "dinner": {
          "options": [
            {
              "name": "Dinner option 1",
              "description": "Description of dinner 1",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 400
            },
            {
              "name": "Dinner option 2",
              "description": "Description of dinner 2",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 400
            },
            {
              "name": "Dinner option 3",
              "description": "Description of dinner 3",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 400
            },
            {
              "name": "Dinner option 4",
              "description": "Description of dinner 4",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 400
            }
          ]
        },
        "snacks": {
          "options": [
            {
              "name": "Snack option 1",
              "description": "Description of snack 1",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 150
            },
            {
              "name": "Snack option 2",
              "description": "Description of snack 2",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 150
            },
            {
              "name": "Snack option 3",
              "description": "Description of snack 3",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 150
            },
            {
              "name": "Snack option 4",
              "description": "Description of snack 4",
              "ingredients": ["ingredient1", "ingredient2"],
              "calories": 150
            }
          ]
        }
      }
    }`);

    const response = result.response;
    const text = response.text();
    const data = extractJsonFromText(text);

    // Validate the data structure
    if (!data.name || !data.mealPlan) {
      throw new Error('Invalid diet plan data structure');
    }

    return { success: true, data };
  } catch (error) {
    console.error('Error generating diet plan:', error);
    return { success: false, error: 'Failed to generate diet plan. Please try again.' };
  }
}
