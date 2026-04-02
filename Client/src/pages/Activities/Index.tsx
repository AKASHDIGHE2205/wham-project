import { Check } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useEffect, useState } from 'react'; // Add useEffect
import { useNavigate, useSearchParams } from 'react-router-dom';
import AccessDenied from '../../components/AccessDenied';
import { getUserFromStorage } from '../../helper/cryptoUser';
import type { College, Department, SelectedLocation, SelectedMember, SelectedTeam, SubActivityCard } from '../../types/activity.types';
import { ActivityStep1 } from './ActivityStep1';
import { ActivityStep2 } from './ActivityStep2';
import { ActivityStep3 } from './ActivityStep3';
import { ActivityStep4 } from './ActivityStep4';
import { ActivityStep5 } from './ActivityStep5';

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
  imageAttachment: null as File | null,
  fileAttachment: null as File | null,

  // Step 4
  subActivities: [{
    id: 1,
    taskId: 0,
    title: '',
    startTime: '',
    endTime: '',
    notes: '',
    attachment: null
  }] as SubActivityCard[]
};

const formatDateWithTime = (dateStr: string, hours: number, minutes: number, seconds: number): string => {
  const [day, month, year] = dateStr.split('-');
  return `${year}-${month}-${day}T${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
};

export default function CreateActivityPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState(initialFormData);
  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, 5));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 1));
  const navigate = useNavigate();
  const user = getUserFromStorage();
  const [params] = useSearchParams();
  const date = params.get('date');

  useEffect(() => {
    if (date) {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();
      const currentSeconds = now.getSeconds();

      // Calculate end time (current time + 1 hour)
      const endHours = currentHours + 1;

      // Handle day rollover if needed
      const endDate = new Date(now);
      endDate.setHours(endHours);

      const startDateStr = formatDateWithTime(date, currentHours, currentMinutes, currentSeconds);
      const endDateStr = formatDateWithTime(date, endDate.getHours(), endDate.getMinutes(), endDate.getSeconds());

      setFormData(prev => ({
        ...prev,
        startDate: startDateStr,
        endDate: endDateStr
      }));
    }
  }, [date]);

  const isOrganizer = user?.isorganizer === 'Y';

  const reset = () => {
    navigate('/calender')
    setFormData(initialFormData);
  };

  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...newData }));
  };

  const handleClick = (id: number) => {
    setCurrentStep(id);
  }

  if (!isOrganizer) {
    return (
      <div>
        <AccessDenied />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6 px-4 border border-orange-500 m-2 rounded-lg">
      <div className="max-w-5xl mx-auto shadow-2xl ">
        <header className="mb-4 p-4 flex items-center justify-between gap-4">
          <div className='flex justify-start items-center gap-2'>
            <button
              onClick={() => navigate(-1)}
              className='px-2 py-1 border border-gray-300 rounded-md cursor-pointer flex justify-center items-center gap-1 hover:bg-gray-100'
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-chevron-left-icon lucide-chevron-left"><path d="m15 18-6-6 6-6" /></svg>
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex-1">
              Create New Activity: {currentStep <= 4 ? `Step ${currentStep}` : 'Success'}
            </h1>
          </div>
        </header>

        {/* Stepper Navigation */}
        {currentStep <= 4 && (
          <nav className="mb-4 bg-gray-100 rounded-lg overflow-hidden flex shadow-sm overflow-x-auto sm:overflow-x-visible">
            {steps?.map((step, index) => {
              const isActive = currentStep === step?.id;
              const isCompleted = currentStep > step?.id;

              return (
                <div
                  key={step?.id}
                  className={`flex-1 flex items-center justify-center py-3 px-4 relative transition-all cursor-pointer duration-300 ${isActive ? 'bg-blue-600 text-white' : 'text-gray-600'}`}
                   onClick={() => handleClick(step?.id)}
                >
                  <div className="flex items-center space-x-2">{/* z-10 */}
                    {isCompleted ? (
                      <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    ) : null}
                    <span className={`text-sm font-semibold whitespace-nowrap ${isActive ? 'text-white' : 'text-gray-500'
                      }`}>
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
                />
              )}
              {currentStep === 2 && (
                <ActivityStep2
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrevious={prevStep}
                />
              )}
              {currentStep === 3 && (
                <ActivityStep3
                  formData={formData}
                  updateFormData={updateFormData}
                  onNext={nextStep}
                  onPrevious={prevStep}
                />
              )}
              {currentStep === 4 && (
                <ActivityStep4
                  formData={formData}
                  updateFormData={updateFormData}
                  onPrevious={prevStep}
                  onNext={reset}
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