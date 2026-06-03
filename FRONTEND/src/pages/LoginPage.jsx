import { useState } from "react";
import { ShipWheelIcon } from "lucide-react";
import { Link } from "react-router-dom";
import useLogin from "../hooks/useLogin";

const LoginPage = () => {
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });

  const { isPending, error, loginMutation } = useLogin();

  const handleLogin = (e) => {
    e.preventDefault();
    loginMutation(loginData);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-base-200">
      <div className="flex flex-col lg:flex-row w-full max-w-5xl mx-auto bg-base-100 rounded-3xl shadow-2xl overflow-hidden border border-base-300">
        {/* LOGIN FORM SECTION */}
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

          {/* ERROR MESSAGE DISPLAY */}
          {error && (
            <div className="alert alert-error mb-6 shadow-sm">
              <span>{error?.response?.data?.message || error.message || "An error occurred"}</span>
            </div>
          )}

          <div className="w-full">
            <form onSubmit={handleLogin}>
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1">Welcome Back</h2>
                  <p className="text-sm text-base-content/70">
                    Sign in to your account to continue your language journey
                  </p>
                </div>

                <div className="flex flex-col gap-5">
                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text font-medium">Email</span>
                    </label>
                    <input
                      type="email"
                      placeholder="hello@example.com"
                      className="input input-bordered w-full focus:input-primary transition-all"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control w-full space-y-2">
                    <label className="label">
                      <span className="label-text font-medium">Password</span>
                    </label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      className="input input-bordered w-full focus:input-primary transition-all"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      required
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="btn btn-primary w-full shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all mt-2" 
                    disabled={isPending}
                  >
                    {isPending ? (
                      <>
                        <span className="loading loading-spinner loading-sm"></span>
                        Signing in...
                      </>
                    ) : (
                      "Sign In"
                    )}
                  </button>

                  <div className="text-center mt-6">
                    <p className="text-sm text-base-content/70">
                      Don't have an account?{" "}
                      <Link to="/signup" className="text-primary font-medium hover:underline">
                        Create one
                      </Link>
                    </p>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* IMAGE SECTION */}
        <div className="hidden lg:flex w-full lg:w-1/2 bg-gradient-to-br from-primary/10 via-secondary/10 to-primary/5 items-center justify-center relative overflow-hidden">
          {/* Decorative elements */}
          <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-primary/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-64 h-64 bg-secondary/20 rounded-full blur-3xl"></div>

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
export default LoginPage;
