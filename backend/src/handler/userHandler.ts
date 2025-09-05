import { response, type Request, type Response } from "express";
import {
  createUserService,
  deleteUserService,
  getAllUserService,
  getUserByEmailService,
  getUserByIdService,
  updateUserService,
} from "../model/userService/user.js";
import { hashPassword } from "../utils/auth.js";
import { Role } from "../model/userService/userSchema.js";
import { request } from "http";
export const createUserHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, password, role } = req.body;
    console.log(req.body)
    if (!name || !email || !password) {
      console.log(req.body);
      return res.status(400).json({ message: "Fields are required" });
    }

    const findUserByEmail = await getUserByEmailService(email);
    console.log("..........find user by email",findUserByEmail);
     if(findUserByEmail){
      return res.status(400).json({ message: "User already exists" });
    }

    console.log(typeof phone);
    console.log(phone.length)
    if (phone.toString().length !== 10) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }

    const hashedPassword = await hashPassword(password);
    const phoneNumber = Number(phone);

    if(!hashedPassword){
      console.log("not hashed password")
      return null
    }

    const createdUser = await createUserService({
      name,
      email,
      phone: phoneNumber,
      password: hashedPassword,
      address,
      role: role as Role,
    });

    if (!createdUser) {
      return res.status(400).json({ message: "User not created" });
    }

    console.log(createdUser);
    return res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Error while creating user" });
  }
};

export const updateUserHandler = async (req: Request, res: Response) => {
  try {
    const { name, email, phone, address, password, role } = req.body;
    if (!name || !email || !password) {
      console.log(req.body);
      res.status(400).json({ message: "fields are required" });
    }

    const { id } = req.params;
    if (!id) {
      console.log("id is required");
      return;
    }

    const findUserById = await getUserByIdService(id);
    if (!findUserById) {
      console.log("user does not exists");
      return;
    }
    const updatedUser = await updateUserService(id, {
      name,
      email,
      phone,
      password,
      address,
      role: role as Role,
    });

    if (!updatedUser) {
      res.status(400).json({ message: "user not updated" });
    } else {
      console.log(updatedUser);
      res
        .status(201)
        .json({ message: "user updated successfully", updatedUser });
    }
  } catch (error: any) {
    res.status(500).json({ error });
  }
};

export const getAllUserHandler = async (req: Request, res: Response) => {
  const getUsers = await getAllUserService();
  if (!getUsers) {
    res.status(404).json({ message: "user not found" });
  }
  res.status(200).json({ message: "user fetched successfully", getUsers });
};

export const deleteUserHandler = async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) {
      console.log("user id is required");
      return;
    }
    const user = await deleteUserService(id);
    if (!user) {
      return res.status(404).json({ message: "user not found" });
    }
    return res.status(200).json({ message: "user deleted successfully", user });
  } catch (error) {
    console.error("Error deleting user:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
