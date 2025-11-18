import { useState } from "react";
import { supabase } from "../utils/supabaseClient";
import Input from "../component/Input";
import Logo from "/trackAS.png";
import registerImg from "/registerImg.jpg";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import Footer from "../component/Footer";
import { FiUser, FiMail, FiLock, FiPhone, FiCheckCircle } from "react-icons/fi";

const RegisterLecturer = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    if (!fullName || !email || !phoneNumber) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      setIsLoading(false);
      return;
    }

    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            fullName: fullName,
            phone_number: phoneNumber,
          },
        },
      });

      if (authError) throw authError;

      toast.success("Registration successful! Welcome aboard! 🎉");
      navigate("/loginLecturer");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message);
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
              <img src={Logo} alt="logo" className="w-24 mx-auto mb-4" />
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Create Account
              </h1>
              <p className="text-gray-600">Join us to manage your classes efficiently</p>
            </div>

            {/* Registration Form */}
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Full Name */}
              <div className="relative">
                <div className="absolute left-4 top-12 text-blue-600">
                  <FiUser />
                </div>
                <div className="pl-8">
                  <Input
                    type="text"
                    label="Full Name"
                    placeholder="Dr. John Doe"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email */}
              <div className="relative">
                <div className="absolute left-4 top-12 text-purple-600">
                  <FiMail />
                </div>
                <div className="pl-8">
                  <Input
                    type="email"
                    label="Email Address"
                    placeholder="john.doe@university.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="relative">
                <div className="absolute left-4 top-12 text-green-600">
                  <FiPhone />
                </div>
                <div className="pl-8">
                  <Input
                    type="tel"
                    label="Phone Number"
                    placeholder="+234 800 000 0000"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="relative">
                <div className="absolute left-4 top-12 text-orange-600">
                  <FiLock />
                </div>
                <div className="pl-8">
                  <Input
                    type={showPassword ? "text" : "password"}
                    label="Password"
                    placeholder="At least 6 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <div className="absolute left-4 top-12 text-red-600">
                  <FiLock />
                </div>
                <div className="pl-8">
                  <Input
                    type={showPassword ? "text" : "password"}
                    label="Confirm Password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Show Password Toggle */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showPassword}
                  onChange={(e) => setShowPassword(e.target.checked)}
                  className="checkbox checkbox-sm checkbox-primary"
                />
                <label className="text-sm text-gray-700">Show passwords</label>
              </div>

              {/* Password Strength Indicator */}
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <FiCheckCircle
                      className={password.length >= 6 ? "text-green-600" : "text-gray-400"}
                    />
                    <span className={password.length >= 6 ? "text-green-600" : "text-gray-600"}>
                      At least 6 characters
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <FiCheckCircle
                      className={
                        password === confirmPassword && confirmPassword
                          ? "text-green-600"
                          : "text-gray-400"
                      }
                    />
                    <span
                      className={
                        password === confirmPassword && confirmPassword
                          ? "text-green-600"
                          : "text-gray-600"
                      }
                    >
                      Passwords match
                    </span>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full btn bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none hover:shadow-xl transition-all text-lg py-4"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <span className="loading loading-spinner"></span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <FiCheckCircle /> Create Account
                  </>
                )}
              </button>

              {/* Login Link */}
              <p className="text-center text-gray-600">
                Already have an account?{" "}
                <Link
                  className="text-blue-600 font-semibold hover:text-purple-600 transition-colors"
                  to={"/loginLecturer"}
                >
                  Login here
                </Link>
              </p>
            </form>

            {/* Features */}
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <div className="text-2xl mb-1">📊</div>
                <p className="text-xs text-gray-600">Analytics</p>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <div className="text-2xl mb-1">📱</div>
                <p className="text-xs text-gray-600">QR Codes</p>
              </div>
              <div className="p-3 bg-white rounded-xl shadow-sm">
                <div className="text-2xl mb-1">🔒</div>
                <p className="text-xs text-gray-600">Secure</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Image with Overlay */}
        <div className="hidden lg:block relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/40 to-purple-600/40 z-10"></div>
          <img
            src={registerImg}
            alt="register hero"
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 flex items-center justify-center z-20 p-12">
            <div className="text-white text-center max-w-lg">
              <h2 className="text-5xl font-bold mb-6">Welcome to NACOS AMS</h2>
              <p className="text-xl mb-8 leading-relaxed">
                The smart way to manage classroom attendance with QR codes and real-time verification
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">100%</div>
                  <div className="text-sm">Accurate</div>
                </div>
                <div className="bg-white/10 backdrop-blur-md rounded-xl p-4">
                  <div className="text-3xl font-bold mb-1">Fast</div>
                  <div className="text-sm">Setup</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </section>
  );
};

export default RegisterLecturer;