/* eslint-disable @typescript-eslint/no-explicit-any */
import { Calendar, BarChart3, Users, Rocket, ChevronRight, Clock, MapPin, Calendar1 } from 'lucide-react';
import { secretKey } from '../../constant/Baseurl';
import CryptoJS from "crypto-js";
import { useEffect, useState } from 'react';
import { getTeamMembers } from '../../services/auth/authApi';
import { Link } from 'react-router-dom';
import { getActiveEvents, getEventForAttend, getUpcomingEvents } from '../../services/dashboard/DashboardApi';
import moment from 'moment';
import AttendenceModal from './AttendenceModal';
import type { Member } from '../Master/member-master/EditMember';
import { getMemberDetails } from '../../services/master/masterApi';
import StepsModal from './StepsModal';
import UpdateStep from './UpdateStep';

export interface EventMember {
  event_id: number;
  id: number;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  designation: string | null;
  full_name: string;
}

export interface EventTeam {
  event_id: number;
  id: number;
  name: string;
}

export interface EventLocation {
  event_id: number;
  id: number;
  address: string;
  lng: string;
  lat: string;
  city: string;
  postal_code: number;
}

export interface UpcomingEvent {
  event_id: number;
  title: string;
  description: string;
  from_date: string;
  to_date: string;
  isapproved: string;
  type: string;
  isdeleted: string;
  approved_by: number | null;
  created_by: number;
  created_at: string;
  updated_by: number;
  updated_at: string;

  members: EventMember[];
  teams: EventTeam[];
  locations: EventLocation[];
}

export interface EventForAttend {
  event_id: number;
  event_Date: string;
  title: string;
  description: string | null;
  from_date: string;
  to_date: string;
  isapproved: string | null;
  type: string;
  isdeleted: string;
  approved_by: number | null;
  created_by: number;
  created_at: string;
  updated_by: number | null;
  updated_at: string;

  // Task fields
  sr_no: number | null;
  dt_event_id: number | null;
  event_date: string | null;
  step_no: number | null;
  task_id: number | null;
  task_desc: string | null;
  dt_status: string | null;
  step_name: string | null;
  task_name: string | null;
}

const Dashboard = () => {
  const [teams, setTeams] = useState([]);
  const [upcomingEvent, setUpcomingEvent] = useState<UpcomingEvent[]>([]);
  const [ActiveEvent, setActiveEvent] = useState<UpcomingEvent[]>([]);
  const [showAttend, setShowAttend] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({})
  const [showAddSteps, setShowAddSteps] = useState(false);
  const [data, setData] = useState<Member | null>(null);
  const [attendEvents, setAttendEvents] = useState<EventForAttend[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUpdate, setShowUpdate] = useState(false);
  const stats = [
    {
      label: 'Active Events',
      value: ActiveEvent?.length,
      change: '+3',
      icon: Rocket,
      color: 'bg-orange-500'
    },
    {
      label: 'Upcoming Events',
      value: upcomingEvent?.length,
      change: '+5%',
      icon: BarChart3,
      color: 'bg-yellow-500'
    },
    {
      label: 'Team Members',
      value: teams?.length,
      change: '+1',
      icon: Users,
      color: 'bg-purple-500'
    },
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

  const fetchAllData = async () => {
    setLoading(true);

    try {
      const id = user?.id || 0;

      const body = {
        userId: id || 0,
        role: user?.role || 'User',
        isOrganizer: data?.isorganizer || 'N'
      };

      if (!id) return;

      const memberResponse = await getMemberDetails(id);
      setData(memberResponse?.member || null);

      const teamsResponse = await getTeamMembers({ userId: id || 0 });
      setTeams(teamsResponse.teams || []);

      const upcomingEventsResponse = await getUpcomingEvents(body);
      setUpcomingEvent(upcomingEventsResponse.events || []);

      const activeEventsResponse = await getActiveEvents(body);
      setActiveEvent(activeEventsResponse.events || []);

      const attendEventsResponse = await getEventForAttend(body);
      setAttendEvents(attendEventsResponse.events || []);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchAllData();
  }, []);

  const handleAddAttend = (data: any) => {
    setShowAttend(true);
    setSelectedEvent(data);
  }

  const handleAddSteps = (data: any) => {
    setShowAddSteps(true);
    setSelectedEvent(data);
  }

  const handleUpdate = (data: any) => {
    console.log(data);
    setSelectedEvent(data);
    setShowUpdate(true);
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-linear-to-br from-white to-orange-50/30 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen bg-linear-to-br from-white to-orange-50/30">

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* Welcome Section */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">
              Welcome back, <span className=" text-orange-600">{user?.firstName}</span>
            </h1>
            <p className="text-gray-600 text-lg">Ready to plan your next mission? 🚀</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats?.map((stat, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-3xl border border-orange-200 transition-all duration-300 hover:shadow-[0_0_40px_rgba(249,115,22,0.4)] hover:border-orange-300 relative"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm font-medium">{stat?.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{stat?.value}</p>
                    {/* <p className="text-green-500 text-sm font-medium mt-1 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-1" />
                      {stat?.change}
                    </p> */}
                  </div>
                  <div className={`${stat?.color} p-3 rounded-xl text-white`}>
                    <stat.icon className="w-6 h-6" />
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
              {/* Active Events */}
              <div>
                <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Active Events
                  </h2>
                  <Link
                    to="/calender"
                    className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                  >
                    View Calendar <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </div>

                <div className="p-6 space-y-4">
                  {ActiveEvent.length === 0 && (
                    <p className="text-orange-600">No active events available</p>
                  )
                  }
                  {ActiveEvent?.map((event) => (
                    <div
                      key={event.event_id}
                      className="bg-orange-50 border border-orange-100 rounded-xl p-4 hover:shadow-md transition"
                    >
                      <div className="flex gap-4">
                        {/* Date Badge */}
                        <div className="flex flex-col justify-center items-center w-12 h-12 bg-linear-to-br from-orange-500 to-yellow-500 rounded-xl text-white">
                          <span className="text-xl font-bold">{new Date(event.from_date).getDate()}</span>
                          <span className="text-xs uppercase">
                            {new Date(event.from_date).toLocaleDateString('en', { month: 'short' })}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-1">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900">
                              Title : {event.title}
                            </h3>

                            <span
                              className={`px-2 py-1 rounded-full text-xs border font-semibold ${event.isapproved === "A"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : event.isapproved === "P"
                                  ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                  : event.isapproved === "C"
                                    ? "bg-blue-100 text-blue-700 border-blue-200"
                                    : "bg-red-100 text-red-700 border-red-200"
                                }`}
                            >
                              {event.isapproved === "A"
                                ? "Approved"
                                : event.isapproved === "P"
                                  ? "Pending"
                                  : event.isapproved === "C"
                                    ? "Completed"
                                    : "Rejected"}
                            </span>
                          </div>

                          <div className="flex items-center text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2 text-orange-500" />
                            {moment(event.from_date).format("hh:mm A")} -{" "}
                            {moment(event.to_date).format("hh:mm A")}
                          </div>
                          <div className="text-xs text-gray-500">
                            <Calendar1 className="w-4 h-4 mr-2 text-orange-500 inline" />
                            {moment(event.from_date).format("DD MMM YYYY")} —{" "}
                            {moment(event.to_date).format("DD MMM YYYY")}
                          </div>
                          {(event.teams).length > 0 && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2 text-orange-500" />
                              <span className="font-medium mr-1">Teams:</span>
                              {event.teams.map((t) => t.name).join(", ")}
                            </div>
                          )}
                          {(event.members).length > 0 && (
                            <div className="flex items-center text-sm text-gray-600">
                              <Users className="w-4 h-4 mr-2 text-orange-500" />
                              <span className="font-medium mr-1">Members:</span>
                              {event.members.map((m) => m.full_name).join(", ")}
                            </div>
                          )}

                          {/* FIXED Venue icon layout */}
                          <div className="flex text-sm text-gray-600 gap-2">
                            <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                            <span className="font-medium mr-1">Venue:</span>
                            <div className="flex flex-col">
                              {event.locations.map((loc, index) => (
                                <span
                                  key={index}
                                  className="line-clamp-2"
                                >
                                  • {loc.address}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="flex justify-end items-center gap-4 space-y-2 ">
                            {(["Admin", "Manager", "Master"].includes(user?.role) || data?.isorganizer === "A") && (
                              <button
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow hover:shadow-lg text-sm cursor-pointer"
                                onClick={() => handleAddSteps(event)}
                              >
                                Add Task
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Attend Events */}
              <div>
                <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-orange-500" />
                    Attend Events
                  </h2>
                </div>

                <div className="p-4 space-y-2">
                  {attendEvents.length === 0 && (
                    <p className="text-orange-600">No events available</p>
                  )
                  }
                  {attendEvents?.map((event) => (
                    <div
                      key={event.event_id}
                      className="bg-orange-50 hover:bg-orange-100 border border-orange-100 rounded-xl p-2 hover:shadow-md transition"
                    >
                      <div className="flex gap-2">
                        {/* Date Badge */}
                        <div className="flex flex-col justify-center items-center w-12 h-12 bg-linear-to-br from-orange-500 to-yellow-500 rounded-xl text-white">
                          <span className="text-xl font-bold">{new Date(event.from_date).getDate()}</span>
                          <span className="text-xs uppercase">
                            {new Date(event.from_date).toLocaleDateString('en', { month: 'short' })}
                          </span>
                        </div>

                        {/* Details */}
                        <div className="flex-1 space-y-0">
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900">
                              Title : {event.title}
                            </h3>
                          </div>

                          <div>
                            <p className="text-sm text-gray-800"><span className='font-medium'>Step : </span>{event.step_name}</p>
                            <p className="text-xs text-gray-800"><span className='font-medium'>Task : </span>{event.task_name}</p>
                            <p className="text-xs text-gray-800">
                              <span className="font-medium">Status: </span>
                              {
                                event.dt_status === "P" ? "Process" :
                                  event.dt_status === "S" ? "Start" :
                                    event.dt_status === "C" ? "Completed" : ""
                              }
                            </p>

                          </div>

                          <div className="flex justify-end items-center gap-4">
                            {event.isapproved === "A" && (
                              <button
                                onClick={() => handleAddAttend(event)}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow hover:shadow-lg text-sm cursor-pointer"
                              >
                                Attend Event
                              </button>
                            )}
                            {((user?.role === 'Manager' || user?.role === 'Admin' || user?.role === 'Master') && (event.isapproved === "A")) && (
                              <button
                                onClick={() => handleUpdate(event)}
                                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg shadow hover:shadow-lg text-sm cursor-pointer"
                              >
                                Update Task
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Upcoming Events */}
            <div className="bg-white rounded-2xl shadow-sm border border-orange-200 overflow-hidden">
              <div className="px-6 py-4 border-b border-orange-100 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-orange-500" />
                  Upcoming Events
                </h2>
                <Link
                  to="/calender"
                  className="text-orange-600 hover:text-orange-700 text-sm font-medium flex items-center"
                >
                  View Calendar <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>

              <div className="p-6 space-y-4">
                {upcomingEvent.length === 0 && (
                  <p className="text-orange-600">No upcoming events available</p>
                )
                }
                {upcomingEvent?.map((event) => (
                  <div
                    key={event.event_id}
                    className="bg-orange-50 border border-orange-100 rounded-xl p-4 hover:shadow-md transition"
                  >
                    <div className="flex gap-4">
                      <div className="flex flex-col justify-center items-center w-12 h-12 bg-linear-to-br from-orange-500 to-yellow-500 rounded-xl text-white">
                        <span className="text-xl font-bold">{new Date(event.from_date).getDate()}</span>
                        <span className="text-xs uppercase">
                          {new Date(event.from_date).toLocaleDateString("en", { month: "short" })}
                        </span>
                      </div>

                      <div className="flex-1 space-y-2">
                        <div className="flex justify-between items-start">
                          <h3 className="font-semibold text-gray-900">Title : {event.title}</h3>

                          <span
                            className={`px-2 py-1 rounded-full text-xs border font-semibold ${event.isapproved === "A"
                              ? "bg-green-100 text-green-700 border-green-200"
                              : event.isapproved === "P"
                                ? "bg-yellow-100 text-yellow-700 border-yellow-200"
                                : event.isapproved === "C"
                                  ? "bg-blue-100 text-blue-700 border-blue-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                              }`}
                          >
                            {event.isapproved === "A"
                              ? "Approved"
                              : event.isapproved === "P"
                                ? "Pending"
                                : event.isapproved === "C"
                                  ? "Completed"
                                  : "Rejected"}
                          </span>
                        </div>

                        <div className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-2 text-orange-500" />
                          {moment(event.from_date).format("hh:mm A")} —{" "}
                          {moment(event.to_date).format("hh:mm A")}
                        </div>
                        <div className="text-sm text-gray-600 flex items-center">
                          <Calendar className="w-4 h-4 mr-2 text-orange-500" />
                          {moment(event.from_date).format("DD/MMM/YYYY")} —{" "}
                          {moment(event.to_date).format("DD/MMM/YYYY ")}
                        </div>

                        {(event.teams).length > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2 text-orange-500" />
                            <span className="font-medium mr-1">Teams:</span>
                            {event.teams.map((t) => t.name).join(", ")}
                          </div>
                        )}
                        {(event.members).length > 0 && (
                          <div className="flex items-center text-sm text-gray-600">
                            <Users className="w-4 h-4 mr-2 text-orange-500" />
                            <span className="font-medium mr-1">Members:</span>
                            {event.members.map((m) => m.full_name).join(", ")}
                          </div>
                        )}

                        {/* FIXED Venue Layout */}
                        <div className="flex text-sm text-gray-600 gap-2">
                          <MapPin className="w-5 h-5 text-orange-500 mt-0.5" />
                          <span className="font-medium mr-1">Venue:</span>

                          <div className="flex flex-col">
                            {event.locations.map((loc, index) => (
                              <p
                                key={index}
                                className="line-clamp-2"
                              >
                                • {loc.address}
                              </p>
                            ))}
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
      {showAttend && (
        <AttendenceModal
          show={showAttend}
          setShow={setShowAttend}
          Data={selectedEvent}
          Member={data}
          setSelectedEvent={setSelectedEvent}
          fetchAllData={fetchAllData}
        />
      )}
      {showAddSteps && (
        <StepsModal
          show={showAddSteps}
          setShow={setShowAddSteps}
          Data={selectedEvent}
          Member={data}
          setSelectedEvent={setSelectedEvent}
          fetchAllData={fetchAllData}
        />
      )}
      {showUpdate && (
        <UpdateStep
          show={showUpdate}
          setShow={setShowUpdate}
          Data={selectedEvent}
          User={user}
          fetchAllData={fetchAllData}
        />
      )}
    </>
  )
}

export default Dashboard