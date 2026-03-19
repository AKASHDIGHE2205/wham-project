import { ChevronDown, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getUserFromStorage } from '../../../helper/cryptoUser';
import { updateActivity } from '../../../services/calender/calenderApi';
import { getActiveTasks } from '../../../services/dashboard/DashboardApi';
import type { Tasks } from '../../../types/activity.types';
import type { SubActivity } from './Index';

interface ActivityStep4Props {
  formData: any;
  updateFormData: (data: any) => void;
  onPrevious: () => void;
  onNext: () => void;
  activityId: number;
  activityDate: string;
  isEdit: boolean
}

export const ActivityStep4: React.FC<ActivityStep4Props> = ({ formData, updateFormData, onPrevious, activityId, activityDate, onNext, isEdit }) => {
  const [tasks, setTasks] = useState<Tasks[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const user = getUserFromStorage();

  useEffect(() => {
    const fetchData = async () => {
      const response = await getActiveTasks();
      if (response) {
        setTasks(response?.tasks || []);
      }
    };
    fetchData();
  }, []);

  const addNewSubActivity = () => {
    // Find the highest existing ID to create a new unique ID
    const maxId = formData?.subActivities.length > 0
      ? Math.max(...formData.subActivities.map((sa: SubActivity) => sa.id || 0))
      : 0;

    const newSubActivity = {
      id: maxId + 1, // Use incremental ID for new activities
      sr_no: (formData?.subActivities.length + 1),
      task_id: 0,
      title: '',
      start_time: '',
      end_time: '',
      notes: '',
      attachment: null
    };
    updateFormData({ subActivities: [...formData?.subActivities, newSubActivity] });
  };

  const removeSubActivity = (id: number) => {
    if (formData?.subActivities.length > 1) {
      const filtered = formData?.subActivities.filter(
        (activity: SubActivity) => activity.id !== id
      );

      // Reindex sr_no
      const reindexed = filtered.map((activity: SubActivity, index: number) => ({
        ...activity,
        sr_no: index + 1
      }));

      updateFormData({ subActivities: reindexed });
    }
  };

  const updateSubActivity = (id: number, field: keyof SubActivity, value: any) => {
    const updatedActivities = formData?.subActivities.map((activity: SubActivity) => {
      if (activity.id === id) {
        return { ...activity, [field]: value };
      }
      return activity;
    });

    updateFormData({ subActivities: updatedActivities });
  };

  const handleFileChange = (id: number, file: File | null) => {
    updateSubActivity(id, 'attachment', file);
  };

  const validateForm = () => {
    if (!formData?.title?.trim()) {
      toast.error("Title is required");
      return false;
    }

    if (!activityId) {
      toast.error("Activity Id is required");
      return false;
    }

    if (!activityDate) {
      toast.error("Activity Date is required");
      return false;
    }

    if (!formData?.occasion) {
      toast.error("Please select an occasion");
      return false;
    }

    if (!formData?.campaign) {
      toast.error("Please select a campaign");
      return false;
    }

    if (!formData?.selectedLocations.length) {
      toast.error("Please select at least one location");
      return false;
    }

    if (!formData?.startDate) {
      toast.error("Start date is required");
      return false;
    }

    if (!formData?.endDate) {
      toast.error("End date is required");
      return false;
    }

    if (new Date(formData?.startDate) > new Date(formData?.endDate)) {
      toast.error("Start date cannot be after end date");
      return false;
    }

    if (!formData?.vehicleType) {
      toast.error("Vehicle type is required");
      return false;
    }

    if (!formData?.subActivities.length) {
      toast.error("Please add at least one sub activity");
      return false;
    }

    for (const sa of formData?.subActivities) {
      if (!sa.task_id) {
        toast.error("Please select sub-activity type for all activities");
        return false;
      }

      if (!sa.title?.trim()) {
        toast.error("Sub activity title is required for all activities");
        return false;
      }

      if (!sa.start_time || !sa.end_time) {
        toast.error("Sub activity start and end time required for all activities");
        return false;
      }

      if (sa.start_time > sa.end_time) {
        toast.error("Sub activity start time must be before end time");
        return false;
      }

      if (!sa.notes?.trim()) {
        toast.error("Notes are required for all sub activities");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    const submitData = {
      activityId: activityId,
      activityDate: activityDate,
      title: formData?.title,
      occasion: formData?.occasion,
      campaign: formData?.campaign,
      status: formData?.status,

      colleges: formData?.selectedColleges || [],
      departments: formData?.selectedDepartments || [],

      locations: formData?.selectedLocations.map((loc: any) => ({
        id: loc.id,
        lat: loc.lat,
        lng: loc.lng,
        address: loc.address,
        city: loc.city,
        state: loc.state,
        pin: loc.pin
      })),

      startDate: formData?.startDate,
      endDate: formData?.endDate,

      members: formData?.selectedMembers.map((member: any) => ({
        id: member.id,
        first_name: member.first_name,
        middle_name: member.middle_name,
        last_name: member.last_name
      })),

      teams: formData?.selectedTeams.map((team: any) => ({
        id: team.id,
        name: team.name
      })),

      vehicleType: formData?.vehicleType,
      notes: formData?.notes,

      subActivities: formData?.subActivities.map((sa: SubActivity) => ({
        id: sa.id,
        task_id: sa.task_id,
        title: sa.title,
        start_time: sa.start_time,
        end_time: sa.end_time,
        notes: sa.notes
        // Note: attachment is not included in the request body
      })),

      userId: user?.id ?? 0
    };

    try {
      setIsSubmitting(true);
      const response = await updateActivity(submitData);
      if (response) {
        onNext();
      }
    } catch (error) {
      console.log(error);
      toast.error("Failed to update activity");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={addNewSubActivity}
          disabled={isEdit}
          className="flex items-center space-x-2 px-4 py-2 bg-linear-to-r from-[#5441ff] to-[#4531ff] text-white rounded-md hover:bg-purple-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          <span className="font-semibold">Add Sub-Activity</span>
        </button>
      </div>

      {/* Mobile: Card View (visible on small screens) */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {formData?.subActivities.map((activity: SubActivity, index: number) => (
            <div
              key={activity.id}
              className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm relative"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <span className="text-sm font-semibold text-[#4f3fe0]">
                  Activity {index + 1}
                </span>
                {formData?.subActivities.length > 1 && (
                  <button
                    onClick={() => removeSubActivity(activity.id)}
                    disabled={isEdit}
                    className="text-red-500 hover:text-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Card Content */}
              <div className="space-y-3">
                {/* Sub-Activity Type */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Sub-Activity Type <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select
                      value={activity.task_id || ''}
                      onChange={(e) => updateSubActivity(activity.id, 'task_id', parseInt(e.target.value) || 0)}
                      required
                      disabled={isEdit}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
                    >
                      <option value="" disabled>Select</option>
                      {tasks?.map((item) => (
                        <option key={item.id} value={item.id}>{item.task_name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                  </div>
                </div>

                {/* Title */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={activity.title}
                    onChange={(e) => updateSubActivity(activity.id, 'title', e.target.value)}
                    required
                    disabled={isEdit}
                    placeholder="Enter title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>

                {/* Time Range */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Time Range <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="time"
                      value={activity.start_time}
                      onChange={(e) => updateSubActivity(activity.id, 'start_time', e.target.value)}
                      required
                      disabled={isEdit}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={activity.end_time}
                      onChange={(e) => updateSubActivity(activity.id, 'end_time', e.target.value)}
                      required
                      disabled={isEdit}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm disabled:cursor-not-allowed disabled:bg-gray-100"
                    />
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Add notes..."
                    value={activity.notes}
                    onChange={(e) => updateSubActivity(activity.id, 'notes', e.target.value)}
                    required
                    disabled={isEdit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm resize-none disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </div>

                {/* Attachment - Hidden as per your requirement */}
                <div hidden>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Attachment
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(activity.id, e.target.files?.[0] || null)}
                    disabled={isEdit}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 disabled:cursor-not-allowed"
                  />
                  {activity.attachment && (
                    <p className="mt-1 text-xs text-gray-500 truncate">
                      Selected: {activity.attachment}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop: Table View (visible on medium screens and above) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Sub-Activity Type <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Title <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Start Time <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">End Time <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Notes <span className="text-red-500">*</span></th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider" hidden>Attachment</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
            </tr>
          </thead>
          <tbody>
            {formData?.subActivities.map((activity: SubActivity, index: number) => (
              <tr key={activity.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>

                {/* Sub-Activity Type */}
                <td className="px-4 py-3">
                  <select
                    value={activity.task_id || ''}
                    onChange={(e) => updateSubActivity(activity.id, 'task_id', parseInt(e.target.value) || 0)}
                    required
                    disabled={isEdit}
                    className="w-40 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                  >
                    <option value="" disabled>Select</option>
                    {tasks?.map((item) => (
                      <option key={item.id} value={item.id}>{item.task_name}</option>
                    ))}
                  </select>
                </td>

                {/* Title */}
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={activity.title}
                    onChange={(e) => updateSubActivity(activity.id, 'title', e.target.value)}
                    required
                    disabled={isEdit}
                    placeholder="Title"
                    className="w-32 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </td>

                {/* Start Time */}
                <td className="px-4 py-3">
                  <input
                    type="time"
                    value={activity.start_time}
                    onChange={(e) => updateSubActivity(activity.id, 'start_time', e.target.value)}
                    required
                    disabled={isEdit}
                    className="w-28 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </td>

                {/* End Time */}
                <td className="px-4 py-3">
                  <input
                    type="time"
                    value={activity.end_time}
                    onChange={(e) => updateSubActivity(activity.id, 'end_time', e.target.value)}
                    required
                    disabled={isEdit}
                    className="w-28 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </td>

                {/* Notes */}
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={activity.notes}
                    onChange={(e) => updateSubActivity(activity.id, 'notes', e.target.value)}
                    required
                    disabled={isEdit}
                    placeholder="Notes"
                    className="w-32 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed disabled:bg-gray-100"
                  />
                </td>

                {/* Attachment */}
                <td className="px-4 py-3" hidden>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(activity.id, e.target.files?.[0] || null)}
                    disabled={isEdit}
                    className="w-48 text-sm file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 px-2 py-1.5 border border-gray-300 rounded-md disabled:cursor-not-allowed"
                  />
                  {activity.attachment && (
                    <p className="mt-1 text-xs text-gray-500 truncate">{activity.attachment}</p>
                  )}
                </td>

                {/* Action */}
                <td className="px-4 py-3">
                  {formData?.subActivities.length > 1 && (
                    <button
                      onClick={() => removeSubActivity(activity.id)}
                      className="text-red-500 hover:text-red-700 transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                      title="Remove"
                      disabled={isEdit}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <span className="text-xs text-red-600 block">
        *Sub-activities editable only before manager approval.*
      </span>

      <div className="pt-6 border-t border-gray-100 flex justify-between">
        <button
          onClick={onPrevious}
          className="px-8 py-2 bg-linear-to-r from-[#5441ff] to-[#4531ff] text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
        >
          Previous
        </button>
        {!isEdit ? (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="px-8 py-2 bg-linear-to-r from-[#5441ff] to-[#4531ff] text-white rounded-md hover:bg-purple-700 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Submitting...' : 'Submit'}
          </button>
        ) : (
          <button
            onClick={onNext}
            className="px-8 py-2 bg-gray-100 rounded-md hover:bg-gray-200 border border-gray-300 transition-colors cursor-pointer shadow-md"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
};