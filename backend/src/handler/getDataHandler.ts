import type { Request, Response } from "express";
import Product from "../model/productService/productSchema.js";
import { Order } from "../model/orderService/orderModel.js";
import { Expense } from "../model/expenseTracker.ts/model.js";

export const getDataHandler = async (req: Request, res: Response) => {
  try {
    // Total number of products
    const totalProducts = await Product.countDocuments();
    const userName = req.user?.name;

    // Total stock across all products
    const stockResult = await Product.aggregate([
      {
        $group: {
          _id: null,
          totalStock: { $sum: "$stock" },
        },
      },
    ]);
    const totalStock = stockResult[0]?.totalStock || 0;

    // Total number of orders
    const totalOrders = await Order.countDocuments();

    // Orders placed today
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const orderToday = await Order.countDocuments({
      orderDate: { $gte: startOfDay, $lte: endOfDay },
    });

    // Total revenue
    const revenueResult = await Expense.aggregate([
      {
        $match: { type: "revenue" }, // filter only revenue 
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: "$amount" }, // sum the "total" field
        },
      },
    ]);

    const totalRevenue = revenueResult[0]?.totalRevenue || 0;

    // Out of stock products
    const outOfStockCount = await Product.countDocuments({ stock: 0 });

    const outOfStockDetails = await Product.find({ stock: 0 })
      .select("name stock")
      .populate("categoryId", "categoryName");

    // Low stock products (< 5)
    const lowStockCount = await Product.countDocuments({ stock: { $lt: 5 } });

    const lowStockDetails = await Product.find({ stock: { $lt: 5 } })
      .select("name stock")
      .populate("categoryId", "categoryName");

 const highestSales = await Order.aggregate([
  { $match: { status: "delivered" } }, // optional: only count delivered orders
  {
    $group: {
      _id: "$productId", // group by single productId
      totalQuantity: { $sum: "$quantity" }, // sum the quantity field
    },
  },
  { $sort: { totalQuantity: -1 } },
  { $limit: 5 },
  {
    $lookup: {
      from: "products",
      localField: "_id",
      foreignField: "_id",
      as: "product",
    },
  },
  { $unwind: "$product" },
  {
    $lookup: {
      from: "categories",
      localField: "product.categoryId",
      foreignField: "_id",
      as: "category",
    },
  },
  { $unwind: "$category" },
  {
    $project: {
      name: "$product.name",
      categoryName: "$category.categoryName",
      totalQuantity: 1,
    },
  },
]);

const topSellingProducts =
  highestSales.length > 0
    ? highestSales
    : [{ message: "No sales data available" }];


    // Assemble dashboard data
    const dashboardData = {
      totalProducts,
      totalStock,
      totalOrders,
      orderToday,
      totalRevenue,
      outOfStockCount,
      outOfStockDetails,
      lowStockCount,
      lowStockDetails,
      topSellingProducts,
    };

    console.log("dashboardData", dashboardData);

    res
      .status(200)
      .json({ message: "Data fetched successfully", dashboardData, userName });
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
