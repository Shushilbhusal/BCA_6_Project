import mongoose from "mongoose";

export enum Role{
   customer = 'customer',
   admin = 'admin',
}
const userSchema = new mongoose.Schema({
     name:{
        type: String,
        required: true,
     },
     email:{
        type: String,
        required: true,
        unique: true,
     },
     password:{
        type: String,
        required: true
     },
     address:{
        type: String
     },
     role:{
        type: String,
        default: "customer",
        enum: Object.values(Role)
     }
     
})



export const User = mongoose.model('User', userSchema);