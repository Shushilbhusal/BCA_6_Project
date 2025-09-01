import type { Request, Response } from "express";
import supplierServiceModel from "../model/supplierService/supplier.js";
import { getAllCategories } from "../model/categoryService/category.js";

export const getProduct = async(req:Request, res:Response)=>{
     try {
    const suppliers = await supplierServiceModel.getSupplier();

    if (!suppliers || suppliers.length === 0) {
      return res.status(404).json({ message: "No suppliers found" });
    }

    const categories = await getAllCategories();

    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }
    console.log(categories);
    console.log(suppliers);
     
    return res.status(200).json({
      message: "Suppliers fetched successfully",
      suppliers,
      categories
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

