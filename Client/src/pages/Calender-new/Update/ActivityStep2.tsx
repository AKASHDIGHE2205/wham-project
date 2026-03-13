import { Calendar, User, UserPlus, Users, X } from "lucide-react";
import React, { useState } from "react";
import MemberModal from "../../../components/MemberModal";
import type { SelectedMember, SelectedTeam } from "../../../types/activity.types";
import type { Member } from "./Index";

interface ActivityStep2Props {
  formData: any;
  updateFormData: (data: any) => void;
  onNext: () => void;
  onPrevious: () => void;
  isEdit : boolean
}

export const ActivityStep2: React.FC<ActivityStep2Props> = ({ formData, updateFormData, onNext, onPrevious, isEdit }) => {
    const [showMembers, setShowMembers] = useState(false);

    const handleSelectionConfirm = (members: SelectedMember[], teams: SelectedTeam[]) => {
    updateFormData({
      selectedMembers: members,
      selectedTeams: teams
    });
  };

  const removeMember = (memberId: number) => {
    updateFormData({
      selectedMembers: formData.selectedMembers.filter((m: SelectedMember) => m.id !== memberId)
    });
  };

  const removeTeam = (teamId: number) => {
    updateFormData({
      selectedTeams: formData.selectedTeams.filter((t: SelectedTeam) => t.id !== teamId)
    });
  };

  const totalSelections = formData.selectedMembers.length + formData.selectedTeams.length;

  const getCurrentDateTime = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const minDateTime = getCurrentDateTime();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    updateFormData({ [name]: value });
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Step 2: Time & Participants */}
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  name="startDate"
                  min={minDateTime}
                  value={formData.startDate}
                  onChange={handleChange}
                  required
                  disabled={isEdit}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                End Date <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  name="endDate"
                  min={minDateTime}
                  value={formData.endDate}
                  onChange={handleChange}
                  required
                  disabled={isEdit}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500 disabled:cursor-not-allowed"
                />
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Participants Section */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">
            Participants <span className="text-red-500">*</span>
          </label>

          {/* Search and Add Button */}
          <div className="flex w-full mb-3">
            <div className="relative flex-1">
              <input
                type="text"
                placeholder="Select members or teams..."
                className="w-full px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                readOnly
              />
            </div>
            <button
              onClick={() => setShowMembers(true)}
              disabled={isEdit}
              className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md flex items-center justify-center cursor-pointer bg-purple-50 hover:bg-purple-100 transition-colors disabled:cursor-not-allowed"
              title="Add participants"
            >
              <UserPlus size={20} className="text-purple-600" />
            </button>
          </div>

          {/* Selected Items Display */}
          {totalSelections > 0 && (
            <div className="space-y-3">
              {/* Selected Teams */}
              {formData.selectedTeams.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Teams ({formData.selectedTeams.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedTeams.map((team: SelectedTeam) => (
                      <div
                        key={`team-${team.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-800 rounded-full text-sm border border-blue-200 group hover:bg-blue-200 transition-colors"
                      >
                        <span className="font-medium flex justify-center items-center gap-1">
                          <Users size={14} /> {team.name}
                        </span>
                        <button
                          onClick={() => removeTeam(team.id)}
                          disabled={isEdit}
                          className="ml-1 p-0.5 rounded-full hover:bg-blue-300 transition-colors disabled:cursor-not-allowed"
                          title="Remove team"
                        >
                          <X size={14} className="text-blue-800" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Selected Members */}
              {formData.selectedMembers.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Individual Members ({formData.selectedMembers.length})
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {formData.selectedMembers.map((member: Member) => (
                      <div
                        key={`member-${member.member_id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-orange-100 text-orange-800 rounded-full text-sm border border-orange-200 group hover:bg-orange-200 transition-colors"
                      >
                        <span className="font-medium flex justify-center items-center gap-1">
                          <User size={14} /> {`${member?.first_name} ${member?.middle_name} ${member?.last_name}`}
                        </span>
                        <button
                          onClick={() => removeMember(member.member_id)}
                          className="ml-1 p-0.5 rounded-full hover:bg-orange-300 transition-colors"
                          title="Remove member"
                        >
                          <X size={14} className="text-orange-800" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Summary and Clear All option */}
              <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                <button
                  onClick={() => {
                    updateFormData({
                      selectedMembers: [],
                      selectedTeams: []
                    });
                  }}
                  disabled={isEdit}
                  className="text-xs text-red-600 hover:text-red-800 font-medium transition-colors disabled:cursor-not-allowed"
                >
                  Clear all
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {totalSelections === 0 && (
            <div className="text-center py-4 px-3 bg-gray-50 rounded-lg border border-dashed border-gray-300">
              <p className="text-sm text-gray-500 mb-2">
                No participants selected yet
              </p>
              <p className="text-xs text-gray-400">
                Click the{" "}
                <UserPlus size={12} className="inline text-purple-600" /> button
                to add teams or members
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="pt-6 border-t border-gray-100 flex justify-between">
        <button
          onClick={onPrevious}
          className="px-8 py-2  bg-linear-to-r from-indigo-600 to-purple-600  text-white font-semibold rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
        >
          Previous
        </button>
        <button
          onClick={onNext}
          className="px-8 py-2  bg-linear-to-r from-indigo-600 to-purple-600  text-white font-semibold rounded-md hover:bg-purple-700 transition-colors cursor-pointer"
        >
          Next
        </button>
      </div>

      {/* Member/Team Selection Modal */}
      {showMembers && (
        <MemberModal
          show={showMembers}
          setShow={setShowMembers}
          selectedMembers={formData.selectedMembers}
          selectedTeams={formData.selectedTeams}
          onConfirm={handleSelectionConfirm}
        />
      )}
    </div>
  );
};