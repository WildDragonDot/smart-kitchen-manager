import OpenAI from 'openai';

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

export interface RecipeGenerationInput {
  availableIngredients: string[];
  cuisine?: string;
  prepTime?: number;
  dietary?: string[];
}

export interface GeneratedRecipe {
  title: string;
  ingredients: any;
  steps: any;
  cuisine?: string;
  prepTime?: number;
  calories?: number;
  difficulty?: string;
  servings?: number;
}

export async function generateRecipeWithAI(input: RecipeGenerationInput): Promise<GeneratedRecipe> {
  const { availableIngredients, cuisine, prepTime, dietary } = input;

  const prompt = `
Generate a recipe using the following available ingredients: ${availableIngredients.join(', ')}.

Requirements:
${cuisine ? `- Cuisine: ${cuisine}` : ''}
${prepTime ? `- Preparation time: Maximum ${prepTime} minutes` : ''}
${dietary && dietary.length > 0 ? `- Dietary restrictions: ${dietary.join(', ')}` : ''}

Please provide a JSON response with the following structure:
{
  "title": "Recipe Name",
  "ingredients": [
    {
      "name": "ingredient name",
      "amount": "quantity",
      "unit": "unit",
      "available": true/false
    }
  ],
  "steps": [
    {
      "step": 1,
      "instruction": "detailed instruction",
      "time": "time in minutes"
    }
  ],
  "cuisine": "cuisine type",
  "prepTime": number_in_minutes,
  "calories": estimated_calories_per_serving,
  "difficulty": "Easy/Medium/Hard",
  "servings": number_of_servings,
  "tips": ["cooking tip 1", "cooking tip 2"],
  "missingIngredients": ["ingredient1", "ingredient2"]
}

Focus on creating a practical, delicious recipe that maximizes the use of available ingredients.
`;

  if (!openai) {
    throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a professional chef and recipe developer. Create practical, delicious recipes based on available ingredients. Always respond with valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI');
    }

    // Parse the JSON response
    const recipe = JSON.parse(content);
    
    return {
      title: recipe.title,
      ingredients: recipe.ingredients,
      steps: recipe.steps,
      cuisine: recipe.cuisine,
      prepTime: recipe.prepTime,
      calories: recipe.calories,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    
    // Fallback recipe if AI fails
    return {
      title: 'Simple Stir Fry',
      ingredients: availableIngredients.slice(0, 5).map(ingredient => ({
        name: ingredient,
        amount: '1',
        unit: 'cup',
        available: true,
      })),
      steps: [
        {
          step: 1,
          instruction: 'Heat oil in a pan',
          time: '2 minutes',
        },
        {
          step: 2,
          instruction: 'Add ingredients and stir fry',
          time: '8 minutes',
        },
        {
          step: 3,
          instruction: 'Season and serve hot',
          time: '1 minute',
        },
      ],
      cuisine: cuisine || 'International',
      prepTime: 15,
      calories: 250,
    };
  }
}

export async function scanImageWithAI(imageUrl: string, scanType: string): Promise<any> {
  try {
    let prompt = '';
    
    switch (scanType) {
      case 'inventory':
        prompt = `
Analyze this image and identify all food items, ingredients, or kitchen products visible.
For each item, provide:
- name: clear, specific name
- category: food category (vegetables, fruits, dairy, grains, etc.)
- quantity: estimated quantity if visible
- unit: appropriate unit (kg, pieces, bottles, etc.)
- expiry: estimated expiry date if visible or typical shelf life
- location: suggested storage location (fridge, pantry, freezer)

Return as JSON array of items.
`;
        break;
        
      case 'receipt':
        prompt = `
Analyze this receipt/bill image and extract:
- vendor: store/restaurant name
- date: purchase date
- total: total amount
- items: array of purchased items with names, quantities, and prices
- category: type of purchase (grocery, restaurant, etc.)

Return as JSON object.
`;
        break;
        
      case 'recipe':
        prompt = `
Analyze this image of food/dish and provide:
- dishName: name of the dish
- ingredients: list of visible ingredients
- cuisine: type of cuisine
- difficulty: estimated difficulty level
- estimatedTime: preparation time

Return as JSON object.
`;
        break;
        
      default:
        prompt = 'Analyze this image and describe what you see in JSON format.';
    }

    if (!openai) {
      throw new Error('OpenAI API key not configured. Please set OPENAI_API_KEY environment variable.');
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4-vision-preview',
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: prompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No response from AI vision');
    }

    try {
      return JSON.parse(content);
    } catch {
      // If JSON parsing fails, return the raw content
      return { 
        raw: content, 
        confidence: 0.5,
        scanType,
      };
    }
  } catch (error) {
    console.error('AI vision scan error:', error);
    
    // Return a fallback result
    return {
      error: 'AI scan failed',
      confidence: 0,
      scanType,
      fallback: true,
    };
  }
}

export async function processAIScanResult(rawResult: any, scanType: string): Promise<any> {
  // Process and enhance the AI scan result
  // This could include validation, data cleaning, confidence scoring, etc.
  
  try {
    switch (scanType) {
      case 'inventory':
        return processInventoryScan(rawResult);
      case 'receipt':
        return processReceiptScan(rawResult);
      case 'recipe':
        return processRecipeScan(rawResult);
      default:
        return rawResult;
    }
  } catch (error) {
    console.error('Processing AI scan result failed:', error);
    return rawResult;
  }
}

function processInventoryScan(result: any): any {
  if (Array.isArray(result)) {
    return result.map(item => ({
      ...item,
      confidence: item.confidence || 0.8,
      processed: true,
      suggestions: {
        emoji: getEmojiForItem(item.name),
        category: normalizeCategory(item.category),
        storageLocation: item.location || 'PANTRY',
      },
    }));
  }
  return result;
}

function processReceiptScan(result: any): any {
  return {
    ...result,
    processed: true,
    confidence: result.confidence || 0.7,
    normalizedItems: result.items?.map((item: any) => ({
      ...item,
      category: categorizeReceiptItem(item.name),
    })) || [],
  };
}

function processRecipeScan(result: any): any {
  return {
    ...result,
    processed: true,
    confidence: result.confidence || 0.6,
    suggestions: {
      similarRecipes: [], // Could be populated from database
      missingIngredients: [],
    },
  };
}

function getEmojiForItem(itemName: string): string {
  const name = itemName.toLowerCase();
  
  if (name.includes('rice')) return '🌾';
  if (name.includes('milk')) return '🥛';
  if (name.includes('tomato')) return '🍅';
  if (name.includes('onion')) return '🧅';
  if (name.includes('potato')) return '🥔';
  if (name.includes('carrot')) return '🥕';
  if (name.includes('apple')) return '🍎';
  if (name.includes('banana')) return '🍌';
  if (name.includes('bread')) return '🍞';
  if (name.includes('egg')) return '🥚';
  if (name.includes('chicken')) return '🍗';
  if (name.includes('fish')) return '🐟';
  if (name.includes('oil')) return '🛢️';
  if (name.includes('sugar')) return '🍬';
  if (name.includes('salt')) return '🧂';
  
  return '🥫'; // Default
}

function normalizeCategory(category: string): string {
  const cat = category?.toLowerCase() || '';
  
  if (cat.includes('vegetable')) return 'Vegetables';
  if (cat.includes('fruit')) return 'Fruits';
  if (cat.includes('dairy')) return 'Dairy';
  if (cat.includes('meat') || cat.includes('protein')) return 'Protein';
  if (cat.includes('grain') || cat.includes('cereal')) return 'Grains';
  if (cat.includes('spice') || cat.includes('seasoning')) return 'Spices';
  if (cat.includes('beverage') || cat.includes('drink')) return 'Beverages';
  if (cat.includes('snack')) return 'Snacks';
  
  return 'Pantry'; // Default
}

function categorizeReceiptItem(itemName: string): string {
  // Similar logic to normalizeCategory but for receipt items
  return normalizeCategory(itemName);
}