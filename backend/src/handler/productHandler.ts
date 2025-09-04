import type { Request, Response } from "express";
import supplierServiceModel from "../model/supplierService/supplier.js";

import {
  createProductService,
  deleteProductService,
  getAllProducts,
  getProductById,
  updateProductService,
} from "../model/productService/product.js";
import { uploadToCloudinary } from "../utils/uploadTocloudinary.js";
import { getAllCategories, getCategoryById, getCategoryByName } from "../model/categoryService/category.js";

//  Fetch suppliers and categories
export const getSupplierAndcategoryNameHandler = async (req: Request, res: Response) => {
  try {
    const suppliers = await supplierServiceModel.getSupplier();
    if (!suppliers || suppliers.length === 0) {
      return res.status(404).json({ message: "No suppliers found" });
    }

    const categories = await getAllCategories();
    if (!categories || categories.length === 0) {
      return res.status(404).json({ message: "No categories found" });
    }

    return res.status(200).json({
      message: "Suppliers and categories fetched successfully",
      suppliers,
      categories,
    });
  } catch (error) {
    console.error("Error fetching suppliers and categories:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Fetch all products
export const getProductHandler = async (req: Request, res: Response) => {
  try {
    console.log("hello world")
    const products = await getAllProducts();
    if (!products || products.length === 0) {
      return res.status(404).json({ message: "No products found" });
    }
    return res
      .status(200)
      .json({ message: "Products fetched successfully", products });
  } catch (error) {
    console.error("Error fetching products:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Add a new product

export const addProductHandler = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      categoryName,
      supplierName,
    } = req.body;

    // Validate input
    if (
      !name ||
      !description ||
      !price ||
      !stock ||
      !categoryName ||
      !supplierName
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("request body", req.body);

    //  Find supplier
    console.log("product supplier", supplierName);
    const findSupplier = await supplierServiceModel.getSupplierById(
      supplierName.trim().replace(/"/g, "")
    );
    console.log("find supplier", findSupplier);
    if (!findSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Find categoryName
    const findcategoryName = await getCategoryById(
      categoryName.trim().replace(/"/g, "")
    );
    console.log("find categoryName", findcategoryName);
    if (!findcategoryName) {
      return res.status(404).json({ message: "categoryName not found" });
    }

    //  Convert numeric fields
    const priceNumber = Number(price);
    const stockNumber = Number(stock);

    if (isNaN(priceNumber) || isNaN(stockNumber)) {
      return res
        .status(400)
        .json({ message: "Price and stock must be valid numbers" });
    }

    // Handle image
    const imageUrl = req.file?.path;
    if (!imageUrl) {
      return res.status(400).json({ message: "Image not uploaded" });
    }

    const uploadedImageUrl = await uploadToCloudinary(imageUrl);
    if (!uploadedImageUrl) {
      return res.status(400).json({ message: "Image upload failed" });
    }

    //  Create product
    const product = await createProductService({
      name,
      description,
      price: priceNumber,
      stock: stockNumber,
      categoryId: findcategoryName._id, // ensure this exists
      supplierId: findSupplier._id, // ensure this exists
      categoryName: findcategoryName.categoryName ?? "",
      supplierName: findSupplier.supplierName ?? "",
      image: uploadedImageUrl,
    });

    return res
      .status(201)
      .json({ message: "Product created successfully", product });
  } catch (error: any) {
    console.error("Error while creating product:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export const updateProductHandler = async (req: Request, res: Response) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      categoryName,
      supplierName,
    } = req.body;

    const productId = req.params.id;
    console.log("................product id", productId, "req body", req.body);
    if (!productId) {
      return res.status(400).json({ message: "Product id is required" });
    }

    // Check if product exists
    const existingProduct = await getProductById(productId);
    if (!existingProduct) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Validate required fields
    if (
      !name ||
      !description ||
      !price ||
      !stock ||
      !categoryName ||
      !supplierName
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Clean categoryName & supplier names
    const cleancategoryName = categoryName.replace(/^"|"$/g, "").trim();
    const cleanSupplier = supplierName.replace(/^"|"$/g, "").trim();

 
    // Find supplier
    const findSupplier = await supplierServiceModel.getSupplierById(
      cleanSupplier
    );
    if (!findSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

   

    // Find categoryName
    const findcategoryName = await getCategoryById(cleancategoryName);
    if (!findcategoryName) {
      return res.status(404).json({ message: "categoryName not found" });
    }

    // Handle image
    let image = (existingProduct as any).image; // fallback to old image
    if (req.file?.path) {
      const uploaded = await uploadToCloudinary(req.file.path);
      if (!uploaded) {
        return res.status(400).json({ message: "Image upload failed" });
      }
      image = uploaded;
    }

    // Update product
    console.log("data to update", {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      categoryNameId: findcategoryName._id, // check your schema field name
      supplierId: findSupplier._id, // check your schema field name
      image,
      categoryName: findcategoryName.categoryName ?? "",
      supplierName: findSupplier.supplierName ?? "",
    });
    const updatedProduct = await updateProductService(productId, {
      name,
      description,
      price: Number(price),
      stock: Number(stock),
      categoryId: findcategoryName._id,
      supplierId: findSupplier._id,
      image,
      categoryName: findcategoryName.categoryName ?? "",
      supplierName: findSupplier.supplierName ?? "",
    });

    console.log("updated product", updatedProduct);

    if (!updatedProduct) {
      return res.status(404).json({ message: "Product update failed" });
    }

    return res.status(200).json({
      message: "Product updated successfully",
      product: updatedProduct,
    });
  } catch (error) {
    console.error("Error updating product:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// delete product
export const deleteProductHandler = async (req: Request, res: Response) => {
  try {
    const productId = req.params.id;
    if (!productId) {
      console.log("product id is required");
      return;
    }
    const product = await deleteProductService(productId);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    return res
      .status(200)
      .json({ message: "Product deleted successfully", product });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
