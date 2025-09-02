import { Router } from "express";
import { createSupplierHandler, deleteSupplierHandler, getSuppliersHandler, updateSupplier } from "../handler/supplierHandler.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

const supplierRouter = Router();

supplierRouter.post("/create", authMiddleware, createSupplierHandler);
supplierRouter.get("/get", getSuppliersHandler);
supplierRouter.delete("/delete/:id", authMiddleware, deleteSupplierHandler);
supplierRouter.put("/update/:id", updateSupplier);

export { supplierRouter };