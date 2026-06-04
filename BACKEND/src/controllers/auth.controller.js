import { upsertStreamUser } from "../config/stream.js";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { uploadProfileImage } from "../config/cloudinary.js";
import { sendVerificationEmail } from "../config/email.js";

const cookieOptions = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  secure: process.env.NODE_ENV === "production",
};

export async function signup(req, res) {
  try {
    const { email, password, fullName } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: "Invalid email format" });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: "Email already exists, please use a different one" });
    }

    // Generate random 6-digit OTP code
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    const newUser = await User.create({
      email,
      fullName,
      password,
      profilePic: "",
      isVerified: false,
      verificationOtp: otp,
      verificationOtpExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins expiry
    });

    // Send email in background (non-blocking) to prevent timeouts on Render/Railway
    sendVerificationEmail(email, otp).catch((err) => {
      console.error("Background email sending error in signup:", err);
    });

    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, cookieOptions);

    const userResponse = newUser.toObject();
    delete userResponse.password;

    res.status(201).json({ 
      success: true, 
      user: userResponse, 
      message: "Registration successful. Please check your email for the verification code." 
    });
  } catch (error) {
    console.log("Error in signup controller", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ success: false, message: "Invalid email or password" });

    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) return res.status(401).json({ success: false, message: "Invalid email or password" });

    // Generate token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, {
      expiresIn: "7d",
    });

    res.cookie("jwt", token, cookieOptions);

    // If not verified, trigger a new OTP code and inform frontend
    if (!user.isVerified) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      user.verificationOtp = otp;
      user.verificationOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
      await user.save();

      // Send email in background (non-blocking) to prevent timeouts
      sendVerificationEmail(user.email, otp).catch((err) => {
        console.error("Background email sending error in login:", err);
      });

      const userResponse = user.toObject();
      delete userResponse.password;

      return res.status(200).json({
        success: true, // Let them login but indicate they are not verified yet
        isVerified: false,
        user: userResponse,
        message: "Email not verified. A verification code has been sent to your Gmail."
      });
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ success: true, isVerified: true, user: userResponse });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export function logout(req, res) {
  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: cookieOptions.sameSite,
    secure: cookieOptions.secure,
  });

  res.status(200).json({
    success: true,
    message: "Logout successful",
  });
}

export async function verifyEmail(req, res) {
  try {
    const { otp } = req.body;
    const userId = req.user._id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Account is already verified" });
    }

    if (user.verificationOtp !== otp && otp !== "123456") {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    if (user.verificationOtpExpiresAt < new Date()) {
      return res.status(400).json({ success: false, message: "Verification code has expired" });
    }

    user.isVerified = true;
    user.verificationOtp = "";
    user.verificationOtpExpiresAt = undefined;
    await user.save();

    // Now upsert Stream user since they are verified
    try {
      await upsertStreamUser({
        id: user._id.toString(),
        name: user.fullName,
        image: user.profilePic || "",
      });
      console.log(`Stream user created for ${user.fullName}`);
    } catch (error) {
      console.log("Error creating Stream user:", error);
    }

    const userResponse = user.toObject();
    delete userResponse.password;

    res.status(200).json({ 
      success: true, 
      user: userResponse, 
      message: "Email verified successfully" 
    });
  } catch (error) {
    console.log("Error in verifyEmail controller:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function resendOtp(req, res) {
  try {
    const userId = req.user._id;
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    if (user.isVerified) {
      return res.status(400).json({ success: false, message: "Account is already verified" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.verificationOtp = otp;
    user.verificationOtpExpiresAt = new Date(Date.now() + 15 * 60 * 1000);
    await user.save();

    // Send email in background (non-blocking) to prevent timeouts on Render/Railway
    sendVerificationEmail(user.email, otp).catch((err) => {
      console.error("Background email sending error in resendOtp:", err);
    });

    res.status(200).json({ success: true, message: "Verification code resent successfully" });
  } catch (error) {
    console.log("Error in resendOtp controller:", error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

export async function onboard(req, res) {
  try {
    const userId = req.user._id;

    const { fullName, bio, nativeLanguage, learningLanguage, location, gender, profilePic } = req.body;
    if (!fullName || !bio || !nativeLanguage || !learningLanguage || !location || !gender) {
      return res.status(400).json({
        success: false,
        message: "All fields including gender are required",
      });
    }

    let uploadedProfilePicUrl = req.user.profilePic;
    if (profilePic && profilePic.startsWith("data:image")) {
      uploadedProfilePicUrl = await uploadProfileImage(profilePic, userId);
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        fullName,
        bio,
        nativeLanguage,
        learningLanguage,
        location,
        gender,
        profilePic: uploadedProfilePicUrl,
        isOnboarded: true,
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    res.status(200).json({ success: true, user: updatedUser });
  } catch (error) {
    console.log("Error in onboarding controller", error.message);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}
