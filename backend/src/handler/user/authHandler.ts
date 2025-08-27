import type { Request, Response} from 'express';
import { User } from '../../model/userService/userSchema.js';
import { comparePassword, generateToken } from '../../utils/auth.js';

export const loginHandler = async (req: Request, res: Response)=>{
    try{
        const{email, password}= req.body;
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({status:false,message:"not registered"});
        }

        const isMatch= await comparePassword(password, user.password);
        if(!isMatch){
            return res.status(401).json({status: false, message:"invalid password"});

        }
        // else{
        //     return res.status(200).json({status: true, message:"login successfully"});
        // }

       const payload={
           _id: user._id,
           name: user.name,
           email: user.email,
           role: user.role
       }
       const token = await generateToken(payload);
       console.log(token);
       console.log(payload);
       return res.status(200).json(({status: true, message:"login successfully", token, user: payload}));
    }
    catch(error){
        console.log(error);
        return res.status(500).json(({status: false, message:"internal server error"}));

    }
}