import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import useUserDetails from "../hooks/useUserDetails";
import { Link } from "react-router-dom";
import { BiArrowBack } from "react-icons/bi";
import toast from "react-hot-toast";
import dayjs from "dayjs";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Bar, Pie } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const Analytics = () => {
  const { userDetails } = useUserDetails();
  const [classes, setClasses] = useState([]);
  const [attendanceStats, setAttendanceStats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const lecturerId = userDetails?.id;

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!lecturerId) return;

      setIsLoading(true);

      // Fetch all classes
      const { data: classesData, error: classesError } = await supabase
        .from("classes")
        .select("*")
        .eq("lecturerId", lecturerId)
        .order("classDate", { ascending: false });

      if (classesError) {
        toast.error("Error fetching classes");
        console.error(classesError);
        setIsLoading(false);
        return;
      }

      setClasses(classesData || []);

      // Fetch attendance for each class
      const stats = await Promise.all(
        classesData.map(async (classItem) => {
          const { data: attendanceData, error: attendanceError } =
            await supabase
              .from("attendance")
              .select("*")
              .eq("classId", classItem.id);

          if (attendanceError) {
            console.error("Error fetching attendance:", attendanceError);
            return {
              classCode: classItem.classCode,
              className: classItem.className,
              date: classItem.classDate,
              total: 0,
              verified: 0,
            };
          }

          return {
            classCode: classItem.classCode,
            className: classItem.className,
            date: classItem.classDate,
            total: attendanceData?.length || 0,
            verified:
              attendanceData?.filter((a) => a.isVerified).length || 0,
          };
        })
      );

      setAttendanceStats(stats);
      setIsLoading(false);
    };

    fetchAnalytics();
  }, [lecturerId]);

  // Calculate overall statistics
  const totalClasses = classes.length;
  const totalAttendance = attendanceStats.reduce(
    (sum, stat) => sum + stat.total,
    0
  );
  const averageAttendance =
    totalClasses > 0 ? (totalAttendance / totalClasses).toFixed(1) : 0;
  const activeClasses = classes.filter((c) => c.isActive).length;

  // Chart data for attendance by class
  const barChartData = {
    labels: attendanceStats.map((stat) => stat.classCode),
    datasets: [
      {
        label: "Total Attendance",
        data: attendanceStats.map((stat) => stat.total),
        backgroundColor: "rgba(59, 130, 246, 0.6)",
        borderColor: "rgba(59, 130, 246, 1)",
        borderWidth: 1,
      },
      {
        label: "Verified Attendance",
        data: attendanceStats.map((stat) => stat.verified),
        backgroundColor: "rgba(34, 197, 94, 0.6)",
        borderColor: "rgba(34, 197, 94, 1)",
        borderWidth: 1,
      },
    ],
  };

  // Pie chart data for active vs inactive classes
  const pieChartData = {
    labels: ["Active Classes", "Completed Classes"],
    datasets: [
      {
        data: [activeClasses, totalClasses - activeClasses],
        backgroundColor: ["rgba(34, 197, 94, 0.6)", "rgba(156, 163, 175, 0.6)"],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(156, 163, 175, 1)"],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top",
      },
    },
  };

  return (
    <div className="min-h-screen bg-gray-100 pb-20">
      <div className="max-w-7xl mx-auto px-6 pt-8">
        <div className="flex items-center mb-6">
          <Link to="/classDetails">
            <button className="btn btn-sm rounded-full bg-blue-500 border-none text-white">
              <BiArrowBack />
              Back
            </button>
          </Link>
          <h1 className="text-3xl font-bold text-center flex-1 text-gray-800">
            Analytics Dashboard
          </h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="loading loading-spinner loading-lg bg-blue-500"></div>
          </div>
        ) : (
          <>
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">
                  Total Classes
                </h3>
                <p className="text-4xl font-bold text-blue-600">
                  {totalClasses}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">
                  Active Classes
                </h3>
                <p className="text-4xl font-bold text-green-600">
                  {activeClasses}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">
                  Total Attendance
                </h3>
                <p className="text-4xl font-bold text-purple-600">
                  {totalAttendance}
                </p>
              </div>

              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-gray-600 text-sm font-semibold mb-2">
                  Avg. per Class
                </h3>
                <p className="text-4xl font-bold text-orange-600">
                  {averageAttendance}
                </p>
              </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Bar Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  Attendance by Class
                </h2>
                {attendanceStats.length > 0 ? (
                  <Bar data={barChartData} options={chartOptions} />
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No classes yet
                  </p>
                )}
              </div>

              {/* Pie Chart */}
              <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-xl font-bold mb-4 text-gray-800">
                  Class Status
                </h2>
                {totalClasses > 0 ? (
                  <Pie data={pieChartData} options={chartOptions} />
                ) : (
                  <p className="text-gray-600 text-center py-8">
                    No classes yet
                  </p>
                )}
              </div>
            </div>

            {/* Detailed Table */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold mb-4 text-gray-800">
                Class Details
              </h2>
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>Class Code</th>
                      <th>Class Name</th>
                      <th>Date</th>
                      <th>Total Attendance</th>
                      <th>Verified</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {attendanceStats.map((stat, index) => (
                      <tr key={index}>
                        <td className="font-semibold">{stat.classCode}</td>
                        <td>{stat.className}</td>
                        <td>{dayjs(stat.date).format("MMM DD, YYYY")}</td>
                        <td className="text-center">{stat.total}</td>
                        <td className="text-center text-green-600">
                          {stat.verified}
                        </td>
                        <td>
                          {classes[index]?.isActive ? (
                            <span className="badge badge-success text-white">
                              Active
                            </span>
                          ) : (
                            <span className="badge badge-ghost">Completed</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;