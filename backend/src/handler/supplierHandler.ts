import { type Request, type Response } from "express";
import supplierServiceModel from "../model/supplierService/supplier.js";
import { getCategoryByName } from "../model/categoryService/category.js";
import { Supplier } from "../model/supplierService/supplierSchema.js";
import type { Types } from "mongoose";

// CREATE SUPPLIER
export const createSupplierHandler = async (req: Request, res: Response) => {
  try {
    const {
      supplierName,
      supplierEmail,
      supplierContact,
      supplierAddress,
      supplierStatus,
      categoryName,
    } = req.body;

    const categoryNameTrimed = categoryName.trim();
    console.log(categoryNameTrimed);

    const findCategory = await getCategoryByName(categoryNameTrimed);
    if (!findCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    const categoryId = findCategory._id;
    if (
      !supplierName ||
      !supplierEmail ||
      !supplierContact ||
      !supplierAddress ||
      !supplierStatus ||
      !categoryId
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const createdSupplier = await supplierServiceModel.createSupplier({
      supplierName,
      supplierEmail,
      supplierContact,
      supplierAddress,
      supplierStatus,
      categoryId,
      categoryName,
    });

    if (!createdSupplier) {
      return res.status(400).json({ message: "Supplier not created" });
    }

    return res.status(201).json({
      message: "Supplier created successfully",
      supplier: createdSupplier,
    });
  } catch (error) {
    console.error("Error creating supplier:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// GET ALL SUPPLIERS
export const getSuppliersHandler = async (req: Request, res: Response) => {
  try {
    const supplier = await supplierServiceModel.getSupplier();

    if (!supplier || supplier.length === 0) {
      return res.status(404).json({ message: "No suppliers found" });
    }

    return res.status(200).json({
      message: "Suppliers fetched successfully",
      supplier,
    });
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// delete suppliers

export const deleteSupplierHandler = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!id || id === undefined) {
      console.log("id is required");
      return null;
    }
    const findSupplier = await supplierServiceModel.getSupplierById(id);
    if (!findSupplier) {
      return res.status(404).json({
        message: "Supplier not found",
      });
    }
    const deleteSupplier = await supplierServiceModel.deleteSupplier(id);
    if (deleteSupplier) {
      return res.status(201).json({ Message: "supplier deleted successfully" });
    }
  } catch (error) {
    console.log("error while deleting supplier", error);
  }
};

// Update supplier

export const updateSupplier = async (req: Request, res: Response) => {
  try {
    const {
      supplierName,
      supplierEmail,
      supplierAddress,
      supplierContact,
      supplierStatus,
      categoryName,
    } = req.body;
    const { id } = req.params;
    if (!id && id === undefined) {
      console.log("supplier id is required");
      return null;
    }
    const findSupplier = await supplierServiceModel.getSupplierById(id);
    if (!findSupplier) {
      return res.status(404).json({ messsage: "supplier not found" });
    }

    const updatedSupplier = await supplierServiceModel.updateSupplier(id, {
      supplierName,
      supplierAddress,
      supplierEmail,
      supplierContact,
      supplierStatus,
      categoryName,
    });
    if (!updatedSupplier) {
      return res
        .status(401)
        .json({ messsage: "supplier could not be updated" });
    }
    return res.status(201).json({
      message: "updated successfully",
    });
  } catch (error) {
    console.log("error while deleting supplier", error);
    res.status(500).json({ message: "interenal server error" });
  }
};
