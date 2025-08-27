// import bcrypt from "bcrypt";
// import { User } from "./model/userService/userSchema.js";
// import mongoose from "mongoose";

// const register = async () => {
//   try {
//     if (!process.env.MONGO_URL) {
//       throw new Error("MONGO_URL environment variable is not defined");
//     }
//     await mongoose.connect(process.env.MONGO_URL);
//     console.log("Connected to MongoDB");

//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash("password", salt);

//     const user = await User.create({
//       name: "ram",
//       email: "ram@gmail.com",
//       password: hashedPassword,
//       role: "admin",
//     });
//     console.log("user created succesfully", user);
//   } catch (error) {
//     console.log(error);
//   }
// };
