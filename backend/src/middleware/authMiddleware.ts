import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../utils/auth.js";
import { getUserByIdService } from "../model/userService/user.js";
import type { Types } from "mongoose";

type userType = {
  _id: Types.ObjectId;
  name: string;
  email: string;
  phone?: number | null;
  address?: string | null;
  role: string;
};

declare global {
  namespace Express {
    interface Request {
      user?: userType;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    // console.log("auth header",authHeader);  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized Access 1" });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "Unauthorized Access 2" });
    }
    const decodedToken = await verifyToken(token);
  //  console.log(decodedToken, "decoded token");
    if (
      !decodedToken ||
      typeof decodedToken === "string" ||
      !("_id" in decodedToken)
    ) {
      return res.status(401).json({ message: "Unauthorized Access" });
    }

    const user = await getUserByIdService(decodedToken._id);
    if (!user || !user.email || !user.role || !user.name) {
      return res.status(401).json({ message: "User not found" });
    }

    // Remove password before attaching to req.user
    const { password, ...safeUser } = user;
    req.user = user;

    // console.log("User verified successfully");
    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res
      .status(500)
      .json({ message: "Internal server error in auth middleware" });
  }
};
