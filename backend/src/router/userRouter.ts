import { Router } from "express";
import { createUserHandler, deleteUserHandler, getAllUserHandler, updateUserHandler } from "../handler/userHandler.js";
import { loginHandler } from "../handler/authHandler.js";
import multer from "multer";
const upload = multer();


const userRouter = Router();
userRouter.post("/auth/login", loginHandler);


userRouter.post("/create", upload.none(), createUserHandler);
userRouter.put("/update/:id", updateUserHandler);
userRouter.get("/get", getAllUserHandler)
userRouter.delete("/delete/:id", deleteUserHandler);

export { userRouter };
