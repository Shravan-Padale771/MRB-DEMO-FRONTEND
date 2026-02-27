import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getAllStudents,
  getAllExams,
  applyForExam,
  getStudentResults,
} from "../api";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Award,
  User,
  UserPlus,
  LogOut,
  CheckCircle,
  BookOpen,
  FileText,
  Calendar,
  DollarSign,
} from "lucide-react";
import MyResults from "../student/components/MyResults";
import ApplyModal from "../student/components/ApplyModal";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [myResults, setMyResults] = useState([]);

  const [selectedExam, setSelectedExam] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    gender: "Male",
  });




  useEffect(() => {
    const loadData = async () => {
      try {
        const [s, e] = await Promise.all([getAllStudents(), getAllExams()]);
        setStudents(s || []);
        setExams(e || []);
        console.log("This is fetched data of students and exams");

        console.log(s);
        console.log(e);


      } catch (error) {
        console.error("Failed to load data", error);
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchMyResults();
    }
  }, [currentUser]);

  const fetchMyResults = async () => {
    if (!currentUser?.studentId) return;
    try {
      const results = await getStudentResults(currentUser.studentId);
      setMyResults(results || []);
    } catch (error) {
      console.error("Could not fetch results", error);
    }
  };

  const openApplyModal = (exam) => {
    if (!currentUser) return toast.error("Please select a user first");
    setSelectedExam(exam);
  };

  const handleFormSubmit = async (e) => {
    if (!currentUser?.studentId || !selectedExam?.examNo) {
      return toast.error("Incomplete selection data");
    }
    const payload = {
      student: { studentId: currentUser.studentId },
      exam: { examNo: selectedExam.examNo },
      formData: JSON.stringify(applicationForm),
      status: "APPLIED",
    };

    try {
      await applyForExam(payload);
      toast.success("Application Submitted Successfully!");
      setSelectedExam(null);
      setApplicationForm({
        fullName: "",
        phone: "",
        address: "",
        gender: "Male",
      });
    } catch (error) {
      toast.error("Application Failed");
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
          <div className="text-center mb-6">
            <User size={48} className="mx-auto text-indigo-600 mb-3" />
            <h2 className="text-3xl font-bold text-gray-800">Student Portal</h2>
            <p className="text-gray-500 text-sm mt-2">
              Login or create a new account
            </p>
          </div>

          <div className="space-y-4">
            {/* Login Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                // For now, show student selection for login
                // You can replace this with actual login form later
              }}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
            >
              <User size={20} />
              Login to Existing Account
            </motion.button>

            {/* Register Button */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/student/register")}
              className="w-full bg-white border-2 border-indigo-600 text-indigo-600 font-bold py-4 rounded-xl hover:bg-indigo-50 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              Create New Account
            </motion.button>
          </div>

          {/* Temporary: Student Selection for Demo */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <p className="text-xs text-gray-500 text-center mb-3">
              Demo: Select existing student
            </p>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {students.length === 0 ? (
                <div className="text-center p-4 text-gray-400 text-sm">
                  <p>No students available</p>
                </div>
              ) : (
                students.map((s) => (
                  <motion.button
                    key={s.studentId}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setCurrentUser(s)}
                    className="w-full flex justify-between items-center p-3 bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-lg transition-all duration-200 text-sm"
                  >
                    <div className="flex flex-col items-start text-left">
                      <span className="font-bold text-gray-700">
                        {s.firstName ? `${s.firstName} ${s.middleName || ''} ${s.lastName || ''}`.trim() : s.username}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                        {s.schoolName || s.school?.schoolName || "No School"}
                      </span>
                    </div>
                    <span className="text-[10px] font-black bg-white border px-2 py-1 rounded text-indigo-600 shadow-sm">
                      ID: #{s.studentId}
                    </span>
                  </motion.button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f9fe] relative overflow-hidden transition-all duration-500">
      {/* Decorative background elements for consistency with Admin UI */}
      <div className="absolute top-[-5%] right-[-5%] w-[35%] h-[35%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-5%] left-[10%] w-[25%] h-[25%] rounded-full bg-purple-500/5 blur-[90px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8 relative z-10">
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 bg-white/80 backdrop-blur-md p-8 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-white/40">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-[#4c84ff] rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              {currentUser?.firstName ? currentUser.firstName.charAt(0).toUpperCase() : (currentUser?.username?.charAt(0).toUpperCase() || "?")}
            </div>
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight">
                Welcome, <span className="text-[#4c84ff]">{currentUser?.firstName ? `${currentUser.firstName} ${currentUser.lastName || ''}` : (currentUser?.username || "Student")}</span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="text-[11px] font-black text-[#4c84ff] bg-blue-50/50 px-2 py-0.5 rounded uppercase tracking-wider border border-blue-100/50">
                  Student ID: #{currentUser?.studentId || "N/A"}
                </span>
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-widest border-l border-gray-200 pl-3">
                  {currentUser?.schoolName || currentUser?.school?.schoolName || "No School"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={() => setCurrentUser(null)}
            className="flex items-center gap-2 text-gray-400 hover:text-red-500 hover:bg-red-50/50 px-4 py-2 rounded-xl transition-all duration-300 font-bold text-sm border border-transparent hover:border-red-100"
          >
            <LogOut size={18} /> Logout
          </button>
        </header>


        <div className="grid lg:grid-cols-3 gap-10">
          <div className="lg:col-span-2 space-y-8">
            <h2 className="text-2xl font-black text-gray-900 border-l-4 border-[#4c84ff] pl-5 py-1 flex items-center gap-3 tracking-tight uppercase text-sm">
              <BookOpen size={20} className="text-[#4c84ff]" /> Available Exams
            </h2>
            {exams.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-xl border-2 border-dashed">
                <BookOpen className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-500 font-medium">No exams available</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {exams.map((exam) => (
                  <motion.div
                    key={exam.examNo}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    whileHover={{ translateY: -8, shadow: "0 20px 25px -5px rgb(0 0 0 / 0.1)" }}
                    className="bg-white p-8 rounded-2xl shadow-[0_4px_20px_rgb(0,0,0,0.03)] border border-gray-100 hover:border-blue-100/50 transition-all duration-500 flex flex-col justify-between group"
                  >
                    <div className="mb-4">
                      <div className="flex items-start justify-between mb-3">
                        <h3 className="text-xl font-bold text-gray-900 flex-1">
                          {exam.exam_name}
                        </h3>
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Exam #{exam.examNo}
                        </span>
                      </div>
                      <div className="space-y-2 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <FileText size={16} className="text-gray-400" />
                          <span>
                            <strong>{exam.no_of_papers}</strong> Papers
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-green-500" />
                          <span className="font-semibold text-green-600">
                            ${exam.exam_fees}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* Apply field which opens exam form  */}
                    <motion.button
                      whileHover={{ scale: 1.02, translateY: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => openApplyModal(exam)}
                      className="w-full bg-[#4c84ff] text-white py-3.5 rounded-xl hover:shadow-[0_10px_20px_-5px_rgba(76,132,255,0.4)] font-bold transition-all duration-300 uppercase tracking-wider text-sm shadow-md shadow-blue-500/10"
                    >
                      Apply Now
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          <div>
            <MyResults myResults={myResults} student={currentUser} />
          </div>
        </div>

        <AnimatePresence>
          {selectedExam && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="bg-[#4c84ff] p-6 flex justify-between items-center text-white">
                  <h3 className="font-bold text-lg uppercase tracking-tight">
                    Apply for {selectedExam.exam_name}
                  </h3>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedExam(null)}
                    className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </motion.button>
                </div>
                <div className="p-8">





                  {/* this is exam form containing student and exam details used ApplyModal.jsx  */}
                  <ApplyModal
                    exam={selectedExam}
                    student={currentUser}
                    onClose={() => setSelectedExam(null)}
                    onSuccess={fetchMyResults}
                  />




                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
        <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0, 0, 0, 0.08);
          border-radius: 10px;
        }
      `}</style>
      </div>
    </div>
  );
};

export default StudentDashboard;
