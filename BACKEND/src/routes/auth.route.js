import express from 'express'
import {login,logout,signIn ,onboard} from '../controllers/auth.controller.js'
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, onboardingSchema, signupSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post('/signup',validate(signupSchema),signIn);
router.post('/signin',validate(signupSchema),signIn);
router.post('/login',validate(loginSchema),login)
router.post('/logout',logout);
router.post("/onboarding",protectRoute,validate(onboardingSchema),onboard)


router.get('/me' ,protectRoute ,(req,res) =>{
    res.status(200).json({ success:true ,user:req.user})
})

export default router
