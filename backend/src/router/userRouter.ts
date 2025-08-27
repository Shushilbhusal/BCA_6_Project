import { Router } from "express";
import { createUserHandler } from "../handler/user/userHandler.js";
import { loginHandler } from "../handler/user/authHandler.js";

const userRouter = Router();

userRouter.post("/createUser", createUserHandler);
userRouter.post('/auth/login', loginHandler);
export { userRouter };
