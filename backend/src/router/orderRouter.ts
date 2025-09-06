import { Router } from "express";
import { createOrderHandler, deleteOrderHandler, getAllorderHandler, getAllorderHandlerAdmin } from "../handler/orderHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const orderRouter = Router();

orderRouter.get('/get',authMiddleware, getAllorderHandler);
orderRouter.post('/create',authMiddleware, createOrderHandler);
orderRouter.delete('/delete/:id',authMiddleware, deleteOrderHandler);

orderRouter.get('/get/allorders', getAllorderHandlerAdmin);

// orderRouter.put('/update', updateOrderHandler);
// orderRouter.delete('/delete', deleteOrderHandler);

export { orderRouter}