import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",   // Reference to Category model
    required: true
  },
  supplierId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Supplier",   // Reference to Supplier model
    required: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  stock: {
    type: Number,
    required: true,
    min: 0
  },
  totalCost: {
    type: Number,
  },
  image: {
    type: String,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  categoryName: {
    type: String,
    required: false
  },
  supplierName: {
    type: String,
    required: false
  }

}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);

export default Product;
