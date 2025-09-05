import mongoose  from "mongoose";

const orderSchema = new mongoose.Schema ({
    customerId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Customer",
        required: true
    },
    productId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    }
    ,
    quantity: {
        type: Number,
        required: true
    },
    total: {
        type: Number,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    orderDate: {
        type: Date,
        default: Date.now
    }
})

export const Order = mongoose.model("Order", orderSchema);