import React, { useState, useEffect } from "react";
import {
  addExam,
  addStudent,
  getAllStudents,
  getAllExams,
  addExamResult,
  getAllApplications,
  getAllResults,
} from "../api";
import toast from "react-hot-toast";
import {
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Users,
  BookOpen,
  FileText,
  Award,
  Plus,
} from "lucide-react";
import { motion } from "framer-motion";

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState("dashboard");

  const [examForm, setExamForm] = useState({
    exam_name: "",
    no_of_papers: 1,
    exam_fees: 0,
  });
  const [studentForm, setStudentForm] = useState({
    username: "",
    password: "",
  });
  const [resultForm, setResultForm] = useState({
    applicationId: "",
    score: "",
    remarks: "Pass",
  });

  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [applications, setApplications] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

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

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try {
      await addExam(examForm);
      toast.success("Exam Created!");
      setExamForm({ exam_name: "", no_of_papers: 1, exam_fees: 0 });
      fetchData();
    } catch (error) {
      toast.error("Failed to create exam");
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
    const payload = {
      application: { applicationId: parseInt(resultForm.applicationId) },
      resultData: JSON.stringify({
        score: resultForm.score,
        remarks: resultForm.remarks,
      }),
      publishedAt: new Date().toISOString(),
    };

    try {
      await addExamResult(payload);
      toast.success("Result Published!");
      setResultForm({ applicationId: "", score: "", remarks: "Pass" });
      fetchData();
    } catch (error) {
      toast.error("Failed to publish result");
    }
  };

  const selectApplication = (appId) => {
    setResultForm({ ...resultForm, applicationId: appId });
    setActiveTab("publish");
    toast("Selected Application #" + appId);
  };

  const StatCard = ({ icon: Icon, label, value, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white p-6 rounded-xl shadow-md border-l-4 ${color}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-gray-500 text-sm font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
        </div>
        <Icon className="text-gray-300" size={40} />
      </div>
    </motion.div>
  );

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
              className={`px-6 py-3 rounded-lg capitalize font-medium transition-all whitespace-nowrap ${
                activeTab === tab
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
                          App ##{res.application?.applicationId}
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
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <FileText size={24} /> Student Applications
            </h2>

            {applications.length === 0 ? (
              <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed">
                <AlertTriangle
                  className="mx-auto text-yellow-500 mb-3"
                  size={40}
                />
                <p className="text-gray-500 font-medium">
                  No applications found
                </p>
                <p className="text-xs text-gray-400 mt-2">
                  Students who apply for exams will appear here
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-indigo-50 text-gray-700">
                    <tr>
                      <th className="p-4 text-left font-semibold">App ID</th>
                      <th className="p-4 text-left font-semibold">Student</th>
                      <th className="p-4 text-left font-semibold">Exam</th>
                      <th className="p-4 text-left font-semibold">Status</th>
                      <th className="p-4 text-left font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {applications.map((app) => (
                      <tr
                        key={app.applicationId}
                        className="hover:bg-gray-50 transition"
                      >
                        <td className="p-4 font-bold text-indigo-600">
                          #{app.applicationId}
                        </td>
                        <td className="p-4">
                          {app.student?.username || "N/A"}
                        </td>
                        <td className="p-4">{app.exam?.exam_name || "N/A"}</td>
                        <td className="p-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${
                              app.status === "APPLIED"
                                ? "bg-blue-100 text-blue-800"
                                : "bg-green-100 text-green-800"
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <button
                            onClick={() => selectApplication(app.applicationId)}
                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition"
                          >
                            Publish Result
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {activeTab === "publish" && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <Award size={24} /> Publish Exam Result
            </h2>
            <form onSubmit={handlePublishResult} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Application ID
                </label>
                <input
                  type="number"
                  required
                  className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                  value={resultForm.applicationId}
                  onChange={(e) =>
                    setResultForm({
                      ...resultForm,
                      applicationId: e.target.value,
                    })
                  }
                  placeholder="Enter Application ID"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Score
                  </label>
                  <input
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={resultForm.score}
                    onChange={(e) =>
                      setResultForm({ ...resultForm, score: e.target.value })
                    }
                    placeholder="e.g. 85%"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Status
                  </label>
                  <select
                    required
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={resultForm.remarks}
                    onChange={(e) =>
                      setResultForm({ ...resultForm, remarks: e.target.value })
                    }
                  >
                    <option>Pass</option>
                    <option>Fail</option>
                    <option>Withheld</option>
                  </select>
                </div>
              </div>
              <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                Publish Result
              </button>
            </form>
          </div>
        )}

        {activeTab === "results" && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
              <Award size={24} /> Published Results
            </h2>
            {results.length === 0 ? (
              <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed">
                <Award className="mx-auto text-gray-400 mb-3" size={40} />
                <p className="text-gray-500 font-medium">
                  No results published yet
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((res) => (
                  <motion.div
                    key={res.id || Math.random()}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="border p-5 rounded-lg hover:shadow-lg transition bg-gradient-to-br from-green-50 to-white"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <p className="font-bold text-lg text-gray-800">
                          App ID: #{res.application?.applicationId}
                        </p>
                        <p className="text-sm text-gray-600">
                          {res.application?.student?.username}
                        </p>
                      </div>
                      <CheckCircle className="text-green-500" size={24} />
                    </div>
                    <div className="bg-white p-3 rounded border border-green-200 mb-3">
                      <p className="text-sm font-mono text-gray-700 break-words font-semibold">
                        {res.resultData}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500">
                      Published:{" "}
                      {res.publishedAt
                        ? new Date(res.publishedAt).toLocaleDateString()
                        : "N/A"}
                    </p>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "exams" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Plus size={24} /> Create Exam
              </h2>
              <form onSubmit={handleCreateExam} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exam Name
                  </label>
                  <input
                    required
                    placeholder="e.g. Hindi Final Exam"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={examForm.exam_name}
                    onChange={(e) =>
                      setExamForm({ ...examForm, exam_name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Number of Papers
                  </label>
                  <input
                    required
                    type="number"
                    min="1"
                    placeholder="e.g. 3"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={examForm.no_of_papers}
                    onChange={(e) =>
                      setExamForm({
                        ...examForm,
                        no_of_papers: parseInt(e.target.value) || 1,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Exam Fees ($)
                  </label>
                  <input
                    required
                    type="number"
                    step="0.01"
                    placeholder="e.g. 500.00"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={examForm.exam_fees}
                    onChange={(e) =>
                      setExamForm({
                        ...examForm,
                        exam_fees: parseFloat(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <button className="w-full bg-indigo-600 text-white font-bold p-3 rounded-lg hover:bg-indigo-700 transition-colors">
                  Create Exam
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <BookOpen size={24} /> All Exams
              </h2>
              {exams.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No exams created yet
                </p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {exams.map((ex) => (
                    <motion.div
                      key={ex.examNo}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 border rounded-lg hover:bg-indigo-50 transition cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <p className="font-bold text-gray-800">
                            {ex.exam_name}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Exam No: #{ex.examNo}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-mono font-bold text-green-600">
                            ${ex.exam_fees}
                          </p>
                          <p className="text-xs text-gray-500">
                            {ex.no_of_papers} papers
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "students" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Plus size={24} /> Add Student
              </h2>
              <form onSubmit={handleCreateStudent} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Username
                  </label>
                  <input
                    required
                    placeholder="e.g. Raj Kumar"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={studentForm.username}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        username: e.target.value,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Password
                  </label>
                  <input
                    required
                    type="password"
                    placeholder="Enter password"
                    className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={studentForm.password}
                    onChange={(e) =>
                      setStudentForm({
                        ...studentForm,
                        password: e.target.value,
                      })
                    }
                  />
                </div>
                <button className="w-full bg-green-600 text-white font-bold p-3 rounded-lg hover:bg-green-700 transition-colors">
                  Add Student
                </button>
              </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Users size={24} /> All Students
              </h2>
              {students.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No students added yet
                </p>
              ) : (
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {students.map((st) => (
                    <motion.div
                      key={st.studentId}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="p-4 border rounded-lg hover:bg-blue-50 transition flex justify-between items-center"
                    >
                      <div>
                        <p className="font-bold text-gray-800">{st.username}</p>
                        <p className="text-xs text-gray-500">
                          ID: #{st.studentId}
                        </p>
                      </div>
                      <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
