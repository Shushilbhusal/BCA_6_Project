import type { Request, Response } from "express";
import {
  createOrderService,
  deleteorderService,
  findOrderByIdService,
  getAllorderService,
  getOrderByIdService,
} from "../model/orderService/order.js";
import Product from "../model/productService/productSchema.js";
import { getProductById } from "../model/productService/product.js";
import type { Types } from "mongoose";
import { getUserByIdService } from "../model/userService/user.js";

export const createOrderHandler = async (req: Request, res: Response) => {
  try {
    const { productId, quantity, total, price } = req.body;
    console.log(req.body);
    if (!req.user || !req.user._id || req.user === undefined) {
      res.status(400).json({ message: "user not found" });
      return;
    }
    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: "Product not found" });
      return;
    } else {
      // "product" is a Mongoose document returned by findById.
      // We can update its fields directly and call .save()
      // to persist the changes in MongoDB.
      // otherwise we can use updateOne method in Prdouct model
      product.stock = product.stock - Number(quantity); // decrease stock by quantity
      await product.save();
    }

    if (quantity > product.stock) {
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
  try {
    const id = req.user?._id;
    if (!id) {
      res.status(400).json({ message: "user not found" });
      return;
    }
    console.log("user id is.....", id);
    const getorders = await getOrderByIdService(id.toString());
    console.log(getorders, "getorders");
    if (!getorders) {
      res.status(404).json({ message: "order not found" });
      return;
    }

    const findProducts = await Promise.all(
      getorders.map(async (p) => {
        return await getProductById(p.productId.toString());
      })
    );

    if (!findProducts || findProducts.length === 0) {
      res.status(404).json({ message: "product not found" });
      return;
    }

    const findUsers = await getUserByIdService(id.toString());

    if (!findUsers) {
      res.status(404).json({ message: "user not found" });
      return;
    }
    console.log(findUsers, "findUsers");
    res.status(200).json({
      message: "order fetched successfully",
      getorders,
      findProducts,
      findUsers,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

export const deleteOrderHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      console.log("order id is required");
      return;
    }

    const findOrder = await findOrderByIdService(id);

    if (!findOrder) {
      return res.status(404).json({ message: "order not found" });
    }

    const product = await Product.updateOne({
      _id: findOrder.productId,
      $inc: { stock: findOrder.quantity },
    });

    if (!product) {
      return res.status(404).json({ message: "product not found" });
    }

    const order = await deleteorderService(id);
    if (!order) {
      return res.status(404).json({ message: "order not found" });
    }

    return res
      .status(200)
      .json({ message: "order deleted successfully", order });
  } catch (error) {
    console.error("Error deleting order:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
