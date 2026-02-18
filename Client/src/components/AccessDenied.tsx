import { Link } from "react-router-dom";
import { ShieldX } from "lucide-react";

const AccessDenied = () => {
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
          <Link to="/" className="inline-block px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
            Return to Home
          </Link>
        </div>

      </div>
    </div>
  );
};

export default AccessDenied;