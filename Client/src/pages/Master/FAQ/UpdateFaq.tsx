import { useEffect, useState, type FC } from "react";
import toast from "react-hot-toast";
import { updateFaq } from "../../../services/master/masterApi";
import type { Faq } from "./FaqView";

interface UpdateFaqProps {
  show: boolean;
  setShow: (show: boolean) => void;
  faqData: Faq | null;
  fetchData: () => void;
  isEdit: boolean;
}

const UpdateFaq: FC<UpdateFaqProps> = ({ show, setShow, faqData, fetchData, isEdit }) => {
  const [inputs, setInputs] = useState({
    id: faqData?.faq_id || 0,
    ans: faqData?.ans || '',
    question: faqData?.faq_question || '',
    displayOrder: faqData?.display_order || 0,
    status: faqData?.status || ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (faqData && show) {
      setInputs({
        id: faqData?.faq_id,
        question: faqData?.faq_question,
        ans: faqData?.ans,
        displayOrder: faqData?.display_order,
        status: faqData?.status || ''
      });
    }
  }, [faqData, show]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setInputs({ ...inputs, [name]: name === 'displayOrder' ? parseInt(value) || 0 : value });
  };

  if (!show) return null;

  const handleClose = () => {
    setShow(false);
    fetchData();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (!inputs.question || !inputs.status) {
      toast.error("Please fill in all required fields");
      setLoading(false);
      return;
    }

    const body = {
      id: inputs.id,
      question: inputs.question,
      ans: inputs.ans,
      displayOrder: inputs.displayOrder,
      status: inputs.status
    };

    const response = await updateFaq(body);
    if (response) {
      setLoading(false);
      handleClose();
    }
  };

  return (
    <>
      {/* Backdrop with blur */}
      <div 
        className="fixed inset-0 bg-indigo-100/30 backdrop-blur-xs z-50 transition-opacity duration-300"
        onClick={handleClose}
        aria-hidden="true"
      />
      
      {/* Offcanvas/Drawer */}
      <div
        className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out overflow-y-auto"
        style={{
          transform: show ? 'translateX(0)' : 'translateX(100%)',
        }}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-label={isEdit ? "Edit FAQ" : "View FAQ"}
      >
        <div className="min-h-full flex flex-col">
          {/* Offcanvas Header */}
          <div className="sticky top-0 bg-white z-10 flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-linear-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">
                {isEdit ? 'Update FAQ' : 'View FAQ'}
              </h3>
            </div>
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
              onClick={handleClose}
              aria-label="Close drawer"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Offcanvas Content - Vertical Form */}
          <div className="flex-1 p-6">
            <form className="space-y-5" onSubmit={handleSubmit}>
              {/* Question */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Question <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <textarea
                    rows={3}
                    name="question"
                    placeholder="Enter FAQ question"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                    value={inputs.question}
                    onChange={handleInputChange}
                    disabled={!isEdit}
                  />
                </div>
              </div>

              {/* Answer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Answer <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute top-3 left-3 pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                    </svg>
                  </div>
                  <textarea
                    name="ans"
                    placeholder="Enter FAQ answer"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                    value={inputs.ans}
                    onChange={handleInputChange}
                    disabled={!isEdit}
                  />
                </div>
              </div>

              {/* Display Order - Hidden as in original */}
              <div hidden>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Display Order
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l5 5a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-5-5A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                    </svg>
                  </div>
                  <input
                    type="number"
                    name="displayOrder"
                    placeholder="Enter display order"
                    min="0"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all duration-200 disabled:bg-gray-50 disabled:cursor-not-allowed"
                    value={inputs.displayOrder}
                    onChange={handleInputChange}
                    disabled={!isEdit}
                  />
                </div>
              </div>

              {/* Status Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Status <span className="text-red-600">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <select
                    name="status"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-0 focus:ring-indigo-500 focus:border-indigo-500 outline-none appearance-none bg-white cursor-pointer disabled:bg-gray-50 disabled:cursor-not-allowed"
                    required
                    value={inputs.status}
                    onChange={handleInputChange}
                    disabled={!isEdit}
                  >
                    <option value="">Select status</option>
                    <option value="A">Active</option>
                    <option value="I">Inactive</option>
                  </select>
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Offcanvas Footer */}
              <div className="sticky bottom-0 bg-white pt-6 border-t border-gray-200 mt-6">
                <div className="flex items-center justify-end space-x-3">
                  <button
                    type="button"
                    className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200"
                    onClick={handleClose}
                  >
                    Cancel
                  </button>
                  {isEdit && (
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-6 py-2.5 text-sm font-medium text-white bg-linear-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 border border-transparent rounded-lg hover:shadow-lg focus:outline-none focus:ring-0 focus:ring-offset-2 focus:ring-indigo-500 cursor-pointer transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Updating...' : 'Update FAQ'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default UpdateFaq;