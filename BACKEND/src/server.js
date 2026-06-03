import express  from 'express';
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { connectDB } from './config/db.js';
import cookieParser from 'cookie-parser'
import cors from 'cors'
import authRoute from "./routes/auth.route.js"
import userRoute from "./routes/user.route.js"
import chatRoute from "./routes/chat.route.js"

const app = express()
const PORT = process.env.PORT || 5001;
const allowedOrigins = (process.env.CLIENT_ORIGINS || "http://localhost:5173,http://127.0.0.1:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const apiLimiter = rateLimit({
    legacyHeaders: false,
    max: 300,
    standardHeaders: true,
    windowMs: 15 * 60 * 1000,
});

app.use(helmet());
app.use(apiLimiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(cookieParser());
app.use(
    cors({
    origin(origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        return callback(new Error("Not allowed by CORS"));
    },
    credentials:true
})
)

app.use('/api/auth' , authRoute );
app.use('/api/users' , userRoute);
app.use('/api/chat' , chatRoute);

connectDB();

app.listen(PORT , ()=>{
    console.log(`server is running on port ${PORT}`);  
})
