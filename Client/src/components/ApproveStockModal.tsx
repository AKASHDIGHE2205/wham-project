import moment from "moment";
import { useState, type FC } from "react";
import { getUserFromStorage } from "../helper/cryptoUser";
import { ApproveRejectStock } from "../services/dashboard/DashboardApi";
import type { Order } from "./Navbar";

interface ApproveStockModalProps {
  show: boolean;
  setShow: (show: boolean) => void;
  selectedStock: Order | null;
  getNotification: () => void;
  getNotifyStocks: () => void;
}

const ApproveStockModal: FC<ApproveStockModalProps> = ({ show, setShow, selectedStock, getNotification, getNotifyStocks }) => {
  const user = getUserFromStorage();
  const [status, setStatus] = useState("");

  const handleClose = () => {
    setShow(false);
    getNotification();
    getNotifyStocks();
    setStatus("");
  };
  if (!show) return null;

  const handleSubmit = async () => {

    const body = {
      requestId: selectedStock?.id,
      status: status || "I",
      userId: user?.id
    }
    const response = await ApproveRejectStock(body);
    if (response) {
      handleClose();
    }
  }

  return (
    <div className="fixed inset-0 bg-orange-100/20 backdrop-blur-xs flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">

        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-linear-to-br from-orange-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-box-icon lucide-box text-white"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" /></svg>
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                Approve Stock
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Confirm approval of the requested stock item.
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors cursor-pointer p-2 hover:bg-gray-100 rounded-lg"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {selectedStock && (
            <div className="space-y-2">
              <h4 className="font-semibold text-gray-900 text-lg">Stock Details:</h4>
              <div className="grid grid-cols-2 gap-4 px-4 bg-gray-50 rounded-lg">
                <div>
                  <p className="text-sm text-gray-600">Edition</p>
                  <input
                    type="text"
                    value={selectedStock.edition || "N/A"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                    readOnly
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Quantity</p>
                  <input
                    type="text"
                    value={selectedStock.quantity || "N/A"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                    readOnly
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested By</p>
                  <input
                    type="text"
                    value={selectedStock.full_name || "N/A"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                    readOnly
                  />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Requested On</p>
                  <input
                    type="text"
                    value={moment(selectedStock.c_at).format("MMM, DD, YYYY hh:mm:ss") || "N/A"}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-purple-500"
                    readOnly
                  />                 
                </div>
              </div>
            </div>
          )}
          <div className="mt-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              className="w-full h-10 py-2 px-3 border border-gray-300 rounded-md bg-white text-sm text-gray-800 focus:outline-none focus:ring-1 focus:ring-purple-500"
              name="status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              <option value="">Select Status</option>
              <option value={"A"}>Approved</option>
              <option value={"R"}>Rejected</option>
            </select>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end items-center gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleClose}
            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-all duration-200 cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="px-6 py-2 text-sm font-medium text-white bg-linear-to-r from-green-500 to-green-600 border border-transparent rounded-lg hover:bg-green-700 transition-all duration-200 cursor-pointer"
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApproveStockModal;