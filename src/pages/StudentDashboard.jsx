import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  getStudents,
  createExamApplication,
  getExamResults,
  getExamApplications,
  getStudentProfile,
  getStudentProfileByStudentIdString,
  getRegions,
  getExamCentres,
  getSchools,
} from "../api";
import { searchExams as getExams } from "../api/exam-api";
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
  Bell,
  Download,
  FileCheck,
} from "lucide-react";
import MyResults from "../student/components/MyResults";
import ApplyModal from "../student/components/ApplyModal";

import StudentProfileSection from "../student/components/StudentProfileSection";
import StudentLayout from "../student/components/StudentLayout";
import HallTicket from "../student/components/HallTicket";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [myResults, setMyResults] = useState([]);
  const [myApplications, setMyApplications] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [regions, setRegions] = useState([]);
  const [centres, setCentres] = useState([]);
  const [schools, setSchools] = useState([]);
  const [activeTab, setActiveTab] = useState("dashboard");
  const [loginId, setLoginId] = useState("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isLoadingApplications, setIsLoadingApplications] = useState(false);

  const [selectedExam, setSelectedExam] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    gender: "Male",
  });

  useEffect(() => {
    const loadExams = async () => {
      try {
        const examPage = await getExams({ size: 1000 });
        setExams(examPage?.content || []);
      } catch (error) {
        console.error("Failed to load exams", error);
      }
    };
    const loadMasterData = async () => {
      try {
        const [rData, cData, sData] = await Promise.all([
          getRegions({ size: 1000 }),
          getExamCentres({ size: 1000 }),
          getSchools({ size: 1000 })
        ]);
        setRegions(rData?.content || []);
        setCentres(cData?.content || []);
        setSchools(sData?.content || []);
      } catch (error) {
        console.error("Failed to load master data", error);
      }
    };
    loadExams();
    loadMasterData();
  }, []);

  const fetchProfile = async (studentData) => {
    const studentIdToFetch = studentData?.studentId || currentUser?.studentId;
    if (!studentIdToFetch) return null;
    try {
      // Use the new endpoint instead of the old one
      const data = await getStudentProfileByStudentIdString(studentIdToFetch);
      setStudentProfile(data);
      return data;
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log("Profile not found for student, user needs to complete it.");
      } else {
        console.error("Failed to fetch profile in dashboard", error);
      }
      return null;
    }
  };

  useEffect(() => {
    if (currentUser?.studentId) {
      fetchMyResults();
      fetchMyApplications();
      
      const loadProfileAndSetTab = async () => {
        const profileData = await fetchProfile(currentUser);
        if (!profileData) {
          // Profile not found, guide to completion
          if (currentUser.hasProfile !== false) {
            setCurrentUser(prev => ({ ...prev, hasProfile: false }));
          }
          setActiveTab("profile");
        } else {
          // Profile exists
          if (currentUser.hasProfile !== true) {
            setCurrentUser(prev => ({ ...prev, hasProfile: true }));
          }
          setActiveTab("exams");
        }
      };
      
      loadProfileAndSetTab();
    }
  }, [currentUser?.studentId]);

  const fetchMyApplications = async () => {
    if (!currentUser?.studentId) return;
    setIsLoadingApplications(true);
    try {
      const data = await getExamApplications({ studentId: currentUser.studentId, size: 100 });
      setMyApplications(data?.content || []);
    } catch (error) {
      console.error("Could not fetch applications", error);
    } finally {
      setIsLoadingApplications(false);
    }
  };

  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    if (!loginId.trim()) return toast.error("Please enter a Student ID");

    setIsLoggingIn(true);
    try {
      const studentPage = await getStudents({ studentId: loginId.trim(), size: 1 });
      const student = studentPage?.content?.[0];

      if (student) {
        setCurrentUser(student);
        toast.success(`Welcome back, ${student.firstName || student.username}!`);
      } else {
        toast.error("Invalid Student ID. Please try again.");
      }
    } catch (error) {
      console.error("Login failed", error);
      toast.error("Something went wrong. Please try again later.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const fetchMyResults = async () => {
    if (!currentUser?.studentId) return;
    try {
      const data = await getExamResults({ studentId: currentUser.studentId });
      setMyResults(data?.content || []);
    } catch (error) {
      console.error("Could not fetch results", error);
    }
  };

  const openApplyModal = (exam) => {
    if (!currentUser) return toast.error("Please select a user first");
    if (!currentUser.hasProfile) {
      setActiveTab("profile");
      return toast.error("Please complete your profile first before applying.");
    }
    setSelectedExam(exam);
  };

  const handleProfileUpdated = async () => {
    // Optionally refetch current user or update state to reflect profile completion
    setCurrentUser(prev => ({ ...prev, hasProfile: true }));
    setActiveTab("exams");
  };

  // Skip down to rendering for brevity...
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

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                Student ID Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  value={loginId}
                  onChange={(e) => setLoginId(e.target.value)}
                  placeholder="e.g. 101"
                  className="w-full pl-11 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-indigo-500 focus:bg-white rounded-xl transition-all duration-300 outline-none font-bold text-gray-700"
                  required
                />
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="submit"
              disabled={isLoggingIn}
              className={`w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 transition-all duration-300 flex items-center justify-center gap-2 ${isLoggingIn ? "opacity-70 cursor-not-allowed" : "hover:shadow-indigo-300"
                }`}
            >
              {isLoggingIn ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <LogOut size={20} className="rotate-180" />
              )}
              {isLoggingIn ? "Authenticating..." : "Login to Portal"}
            </motion.button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px flex-1 bg-gray-100" />
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.2em]">OR</span>
              <div className="h-px flex-1 bg-gray-100" />
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => navigate("/student/register")}
              type="button"
              className="w-full bg-white border-2 border-indigo-100 text-indigo-600 font-bold py-4 rounded-xl hover:bg-indigo-50 hover:border-indigo-200 transition-all duration-300 flex items-center justify-center gap-2"
            >
              <UserPlus size={20} />
              Create New Account
            </motion.button>
          </form>

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-[10px] text-gray-400 text-center uppercase tracking-widest leading-relaxed">
              If you don't have an ID, please register or contact your school administrator.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case "dashboard":
        return (
          <div className="space-y-8">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-3xl p-8 text-white shadow-xl shadow-indigo-500/20 mb-8">
              <h2 className="text-3xl font-black mb-2">Welcome back, {currentUser?.firstName || 'Student'}!</h2>
              <p className="text-indigo-100 opacity-80">You have {exams.length} available exams and {myResults.length} published results.</p>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveTab('exams')}>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600 mb-4">
                  <BookOpen size={24} />
                </div>
                <h3 className="font-bold text-lg mb-1">Available Exams</h3>
                <p className="text-sm text-gray-500">View and apply for upcoming examinations.</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => setActiveTab('results_view')}>
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-green-600 mb-4">
                  <Award size={24} />
                </div>
                <h3 className="font-bold text-lg mb-1">My Results</h3>
                <p className="text-sm text-gray-500">Check your latest performance and marks.</p>
              </div>
            </div>
          </div>
        );
      case "profile":
        return (
          <StudentProfileSection
            student={currentUser}
            prefetchedProfile={studentProfile}
            onProfileUpdated={handleProfileUpdated}
          />
        );
      case "exams":
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-black text-gray-900 border-l-4 border-indigo-600 pl-5 py-1 flex items-center gap-3 tracking-tight uppercase text-sm">
              <BookOpen size={20} className="text-indigo-600" /> Available Exams
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
        );
      case "notices":
        return (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-xl shadow-black/5 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-yellow-50 rounded-2xl flex items-center justify-center text-yellow-600 mx-auto mb-8 rotate-3 shadow-inner">
              <Bell size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">No Active Notices</h2>
            <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
              When the MRB Board publishes official notifications, dates, or circulars, they will appear right here for your convenience.
            </p>
            <div className="mt-8 pt-8 border-t border-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              Last checked: {new Date().toLocaleTimeString()}
            </div>
          </div>
        );
      case "hall_ticket":
        {
          const generatedApplications = myApplications.filter(app => app.isHallTicketGenerated);

          if (isLoadingApplications) {
            return (
              <div className="flex flex-col items-center justify-center p-20 animate-pulse">
                <div className="w-16 h-16 bg-gray-100 rounded-full mb-4" />
                <div className="h-4 w-48 bg-gray-100 rounded" />
              </div>
            );
          }

          if (generatedApplications.length === 0) {
            return (
              <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-xl shadow-black/5 animate-in fade-in duration-500">
                <div className="w-24 h-24 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-8 -rotate-3 shadow-inner">
                  <Download size={48} />
                </div>
                <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Hall Ticket Pending</h2>
                <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                  Your hall tickets are generated after application verification. Please check back 10-15 days before the examination date.
                </p>
                <button
                  onClick={fetchMyApplications}
                  className="mt-8 px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-100 transition-colors"
                >
                  Refresh Status
                </button>
              </div>
            );
          }

          return (
            <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {generatedApplications.map((app) => (
                <HallTicket
                  key={app.applicationId}
                  application={app}
                  student={currentUser}
                  profile={studentProfile}
                  exam={exams.find(e => e.examNo === app.examNo) || null}
                  school={schools.find(s => s.schoolName === (app.schoolName || currentUser?.schoolName)) || null}
                  regions={regions}
                  centres={centres}
                  schools={schools}
                />
              ))}
            </div>
          );
        }
      case "certificates":
        return (
          <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-xl shadow-black/5 animate-in fade-in duration-500">
            <div className="w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-8 shadow-inner">
              <Award size={48} />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Digital Certificates</h2>
            <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
              Complete your examinations and achieve qualifying marks to unlock your verifiable digital certificates here.
            </p>
            <div className="mt-10 flex justify-center gap-4">
              <div className="w-3 h-3 rounded-full bg-indigo-100" />
              <div className="w-3 h-3 rounded-full bg-indigo-200" />
              <div className="w-3 h-3 rounded-full bg-indigo-300" />
            </div>
          </div>
        );
      case "results_view":
        return (
          <div className="space-y-8">
            <h2 className="text-2xl font-black text-gray-900 border-l-4 border-green-600 pl-5 py-1 flex items-center gap-3 tracking-tight uppercase text-sm">
              <FileCheck size={20} className="text-green-600" /> Results & Marksheets
            </h2>
            <MyResults myResults={myResults} student={currentUser} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <StudentLayout
      activeTab={activeTab}
      setActiveTab={setActiveTab}
      currentUser={currentUser}
      onLogout={() => setCurrentUser(null)}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {renderContent()}

        <AnimatePresence>
          {selectedExam && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
              >
                <div className="bg-indigo-600 p-6 flex justify-between items-center text-white">
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
                  <ApplyModal
                    exam={selectedExam}
                    student={currentUser}
                    school={schools.find(s => s.schoolName === currentUser?.schoolName) || null}
                    onClose={() => setSelectedExam(null)}
                    onSuccess={fetchMyResults}
                  />
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </StudentLayout>
  );
};

export default StudentDashboard;
