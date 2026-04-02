  import { Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DataLoading from '../../../components/DataLoading';
import { getUserFromStorage } from '../../../helper/cryptoUser';
import { getActivityDetails } from '../../../services/calender/calenderApi';
import type { College, Department, SelectedMember, SelectedTeam } from '../../../types/activity.types';
import { ActivityStep1 } from './ActivityStep1';
import { ActivityStep2 } from './ActivityStep2';
import { ActivityStep3 } from './ActivityStep3';
import { ActivityStep4 } from './ActivityStep4';
import { ActivityStep5 } from './ActivityStep5';

  export interface ActivityDetailsResponse {
    activity: Activity;
    files: ActivityFile;
    colleges: College[];
    departments: Department[];
    locations: ActivityLocation[];
    members: Member[];
    teams: Team[];
    subActivities: SubActivity[];
  }
  export interface SelectedLocation {
    id: number;
    lat: number;
    lng: number;
    address: string;
    city: string;
    state: string;
    pin: string;
  }
  export interface ActivityLocation {
    lat: string;
    lng: string;
    address: string;
    city: string;
    state: string;
    pin: string;
  }
  export interface Activity {
    id: number;
    date: string;
    title: string;
    occasion_id: number;
    campaign_id: number;
    start_date: string;
    end_date: string;
    vehicle_type: string;
    notes: string;
    status: string;
    c_at: string;
    c_by: number;
    u_at: string;
    u_by: number;
  }
  export interface ActivityFile {
    file_name: string;
    file_path: string;
    file_type: string;
  }
  export interface Member {
    member_id: number;
    full_name: string;
    first_name: string;
    middle_name: string;
    last_name: string;
  }
  export interface Team {
    team_id: number;
    name: string;
  }
  export interface SubActivity {
    id: number;
    sr_no: number;
    task_id: number;
    title: string;
    start_time: string;
    end_time: string;
    notes: string;
    attachment: string | null;
  }

  const steps = [
    { id: 1, name: 'Step 1: Activity Details' },
    { id: 2, name: 'Step 2: Time & Participants' },
    { id: 3, name: 'Step 3: Logistics & Attachments' },
    { id: 4, name: 'Step 4: Sub-Activities' },
  ];

  const initialFormData = {
    // Step 1
    title: '',
    occasion: 0,
    campaign: 0,
    status: '',
    selectedColleges: [] as College[],
    selectedDepartments: [] as Department[],
    selectedLocations: [] as SelectedLocation[],

    // Step 2
    startDate: '',
    endDate: '',
    selectedMembers: [] as SelectedMember[],
    selectedTeams: [] as SelectedTeam[],

    // Step 3
    vehicleType: '',
    notes: '',
    imageAttachment: '',
    fileAttachment: '',

    // Step 4
    subActivities: [{
      id: 1,
      sr_no: 1,
      task_id: 0,
      title: '',
      start_time: '',
      end_time: '',
      notes: '',
      attachment: null
    }] as SubActivity[]
  };

  export default function UpdateActivityPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState(initialFormData);
    const [loading, setLoading] = useState(true);
    const [isEdit, setIsEdit] = useState(false);
    const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
    const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
    const navigate = useNavigate();
    const { id, date } = useParams();
    const user = getUserFromStorage();

    useEffect(() => {
      const fetchData = async () => {
        const body = { id, date };
        const response: ActivityDetailsResponse = await getActivityDetails(body);
        if (response) {
          const { activity, colleges, departments, locations, members, teams, subActivities, files } = response;
          if ((activity?.status === 'A' || activity?.status === 'C') && (user?.role === 'Manager' || user?.role === 'Master')) {
            setIsEdit(true);
          }
          setFormData({
            title: activity?.title,
            occasion: activity?.occasion_id,
            campaign: activity?.campaign_id,
            status: activity?.status,
            selectedColleges: colleges,
            selectedDepartments: departments,

            selectedLocations: locations?.map((loc, index) => ({
              id: index,
              lat: Number(loc?.lat),
              lng: Number(loc?.lng),
              address: loc?.address,
              city: loc?.city,
              state: loc?.state,
              pin: loc?.pin
            })),

            startDate: activity?.start_date,
            endDate: activity?.end_date,

            selectedMembers: members?.map((m) => ({
              id: m?.member_id,
              full_name: m?.full_name,
              first_name: m?.first_name,
              middle_name: m?.middle_name,
              last_name: m?.last_name,
            })),

            selectedTeams: teams?.map((t) => ({
              id: t?.team_id,
              name: t?.name
            })),

            vehicleType: activity?.vehicle_type,
            notes: activity?.notes,

            imageAttachment: files?.file_path || '',
            fileAttachment: "",

            subActivities: subActivities?.map((sub) => ({
              id: sub?.id,
              sr_no: sub?.sr_no,
              task_id: sub?.task_id,
              title: sub?.title,
              start_time: sub?.start_time,
              end_time: sub?.end_time,
              notes: sub?.notes,
              attachment: sub?.attachment
            }))
          });
          setLoading(false);
        }
      };
      fetchData();
    }, [id, date]);

    const reset = () => {
      navigate('/calender')
      setFormData(initialFormData);
    };

    const updateFormData = (newData: Partial<typeof formData>) => {
      setFormData(prev => ({ ...prev, ...newData }));
    };

    if (loading) {
      <div className='flex justify-center items-center '>
        <DataLoading />
      </div>
    }

    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 border border-orange-500 m-2 rounded-lg">
        <div className="max-w-5xl mx-auto shadow-2xl ">
          <header className="mb-8 p-4 flex items-center justify-between gap-4">
            <div className='flex justify-start items-center gap-2'>
              <button
                onClick={() => navigate(-1)}
                className='px-2 py-1 border border-gray-100 rounded-md cursor-pointer flex justify-center items-center bg-gray-100 hover:bg-gray-200'
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6" /></svg> Back
              </button>
              <h1 className="text-sm font-semibold text-gray-800 flex-1">
                Update Activity
              </h1>
            </div>

            <div className='flex justify-start items-center gap-2' hidden>
              <button
                type="button"
                className="px-3 py-1.5 border border-green-500 text-green-700 bg-green-50 rounded-md cursor-pointer flex justify-center items-center gap-1 hover:bg-green-100 transition"
              >
                Mark as Approved
              </button>
              <button
                type="button"
                className="px-2 py-1 border border-red-500 text-red-700 bg-red-50 rounded-md cursor-pointer flex justify-center items-center gap-1 hover:bg-red-100 transition"
              >
                Delete
              </button>
            </div>
          </header>

          {/* Stepper Navigation */}
          {currentStep <= 4 && (
            <nav className="mb-8 rounded-lg overflow-hidden flex shadow-sm overflow-x-auto sm:overflow-x-visible">
              {steps?.map((step, index) => {
                const isActive = currentStep === step?.id;
                const isCompleted = currentStep > step?.id;

                return (
                  <div
                    key={step?.id}
                    className={`flex-1 flex items-center justify-center py-3 px-4 relative transition-all cursor-pointer duration-300 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                    onClick={()=>setCurrentStep(step?.id || 1)}
                  >
                    <div className="flex items-center space-x-2">{/* z-10 */}
                      {isCompleted ? (
                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      ) : null}
                      <span className={`text-sm font-semibold whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-500'}`}>
                        {step?.name}
                      </span>
                    </div>

                    {/* Arrow effect for active step */}
                    {isActive && index < steps?.length - 1 && (
                      <div className="absolute right-[-15px] top-0 bottom-0 w-0 h-0 border-t-24px border-t-transparent border-b-24pxborder-b-transparent border-l-15px border-l-blue-600 z-20"></div>
                    )}
                    {isActive && index > 0 && (
                      <div className="absolute left-0 top-0 bottom-0 w-0 h-0 border-t-24px border-t-transparent border-b-24px border-b-transparent border-l-15px border-l-gray-100 z-0"></div>
                    )}
                  </div>
                );
              })}
            </nav>
          )}

          {/* Form Container */}
          <div className="bg-white rounded-2xl shadow-xl shadow-gray-200/50 border border-gray-100 p-8 min-h-[500px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                {currentStep === 1 && (
                  <ActivityStep1
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={nextStep}
                    isEdit={isEdit}
                  />
                )}
                {currentStep === 2 && (
                  <ActivityStep2
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={nextStep}
                    onPrevious={prevStep}
                    isEdit={isEdit}
                  />
                )}
                {currentStep === 3 && (
                  <ActivityStep3
                    formData={formData}
                    updateFormData={updateFormData}
                    onNext={nextStep}
                    onPrevious={prevStep}
                    isEdit={isEdit}
                  />
                )}
                {currentStep === 4 && (
                  <ActivityStep4
                    formData={formData}
                    updateFormData={updateFormData}
                    onPrevious={prevStep}
                    onNext={reset}
                    activityId={id ? Number(id) : 0}
                    activityDate={date ?? ""}
                    isEdit={isEdit}
                  />
                )}
                {currentStep === 5 && (
                  <ActivityStep5 onReset={reset} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    );
  }
