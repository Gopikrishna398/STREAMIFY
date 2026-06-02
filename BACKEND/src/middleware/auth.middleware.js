import jwt from 'jsonwebtoken'
import User from '../models/user.model.js'
import { env } from '../config/env.js'

export const protectRoute = async (req , res, next )=>{
    try{
        const token= req.cookies.jwt;

        if(!token ){
            return res.status(401).json({ message: "Unauthorized - no token provided "})
        }
        
        const decode = jwt.verify(token , env.jwtSecret);

        if(!decode){
            return res.status(401).json({ message : "Unauthorized - invalid token "})
        }
        const user = await User.findById(decode.userId).select('-password')

         if(!user){
            return res.status(401).json({ message : "Unauthorized - invalid token "})
        }
        req.user = user;

        next();

    }catch(err){
        console.log("Error in protect Route middleware ",err)
        return res.status(401).json({ message  : "Internal server error "})
    }
}

