import { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, useMap, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import L from "leaflet";

// Fix for default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Custom red marker icon
const redIcon = new L.Icon({
  iconUrl:
    "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

/* eslint-disable react/prop-types */
const MapModal = ({ onClose, onSelectLocation }) => {
  const [loading, setLoading] = useState(false);
  const [selectedPosition, setSelectedPosition] = useState(null);
  const [locationName, setLocationName] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  // Abuja Building, University of Nigeria Nsukka coordinates
  const ABUJA_BUILDING = {
    lat: 6.8649,
    lng: 7.3950,
  };

  const reverseGeocode = async (lat, lng) => {
    setLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse`,
        {
          params: {
            format: "json",
            lat: lat,
            lon: lng,
            zoom: 18,
            addressdetails: 1,
          },
        }
      );
      return response.data.display_name;
    } catch (error) {
      console.error("Reverse geocoding failed:", error);
      return "Unknown location";
    } finally {
      setLoading(false);
    }
  };

  const searchLocation = async () => {
    if (!searchQuery.trim()) return;

    setLoading(true);
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search`,
        {
          params: {
            q: `${searchQuery}, University of Nigeria Nsukka`,
            format: "json",
            limit: 5,
            addressdetails: 1,
          },
        }
      );
      setSearchResults(response.data);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchResultClick = async (result) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);
    setSelectedPosition({ lat, lng });
    setLocationName(result.display_name);
    onSelectLocation(result.display_name, { lat, lng });
    setSearchResults([]);
    setSearchQuery("");
  };

  const MapEvents = () => {
    const map = useMap();

    useEffect(() => {
      if (!map) return;

      const handleClick = async (e) => {
        const { lat, lng } = e.latlng;
        setSelectedPosition({ lat, lng });
        const name = await reverseGeocode(lat, lng);
        setLocationName(name);
        onSelectLocation(name, { lat, lng });
      };

      map.on("click", handleClick);

      return () => {
        map.off("click", handleClick);
      };
    }, [map]);

    // Pan to selected position
    useEffect(() => {
      if (selectedPosition) {
        map.flyTo([selectedPosition.lat, selectedPosition.lng], 18, {
          duration: 1,
        });
      }
    }, [selectedPosition, map]);

    return null;
  };

  const handleConfirm = () => {
    if (selectedPosition) {
      onSelectLocation(locationName, selectedPosition);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-800 text-center mb-4">
            📍 Select Lecture Location
          </h2>
          <p className="text-sm text-gray-600 text-center mb-4">
            Map centered at Abuja Building, UNN
          </p>

          {/* Search Bar */}
          <div className="flex gap-2">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && searchLocation()}
              placeholder="Search for a location in UNN (e.g., Faculty of Engineering)"
              className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={searchLocation}
              disabled={loading}
              className="btn bg-blue-600 text-white px-6 hover:bg-blue-700 border-none"
            >
              {loading ? "..." : "🔍 Search"}
            </button>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="mt-3 bg-gray-50 rounded-lg max-h-40 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  onClick={() => handleSearchResultClick(result)}
                  className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-200 last:border-b-0"
                >
                  <p className="text-sm text-gray-800 font-semibold">
                    {result.display_name}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={[ABUJA_BUILDING.lat, ABUJA_BUILDING.lng]}
            zoom={17}
            style={{ height: "100%", width: "100%" }}
            className="rounded-b-2xl"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              maxZoom={19}
            />

            {/* Marker for Abuja Building (initial center) */}
            <Marker position={[ABUJA_BUILDING.lat, ABUJA_BUILDING.lng]}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">🏢 Abuja Building</p>
                  <p className="text-gray-600">University of Nigeria, Nsukka</p>
                </div>
              </Popup>
            </Marker>

            {/* Marker for selected position */}
            {selectedPosition && (
              <Marker
                position={[selectedPosition.lat, selectedPosition.lng]}
                icon={redIcon}
              >
                <Popup>
                  <div className="text-sm">
                    <p className="font-bold mb-1">📍 Selected Location</p>
                    <p className="text-gray-700">{locationName}</p>
                  </div>
                </Popup>
              </Marker>
            )}

            <MapEvents />
          </MapContainer>

          {/* Instructions Overlay */}
          <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-xs z-[1000]">
            <p className="text-sm text-gray-700 font-semibold mb-2">
              💡 How to select:
            </p>
            <ul className="text-xs text-gray-600 space-y-1">
              <li>• Click anywhere on the map</li>
              <li>• Or search for a location</li>
              <li>• Zoom in/out for better accuracy</li>
              <li>• Blue marker = Abuja Building</li>
              <li>• Red marker = Your selection</li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
          {selectedPosition && (
            <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-semibold text-blue-900 mb-1">
                📍 Selected Location:
              </p>
              <p className="text-sm text-blue-800">{locationName}</p>
              <p className="text-xs text-blue-600 mt-2">
                Coordinates: {selectedPosition.lat.toFixed(6)},{" "}
                {selectedPosition.lng.toFixed(6)}
              </p>
            </div>
          )}

          <div className="flex gap-4">
            <button
              onClick={onClose}
              className="flex-1 btn bg-gray-300 text-gray-800 hover:bg-gray-400 border-none"
              disabled={loading}
            >
              ❌ Cancel
            </button>
            <button
              onClick={handleConfirm}
              className="flex-1 btn bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-xl border-none"
              disabled={loading || !selectedPosition}
            >
              {loading ? "Loading..." : "✓ Confirm Location"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;