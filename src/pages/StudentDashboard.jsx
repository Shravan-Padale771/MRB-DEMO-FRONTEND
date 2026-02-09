import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getAllStudents,
  getAllExams,
  applyForExam,
  getStudentResults,
} from "../api";
import toast from "react-hot-toast";
import { LogOut } from "lucide-react";

// Sub-components
import StudentLogin from "../student/components/StudentLogin";
import ExamList from "../student/components/ExamList";
import MyResults from "../student/components/MyResults";
import ApplyModal from "../student/components/ApplyModal";

const StudentDashboard = () => {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedExam, setSelectedExam] = useState(null);
  const [applicationForm, setApplicationForm] = useState({
    fullName: "",
    phone: "",
    address: "",
    gender: "Male",
  });

  // Queries
  const { data: students = [], isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: getAllStudents,
  });

  const { data: exams = [], isLoading: isLoadingExams } = useQuery({
    queryKey: ["exams"],
    queryFn: getAllExams,
  });

  const { data: myResults = [], isLoading: isLoadingResults } = useQuery({
    queryKey: ["studentResults", currentUser?.studentId],
    queryFn: () => getStudentResults(currentUser.studentId),
    enabled: !!currentUser,
  });

  // Mutation
  const applyMutation = useMutation({
    mutationFn: (payload) => applyForExam(payload),
    onSuccess: () => {
      toast.success("Application Submitted Successfully!");
      setSelectedExam(null);
      setApplicationForm({
        fullName: "",
        phone: "",
        address: "",
        gender: "Male",
      });
      // Optional: Invalidate applications if student can see them
      queryClient.invalidateQueries({ queryKey: ["applications"] });
    },
    onError: () => {
      toast.error("Application Failed");
    }
  });

  const openApplyModal = (exam) => {
    if (!currentUser) return toast.error("Please select a user first");
    setSelectedExam(exam);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const payload = {
      student: { studentId: currentUser.studentId },
      exam: { examNo: selectedExam.examNo },
      formData: JSON.stringify(applicationForm),
      status: "APPLIED",
    };
    applyMutation.mutate(payload);
  };

  if (!currentUser) {
    return <StudentLogin students={students} setCurrentUser={setCurrentUser} isLoading={isLoadingStudents} />;
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
          <ExamList exams={exams} openApplyModal={openApplyModal} isLoading={isLoadingExams} />
        </div>

        <div>
          <MyResults myResults={myResults} isLoading={isLoadingResults} />
        </div>
      </div>

      <ApplyModal
        selectedExam={selectedExam}
        setSelectedExam={setSelectedExam}
        applicationForm={applicationForm}
        setApplicationForm={setApplicationForm}
        handleFormSubmit={handleFormSubmit}
        isPending={applyMutation.isPending}
      />
    </div>
  );
};

export default StudentDashboard;
