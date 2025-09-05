import mongoose from "mongoose";

export enum Role {
  customer = "customer",
  admin = "admin",
  employee = "employee",
}
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phone: {
      type: Number,
      unique: true,
      require: true,
    },
    password: {
      type: String,
      require: true,
    },
    address: {
      type: String,
    },
    role: {
      type: String,
      default: "customer",
      enum: Object.values(Role),
    },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", userSchema);
