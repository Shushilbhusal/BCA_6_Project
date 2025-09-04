import { Router } from "express";
import { addProductHandler, deleteProductHandler,  getProductHandler, getSupplierAndcategoryNameHandler, updateProductHandler } from "../handler/productHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";
import { upload } from "../utils/multerConfig.js";

const productRouter = Router();

productRouter.get("/get", getSupplierAndcategoryNameHandler);
productRouter.get("/getAllProducts", getProductHandler);
productRouter.post("/create", upload.single("image"), addProductHandler);
productRouter.put("/update/:id",  upload.single("image"), updateProductHandler);
productRouter.delete("/delete/:id", deleteProductHandler);


export { productRouter };