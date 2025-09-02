import type { Types } from "mongoose";
import Product from "./productSchema.js";

export type ProductType = {
    productName: string;
    productPrice: number;
    categoryId: Types.ObjectId;
    supplierId: Types.ObjectId;
    productDescription: string;
    productImage: string; // better to store URL/path
    productStock: number;
    categoryName?: string;
    supplierName?: string;
};

export const createProductService = async (product: ProductType) => {
    try {
        console.log("product in model", product);
        const newProduct = new Product({
            name: product.productName,
            supplierId: product.supplierId,
            price: product.productPrice,
            categoryId: product.categoryId,
            description: product.productDescription,
            image: product.productImage,
            stock: product.productStock,
            categoryName: product.categoryName,
            supplierName: product.supplierName,
        });
        await newProduct.save();
        console.log("product created", newProduct);
        return newProduct;
    } catch (error) {
        console.error("Error adding product:", error);
        throw error;
    }
};

export const getAllProducts = async () => {
    try {
       const products = await Product.find();
       console.log("products in model returning", products);
        return products;
    } catch (error) {
        console.error("Error fetching products:", error);
        throw error;
    }
};


export const updateProductService = async (id: string, product: ProductType) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      {
        name: product.productName,
        description: product.productDescription,
        price: product.productPrice,
        stock: product.productStock,
        image: product.productImage,
        categoryId: product.categoryId,
        supplierId: product.supplierId,
        categoryName: product.categoryName,
        supplierName: product.supplierName,
      },
      { new: true } 
    );

    return updatedProduct;
  } catch (error) {
    console.error("Error updating product:", error);
    throw error;
  }
};

export const deleteProductService = async (id: string) => {
    try {
        const deletedProduct = await Product.findByIdAndDelete(id);
        return deletedProduct;
    } catch (error) {
        console.error("Error deleting product:", error);
        throw error;
    }
};

export const getProductById = async (id: string)=>{
    try{
        const product = await Product.findById(id);
        return product;
    }
    catch(error){
        console.error("Error while getting product by id", error);
    }
}