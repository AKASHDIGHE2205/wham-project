/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react"
import { report1 } from "../../../services/reports/reportServices";
import toast from "react-hot-toast";
import { Calendar, Clock, AlertCircle, Filter, CalendarDays, UsersRound, ListChecks } from "lucide-react";
import ViewMedia from "./ViewMedia";
import moment from "moment";

export interface Data {
  event_hd: EventHeader[];
  event_team: EventTeam[];
  event_loc: EventLocation[];
  event_dt: EventDetail[];
  event_member: EventMember[];
}

export interface EventHeader {
  id: number;
  event_date: string;
  title: string;
  description: string;
  from_date: string;
  to_date: string;
  isapproved: string;
  type: string;
  approved_by: number;
}

export interface EventTeam {
  event_id: number;
  team_id: number;
  team_name: string;
}

export interface EventLocation {
  event_id: number;
  address: string;
  lat: number;
  lng: number;
}

export interface EventDetail {
  event_id: number;
  event_date: string;
  step_no: number;
  step_name: string;
  task_id: number;
  task_name: string;
  task_desc: string;
  status: string;
  mem_id: number;
}

export interface EventMember {
  event_id: number;
  member_id: number;
  member_name: string;
}

const ReportView = () => {
  const today = new Date();
  // const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
  const startOfMonthUTC = new Date(Date.UTC(today.getFullYear(), today.getMonth(), 1));
  const formatedDate = (date: any) => {
    return date.toISOString().split('T')[0];
  };
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const [fromDate, setFromDate] = useState(formatedDate(startOfMonthUTC));
  const [toDate, setToDate] = useState(formatedDate(tomorrow));
  const [showMedia, setShowMedia] = useState(false);
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState({});
  const [expandedTasks, setExpandedTasks] = useState<{ [key: number]: boolean }>({});

  const fetchData = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      toast.error('Please fill all required fields!');
      return;
    }

    setLoading(true);
    const body = {
      fromDate: fromDate,
      toDate: toDate
    }

    try {
      const response = await report1(body);
      if (response) {
        setData(response);
        toast.success('Report generated successfully!');
      }
    } catch (error) {
      console.error(error);
      toast.error('Failed to load report');
    } finally {
      setLoading(false);
    }
  }

  // Helper function to format time
  const formatTime = (dateTimeString: string) => {
    const date = new Date(dateTimeString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  }

  // Get event by ID with all related data
  const getEventWithDetails = (eventId: number) => {
    if (!data) return null;

    const eventHeader = data?.event_hd.find(event => event?.id === eventId);
    const eventLocations = data?.event_loc.filter(loc => loc.event_id === eventId);
    const eventTeams = data?.event_team.filter(team => team.event_id === eventId);
    const eventDetails = data?.event_dt.filter(detail => detail?.event_id === eventId);
    const eventMembers = data?.event_member.filter(member => member.event_id === eventId);

    return {
      header: eventHeader,
      locations: eventLocations,
      teams: eventTeams,
      details: eventDetails?.sort((a, b) => a.step_no - b.step_no),
      members: eventMembers
    };
  }

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'c':
        return 'bg-green-50 text-green-700 border-green-100';

      case 'p':
        return 'bg-yellow-50 text-yellow-700 border-yellow-100';

      case 's':
        return 'bg-blue-50 text-blue-700 border-blue-100';

      default:
        return 'bg-gray-50 text-gray-700 border-gray-100';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status?.toLowerCase()) {
      case 's':
        return 'Started';
      case 'c':
        return 'Completed';
      case 'p':
        return 'Progress';
      default:
        return status;
    }
  }

  const handleShowMedia = (Data: any) => {
    setSelectedEvent(Data);
    setShowMedia(true)
  }

  // Toggle task expansion
  const toggleTaskExpansion = (eventId: number) => {
    setExpandedTasks(prev => ({
      ...prev,
      [eventId]: !prev[eventId]
    }));
  }

  const handleClear = () => {
    setData(null);
    setExpandedTasks({});
  }

  return (
    <div className="min-h-screen bg-white border border-orange-300 m-1 rounded-md">
      <div className="max-w-6xl mx-auto p-4">
        {/* Filter Card - Compact */}
        <div className="bg-white rounded-xl shadow-sm border border-orange-200 p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-linear-to-r from-indigo-500 to-purple-500 rounded-lg">
                <Filter className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">Report Filters</h2>
            </div>
            {data && (
              <span className="px-3 py-1 bg-linear-to-r from-indigo-50 to-purple-50 text-indigo-700 rounded-lg text-sm font-medium">
                {data?.event_hd.length} {data?.event_hd.length === 1 ? 'Event' : 'Events'}
              </span>
            )}
          </div>

          <form onSubmit={fetchData} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  From Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-0 focus:ring-orange-500 outline-none bg-white text-sm"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  To Date <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg focus:border-orange-500 focus:ring-0 focus:ring-orange-500 outline-none bg-white text-sm"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-center items-end gap-2">
                <button
                  type="button"
                  onClick={handleClear}
                  className="flex px-4 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 font-medium text-sm transition-colors cursor-pointer"
                >
                  Reset
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex justify-center items-center px-4 py-2.5 bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 rounded-lg text-white font-medium text-sm shadow-sm transition-all cursor-pointer disabled:cursor-not-allowed gap-1"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw-icon lucide-refresh-cw"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" /><path d="M21 3v5h-5" /><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" /><path d="M8 16H3v5" /></svg>
                  {loading ? 'Generating...' : 'Generate'}
                </button>
              </div>
            </div>
          </form>
        </div>

        {/* Results Section */}
        {data && (
          <div>
            {/* Summary Header */}
            <div className="mb-6 hidden">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Report Results: {moment(fromDate).format("DD/MMM/YYYY")} - {moment(toDate).format("DD/MMM/YYYY")}
                </h2>
              </div>
            </div>

            {/* Events List - More Compact */}
            <div className="space-y-1">
              {data?.event_hd.length > 0 ? (
                data?.event_hd?.map((event) => {
                  const eventDetails = getEventWithDetails(event?.id);
                  if (!eventDetails?.header) return null;

                  const isTasksExpanded = expandedTasks[event?.id] || false;
                  const visibleTasks = isTasksExpanded ? eventDetails?.details : eventDetails?.details.slice(0, 2);
                  const hasMoreTasks = eventDetails?.details.length > 2;

                  return (
                    <div key={event?.id} className="bg-white rounded-xl shadow-sm border border-orange-200 overflow-hidden">
                      {/* Event Header  */}
                      <div className="p-2 border border-gray-200 rounded-lg m-1">
                        <div className="flex  sm:items-start justify-between gap-3">
                          <div className="flex-1">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-linear-to-r from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                                <span className="text-xs font-bold text-white">#{event?.id}</span>
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-800">{event?.title}</h3>
                              </div>
                            </div>
                            <div className="flex flex-col items-start gap-3 text-sm text-gray-600 ml-11">
                              <div className="flex items-center gap-1">
                                <CalendarDays className="w-3.5 h-3.5 text-orange-500" />
                                <span>{moment(event?.from_date).format("DD/MMM/YYYY")}-{formatTime(event?.from_date)} to {moment(event?.to_date).format("DD/MMM/YYYY")}-{formatTime(event?.to_date)}</span>
                              </div>
                              <div className="flex items-center gap-1" hidden>
                                <Clock className="w-3.5 h-3.5 text-orange-500" />
                                <span>{formatTime(event?.from_date)} - {formatTime(event?.to_date)}</span>
                              </div>
                            </div>
                          </div>
                          <div className="text-sm text-gray-900">
                            Status : <span
                              className={`px-2 py-1 rounded text-xs font-medium
                                          ${event?.isapproved === 'A' ? 'bg-green-100 text-green-700' : ''}
                                          ${event?.isapproved === 'C' ? 'bg-blue-100 text-blue-700' : ''}
                                          ${event?.isapproved === 'P' ? 'bg-yellow-100 text-yellow-700' : ''}
                                          ${event?.isapproved === 'R' ? 'bg-red-100 text-red-700' : ''}
                                        `}
                            >
                              {event?.isapproved === 'A'
                                ? 'Approved'
                                : event?.isapproved === 'C'
                                  ? 'Completed'
                                  : event?.isapproved === 'P'
                                    ? 'Pending'
                                    : event?.isapproved === 'R'
                                      ? 'Rejected' : ''}
                            </span>

                          </div>
                        </div>
                      </div>

                      {/* Merged Details Grid  */}
                      <div className="p-2 border border-gray-200 rounded-lg m-1">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                          {/* Location & Team Info Card */}
                          <div className="space-y-4">
                            {/* Locations Section */}
                            {eventDetails?.locations?.length > 0 && (
                              <div className="border border-gray-200 p-2 rounded-lg">
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex gap-2"> <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1B43BA" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-map-pin-check-icon lucide-map-pin-check"><path d="M19.43 12.935c.357-.967.57-1.955.57-2.935a8 8 0 0 0-16 0c0 4.993 5.539 10.193 7.399 11.799a1 1 0 0 0 1.202 0 32.197 32.197 0 0 0 .813-.728" /><circle cx="12" cy="10" r="3" /><path d="m16 18 2 2 4-4" /></svg>
                                    <h4 className="text-sm font-semibold text-gray-700">Locations</h4>
                                  </div>
                                  <span className="text-xs flex items-center justify-center text-center bg-blue-100 text-blue-700 border-blue-100 rounded-3xl p-1">
                                    {eventDetails?.locations?.length} {eventDetails?.locations?.length === 1 ? 'location' : 'locations'}
                                  </span>
                                </div>
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                  {eventDetails?.locations?.map((location, index) => (
                                    <div key={index} className="p-3 bg-gray-100 rounded-lg">
                                      <div className="flex items-start gap-2">
                                        <div className="w-6 h-6 rounded bg-blue-200 flex items-center justify-center shrink-0">
                                          <span className="text-xs font-medium text-blue-900">{index + 1}</span>
                                        </div>
                                        <div className="flex-1 ">
                                          <p className="text-sm text-gray-900">{location?.address}</p>
                                          <div className="flex items-center gap-2 mt-1 text-xs text-gray-500 " hidden>
                                            <span>Lat: {location?.lat.toFixed(4)}</span>
                                            <span>Lng: {location?.lng.toFixed(4)}</span>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Teams & Members Section */}
                            {(eventDetails?.teams.length > 0 || eventDetails?.members.length > 0) && (
                              <div className="border border-gray-200 p-2 rounded-lg">
                                <div className="flex justify-between items-center gap-2 mb-2">
                                  <span className="flex gap-2 justify-center items-center">
                                    <UsersRound className="w-4 h-4 text-purple-500" />
                                    <h4 className="text-sm font-semibold text-gray-700">Assigned Teams</h4>
                                  </span>
                                  <span className="text-xs flex items-center justify-center text-center bg-blue-100 text-blue-700 border-blue-100 rounded-3xl p-1">
                                    {eventDetails?.teams.length} {eventDetails?.teams.length === 1 ? 'team' : 'teams'}
                                  </span>
                                </div>
                                <div className="space-y-3">
                                  {/* Teams Section with Vertical Scroll */}
                                  {eventDetails?.teams?.length > 0 && (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                      {eventDetails?.teams?.map((team, index) => (
                                        <div key={index} className="p-3 bg-orange-50 rounded-lg">
                                          <div className="flex items-start gap-2">
                                            <div className="w-6 h-6 rounded bg-blue-200 flex items-center justify-center shrink-0">
                                              <span className="text-xs font-medium text-blue-900">{index + 1}</span>
                                            </div>
                                            <div className="flex-1 ">
                                              <div className="flex items-center gap-2 mt-1 text-xs text-orange-500 ">
                                                <span>{team?.team_name}</span>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  )}

                                  {/* Members Section with Vertical Scroll */}
                                  {eventDetails?.members?.length > 0 && (
                                    <div>
                                      <div className="flex justify-between items-center">
                                        <div className="flex gap-2 justify-center items-center">
                                          <UsersRound className="w-4 h-4 text-purple-500" />
                                          <span className="text-sm font-semibold text-gray-700">Assigned Members</span>
                                        </div>
                                        <span className="text-xs flex items-center justify-center text-center bg-blue-100 text-blue-700 border-blue-100 rounded-3xl p-1">
                                          {eventDetails?.members.length} {eventDetails?.members.length === 1 ? 'member' : 'members'}
                                        </span>
                                      </div>
                                      <div className="max-h-24 overflow-y-auto pr-2">
                                        <div className="flex flex-wrap gap-1.5">
                                          {eventDetails?.members.map((member, index) => (
                                            <span
                                              key={index}
                                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium border border-blue-100 truncate"
                                            >
                                              {member?.member_name}
                                            </span>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Tasks Section */}
                          {eventDetails?.details.length > 0 ? (
                            <div className="border border-gray-200 p-2 rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <ListChecks className="w-4 h-4 text-emerald-500" />
                                  <h4 className="text-sm font-semibold text-gray-700">Tasks & Steps</h4>
                                </div>
                                <span className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium">
                                  {eventDetails?.details.length} {eventDetails?.details.length === 1 ? 'task' : 'tasks'}
                                </span>
                              </div>

                              <div className="space-y-3">
                                {visibleTasks?.map((detail, index) => (
                                  <div key={index} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    <div className="flex items-start justify-between gap-2">
                                      <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                          <div className="w-6 h-6 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-white">{index + 1}</span>
                                          </div>
                                          <div>
                                            <div className="text-sm font-medium text-gray-800 truncate sm:max-w-[300px] max-w-[200px]">{detail?.step_name}</div>
                                            <div className="text-xs text-gray-600 truncate sm:max-w-[300px] max-w-[200px]">Task: {detail?.task_name}</div>
                                          </div>
                                        </div>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleShowMedia(detail)}
                                        className="px-1 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-xs font-medium flex items-center transition-colors cursor-pointer"
                                      >
                                        View Media
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#1100ff" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-right-icon lucide-chevron-right"><path d="m9 18 6-6-6-6" /></svg>
                                      </button>
                                    </div>
                                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-200">
                                      <span className="text-xs text-gray-500 hidden">
                                        Member ID: {detail?.mem_id}
                                      </span>
                                      {detail?.status && (
                                        <span className={`px-1.5 py-0.5 rounded text-xs ${getStatusColor(detail?.status)}`}>
                                          {getStatusText(detail?.status)}
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                ))}

                                {/* Show More/Less Button */}
                                {hasMoreTasks && (
                                  <button
                                    onClick={() => toggleTaskExpansion(event?.id)}
                                    className="w-full py-2 text-sm text-indigo-600 hover:text-indigo-700 font-medium flex items-center justify-center gap-1 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                                  >
                                    {isTasksExpanded ? (
                                      <>
                                        Show Less
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                                        </svg>
                                      </>
                                    ) : (
                                      <>
                                        Show {eventDetails?.details.length - 2} More Tasks
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                      </>
                                    )}
                                  </button>
                                )}
                              </div>
                            </div>
                          ) : (
                            <div className="border border-gray-200 p-2 rounded-lg">
                              <span>No Task assigned.</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Duration Summary */}
                      <div className="py-1 px-4 bg-gray-50 border-t border-gray-100">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Event Duration:</span>
                          <span className="font-medium text-orange-600">
                            {
                              (() => {
                                const totalMilliseconds = new Date(event?.to_date).getTime() - new Date(event?.from_date).getTime();
                                const totalHours = Math.round(totalMilliseconds / (1000 * 60 * 60));

                                if (totalHours >= 24) {
                                  const days = Math.floor(totalHours / 24);
                                  const hours = totalHours % 24;
                                  return `${days} day${days > 1 ? 's' : ''} ${hours} hour${hours !== 1 ? 's' : ''}`;
                                }

                                return `${totalHours} hours`;
                              })()
                            }
                          </span>
                        </div>
                      </div>

                    </div>
                  );
                })
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <AlertCircle className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-2">No Events Found</h3>
                    <p className="text-gray-600 text-sm">
                      No events found for the selected date range. Try adjusting your filters.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      {showMedia && (
        <ViewMedia
          show={showMedia}
          setShow={setShowMedia}
          selectedEvent={selectedEvent}
        />
      )}
    </div>
  )
}

export default ReportView