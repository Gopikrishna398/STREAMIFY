import { useState, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { verifyEmail, resendOtp, logout } from "../lib/api";
import { ShieldCheck, RefreshCw, LogOut, MailOpen } from "lucide-react";

const VerifyEmailPage = () => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [cooldown, setCooldown] = useState(60);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (cooldown > 0) {
      const timer = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [cooldown]);

  const { mutate: verify, isPending: isVerifying } = useMutation({
    mutationFn: verifyEmail,
    onSuccess: (data) => {
      toast.success(data?.message || "Email verified successfully!");
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/onboarding");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Verification failed. Try again.");
    },
  });

  const { mutate: resend, isPending: isResending } = useMutation({
    mutationFn: resendOtp,
    onSuccess: (data) => {
      toast.success(data?.message || "Verification code resent!");
      setCooldown(60);
      setOtp(["", "", "", "", "", ""]);
      inputRefs.current[0]?.focus();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to resend code.");
    },
  });

  const { mutate: handleLogout } = useMutation({
    mutationFn: logout,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["authUser"] });
      navigate("/login");
    },
  });

  const handleChange = (index, value) => {
    const newVal = value.replace(/\D/g, ""); // Keep only numbers
    if (!newVal) return;

    const newOtp = [...otp];
    newOtp[index] = newVal.substring(newVal.length - 1); // Take last character entered
    setOtp(newOtp);

    // Auto-focus next input
    if (index < 5 && newVal) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      const newOtp = [...otp];
      if (otp[index]) {
        newOtp[index] = "";
        setOtp(newOtp);
      } else if (index > 0) {
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").replace(/\D/g, "").substring(0, 6);
    if (!pasteData) return;

    const newOtp = [...otp];
    for (let i = 0; i < 6; i++) {
      newOtp[i] = pasteData[i] || "";
    }
    setOtp(newOtp);

    // Focus last populated input or first empty
    const focusIndex = Math.min(pasteData.length, 5);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      toast.error("Please enter the full 6-digit code.");
      return;
    }
    verify(otpCode);
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center p-4 overflow-hidden bg-slate-950">
      
      {/* Background Glow Blobs */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-primary/20 blur-[100px] animate-pulse"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-secondary/15 blur-[120px] animate-pulse"></div>

      <div className="relative w-full max-w-lg p-6 md:p-10 bg-slate-900/60 backdrop-blur-2xl border border-slate-800 rounded-3xl shadow-2xl space-y-8">
        
        {/* Top Header Section with Animated Rings */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="relative flex items-center justify-center">
            {/* Pulsating Waves */}
            <div className="absolute inset-0 size-20 rounded-full bg-primary/10 animate-ping"></div>
            <div className="absolute inset-0 size-16 rounded-full bg-primary/20 animate-pulse"></div>
            
            <div className="relative p-5 bg-gradient-to-br from-primary to-secondary rounded-2xl text-white shadow-xl shadow-primary/20">
              <MailOpen className="size-8" />
            </div>
          </div>
          
          <div className="space-y-1">
            <h2 className="text-3xl font-extrabold tracking-tight text-white bg-clip-text bg-gradient-to-r from-white via-slate-100 to-slate-400">
              Verification Code
            </h2>
            <p className="text-sm text-slate-400 max-w-sm">
              We've sent a 6-digit OTP code to verify your Gmail account. Please check your inbox.
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* 6 Digit Input Grid */}
          <div className="flex justify-between gap-2 max-w-md mx-auto">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                onPaste={handlePaste}
                className="size-12 md:size-14 text-center text-2xl font-bold bg-slate-950/80 text-white border-2 border-slate-800 rounded-xl focus:border-primary focus:ring-1 focus:ring-primary focus:outline-none transition-all"
                disabled={isVerifying}
                required
              />
            ))}
          </div>

          <button
            type="submit"
            className="btn btn-primary w-full text-white bg-gradient-to-r from-primary to-secondary hover:brightness-110 border-0 h-12 shadow-lg shadow-primary/20 flex items-center justify-center gap-2 text-base font-semibold transition-all hover:scale-[1.01]"
            disabled={isVerifying}
          >
            {isVerifying ? (
              <span className="loading loading-spinner loading-sm"></span>
            ) : (
              <>
                <ShieldCheck className="size-5" />
                Verify Account
              </>
            )}
          </button>
        </form>

        {/* Action Controls */}
        <div className="flex flex-col items-center gap-4 pt-2">
          
          {/* Cooldown Resend Section */}
          <div className="text-sm">
            {cooldown > 0 ? (
              <span className="text-slate-500 font-medium">
                Resend code available in <span className="text-primary font-bold">{cooldown}s</span>
              </span>
            ) : (
              <button
                onClick={() => resend()}
                disabled={isResending}
                className="flex items-center gap-2 text-primary hover:text-primary-focus font-semibold transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`size-4 ${isResending ? "animate-spin" : ""}`} />
                Resend Verification Code
              </button>
            )}
          </div>

          <div className="w-full border-t border-slate-800/80"></div>

          <button
            onClick={() => handleLogout()}
            className="flex items-center justify-center gap-2 text-xs text-rose-500 hover:text-rose-400 font-medium py-2 px-4 rounded-xl border border-rose-950/40 hover:bg-rose-950/10 transition-all w-full"
          >
            <LogOut className="size-3.5" />
            Logout & Use Different Email
          </button>
        </div>

      </div>
    </div>
  );
};

export default VerifyEmailPage;
