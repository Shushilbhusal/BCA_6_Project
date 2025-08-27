import type { Request, Response } from "express";
import { createUserService } from "../../model/userService/user.js";
import { hashPassword } from "../../utils/auth.js";
import { Role } from "../../model/userService/userSchema.js";
export const createUserHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, address, password, role } = req.body;
    if (!name || !email || !password) {
      console.log(req.body);
      res.status(400).json({ message: "fields are required" });
    }
    const hashedPassword = await hashPassword(password);
    if(!hashedPassword || hashedPassword === undefined){
      res.status(400).json({message:"password not hashed"});
      return 
    }
    const createdUser = await createUserService({
      name,
      email,
      password: hashedPassword,
      address,
      role: role as Role,
    });
    if (!createdUser) {
      res.status(400).json({ message: "user not created" });
    } else {
      console.log(createdUser);
      res.status(201).json({ message: "user created successfully" });
    }
  } catch (error: any) {
    res.status(500).json({ error });
  }
};
