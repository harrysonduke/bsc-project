import { useState, useEffect } from "react";
import { CloseCircle } from "iconsax-react";
import { supabase } from "../utils/supabaseClient";
import toast from "react-hot-toast";
import Input from "./Input";
import MapModal from "./MapModal";

/* eslint-disable react/prop-types */
const EditClassModal = ({ isOpen, selectedClass, onClose }) => {
  const [formData, setFormData] = useState({
    className: "",
    classCode: "",
    classDate: "",
    startTime: "",
    endTime: "",
    locationName: "",
    description: "",
    isActive: false,
  });
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (selectedClass) {
      setFormData({
        className: selectedClass.className || "",
        classCode: selectedClass.classCode || "",
        classDate: selectedClass.classDate || "",
        startTime: selectedClass.startTime || "",
        endTime: selectedClass.endTime || "",
        locationName: selectedClass.locationName || "",
        description: selectedClass.description || "",
        isActive: selectedClass.isActive || false,
      });
      setSelectedLocation({
        lat: selectedClass.latitude,
        lng: selectedClass.longitude,
      });
    }
  }, [selectedClass]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleLocationChange = (locationName, coordinate) => {
    setFormData({ ...formData, locationName });
    setSelectedLocation(coordinate);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);

    const { error } = await supabase
      .from("classes")
      .update({
        className: formData.className,
        classCode: formData.classCode,
        classDate: formData.classDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        locationName: formData.locationName,
        latitude: selectedLocation?.lat,
        longitude: selectedLocation?.lng,
        description: formData.description,
        isActive: formData.isActive,
      })
      .eq("id", selectedClass.id);

    if (error) {
      toast.error(`Error updating class: ${error.message}`);
      console.error(error);
    } else {
      toast.success("Class updated successfully!");
      onClose();
    }

    setIsSaving(false);
  };

  if (!isOpen || !selectedClass) return null;

  return (
    <>
      <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl relative max-h-[90vh] overflow-y-auto">
          <h2 className="text-2xl font-bold mb-4 text-black">Edit Class</h2>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 hover:text-red-500 text-black"
          >
            <CloseCircle variant="Bold" size={24} />
          </button>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4">
              <Input
                label="Course Title"
                name="className"
                type="text"
                value={formData.className}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Course Code"
                name="classCode"
                type="text"
                value={formData.classCode}
                onChange={handleInputChange}
                required
              />

              <div className="relative">
                <Input
                  label="Lecture Venue"
                  name="locationName"
                  type="text"
                  value={formData.locationName}
                  readOnly
                  required
                />
                <button
                  type="button"
                  onClick={() => setIsMapModalOpen(true)}
                  className="btn absolute right-0 top-9 px-3 bg-green-500 text-white rounded-r-md hover:bg-green-600"
                >
                  Change Location
                </button>
              </div>

              <Input
                label="Date"
                name="classDate"
                type="date"
                value={formData.classDate}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Start Time"
                name="startTime"
                type="time"
                value={formData.startTime}
                onChange={handleInputChange}
                required
              />

              <Input
                label="End Time"
                name="endTime"
                type="time"
                value={formData.endTime}
                onChange={handleInputChange}
                required
              />

              <Input
                label="Note"
                name="description"
                type="text"
                value={formData.description}
                onChange={handleInputChange}
              />

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                  className="checkbox checkbox-primary"
                />
                <label className="text-black font-semibold">
                  Class is Active (Allow attendance)
                </label>
              </div>
            </div>

            <div className="flex gap-4 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="btn flex-1 bg-gray-300 text-black"
                disabled={isSaving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn flex-1 bg-blue-500 text-white"
                disabled={isSaving}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {isMapModalOpen && (
        <MapModal
          onClose={() => setIsMapModalOpen(false)}
          onSelectLocation={handleLocationChange}
        />
      )}
    </>
  );
};

export default EditClassModal;