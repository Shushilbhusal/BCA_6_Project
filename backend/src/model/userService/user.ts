import { Role, User } from "./userSchema.js";

type userType = {
  name: string;
  email: string;
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

export const getUserByIdService = async (id: string)=>{
  try{
    const user = await User.findById({
      _id: id
    }).lean().exec();
    return user;
  }
  catch(error){
    console.log("error while getting user by id",error);
  }
       
  }
   