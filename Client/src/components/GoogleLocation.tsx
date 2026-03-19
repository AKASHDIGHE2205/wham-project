import { GoogleMap, Marker, useJsApiLoader, } from "@react-google-maps/api";
import { type FC, useEffect, useState } from "react";
import { GOOGLE_MAPS_API_KEY } from "../constant/Baseurl";

interface Props {
  isShow: boolean;
  setIsShow: (show: boolean) => void;
  onLocationSelect: (location: { lat: number; lng: number; address: string, city: string, state: string, pin: string }) => void;
}

const containerStyle = {
  width: "100%",
  height: "400px",
};

const GoogleLocation: FC<Props> = ({ isShow, setIsShow, onLocationSelect }) => {
  const [marker, setMarker] = useState<{ lat: number; lng: number } | null>(null);
  const [selectedAddress, setSelectedAddress] = useState("");
  const [mapCenter, setMapCenter] = useState({ lat: 18.5308, lng: 73.8478 });
const LIBRARIES: ("places" | "marker")[] = ["places", "marker"];

  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: `${GOOGLE_MAPS_API_KEY}`,
    libraries:LIBRARIES,
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

  // const getAddress_old = (lat: number, lng: number) => {
  //   const geocoder = new google.maps.Geocoder();
  //   geocoder.geocode({ location: { lat, lng } }, (results, status) => {
  //     if (status === "OK" && results?.[0]) {
  //       setSelectedAddress(results[0].formatted_address);
  //     }
  //   });
  // };

  const getAddressDetails = (results: google.maps.GeocoderResult[]) => {
    const componentForm: Record<string, string> = {};

    if (results?.[0]) {
      results[0].address_components.forEach(comp => {
        const type = comp.types[0];
        componentForm[type] = comp.long_name;
      });
    }

    const address = results[0]?.formatted_address || "";
    const city = componentForm["locality"] || componentForm["administrative_area_level_2"] || "";
    const state = componentForm["administrative_area_level_1"] || "";
    const pin = componentForm["postal_code"] || "";

    return { address, city, state, pin };
  };

  const getAddress = (lat: number, lng: number) => {
    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location: { lat, lng } }, (results, status) => {
      if (status === "OK" && results?.[0]) {
        const { address } = getAddressDetails(results);//, city, state, pin 
        setSelectedAddress(address);

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

  // const handleAddLocation_old = () => {
  //   if (marker && selectedAddress) {
  //     onLocationSelect({
  //       lat: marker.lat,
  //       lng: marker.lng,
  //       address: selectedAddress,
  //       city: "",
  //       state: "",
  //       pin: ""
  //     });
  //     setMarker(null);
  //     setSelectedAddress("");
  //   }
  // };

  const handleAddLocation = () => {
    if (marker && selectedAddress) {
      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ location: { lat: marker.lat, lng: marker.lng } }, (results, status) => {
        if (status === "OK" && results?.[0]) {
          const { address, city, state, pin } = getAddressDetails(results);
          onLocationSelect({
            lat: marker.lat,
            lng: marker.lng,
            address,
            city,
            state,
            pin,
          });
          setMarker(null);
          setSelectedAddress("");
        }
      });
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
      <div className="bg-white rounded-xl p-2 max-w-2xl w-full shadow-2xl">
        <div className=" flex justify-between">
          <h2 className="text-lg font-bold text-gray-800 mb-6">Select Location</h2>
          <button
            onClick={() => setIsShow(false)}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoaded ? (
          <>
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

        <div className="mt-2 p-2 bg-green-100 rounded-lg border border-green-300">
          <p className="text-green-700 mb-2 text-sm">
            <span className="font-semibold">Selected Address:</span> {selectedAddress || "Click on map to select location"}
          </p>
          {marker && (
            <p className="text-xs text-green-600">
              <strong>Coordinates:</strong> Lat: {marker.lat.toFixed(6)}, Lng: {marker.lng.toFixed(6)}
            </p>
          )}
        </div>

        <div className="flex justify-between gap-3 mt-6">
          <button
            onClick={handleClose}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
          >
            Close
          </button>
          <div className="flex gap-3">
            <button
              onClick={handleAddLocation}
              disabled={!marker}
              className="px-6 py-2 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 text-white rounded-lg font-semibold hover:shadow-lg transition-all"
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