import { Router } from "express";
import { getProduct } from "../handler/productHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const productRouter = Router();

productRouter.get("/get",  getProduct);

export { productRouter };