"use client";

import { Expense } from "./Expenses";

export default function ExpenseList({
  expenses,
  members,
}: {
  expenses: Expense[];
  members: string[];
}) {
  if (expenses.length === 0) {
    return (
      <p className="text-slate-500 text-sm text-center">
        No expenses added yet
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {expenses.map((exp) => {
        const split = exp.amount / exp.participants.length;

        return (
          <div
            key={exp.id}
            className="bg-slate-900 border border-slate-800 rounded-lg p-4 space-y-1"
          >
            <div className="flex justify-between">
              <p className="font-medium">{exp.title}</p>
              <p>₹{exp.amount}</p>
            </div>

            <p className="text-xs text-slate-400">
              Paid by {exp.paidBy} · Each owes ₹{split.toFixed(2)}
            </p>
          </div>
        );
      })}
    </div>
  );
}