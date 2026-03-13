import { Calendar, Calendar1, ChevronRight, Clock, MapPin, Users } from "lucide-react";
import moment from "moment";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import DataLoading from "../../components/DataLoading";
import { getUserFromStorage } from "../../helper/cryptoUser";
import { getActivities } from "../../services/calender/calenderApi";
import type { Activities } from "../Calender-new/Calender";
import WeeklyViewUI from "./WeeklyViewUI";

const Dashboard = () => {
  const user = getUserFromStorage();
  const [currentWeekStart, setCurrentWeekStart] = useState(moment().startOf("week"));
  const [activities, setActivities] = useState<Activities[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true)
    const body = {
      userId: user?.id || 0,
      role: user?.role || ''
    }
    const response = await getActivities(body);
    setLoading(false);
    if (response) {
      setActivities(response?.activities || [])
    }
  }
  useEffect(() => {
    fetchData();
  }, [])

  const handleWeekChange = (direction: "prev" | "next") => {
    setCurrentWeekStart((prev) =>
      direction === "prev"
        ? moment(prev).subtract(1, "week")
        : moment(prev).add(1, "week")
    );
  };

  const handleSetCurrentWeek = () => {
    setCurrentWeekStart(moment().startOf("week"));
  };

  const ActiveEvent = [
    {
      event_id: 1,
      title: "Marketing Meeting",
      from_date: "2026-03-12T10:00:00",
      to_date: "2026-03-12T12:00:00",
      isapproved: "A",
      teams: [{ name: "Marketing" }],
      members: [{ full_name: "John Doe" }],
      locations: [{ address: "Conference Hall A" }]
    }
  ];

  const upcomingEvent = [
    {
      event_id: 2,
      title: "Product Launch",
      from_date: "2026-03-18T11:00:00",
      to_date: "2026-03-18T14:00:00",
      isapproved: "P",
      teams: [{ name: "Product Team" }],
      members: [{ full_name: "Jane Smith" }],
      locations: [{ address: "Main Auditorium" }]
    }
  ];
  const currentTime = moment().format("HH:mm:ss");

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen w-full">
        <DataLoading />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-orange-50 border border-orange-300 m-1 rounded-md">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-md font-bold mb-2">
            {(() => {
              const hour = parseInt(currentTime.split(":")[0]);
              if (hour >= 5 && hour < 12) return "Good Morning";
              if (hour >= 12 && hour < 17) return "Good Afternoon";
              if (hour >= 17 && hour < 21) return "Good Evening";
              return "Good Night";
            })()}
            , <span className="text-orange-600">{user.firstName}!</span>
          </h1>
          <p className="text-gray-600">Ready to plan your next mission? 🚀</p>
        </div>

        {/* Weekly Calendar */}
        <div className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-sm font-semibold">
              Weekly Calendar
            </h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleWeekChange("prev")}
                className="p-2 rounded-md bg-white/20 hover:bg-white/30 text-black cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 rotate-180" />
              </button>

              <button
                onClick={handleSetCurrentWeek}
                className="px-3 py-1.5 text-xs font-medium bg-linear-to-r from-indigo-600 to-purple-600 text-white rounded-md cursor-pointer"
              >
                Current Week
              </button>
              <button
                onClick={() => handleWeekChange("next")}
                className="p-2 rounded-md bg-white/20 hover:bg-white/30 text-black cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-4 bg-gray-50">
            <WeeklyViewUI
              events={activities}
              currentWeekStart={currentWeekStart}
            />
          </div>

        </div>
        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 " hidden>
          {/* Active Events */}
          <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Active Events
              </h2>
              <Link
                to="/calender"
                className="text-orange-600 text-sm font-medium flex items-center"
              >
                View Calendar <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>

            <div className="p-6 space-y-4">
              {ActiveEvent.map((event) => (
                <div
                  key={event.event_id}
                  className="bg-orange-50 border border-orange-100 rounded-xl p-4"
                >
                  <div className="flex gap-4">
                    <div className="flex flex-col justify-center items-center w-12 h-12 bg-orange-500 rounded-xl text-white">
                      <span className="text-md font-bold">
                        {new Date(event.from_date).getDate()}
                      </span>
                      <span className="text-xs uppercase">
                        {new Date(event.from_date).toLocaleDateString("en", { month: "short" })}
                      </span>
                    </div>
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-gray-900">
                        Title : {event.title}
                      </h3>
                      <div className="flex items-center text-xs text-gray-600">
                        <Clock className="w-4 h-4 mr-2 text-orange-500" />
                        {moment(event.from_date).format("hh:mm A")} -
                        {moment(event.to_date).format("hh:mm A")}
                      </div>
                      <div className="text-xs text-gray-500">
                        <Calendar1 className="w-4 h-4 mr-2 text-orange-500 inline" />
                        {moment(event.from_date).format("DD/MMM/YYYY")}
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Users className="w-4 h-4 mr-2 text-orange-500" />
                        {event.teams.map((t) => t.name).join(", ")}
                      </div>
                      <div className="flex text-sm text-gray-600 gap-2">
                        <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                        <div className="flex flex-col">
                          {event.locations.map((loc, index) => (
                            <span key={index}>• {loc.address}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button className="px-4 py-2 bg-green-600 text-white rounded-lg">
                          Add Task
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Events */}
          <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">

            <div className="px-6 py-4 border-b border-orange-100">
              <h2 className="font-semibold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-orange-500" />
                Upcoming Events
              </h2>
            </div>

            <div className="p-6 space-y-4">
              {upcomingEvent.map((event) => (
                <div
                  key={event.event_id}
                  className="bg-orange-50 border border-orange-100 rounded-xl p-4"
                >
                  <h3 className="font-semibold text-gray-900">
                    Title : {event.title}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-2 text-orange-500" />
                    {moment(event.from_date).format("hh:mm A")}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;