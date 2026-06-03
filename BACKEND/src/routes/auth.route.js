import express from 'express'
import { login, logout, signup, onboard, verifyEmail, resendOtp } from '../controllers/auth.controller.js'
import { protectRoute } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";
import { loginSchema, onboardingSchema, signupSchema } from "../validators/auth.validator.js";

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);
router.post('/login', validate(loginSchema), login);
router.post('/logout', logout);
router.post("/onboarding", protectRoute, validate(onboardingSchema), onboard);

router.post('/verify-email', protectRoute, verifyEmail);
router.post('/resend-otp', protectRoute, resendOtp);

router.get('/me', protectRoute, (req, res) => {
    res.status(200).json({ success: true, user: req.user })
})

export default router
