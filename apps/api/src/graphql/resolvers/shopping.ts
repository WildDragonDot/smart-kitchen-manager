import { Context, requireKitchenAccess } from '../context';

export const shoppingResolvers = {
  Query: {
    shoppingLists: async (_: any, { kitchenId }: any, context: Context) => {
      await requireKitchenAccess(context, kitchenId);
      
      return context.prisma.shoppingList.findMany({
        where: { kitchenId },
        orderBy: { createdAt: 'desc' },
      });
    },

    shoppingList: async (_: any, { id }: any, context: Context) => {
      const list = await context.prisma.shoppingList.findUnique({
        where: { id },
      });

      if (!list) {
        throw new Error('Shopping list not found');
      }

      await requireKitchenAccess(context, list.kitchenId);
      return list;
    },
  },

  Mutation: {
    createShoppingList: async (_: any, { input }: any, context: Context) => {
      const { kitchenId, ...listData } = input;
      
      await requireKitchenAccess(context, kitchenId, 'MEMBER');

      return context.prisma.shoppingList.create({
        data: {
          ...listData,
          kitchenId,
        },
      });
    },

    updateShoppingList: async (_: any, { id, title, description }: any, context: Context) => {
      const list = await context.prisma.shoppingList.findUnique({
        where: { id },
      });

      if (!list) {
        throw new Error('Shopping list not found');
      }

      await requireKitchenAccess(context, list.kitchenId, 'MEMBER');

      const updateData: any = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;

      return context.prisma.shoppingList.update({
        where: { id },
        data: updateData,
      });
    },

    deleteShoppingList: async (_: any, { id }: any, context: Context) => {
      const list = await context.prisma.shoppingList.findUnique({
        where: { id },
      });

      if (!list) {
        throw new Error('Shopping list not found');
      }

      await requireKitchenAccess(context, list.kitchenId, 'MEMBER');

      await context.prisma.shoppingList.delete({
        where: { id },
      });

      return true;
    },

    createShoppingListItem: async (_: any, { input }: any, context: Context) => {
      const { listId, ...itemData } = input;
      
      const list = await context.prisma.shoppingList.findUnique({
        where: { id: listId },
      });

      if (!list) {
        throw new Error('Shopping list not found');
      }

      await requireKitchenAccess(context, list.kitchenId, 'MEMBER');

      return context.prisma.shoppingListItem.create({
        data: {
          ...itemData,
          listId,
        },
      });
    },

    updateShoppingListItem: async (_: any, { id, isPurchased, price }: any, context: Context) => {
      const item = await context.prisma.shoppingListItem.findUnique({
        where: { id },
        include: { list: true },
      });

      if (!item) {
        throw new Error('Shopping list item not found');
      }

      await requireKitchenAccess(context, item.list.kitchenId, 'MEMBER');

      const updateData: any = {};
      if (isPurchased !== undefined) updateData.isPurchased = isPurchased;
      if (price !== undefined) updateData.price = price;

      return context.prisma.shoppingListItem.update({
        where: { id },
        data: updateData,
      });
    },

    deleteShoppingListItem: async (_: any, { id }: any, context: Context) => {
      const item = await context.prisma.shoppingListItem.findUnique({
        where: { id },
        include: { list: true },
      });

      if (!item) {
        throw new Error('Shopping list item not found');
      }

      await requireKitchenAccess(context, item.list.kitchenId, 'MEMBER');

      await context.prisma.shoppingListItem.delete({
        where: { id },
      });

      return true;
    },
  },
};