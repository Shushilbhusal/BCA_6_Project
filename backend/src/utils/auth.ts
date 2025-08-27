import bcrypt from "bcrypt";
import { hash } from "crypto";
import jwt from "jsonwebtoken";

export const hashPassword = async (password: string) => {
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    console.log(error);
  }
};

export const comparePassword = async (
  password: string,
  hashedPassword: string
) => {
  try {
    const isMatch = await bcrypt.compare(password, hashedPassword);
    return isMatch;
  } catch (error) {
    console.log(error);
  }
};

export const generateToken = async (payload: any) => {
  try {
    const token = await jwt.sign(payload, process.env.SECRET_KEY as string, {
      expiresIn: "1d",
    });
    return token;
  } catch (error) {
    console.log(error);
  }
};

export const verifyToken = async (token: string) => {
  try {
    const decoded = await jwt.verify(token, process.env.SECRET_KEY as string);
    return decoded;
  } catch (error) {
    console.log("error while verifying token", token);
  }
};
