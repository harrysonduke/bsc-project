import { CloseCircle } from "iconsax-react";
import { saveAs } from "file-saver";
import * as XLSX from "xlsx";
import { useEffect, useState } from "react";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";

/* eslint-disable react/prop-types */
const AttendanceListModal = ({ isOpen, selectedClass, onClose }) => {
  const [attendees, setAttendees] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch attendance records when modal opens
  useEffect(() => {
    const fetchAttendance = async () => {
      if (!isOpen || !selectedClass?.id) return;

      setIsLoading(true);

      const { data, error } = await supabase
        .from("attendance")
        .select("*")
        .eq("classId", selectedClass.id)
        .order("markedAt", { ascending: false });

      if (error) {
        toast.error(`Error fetching attendance: ${error.message}`);
        console.error("Attendance fetch error:", error);
      } else {
        console.log("Fetched attendance:", data); // DEBUG
        setAttendees(data || []);
      }

      setIsLoading(false);
    };

    fetchAttendance();
  }, [isOpen, selectedClass]);

  if (!isOpen || !selectedClass) return null;

  // Function to convert the attendees list to CSV
  const exportToCSV = () => {
    if (!attendees || attendees.length === 0) {
      toast.error("No attendance records to export");
      return;
    }

    const csvRows = [
      ["Name", "Matric No", "Attended At", "Distance (m)", "Verified"], // CSV headers
      ...attendees.map((attendee) => [
        attendee.studentName,
        attendee.studentId,
        new Date(attendee.markedAt).toLocaleString([], {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        attendee.distanceFromClass?.toFixed(2) || "N/A",
        attendee.isVerified ? "Yes" : "No",
      ]),
    ];

    const csvContent = csvRows.map((row) => row.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    saveAs(
      blob,
      `attendance_${selectedClass.classCode}_${new Date().toISOString()}.csv`
    );
    toast.success("CSV exported successfully!");
  };

  // Function to convert the attendees list to Excel
  const exportToExcel = () => {
    if (!attendees || attendees.length === 0) {
      toast.error("No attendance records to export");
      return;
    }

    const ws = XLSX.utils.json_to_sheet(
      attendees.map((attendee) => ({
        Name: attendee.studentName,
        Matric_No: attendee.studentId,
        Attended_At: new Date(attendee.markedAt).toLocaleString([], {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        Distance_Meters: attendee.distanceFromClass?.toFixed(2) || "N/A",
        Verified: attendee.isVerified ? "Yes" : "No",
      }))
    );

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([wbout], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(
      blob,
      `attendance_${selectedClass.classCode}_${new Date().toISOString()}.xlsx`
    );
    toast.success("Excel file exported successfully!");
  };

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg relative h-[80vh] overflow-hidden">
        <h2 className="text-xl font-bold underline mb-4 text-black">
          Attendance List - {selectedClass.classCode}
        </h2>
        <button
          onClick={onClose}
          className="absolute top-2 right-2 hover:text-red-500 text-black"
        >
          <CloseCircle variant="Bold" />
        </button>

        {/* Export buttons */}
        <div className="absolute top-10 right-3 flex space-x-2">
          <button
            onClick={exportToCSV}
            className="btn btn-xs font-bold text-white bg-blue-500 border-none"
            disabled={isLoading || attendees.length === 0}
          >
            Export CSV
          </button>
          <button
            onClick={exportToExcel}
            className="btn btn-xs font-bold text-white bg-green-500 border-none"
            disabled={isLoading || attendees.length === 0}
          >
            Export Excel
          </button>
        </div>

        {/* List container */}
        <div className="overflow-y-auto max-h-[60vh] pr-2 scrollbar-hidden mt-8">
          {isLoading ? (
            <div className="flex justify-center items-center h-32">
              <div className="loading loading-spinner bg-blue-500"></div>
            </div>
          ) : attendees && attendees.length > 0 ? (
            attendees.map((attendee, index) => {
              const formattedTimestamp = new Date(
                attendee.markedAt
              ).toLocaleString([], {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={attendee.id}
                  className="mb-4 border-b pb-2 flex items-start"
                >
                  <span className="text-black text-sm font-semibold mr-2">
                    {index + 1}.
                  </span>
                  <div>
                    <p className="text-black uppercase text-sm font-semibold">
                      Name: {attendee.studentName}
                    </p>
                    <p className="text-black uppercase text-sm font-semibold">
                      Matric No: {attendee.studentId}
                    </p>
                    <p className="text-gray-800 text-sm">
                      Attended At: {formattedTimestamp}
                    </p>
                    <p className="text-gray-600 text-xs">
                      Distance: {attendee.distanceFromClass?.toFixed(2) || "N/A"} meters
                      {attendee.isVerified && (
                        <span className="text-green-600 ml-2">✓ Verified</span>
                      )}
                    </p>
                  </div>
                </div>
              );
            })
          ) : (
            <p className="text-center text-gray-600">
              No attendees found for this class.
            </p>
          )}
        </div>

        {/* Summary */}
        {!isLoading && attendees.length > 0 && (
          <div className="absolute bottom-4 left-6 right-6 bg-gray-100 p-3 rounded">
            <p className="text-sm font-semibold text-black">
              Total Attendance: {attendees.length}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceListModal;