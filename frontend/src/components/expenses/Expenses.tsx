"use client";

import { useState } from "react";
import AddExpenseForm from "./AddExpenseForm";
import ExpenseList from "./ExpenseList";

export type Expense = {
  id: string;
  title: string;
  amount: number;
  paidBy: string;
  participants: string[];
};

const MEMBERS = ["You", "Alice", "Bob"];

export default function Expenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);

  function addExpense(expense: Expense) {
    setExpenses((prev) => [...prev, expense]);
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
      <AddExpenseForm members={MEMBERS} onAdd={addExpense} />
      <ExpenseList expenses={expenses} members={MEMBERS} />
    </div>
  );
}