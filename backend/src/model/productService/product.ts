import type { Types } from "mongoose";
import Product from "./productSchema.js";

export type ProductType = {
    name: string;
    price: number;
    categoryId: Types.ObjectId;
    supplierId: Types.ObjectId;
    description: string;
    image: string; // better to store URL/path
    stock: number;
    categoryName?: string;
    supplierName?: string;
};

export const createProductService = async (product: ProductType) => {
    try {
        console.log("product in model", product);
        const newProduct = new Product({
            name: product.name,
            supplierId: product.supplierId,
            price: product.price,
            categoryId: product.categoryId,
            description: product.description,
            image: product.image,
            stock: product.stock,
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
        name: product.name,
        description: product.description,
        price: product.price,
        stock: product.stock,
        image: product.image,
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