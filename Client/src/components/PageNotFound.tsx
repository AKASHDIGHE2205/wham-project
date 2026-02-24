import { useNavigate } from "react-router-dom";//Link,

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-orange-50 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <div className="text-8xl font-bold text-red-500 mb-4">404</div>
        <h1 className="text-2xl font-semibold text-gray-800 mb-3">
          Oops! Page not found
        </h1>
        <p className="text-gray-600 mb-6">
          This page seems to be missing. Please contact your administrator.
        </p>

        {/* <Link
          to="/"
          className="inline-block px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mr-4"
        >
          Return to Home
        </Link> */}

        <button
          onClick={() => navigate(-1)}
          className="inline-block px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:bg-indigo-700 transition-colors mr-4 cursor-pointer"
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default PageNotFound;