export type Expense = {
  id: string;
  tripId: string;
  title: string;
  amount: number;
  paidBy: string;
  createdAt: string;
};

export type ExpenseSplit = {
  expenseId: string;
  userId: string;
  amount: number;
};