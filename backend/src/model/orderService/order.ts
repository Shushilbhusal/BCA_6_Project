import type { Types } from "mongoose";
import { Order } from "./orderModel.js";

type orderType = {
  customerId: Types.ObjectId;
  productId: string;
  quantity: number;
  total: number;
  price: number;
};

export const createOrderService = async (order: orderType) => {
  try {
    const createOrder = new Order(order);
    const createdOrder = await createOrder.save();
    return createdOrder;
  } catch (error) {
    console.log(error);
  }
};

export const getOrderByIdService = async (id: string) => {
  try {
    const order = await Order.find({
      customerId: id,
    });
    return order;
  } catch (error) {
    console.log("error while getting order by id", error);
  }
};

export const updateorderService = async (id: string, order: orderType) => {
  try {
    const updatedorder = await Order.updateOne(
      {
        _id: id,
      },
      { $set: order }
    );
    return updatedorder;
  } catch (error) {
    console.log("error while updating order", error);
  }
};

export const getAllorderService = async () => {
  try {
    const orders = await Order.find({});
    return orders;
  } catch (error) {
    console.log("Error while getting orders:", error);
    throw error;
  }
};

export const deleteorderService = async (id: string) => {
  try {
    const deleteorder = await Order.deleteOne({ _id: id });
    return deleteorder;
  } catch (error) {
    console.error("Error while getting order", error);
    throw error;
  }
};


// delete order

const deleteOrderService = async (id: string) => {
  try {
    const deleteorder = await Order.deleteOne({ _id: id });
    return deleteorder;
  } catch (error) {
    console.error("Error while getting order", error);
    throw error;
  }
};

// find order by id 

export const findOrderByIdService = async (id: string) => {
  try {
    const order = await Order.findById({
      _id: id,
    });
    return order;
  } catch (error) {
    console.error("Error while getting order", error);
    throw error;
  }
};