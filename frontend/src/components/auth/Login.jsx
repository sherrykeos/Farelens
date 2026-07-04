import React, { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../../context/AuthContext";
import { MoveLeft } from "lucide-react";

const Login = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      toast.success("Welcome back!");
    } catch (err) {
      setError(err.response?.data?.detail || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed w-full h-full z-10 flex flex-col justify-center items-center lg:items-end bg-[url('/Image/authImg2.jpg')] bg-cover bg-center">  
        
      <div className="flex flex-col items-center gap-6 w-full px-4 sm:px-0 lg:mr-45 lg:w-auto">

        <a
        href="/"
        className=" flex gap-2 text-white/70 hover:text-white transition-colors duration-300 items-center mb-4"
      >
        <MoveLeft />
        Back to landing page
      </a>

      <div
        className="relative z-10 w-full shadow-2xl"
        style={{ maxWidth: 480 }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            borderRadius: 13,
            padding: 3,
            background:
              "linear-gradient(135deg, rgba(217,217,217,0.76), rgba(217,217,217,0.26))",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
            maskComposite: "exclude",
          }}
        />
        <div
          className="relative w-full p-8 sm:p-14 text-white backdrop-blur-xl"
          style={{
            borderRadius: 13,
            background: "rgba(212, 212, 212, 0.10)",
          }}
        >
          <p className="text-center mb-1 text-lg tracking-wider">FareLens</p>
          <h1 className="text-4xl sm:text-5xl font-bold text-center mb-2">
            Welcome back
          </h1>
          <p className="text-base text-white/70 text-center mb-10">
            Please Enter Your Detail
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-7">
            <div>
              <label className="block text-base font-semibold mb-2">
                E-mail
              </label>
              <input
                type="email"
                className="w-full bg-transparent border-b border-white/40 pb-3 text-lg text-white placeholder-white/40 focus:outline-none focus:border-white"
                placeholder="Enter Your E-mail Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>
            <div>
              <label className="block text-base font-semibold mb-2">
                Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-transparent border-b border-white/40 pb-3 text-lg text-white placeholder-white/40 focus:outline-none focus:border-white"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="flex items-center justify-between text-sm text-white/70">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                />
                see your password
              </label>
              <Link
                to="/forgot-password"
                className="underline hover:text-white transition-colors duration-300"
              >
                Forgot password?
              </Link>
            </div>

            {error && (
              <p className="text-sm text-red-300 text-center">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="mx-auto mt-2 px-12 py-3.5 rounded-full border border-white/50 text-lg text-white font-semibold hover:bg-white/10 transition-colors duration-300"
            >
              {loading ? "Logging in..." : "Log In"}
            </button>
          </form>

          <p className="text-center text-sm text-white/70 mt-8">
            Are you new here !{" "}
            <Link
              to="/register"
              className="underline font-semibold hover:text-white transition-colors duration-300"
            >
              Click here
            </Link>
          </p>
        </div>
      </div>
      </div>
    </div>
  );
};

export default Login;
