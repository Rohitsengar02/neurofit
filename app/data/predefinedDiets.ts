export interface NutritionalInfo {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  ingredients: string[];
  instructions: string[];
  nutritionalValues: NutritionalInfo;
  estimatedTime: string;
  servingSize: string;
  imageUrl?: string;
}

export type MealTime = 'morning' | 'lunch' | 'afternoon' | 'dinner' | 'night';

export interface MealSection {
  mealTime: MealTime;
  options: Recipe[];
}

export interface DietPlan {
  id: string;
  name: string;
  type: 'veg' | 'non-veg';
  description: string;
  sections: MealSection[];
  createdBy: 'predefined' | 'ai';
  createdAt?: string;
}

// Sample predefined vegetarian diet plan
const vegBreakfastOptions: Recipe[] = [
  {
    id: 'vb1',
    name: 'Protein-Packed Oatmeal Bowl',
    description: 'Creamy oatmeal loaded with nuts and fruits',
    ingredients: [
      '1 cup rolled oats',
      '2 tbsp chia seeds',
      '1 banana, sliced',
      '1/4 cup mixed nuts',
      '1 tbsp honey',
      '1 cup almond milk'
    ],
    instructions: [
      'Cook oats with almond milk until creamy',
      'Add chia seeds and stir',
      'Top with sliced banana and mixed nuts',
      'Drizzle with honey'
    ],
    nutritionalValues: {
      calories: 385,
      protein: 12,
      carbs: 56,
      fat: 16,
      fiber: 9
    },
    estimatedTime: '10 mins',
    servingSize: '1 bowl'
  },
  {
    id: 'vb2',
    name: 'Avocado Toast',
    description: 'Whole grain toast with mashed avocado and eggs',
    ingredients: [
      '2 slices whole grain bread',
      '1 avocado, mashed',
      '2 eggs, sliced',
      'Salt and pepper to taste'
    ],
    instructions: [
      'Toast bread',
      'Mash avocado and spread on toast',
      'Top with sliced eggs'
    ],
    nutritionalValues: {
      calories: 320,
      protein: 14,
      carbs: 30,
      fat: 20,
      fiber: 7
    },
    estimatedTime: '10 mins',
    servingSize: '1 serving'
  },
  {
    id: 'vb3',
    name: 'Greek Yogurt Parfait',
    description: 'Layered Greek yogurt with granola and berries',
    ingredients: [
      '1 cup Greek yogurt',
      '1/4 cup granola',
      '1 cup mixed berries'
    ],
    instructions: [
      'Layer yogurt, granola, and berries in a bowl'
    ],
    nutritionalValues: {
      calories: 300,
      protein: 20,
      carbs: 40,
      fat: 10,
      fiber: 5
    },
    estimatedTime: '5 mins',
    servingSize: '1 bowl'
  },
  {
    id: 'vb4',
    name: 'Smoothie Bowl',
    description: 'Thick and creamy smoothie bowl with banana and spinach',
    ingredients: [
      '2 cups spinach',
      '1 banana',
      '1 cup almond milk',
      '1/2 cup Greek yogurt'
    ],
    instructions: [
      'Blend ingredients until smooth',
      'Top with granola and fruit'
    ],
    nutritionalValues: {
      calories: 350,
      protein: 15,
      carbs: 50,
      fat: 15,
      fiber: 8
    },
    estimatedTime: '10 mins',
    servingSize: '1 bowl'
  }
];

const vegLunchOptions: Recipe[] = [
  {
    id: 'vl1',
    name: 'Quinoa Buddha Bowl',
    description: 'Colorful bowl with quinoa and roasted vegetables',
    ingredients: [
      '1 cup quinoa',
      '2 cups mixed vegetables',
      '1 cup chickpeas',
      '1 avocado',
      'Tahini dressing'
    ],
    instructions: [
      'Cook quinoa according to package instructions',
      'Roast vegetables in the oven',
      'Arrange quinoa, vegetables, and chickpeas in a bowl',
      'Top with sliced avocado and tahini dressing'
    ],
    nutritionalValues: {
      calories: 450,
      protein: 15,
      carbs: 65,
      fat: 18,
      fiber: 12
    },
    estimatedTime: '25 mins',
    servingSize: '1 bowl'
  },
  {
    id: 'vl2',
    name: 'Lentil Soup',
    description: 'Hearty and comforting lentil soup with vegetables',
    ingredients: [
      '1 cup red lentils',
      '2 cups mixed vegetables',
      '4 cups vegetable broth'
    ],
    instructions: [
      'Saute onions and garlic',
      'Add lentils and vegetables',
      'Simmer until lentils are tender'
    ],
    nutritionalValues: {
      calories: 400,
      protein: 18,
      carbs: 60,
      fat: 10,
      fiber: 10
    },
    estimatedTime: '30 mins',
    servingSize: '1 bowl'
  },
  {
    id: 'vl3',
    name: 'Grilled Vegetable Wrap',
    description: 'Whole grain wrap with grilled vegetables and hummus',
    ingredients: [
      '1 whole grain wrap',
      '1 cup mixed vegetables',
      '2 tbsp hummus'
    ],
    instructions: [
      'Grill vegetables',
      'Spread hummus on wrap',
      'Add grilled vegetables'
    ],
    nutritionalValues: {
      calories: 350,
      protein: 10,
      carbs: 40,
      fat: 15,
      fiber: 8
    },
    estimatedTime: '15 mins',
    servingSize: '1 wrap'
  },
  {
    id: 'vl4',
    name: 'Chickpea Salad',
    description: 'Fresh salad with chickpeas, mixed greens, and lemon vinaigrette',
    ingredients: [
      '1 cup chickpeas',
      '2 cups mixed greens',
      '1/4 cup lemon vinaigrette'
    ],
    instructions: [
      'Mix chickpeas and greens',
      'Drizzle with lemon vinaigrette'
    ],
    nutritionalValues: {
      calories: 300,
      protein: 15,
      carbs: 30,
      fat: 15,
      fiber: 8
    },
    estimatedTime: '10 mins',
    servingSize: '1 bowl'
  }
];

const vegAfternoonOptions: Recipe[] = [
  {
    id: 'va1',
    name: 'Apple Slices with Almond Butter',
    description: 'Crunchy apple slices with creamy almond butter',
    ingredients: [
      '1 apple, sliced',
      '2 tbsp almond butter'
    ],
    instructions: [
      'Spread almond butter on apple slices'
    ],
    nutritionalValues: {
      calories: 150,
      protein: 4,
      carbs: 20,
      fat: 8,
      fiber: 4
    },
    estimatedTime: '5 mins',
    servingSize: '1 serving'
  },
  {
    id: 'va2',
    name: 'Carrot Sticks with Hummus',
    description: 'Crunchy carrot sticks with creamy hummus',
    ingredients: [
      '4 carrot sticks',
      '2 tbsp hummus'
    ],
    instructions: [
      'Dip carrot sticks in hummus'
    ],
    nutritionalValues: {
      calories: 100,
      protein: 5,
      carbs: 10,
      fat: 10,
      fiber: 6
    },
    estimatedTime: '5 mins',
    servingSize: '1 serving'
  },
  {
    id: 'va3',
    name: 'Cucumber Slices with Dill Dip',
    description: ' Refreshing cucumber slices with creamy dill dip',
    ingredients: [
      '4 cucumber slices',
      '2 tbsp dill dip'
    ],
    instructions: [
      'Dip cucumber slices in dill dip'
    ],
    nutritionalValues: {
      calories: 100,
      protein: 5,
      carbs: 10,
      fat: 10,
      fiber: 4
    },
    estimatedTime: '5 mins',
    servingSize: '1 serving'
  },
  {
    id: 'va4',
    name: 'Protein Smoothie',
    description: 'Thick and creamy protein smoothie with banana and spinach',
    ingredients: [
      '1 banana',
      '1 cup spinach',
      '1 scoop protein powder',
      '1 cup almond milk'
    ],
    instructions: [
      'Blend ingredients until smooth'
    ],
    nutritionalValues: {
      calories: 250,
      protein: 25,
      carbs: 30,
      fat: 10,
      fiber: 5
    },
    estimatedTime: '10 mins',
    servingSize: '1 smoothie'
  }
];

const vegDinnerOptions: Recipe[] = [
  {
    id: 'vd1',
    name: 'Vegetable Stir Fry',
    description: 'Quick and easy stir fry with mixed vegetables and tofu',
    ingredients: [
      '1 cup mixed vegetables',
      '1/2 cup tofu',
      '2 tbsp soy sauce'
    ],
    instructions: [
      'Stir fry vegetables and tofu',
      'Season with soy sauce'
    ],
    nutritionalValues: {
      calories: 300,
      protein: 20,
      carbs: 30,
      fat: 15,
      fiber: 8
    },
    estimatedTime: '20 mins',
    servingSize: '1 serving'
  },
  {
    id: 'vd2',
    name: 'Lentil Curry',
    description: 'Hearty and comforting lentil curry with mixed vegetables',
    ingredients: [
      '1 cup red lentils',
      '2 cups mixed vegetables',
      '2 tbsp curry powder'
    ],
    instructions: [
      'Saute onions and garlic',
      'Add lentils and vegetables',
      'Simmer until lentils are tender'
    ],
    nutritionalValues: {
      calories: 400,
      protein: 18,
      carbs: 60,
      fat: 10,
      fiber: 10
    },
    estimatedTime: '30 mins',
    servingSize: '1 bowl'
  },
  {
    id: 'vd3',
    name: 'Grilled Vegetable Skewers',
    description: 'Colorful skewers with marinated vegetables and quinoa',
    ingredients: [
      '1 cup mixed vegetables',
      '1/2 cup quinoa',
      '2 tbsp olive oil'
    ],
    instructions: [
      'Marinate vegetables',
      'Grill skewers',
      'Serve with quinoa'
    ],
    nutritionalValues: {
      calories: 350,
      protein: 15,
      carbs: 40,
      fat: 15,
      fiber: 8
    },
    estimatedTime: '25 mins',
    servingSize: '1 serving'
  },
  {
    id: 'vd4',
    name: 'Vegetable Quesadilla',
    description: 'Whole grain quesadilla with roasted vegetables and guacamole',
    ingredients: [
      '1 whole grain tortilla',
      '1 cup mixed vegetables',
      '2 tbsp guacamole'
    ],
    instructions: [
      'Roast vegetables',
      'Assemble quesadilla',
      'Serve with guacamole'
    ],
    nutritionalValues: {
      calories: 350,
      protein: 10,
      carbs: 40,
      fat: 15,
      fiber: 8
    },
    estimatedTime: '20 mins',
    servingSize: '1 quesadilla'
  }
];

const vegNightOptions: Recipe[] = [
  {
    id: 'vn1',
    name: 'Warm Milk with Turmeric',
    description: 'Soothing warm milk with turmeric and honey',
    ingredients: [
      '1 cup milk',
      '1 tsp turmeric',
      '1 tsp honey'
    ],
    instructions: [
      'Heat milk',
      'Add turmeric and honey'
    ],
    nutritionalValues: {
      calories: 150,
      protein: 5,
      carbs: 20,
      fat: 10,
      fiber: 2
    },
    estimatedTime: '5 mins',
    servingSize: '1 cup'
  },
  {
    id: 'vn2',
    name: 'Chamomile Tea',
    description: 'Calming chamomile tea with honey and lemon',
    ingredients: [
      '1 cup chamomile tea',
      '1 tsp honey',
      '1 lemon slice'
    ],
    instructions: [
      'Steep tea',
      'Add honey and lemon'
    ],
    nutritionalValues: {
      calories: 100,
      protein: 2,
      carbs: 20,
      fat: 0,
      fiber: 2
    },
    estimatedTime: '5 mins',
    servingSize: '1 cup'
  },
  {
    id: 'vn3',
    name: 'Cucumber Water',
    description: 'Refreshing cucumber water with mint and lemon',
    ingredients: [
      '1 cucumber, sliced',
      '1/4 cup mint leaves',
      '1 lemon slice'
    ],
    instructions: [
      'Add cucumber and mint to water',
      'Squeeze lemon'
    ],
    nutritionalValues: {
      calories: 45,
      protein: 2,
      carbs: 10,
      fat: 0,
      fiber: 4
    },
    estimatedTime: '5 mins',
    servingSize: '1 glass'
  },
  {
    id: 'vn4',
    name: 'Tart Cherry Juice',
    description: 'Tart cherry juice with almond milk and honey',
    ingredients: [
      '1 cup tart cherry juice',
      '1/2 cup almond milk',
      '1 tsp honey'
    ],
    instructions: [
      'Mix ingredients'
    ],
    nutritionalValues: {
      calories: 150,
      protein: 2,
      carbs: 30,
      fat: 10,
      fiber: 2
    },
    estimatedTime: '5 mins',
    servingSize: '1 glass'
  }
];

const nonVegLunchOptions: Recipe[] = [
  {
    id: 'nvl1',
    name: 'Grilled Chicken Salad',
    description: 'Fresh salad with grilled chicken breast and avocado',
    ingredients: [
      '200g chicken breast',
      'Mixed salad greens',
      '1 avocado',
      'Cherry tomatoes',
      'Balsamic dressing'
    ],
    instructions: [
      'Grill chicken breast until cooked through',
      'Chop salad greens and tomatoes',
      'Slice avocado',
      'Combine ingredients and drizzle with dressing'
    ],
    nutritionalValues: {
      calories: 380,
      protein: 35,
      carbs: 12,
      fat: 24,
      fiber: 8
    },
    estimatedTime: '20 mins',
    servingSize: '1 bowl'
  },
  {
    id: 'nvl2',
    name: 'Turkey Wrap',
    description: 'Whole grain wrap with turkey and fresh vegetables',
    ingredients: [
      '2 slices turkey breast',
      '1 whole grain wrap',
      'Lettuce',
      'Tomato',
      'Light mayo'
    ],
    instructions: [
      'Lay out wrap',
      'Add turkey and vegetables',
      'Add light mayo',
      'Roll up and serve'
    ],
    nutritionalValues: {
      calories: 320,
      protein: 28,
      carbs: 30,
      fat: 12,
      fiber: 6
    },
    estimatedTime: '10 mins',
    servingSize: '1 wrap'
  },
  {
    id: 'nvl3',
    name: 'Tuna Quinoa Bowl',
    description: 'Protein-rich tuna with quinoa and vegetables',
    ingredients: [
      '1 can tuna',
      '1 cup quinoa',
      'Mixed vegetables',
      'Olive oil dressing'
    ],
    instructions: [
      'Cook quinoa',
      'Mix in tuna and vegetables',
      'Drizzle with dressing'
    ],
    nutritionalValues: {
      calories: 350,
      protein: 30,
      carbs: 35,
      fat: 15,
      fiber: 7
    },
    estimatedTime: '15 mins',
    servingSize: '1 bowl'
  },
  {
    id: 'nvl4',
    name: 'Chicken Pesto Pasta',
    description: 'Whole grain pasta with chicken and pesto sauce',
    ingredients: [
      '150g chicken breast',
      'Whole grain pasta',
      'Pesto sauce',
      'Cherry tomatoes'
    ],
    instructions: [
      'Cook pasta',
      'Grill chicken',
      'Mix with pesto sauce',
      'Add tomatoes'
    ],
    nutritionalValues: {
      calories: 420,
      protein: 32,
      carbs: 45,
      fat: 18,
      fiber: 6
    },
    estimatedTime: '25 mins',
    servingSize: '1 plate'
  }
];

const nonVegAfternoonOptions: Recipe[] = [
  {
    id: 'nva1',
    name: 'Turkey and Cheese Roll-ups',
    description: 'Light and protein-rich turkey roll-ups',
    ingredients: [
      '100g turkey breast',
      'Low-fat cheese',
      'Lettuce leaves'
    ],
    instructions: [
      'Layer turkey and cheese',
      'Roll in lettuce leaves'
    ],
    nutritionalValues: {
      calories: 180,
      protein: 22,
      carbs: 2,
      fat: 10,
      fiber: 1
    },
    estimatedTime: '5 mins',
    servingSize: '4 roll-ups'
  },
  {
    id: 'nva2',
    name: 'Chicken Greek Yogurt Dip',
    description: 'Protein-packed dip with vegetables',
    ingredients: [
      '100g shredded chicken',
      'Greek yogurt',
      'Cucumber',
      'Carrots'
    ],
    instructions: [
      'Mix chicken with yogurt',
      'Serve with vegetable sticks'
    ],
    nutritionalValues: {
      calories: 200,
      protein: 25,
      carbs: 8,
      fat: 8,
      fiber: 2
    },
    estimatedTime: '10 mins',
    servingSize: '1 serving'
  },
  {
    id: 'nva3',
    name: 'Egg White Bites',
    description: 'Light and fluffy egg white bites',
    ingredients: [
      '4 egg whites',
      'Spinach',
      'Bell peppers',
      'Low-fat cheese'
    ],
    instructions: [
      'Beat egg whites',
      'Add vegetables',
      'Bake in muffin tin'
    ],
    nutritionalValues: {
      calories: 120,
      protein: 15,
      carbs: 4,
      fat: 6,
      fiber: 1
    },
    estimatedTime: '15 mins',
    servingSize: '4 bites'
  },
  {
    id: 'nva4',
    name: 'Tuna Cucumber Boats',
    description: 'Fresh cucumber boats filled with tuna',
    ingredients: [
      '1 can tuna',
      '2 cucumbers',
      'Light mayo',
      'Herbs'
    ],
    instructions: [
      'Hollow cucumbers',
      'Mix tuna with mayo',
      'Fill cucumber boats'
    ],
    nutritionalValues: {
      calories: 150,
      protein: 20,
      carbs: 5,
      fat: 7,
      fiber: 2
    },
    estimatedTime: '10 mins',
    servingSize: '2 boats'
  }
];

const nonVegDinnerOptions: Recipe[] = [
  {
    id: 'nvd1',
    name: 'Baked Salmon',
    description: 'Omega-3 rich salmon with roasted vegetables',
    ingredients: [
      '200g salmon fillet',
      'Mixed vegetables',
      'Olive oil',
      'Lemon'
    ],
    instructions: [
      'Season salmon',
      'Roast vegetables',
      'Bake salmon',
      'Serve with lemon'
    ],
    nutritionalValues: {
      calories: 400,
      protein: 35,
      carbs: 20,
      fat: 25,
      fiber: 4
    },
    estimatedTime: '25 mins',
    servingSize: '1 fillet'
  },
  {
    id: 'nvd2',
    name: 'Lean Beef Stir-fry',
    description: 'Protein-rich beef with colorful vegetables',
    ingredients: [
      '150g lean beef',
      'Mixed vegetables',
      'Brown rice',
      'Soy sauce'
    ],
    instructions: [
      'Cook rice',
      'Stir-fry beef',
      'Add vegetables',
      'Season with soy sauce'
    ],
    nutritionalValues: {
      calories: 450,
      protein: 35,
      carbs: 40,
      fat: 20,
      fiber: 5
    },
    estimatedTime: '20 mins',
    servingSize: '1 plate'
  },
  {
    id: 'nvd3',
    name: 'Grilled Chicken Breast',
    description: 'Herb-seasoned chicken with quinoa',
    ingredients: [
      '200g chicken breast',
      'Quinoa',
      'Herbs',
      'Steamed broccoli'
    ],
    instructions: [
      'Season chicken',
      'Grill chicken',
      'Cook quinoa',
      'Steam broccoli'
    ],
    nutritionalValues: {
      calories: 380,
      protein: 40,
      carbs: 30,
      fat: 12,
      fiber: 6
    },
    estimatedTime: '25 mins',
    servingSize: '1 serving'
  },
  {
    id: 'nvd4',
    name: 'Turkey Meatballs',
    description: 'Lean turkey meatballs with zucchini noodles',
    ingredients: [
      '200g ground turkey',
      'Zucchini',
      'Tomato sauce',
      'Italian herbs'
    ],
    instructions: [
      'Form meatballs',
      'Bake meatballs',
      'Spiralize zucchini',
      'Combine with sauce'
    ],
    nutritionalValues: {
      calories: 350,
      protein: 35,
      carbs: 15,
      fat: 18,
      fiber: 4
    },
    estimatedTime: '30 mins',
    servingSize: '4 meatballs'
  }
];

const nonVegNightOptions: Recipe[] = [
  {
    id: 'nvn1',
    name: 'Protein Hot Chocolate',
    description: 'Warm chocolate drink with protein powder',
    ingredients: [
      'Almond milk',
      'Protein powder',
      'Cocoa powder',
      'Honey'
    ],
    instructions: [
      'Heat almond milk',
      'Mix in protein and cocoa',
      'Sweeten with honey'
    ],
    nutritionalValues: {
      calories: 150,
      protein: 20,
      carbs: 15,
      fat: 5,
      fiber: 2
    },
    estimatedTime: '5 mins',
    servingSize: '1 cup'
  },
  {
    id: 'nvn2',
    name: 'Cottage Cheese with Berries',
    description: 'Light protein-rich snack with berries',
    ingredients: [
      'Cottage cheese',
      'Mixed berries',
      'Honey'
    ],
    instructions: [
      'Mix cottage cheese with berries',
      'Drizzle with honey'
    ],
    nutritionalValues: {
      calories: 120,
      protein: 15,
      carbs: 12,
      fat: 3,
      fiber: 3
    },
    estimatedTime: '5 mins',
    servingSize: '1 bowl'
  },
  {
    id: 'nvn3',
    name: 'Turkey and Avocado Roll',
    description: 'Light protein wrap with turkey',
    ingredients: [
      'Turkey slice',
      '1/4 avocado',
      'Lettuce leaf'
    ],
    instructions: [
      'Layer ingredients',
      'Roll in lettuce leaf'
    ],
    nutritionalValues: {
      calories: 100,
      protein: 12,
      carbs: 5,
      fat: 6,
      fiber: 3
    },
    estimatedTime: '5 mins',
    servingSize: '1 roll'
  },
  {
    id: 'nvn4',
    name: 'Protein Yogurt',
    description: 'Greek yogurt with protein powder',
    ingredients: [
      'Greek yogurt',
      'Protein powder',
      'Cinnamon'
    ],
    instructions: [
      'Mix yogurt with protein powder',
      'Sprinkle with cinnamon'
    ],
    nutritionalValues: {
      calories: 140,
      protein: 25,
      carbs: 8,
      fat: 3,
      fiber: 0
    },
    estimatedTime: '5 mins',
    servingSize: '1 cup'
  }
];

const nonVegMorningOptions: Recipe[] = [
  {
    id: 'nvm1',
    name: 'Protein Scramble',
    description: 'High-protein breakfast with eggs and turkey',
    ingredients: [
      '3 eggs',
      '2 turkey slices',
      'Spinach',
      'Bell peppers'
    ],
    instructions: [
      'Scramble eggs',
      'Add chopped turkey',
      'Sauté vegetables',
      'Combine all ingredients'
    ],
    nutritionalValues: {
      calories: 350,
      protein: 30,
      carbs: 8,
      fat: 22,
      fiber: 3
    },
    estimatedTime: '15 mins',
    servingSize: '1 serving'
  },
  {
    id: 'nvm2',
    name: 'Chicken Breakfast Wrap',
    description: 'Whole grain wrap with chicken and eggs',
    ingredients: [
      '100g chicken breast',
      '2 eggs',
      'Whole grain wrap',
      'Avocado'
    ],
    instructions: [
      'Cook chicken',
      'Scramble eggs',
      'Assemble wrap',
      'Add sliced avocado'
    ],
    nutritionalValues: {
      calories: 420,
      protein: 35,
      carbs: 30,
      fat: 20,
      fiber: 6
    },
    estimatedTime: '20 mins',
    servingSize: '1 wrap'
  },
  {
    id: 'nvm3',
    name: 'Salmon and Eggs',
    description: 'Smoked salmon with poached eggs',
    ingredients: [
      '100g smoked salmon',
      '2 eggs',
      'Whole grain toast',
      'Herbs'
    ],
    instructions: [
      'Poach eggs',
      'Toast bread',
      'Layer salmon',
      'Top with eggs'
    ],
    nutritionalValues: {
      calories: 380,
      protein: 32,
      carbs: 20,
      fat: 22,
      fiber: 4
    },
    estimatedTime: '15 mins',
    servingSize: '1 serving'
  },
  {
    id: 'nvm4',
    name: 'Turkey Breakfast Bowl',
    description: 'Protein bowl with turkey and quinoa',
    ingredients: [
      '150g turkey',
      '1/2 cup quinoa',
      'Kale',
      'Sweet potato'
    ],
    instructions: [
      'Cook quinoa',
      'Sauté turkey',
      'Roast sweet potato',
      'Combine in bowl'
    ],
    nutritionalValues: {
      calories: 400,
      protein: 35,
      carbs: 40,
      fat: 15,
      fiber: 7
    },
    estimatedTime: '25 mins',
    servingSize: '1 bowl'
  }
];

export const predefinedDiets: DietPlan[] = [
  {
    id: 'veg-balanced-1',
    name: 'Balanced Vegetarian Plan',
    type: 'veg',
    description: 'A nutritious vegetarian meal plan rich in protein and fiber',
    sections: [
      {
        mealTime: 'morning',
        options: vegBreakfastOptions
      },
      {
        mealTime: 'lunch',
        options: vegLunchOptions
      },
      {
        mealTime: 'afternoon',
        options: vegAfternoonOptions
      },
      {
        mealTime: 'dinner',
        options: vegDinnerOptions
      },
      {
        mealTime: 'night',
        options: vegNightOptions
      }
    ],
    createdBy: 'predefined'
  },
  {
    id: 'nonveg-protein-1',
    name: 'High-Protein Non-Vegetarian Plan',
    type: 'non-veg',
    description: 'Protein-rich meal plan for muscle maintenance and growth',
    sections: [
      {
        mealTime: 'morning',
        options: nonVegMorningOptions
      },
      {
        mealTime: 'lunch',
        options: nonVegLunchOptions
      },
      {
        mealTime: 'afternoon',
        options: nonVegAfternoonOptions
      },
      {
        mealTime: 'dinner',
        options: nonVegDinnerOptions
      },
      {
        mealTime: 'night',
        options: nonVegNightOptions
      }
    ],
    createdBy: 'predefined'
  }
];
