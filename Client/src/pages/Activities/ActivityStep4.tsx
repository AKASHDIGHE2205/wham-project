import { ChevronDown, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getUserFromStorage } from '../../helper/cryptoUser';
import { addActivity } from '../../services/calender/calenderApi';
import { getActiveTasks } from '../../services/dashboard/DashboardApi';
import type { SubActivityCard, Tasks } from '../../types/activity.types';

interface ActivityStep4Props {
  formData: any;
  updateFormData: (data: any) => void;
  onPrevious: () => void;
  onNext: () => void;
}

export const ActivityStep4: React.FC<ActivityStep4Props> = ({ formData, updateFormData, onPrevious, onNext }) => {
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
    const newCard: SubActivityCard = {
      id: (formData.subActivities.length + 1).toString(),
      taskId: undefined,
      title: '',
      startTime: '',
      endTime: '',
      notes: '',
      attachment: null
    };
    updateFormData({ subActivities: [...formData.subActivities, newCard] });
  };

  const removeSubActivity = (id: number) => {
    if (formData.subActivities.length > 1) {
      const filtered = formData.subActivities.filter(
        (activity: SubActivityCard) => activity.id !== id
      );

      const reindexed = filtered.map((activity: SubActivityCard, index: number) => ({
        ...activity,
        id: (index + 1).toString()
      }));

      updateFormData({ subActivities: reindexed });
    }
  };

  const updateSubActivity = (id: number, field: keyof SubActivityCard, value: any) => {
    const updatedActivities = formData.subActivities.map((activity: SubActivityCard) => {
      if (activity.id === id) {
        const updatedActivity = { ...activity, [field]: value };

        // If taskId is updated, also set the taskName
        if (field === 'taskId') {
          const selectedTask = tasks.find(t => t.id === value);
          updatedActivity.taskName = selectedTask?.task_name || '';
        }

        return updatedActivity;
      }
      return activity;
    });

    updateFormData({ subActivities: updatedActivities });
  };

  const handleFileChange = (id: number, file: File | null) => {
    updateSubActivity(id, 'attachment', file);
    if (file) {
      updateSubActivity(id, 'attachmentName', file.name);
    }
  };

  const validateForm = () => {
    if (!formData.title?.trim()) {
      toast.error("Title is required");
      return false;
    }

    if (!formData.occasion) {
      toast.error("Please select an occasion");
      return false;
    }

    if (!formData.campaign) {
      toast.error("Please select a campaign");
      return false;
    }

    // if (!formData.selectedColleges.length) {
    //   toast.error("Please select at least one college");
    //   return false;
    // }

    // if (!formData.selectedDepartments.length) {
    //   toast.error("Please select at least one department");
    //   return false;
    // }

    if (!formData.selectedLocations.length) {
      toast.error("Please select at least one location");
      return false;
    }

    if (!formData.startDate) {
      toast.error("Start date is required");
      return false;
    }

    if (!formData.endDate) {
      toast.error("End date is required");
      return false;
    }

    if (new Date(formData.startDate) > new Date(formData.endDate)) {
      toast.error("Start date cannot be after end date");
      return false;
    }


    if (!formData.vehicleType) {
      toast.error("Vehicle type is required");
      return false;
    }

    if (!formData.subActivities.length) {
      toast.error("Please add at least one sub activity");
      return false;
    }

    for (const sa of formData.subActivities) {
      if (!sa.title?.trim()) {
        toast.error("Sub activity title is required");
        return false;
      }

      if (!sa.startTime || !sa.endTime) {
        toast.error("Sub activity start and end time required");
        return false;
      }

      if (sa.startTime > sa.endTime) {
        toast.error("Sub activity start time must be before end time");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {

    if (!validateForm()) return;

    const submitData = new FormData();

    // Step 1 - Simple fields (backend expects strings)
    submitData.append('title', formData.title);
    submitData.append('occasion', formData.occasion.toString());
    submitData.append('campaign', formData.campaign.toString());

    // Step 1 - Arrays (backend expects JSON strings)
    submitData.append('colleges', JSON.stringify(formData.selectedColleges));
    submitData.append('departments', JSON.stringify(formData.selectedDepartments));
    submitData.append('locations', JSON.stringify(formData.selectedLocations.map((loc: any) => ({
      id: loc.id,
      lat: loc.lat,
      lng: loc.lng,
      address: loc.address,
      city: loc.city,
      state: loc.state,
      pin: loc.pin
    }))));

    // Step 2 - Dates
    submitData.append('startDate', formData.startDate);
    submitData.append('endDate', formData.endDate);

    // Step 2 - Participants (backend expects JSON strings)
    submitData.append('members', JSON.stringify(formData.selectedMembers.map((member: any) => ({
      id: member.id,
      first_name: member.first_name,
      middle_name: member.middle_name,
      last_name: member.last_name
    }))));

    submitData.append('teams', JSON.stringify(formData.selectedTeams.map((team: any) => ({
      id: team.id,
      name: team.name
    }))));

    // Step 3 - Logistics
    submitData.append('vehicleType', formData.vehicleType);
    submitData.append('notes', formData.notes);

    // Step 3 - Files (if any)
    if (formData.imageAttachment) {
      submitData.append('image', formData.imageAttachment);
    }
    if (formData.fileAttachment) {
      submitData.append('file', formData.fileAttachment);
    }

    // Step 4 - SubActivities (backend expects JSON string with specific format)
    const subActivitiesForApi = formData.subActivities.map((sa: SubActivityCard) => ({
      id: sa.id,
      taskId: sa.taskId,
      taskName: sa.taskName,
      title: sa.title,
      startTime: sa.startTime,
      endTime: sa.endTime,
      notes: sa.notes,
      attachmentName: sa.attachment ? sa.attachment.name : null
    }));
    submitData.append('subActivities', JSON.stringify(subActivitiesForApi));

    // Append sub-activity files separately (if needed by backend)
    formData.subActivities.forEach((sa: SubActivityCard, index: number) => {
      if (sa.attachment) {
        submitData.append(`subActivity_${index}_attachment`, sa.attachment);
      }
    });
    submitData.append('userId', JSON.stringify(user?.id || 0));
    setIsSubmitting(true);
    try {
      const response = await addActivity(submitData);
      if (response) {
        onNext();
      }
    } catch (error) {
      console.error('Submission failed:', error);
    } finally {
      setIsSubmitting(false);
    }

  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <button
          onClick={addNewSubActivity}
          className="flex items-center space-x-2 px-4 py-1 bg-linear-to-r from-[#5441ff] to-[#4531ff] text-white rounded-md hover:bg-purple-700 transition-colors"
        >
          <span className="font-semibold">Add Sub-Activity</span>
        </button>
      </div>

      {/* Mobile: Card View (visible on small screens) */}
      <div className="block md:hidden">
        <div className="space-y-4">
          {formData.subActivities.map((activity: SubActivityCard) => (
            <div
              key={activity.id}
              className="border border-gray-200 rounded-xl p-4 bg-white shadow-sm relative"
            >
              {/* Card Header */}
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <span className="text-sm font-semibold text-purple-600">
                  Activity #{activity.id}
                </span>
                {formData.subActivities.length > 1 && (
                  <button
                    onClick={() => removeSubActivity(activity.id)}
                    className="text-red-500 hover:text-red-700 transition-colors"
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
                      value={activity.taskId || ''}
                      onChange={(e) => updateSubActivity(activity.id, 'taskId', parseInt(e.target.value) || undefined)}
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-1 focus:ring-purple-500 bg-white text-sm"
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
                    placeholder="Enter title"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm"
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
                      value={activity.startTime}
                      onChange={(e) => updateSubActivity(activity.id, 'startTime', e.target.value)}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <span className="text-gray-400">to</span>
                    <input
                      type="time"
                      value={activity.endTime}
                      onChange={(e) => updateSubActivity(activity.id, 'endTime', e.target.value)}
                      required
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 text-sm resize-none"
                  />
                </div>

                {/* Attachment */}
                <div hidden>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Attachment
                  </label>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(activity.id, e.target.files?.[0] || null)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100"
                  />
                  {activity.attachmentName && (
                    <p className="mt-1 text-xs text-gray-500 truncate">
                      Selected: {activity.attachmentName}
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
            {formData.subActivities.map((activity: SubActivityCard) => (
              <tr key={activity.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="px-4 py-3 text-sm text-gray-500">{activity.id}</td>

                {/* Sub-Activity Type */}
                <td className="px-4 py-3">
                  <select
                    value={activity.taskId || ''}
                    onChange={(e) => updateSubActivity(activity.id, 'taskId', parseInt(e.target.value) || undefined)}
                    required
                    className="w-40 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
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
                    placeholder="Title"
                    className="w-32 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </td>

                {/* Start Time */}
                <td className="px-4 py-3">
                  <input
                    type="time"
                    value={activity.startTime}
                    onChange={(e) => updateSubActivity(activity.id, 'startTime', e.target.value)}
                    required
                    className="w-28 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </td>

                {/* End Time */}
                <td className="px-4 py-3">
                  <input
                    type="time"
                    value={activity.endTime}
                    onChange={(e) => updateSubActivity(activity.id, 'endTime', e.target.value)}
                    required
                    className="w-28 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </td>

                {/* Notes */}
                <td className="px-4 py-3">
                  <input
                    type="text"
                    value={activity.notes}
                    onChange={(e) => updateSubActivity(activity.id, 'notes', e.target.value)}
                    required
                    placeholder="Notes"
                    className="w-32 px-2 py-1.5 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
                  />
                </td>

                {/* Attachment */}
                <td className="px-4 py-3" hidden>
                  <input
                    type="file"
                    onChange={(e) => handleFileChange(activity.id, e.target.files?.[0] || null)}
                    className="w-48 text-sm file:mr-2 file:py-1 file:px-2 file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 px-2 py-1.5 border border-gray-300 rounded-md"
                  />
                  {activity.attachmentName && (
                    <p className="mt-1 text-xs text-gray-500 truncate">{activity.attachmentName}</p>
                  )}
                </td>

                {/* Action */}
                <td className="px-4 py-3">
                  {formData.subActivities.length > 1 && (
                    <button
                      onClick={() => removeSubActivity(activity.id)}
                      className="text-red-500 hover:text-red-700 transition-colors"
                      title="Remove"
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

      <span className="text-xs font-semibold text-gray-600 block">
        *Sub-activities editable only before manager approval.*
      </span>

      <div className="pt-6 border-t border-gray-100 flex justify-between">
        <button
          onClick={onPrevious}
          className="px-8 py-2 bg-linear-to-r from-[#5441ff] to-[#4531ff] text-white font-semibold rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="px-8 py-2 bg-linear-to-r from-[#5441ff] to-[#4531ff] text-white font-semibold rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
        >
          Submit
        </button>
      </div>
    </div>
  );
};