import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, ChevronUp, File, FileSpreadsheet, FileText, Image, Video } from "lucide-react";
import React, { useEffect, useState } from "react";
import ShowTrainingDesk from "../../../components/ShowTrainingDesk";
import { MEDIA_URL } from "../../../constant/Baseurl";
import { getActiveFaqs } from "../../../services/master/masterApi";
import { getActiveTrainings } from "../../../services/training/trainingApi";

interface Faq {
  faq_id: number;
  faq_question: string;
  ans: string;
}

export interface Training {
  training_id: number;
  training_title: string;
  training_description: string;
  file_path: string;
  file_type: string;
}

const TrainingViews: React.FC = () => {
  const [Faq, setFaq] = useState<Faq[]>([]);
  const [Data, setData] = useState<Training[]>([]);
  const [view, setView] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [selected, setSelected] = useState({})
  useEffect(() => {
    const fetchData = async () => {
      const response = await getActiveFaqs();
      if (response) {
        setFaq(response?.data)
      }
    }
    fetchData();
  }, [])

  useEffect(() => {
    const fetchData = async () => {
      const response = await getActiveTrainings();
      if (response) {
        setData(response);
      }
    }
    fetchData();
  }, [])

  const toggleFaq = (index: number) => {
    setOpenFaqIndex(openFaqIndex === index ? null : index);
  };

  const handleView = (data: Training) => {
    setSelected(data);
    setView(true);
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-purple-50 via-blue-50 to-orange-50 border border-orange-300 m-1 rounded-md">
      {/* main container */}
      <div className="max-w-6xl mx-auto">
        {/* header - subtle, just to frame */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-orange-600">Training resources</h1>
          <p className="text-orange-500">Guides, videos and templates</p>
        </div>

        {/* card grids */}
        <div className="space-y-6">
          {/* top row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {Data.map((card) => {
              return (

                <div
                  key={card.training_id}
                  className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
                >
                  <div className="p-5">
                    {/* Icon at start, badge at end */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex items-center gap-2">
                          {(card.file_type === "pdf" && <FileText size={20} className="text-purple-700" strokeWidth={1.5} />) ||
                            ((card.file_type === "excel" || card.file_type === "csv") && <FileSpreadsheet size={20} className="text-orange-700" strokeWidth={1.5} />) ||
                            (card.file_type === "image" && <Image size={20} className="text-blue-700" strokeWidth={1.5} />) ||
                            (card.file_type === "video" && <Video size={20} className="text-green-700" strokeWidth={1.5} />) ||
                            <File size={20} className="text-gray-700" strokeWidth={1.5} />}
                        </div>
                      </div>
                      <span
                        className={`${card.file_type === "excel"
                          ? "bg-orange-500"
                          : card.file_type === "csv"
                            ? "bg-orange-500"
                            : card.file_type === "pdf"
                              ? "bg-purple-600"
                              : card.file_type === "image"
                                ? "bg-blue-500"
                                : card.file_type === "video"
                                  ? "bg-green-600"
                                  : "bg-gray-500"
                          } text-white text-xs font-bold px-3 py-1 rounded-full uppercase`}
                      >
                        {card.file_type}
                      </span>
                    </div>
                    <h3 className="font-bold text-black mb-1">
                      {card.training_title}
                    </h3>
                    <p className="text-sm text-gray-700 mb-4">{card.training_description}</p>
                    <div className="flex justify-start items-center gap-2">
                      <a
                        href={`${MEDIA_URL}${card?.file_path}`}
                        download
                        className=" bg-purple-50 px-2 py-0.5 rounded-xl hover:bg-purple-200 text-purple-700 font-medium text-sm inline-flex items-center hover:text-purple-900 transition cursor-pointer gap-1">
                        Download now
                        {/* <svg xmlns="http://www.w3.org/2000/svg" width="20" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-cloud-download-icon lucide-cloud-download"><path d="M12 13v8l-4-4" /><path d="m12 21 4-4" /><path d="M4.393 15.269A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.436 8.284" /></svg> */}
                      </a>
                      <button
                        type="button"
                        onClick={() => handleView(card)}
                        className=" bg-green-50 px-2 py-0.5 rounded-xl hover:bg-green-200 text-green-700 font-medium text-sm inline-flex items-center hover:text-green-900 transition cursor-pointer gap-1">
                        View
                        {/* <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-eye-icon lucide-eye"><path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0"/><circle cx="12" cy="12" r="3"/></svg> */}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/*FAQ Section */}
        <div className="mt-12 border-t border-gray-200 pt-4 mb-10">
          <h2 className="text-2xl font-bold text-black mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-2">
            {Faq.map((item, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg bg-white overflow-hidden"
                >
                  {/* question header */}
                  <button
                    className="w-full flex items-center justify-between p-3 text-left focus:outline-none hover:bg-gray-50 transition cursor-pointer"
                    onClick={() => toggleFaq(index)}
                  >
                    <div className="flex items-start gap-3">
                      {isOpen && (
                        <span className="inline-block w-1.5 h-6 bg-purple-500 rounded-full mt-0.5"></span>
                      )}

                      <span className="text-gray-800">
                        {item.faq_question}
                      </span>
                    </div>

                    {isOpen ? (
                      <ChevronDown className="w-5 h-5 text-gray-500" />
                    ) : (
                      <ChevronUp className="w-5 h-5 text-gray-500" />
                    )}
                  </button>

                  {/* animated answer */}
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="overflow-hidden"
                      >
                        <div className="p-4 pt-0 pl-14 pr-4 pb-4 text-gray-700 text-sm border-t border-gray-100">
                          {item.ans}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>

          <p className="text-xs text-gray-500 mt-6">
            * Resources are free to use under the terms specified. Updated monthly.
          </p>
        </div>
      </div>
      {view && (<ShowTrainingDesk show={view} setShow={setView} data={selected} />)}
    </div>
  );
};

export default TrainingViews;