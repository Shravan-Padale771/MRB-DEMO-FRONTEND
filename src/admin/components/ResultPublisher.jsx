import React, { useState, useMemo } from 'react';
import { Award, Filter, XCircle, Search, Keyboard, FastForward } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { getAllRegions, getAllExamCentres, getAllSchools, getAllStudents, getAllExams } from '../../api';

const ResultPublisher = ({
    resultForm,
    setResultForm,
    handlePublishResult,
    applications = []
}) => {
    // Filter State
    const [filterRegion, setFilterRegion] = useState("");
    const [filterCentre, setFilterCentre] = useState("");
    const [filterSchool, setFilterSchool] = useState("");

    // Metadata Queries
    const { data: regions = [] } = useQuery({ queryKey: ['regions'], queryFn: getAllRegions });
    const { data: centres = [] } = useQuery({ queryKey: ['examCentres'], queryFn: getAllExamCentres });
    const { data: schools = [] } = useQuery({ queryKey: ['schools'], queryFn: getAllSchools });
    const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: getAllStudents });
    const { data: exams = [] } = useQuery({ queryKey: ['exams'], queryFn: getAllExams });

    // Cascading Filter Options
    const availableCentres = useMemo(() => {
        if (!filterRegion) return centres;
        return centres.filter(c => (c.region?.regionId?.toString() === filterRegion));
    }, [filterRegion, centres]);

    const availableSchools = useMemo(() => {
        if (!filterCentre) return schools;
        return schools.filter(s => s.examCentre?.centreId?.toString() === filterCentre);
    }, [filterCentre, schools]);

    // Filtered Applications for Selection
    const filteredAppsForSelect = useMemo(() => {
        return applications.filter(app => {
            const student = students.find(s => s.studentId === app.studentId);
            const school = schools.find(s => s.schoolId === student?.schoolId);
            const centre = centres.find(c => c.centreId === school?.centreId);
            const region = regions.find(r => r.regionId === centre?.regionId);

            const matchesRegion = !filterRegion || region?.regionId?.toString() === filterRegion;
            const matchesCentre = !filterCentre || centre?.centreId?.toString() === filterCentre;
            const matchesSchool = !filterSchool || school?.schoolId?.toString() === filterSchool;

            return matchesRegion && matchesCentre && matchesSchool;
        });
    }, [applications, filterRegion, filterCentre, filterSchool, students, schools, centres, regions]);

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
                // toast.success(`Loaded App #${appId}`); // Silent load for better UX during typing
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

    const clearFilters = () => {
        setFilterRegion("");
        setFilterCentre("");
        setFilterSchool("");
    };

    const currentApp = useMemo(() => {
        return applications.find(a => a.applicationId === parseInt(resultForm.applicationId));
    }, [applications, resultForm.applicationId]);

    return (
        <div className="max-w-3xl mx-auto">
            <div className="bg-white p-5 rounded-2xl shadow-lg border border-gray-100 overflow-hidden relative">
                {/* Accent line */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gray-200"></div>

                <div className="flex justify-between items-center mb-5 mt-2">
                    <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2 tracking-tight">
                        <Award size={20} className="text-indigo-600" /> Publish Result
                    </h2>
                    {(filterRegion || filterCentre || filterSchool) && (
                        <button
                            onClick={clearFilters}
                            className="text-[9px] font-black text-gray-400 uppercase tracking-[0.1em] flex items-center gap-1 hover:text-red-500 px-2 py-1 rounded-full transition-all"
                        >
                            <XCircle size={10} /> Reset Filters
                        </button>
                    )}
                </div>

                {/* Filterable App Selection */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-6 p-4 bg-gray-50/50 rounded-xl border border-gray-100">
                    <div className="col-span-full mb-1">
                        <h4 className="text-[9px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                            <Search size={10} /> Step 1: Find Application
                        </h4>
                    </div>
                    <select
                        className="text-[11px] p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-medium"
                        value={filterRegion}
                        onChange={(e) => {
                            setFilterRegion(e.target.value);
                            setFilterCentre("");
                            setFilterSchool("");
                        }}
                    >
                        <option value="">Region</option>
                        {regions.map(r => (
                            <option key={r.regionId} value={r.regionId}>{r.regionName}</option>
                        ))}
                    </select>
                    <select
                        className="text-[11px] p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-medium"
                        value={filterCentre}
                        onChange={(e) => {
                            setFilterCentre(e.target.value);
                            setFilterSchool("");
                        }}
                    >
                        <option value="">Centre</option>
                        {availableCentres.map(c => (
                            <option key={c.centreId} value={c.centreId}>{c.centreName}</option>
                        ))}
                    </select>
                    <select
                        className="text-[11px] p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 text-gray-700 font-medium"
                        value={filterSchool}
                        onChange={(e) => setFilterSchool(e.target.value)}
                    >
                        <option value="">School</option>
                        {availableSchools.map(s => (
                            <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                        ))}
                    </select>
                    <select
                        className="text-[11px] p-2 border border-gray-200 rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-600 shadow-sm cursor-pointer"
                        value={resultForm.applicationId}
                        onChange={handleIdChange}
                    >
                        <option value="">Select Candidate</option>
                        {filteredAppsForSelect.map(app => (
                            <option key={app.applicationId} value={app.applicationId}>
                                #{app.applicationId} - {app.studentName || "Student"}
                            </option>
                        ))}
                    </select>
                </div>

                <form onSubmit={handlePublishResult} className="space-y-5">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 bg-white p-4 rounded-xl border border-gray-200 group transition-all hover:border-indigo-400">
                            <label className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase mb-2 tracking-widest group-hover:text-indigo-600 transition-colors">
                                <Keyboard size={12} /> Step 2: Application ID (Direct)
                            </label>
                            <input
                                type="number"
                                className="w-full p-2.5 text-xl font-bold text-gray-800 bg-transparent outline-none placeholder-gray-200"
                                value={resultForm.applicationId}
                                onChange={handleIdChange}
                                placeholder="Enter ID..."
                            />
                            {currentApp && (
                                <div className="mt-2 text-[10px] font-medium text-gray-400 flex items-center gap-1">
                                    <FastForward size={10} /> Candidate: <span className="text-gray-900 font-bold">{currentApp.studentName}</span> | Exam: <span className="text-gray-900 font-bold uppercase">{currentApp.examName}</span>
                                </div>
                            )}
                        </div>

                        <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-xl border border-gray-100 flex flex-col justify-center">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">
                                Status
                            </label>
                            <select
                                required
                                className="w-full p-2 text-sm border rounded-lg bg-white font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
                                value={resultForm.remarks}
                                onChange={(e) => setResultForm({ ...resultForm, remarks: e.target.value })}
                            >
                                <option>Pass</option>
                                <option>Fail</option>
                                <option>Withheld</option>
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-3">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-50 pb-2">
                                Paper Breakdown
                            </h3>
                            {resultForm.examPapers.length === 0 ? (
                                <div className="text-center py-6">
                                    <p className="text-[10px] text-gray-300 font-medium italic">
                                        No papers loaded. Enter ID above.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    {resultForm.examPapers.map((paper, idx) => (
                                        <div key={idx} className="flex items-center justify-between gap-3 group">
                                            <div className="flex flex-col">
                                                <span className="text-[11px] font-medium text-gray-600 group-hover:text-indigo-600 transition-colors">{paper.name}</span>
                                                <span className="text-[9px] font-bold text-gray-300 uppercase tracking-tighter">Max: {paper.maxMarks}</span>
                                            </div>
                                            <input
                                                type="number"
                                                required
                                                max={paper.maxMarks}
                                                min="0"
                                                className="w-16 p-1.5 text-center text-sm font-bold border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-gray-50 text-gray-700"
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

                        <div className="space-y-4">
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
                                    <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 space-y-3">
                                        <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest border-b border-gray-200/50 pb-2">Special Components</h4>
                                        {hasOral && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-medium text-gray-700">Oral Marks (50)</span>
                                                <input type="number" max="50" min="0" className="w-14 p-1 text-center text-sm font-bold border border-gray-200 rounded-lg bg-white text-gray-900 outline-none" value={resultForm.oralMarks} onChange={(e) => setResultForm({ ...resultForm, oralMarks: parseFloat(e.target.value) || 0 })} />
                                            </div>
                                        )}
                                        {hasProject && (
                                            <div className="flex items-center justify-between">
                                                <span className="text-[11px] font-medium text-gray-700">Project Marks (50)</span>
                                                <input type="number" max="50" min="0" className="w-14 p-1 text-center text-sm font-bold border border-gray-200 rounded-lg bg-white text-gray-900 outline-none" value={resultForm.projectMarks} onChange={(e) => setResultForm({ ...resultForm, projectMarks: parseFloat(e.target.value) || 0 })} />
                                            </div>
                                        )}
                                    </div>
                                )
                            })()}

                            <div className="bg-white p-5 rounded-xl border border-dashed border-gray-300 flex flex-col items-center justify-center">
                                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Calculation</span>
                                <div className="text-3xl font-bold text-indigo-600">{resultForm.score}</div>
                                <span className="text-[9px] font-medium text-gray-400 uppercase tracking-tighter mt-1 italic">Total Percentage</span>
                            </div>
                        </div>
                    </div>

                    <button className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-indigo-700 transition-all shadow-md uppercase tracking-widest text-xs">
                        Publish Final Result
                    </button>
                </form>
            </div>
        </div>
    );
};

export default ResultPublisher;
