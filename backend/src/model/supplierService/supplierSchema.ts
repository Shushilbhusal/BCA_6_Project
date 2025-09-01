import mongoose from "mongoose";
import { getCategoryByName } from "../categoryService/category.js";

export enum Status {
  active = "active",
  inactive = "inactive",
}
const supplierSchema = new mongoose.Schema({
  supplierName: {
    type: String,
    require: true,
  },    
  supplierAddress: {
    type: String,
    require: true,
  },
  supplierEmail: {
    type: String,
    require: true,
    unique: true,
  },
  supplierContact: {
    type: Number,
    require: true,
    unique: true,
  },
  supplierStatus: {
    type: String,
    enum: Object.values(Status),
    default: "active",
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },

  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  },

  categoryName :{
    type: String,
  }

});

export const Supplier = mongoose.model("Supplier", supplierSchema);
