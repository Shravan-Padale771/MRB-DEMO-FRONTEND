import React, { useState, useMemo } from 'react';
import { Award, Filter, XCircle, Search, Keyboard, FastForward } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { getAllRegions, getAllExamCentres, getAllSchools, getAllStudents, getAllExams } from '../../api';

const ResultPublisher = ({
    resultForm,
    setResultForm,
    handlePublishResult,
    applications = [],
    initialFilters = {}
}) => {
    // Entry Mode
    const [entryMode, setEntryMode] = useState('bulk'); // 'single' or 'bulk'

    // Filter State
    const [filterRegion, setFilterRegion] = useState(initialFilters.region || "");
    const [filterCentre, setFilterCentre] = useState(initialFilters.centre || "");
    const [filterSchool, setFilterSchool] = useState(initialFilters.school || "");
    const [filterExam, setFilterExam] = useState(initialFilters.exam || "");
    const [bulkData, setBulkData] = useState({}); // { applicationId: { marks: {}, remarks: 'Pass' } }


    // Metadata Queries
    const { data: regions = [] } = useQuery({ queryKey: ['regions'], queryFn: getAllRegions });
    const { data: centres = [] } = useQuery({ queryKey: ['examCentres'], queryFn: getAllExamCentres });
    const { data: schools = [] } = useQuery({ queryKey: ['schools'], queryFn: getAllSchools });
    const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: getAllStudents });
    const { data: exams = [] } = useQuery({ queryKey: ['exams'], queryFn: getAllExams });

    // Set default exam filter to first available exam
    React.useEffect(() => {
        if (!filterExam && exams.length > 0) {
            setFilterExam(exams[0].examNo.toString());
        }
    }, [exams, filterExam]);

    // Cascading Filter Options
    const availableCentres = useMemo(() => {
        if (!filterRegion) return centres;
        return centres.filter(c => (c.regionId?.toString() === filterRegion || c.region?.regionId?.toString() === filterRegion));
    }, [filterRegion, centres]);

    const availableSchools = useMemo(() => {
        if (!filterCentre) return schools;
        return schools.filter(s => (s.centreId?.toString() === filterCentre || s.examCentre?.centreId?.toString() === filterCentre));
    }, [filterCentre, schools]);


    // Filtered Applications for Selection
    const filteredAppsForSelect = useMemo(() => {
        return applications.filter(app => {
            const student = students.find(s => s.studentId === app.studentId);
            const school = schools.find(s => s.schoolId === student?.schoolId);
            const centre = centres.find(c => c.centreId === school?.centreId);
            const region = regions.find(r => r.regionId === centre?.regionId);

            const matchesRegion = !filterRegion || region?.regionId?.toString() === filterRegion || school?.regionId?.toString() === filterRegion;
            const matchesCentre = !filterCentre || centre?.centreId?.toString() === filterCentre || school?.centreId?.toString() === filterCentre;
            const matchesSchool = !filterSchool || school?.schoolId?.toString() === filterSchool;
            const matchesExam = !filterExam || app.examNo?.toString() === filterExam;

            return matchesRegion && matchesCentre && matchesSchool && matchesExam;
        });
    }, [applications, filterRegion, filterCentre, filterSchool, filterExam, students, schools, centres, regions]);

    const handleIdChange = (e) => {
        const appId = e.target.value;
        if (!appId) {
            setResultForm(prev => ({ ...prev, applicationId: "" }));
            return;
        }
        const numericId = parseInt(appId);

        // Always update the ID field
        setResultForm(prev => ({ ...prev, applicationId: appId }));

        // Try to find matching application
        const app = applications.find((a) => a.applicationId === numericId);

        if (app) {
            // Find the exam details using examNo from the application
            const exam = exams.find(e => e.examNo === app.examNo);

            if (exam) {
                let papers = [];
                try {
                    papers = typeof exam.papers === 'string' ? JSON.parse(exam.papers) : exam.papers;
                } catch (err) {
                    console.error("Error parsing papers:", err);
                }

                setResultForm(prev => ({
                    ...prev,
                    applicationId: appId,
                    examPapers: papers,
                    paperMarks: papers.reduce((acc, p) => ({ ...acc, [p.name]: 0 }), {}),
                    oralMarks: 0,
                    projectMarks: 0,
                    score: "",
                }));
            }
        } else {
            // Clear papers if ID is entered but not found
            setResultForm(prev => ({
                ...prev,
                examPapers: [],
                paperMarks: {},
                oralMarks: 0,
                projectMarks: 0,
                score: "",
            }));
        }
    };

    const currentApp = useMemo(() => {
        return applications.find(a => a.applicationId === parseInt(resultForm.applicationId));
    }, [applications, resultForm.applicationId]);

    const handleBulkMarkChange = (appId, paperName, value) => {
        setBulkData(prev => ({
            ...prev,
            [appId]: {
                ...prev[appId],
                marks: {
                    ...(prev[appId]?.marks || {}),
                    [paperName]: parseFloat(value) || 0
                }
            }
        }));
    };

    const handleBulkRemarkChange = (appId, remark) => {
        setBulkData(prev => ({
            ...prev,
            [appId]: {
                ...prev[appId],
                remarks: remark
            }
        }));
    };

    const saveBulkResult = (appId) => {
        const app = applications.find(a => a.applicationId === appId);
        const data = bulkData[appId];
        if (!app || !data) return;

        const exam = exams.find(e => e.examNo === app.examNo);
        if (!exam) return;

        let papers = [];
        try { papers = typeof exam.papers === 'string' ? JSON.parse(exam.papers) : exam.papers; } catch (e) { }

        const totalObtained = Object.values(data.marks || {}).reduce((s, m) => s + m, 0);
        const totalMax = papers.reduce((s, p) => s + (p.maxMarks || 0), 0);
        const percentage = totalMax > 0 ? (totalObtained / totalMax) * 100 : 0;

        const payload = {
            application: { applicationId: appId },
            totalMarks: parseFloat(totalMax.toFixed(2)),
            percentage: parseFloat(percentage.toFixed(2)),
            resultData: JSON.stringify({
                score: `${percentage.toFixed(2)}%`,
                remarks: data.remarks || 'Pass',
                totalObtained,
                totalMax,
                breakdown: data.marks,
            }),
            publishedAt: new Date().toISOString(),
        };

        handlePublishResult({ preventDefault: () => { }, target: {} }, payload); // Modified Dashboard handler needed or direct call
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                        <Award size={28} className="text-indigo-600" /> Result Publication
                    </h2>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">
                        {entryMode === 'single' ? 'Single Student Entry' : 'Bulk spreadsheet entry'}
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                        <button
                            onClick={() => setEntryMode('single')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${entryMode === 'single' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Single
                        </button>
                        <button
                            onClick={() => setEntryMode('bulk')}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${entryMode === 'bulk' ? 'bg-white text-indigo-600 shadow-sm' : 'text-gray-400 hover:text-gray-600'}`}
                        >
                            Bulk (Excel)
                        </button>
                    </div>

                    {(filterRegion || filterCentre || filterSchool || filterExam) && (
                        <button
                            onClick={() => {
                                setFilterRegion("");
                                setFilterCentre("");
                                setFilterSchool("");
                                setFilterExam("");
                            }}
                            className="text-xs font-black text-red-500 uppercase flex items-center gap-1 hover:underline"
                        >
                            <XCircle size={14} /> Clear Selection
                        </button>
                    )}
                </div>
            </div>

            {/* Filterable App Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <div className="col-span-full mb-2">
                    <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                        <Search size={12} /> Step 1: Browse Candidates
                    </h4>
                </div>
                <select
                    className="text-xs p-3 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-bold shadow-sm"
                    value={filterRegion}
                    onChange={(e) => {
                        setFilterRegion(e.target.value);
                        setFilterCentre("");
                        setFilterSchool("");
                    }}
                >
                    <option value="">All Regions</option>
                    {regions.map(r => (
                        <option key={r.regionId} value={r.regionId}>{r.regionName}</option>
                    ))}
                </select>
                <select
                    className="text-xs p-3 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-bold shadow-sm"
                    value={filterCentre}
                    onChange={(e) => {
                        setFilterCentre(e.target.value);
                        setFilterSchool("");
                    }}
                >
                    <option value="">All Centres</option>
                    {availableCentres.map(c => (
                        <option key={c.centreId} value={c.centreId}>{c.centreName}</option>
                    ))}
                </select>
                <select
                    className="text-xs p-3 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-bold shadow-sm"
                    value={filterSchool}
                    onChange={(e) => setFilterSchool(e.target.value)}
                >
                    <option value="">All Schools</option>
                    {availableSchools.map(s => (
                        <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                    ))}
                </select>
                <select
                    className="text-xs p-3 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-bold shadow-sm"
                    value={filterExam}
                    onChange={(e) => setFilterExam(e.target.value)}
                >
                    <option value="">All Exams</option>
                    {exams.map(e => (
                        <option key={e.examNo} value={e.examNo}>{e.exam_name}</option>
                    ))}
                </select>
                <select
                    className="text-xs p-3 border border-indigo-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-black text-indigo-600 shadow-sm cursor-pointer"
                    value={resultForm.applicationId}
                    onChange={handleIdChange}
                >
                    <option value="">Select Candidate...</option>
                    {filteredAppsForSelect.map(app => (
                        <option key={app.applicationId} value={app.applicationId}>
                            #{app.applicationId} - {app.studentName || "Student"}
                        </option>
                    ))}
                </select>
            </div>

            {entryMode === 'single' ? (
                <form onSubmit={handlePublishResult} className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm group transition-all hover:border-indigo-400">
                            <label className="flex items-center gap-2 text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest group-hover:text-indigo-600 transition-colors">
                                <Keyboard size={14} /> Step 2: Confirmation & Status
                            </label>
                            <div className="flex items-end gap-6">
                                <div className="flex-1">
                                    <span className="block text-[9px] font-black text-gray-400 uppercase mb-1">Application ID</span>
                                    <input
                                        type="number"
                                        className="w-full p-0 text-3xl font-black text-gray-900 bg-transparent outline-none placeholder-gray-100"
                                        value={resultForm.applicationId}
                                        onChange={handleIdChange}
                                        placeholder="000"
                                    />
                                </div>
                                <div className="flex-[2]">
                                    {currentApp ? (
                                        <div className="space-y-1">
                                            <span className="block text-[9px] font-black text-indigo-400 uppercase">Verified Candidate</span>
                                            <p className="text-lg font-black text-indigo-900 leading-tight">{currentApp.studentName}</p>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest italic">{currentApp.examName}</p>
                                        </div>
                                    ) : (
                                        <div className="h-12 flex items-center">
                                            <p className="text-xs font-bold text-gray-300 italic">No candidate selected yet...</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 flex flex-col justify-center">
                            <label className="block text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">
                                Final Remark
                            </label>
                            <select
                                required
                                className="w-full p-3 text-sm border rounded-xl bg-white font-black text-indigo-900 outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                value={resultForm.remarks}
                                onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
                            >
                                <option>Pass</option>
                                <option>Fail</option>
                                <option>Withheld</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] border-b border-gray-50 pb-4">
                                Paper Breakdown
                            </h3>
                            {resultForm.examPapers.length === 0 ? (
                                <div className="text-center py-8">
                                    <p className="text-[11px] text-gray-300 font-bold italic">
                                        Waiting for application selection...
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {resultForm.examPapers.map((paper, idx) => (
                                        <div key={idx} className="flex items-center justify-between gap-6 group hover:bg-gray-50/50 p-2 rounded-xl transition-all">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">{paper.name}</span>
                                                <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Maximum: {paper.maxMarks}</span>
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                max={paper.maxMarks}
                                                min="0"
                                                className="w-20 p-2 text-center text-lg font-black border-2 border-gray-100 rounded-xl focus:border-indigo-500 focus:ring-0 outline-none bg-white text-indigo-600 transition-all font-mono"
                                                value={resultForm.paperMarks[paper.name] || 0}
                                                onChange={(e) => {
                                                    const val = parseFloat(e.target.value) || 0;
                                                    setResultForm({
                                                        ...resultForm,
                                                        paperMarks: { ...resultForm.paperMarks, [paper.name]: val },
                                                    });
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-6">
                            {(() => {
                                if (!currentApp) return null;
                                const exam = exams.find(e => e.examNo === currentApp.examNo);

                                if (!exam) return null;

                                let details = {};
                                try { details = typeof exam.exam_details === 'string' ? JSON.parse(exam.exam_details) : (exam.exam_details || {}); }
                                catch (e) { console.error("Error parsing details:", e); }
                                const hasOral = details.structure?.hasOral;
                                const hasProject = details.structure?.hasProject;
                                if (!hasOral && !hasProject) return null;
                                return (
                                    <div className="bg-indigo-50/50 p-6 rounded-2xl border border-indigo-100 space-y-4">
                                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] border-b border-indigo-100/50 pb-4">Special Components</h4>
                                        {hasOral && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-indigo-900">Oral (50)</span>
                                                <input type="number" max="50" min="0" className="w-16 p-1.5 text-center text-lg font-black border-2 border-indigo-100 rounded-xl bg-white text-indigo-600 outline-none font-mono" value={resultForm.oralMarks} onChange={(e) => setResultForm({ ...resultForm, oralMarks: parseFloat(e.target.value) || 0 })} />
                                            </div>
                                        )}
                                        {hasProject && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-bold text-indigo-900">Project (50)</span>
                                                <input type="number" max="50" min="0" className="w-16 p-1.5 text-center text-lg font-black border-2 border-indigo-100 rounded-xl bg-white text-indigo-600 outline-none font-mono" value={resultForm.projectMarks} onChange={(e) => setResultForm({ ...resultForm, projectMarks: parseFloat(e.target.value) || 0 })} />
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}

                            <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-indigo-100 flex flex-col items-center justify-center shadow-sm">
                                <span className="text-[9px] font-black uppercase tracking-[0.3em] text-indigo-300 mb-1">Final Performance</span>
                                <div className="text-5xl font-black text-indigo-600 leading-none font-mono">{resultForm.score || "0"}</div>
                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest mt-3 flex items-center gap-2">
                                    <div className="w-1 h-1 rounded-full bg-indigo-500 animate-pulse"></div> Total Score Percentage
                                </span>
                            </div>

                            <button className="w-full bg-indigo-600 text-white font-black py-4 px-6 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg hover:shadow-indigo-100 uppercase tracking-widest text-xs flex items-center justify-center gap-3">
                                <Award size={18} /> Publish Result
                            </button>
                        </div>
                    </div>
                </form>
            ) : (
                <div className="overflow-x-auto bg-white rounded-2xl border border-gray-100 shadow-sm">
                    <table className="w-full text-[11px]">
                        <thead className="bg-gray-50 border-b">
                            <tr>
                                <th className="p-3 text-left font-black text-gray-400 uppercase">Student</th>
                                <th className="p-3 text-left font-black text-gray-400 uppercase">Exam</th>
                                {/* Dynamic Paper Headers */}
                                {(() => {
                                    // Get max papers among visible apps to determine columns
                                    let maxPapers = [];
                                    filteredAppsForSelect.forEach(app => {
                                        const ex = exams.find(e => e.examNo === app.examNo);
                                        try {
                                            const p = typeof ex?.papers === 'string' ? JSON.parse(ex.papers) : (ex?.papers || []);
                                            if (p.length > maxPapers.length) maxPapers = p;
                                        } catch (e) { }
                                    });
                                    return maxPapers.map((p, i) => (
                                        <th key={i} className="p-3 text-center font-black text-gray-400 uppercase">{p.name}</th>
                                    ));
                                })()}
                                <th className="p-3 text-center font-black text-gray-400 uppercase">Remark</th>
                                <th className="p-3 text-right font-black text-gray-400 uppercase">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                            {filteredAppsForSelect.map(app => {
                                const exam = exams.find(e => e.examNo === app.examNo);
                                let papers = [];
                                try { papers = typeof exam?.papers === 'string' ? JSON.parse(exam.papers) : (exam?.papers || []); } catch (e) { }

                                return (
                                    <tr key={app.applicationId} className="hover:bg-indigo-50/20 transition-colors">
                                        <td className="p-3 font-bold text-gray-900">
                                            {app.studentName}
                                            <span className="block text-[8px] text-gray-400 font-black">#{app.applicationId}</span>
                                        </td>
                                        <td className="p-3 font-bold text-gray-500">{app.examName}</td>

                                        {papers.map((paper, pIdx) => (
                                            <td key={pIdx} className="p-2 text-center">
                                                <input
                                                    type="number"
                                                    placeholder="0"
                                                    max={paper.maxMarks}
                                                    className="w-14 text-center p-1 border rounded bg-white font-black text-indigo-600"
                                                    onChange={(e) => handleBulkMarkChange(app.applicationId, paper.name, e.target.value)}
                                                />
                                            </td>
                                        ))}

                                        {/* Fill empty cells if fewer papers than max displayed? No, the header is also dynamic now */}

                                        <td className="p-2 text-center">
                                            <select
                                                className="p-1 border rounded bg-white font-bold text-gray-600 outline-none"
                                                onChange={(e) => handleBulkRemarkChange(app.applicationId, e.target.value)}
                                            >
                                                <option>Pass</option>
                                                <option>Fail</option>
                                                <option>Withheld</option>
                                            </select>
                                        </td>
                                        <td className="p-3 text-right">
                                            <button
                                                onClick={() => saveBulkResult(app.applicationId)}
                                                className="bg-indigo-600 text-white px-3 py-1 rounded-lg font-black uppercase text-[9px] hover:bg-indigo-700 shadow-md"
                                            >
                                                Save
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                            {filteredAppsForSelect.length === 0 && (
                                <tr>
                                    <td colSpan="6" className="p-10 text-center text-gray-400 italic">No candidates found for bulk entry. Adjust filters.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ResultPublisher;
