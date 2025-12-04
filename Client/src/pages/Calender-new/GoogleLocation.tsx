import { type FC, useEffect, useState } from "react";
import { GoogleMap, Marker, useJsApiLoader, Autocomplete, } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "../../constant/Baseurl";

interface Props {
  isShow: boolean;
  setIsShow: (show: boolean) => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string }) => void;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const GoogleLocation: FC<Props> = ({ isShow, setIsShow, onLocationSelect }) => {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 18.5308, lng: 73.8478 });
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: `${GOOGLE_MAPS_API_KEY}`,
    libraries: ["places"],
  });

  // Get user current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setMapCenter({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => console.warn("Location permission denied")
      );
    }
  }, []);

  const getAddress = (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        setSelectedAddress(results[0].formatted_address);
      }
    });
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;
    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    setMarker({ lat, lng });
    getAddress(lat, lng);
  };

  const handlePlaceChanged = () => {
    const place = autocomplete?.getPlace();
    if (!place?.geometry?.location) return;

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();

    setMarker({ lat, lng });
    setMapCenter({ lat, lng });
    setSelectedAddress(place.formatted_address || "");
  };

  const handleAddLocation = () => {
    if (marker && selectedAddress) {
      onLocationSelect({
        lat: marker.lat,
        lng: marker.lng,
        address: selectedAddress,
      });
      setMarker(null);
      setSelectedAddress("");
    }
  };

  const handleClose = () => {
    setIsShow(false);
    setMarker(null);
    setSelectedAddress("");
  };

  if (!isShow) return null;

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Select Location</h2>

        {isLoaded ? (
          <>
            <div className="mb-4" >
              <Autocomplete
                onLoad={setAutocomplete}
                onPlaceChanged={handlePlaceChanged}
              >
                <input
                  type="text"
                  placeholder="Search a location..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                />
              </Autocomplete>
            </div>

            {/* Map container with original styling */}
            <div className="rounded-lg overflow-hidden border border-gray-300">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={mapCenter}
                zoom={14}
                onClick={handleMapClick}
              >
                {marker && <Marker position={marker} />}
              </GoogleMap>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-40">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          </div>
        )}

        <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-700 mb-2">
            <span className="font-semibold">Selected Address:</span> {selectedAddress || "Click on map or search to select location"}
          </p>
          {marker && (
            <p className="text-sm text-gray-600">
              <strong>Coordinates:</strong> Lat: {marker.lat.toFixed(6)}, Lng: {marker.lng.toFixed(6)}
            </p>
          )}
        </div>

        <div className="flex justify-between gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
          >
            Close
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleAddLocation}
              disabled={!marker}
              className="px-6 py-3 bg-linear-to-r from-orange-500 to-purple-600 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
            >
              Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoogleLocation;