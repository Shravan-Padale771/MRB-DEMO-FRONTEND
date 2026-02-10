import React, { useState, useEffect } from "react";
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

const StudentDashboard = () => {
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
    e.preventDefault();
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
              onClick={() => (window.location.href = "/student/register")}
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
                    <span className="font-semibold text-gray-700">
                      {s.username}
                    </span>
                    <span className="text-xs bg-white border px-2 py-1 rounded text-gray-400">
                      ID: {s.studentId}
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
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <header className="flex justify-between items-center mb-10 max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-14 w-14 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-md">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-800">
              Welcome, {currentUser.username}
            </h1>
            <p className="text-sm text-gray-500">
              Student ID: #{currentUser.studentId}
            </p>
          </div>
        </div>
        <button
          onClick={() => setCurrentUser(null)}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50 px-4 py-2 rounded-lg transition-colors duration-200"
        >
          <LogOut size={18} /> Logout
        </button>
      </header>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <h2 className="text-2xl font-bold mb-8 text-gray-800 border-l-4 border-indigo-600 pl-4 flex items-center gap-2">
            <BookOpen size={24} /> Available Exams
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
                  whileHover={{ translateY: -5 }}
                  className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
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
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => openApplyModal(exam)}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg font-semibold transition-all duration-300"
                  >
                    Apply Now
                  </motion.button>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-2xl font-bold mb-8 text-gray-800 border-l-4 border-green-500 pl-4 flex items-center gap-2">
            <Award size={24} /> My Results
          </h2>

          <div className="space-y-4">
            {myResults.length === 0 ? (
              <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
                <Award className="mx-auto text-gray-300 mb-3" size={40} />
                <p className="text-gray-500 font-medium">No results yet</p>
                <p className="text-xs text-gray-400 mt-1">
                  Your exam results will appear here
                </p>
              </div>
            ) : (
              myResults.map((result) => (
                <motion.div
                  key={result.id || Math.random()}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-800 text-lg">
                        {result.application?.exam?.exam_name || "Exam Result"}
                      </h3>
                      <p className="text-xs text-gray-600 mt-1">
                        App ID: #{result.application?.applicationId}
                      </p>
                    </div>
                    <CheckCircle
                      className="text-green-500 flex-shrink-0"
                      size={28}
                    />
                  </div>

                  <div className="bg-white p-4 rounded-lg border-2 border-green-200 mb-4">
                    <p className="text-sm font-mono text-gray-800 break-words font-semibold">
                      {result.resultData}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Calendar size={14} />
                    {new Date(result.publishedAt).toLocaleDateString()}
                  </div>
                </motion.div>
              ))
            )}
          </div>
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
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg">
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
                <form onSubmit={handleFormSubmit} className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      required
                      placeholder="Enter your full name"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      value={applicationForm.fullName}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          fullName: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      required
                      placeholder="Enter your phone number"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      value={applicationForm.phone}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          phone: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Address
                    </label>
                    <textarea
                      required
                      placeholder="Enter your address"
                      rows="3"
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                      value={applicationForm.address}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          address: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                      value={applicationForm.gender}
                      onChange={(e) =>
                        setApplicationForm({
                          ...applicationForm,
                          gender: e.target.value,
                        })
                      }
                    >
                      <option>Male</option>
                      <option>Female</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-300 mt-6"
                  >
                    Submit Application
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentDashboard;
