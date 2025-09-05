import express from "express";
import cors from 'cors';
import connectDB from "./db/connection.js";
import dotenv from 'dotenv';
import { userRouter } from "./router/userRouter.js";

import { categoryRouter } from "./router/categoryRouter.js";
import { supplierRouter } from "./router/supplierRouter.js";
import { productRouter } from "./router/productRouter.js";
import { orderRouter } from "./router/orderRouter.js";
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true
}));



app.use('/user', userRouter);
app.use('/category', categoryRouter);
app.use('/supplier', supplierRouter);
app.use('/product', productRouter);
app.use('/order', orderRouter);

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`Server started on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to connect to DB", error);
    process.exit(1);
  }
};

startServer();
