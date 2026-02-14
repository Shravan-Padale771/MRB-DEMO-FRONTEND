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
        <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
            <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-3">
                    <Award size={28} className="text-indigo-600" /> Result Publication
                </h2>
                {(filterRegion || filterCentre || filterSchool) && (
                    <button
                        onClick={clearFilters}
                        className="text-xs font-black text-red-500 uppercase flex items-center gap-1 hover:underline"
                    >
                        <XCircle size={14} /> Clear Selection
                    </button>
                )}
            </div>

            {/* Filterable App Selection */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10 p-6 bg-gray-50 rounded-2xl border border-gray-100">
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
        </div>
    );
};

export default ResultPublisher;
