import { Router } from "express";
import { createUserHandler } from "../handler/userHandler.js";
import { loginHandler } from "../handler/authHandler.js";


const userRouter = Router();

userRouter.post("/createUser", createUserHandler);
userRouter.post("/auth/login", loginHandler);
export { userRouter };
