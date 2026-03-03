import { useEffect, useState, type FC } from "react"
import type { Props } from "./AttendenceModal"
import { addSteps, getActiveSteps, getActiveTasks } from "../../services/dashboard/DashboardApi";
import toast from "react-hot-toast";

export interface Steps {
  id: number;
  step_name: string;
  step_desc: string;
  status: string;
}

export interface Tasks {
  id: number;
  task_name: string;
  task_desc: string;
  status: string;
}

export interface Inputs {
  taskdesc: string;
  status: string;
}

const StepsModal: FC<Props> = ({ show, setShow, Data, User, setSelectedEvent, fetchAllData }) => {//Member
  const [steps, setSteps] = useState<Steps[]>([]);
  const [tasks, setTasks] = useState<Tasks[]>([]);
  const [selectedStep, setSelectedStep] = useState<number>(0);
  const [selectedTask, setSelectedTask] = useState<number>(0);
  const [inputs, setInputs] = useState<Inputs>({
    taskdesc: "",
    status: "",
  });
  const [stepLoading, setStepLoading] = useState(false);
  const [taskLoading, setTaskLoading] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchSteps = async () => {
      setStepLoading(true)
      const response = await getActiveSteps();
      if (response) {
        setSteps(response.steps);
        setStepLoading(false)
      }
    };
    const fetchTasks = async () => {
      setTaskLoading(true)

      const response = await getActiveTasks();
      if (response) {
        setTasks(response.tasks || []);
        setTaskLoading(false)
      }
    };
    fetchTasks();
    fetchSteps();
  }, []);

  const handleStepChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const stepValue = parseInt(event.target.value);
    setSelectedStep(stepValue);
    setSelectedTask(0);
  };

  const handleTaskChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const taskValue = parseInt(event.target.value);
    setSelectedTask(taskValue);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setInputs(prev => ({
      ...prev,
      [name]: value
    }));
  };

  if (!show) return null;
  const handleClose = () => {
    setShow(false);
    setSelectedStep(0);
    setSelectedTask(0);
    setTasks([]);
    setSelectedEvent({});
    fetchAllData();
    setInputs({
      taskdesc: "",
      status: "",
    });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!Data.event_id || !Data?.event_date || !inputs.status || !selectedStep || !selectedTask) {
      toast.error('Please fill all required fields!')
      return;
    }
    const body = {
      eventId: Data.event_id || 0,
      eventDate: Data.event_date || '',
      // memId: Member.mem_id || 0,
      userId: User?.id || 0,
      description: inputs?.taskdesc || "",
      stepId: selectedStep || 0,
      taskId: selectedTask || 0,
      status: inputs?.status || "",
    };
    setLoading(true)
    const response = await addSteps(body);
    if (response) {
      setLoading(false)
      handleClose();
    }

  }

  return (
    <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-linear-to-r from-purple-50 to-orange-50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-md font-bold text-gray-900">
                Add Steps & Tasks For {Data?.title}
              </h3>
            </div>
          </div>
          <button
            className="flex items-center justify-center w-10 h-10 hover:bg-gray-100 text-gray-700 transition-all duration-200 hover:scale-105 hover:shadow-lg cursor-pointer"
            onClick={handleClose}
            title="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-auto">
          <form className="p-6 space-y-3" onSubmit={handleSubmit}>
            {User?.isorganizer === 'Y' &&
              (<>
                {/* Steps */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Steps <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      name="step"
                      onChange={handleStepChange}
                      value={selectedStep}
                      className="w-full pl-10 px-2 py-1 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="0">Select Step</option>
                      {stepLoading ? (
                        <option value="" disabled>Loading...</option>
                      ) : (
                        steps?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.step_name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Task */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Task <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      name="task"
                      onChange={handleTaskChange}
                      value={selectedTask}
                      disabled={taskLoading || tasks.length === 0}
                      className="w-full pl-10 px-2 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="0">Select Task</option>

                      {taskLoading ? (
                        <option value="" disabled>Loading...</option>
                      ) : (
                        tasks?.map((item) => (
                          <option key={item.id} value={item.id}>
                            {item.task_name}
                          </option>
                        ))
                      )}
                    </select>
                  </div>
                </div>

                {/* Task Description */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">Task Description</label>
                  <div className="relative group">
                    <div className="absolute top-3 left-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                      </svg>
                    </div>
                    <textarea
                      rows={2}
                      name="taskdesc"
                      value={inputs.taskdesc}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none resize-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    />
                  </div>
                </div>

                {/* Status */}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-2">
                    Status <span className="text-orange-600">*</span>
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <select
                      name="status"
                      value={inputs.status}
                      onChange={handleInputChange}
                      className="w-full pl-10 px-2 py-2 border border-gray-300 rounded-lg focus:ring-0 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all duration-200 disabled:bg-gray-100 disabled:cursor-not-allowed"
                      required
                    >
                      <option value="">Select Status</option>
                      <option value="P">Progress</option>
                      <option value="S">Start</option>
                      <option value="C">Complete</option>
                    </select>
                  </div>
                </div>
              </>
              )}
            {/* Submit Button */}
            <div className="flex justify-end items-center pt-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-6 py-2.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 text-xs font-medium text-white bg-orange-500 border border-orange-500 rounded-lg hover:bg-orange-600 transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
                >
                  {loading ? 'Submiting' : 'Submit'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default StepsModal
