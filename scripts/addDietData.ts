import { db } from '../app/firebase/config';
import { collection, doc, setDoc } from 'firebase/firestore';

const sampleDietCategories = [
  {
    id: 'weight-loss',
    name: 'Weight Loss',
    description: 'Effective diet plans for healthy weight loss',
    imageUrl: 'https://source.unsplash.com/random/800x600?weight,loss,diet',
    backgroundColor: '#4CAF50',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'keto',
    name: 'Keto Diet',
    description: 'High-fat, low-carb ketogenic diet plans',
    imageUrl: 'https://source.unsplash.com/random/800x600?keto,diet',
    backgroundColor: '#2196F3',
    createdAt: new Date(),
    updatedAt: new Date()
  },
  {
    id: 'vegetarian',
    name: 'Vegetarian',
    description: 'Plant-based diet plans for healthy living',
    imageUrl: 'https://source.unsplash.com/random/800x600?vegetarian,food',
    backgroundColor: '#8BC34A',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleRecipes = [
  {
    id: 'overnight-oats',
    name: 'Protein Overnight Oats',
    description: 'High-protein breakfast option',
    imageUrl: 'https://source.unsplash.com/random/800x600?oats,breakfast',
    prepTime: 10,
    cookTime: 0,
    servings: 1,
    difficulty: 'easy',
    ingredients: [
      '1/2 cup rolled oats',
      '1 scoop protein powder',
      '1 cup almond milk',
      '1 tbsp chia seeds',
      '1/2 banana, sliced',
      'Handful of berries'
    ],
    instructions: [
      'Mix oats, protein powder, and chia seeds',
      'Add almond milk and stir well',
      'Cover and refrigerate overnight',
      'Top with banana and berries before serving'
    ],
    tags: ['breakfast', 'high-protein', 'meal-prep'],
    nutritionalInfo: {
      calories: 350,
      protein: 25,
      carbs: 45,
      fat: 12
    },
    categoryId: 'weight-loss',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const sampleDietPlans = [
  {
    id: 'weight-loss-beginner',
    name: '30-Day Weight Loss Plan',
    description: 'Perfect for beginners starting their weight loss journey',
    imageUrl: 'https://source.unsplash.com/random/800x600?healthy,meal',
    duration: 30,
    difficulty: 'beginner',
    goals: [
      'Lose 4-8 pounds',
      'Build healthy eating habits',
      'Increase energy levels'
    ],
    restrictions: [
      'No processed foods',
      'Limited sugar intake',
      'No alcohol'
    ],
    recipes: ['overnight-oats'],
    mealPlans: [
      {
        breakfast: [
          {
            recipeId: 'overnight-oats',
            quantity: 1,
            notes: 'Prepare the night before'
          }
        ],
        lunch: [
          {
            recipeId: 'overnight-oats',
            quantity: 1,
            notes: 'Can be eaten cold or warm'
          }
        ],
        dinner: [
          {
            recipeId: 'overnight-oats',
            quantity: 1,
            notes: 'Add extra protein if needed'
          }
        ]
      }
    ],
    categoryId: 'weight-loss',
    createdAt: new Date(),
    updatedAt: new Date()
  }
];

const addDietData = async () => {
  try {
    // Add diet categories
    for (const category of sampleDietCategories) {
      await setDoc(doc(db, 'dietCategories', category.id), category);
      console.log(`Added diet category: ${category.name}`);
    }

    // Add recipes
    for (const recipe of sampleRecipes) {
      await setDoc(doc(db, 'recipes', recipe.id), recipe);
      console.log(`Added recipe: ${recipe.name}`);
    }

    // Add diet plans
    for (const plan of sampleDietPlans) {
      await setDoc(doc(db, 'diets', plan.id), plan);
      console.log(`Added diet plan: ${plan.name}`);
    }

    console.log('Successfully added all diet data!');
  } catch (error) {
    console.error('Error adding diet data:', error);
  }
};

// Run the function
addDietData();
