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
import { Order } from "../model/orderService/orderModel.js";
import { get } from "http";
import { User } from "../model/userService/userSchema.js";

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
    }
    // "product" is a Mongoose document returned by findById.
    // We can update its fields directly and call .save()
    // to persist the changes in MongoDB.
    // otherwise we can use updateOne method in Prdouct model

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
    product.stock = product.stock - Number(quantity); // decrease stock by quantity
    await product.save();
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
    console.log("order id is.....", id);
    if (!id) {
      console.log("order id is required");
      return;
    }

    const findOrder = await findOrderByIdService(id);
    console.log(findOrder);
    if (!findOrder) {
      return res.status(404).json({ message: "order not found" });
    }
    if (findOrder.status === "confirmed" || findOrder.status === "delivered") {
      return res
        .status(400)
        .json({ message: "order confirmed or delivered can't be deleted" });
    }
    console.log(findOrder);
   const product = await Product.updateOne(
  { _id: findOrder.productId },   // filter
  { $inc: { stock: findOrder.quantity } } // update
);

    console.log(product);

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

//////////// get order for admin  ////////////////////////////////////////////////////////////////////////

export const getAllorderHandlerAdmin = async (req: Request, res: Response) => {
  try {
    const orders = await Order.find();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No orders found" });
    }

    const formattedOrders = await Promise.all(
      orders.map(async (order) => {
        const customer = await User.findById(order.customerId).select(
          "name email role"
        );
        const product = await Product.findById(order.productId).select(
          "name price categoryName supplierName"
        );

        return {
          _id: order._id,
          quantity: order.quantity,
          total: order.total,
          price: order.price,
          orderDate: order.orderDate,
          customer: customer || null,
          product: product || null,
          status: order.status,
        };
      })
    );

    res.status(200).json({
      message: "Orders fetched successfully",
      orders: formattedOrders,
    });
  } catch (error) {
    console.error("Error fetching orders:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// changeStatus of order by admin

export const changeStatusHandler = async (req: Request, res: Response) => {
  try {
    console.log("...............", req.body);

    const { status } = req.body;  
    const { id } = req.params;

    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const newStatus = status.toLowerCase();
    console.log(id, newStatus);

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.status === "delivered") {
      return res.status(400).json({ message: "Order already delivered can't be updated" });
    }
    if (order.status === "cancelled") {
      return res.status(400).json({ message: "Order cancelled can't be updated" });
    }
    if (order.status === "confirmed" && newStatus === "cancelled") {
      return res.status(400).json({ message: "Order confirmed can't be cancelled" });
    }

    order.status = newStatus;
    await order.save();

    return res.status(200).json({ message: "Order status updated successfully" });
  } catch (error) {
    console.error("Error updating order status:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
