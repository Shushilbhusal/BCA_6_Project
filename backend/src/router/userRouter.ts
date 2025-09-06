import { Router } from "express";
import { createUserHandler, deleteUserHandler, getAllUserHandler, getUserProfileHandler, updateUserHandler, updateUserProfileHandler } from "../handler/userHandler.js";
import { loginHandler } from "../handler/authHandler.js";
import multer from "multer";
import { authMiddleware } from "../middleware/authMiddleware.js";
const upload = multer();


const userRouter = Router();
userRouter.post("/auth/login", loginHandler);


userRouter.post("/create", upload.none(), createUserHandler);
userRouter.put("/update/:id", updateUserHandler);
userRouter.get("/get", getAllUserHandler)
userRouter.delete("/delete/:id", deleteUserHandler);

userRouter.get("/getprofile", authMiddleware, getUserProfileHandler);
userRouter.put("/updateprofile/:id", authMiddleware, updateUserProfileHandler);


export { userRouter };
