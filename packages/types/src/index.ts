export type ItemStatus = 'ok' | 'low' | 'expiring' | 'expired';

export interface InventoryItem {
  id: string;
  name: string;
  qty: number;
  unit: string;
  category: string;
  status: ItemStatus;
  expiry: string;
  img?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  qty?: string;
  checked: boolean;
}

export interface Expense {
  id: string;
  type: 'Ration' | 'Food Order' | 'Other';
  amount: number;
  date: string;
  vendor?: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  type: string;
}
