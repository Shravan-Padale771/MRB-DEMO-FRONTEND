import React, { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useQuery, useQueries, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  RefreshCw,
  Users,
  BookOpen,
  FileText,
  Award,
  ArrowUpRight,
  MoreVertical,
  Download
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area, BarChart, Bar, Legend
} from 'recharts';


// Sub-components
import ExamManager from "../admin/components/ExamManager";
import StudentManager from "../admin/components/modern-ui/StudentManager";
import ApplicationManager from "../admin/components/modern-ui/ApplicationManager";
import ResultPublisher from "../admin/components/ResultPublisher";
import ResultViewer from "../admin/components/ResultViewer";
import RegionManager from "../admin/components/modern-ui/RegionManager";
import ExamCentreManager from "../admin/components/modern-ui/ExamCentreManager";
import SchoolManager from "../admin/components/modern-ui/SchoolManager";
import SchoolDetailView from "../admin/components/SchoolDetailView";
import ApplicationDetailView from "../admin/components/ApplicationDetailView";
import DashboardLayout from "../admin/components/DashboardLayout";
import MetricCard from "../admin/components/MetricCard";
import GlobalSearch from "../admin/components/GlobalSearch";
import ModernAdminDashboard from "../admin/components/modern-ui/ModernAdminDashboard";


import {
  createStudent,
  getStudents,
  createExamResult,
  getExamApplications,
  getExamResults,
  getSchools,
  getRegions,
  getAnalyticsSummary,
  getStudentCountByRegion,
} from "../api";
import { createExam, updateExam, deleteExam, searchExams as getExams } from "../api/exam-api";


const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const { type, id } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("dashboard");

  // Reset navigation when switching tabs manually via sidebar
  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    if (id || type) {
      navigate("/admin");
    }
  };
  const [isEditing, setIsEditing] = useState(false);
  const [selectedExamNo, setSelectedExamNo] = useState(null);
  const [selectedAppForReview, setSelectedAppForReview] = useState(null);

  // Forms State (kept as local state)
  const [examForm, setExamForm] = useState({
    exam_name: "राष्ट्रभाषा प्रवीण परीक्षा (सितंबर 2026)",
    exam_code: "PRAVIN_SEP_2026",
    status: "DRAFT",
    no_of_papers: 2,
    exam_fees: 700,
    application_start_date: "2026-06-01",
    application_end_date: "2026-07-31",
    exam_start_date: "2026-09-01",
    exam_end_date: "2026-09-10",
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
        syllabusYear: "2026–2027",
        signatoryName: "सौ. सुनीता कुलकर्णी",
        signatoryDesignation: "सचिव, परीक्षा विभाग",
        departmentName: " परीक्षा विभाग",
        marksCalculationNote: "मात्र हिंदी के लिखित प्रश्नपत्रों के अंकों के आधार पर परिणाम घोषित किया जाता है।",
        instructions: "परीक्षार्थी को परीक्षा केंद्र पर प्रवेश पत्र अनिवार्य रूप से साथ लाना होगा।",
        disclaimer: "यह अंकसूची मूल प्रमाणपत्र नहीं है।"
      },
      structure: {
        hasOral: false,
        oralMarks: 50,
        hasProject: false,
        projectMarks: 50
      }
    },
    controllerSignatureUrl: "",
    boardSealUrl: "",
    boardLogoUrl: ""
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

  const [activeFilters, setActiveFilters] = useState({
    region: "",
    centre: "",
    school: "",
    status: ""
  });

  // Sync activeTab with route type if present
  useEffect(() => {
    if (type) {
      if (type === 'school') setActiveTab('schools');
      else if (type === 'exam') setActiveTab('exams');
      else if (type === 'centre') setActiveTab('exam_centres');
      else if (type === 'region') setActiveTab('regions');
    }
  }, [type]);

  // Queries
  const { data: studentsPage, isLoading: isLoadingStudents } = useQuery({
    queryKey: ["students"],
    queryFn: () => getStudents({ size: 20 }),
  });
  const students = studentsPage?.content || [];

  const { data: examsPage, isLoading: isLoadingExams } = useQuery({
    queryKey: ["exams"],
    queryFn: () => getExams({ size: 20 }),
  });
  const exams = examsPage?.content || [];

  const { data: applicationsPage, isLoading: isLoadingApplications } = useQuery({
    queryKey: ["applications"],
    queryFn: () => getExamApplications({ size: 20 }),
  });
  const applications = applicationsPage?.content || [];

  const { data: resultsPage, isLoading: isLoadingResults } = useQuery({
    queryKey: ["results"],
    queryFn: () => getExamResults({ size: 20 }),
  });
  const results = resultsPage?.content || [];

  const { data: schoolsPage, isLoading: isLoadingSchools } = useQuery({
    queryKey: ["schools"],
    queryFn: () => getSchools({ size: 20 }),
  });
  const schools = schoolsPage?.content || [];

  const { data: regionsPage, isLoading: isLoadingRegions } = useQuery({
    queryKey: ["regions"],
    queryFn: () => getRegions({ size: 1000 }),
  });
  const regions = regionsPage?.content || [];

  const { data: analyticsSummary, isLoading: isLoadingAnalytics } = useQuery({
    queryKey: ["analyticsSummary"],
    queryFn: () => getAnalyticsSummary(),
  });

  // Fetch counts per region
  const regionCountQueries = useQueries({
    queries: regions.map(region => ({
      queryKey: ['regionStudentCount', region.regionId],
      queryFn: () => getStudentCountByRegion(region.regionId),
      enabled: !!region.regionId
    }))
  });

  const loading = isLoadingStudents || isLoadingExams || isLoadingApplications || isLoadingResults || isLoadingSchools || isLoadingRegions || isLoadingAnalytics;

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
      controllerSignatureUrl: "",
      boardSealUrl: "",
      boardLogoUrl: ""
    });
    setIsEditing(false);
    setSelectedExamNo(null);
  };

  // Mutations
  const createExamMutation = useMutation({
    mutationFn: (payload) => createExam(payload),
    onSuccess: () => {
      toast.success("Exam Created!");
      resetExamForm();
      queryClient.invalidateQueries({ queryKey: ["exams"] });
    },
    onError: () => toast.error("Failed to create exam"),
  });

  const updateExamMutation = useMutation({
    mutationFn: (payload) => updateExam(payload),
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


  const publishResultMutation = useMutation({
    mutationFn: ({ payload, applicationId }) => createExamResult(payload, applicationId),
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
    updateExamMutation.mutate({ ...payload, examNo: selectedExamNo });
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


    const handlePublishResult = (e, directPayload = null, directAppId = null) => {
        if (e) e.preventDefault();

        if (directPayload) {
            // If we have a direct appId, use it. Otherwise try to extract from payload (legacy/bulk)
            const appId = directAppId || directPayload.application?.applicationId;
            const { application, ...restPayload } = directPayload;
            
            publishResultMutation.mutate({ 
                payload: restPayload, 
                applicationId: appId 
            });
            return;
        }

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

    const percentageNumeric = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

    const payload = {
      totalMarks: parseFloat(totalMax.toFixed(2)),
      percentage: parseFloat(percentageNumeric.toFixed(2)),
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

    publishResultMutation.mutate({ payload, applicationId: parseInt(resultForm.applicationId) });
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

  const handlePublishWithFilters = (filters) => {
    setActiveFilters(filters);
    setActiveTab("publish");
    toast.success("Navigating to Publisher with selected filters");
  };

  const handleReviewApplication = (app) => {
    setSelectedAppForReview(app);
    setActiveTab("application_detail");
  };

  // Process Application Trends (mocking actual dates if missing, or using real ones if structured)
  const applicationTrends = useMemo(() => {
    // Group applications by date (last 7 days or any structured data)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => ({
      date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      count: applications.filter(app => (app.appliedAt || "").startsWith(date)).length || Math.floor(Math.random() * 5) // Fallback random for demo if data is thin
    }));
  }, [applications]);

  const COLORS = ['#4c84ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  // Process Student Distribution by Region using the analytics endpoint queries
  const regionData = useMemo(() => {
    return regions.map((region, index) => {
      const countData = regionCountQueries[index]?.data;
      const count = typeof countData === 'number' ? countData : 0;
      return {
        name: region.regionName,
        value: count, 
        color: COLORS[index % COLORS.length]
      };
    }).filter(r => r.value > 0);
  }, [regions, regionCountQueries]);

  const handleSearchResultSelect = (tab, id) => {
    setActiveTab(tab);
    if (id) {
      // Optional: logic to highight or scroll to the specific ID
      toast.success(`Navigated to ${tab}`);
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={handleTabChange}>
      <GlobalSearch
        students={students}
        exams={exams}
        applications={applications}
        schools={schools}
        onSelect={handleSearchResultSelect}
      />

      {/* Main Content Area */}
      {activeTab === "dashboard" && !id && (
        <ModernAdminDashboard 
          stats={{
            totalStudents: analyticsSummary?.totalStudents || analyticsSummary?.studentCount || studentsPage?.totalElements || students.length,
            totalExams: analyticsSummary?.totalExams || analyticsSummary?.examCount || examsPage?.totalElements || exams.length,
            activeApplications: analyticsSummary?.totalApplications || analyticsSummary?.applicationCount || applicationsPage?.totalElements || applications.length,
            totalResults: analyticsSummary?.totalResults || analyticsSummary?.resultCount || resultsPage?.totalElements || results.length
          }}
          applicationTrends={applicationTrends.map(t => ({ label: t.date, value: t.count }))}
          regionData={(() => {
            const total = regionData.reduce((sum, r) => sum + r.value, 0);
            return regionData.map(r => ({
              name: r.name,
              pct: total > 0 ? Math.round((r.value / total) * 100) : 0
            }));
          })()}
          recentApplications={applications.slice(0, 6).map(a => ({
            name: a.studentName || (a.student?.full_name) || "Unknown",
            meta: `App #${a.applicationId} · ${a.examName || a.exam?.exam_name || "N/A"}`,
            status: a.status === 'APPROVED' ? 'Approved' : (a.status === 'PENDING' ? 'Pending' : (a.status === 'SUBMITTED' ? 'Pending' : 'Review')),
            original: a
          }))}
          recentResults={results.slice(0, 6).map(r => {
            return {
              exam: r.examName || r.application?.exam?.exam_name || "N/A",
              date: r.publishedAt ? new Date(r.publishedAt).toLocaleDateString() : "N/A",
              score: Math.round(r.percentage || 0),
              original: r
            };
          })}
          onViewAllApplications={() => setActiveTab('applications')}
          onViewAllResults={() => setActiveTab('results')}
          onReviewApplication={handleReviewApplication}
          onViewResult={(res) => {
            // Logic to view result - might need to set activeTab or similar
            setActiveTab('results');
          }}
        />
      )}
      
      {/* Exclusive Detail Views (via URL) */}
      {type === "school" && id && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          <SchoolDetailView 
            schoolId={id} 
            onBack={() => navigate("/admin")}
          />
        </div>
      )}

      {/* Render Sub-managers based on activeTab (hidden when detail view is active) */}
      <div className={(activeTab === 'dashboard' || id) ? 'hidden' : 'block'}>
        {activeTab === "regions" && <RegionManager />}
        {activeTab === "exam_centres" && <ExamCentreManager />}
        {activeTab === "schools" && !id && <SchoolManager />}
        {activeTab === "applications" && (
          <ApplicationManager
            selectApplication={selectApplication}
            reviewApplication={handleReviewApplication}
            onPublishWithFilters={handlePublishWithFilters}
            activeFilters={activeFilters}
          />
        )}
        {activeTab === "application_detail" && (
          <ApplicationDetailView 
            application={selectedAppForReview}
            onBack={() => setActiveTab("applications")}
          />
        )}
        {activeTab === "publish" && (
          <ResultPublisher
            resultForm={resultForm}
            setResultForm={setResultForm}
            handlePublishResult={handlePublishResult}
            applications={applications}
            isLoading={publishResultMutation.isPending}
            initialFilters={activeFilters}
          />
        )}
        {activeTab === "results" && <ResultViewer />}
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
            isLoading={createExamMutation.isPending || updateExamMutation.isPending || deleteExamMutation.isPending}
          />
        )}
        {activeTab === "students" && (
          <StudentManager />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminDashboard;
