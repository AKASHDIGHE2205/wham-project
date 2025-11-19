import { Calendar, BarChart3, Users, Rocket, ChevronRight, CheckCircle2, Clock, Target, TrendingUp, } from 'lucide-react';
import { secretKey } from '../../constant/Baseurl';
import CryptoJS from "crypto-js";

const Home = () => {

  const stats = [
    { label: 'Active Missions', value: '12', change: '+3', icon: Rocket, color: 'bg-orange-500' },
    { label: 'Team Members', value: '8', change: '+1', icon: Users, color: 'bg-purple-500' },
    { label: 'Completion Rate', value: '94%', change: '+5%', icon: BarChart3, color: 'bg-yellow-500' },
  ];

  const recentMissions = [
    { name: 'Mission-1', status: 'In Progress', progress: 75, team: 4, due: '2 days', icon: Target },
    { name: 'Mission-2', status: 'Completed', progress: 100, team: 3, due: 'Completed', icon: CheckCircle2 },
    { name: 'Mission-3', status: 'Planning', progress: 25, team: 5, due: '1 week', icon: Clock },
    { name: 'Mission-4', status: 'In Progress', progress: 60, team: 2, due: '3 days', icon: TrendingUp },
  ];

  const upcomingEvents = [
    { time: '10:00 AM', title: 'Campaign Review', team: 'Marketing Team', type: 'meeting' },
    { time: '2:00 PM', title: 'Client Meeting', team: 'Aarya, Alex', type: 'external' },
    { time: '4:30 PM', title: 'Content Planning', team: 'Content Team', type: 'planning' },
  ];

  const decryptUser = (encrypted: string | null) => {
    if (!encrypted) return null;
    try {
      const bytes = CryptoJS.AES.decrypt(encrypted, secretKey);
      return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
    } catch (error) {
      console.error("Decryption failed", error);
      return null;
    }
  };
  const encryptedUser = localStorage.getItem("user");
  const user = decryptUser(encryptedUser);

  return (
    <div className="min-h-screen bg-linear-to-br from-white to-orange-50/30">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, <span className=" text-orange-600">{user?.user?.firstName}</span>
          </h1>
          <p className="text-gray-600 text-lg">Ready to plan your next marketing mission? 🚀</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl p-6 shadow-3xl border border-orange-200 transition-all duration-300 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:border-orange-300 relative"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-green-500 text-sm font-medium mt-1 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl text-white`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Missions */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Missions */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Rocket className="w-5 h-5 mr-2 text-orange-500" />
                  Recent Missions
                </h2>
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="divide-y divide-orange-100">
                {recentMissions.map((mission, index) => (
                  <div key={index} className="p-6 hover:bg-orange-50/50 transition-colors group">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${mission.status === 'Completed' ? 'bg-green-100 text-green-600' :
                          mission.status === 'In Progress' ? 'bg-orange-100 text-orange-600' :
                            'bg-purple-100 text-purple-600'
                          }`}>
                          <mission.icon className="w-4 h-4" />
                        </div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">
                          {mission.name}
                        </h3>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${mission.status === 'Completed' ? 'bg-green-100 text-green-800' :
                        mission.status === 'In Progress' ? 'bg-orange-100 text-orange-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                        {mission.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
                      <span className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        {mission.team} team members
                      </span>
                      <span className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        Due in {mission.due}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${mission.progress === 100 ? 'bg-green-500' : 'bg-linear-to-r from-orange-500 to-yellow-500'
                          }`}
                        style={{ width: `${mission.progress}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Progress</span>
                      <span>{mission.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                  Upcoming Events
                </h2>
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center">
                  View Calendar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex space-x-4 p-3 rounded-lg hover:bg-orange-50/50 transition-colors group">
                      <div className="w-12 h-12 bg-linear-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {event.time.split(' ')[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-orange-700 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {event.team}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Team & Calendar */}
          <div className="space-y-8 hidden">

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-orange-500" />
                  Upcoming Events
                </h2>
                <button className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center">
                  View Calendar
                  <ChevronRight className="w-4 h-4 ml-1" />
                </button>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {upcomingEvents.map((event, index) => (
                    <div key={index} className="flex space-x-4 p-3 rounded-lg hover:bg-orange-50/50 transition-colors group">
                      <div className="w-12 h-12 bg-linear-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center text-white font-semibold text-sm shrink-0">
                        {event.time.split(' ')[0]}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 group-hover:text-orange-700 transition-colors">
                          {event.title}
                        </h3>
                        <p className="text-sm text-gray-600 flex items-center">
                          <Users className="w-3 h-3 mr-1" />
                          {event.team}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;