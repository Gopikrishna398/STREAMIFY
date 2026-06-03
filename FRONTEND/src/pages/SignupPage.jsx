import { useState } from "react";
import { ShipWheelIcon } from "lucide-react";

import { Link } from "react-router-dom";

import useSignup from "../hooks/useSignup";

const SignupPage = () => {
  const [signupData, setSignupData] = useState({
    fullName: "",
    email: "",
    password: "",
  });

  const { isPending, error, signupMutation } = useSignup();

  const handleSignup = (e) => {
    e.preventDefault();
    signupMutation(signupData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-base-200">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-3xl shadow-2xl overflow-hidden border border-base-300">
        {/* SIGNUP FORM - LEFT SIDE */}
        <div className="w-full lg:w-1/2 p-6 sm:p-10 md:p-12 flex flex-col justify-center">
          {/* LOGO */}
          <div className="mb-6 flex items-center justify-start gap-3">
            <div className="p-2 bg-primary/10 rounded-xl">
              <ShipWheelIcon className="size-8 text-primary" />
            </div>
            <span className="text-3xl font-bold font-mono bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary tracking-wider">
              Streamify
            </span>
          </div>

          {/* ERROR MESSAGE IF ANY */}
          {error && (
            <div className="alert alert-error mb-6 shadow-sm">
              <span>{error?.response?.data?.message || error.message || "An error occurred"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleSignup}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Create an Account</h2>
                  <p className="text-sm text-base-content/70">
                    Join Streamify and start your language learning adventure!
                  </p>
                </div>

                <div className="space-y-4">
                  {/* FULLNAME */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">Full Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="John Doe"
                      className="input input-bordered w-full focus:input-primary transition-all"
                      value={signupData.fullName}
                      onChange={(e) => setSignupData({ ...signupData, fullName: e.target.value })}
                      required
                    />
                  </div>
                  {/* EMAIL */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="john@example.com"
                      className="input input-bordered w-full focus:input-primary transition-all"
                      value={signupData.email}
                      onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                      required
                    />
                  </div>
                  {/* PASSWORD */}
                  <div className="form-control w-full">
                    <label className="label">
                      <span className="label-text font-medium">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full focus:input-primary transition-all"
                      value={signupData.password}
                      onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                      required
                    />
                    <p className="text-xs text-base-content/60 mt-1">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="form-control">
                    <label className="label cursor-pointer justify-start gap-3 mt-2">
                      <input type="checkbox" className="checkbox checkbox-sm checkbox-primary" required />
                      <span className="text-sm leading-tight text-base-content/80">
                        I agree to the{" "}
                        <span className="text-primary hover:underline cursor-pointer">terms of service</span> and{" "}
                        <span className="text-primary hover:underline cursor-pointer">privacy policy</span>
                      </span>
                    </label>
                  </div>
                </div>

                <button 
                  className="btn btn-primary w-full shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all" 
                  type="submit"
                  disabled={isPending}
                >
                  {isPending ? (
                    <>
                      <span className="loading loading-spinner loading-sm"></span>
                      Creating Account...
                    </>
                  ) : (
                    "Create Account"
                  )}
                </button>

                <div className="text-center mt-6">
                  <p className="text-sm text-base-content/70">
                    Already have an account?{" "}
                    <Link to="/login" className="text-primary font-medium hover:underline">
                      Sign in
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* SIGNUP FORM - RIGHT SIDE */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 items-center justify-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] left-[-10%] w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>
          
          <div className="max-w-md p-8 relative z-10">
            {/* Illustration */}
            <div className="relative aspect-square max-w-sm mx-auto drop-shadow-xl hover:scale-105 transition-transform duration-500">
              <img src="/Video call-bro.png" alt="Language connection illustration" className="w-full h-full object-contain" />
            </div>

            <div className="text-center space-y-3 mt-8">
              <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-secondary">
                Connect with language partners worldwide
              </h2>
              <p className="text-base-content/70 font-medium leading-relaxed">
                Practice conversations, make friends, and improve your language skills together seamlessly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
