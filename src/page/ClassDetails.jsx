import { Link } from "react-router-dom";
import LogoutButton from "../component/LogoutButton";
import useUserDetails from "../hooks/useUserDetails";
import logo from "../../public/trackAS.png";
import { FiBook, FiBarChart2, FiPlusCircle } from "react-icons/fi";

const ClassDetails = () => {
  const { userDetails } = useUserDetails();
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex justify-end">
          <LogoutButton />
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center justify-center min-h-[80vh]">
          {/* Logo and Welcome Section */}
          <div className="text-center mb-12 animate-fade-in">
            <div className="mb-6">
              <img src={logo} alt="logo" className="w-32 mx-auto" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
              Welcome back,
            </h1>
            <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {userDetails?.fullName || "Lecturer"}
            </h2>
            <p className="text-gray-600 mt-4 text-lg">
              What would you like to do today?
            </p>
          </div>

          {/* Action Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
            {/* Previous Classes Card */}
            <Link to="/previousClass" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiBook className="text-blue-600 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Previous Classes
                  </h3>
                  <p className="text-gray-600 text-sm">
                    View and manage your past classes and attendance records
                  </p>
                  <div className="mt-4 text-blue-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    View Classes
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Analytics Card */}
            <Link to="/analytics" className="group">
              <div className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiBarChart2 className="text-purple-600 text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2">
                    Analytics
                  </h3>
                  <p className="text-gray-600 text-sm">
                    Track attendance trends and class statistics
                  </p>
                  <div className="mt-4 text-purple-600 font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    View Stats
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>

            {/* Create Class Card */}
            <Link to="/classSchedule" className="group">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 p-8 border border-gray-100">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <FiPlusCircle className="text-white text-2xl" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">
                    Create New Class
                  </h3>
                  <p className="text-blue-100 text-sm">
                    Schedule a new class and generate QR code
                  </p>
                  <div className="mt-4 text-white font-semibold flex items-center gap-2 group-hover:gap-3 transition-all">
                    Get Started
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Quick Stats Section */}
          <div className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-4 w-full max-w-4xl">
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <p className="text-gray-600 text-sm mb-1">Total Classes</p>
              <p className="text-2xl font-bold text-blue-600">-</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <p className="text-gray-600 text-sm mb-1">Active Now</p>
              <p className="text-2xl font-bold text-green-600">-</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <p className="text-gray-600 text-sm mb-1">Attendance</p>
              <p className="text-2xl font-bold text-purple-600">-</p>
            </div>
            <div className="bg-white rounded-xl p-4 shadow-md text-center">
              <p className="text-gray-600 text-sm mb-1">This Week</p>
              <p className="text-2xl font-bold text-orange-600">-</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClassDetails;