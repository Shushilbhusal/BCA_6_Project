import express from "express";
import type { Request, Response } from "express";
import cors from 'cors';
import connectDB from "./db/connection.js";
import dotenv from 'dotenv';
import { userRouter } from "./router/userRouter.js";
import { v2 as cloudinary } from "cloudinary";
import multer from "multer";
import { categoryRouter } from "./router/categoryRouter.js";
dotenv.config();

const app = express();

app.use(cors({
  origin: 'http://localhost:5173', // frontend URL
  credentials: true
}));

app.use(express.json());

app.use('/user', userRouter);
app.use('/category', categoryRouter);

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
