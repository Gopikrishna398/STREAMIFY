import mongoose from "mongoose"
import { env } from "./env.js";

export const connectDB= async ()=>{
    try{
        const conn = await mongoose.connect(env.mongoUri);
        console.log(`MongoDb connected : ${conn.connection.host}`)
    }catch(err){
        console.log("Error in DB connection",err )
        process.exit(1);
    }
}
