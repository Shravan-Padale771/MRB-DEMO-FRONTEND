import React, { useState, useEffect } from 'react';
import { 
  addExam, 
  addStudent, 
  getAllStudents, 
  getAllExams, 
  addExamResult,
  getAllApplications, 
  getAllResults 
} from '../api';
import toast from 'react-hot-toast';
import { RefreshCw, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('applications');
  
  // Forms
  const [examForm, setExamForm] = useState({ exam_name: '', no_of_papers: 1, exam_fees: 0 });
  const [studentForm, setStudentForm] = useState({ username: '', password: '' });
  const [resultForm, setResultForm] = useState({ applicationId: '', score: '', remarks: 'Pass' });

  // Data lists (Initialize as empty arrays)
  const [students, setStudents] = useState([]);
  const [exams, setExams] = useState([]);
  const [applications, setApplications] = useState([]);
  const [results, setResults] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Use Promise.allSettled so one failure doesn't break everything
      const [s, e, a, r] = await Promise.allSettled([
        getAllStudents(),
        getAllExams(),
        getAllApplications(),
        getAllResults()
      ]);

      // --- SAFETY CHECK: Only set state if the result is actually an ARRAY ---
      if (s.status === 'fulfilled' && Array.isArray(s.value)) setStudents(s.value);
      if (e.status === 'fulfilled' && Array.isArray(e.value)) setExams(e.value);
      
      if (a.status === 'fulfilled' && Array.isArray(a.value)) {
        setApplications(a.value);
      } else {
        // If it failed or returned weird data, keep it empty to prevent crash
        console.warn("Applications API did not return a list:", a); 
        setApplications([]); 
      }

      if (r.status === 'fulfilled' && Array.isArray(r.value)) {
        setResults(r.value);
      } else {
        setResults([]);
      }
      
    } catch (err) {
      console.error("Critical Error fetching data:", err);
      toast.error("Error loading dashboard data");
    }
  };

  const handleCreateExam = async (e) => {
    e.preventDefault();
    try { await addExam(examForm); toast.success('Exam Created!'); fetchData(); } 
    catch (error) { toast.error('Failed to create exam'); }
  };

  const handleCreateStudent = async (e) => {
    e.preventDefault();
    try { await addStudent(studentForm); toast.success('Student Added!'); fetchData(); } 
    catch (error) { toast.error('Failed to add student'); }
  };

  const handlePublishResult = async (e) => {
    e.preventDefault();
    const payload = {
      application: { applicationId: resultForm.applicationId },
      resultData: JSON.stringify({ score: resultForm.score, remarks: resultForm.remarks }),
      publishedAt: new Date().toISOString()
    };

    try {
      await addExamResult(payload);
      toast.success('Result Published!');
      setResultForm({ applicationId: '', score: '', remarks: 'Pass' });
      fetchData();
    } catch (error) {
      toast.error('Failed. Check App ID.');
    }
  };

  const selectApplication = (appId) => {
    setResultForm({ ...resultForm, applicationId: appId });
    setActiveTab('publish');
    toast("Selected Application #" + appId, { icon: '👇' });
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
          <button onClick={fetchData} className="flex items-center gap-2 bg-white px-4 py-2 rounded shadow hover:bg-gray-50">
            <RefreshCw size={16} /> Refresh Data
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="bg-white p-1 rounded-xl shadow-sm inline-flex mb-8 overflow-x-auto max-w-full">
          {['applications', 'publish', 'results', 'exams', 'students'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-lg capitalize font-medium transition-all whitespace-nowrap ${
                activeTab === tab ? 'bg-indigo-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* --- VIEW APPLICATIONS TAB --- */}
        {activeTab === 'applications' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Student Applications</h2>
            
            {/* Safety Check: If empty, show message instead of crashing */}
            {!applications || applications.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded border border-dashed">
                <AlertTriangle className="mx-auto text-yellow-500 mb-2" />
                <p className="text-gray-500">No applications found.</p>
                <p className="text-xs text-gray-400 mt-1">(If you have data, check if backend is running and /getAllApplications exists)</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-50 text-gray-600 uppercase text-xs">
                    <tr>
                      <th className="p-3">App ID</th>
                      <th className="p-3">Student</th>
                      <th className="p-3">Exam</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {applications.map((app) => (
                      <tr key={app.applicationId || Math.random()} className="hover:bg-gray-50">
                        <td className="p-3 font-mono text-indigo-600 font-bold">#{app.applicationId}</td>
                        <td className="p-3">{app.student?.username || 'Unknown'}</td>
                        <td className="p-3">{app.exam?.exam_name || 'Unknown'}</td>
                        <td className="p-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            app.status === 'APPLIED' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {app.status}
                          </span>
                        </td>
                        <td className="p-3">
                          <button 
                            onClick={() => selectApplication(app.applicationId)}
                            className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
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

        {/* --- PUBLISH RESULT TAB --- */}
        {activeTab === 'publish' && (
          <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
            <h2 className="text-2xl font-bold mb-6 text-gray-800">Publish Result</h2>
            <form onSubmit={handlePublishResult} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Application ID</label>
                <input 
                  type="number" 
                  className="w-full p-3 border rounded-lg bg-gray-50"
                  value={resultForm.applicationId} 
                  onChange={e => setResultForm({...resultForm, applicationId: e.target.value})}
                  placeholder="Select from Applications tab or type here"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Score / Percentage</label>
                  <input className="w-full p-3 border rounded-lg" value={resultForm.score} onChange={e => setResultForm({...resultForm, score: e.target.value})} placeholder="e.g. 85%" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <select className="w-full p-3 border rounded-lg" value={resultForm.remarks} onChange={e => setResultForm({...resultForm, remarks: e.target.value})}>
                    <option>Pass</option> <option>Fail</option> <option>Withheld</option>
                  </select>
                </div>
              </div>
              <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700">Submit Result</button>
            </form>
          </div>
        )}

        {/* --- VIEW RESULTS TAB --- */}
        {activeTab === 'results' && (
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Published Results</h2>
            {!results || results.length === 0 ? (
               <p className="text-gray-400">No results published yet.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {results.map((res) => (
                  <div key={res.id || Math.random()} className="border p-4 rounded-lg hover:shadow-md transition">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-bold text-gray-800">App ID: #{res.application?.applicationId}</span>
                      <span className="text-xs text-gray-400">
                        {res.publishedAt ? new Date(res.publishedAt).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="bg-gray-50 p-2 rounded text-sm font-mono text-gray-600 break-words mb-2">
                      {res.resultData}
                    </div>
                    <div className="text-sm text-gray-500">
                      Student: {res.application?.student?.username || 'Unknown'}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* --- MANAGE EXAMS TAB --- */}
{activeTab === 'exams' && (
  <div className="grid md:grid-cols-2 gap-8">
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Create Exam</h2>
      <form onSubmit={handleCreateExam} className="space-y-4">
        
        {/* Exam Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Name</label>
          <input 
            required
            placeholder="e.g. Semester 1 Final" 
            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
            value={examForm.exam_name}
            onChange={e => setExamForm({...examForm, exam_name: e.target.value})} 
          />
        </div>

        {/* Number of Papers (I missed this earlier!) */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Number of Papers</label>
          <input 
            required
            type="number" 
            placeholder="e.g. 5" 
            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
            value={examForm.no_of_papers}
            onChange={e => setExamForm({...examForm, no_of_papers: parseInt(e.target.value)})} 
          />
        </div>

        {/* Exam Fees */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Exam Fees</label>
          <input 
            required
            type="number" 
            placeholder="e.g. 500.00" 
            className="w-full p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none" 
            value={examForm.exam_fees}
            onChange={e => setExamForm({...examForm, exam_fees: parseFloat(e.target.value)})} 
          />
        </div>

        <button className="w-full bg-indigo-600 text-white font-bold p-2 rounded hover:bg-indigo-700 transition-colors">
          Create Exam
        </button>
      </form>
    </div>

    {/* List Existing Exams */}
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-xl font-bold mb-4">Existing Exams</h2>
      <ul className="space-y-2">
        {exams.map((ex) => (
          <li key={ex.examNo} className="p-3 border-b flex justify-between items-center hover:bg-gray-50">
            <div>
              <span className="font-semibold text-gray-800">{ex.exam_name}</span>
              <p className="text-xs text-gray-500">{ex.no_of_papers} Papers</p>
            </div>
            <span className="font-mono font-bold text-green-600">${ex.exam_fees}</span>
          </li>
        ))}
      </ul>
    </div>
  </div>
)}

        {/* --- MANAGE STUDENTS TAB --- */}
        {activeTab === 'students' && (
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-xl font-bold mb-4">Add Student</h2>
              <form onSubmit={handleCreateStudent} className="space-y-4">
                <input placeholder="Username" className="w-full p-2 border rounded" onChange={e => setStudentForm({...studentForm, username: e.target.value})} />
                <input placeholder="Password" type="password" className="w-full p-2 border rounded" onChange={e => setStudentForm({...studentForm, password: e.target.value})} />
                <button className="w-full bg-green-600 text-white p-2 rounded">Add</button>
              </form>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-md">
               <h2 className="text-xl font-bold mb-4">Students</h2>
               <ul className="space-y-2">{students.map((st) => <li key={st.studentId} className="p-2 border-b">#{st.studentId} {st.username}</li>)}</ul>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;