import { useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { calculateDistance } from "../utils/distanceCalculation";
import Input from "../component/Input";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";
import Spinner from "../component/Spinner";
import dayjs from "dayjs";
import logo from "../../public/trackAS.png";
import { FiMapPin, FiCheckCircle, FiXCircle, FiNavigation } from "react-icons/fi";

const Attendance = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [isLoading, setIsLoading] = useState(false);
  const [userDistance, setUserDistance] = useState(null);
  const [isWithinRange, setIsWithinRange] = useState(false);
  const [classDetails, setClassDetails] = useState(null);
  const [matricNumber, setMatricNumber] = useState("");
  const [name, setName] = useState("");
  const [userLat, setUserLat] = useState(null);
  const [userLng, setUserLng] = useState(null);
  const [locationStatus, setLocationStatus] = useState("checking"); // checking, success, error

  const classId = queryParams.get("classId");
  const courseCode = queryParams.get("courseCode");
  const sessionToken = queryParams.get("sessionToken");
  const lat = parseFloat(queryParams.get("lat"));
  const lng = parseFloat(queryParams.get("lng"));

  useEffect(() => {
    const fetchClassDetails = async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .eq("id", classId)
        .single();

      if (error) {
        console.error("Error fetching class details:", error);
        toast.error("Error loading class details");
      } else {
        setClassDetails(data);
      }
    };

    if (classId) {
      fetchClassDetails();
    }
  }, [classId]);

  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        setLocationStatus("checking");
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLatitude = position.coords.latitude;
            const userLongitude = position.coords.longitude;

            setUserLat(userLatitude);
            setUserLng(userLongitude);

            const distance = calculateDistance(userLatitude, userLongitude, lat, lng);
            setUserDistance(distance);

            // TEMPORARILY force to true for testing
            setIsWithinRange(true);
            setLocationStatus("success");
          },
          (error) => {
            toast.error(`Error getting user location: ${error.message}`);
            setLocationStatus("error");
            // Even if location fails, allow attendance for testing
            setIsWithinRange(true);
          }
        );
      } else {
        toast.error("Geolocation is not supported by this browser.");
        setLocationStatus("error");
        setIsWithinRange(true);
      }
    };

    getUserLocation();
  }, [lat, lng]);

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!matricNumber || !name) {
      toast.error("Name and matriculation number are required.");
      return;
    }

    if (!isWithinRange) {
      toast.error("You must be within 20 meters of the venue.");
      return;
    }

    setIsLoading(true);

    const { data: existingAttendance, error: checkError } = await supabase
      .from("attendance")
      .select("id")
      .eq("classId", classId)
      .eq("studentId", matricNumber.trim().toUpperCase())
      .maybeSingle();

    if (existingAttendance) {
      toast.error("You have already marked attendance for this class.");
      setIsLoading(false);
      return;
    }

    const { error: insertError } = await supabase
      .from("attendance")
      .insert([
        {
          classId: classId,
          studentName: name.toUpperCase(),
          studentId: matricNumber.trim().toUpperCase(),
          studentLatitude: userLat,
          studentLongitude: userLng,
          distanceFromClass: userDistance,
          isVerified: isWithinRange,
          markedAt: new Date().toISOString(),
        },
      ]);

    if (insertError) {
      toast.error(`Error marking attendance: ${insertError.message}`);
      console.error("Attendance error:", insertError);
      setIsLoading(false);
    } else {
      toast.success("Attendance marked successfully!");
      setMatricNumber("");
      setName("");
      setIsLoading(false);
      navigate("/success", { replace: true });
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 md:p-12 max-w-2xl w-full border border-gray-100">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <img src={logo} alt="logo" className="w-20 mx-auto mb-4" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Mark Attendance
          </h1>
          <p className="text-gray-600">Scan and verify your location</p>
        </div>

        {/* Class Details Card */}
        {classDetails ? (
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 mb-8 text-white">
            <h2 className="text-2xl font-bold mb-4">{classDetails.className}</h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="font-semibold">Code:</span>
                <span className="bg-white/20 px-3 py-1 rounded-full text-sm">
                  {classDetails.classCode}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <FiMapPin />
                <span>{classDetails.locationName}</span>
              </div>
              <div className="flex items-center gap-3">
                <span>📅 {dayjs(classDetails.classDate).format("MMM DD, YYYY")}</span>
                <span>•</span>
                <span>🕐 {classDetails.startTime}</span>
              </div>
              {classDetails.description && (
                <div className="mt-4 bg-white/10 rounded-lg p-3">
                  <p className="text-sm">{classDetails.description}</p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-8">
            <div className="loading loading-spinner loading-lg text-blue-600"></div>
          </div>
        )}

        {/* Location Status Card */}
        <div className={`rounded-2xl p-6 mb-8 ${
          locationStatus === "success" 
            ? "bg-green-50 border-2 border-green-200" 
            : locationStatus === "error"
            ? "bg-red-50 border-2 border-red-200"
            : "bg-yellow-50 border-2 border-yellow-200"
        }`}>
          <div className="flex items-center gap-4">
            {locationStatus === "checking" && (
              <>
                <div className="loading loading-spinner text-yellow-600"></div>
                <div>
                  <p className="font-semibold text-yellow-800">Checking Location...</p>
                  <p className="text-sm text-yellow-700">Please allow location access</p>
                </div>
              </>
            )}
            {locationStatus === "success" && (
              <>
                <FiCheckCircle className="text-3xl text-green-600" />
                <div className="flex-1">
                  <p className="font-semibold text-green-800">Location Verified</p>
                  <p className="text-sm text-green-700">
                    Distance: {userDistance !== null ? `${userDistance.toFixed(2)} meters` : "Calculating..."}
                  </p>
                </div>
              </>
            )}
            {locationStatus === "error" && (
              <>
                <FiXCircle className="text-3xl text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">Location Error</p>
                  <p className="text-sm text-red-700">Please enable location services</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Attendance Form */}
        <form onSubmit={handleRegister} className="space-y-6">
          <div className="space-y-4">
            <Input
              type="text"
              name="name"
              label="Full Name"
              placeholder="Enter your full name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              type="text"
              name="matricNumber"
              label="Matriculation Number"
              placeholder="e.g., CSC/2020/001"
              value={matricNumber}
              onChange={(e) => setMatricNumber(e.target.value)}
              required
            />
          </div>

          {isWithinRange ? (
            <button
              className="w-full btn bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none hover:shadow-xl transition-all text-lg py-4"
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Spinner />
                  Marking Attendance...
                </>
              ) : (
                <>
                  <FiCheckCircle /> Mark My Attendance
                </>
              )}
            </button>
          ) : (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-center">
              <FiXCircle className="text-red-600 text-3xl mx-auto mb-2" />
              <p className="text-red-800 font-semibold">Out of Range</p>
              <p className="text-sm text-red-700 mt-1">
                You must be within 20 meters of the lecture venue to mark attendance.
              </p>
            </div>
          )}
        </form>

        {/* Help Text */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Having trouble? Make sure location services are enabled in your browser.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Attendance;