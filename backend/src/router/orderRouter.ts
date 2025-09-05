import { Router } from "express";
import { createOrderHandler } from "../handler/orderHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const orderRouter = Router();

// orderRouter.get('/get', getOrderHandler);
orderRouter.post('/create',authMiddleware, createOrderHandler);
// orderRouter.put('/update', updateOrderHandler);
// orderRouter.delete('/delete', deleteOrderHandler);

export { orderRouter}