import toast from "react-hot-toast";
import { supabase } from "../utils/supabaseClient";
import useUserDetails from "../hooks/useUserDetails";
import { useEffect, useState } from "react";
import AttendanceListModal from "../component/AttendanceListModal";
import EditClassModal from "../component/EditClassModal";
import { Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import { FiEdit, FiTrash2, FiEye, FiCalendar, FiClock, FiMapPin } from "react-icons/fi";
import Footer from "../component/Footer";
import dayjs from "dayjs";

const PreviousClass = () => {
  const { userDetails } = useUserDetails();
  const [classes, setClasses] = useState([]);
  const [selectedClass, setSelectedClass] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const lecturerId = userDetails?.id;

  const fetchClasses = async () => {
    if (!lecturerId) return;

    setIsLoading(true);

    const { data, error } = await supabase
      .from("classes")
      .select("*")
      .eq("lecturerId", lecturerId)
      .order("classDate", { ascending: false });

    if (error) {
      toast.error(`Error fetching class data: ${error.message}`);
      console.error("Fetch error:", error);
    } else {
      setClasses(data);
    }

    setIsLoading(false);
  };

  useEffect(() => {
    fetchClasses();
  }, [lecturerId]);

  const handleViewAttendance = (classItem) => {
    setSelectedClass(classItem);
    setIsModalOpen(true);
  };

  const handleEditClass = (classItem) => {
    setSelectedClass(classItem);
    setIsEditModalOpen(true);
  };

  const handleDeleteClass = async (classId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this class? This will also delete all attendance records."
    );

    if (!confirmDelete) return;

    const { error } = await supabase.from("classes").delete().eq("id", classId);

    if (error) {
      toast.error(`Error deleting class: ${error.message}`);
    } else {
      toast.success("Class deleted successfully!");
      fetchClasses();
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedClass(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedClass(null);
    fetchClasses();
  };

  return (
    <>
      <section className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 pb-20">
        <div className="max-w-7xl mx-auto px-6 pt-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Link to="/classDetails">
              <button className="btn btn-sm rounded-full bg-gradient-to-r from-blue-600 to-purple-600 border-none text-white hover:shadow-lg transition-all">
                <BiArrowBack />
                Back
              </button>
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold text-center flex-1 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              My Classes
            </h1>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="loading loading-spinner loading-lg text-blue-600"></div>
            </div>
          ) : (
            <>
              {classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {classes.map((classItem) => {
                    const isPast = dayjs(classItem.classDate).isBefore(dayjs(), 'day');
                    
                    return (
                      <div
                        key={classItem.id}
                        className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden border border-gray-100"
                      >
                        {/* Card Header */}
                        <div className={`p-6 ${classItem.isActive ? 'bg-gradient-to-r from-green-500 to-emerald-500' : 'bg-gradient-to-r from-gray-400 to-gray-500'}`}>
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 bg-white bg-opacity-30 backdrop-blur-sm rounded-full text-xs font-semibold text-white">
                                  {classItem.classCode}
                                </span>
                                {classItem.isActive && (
                                  <span className="px-3 py-1 bg-white bg-opacity-30 backdrop-blur-sm rounded-full text-xs font-semibold text-white animate-pulse">
                                    Active
                                  </span>
                                )}
                              </div>
                              <h3 className="text-xl font-bold text-white mb-1">
                                {classItem.className}
                              </h3>
                            </div>
                          </div>
                        </div>

                        {/* Card Body */}
                        <div className="p-6">
                          {/* Class Details */}
                          <div className="space-y-3 mb-6">
                            <div className="flex items-center gap-3 text-gray-700">
                              <FiCalendar className="text-blue-600" />
                              <span className="text-sm">
                                {dayjs(classItem.classDate).format("MMM DD, YYYY")}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-gray-700">
                              <FiClock className="text-purple-600" />
                              <span className="text-sm">
                                {classItem.startTime} - {classItem.endTime}
                              </span>
                            </div>
                            <div className="flex items-start gap-3 text-gray-700">
                              <FiMapPin className="text-red-600 mt-1" />
                              <span className="text-sm flex-1">
                                {classItem.locationName}
                              </span>
                            </div>
                          </div>

                          {/* Description */}
                          {classItem.description && (
                            <div className="mb-6">
                              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                                {classItem.description}
                              </p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewAttendance(classItem)}
                              className="flex-1 btn btn-sm bg-green-500 hover:bg-green-600 text-white border-none"
                            >
                              <FiEye />
                              View
                            </button>
                            <button
                              onClick={() => handleEditClass(classItem)}
                              className="btn btn-sm bg-blue-500 hover:bg-blue-600 text-white border-none"
                              title="Edit Class"
                            >
                              <FiEdit />
                            </button>
                            <button
                              onClick={() => handleDeleteClass(classItem.id)}
                              className="btn btn-sm bg-red-500 hover:bg-red-600 text-white border-none"
                              title="Delete Class"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-16">
                  <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FiCalendar className="text-gray-400 text-4xl" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-2">
                    No Classes Yet
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Start by creating your first class
                  </p>
                  <Link to="/classSchedule">
                    <button className="btn bg-gradient-to-r from-blue-600 to-purple-600 text-white border-none">
                      Create Class
                    </button>
                  </Link>
                </div>
              )}
            </>
          )}

          {/* Modals */}
          <AttendanceListModal
            isOpen={isModalOpen}
            selectedClass={selectedClass}
            onClose={handleCloseModal}
          />

          <EditClassModal
            isOpen={isEditModalOpen}
            selectedClass={selectedClass}
            onClose={handleCloseEditModal}
          />
        </div>
      </section>
      <Footer />
    </>
  );
};

export default PreviousClass;