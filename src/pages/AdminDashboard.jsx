import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  Users,
  BookOpen,
  FileText,
  Award,
} from "lucide-react";

// Sub-components
import StatCard from "../common/components/StatCard";
import ExamManager from "../admin/components/ExamManager";
import StudentManager from "../admin/components/StudentManager";
import ApplicationManager from "../admin/components/ApplicationManager";
import ResultPublisher from "../admin/components/ResultPublisher";
import ResultViewer from "../admin/components/ResultViewer";
import RegionManager from "../admin/components/RegionManager";
import ExamCentreManager from "../admin/components/ExamCentreManager";
import SchoolManager from "../admin/components/SchoolManager";

import {
  addExam,
  updateExam,
  deleteExam,
  addStudent,
  getAllStudents,
  getAllExams,
  addExamResult,
  getAllApplications,
  getAllResults,
  getAllSchools,
} from "../api";

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExamNo, setSelectedExamNo] = useState(null);

  // Forms State (kept as local state)
  const [examForm, setExamForm] = useState({
    exam_name: "राष्ट्रभाषा प्रवीण परीक्षा (सितंबर 2024)",
    exam_code: "PRAVIN_SEP_2024",
    status: "DRAFT",
    no_of_papers: 2,
    exam_fees: 700,
    application_start_date: "2024-06-01",
    application_end_date: "2024-07-31",
    exam_start_date: "2024-09-01",
    exam_end_date: "2024-09-10",
    papers: [
      { name: "प्रथम प्रश्नपत्र", maxMarks: 100 },
      { name: "द्वितीय प्रश्नपत्र", maxMarks: 100 },
    ],
    exam_details: {
      identity: {
        examFullTitle: "राष्ट्रभाषा प्रवीण परीक्षा",
        conductingBody: "महाराष्ट्र राष्ट्रभाषा सभा, पुणे",
        board: "Rashtrabhasha Sabha",
        recognitionText: "भारत सरकार द्वारा मान्य, इंटर स्तर की हिंदी के समकक्ष",
        examLevel: "PRAVIN",
        language: "Hindi"
      },
      schedule: {
        session: "September 2024",
        mode: "WRITTEN",
        medium: "Hindi",
        totalDuration: "3 Hours"
      },
      rules: {
        eligibility: "प्रबोध या समकक्ष परीक्षा उत्तीर्ण",
        passingCriteria: "प्रत्येक प्रश्नपत्र में न्यूनतम 40% तथा कुल अंकों में उत्तीर्ण होना आवश्यक",
        gradingScheme: {
          firstClass: "300 और ऊपर",
          secondClass: "250 से 299",
          thirdClass: "175 से 249",
          fail: "174 से कम"
        },
        graceMarksAllowed: true,
        revaluationAllowed: true,
        maxAttempts: "5"
      },
      administrative: {
        certificateIssued: "Pravin Certificate",
        syllabusYear: "2024–2025",
        signatoryName: "सौ. सुनीता कुलकर्णी",
        signatoryDesignation: "सचिव, परीक्षा विभाग",
        departmentName: " परीक्षा विभाग",
        marksCalculationNote: "मात्र हिंदी के लिखित प्रश्नपत्रों के अंकों के आधार पर परिणाम घोषित किया जाता है।",
        instructions: "परीक्षार्थी को परीक्षा केंद्र पर प्रवेश पत्र अनिवार्य रूप से साथ लाना होगा।",
        disclaimer: "यह अंकसूची मूल प्रमाणपत्र नहीं है।"
      },
      structure: {
        hasOral: false,
        hasProject: false
      }
    },
  });

  const [studentForm, setStudentForm] = useState({
    username: "",
    password: "",
    schoolId: "",
  });

  const [resultForm, setResultForm] = useState({
    applicationId: "",
    score: "",
    remarks: "Pass",
    paperMarks: {},
    oralMarks: 0,
    projectMarks: 0,
    hasOral: false,
    hasProject: false,
    examPapers: [],
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

  const { data: applications = [], isLoading: isLoadingApplications } = useQuery({
    queryKey: ["applications"],
    queryFn: getAllApplications,
  });

  const { data: results = [], isLoading: isLoadingResults } = useQuery({
    queryKey: ["results"],
    queryFn: getAllResults,
  });

  const { data: schools = [], isLoading: isLoadingSchools } = useQuery({
    queryKey: ["schools"],
    queryFn: getAllSchools,
  });

  const loading = isLoadingStudents || isLoadingExams || isLoadingApplications || isLoadingResults || isLoadingSchools;

  // Auto-calculate percentage (effect remains because it's derived state from forms)
  useEffect(() => {
    if (resultForm.examPapers.length > 0) {
      let totalObtained = Object.values(resultForm.paperMarks).reduce(
        (sum, m) => sum + (parseFloat(m) || 0),
        0
      );
      let totalMax = resultForm.examPapers.reduce(
        (sum, p) => sum + (p.maxMarks || 0),
        0
      );

      if (resultForm.hasOral) {
        totalObtained += (parseFloat(resultForm.oralMarks) || 0);
        totalMax += 50;
      }
      if (resultForm.hasProject) {
        totalObtained += (parseFloat(resultForm.projectMarks) || 0);
        totalMax += 50;
      }

      const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;
      setResultForm((prev) => ({
        ...prev,
        score: `${percentage.toFixed(2)}%`,
      }));
    }
  }, [resultForm.paperMarks, resultForm.examPapers, resultForm.oralMarks, resultForm.projectMarks, resultForm.hasOral, resultForm.hasProject]);

  const handleRefresh = () => {
    queryClient.invalidateQueries();
    toast.success("Refreshing data...");
  };

  const resetExamForm = () => {
    setExamForm({
      exam_name: "राष्ट्रभाषा प्रवीण परीक्षा (सितंबर 2024)",
      exam_code: "PRAVIN_SEP_2024",
      status: "DRAFT",
      no_of_papers: 2,
      exam_fees: 700,
      application_start_date: "2024-06-01",
      application_end_date: "2024-07-31",
      exam_start_date: "2024-09-01",
      exam_end_date: "2024-09-10",
      papers: [
        { name: "प्रथम प्रश्नपत्र", maxMarks: 100 },
        { name: "द्वितीय प्रश्नपत्र", maxMarks: 100 },
      ],
      exam_details: {
        identity: {
          examFullTitle: "राष्ट्रभाषा प्रवीण परीक्षा",
          conductingBody: "महाराष्ट्र राष्ट्रभाषा सभा, पुणे",
          board: "Rashtrabhasha Sabha",
          recognitionText: "भारत सरकार द्वारा मान्य, इंटर स्तर की हिंदी के समकक्ष",
          examLevel: "PRAVIN",
          language: "Hindi"
        },
        schedule: {
          session: "September 2024",
          mode: "WRITTEN",
          medium: "Hindi",
          totalDuration: "3 Hours"
        },
        rules: {
          eligibility: "प्रबोध या समकक्ष परीक्षा उत्तीर्ण",
          passingCriteria: "प्रत्येक प्रश्नपत्र में न्यूनतम 40% तथा कुल अंकों में उत्तीर्ण होना आवश्यक",
          gradingScheme: {
            firstClass: "300 और ऊपर",
            secondClass: "250 से 299",
            thirdClass: "175 से 249",
            fail: "174 से कम"
          },
          graceMarksAllowed: true,
          revaluationAllowed: true,
          maxAttempts: "5"
        },
        administrative: {
          certificateIssued: "Pravin Certificate",
          syllabusYear: "2024–2025",
          signatoryName: "सौ. सुनीता कुलकर्णी",
          signatoryDesignation: "सचिव, परीक्षा विभाग",
          departmentName: " परीक्षा विभाग",
          marksCalculationNote: "मात्र हिंदी के लिखित प्रश्नपत्रों के अंकों के आधार पर परिणाम घोषित किया जाता है।",
          instructions: "परीक्षार्थी को परीक्षा केंद्र पर प्रवेश पत्र अनिवार्य रूप से साथ लाना होगा।",
          disclaimer: "यह अंकसूची मूल प्रमाणपत्र नहीं है।"
        },
        structure: {
          hasOral: false,
          hasProject: false
        }
      },
    });
    setIsEditing(false);
    setSelectedExamNo(null);
  };

  // Mutations
  const createExamMutation = useMutation({
    mutationFn: (payload) => addExam(payload),
    onSuccess: () => {
      toast.success("Exam Created!");
      resetExamForm();
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
    onError: () => toast.error("Failed to create exam"),
  });

  const updateExamMutation = useMutation({
    mutationFn: ({ id, payload }) => updateExam(id, payload),
    onSuccess: () => {
      toast.success("Exam Updated!");
      resetExamForm();
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
    onError: () => toast.error("Failed to update exam"),
  });

  const deleteExamMutation = useMutation({
    mutationFn: (id) => deleteExam(id),
    onSuccess: () => {
      toast.success("Exam Deleted!");
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
    onError: () => toast.error("Failed to delete exam"),
  });

  const createStudentMutation = useMutation({
    mutationFn: ({ schoolId, studentData }) => addStudent(schoolId, studentData),
    onSuccess: () => {
      toast.success("Student Added!");
      setStudentForm({ username: "", password: "", schoolId: "" });
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: () => toast.error("Failed to add student"),
  });

  const publishResultMutation = useMutation({
    mutationFn: (payload) => addExamResult(payload),
    onSuccess: () => {
      toast.success("Result Published!");
      setResultForm({
        applicationId: "",
        score: "",
        remarks: "Pass",
        paperMarks: {},
        examPapers: [],
      });
      queryClient.invalidateQueries({ queryKey: ["results"] });
    },
    onError: () => toast.error("Failed to publish result"),
  });

  const handleCreateExam = (e) => {
    e.preventDefault();
    const payload = {
      ...examForm,
      papers: JSON.stringify(examForm.papers),
      exam_details: JSON.stringify(examForm.exam_details),
    };
    createExamMutation.mutate(payload);
  };

  const handleUpdateExam = (e) => {
    e.preventDefault();
    const payload = {
      ...examForm,
      papers: JSON.stringify(examForm.papers),
      exam_details: JSON.stringify(examForm.exam_details),
    };
    updateExamMutation.mutate({ id: selectedExamNo, payload });
  };

  const handleDeleteExam = (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    deleteExamMutation.mutate(id);
  };

  const startEditing = (exam) => {
    try {
      setExamForm({
        ...exam,
        papers: typeof exam.papers === 'string' ? JSON.parse(exam.papers) : exam.papers,
        exam_details: typeof exam.exam_details === 'string' ? JSON.parse(exam.exam_details) : exam.exam_details
      });
      setIsEditing(true);
      setSelectedExamNo(exam.examNo);
    } catch (e) {
      console.error("Error parsing exam data for edit:", e);
      toast.error("Failed to load exam data");
    }
  };

  const handleCreateStudent = (e) => {
    e.preventDefault();
    if (!studentForm.schoolId) {
      return toast.error("Please select a school");
    }
    const { schoolId, ...studentData } = studentForm;
    createStudentMutation.mutate({ schoolId, studentData });
  };

  const handlePublishResult = (e) => {
    e.preventDefault();
    if (!resultForm.applicationId || !resultForm.score) {
      return toast.error("Please fill all fields");
    }

    let totalObtained = Object.values(resultForm.paperMarks).reduce(
      (sum, m) => sum + (parseFloat(m) || 0),
      0
    );
    let totalMax = resultForm.examPapers.reduce(
      (sum, p) => sum + (p.maxMarks || 0),
      0
    );

    if (resultForm.hasOral) {
      totalObtained += (parseFloat(resultForm.oralMarks) || 0);
      totalMax += 50;
    }
    if (resultForm.hasProject) {
      totalObtained += (parseFloat(resultForm.projectMarks) || 0);
      totalMax += 50;
    }

    const payload = {
      application: { applicationId: parseInt(resultForm.applicationId) },
      resultData: JSON.stringify({
        score: resultForm.score,
        remarks: resultForm.remarks,
        totalObtained,
        totalMax,
        breakdown: resultForm.paperMarks,
        oralMarks: resultForm.oralMarks,
        projectMarks: resultForm.projectMarks,
      }),
      publishedAt: new Date().toISOString(),
    };

    publishResultMutation.mutate(payload);
  };

  const selectApplication = (appId) => {
    const app = applications.find((a) => a.applicationId === appId);
    let papers = [];
    let hasOral = false;
    let hasProject = false;
    if (app && app.exam) {
      if (app.exam.papers) {
        try {
          papers = JSON.parse(app.exam.papers);
        } catch (e) {
          console.error("Error parsing papers:", e);
        }
      }
      if (app.exam.exam_details) {
        try {
          const details = typeof app.exam.exam_details === 'string'
            ? JSON.parse(app.exam.exam_details)
            : app.exam.exam_details;
          hasOral = details.structure?.hasOral || false;
          hasProject = details.structure?.hasProject || false;
        } catch (e) {
          console.error("Error parsing exam_details:", e);
        }
      }
    }

    setResultForm({
      ...resultForm,
      applicationId: appId,
      examPapers: papers,
      paperMarks: papers.reduce((acc, p) => ({ ...acc, [p.name]: 0 }), {}),
      oralMarks: 0,
      projectMarks: 0,
      hasOral,
      hasProject,
      score: "",
    });
    setActiveTab("publish");
    toast("Selected Application #" + appId);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Admin Dashboard</h1>
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
            Refresh
          </button>
        </div>

        <div className="bg-white p-1 rounded-xl shadow-sm inline-flex mb-8 overflow-x-auto w-full border">
          {[
            "dashboard",
            "regions",
            "exam_centres",
            "schools",
            "students",
            "exams",
            "applications",
            "publish",
            "results",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-4 py-3 rounded-lg capitalize font-medium transition-all whitespace-nowrap text-center ${activeTab === tab
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {tab.replace("_", " ")}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <StatCard
                icon={Users}
                label="Total Students"
                value={students.length}
                color="border-blue-500"
              />
              <StatCard
                icon={BookOpen}
                label="Total Exams"
                value={exams.length}
                color="border-green-500"
              />
              <StatCard
                icon={FileText}
                label="Applications"
                value={applications.length}
                color="border-yellow-500"
              />
              <StatCard
                icon={Award}
                label="Results Published"
                value={results.length}
                color="border-purple-500"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Recent Applications
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {applications.length === 0 ? (
                    <p className="text-gray-400 text-sm">No applications yet</p>
                  ) : (
                    applications.slice(0, 5).map((app) => (
                      <div
                        key={app.applicationId}
                        className="p-3 bg-gray-50 rounded-lg border flex justify-between items-center"
                      >
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800">
                            #{app.applicationId}
                          </p>
                          <p className="text-xs text-gray-500">
                            {app.student?.username}
                          </p>
                        </div>
                        <span
                          className={`text-xs font-bold px-2 py-1 rounded ${app.status === "APPLIED" ? "bg-blue-100 text-blue-800" : "bg-green-100 text-green-800"}`}
                        >
                          {app.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-md">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Recent Results
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {results.length === 0 ? (
                    <p className="text-gray-400 text-sm">
                      No results published
                    </p>
                  ) : (
                    results.slice(0, 5).map((res) => (
                      <div
                        key={res.id || Math.random()}
                        className="p-3 bg-gray-50 rounded-lg border"
                      >
                        <p className="font-semibold text-gray-800">
                          App #{res.application?.applicationId}
                        </p>
                        <p className="text-xs text-gray-600 font-mono truncate">
                          {res.resultData}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "regions" && <RegionManager />}
        {activeTab === "exam_centres" && <ExamCentreManager />}
        {activeTab === "schools" && <SchoolManager />}

        {activeTab === "applications" && (
          <ApplicationManager
            applications={applications}
            selectApplication={selectApplication}
          />
        )}

        {activeTab === "publish" && (
          <ResultPublisher
            resultForm={resultForm}
            setResultForm={setResultForm}
            handlePublishResult={handlePublishResult}
            applications={applications}
            isLoading={publishResultMutation.isPending}
          />
        )}

        {activeTab === "results" && (
          <ResultViewer results={results} />
        )}

        {activeTab === "exams" && (
          <ExamManager
            examForm={examForm}
            setExamForm={setExamForm}
            handleCreateExam={handleCreateExam}
            handleUpdateExam={handleUpdateExam}
            handleDeleteExam={handleDeleteExam}
            startEditing={startEditing}
            isEditing={isEditing}
            resetExamForm={resetExamForm}
            exams={exams}
            isLoading={createExamMutation.isPending || updateExamMutation.isPending || deleteExamMutation.isPending}
          />
        )}

        {activeTab === "students" && (
          <StudentManager
            studentForm={studentForm}
            setStudentForm={setStudentForm}
            handleCreateStudent={handleCreateStudent}
            students={students}
            schools={schools}
            isLoading={createStudentMutation.isPending}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
