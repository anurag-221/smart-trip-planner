"use client";

import { useState } from "react";
import { Expense } from "./Expenses";

export default function AddExpenseForm({
  members,
  onAdd,
}: {
  members: string[];
  onAdd: (expense: Expense) => void;
}) {
  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [paidBy, setPaidBy] = useState(members[0]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!title || !amount) return;

    onAdd({
      id: crypto.randomUUID(),
      title,
      amount: Number(amount),
      paidBy,
      participants: members,
    });

    setTitle("");
    setAmount("");
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-4"
    >
      <h3 className="font-semibold">Add Expense</h3>

      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Expense title"
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
      />

      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        placeholder="Amount"
        inputMode="numeric"
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
      />

      <select
        value={paidBy}
        onChange={(e) => setPaidBy(e.target.value)}
        className="w-full bg-slate-800 border border-slate-700 rounded px-3 py-2 text-sm"
      >
        {members.map((m) => (
          <option key={m}>{m}</option>
        ))}
      </select>

      <button className="w-full bg-emerald-600 rounded py-2 text-sm hover:bg-emerald-500">
        Add Expense
      </button>
    </form>
  );
}