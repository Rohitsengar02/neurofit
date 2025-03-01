import { GoogleGenerativeAI } from '@google/generative-ai';
import { DietPlan, MealSection, Recipe } from '../data/predefinedDiets';
import { v4 as uuidv4 } from 'uuid';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY!);

const generateRecipe = async (mealTime: string, dietType: 'veg' | 'non-veg'): Promise<Recipe> => {
  const model = genAI.getGenerativeModel({ model: "gemini-pro" });
  
  const dietDescription = dietType === 'veg' ? 'vegetarian' : 'non-vegetarian';
  const prompt = `As a professional nutritionist, create a healthy and delicious ${dietDescription} recipe suitable for ${mealTime}. 
  Be creative and original while ensuring it's nutritious and practical to make.
  
  Please provide:
  - A unique and appealing recipe name
  - A brief, enticing description
  - A list of healthy ingredients with measurements
  - Simple step-by-step cooking instructions
  - Nutritional information (calories, protein, carbs, fat, fiber)
  - Approximate cooking time
  - Recommended serving size

  Format as:
  NAME: [name]
  DESCRIPTION: [description]
  INGREDIENTS: [ingredients list]
  INSTRUCTIONS: [steps]
  NUTRITION: [values]
  TIME: [duration]
  SERVING: [size]`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the structured text response
    const sections = text.split(/\d*\.\s*(?=[A-Z]+:)|\n(?=[A-Z]+:)/);
    const parseSection = (keyword: string) => {
      const section = sections.find(s => s.trim().startsWith(keyword));
      return section ? section.replace(keyword, '').trim() : '';
    };

    const nutritionText = parseSection('NUTRITION:');
    const nutritionValues = {
      calories: parseInt(nutritionText.match(/calories?:?\s*(\d+)/i)?.[1] || '0'),
      protein: parseInt(nutritionText.match(/protein:?\s*(\d+)/i)?.[1] || '0'),
      carbs: parseInt(nutritionText.match(/carbs?:?\s*(\d+)/i)?.[1] || '0'),
      fat: parseInt(nutritionText.match(/fat:?\s*(\d+)/i)?.[1] || '0'),
      fiber: parseInt(nutritionText.match(/fiber:?\s*(\d+)/i)?.[1] || '0')
    };

    const recipe: Recipe = {
      id: uuidv4(),
      name: parseSection('NAME:') || 'Healthy Recipe',
      description: parseSection('DESCRIPTION:') || 'A nutritious and delicious meal',
      ingredients: parseSection('INGREDIENTS:').split('\n').filter(Boolean).map(i => i.trim()),
      instructions: parseSection('INSTRUCTIONS:').split('\n').filter(Boolean).map(i => i.trim()),
      nutritionalValues: nutritionValues,
      estimatedTime: parseSection('TIME:') || '30 minutes',
      servingSize: parseSection('SERVING:') || '1 serving'
    };

    // Validate the recipe
    if (!recipe.name || !recipe.ingredients.length || !recipe.instructions.length) {
      throw new Error('Generated recipe is incomplete');
    }

    return recipe;
  } catch (error) {
    console.error('Failed to generate recipe:', error);
    throw new Error('Failed to generate recipe');
  }
};

const generateMealOptions = async (mealTime: string, dietType: 'veg' | 'non-veg'): Promise<Recipe[]> => {
  try {
    // Generate recipes in parallel with delay between each
    const recipes: Recipe[] = [];
    for (let i = 0; i < 4; i++) {
      try {
        // Add a small delay between requests to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
        const recipe = await generateRecipe(mealTime, dietType);
        recipes.push(recipe);
      } catch (error) {
        console.error(`Failed to generate recipe ${i + 1}:`, error);
      }
    }

    if (recipes.length === 0) {
      throw new Error('Failed to generate any valid recipes');
    }

    return recipes;
  } catch (error) {
    console.error('Failed to generate meal options:', error);
    throw new Error('Failed to generate recipes');
  }
};

export const generateMealPlan = async (dietType: 'veg' | 'non-veg'): Promise<DietPlan> => {
  const mealTimes = ['morning', 'lunch', 'afternoon', 'dinner', 'night'];
  const sections: MealSection[] = [];

  try {
    for (const mealTime of mealTimes) {
      try {
        // Add a small delay between meal sections
        if (sections.length > 0) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
        const options = await generateMealOptions(mealTime, dietType);
        sections.push({
          mealTime: mealTime as any,
          options
        });
      } catch (error) {
        console.error(`Failed to generate options for ${mealTime}:`, error);
        continue;
      }
    }

    if (sections.length === 0) {
      throw new Error('Failed to generate any meal sections');
    }

    return {
      id: `ai-${dietType}-${Date.now()}`,
      name: `AI-Generated ${dietType === 'veg' ? 'Vegetarian' : 'Non-Vegetarian'} Meal Plan`,
      type: dietType,
      description: `A personalized ${dietType === 'veg' ? 'vegetarian' : 'non-vegetarian'} meal plan generated by AI, featuring nutritious and delicious recipes for every meal of the day.`,
      sections,
      createdBy: 'ai',
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error generating meal plan:', error);
    throw new Error('Failed to generate complete meal plan');
  }
};
