import { useState, useEffect } from "react";
import Input from "../component/Input";
import MapModal from "../component/MapModal";
import QRCodeModal from "../component/QRCodeModal";
import scheduleImg from "../../public/scheduleImg.jpg";
import logo from "../../public/trackAS.png";
import { supabase } from "../utils/supabaseClient";
import useUserDetails from "../hooks/useUserDetails";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";
import { FiMapPin, FiClock, FiCalendar, FiFileText, FiBook } from "react-icons/fi";

const VERCEL_URL = import.meta.env.VITE_VERCEL_URL;

const ClassSchedule = () => {
  const { userDetails, loading } = useUserDetails();

  const [formData, setFormData] = useState({
    courseTitle: "",
    courseCode: "",
    lectureVenue: "",
    time: "",
    date: "",
    note: "",
  });

  const [selectedLocationCordinate, setSelectedLocationCordinate] = useState(null);
  const [qrData, setQrData] = useState("");
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLocationChange = (locationName, coordinate) => {
    setFormData({ ...formData, lectureVenue: locationName });
    setSelectedLocationCordinate(coordinate);
  };

  const lecturerId = userDetails?.id;

  useEffect(() => {
    console.log("ClassSchedule - User Details:", userDetails);
    console.log("ClassSchedule - Lecturer ID:", lecturerId);
  }, [userDetails, lecturerId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    console.log("Submitting with Lecturer ID:", lecturerId);

    if (loading) {
      toast.error("Please wait, loading your profile...");
      setIsSubmitting(false);
      return;
    }

    if (!lecturerId) {
      toast.error("Lecturer profile not found. Please log out and register again.");
      console.error("User details:", userDetails);
      setIsSubmitting(false);
      return;
    }

    const { courseTitle, courseCode, lectureVenue, time, date, note } = formData;

    const sessionToken = `${courseCode}-${Date.now()}`;

    const registrationLink = `${VERCEL_URL}/attendance?sessionToken=${encodeURIComponent(
      sessionToken
    )}&courseCode=${encodeURIComponent(courseCode)}&lat=${
      selectedLocationCordinate?.lat
    }&lng=${selectedLocationCordinate?.lng}`;

    const qrCodeDataUrl = await new Promise((resolve) => {
      const svg = document.createElement("div");
      const qrCode = <QRCodeSVG value={registrationLink} size={256} />;
      import("react-dom/client").then((ReactDOM) => {
        ReactDOM.createRoot(svg).render(qrCode);
        setTimeout(() => {
          const svgString = new XMLSerializer().serializeToString(
            svg.querySelector("svg")
          );
          const dataUrl = `data:image/svg+xml;base64,${btoa(svgString)}`;
          resolve(dataUrl);
        }, 0);
      });
    });

    console.log("About to insert class with data:", {
      lecturerId,
      className: courseTitle,
      classCode: courseCode,
    });

    const { data, error } = await supabase
      .from("classes")
      .insert([
        {
          lecturerId: lecturerId,
          className: courseTitle,
          classCode: courseCode,
          classDate: date,
          startTime: time,
          endTime: time,
          locationName: lectureVenue,
          latitude: selectedLocationCordinate?.lat,
          longitude: selectedLocationCordinate?.lng,
          sessionToken: sessionToken,
          qrCodeData: qrCodeDataUrl,
          isActive: true,
          description: note,
        },
      ])
      .select("id");

    if (error) {
      toast.error(`Error inserting class schedule data, ${error.message}`);
      console.error("Error inserting data:", error);
    } else {
      toast.success("Class schedule created successfully!");

      const generatedClassId = data[0]?.id;
      const updatedRegistrationLink = `${VERCEL_URL}/attendance?classId=${encodeURIComponent(
        generatedClassId
      )}&sessionToken=${encodeURIComponent(sessionToken)}&courseCode=${encodeURIComponent(
        courseCode
      )}&lat=${selectedLocationCordinate?.lat}&lng=${selectedLocationCordinate?.lng}`;

      setQrData(updatedRegistrationLink);
      setIsQRModalOpen(true);

      // Reset form
      setFormData({
        courseTitle: "",
        courseCode: "",
        lectureVenue: "",
        time: "",
        date: "",
        note: "",
      });
      setSelectedLocationCordinate(null);
    }

    setIsSubmitting(false);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="flex flex-col lg:flex-row">
          {/* Left Side - Form */}
          <div className="w-full lg:w-1/2 p-6 lg:p-12 flex flex-col">
            {/* Back Button */}
            <div className="mb-6">
              <Link to="/classDetails">
                <button className="btn btn-sm rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-none text-white hover:shadow-lg transition-all">
                  ← Back
                </button>
              </Link>
            </div>

            {/* Header */}
            <div className="flex-1 overflow-y-auto max-w-2xl mx-auto w-full">
              <div className="text-center mb-8">
                <img src={logo} alt="logo" className="w-24 mx-auto mb-4" />
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
                  Create New Class
                </h1>
                <p className="text-gray-600">Fill in the details to schedule your class</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Course Title */}
                <div className="relative">
                  <div className="absolute left-3 top-12 text-blue-600">
                    <FiBook />
                  </div>
                  <div className="pl-8">
                    <Input
                      label="Course Title"
                      name="courseTitle"
                      type="text"
                      onChange={handleInputChange}
                      value={formData.courseTitle}
                      required={true}
                      placeholder="e.g., Introduction to Computer Science"
                    />
                  </div>
                </div>

                {/* Course Code */}
                <div className="relative">
                  <div className="absolute left-3 top-12 text-purple-600">
                    <FiFileText />
                  </div>
                  <div className="pl-8">
                    <Input
                      label="Course Code"
                      name="courseCode"
                      type="text"
                      onChange={handleInputChange}
                      value={formData.courseCode}
                      required={true}
                      placeholder="e.g., CSC101"
                    />
                  </div>
                </div>

                {/* Location Selector */}
                <div className="relative bg-white rounded-xl p-4 shadow-md border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Lecture Venue
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-red-600">
                      <FiMapPin />
                    </div>
                    <input
                      type="text"
                      value={formData.lectureVenue}
                      readOnly
                      required
                      placeholder="Click to select location on map"
                      className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMapModalOpen(true)}
                    className="mt-3 w-full btn bg-gradient-to-r from-green-500 to-emerald-500 text-white border-none hover:shadow-lg transition-all"
                  >
                    <FiMapPin /> Select Location on Map
                  </button>
                </div>

                {/* Date and Time */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative">
                    <div className="absolute left-3 top-12 text-orange-600">
                      <FiCalendar />
                    </div>
                    <div className="pl-8">
                      <Input
                        name="date"
                        type="date"
                        label="Date"
                        onChange={handleInputChange}
                        value={formData.date}
                        required={true}
                      />
                    </div>
                  </div>

                  <div className="relative">
                    <div className="absolute left-3 top-12 text-indigo-600">
                      <FiClock />
                    </div>
                    <div className="pl-8">
                      <Input
                        name="time"
                        type="time"
                        label="Time"
                        onChange={handleInputChange}
                        value={formData.time}
                        required={true}
                      />
                    </div>
                  </div>
                </div>

                {/* Note */}
                <div className="bg-white rounded-xl p-4 shadow-md border border-gray-200">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Additional Notes (Optional)
                  </label>
                  <textarea
                    name="note"
                    value={formData.note}
                    onChange={handleInputChange}
                    placeholder="Any special instructions or notes for students..."
                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    rows="3"
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full btn bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none hover:shadow-xl transition-all text-lg py-4 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <span className="loading loading-spinner"></span>
                      Generating QR Code...
                    </>
                  ) : (
                    <>
                      🎯 Generate QR Code
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Right Side - Image */}
          <div className="hidden lg:flex w-1/2 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 to-purple-600/20 z-10"></div>
            <img
              src={scheduleImg}
              alt="Schedule"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="bg-white/10 backdrop-blur-md rounded-3xl p-8 text-white text-center max-w-md">
                <h2 className="text-3xl font-bold mb-4">Quick & Easy</h2>
                <p className="text-lg">
                  Create your class schedule in seconds and generate a QR code for seamless attendance tracking
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modals */}
        {isMapModalOpen && (
          <MapModal
            onClose={() => setIsMapModalOpen(false)}
            onSelectLocation={handleLocationChange}
          />
        )}

        {isQRModalOpen && (
          <QRCodeModal qrData={qrData} onClose={() => setIsQRModalOpen(false)} />
        )}
      </div>
    </>
  );
};

export default ClassSchedule;