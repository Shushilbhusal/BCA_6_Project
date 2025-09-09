import { Router } from "express";
import { addExpense, getExpensesByMonth } from "../handler/expenseTracker.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const expenseTrackerRouter = Router();

expenseTrackerRouter.post("/add", authMiddleware, addExpense);
expenseTrackerRouter.get("/getExpensesByMonth", getExpensesByMonth);

export { expenseTrackerRouter };