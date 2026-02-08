import React, { useState, useEffect } from "react";
import toast from "react-hot-toast";
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
} from "../api";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExamNo, setSelectedExamNo] = useState(null);

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
  });

  const [resultForm, setResultForm] = useState({
    applicationId: "",
    score: "",
    remarks: "Pass",
    paperMarks: {}, // { "Math": 80, "English": 70 }
    oralMarks: 0,
    projectMarks: 0,
    hasOral: false,
    hasProject: false,
    examPapers: [], // [{ name: "Math", maxMarks: 100 }, ...]
  });

  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [applications, setApplications] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  // Auto-calculate percentage
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

      // Add Oral & Project if active
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

  const fetchData = async () => {
    setLoading(true);
    try {
      const [s, e, a, r] = await Promise.allSettled([
        getAllStudents(),
        getAllExams(),
        getAllApplications(),
        getAllResults(),
      ]);

      if (s.status === "fulfilled" && Array.isArray(s.value))
        setStudents(s.value);
      if (e.status === "fulfilled" && Array.isArray(e.value)) setExams(e.value);
      if (a.status === "fulfilled" && Array.isArray(a.value))
        setApplications(a.value);
      else setApplications([]);
      if (r.status === "fulfilled" && Array.isArray(r.value))
        setResults(r.value);
      else setResults([]);
    } catch (err) {
      console.error("Error fetching data:", err);
      toast.error("Error loading dashboard data");
    }
    setLoading(false);
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

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...examForm,
        papers: JSON.stringify(examForm.papers),
        exam_details: JSON.stringify(examForm.exam_details),
      };
      await addExam(payload);
      toast.success("Exam Created!");
      resetExamForm();
      fetchData();
    } catch (error) {
      toast.error("Failed to create exam");
    }
  };

  const handleUpdateExam = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...examForm,
        papers: JSON.stringify(examForm.papers),
        exam_details: JSON.stringify(examForm.exam_details),
      };
      await updateExam(selectedExamNo, payload);
      toast.success("Exam Updated!");
      resetExamForm();
      fetchData();
    } catch (error) {
      toast.error("Failed to update exam");
    }
  };

  const handleDeleteExam = async (id) => {
    if (!window.confirm("Are you sure you want to delete this exam?")) return;
    try {
      await deleteExam(id);
      toast.success("Exam Deleted!");
      fetchData();
    } catch (error) {
      toast.error("Failed to delete exam");
    }
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
      // Scroll to top of the exam section if needed, or just let the user see it
    } catch (e) {
      console.error("Error parsing exam data for edit:", e);
      toast.error("Failed to load exam data");
    }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try {
      await addStudent(studentForm);
      toast.success("Student Added!");
      setStudentForm({ username: "", password: "" });
      fetchData();
    } catch (error) {
      toast.error("Failed to add student");
    }
  };

  const handlePublishResult = async (e) => {
    e.preventDefault();
    if (!resultForm.applicationId || !resultForm.score) {
      return toast.error("Please fill all fields");
    }

    const totalObtained = Object.values(resultForm.paperMarks).reduce(
      (sum, m) => sum + (parseFloat(m) || 0),
      0
    );
    const totalMax = resultForm.examPapers.reduce(
      (sum, p) => sum + (p.maxMarks || 0),
      0
    );

    // Add Oral & Project if active
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

    console.log("Publishing Result Payload:", payload);

    try {
      await addExamResult(payload);
      toast.success("Result Published!");
      setResultForm({
        applicationId: "",
        score: "",
        remarks: "Pass",
        paperMarks: {},
        examPapers: [],
      });
      fetchData();
    } catch (error) {
      toast.error("Failed to publish result");
    }
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
            onClick={fetchData}
            disabled={loading}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg shadow hover:bg-gray-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />{" "}
            Refresh
          </button>
        </div>

        <div className="bg-white p-1 rounded-xl shadow-sm inline-flex mb-8 overflow-x-auto max-w-full border">
          {[
            "dashboard",
            "applications",
            "publish",
            "results",
            "exams",
            "students",
          ].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-3 rounded-lg capitalize font-medium transition-all whitespace-nowrap ${activeTab === tab
                ? "bg-indigo-600 text-white shadow"
                : "text-gray-600 hover:bg-gray-50"
                }`}
            >
              {tab}
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
          />
        )}

        {activeTab === "students" && (
          <StudentManager
            studentForm={studentForm}
            setStudentForm={setStudentForm}
            handleCreateStudent={handleCreateStudent}
            students={students}
          />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
