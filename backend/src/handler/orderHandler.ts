import type { Request, Response } from "express";
import {
  createOrderService,
  getAllorderService,
} from "../model/orderService/order.js";
import Product from "../model/productService/productSchema.js";

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, total, price } = req.body;
    console.log(req.body);
    if (!req.user || !req.user._id || req.user === undefined) {
      res.status(400).json({ message: "user not found" });
      return;
    }
    const product = await  Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
      
    }
    else{
        // "product" is a Mongoose document returned by findById.
       // We can update its fields directly and call .save() 
       // to persist the changes in MongoDB.
       // otherwise we can use updateOne method in Prdouct model
        product.stock = product.stock - Number(quantity); // decrease stock by quantity
        await product.save()
    }
    
    if(quantity > product.stock){
      res.status(400).json({ message: "Product out of stock" });
      return;
    }
    const customerId = req.user._id;
    if (!productId || !quantity || !total || !price) {
      res.status(400).json({ message: "All fields are required" });
    }
    const order = await createOrderService({
      customerId,
      productId,
      quantity,
      total,
      price,
    });
    if (!order) {
      res.status(400).json({ message: "Order not created" });
    }
    res.status(201).json({ message: "Order created successfully", order });
  } catch (error) {
    console.error("Error creating order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const getAllorderHandler = async (req: Request, res: Response) => {
  const getorders = await getAllorderService();
  if (!getorders) {
    res.status(404).json({ message: "order not found" });
  }
  res.status(200).json({ message: "order fetched successfully", getorders });
};

// export const updateOrder  = async (req: Request, res: Response) => {
//     try{

//     }
// };