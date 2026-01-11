import { v4 as uuid } from "uuid";
import { expenses, expenseSplits } from "./expense.store";
import { Expense } from "./expense.types";
import { broadcastToTrip } from "../realtime/broadcast";

/**
 * Add expense with equal or custom split
 */
export function addExpense({
  tripId,
  title,
  amount,
  paidBy,
  splits,
}: {
  tripId: string;
  title: string;
  amount: number;
  paidBy: string;
  splits: { userId: string; amount: number }[];
}) {
  const totalSplit = splits.reduce((s, x) => s + x.amount, 0);
  if (totalSplit !== amount) {
    throw new Error("SPLIT_AMOUNT_MISMATCH");
  }

  const expense: Expense = {
    id: uuid(),
    tripId,
    title,
    amount,
    paidBy,
    createdAt: new Date().toISOString(),
  };

  
  expenses.push(expense);
  
  broadcastToTrip(tripId, {
    type: "EXPENSE_ADDED",
    expense,
  });

  splits.forEach((s) => {
    expenseSplits.push({
      expenseId: expense.id,
      userId: s.userId,
      amount: s.amount,
    });
  });

  return expense;
}

/**
 * Calculate balances per user
 */
export function calculateBalances(tripId: string) {
  const balanceMap: Record<string, number> = {};

  // initialize
  expenseSplits.forEach((s) => {
    if (!balanceMap[s.userId]) balanceMap[s.userId] = 0;
  });

  expenses
    .filter((e) => e.tripId === tripId)
    .forEach((expense) => {
      balanceMap[expense.paidBy] =
        (balanceMap[expense.paidBy] || 0) + expense.amount;

      expenseSplits
        .filter((s) => s.expenseId === expense.id)
        .forEach((s) => {
          balanceMap[s.userId] -= s.amount;
        });
    });

  return balanceMap;
}

/**
 * Who owes whom (net settlement)
 */
export function calculateSettlements(tripId: string) {
  const balances = calculateBalances(tripId);

  const debtors: { userId: string; amount: number }[] = [];
  const creditors: { userId: string; amount: number }[] = [];

  Object.entries(balances).forEach(([userId, amount]) => {
    if (amount < 0) debtors.push({ userId, amount: -amount });
    if (amount > 0) creditors.push({ userId, amount });
  });

  const settlements: {
    from: string;
    to: string;
    amount: number;
  }[] = [];

  let i = 0,
    j = 0;

  while (i < debtors.length && j < creditors.length) {
    const pay = Math.min(debtors[i].amount, creditors[j].amount);

    settlements.push({
      from: debtors[i].userId,
      to: creditors[j].userId,
      amount: pay,
    });

    debtors[i].amount -= pay;
    creditors[j].amount -= pay;

    if (debtors[i].amount === 0) i++;
    if (creditors[j].amount === 0) j++;
  }

  return settlements;
}