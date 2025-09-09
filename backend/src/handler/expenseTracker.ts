// controllers/expenseController.ts
import  type{ Request, Response } from "express";
import { Expense } from "../model/expenseTracker.ts/model.js";


// Add new expense/revenue
export const addExpense = async (req: Request, res: Response) => {
  try {
    const { description, amount, date, type } = req.body;

    if (!description || !amount || !date || !type) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const newExpense = new Expense({ description, amount, date, type });
    await newExpense.save();

    return res.status(201).json({ message: "Data added successfully", data: newExpense });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

// Get aggregated data by month
export const getExpensesByMonth = async (req: Request, res: Response) => {
  try {
    const expenses = await Expense.find({}).sort({ date: 1 });

    const dataByMonth = expenses.reduce((acc: any, expense: any) => {
      const month = expense.date.getMonth(); // 0 = Jan, 11 = Dec
      if (!acc[month]) {
        acc[month] = { expenses: 0, revenue: 0, profit: 0, loss: 0 };
      }

      if (expense.type === "expenses") {
        acc[month].expenses += expense.amount;
      } else if (expense.type === "revenue") {
        acc[month].revenue += expense.amount;
      }

      // Calculate profit & loss dynamically
      acc[month].profit = Math.max(0, acc[month].revenue - acc[month].expenses);
      acc[month].loss = Math.max(0, acc[month].expenses - acc[month].revenue);

      return acc;
    }, {});

    return res.status(200).json(dataByMonth);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
