import { Role, User } from "./userSchema.js";

type userType = {
  name: string;
  email: string;
  phone: number;
  password: string;
  address: string;
  role: Role;
};

export const createUserService = async (user: userType) => {
  try {
    const createUser = new User(user);
    const createdUser = await createUser.save();
    return createdUser;
  } catch (error) {
    console.log(error);
  }
};

export const getUserByIdService = async (id: string) => {
  try {
    const user = await User.findById({
      _id: id,
    })
      .lean()
      .exec();
    return user;
  } catch (error) {
    console.log("error while getting user by id", error);
  }
};

export const updateUserService = async (id: string, user: userType) => {
  try {
    const updatedUser = await User.updateOne(
      {
        _id: id,
      },
      { $set: user }
    );
    return updatedUser;
  } catch (error) {
    console.log("error while updating user", error);
  }
};

export const getAllUserService = async () => {
  try {
    const users = await User.find({}).select("-password");
    return users;
  } catch (error) {
    console.log("Error while getting users:", error);
    throw error;
  }
};

export const getUserByEmailService = async (email: string) => {
  try {
    const users = await User.findOne({ email: email }).select("-password");
    console.log("users in db", users);
    return users;
  } catch (error) {
    console.log("Error while getting users:", error);
    throw error;
  }
};

export const deleteUserService = async (id: string) => {
  try {
    const deleteUser = await User.deleteOne({ _id: id });
    return deleteUser;
  } catch (error) {
    console.error("Error while getting user", error);
    throw error;
  }
};
