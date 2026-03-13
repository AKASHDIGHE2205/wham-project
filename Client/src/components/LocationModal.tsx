/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, type FC } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";

interface Props {
  isShow: boolean;
  setIsShow: (show: boolean) => void;
  setLocation: (loc: { lat: number; lng: number; address: string }) => void;
}

const LocationModal: FC<Props> = ({ isShow, setIsShow, setLocation }) => {
  const [position, setPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [address, setAddress] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);

  if (!isShow) return null;

  // Marker icon
  const locationIcon = L.icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  // Reverse geocode function
  const fetchAddress = async (lat: number, lng: number) => {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`
    );
    const data = await res.json();
    setAddress(data.display_name || "");
  };

  // Map click selection
  function LocationSelector() {
    useMapEvents({
      click: async (e) => {
        const { lat, lng } = e.latlng;
        setPosition({ lat, lng });
        fetchAddress(lat, lng);
      },
    });

    return position ? <Marker position={position} icon={locationIcon} /> : null;
  }

  // Fly map to new position
  const MapFly = ({ lat, lng }: { lat: number; lng: number }) => {
    const map = useMap();
    map.flyTo([lat, lng], 16);
    return null;
  };

  // SEARCH Places using Nominatim
  const handleSearch = async () => {
    if (searchQuery.trim() === "") return;

    const res = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}`
    );
    const data = await res.json();
    setSearchResults(data);
  };

  // When user selects search result
  const selectSearchResult = (result: any) => {
    const lat = parseFloat(result.lat);
    const lng = parseFloat(result.lon);

    setPosition({ lat, lng });
    setAddress(result.display_name);
    setSearchResults([]);
    setSearchQuery("");
  };

  const handleConfirm = () => {
    if (position) {
      setLocation({
        lat: position.lat,
        lng: position.lng,
        address,
      });
      setIsShow(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-4 w-full sm:w-5xl">
        {/* Header */}

        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">
              Select Location
            </h3>
          </div>
          <button
            onClick={() => setIsShow(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Box */}
        <div className="mt-4">
          <input
            type="text"
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200"
            placeholder="Search area, street, landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
          />
          <button
            onClick={handleSearch}
            className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
          >
            Search
          </button>

          {/* Search Results Dropdown */}
          {searchResults.length > 0 && (
            <div className="bg-white border rounded mt-2 max-h-40 overflow-auto shadow">
              {searchResults.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => selectSearchResult(item)}
                >
                  {item.display_name}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Map */}
        <div className="mt-4">
          <MapContainer
            center={[20.5937, 78.9629]}
            zoom={5}
            style={{ height: "400px", width: "100%" }}
          >
            <TileLayer
              attribution="© OpenStreetMap"
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            {position && <MapFly lat={position.lat} lng={position.lng} />}
            <LocationSelector />
          </MapContainer>
        </div>

        {/* Selected Info */}
        {position && (
          <div className="mt-4 p-3 bg-gray-100 rounded">
            <p><strong>Latitude:</strong> {position.lat}</p>
            <p><strong>Longitude:</strong> {position.lng}</p>
            <p><strong>Address:</strong> {address}</p>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end mt-4 gap-3">
          <button className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200" onClick={() => setIsShow(false)}>
            Cancel
          </button>
          <button
            className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-orange-500 to-purple-600 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-orange-500 cursor-pointer transition-all duration-200"
            onClick={handleConfirm}
            disabled={!position}
          >
            Confirm Location
          </button>
        </div>
      </div>
    </div>
  );
};

export default LocationModal;
