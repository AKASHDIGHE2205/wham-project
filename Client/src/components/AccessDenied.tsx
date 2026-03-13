import { ShieldX } from "lucide-react";
import { useNavigate } from "react-router-dom";

const AccessDenied = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">

        <div className="flex justify-center mb-4">
          <div className="bg-red-100 p-4 rounded-full">
            <ShieldX className="w-10 h-10 text-red-600" />
          </div>
        </div>

        <h1 className="text-2xl font-semibold text-gray-800 mb-2">
          Access Denied
        </h1>

        <p className="text-gray-600 mb-6">
          You don’t have permission to view this page.
          <br />
          Please contact your administrator.
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="inline-block px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors cursor-pointer"
          >
            Go Back
          </button>
        </div>

      </div>
    </div>
  );
};

export default AccessDenied;