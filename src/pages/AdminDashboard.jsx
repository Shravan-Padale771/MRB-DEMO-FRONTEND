import React, { useState, useEffect, useMemo } from "react";
import toast from "react-hot-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
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
import StudentManager from "../admin/components/StudentManager";
import ApplicationManager from "../admin/components/ApplicationManager";
import ResultPublisher from "../admin/components/ResultPublisher";
import ResultViewer from "../admin/components/ResultViewer";
import RegionManager from "../admin/components/RegionManager";
import ExamCentreManager from "../admin/components/ExamCentreManager";
import SchoolManager from "../admin/components/SchoolManager";
import DashboardLayout from "../admin/components/DashboardLayout";
import MetricCard from "../admin/components/MetricCard";
import GlobalSearch from "../admin/components/GlobalSearch";


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
  getAllRegions,
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

  const { data: regions = [], isLoading: isLoadingRegions } = useQuery({
    queryKey: ["regions"],
    queryFn: getAllRegions,
  });

  const loading = isLoadingStudents || isLoadingExams || isLoadingApplications || isLoadingResults || isLoadingSchools || isLoadingRegions;

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


  const handlePublishResult = (e, directPayload = null) => {
    if (e) e.preventDefault();

    if (directPayload) {
      publishResultMutation.mutate(directPayload);
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
      application: { applicationId: parseInt(resultForm.applicationId) },
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

  const handlePublishWithFilters = (filters) => {
    setActiveFilters(filters);
    setActiveTab("publish");
    toast.success("Navigating to Publisher with selected filters");
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

  // Process Student Distribution by Region
  const regionData = useMemo(() => {
    return regions.map(region => ({
      name: region.regionName,
      value: students.filter(s => s.regionId === region.regionId).length || Math.floor(Math.random() * 20) + 5, // Fallback for demo
      color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}` // Random colors for regions
    })).filter(r => r.value > 0);
  }, [regions, students]);

  const COLORS = ['#4c84ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

  const handleSearchResultSelect = (tab, id) => {
    setActiveTab(tab);
    if (id) {
      // Optional: logic to highight or scroll to the specific ID
      toast.success(`Navigated to ${tab}`);
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      <GlobalSearch
        students={students}
        exams={exams}
        applications={applications}
        schools={schools}
        onSelect={handleSearchResultSelect}
      />

      {activeTab === "dashboard" && (
        <div className="space-y-8">
          {/* Metric Cards Row */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              label="Total Students"
              value={students.length.toLocaleString()}
              color="#4c84ff"
            />
            <MetricCard
              label="Total Exams"
              value={exams.length.toLocaleString()}
              color="#fbc02d"
            />
            <MetricCard
              label="Active Applications"
              value={applications.length.toLocaleString()}
              color="#10b981"
            />
            <MetricCard
              label="Total Results"
              value={results.length.toLocaleString()}
              color="#8b5cf6"
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[220px] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-800 tracking-tight">Application Trends</h3>
                <span className="text-[9px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded uppercase">7 Days</span>
              </div>
              <div className="flex-1 min-h-0">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={applicationTrends} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5f5f5" />
                    <XAxis
                      dataKey="date"
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 9 }}
                    />
                    <YAxis
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: '#9ca3af', fontSize: 9 }}
                    />
                    <Tooltip
                      cursor={{ fill: '#f8fafc' }}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', padding: '4px 8px' }}
                    />
                    <Bar
                      dataKey="count"
                      fill="#4c84ff"
                      radius={[4, 4, 0, 0]}
                      barSize={20}
                      animationDuration={1000}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>


            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 h-[220px] flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-bold text-gray-800 tracking-tight">Region Distribution</h3>
                <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded uppercase">Students</span>
              </div>
              <div className="flex-1 min-h-0 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={regionData}
                      cx="50%"
                      cy="45%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="value"
                      animationBegin={100}
                      animationDuration={1000}
                    >
                      {regionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)', fontSize: '11px', padding: '4px 8px' }}
                    />
                    <Legend
                      verticalAlign="bottom"
                      height={20}
                      iconSize={8}
                      formatter={(value) => <span className="text-[9px] font-bold text-gray-400 uppercase tracking-tighter">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>


          <div className="space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Applications</h3>
                <button onClick={() => setActiveTab('applications')} className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</button>
              </div>
              <ApplicationManager isDashboard={true} selectApplication={selectApplication} />
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold text-gray-800">Recent Results</h3>
                <button onClick={() => setActiveTab('results')} className="text-sm font-semibold text-blue-600 hover:text-blue-700">View All</button>
              </div>
              <ResultViewer isDashboard={true} />
            </div>
          </div>
        </div>
      )}

      {/* Render Sub-managers based on activeTab */}
      <div className={activeTab === 'dashboard' ? 'hidden' : 'block'}>
        {activeTab === "regions" && <RegionManager />}
        {activeTab === "exam_centres" && <ExamCentreManager />}
        {activeTab === "schools" && <SchoolManager />}
        {activeTab === "applications" && (
          <ApplicationManager
            selectApplication={selectApplication}
            onPublishWithFilters={handlePublishWithFilters}
            activeFilters={activeFilters}
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
