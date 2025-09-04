import type { Status } from "cloudinary";
import { Supplier } from "./supplierSchema.js";
import type { ObjectId, Types } from "mongoose";
import type mongoose from "mongoose";
import { fdatasync } from "fs";

type supplierType = {
  supplierName: string;
  supplierAddress: string;
  supplierEmail: string;
  supplierContact: number;
  supplierStatus: Status;
  categoryId: Types.ObjectId;
  categoryName: string;
}

const supplierServiceModel = {
  // Create supplier
  createSupplier: async (supplier: supplierType) => {
    try {
      const newSupplier = await Supplier.create(supplier);
      return newSupplier;
    } catch (error) {
      console.error("Error while creating supplier", error);
      throw error;
    }
  },

  // getSupplier by name
getSupplierByName: async (name: string) => {
  try {
    const supplier = await Supplier.findOne({
      supplierName: { $regex: `^${name.trim()}$`, $options: "i" }
    });

    return supplier;
  } catch (error) {
    console.error("Error while getting supplier", error);
    throw error;
  }
}
,


  // Get all suppliers
  getSupplier: async () => {
    try {
      const suppliers = await Supplier.find({});
      return suppliers;
    } catch (error) {
      console.error("Error while getting suppliers", error);
      throw error;
    }
  },

    // Get supplier by id
  getSupplierById: async (id: string) => {
    try {
      const suppliers = await Supplier.findOne({_id: id});
      return suppliers;
    } catch (error) {
      console.error("Error while getting supplier", error);
      throw error;
    }
  },

  // delete supplier by id 

  deleteSupplier: async (id:string)=>{
    try{
      const supplier = await Supplier.deleteOne({_id: id});
      return supplier;
    }
  catch (error) {
      console.error("Error while getting supplier", error);
      throw error;
    }
  },

  // update supplier

  updateSupplier: async(id: string, input:Partial<supplierType>)=>{
    try{

    const updatedSupplier = await Supplier.updateOne({_id: id}, {$set: input});
    return updatedSupplier;
  }
  catch(error){
    console.error("Error while updating supplier", error);
  }
}
}

export default supplierServiceModel;
