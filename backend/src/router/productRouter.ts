import { Router } from "express";
import { addProductHandler, deleteProductHandler, getProduct, getProductHandler, updateProductHandler } from "../handler/productHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../utils/multerConfig.js";
import { deleteCategoryHandler } from "../handler/categoryHandler.js";

const productRouter = Router();

productRouter.get("/get", authMiddleware, getProduct);
productRouter.get("/getAll", getProductHandler);
productRouter.post("/create", upload.single("productImage"), addProductHandler);
productRouter.put("/update/:id",  upload.single("productImage"), updateProductHandler);
productRouter.delete("/delete/:id", deleteProductHandler);


export { productRouter };