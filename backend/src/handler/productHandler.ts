import type { Request, Response } from "express";
import supplierServiceModel from "../model/supplierService/supplier.js";
import {
  getAllCategories,
  getCategoryByName,
} from "../model/categoryService/category.js";
import {
  createProductService,
  deleteProductService,
  getAllProducts,
  getProductById,
  updateProductService,
} from "../model/productService/product.js";
import { uploadToCloudinary } from "../utils/uploadTocloudinary.js";

//  Fetch suppliers and categories
export const getProduct = async (req: Request, res: Response) => {
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
      productName,
      productDescription,
      productPrice,
      productStock,
      productCategory,
      productSupplier,
    } = req.body;

    // Validate input
    if (
      !productName ||
      !productDescription ||
      !productPrice ||
      !productStock ||
      !productCategory ||
      !productSupplier
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    console.log("request body", req.body);

    //  Find supplier
    const findSupplier = await supplierServiceModel.getSupplierByName(
      productSupplier.trim().replace(/"/g, "")
    );
    console.log("find supplier", findSupplier);
    if (!findSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    // Find category
    const findCategory = await getCategoryByName(
      productCategory.trim().replace(/"/g, "")
    );
    console.log("find category", findCategory);
    if (!findCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    //  Convert numeric fields
    const productPriceNumber = Number(productPrice);
    const productStockNumber = Number(productStock);

    if (isNaN(productPriceNumber) || isNaN(productStockNumber)) {
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
      productName,
      productDescription,
      productPrice: productPriceNumber,
      productStock: productStockNumber,
      categoryId: findCategory._id, // ensure this exists
      supplierId: findSupplier._id, // ensure this exists
      categoryName: findCategory.categoryName ?? "",
      supplierName: findSupplier.supplierName ?? "",
      productImage: uploadedImageUrl,
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
      productName,
      productDescription,
      productPrice,
      productStock,
      productCategory,
      productSupplier,
    } = req.body;

    const productId = req.params.id;
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
      !productName ||
      !productDescription ||
      !productPrice ||
      !productStock ||
      !productCategory ||
      !productSupplier
    ) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Clean category & supplier names
    const cleanCategory = productCategory.replace(/^"|"$/g, "").trim();
    const cleanSupplier = productSupplier.replace(/^"|"$/g, "").trim();

    // Find supplier
    const findSupplier = await supplierServiceModel.getSupplierByName(
      cleanSupplier
    );
    if (!findSupplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }

    if (findSupplier.supplierName !== existingProduct.supplierName) {
    }

    // Find category
    const findCategory = await getCategoryByName(cleanCategory);
    if (!findCategory) {
      return res.status(404).json({ message: "Category not found" });
    }

    // Handle image
    let productImage = (existingProduct as any).productImage; // fallback to old image
    if (req.file?.path) {
      const uploaded = await uploadToCloudinary(req.file.path);
      if (!uploaded) {
        return res.status(400).json({ message: "Image upload failed" });
      }
      productImage = uploaded;
    }

    // Update product
    console.log("data to update", {
      productName,
      productDescription,
      productPrice: Number(productPrice),
      productStock: Number(productStock),
      categoryId: findCategory._id, // check your schema field name
      supplierId: findSupplier._id, // check your schema field name
      productImage,
      categoryName: findCategory.categoryName ?? "",
      supplierName: findSupplier.supplierName ?? "",
    });
    const updatedProduct = await updateProductService(productId, {
      productName,
      productDescription,
      productPrice: Number(productPrice),
      productStock: Number(productStock),
      categoryId: findCategory._id,
      supplierId: findSupplier._id,
      productImage,
      categoryName: findCategory.categoryName ?? "",
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
