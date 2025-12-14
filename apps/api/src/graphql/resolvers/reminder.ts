import { Context, requireKitchenAccess } from '../context';

export const reminderResolvers: any = {
  Query: {
    reminders: async (_: any, { kitchenId }: any, context: Context) => {
      await requireKitchenAccess(context, kitchenId);
      
      return context.prisma.reminder.findMany({
        where: { kitchenId },
        orderBy: { scheduledAt: 'asc' },
      });
    },

    upcomingReminders: async (_: any, { kitchenId, days = 7 }: any, context: Context) => {
      await requireKitchenAccess(context, kitchenId);
      
      const now = new Date();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + days);

      return context.prisma.reminder.findMany({
        where: {
          kitchenId,
          scheduledAt: {
            gte: now,
            lte: futureDate,
          },
          isCompleted: false,
        },
        orderBy: { scheduledAt: 'asc' },
      });
    },
  },

  Mutation: {
    createReminder: async (_: any, { input }: any, context: Context) => {
      const { kitchenId, ...reminderData } = input;
      
      await requireKitchenAccess(context, kitchenId, 'MEMBER');

      return context.prisma.reminder.create({
        data: {
          ...reminderData,
          kitchenId,
        },
      });
    },

    updateReminder: async (_: any, { id, isCompleted }: any, context: Context) => {
      const reminder = await context.prisma.reminder.findUnique({
        where: { id },
      });

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      await requireKitchenAccess(context, reminder.kitchenId, 'MEMBER');

      return context.prisma.reminder.update({
        where: { id },
        data: { isCompleted },
      });
    },

    deleteReminder: async (_: any, { id }: any, context: Context) => {
      const reminder = await context.prisma.reminder.findUnique({
        where: { id },
      });

      if (!reminder) {
        throw new Error('Reminder not found');
      }

      await requireKitchenAccess(context, reminder.kitchenId, 'MEMBER');

      await context.prisma.reminder.delete({
        where: { id },
      });

      return true;
    },
  },
};