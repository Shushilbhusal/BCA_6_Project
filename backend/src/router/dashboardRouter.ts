import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { getDataHandler } from "../handler/getDataHandler.js";

const dashboardRouter = Router();

dashboardRouter.get("/dashboard", authMiddleware, getDataHandler);

export { dashboardRouter };