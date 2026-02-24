/* eslint-disable @typescript-eslint/no-explicit-any */
import { Rocket, Calendar, Users, Target, Star } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserFromStorage } from '../../helper/cryptoUser';

const Home = () => {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const decryptedUser = getUserFromStorage();
    setUser(decryptedUser);
  }, []);

  const features = [
    {
      icon: Rocket,
      title: "Mission Planning",
      description: "Plan and organize your events with precision and efficiency"
    },
    {
      icon: Calendar,
      title: "Smart Scheduling",
      description: "Never miss an important event with our intelligent calendar system"
    },
    {
      icon: Users,
      title: "Team Collaboration",
      description: "Work seamlessly with your team members on every mission"
    },
    {
      icon: Target,
      title: "Goal Tracking",
      description: "Set targets and track your progress towards mission success"
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-orange-50 border border-orange-300 m-1 rounded-md">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-1">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to Mission Control
            </h1>
            <p className="text-xl mb-2 text-orange-600 max-w-3xl mx-auto">
              Your command center for planning, executing, and tracking successful missions.
              Where great ideas become extraordinary achievements.
            </p>
            {(user?.role === 'Master' || user?.role === 'Admin' || user?.role === 'Manager' || user?.role === 'User') && (
              <div className="flex justify-center gap-4">
                <Link
                  to="/dashboard"
                  className="px-6 py-3 bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center gap-2"
                >
                  <Rocket className="w-5 h-5" />
                  Go To Dashboard
                </Link>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-6">
          {/* Welcome Message */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 bg-orange-100 text-orange-700 px-4 py-2 rounded-full mb-6">
              <Star className="w-4 h-4" />
              <span className="font-medium">Hello, {user?.firstName}! Ready for your next mission?</span>
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Transforming Ideas into Impact
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Every great achievement begins with a plan. Our platform helps you turn your
              vision into reality through careful planning, team coordination, and precise execution.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {features.map((feature, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-linear-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center text-white mb-4">
                  <feature.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </>
  );
};

export default Home;