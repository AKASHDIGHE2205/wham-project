/* eslint-disable @typescript-eslint/no-explicit-any */
import { Rocket, Calendar, Users, Target, Star, Award } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserFromStorage } from '../../helper/cryptoUser';

const Home = () => {
  const [user, setUser] = useState<any>(null);

  // const decryptUser = (encrypted: string | null) => {
  //   if (!encrypted) return null;
  //   try {
  //     const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
  //     return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  //   } catch (error) {
  //     console.error("Decryption failed", error);
  //     return null;
  //   }
  // };

  useEffect(() => {
    // const encryptedUser = localStorage.getItem("user");
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

  const announcements = [
    {
      title: "New Feature Released",
      content: "Real-time collaboration tools are now available for all teams.",
      date: "2 hours ago",
      type: "update"
    },
    {
      title: "System Maintenance",
      content: "Scheduled maintenance this weekend. Plan your activities accordingly.",
      date: "1 day ago",
      type: "maintenance"
    },
    {
      title: "Welcome New Members",
      content: "We've added 5 new team members to our growing community!",
      date: "3 days ago",
      type: "welcome"
    }
  ];

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-white to-orange-50/30">
        {/* Hero Section */}
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="text-center">
            <h1 className="text-5xl font-bold mb-6">
              Welcome to Mission Control
            </h1>
            <p className="text-xl mb-8 text-orange-600 max-w-3xl mx-auto">
              Your command center for planning, executing, and tracking successful missions.
              Where great ideas become extraordinary achievements.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                to="/dashboard"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-70 transition-colors flex items-center gap-2"
              >
                <Rocket className="w-5 h-5" />
                Launch Dashboard
              </Link>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-10">
          {/* Welcome Message */}
          <div className="text-center mb-16">
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

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Announcements */}
            <div className="space-y-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-orange-500" />
                <h2 className="text-2xl font-bold text-gray-900">Latest Updates</h2>
              </div>

              <div className="space-y-4">
                {announcements.map((announcement, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl p-6 border border-orange-100 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {announcement.title}
                      </h3>
                      <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                        {announcement.date}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {announcement.content}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions & Info */}
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Getting Started</h2>
                <div className="bg-white rounded-2xl p-6 border border-orange-100">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        1
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Plan Your Mission</h3>
                        <p className="text-sm text-gray-600">Define objectives and set timelines</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        2
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Assemble Your Team</h3>
                        <p className="text-sm text-gray-600">Coordinate with the right people</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-orange-50 rounded-lg">
                      <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
                        3
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Execute & Track</h3>
                        <p className="text-sm text-gray-600">Monitor progress and achieve goals</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support Card */}
              <div className="bg-gray-50 rounded-2xl p-6 border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Need Help?</h3>
                <p className="text-gray-600 mb-4">
                  Our support team is here to help you make the most of your mission planning experience.
                </p>
                <button className="text-orange-600 font-semibold hover:text-orange-700 transition-colors">
                  Contact Support →
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;