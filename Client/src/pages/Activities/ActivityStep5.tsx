import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import React from 'react';

interface ActivityStep5Props {
  onReset: () => void;
}

export const ActivityStep5: React.FC<ActivityStep5Props> = ({ onReset }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 space-y-6">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      >
        <CheckCircle2 className="w-24 h-24 text-teal-600" />
      </motion.div>
      
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">Activity Submitted!</h2>
        <p className="text-gray-500 max-w-md">
          Your activity has been sent for manager approval.
        </p>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={onReset}
          className="px-6 py-3 bg-teal-600 text-white font-bold rounded-xl hover:bg-teal-700 transition-all flex items-center space-x-2 shadow-lg shadow-teal-200  cursor-pointer"
        >
          <span>Go to Calender view</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};