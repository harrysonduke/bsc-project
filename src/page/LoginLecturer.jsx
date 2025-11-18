import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";
import Logo from "/trackAS.png";
import loginImg from "/LoginLecturer.jpg";
import Input from "../component/Input";
import { Link } from "react-router-dom";
import Spinner from "../component/Spinner";
import toast from "react-hot-toast";
import { FiMail, FiLock, FiLogIn } from "react-icons/fi";

const LoginLecturer = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      toast.success("Welcome back! 🎉");
      navigate("/classDetails");
    } catch (error) {
      setError(error.error_description || error.message);
      toast.error(error.error_description || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Left Side - Form */}
        <div className="flex items-center justify-center p-6 lg:p-12">
          <div className="w-full max-w-md">
            {/* Logo and Header */}
            <div className="text-center mb-8">
              <img src={Logo} alt="login logo" className="w-24 mx-auto mb-4" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Welcome Back!
              </h1>
              <p className="text-gray-600">Login to continue managing your classes</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email */}
              <div className="relative">
                <div className="absolute left-4 top-12 text-purple-600">
                  <FiMail />
                </div>
                <div className="pl-8">
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="your.email@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute left-4 top-12 text-blue-600">
                  <FiLock />
                </div>
                <div className="pl-8">
                  <Input
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Show Password Toggle */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={showPassword}
                    onChange={(e) => setShowPassword(e.target.checked)}
                    className="checkbox checkbox-sm checkbox-primary"
                  />
                  <label className="text-sm text-gray-700">Show password</label>
                </div>
                <button
                  type="button"
                  className="text-sm text-blue-600 hover:text-purple-600 font-semibold transition-colors"
                >
                  Forgot Password?
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4">
                  <p className="text-red-800 text-sm font-semibold">⚠️ {error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                className="w-full btn bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none hover:shadow-xl transition-all text-lg py-4"
                type="submit"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Spinner />
                    Logging in...
                  </>
                ) : (
                  <>
                    <FiLogIn /> Login to Dashboard
                  </>
                )}
              </button>

              {/* Register Link */}
              <p className="text-center text-gray-600">
                Don't have an account?{" "}
                <Link
                  className="text-blue-600 font-semibold hover:text-purple-600 transition-colors"
                  to={"/registerLecturer"}
                >
                  Register now
                </Link>
              </p>
            </form>

            {/* Trust Badges */}
            <div className="mt-8 flex items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <span className="text-green-600">🔒</span>
                <span>Secure Login</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">⚡</span>
                <span>Fast Access</span>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="mt-8 grid grid-cols-3 gap-4">
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <div className="text-xl font-bold text-blue-600">1000+</div>
                <div className="text-xs text-gray-600">Lecturers</div>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <div className="text-xl font-bold text-purple-600">50K+</div>
                <div className="text-xs text-gray-600">Students</div>
              </div>
              <div className="text-center p-3 bg-white rounded-xl shadow-sm">
                <div className="text-xl font-bold text-green-600">99%</div>
                <div className="text-xs text-gray-600">Uptime</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image with Overlay */}
        <div className="hidden lg:block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-purple-600/40 z-10"></div>
          <img
            src={loginImg}
            alt="login screen"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center z-20 p-12">
            <div className="text-white text-center max-w-lg">
              <h2 className="text-5xl font-bold mb-6">Smart Attendance</h2>
              <p className="text-xl mb-8 leading-relaxed">
                Track attendance seamlessly with QR codes and geolocation verification
              </p>
              <div className="space-y-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-left">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                      📊
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Real-time Analytics</h3>
                      <p className="text-sm text-blue-100">Track attendance trends instantly</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-6 text-left">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center text-2xl">
                      🎯
                    </div>
                    <div>
                      <h3 className="font-bold text-lg">Easy to Use</h3>
                      <p className="text-sm text-blue-100">Simple interface for everyone</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LoginLecturer;