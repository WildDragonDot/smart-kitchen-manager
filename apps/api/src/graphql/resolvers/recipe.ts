import { Context, requireKitchenAccess } from '../context';
import { generateRecipeWithAI } from '../../services/ai';

export const recipeResolvers: any = {
  Query: {
    recipeHistory: async (_: any, { kitchenId }: any, context: Context) => {
      if (kitchenId) {
        await requireKitchenAccess(context, kitchenId);
      }
      
      return context.prisma.recipeHistory.findMany({
        where: kitchenId ? { kitchenId } : {},
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    },

    generateRecipe: async (_: any, { input }: any, context: Context) => {
      const { kitchenId, availableIngredients, cuisine, prepTime, dietary } = input;
      
      await requireKitchenAccess(context, kitchenId, 'MEMBER');

      try {
        const recipe = await generateRecipeWithAI({
          availableIngredients,
          cuisine,
          prepTime,
          dietary,
        });

        // Save to history
        await context.prisma.recipeHistory.create({
          data: {
            kitchenId,
            title: recipe.title,
            ingredients: recipe.ingredients,
            steps: recipe.steps,
            cuisine: recipe.cuisine,
            prepTime: recipe.prepTime,
            calories: recipe.calories,
            source: 'AI',
          },
        });

        return recipe;
      } catch (error) {
        console.error('Recipe generation failed:', error);
        throw new Error('Failed to generate recipe. Please try again.');
      }
    },
  },

  Mutation: {
    // Recipe mutations can be added here if needed
    // For example: saveRecipe, favoriteRecipe, etc.
  },
};