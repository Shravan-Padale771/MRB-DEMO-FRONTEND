import React, { useState, useEffect } from 'react';
import { 
  getAllStudents, 
  getAllExams, 
  applyForExam, 
  getStudentResults // Imported the new function
} from '../api'; 
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Award, User, LogOut, CheckCircle } from 'lucide-react';

const StudentDashboard = () => {
  // User & Data State
  const [currentUser, setCurrentUser] = useState(null);
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [myResults, setMyResults] = useState([]); // Store student's results

  // Modal State
  const [selectedExam, setSelectedExam] = useState(null);
  const [applicationForm, setApplicationForm] = useState({ 
    fullName: '', phone: '', address: '', gender: 'Male' 
  });

  // --- 1. Load Initial Data (Students & Exams) ---
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

  // --- 2. Load Results when User Logs In ---
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
      // Don't show error toast here to avoid annoyance if they have 0 results
    }
  };

  // --- Handlers ---
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
      status: "APPLIED"
    };

    try {
      await applyForExam(payload);
      toast.success("Application Submitted Successfully!");
      setSelectedExam(null);
      setApplicationForm({ fullName: '', phone: '', address: '', gender: 'Male' });
    } catch (error) {
      toast.error("Application Failed");
    }
  };

  // --- LOGIN VIEW ---
  if (!currentUser) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
          <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Student Login</h2>
          <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
            {students.map((s) => (
              <button 
                key={s.studentId}
                onClick={() => setCurrentUser(s)}
                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-xl transition-all"
              >
                <span className="font-semibold text-gray-700">{s.username}</span>
                <span className="text-xs bg-white border px-2 py-1 rounded text-gray-400">ID: {s.studentId}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- DASHBOARD VIEW ---
  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      
      {/* Header */}
      <header className="flex justify-between items-center mb-10 max-w-7xl mx-auto bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl">
            {currentUser.username.charAt(0).toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Welcome, {currentUser.username}</h1>
            <p className="text-sm text-gray-500">Student ID: #{currentUser.studentId}</p>
          </div>
        </div>
        <button onClick={() => setCurrentUser(null)} className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors">
          <LogOut size={18} /> Logout
        </button>
      </header>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: Available Exams */}
        <div className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-6 text-gray-800 border-l-4 border-indigo-600 pl-3">Available Exams</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {exams.map((exam) => (
              <motion.div 
                key={exam.examNo}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-md border border-gray-100 flex flex-col justify-between"
              >
                <div>
                  <h3 className="text-xl font-bold text-gray-900">{exam.exam_name}</h3>
                  <div className="mt-2 text-sm text-gray-500 space-y-1">
                    <p>Papers: {exam.no_of_papers}</p>
                    <p className="font-semibold text-green-600">Fee: ${exam.exam_fees}</p>
                  </div>
                </div>
                <button 
                  onClick={() => openApplyModal(exam)}
                  className="mt-6 w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
                >
                  Apply Now
                </button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: My Results (Auto-loaded) */}
        <div className="lg:col-span-1">
           <h2 className="text-xl font-bold mb-6 text-gray-800 border-l-4 border-green-500 pl-3">My Results</h2>
           
           <div className="space-y-4">
             {myResults.length === 0 ? (
               <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
                 <p className="text-gray-400">No results published yet.</p>
               </div>
             ) : (
               myResults.map((result) => (
                 <motion.div 
                   key={result.id || Math.random()}
                   initial={{ opacity: 0, x: 20 }}
                   animate={{ opacity: 1, x: 0 }}
                   className="bg-white p-5 rounded-xl shadow-md border-l-4 border-green-500 relative overflow-hidden"
                 >
                   <div className="flex justify-between items-start mb-2">
                     <h3 className="font-bold text-gray-800 text-lg">
                       {result.application?.exam?.exam_name || "Exam Result"}
                     </h3>
                     <Award className="text-green-500" size={24} />
                   </div>
                   
                   <div className="bg-green-50 p-3 rounded-lg border border-green-100 mb-2">
                     <p className="text-sm font-mono text-green-900 break-words">
                       {result.resultData}
                     </p>
                   </div>
                   
                   <div className="flex justify-between items-center text-xs text-gray-400 mt-2">
                     <span>App ID: #{result.application?.applicationId}</span>
                     <span>{new Date(result.publishedAt).toLocaleDateString()}</span>
                   </div>
                 </motion.div>
               ))
             )}
           </div>
        </div>

      </div>

      {/* --- MODAL (Same as before) --- */}
      <AnimatePresence>
        {selectedExam && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <motion.div 
              initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="bg-indigo-600 p-4 flex justify-between items-center text-white">
                <h3 className="font-bold text-lg">Apply for {selectedExam.exam_name}</h3>
                <button onClick={() => setSelectedExam(null)}><X size={20} /></button>
              </div>
              <div className="p-6">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <input required placeholder="Full Name" className="w-full p-3 border rounded-lg" onChange={e => setApplicationForm({...applicationForm, fullName: e.target.value})} />
                  <input required placeholder="Phone" className="w-full p-3 border rounded-lg" onChange={e => setApplicationForm({...applicationForm, phone: e.target.value})} />
                  <textarea required placeholder="Address" className="w-full p-3 border rounded-lg" onChange={e => setApplicationForm({...applicationForm, address: e.target.value})} />
                  <select className="w-full p-3 border rounded-lg" onChange={e => setApplicationForm({...applicationForm, gender: e.target.value})}>
                     <option>Male</option><option>Female</option>
                  </select>
                  <button className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 mt-4">Submit Application</button>
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