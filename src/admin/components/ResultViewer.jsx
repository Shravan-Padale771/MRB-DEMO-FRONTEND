import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Trophy, Filter, XCircle, Search, TrendingUp } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllRegions, getAllExamCentres, getAllSchools, getAllStudents, getAllApplications, getAllExams } from '../../api';

const ResultViewer = ({ results = [] }) => {
    // Filter State
    const [filterRegion, setFilterRegion] = useState("");
    const [filterCentre, setFilterCentre] = useState("");
    const [filterSchool, setFilterSchool] = useState("");
    const [filterExam, setFilterExam] = useState("");
    const [isRankingsMode, setIsRankingsMode] = useState(false);

    // Metadata Queries
    const { data: regions = [] } = useQuery({ queryKey: ['regions'], queryFn: getAllRegions });
    const { data: centres = [] } = useQuery({ queryKey: ['examCentres'], queryFn: getAllExamCentres });
    const { data: schools = [] } = useQuery({ queryKey: ['schools'], queryFn: getAllSchools });
    const { data: students = [] } = useQuery({ queryKey: ['students'], queryFn: getAllStudents });
    const { data: applications = [] } = useQuery({ queryKey: ['applications'], queryFn: getAllApplications });
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

    // Processed Results (Parsed and Filtered)
    const processedResults = useMemo(() => {
        const parsed = results.map(res => {
            let score = 0;
            let remarks = "N/A";
            try {
                const data = JSON.parse(res.resultData);
                score = parseFloat(data.score) || 0;
                remarks = data.remarks || "N/A";
            } catch (e) {
                console.error("Error parsing resultData:", e);
            }

            let student = null;
            let school = null;
            let centre = null;
            let region = null;
            let application = null;

            // Find application first
            if (res.application && res.application.applicationId) {
                application = applications.find(a => a.applicationId === res.application.applicationId);
            } else if (res.applicationId) {
                application = applications.find(a => a.applicationId === res.applicationId);
            }

            if (application) {
                student = students.find(s => s.studentId === application.studentId);
                school = schools.find(s => s.schoolId === student?.schoolId);
                centre = centres.find(c => c.centreId === school?.centreId);
                region = regions.find(r => r.regionId === centre?.regionId);
            }

            return {
                ...res,
                numericScore: score,
                remarks,
                studentName: application ? application.studentName : "Unknown",
                applicationId: application ? application.applicationId : (res.applicationId || "N/A"),
                schoolName: school ? school.schoolName : "N/A",
                centreName: centre ? centre.centreName : "N/A",
                regionName: region ? region.regionName : "N/A",
                regionId: region ? region.regionId : null,
                centreId: centre ? centre.centreId : null,
                schoolId: school ? school.schoolId : null,
                examNo: application ? application.examNo : (res.examNo || null),
                examName: res.examName || application?.examName || "Unknown Exam"
            };
        });

        // Filter
        let filtered = parsed.filter(res => {
            const matchesRegion = !filterRegion || (res.regionId && res.regionId.toString() === filterRegion);
            const matchesCentre = !filterCentre || (res.centreId && res.centreId.toString() === filterCentre);
            const matchesSchool = !filterSchool || (res.schoolId && res.schoolId.toString() === filterSchool);
            const matchesExam = !filterExam || (res.examNo && res.examNo.toString() === filterExam);
            return matchesRegion && matchesCentre && matchesSchool && matchesExam;
        });

        // Sort if Rankings Mode
        if (isRankingsMode) {
            filtered.sort((a, b) => b.numericScore - a.numericScore);
        } else {
            // Default: newest first
            filtered.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
        }

        return filtered;
    }, [results, filterRegion, filterCentre, filterSchool, filterExam, isRankingsMode, applications, schools, centres, regions, students]);

    const clearFilters = () => {
        setFilterRegion("");
        setFilterCentre("");
        setFilterSchool("");
        setFilterExam("");
    };

    const getRankBadge = (index) => {
        if (!isRankingsMode) return null;
        if (index === 0) return <Trophy size={16} className="text-amber-500" />;
        if (index === 1) return <Trophy size={16} className="text-slate-400" />;
        if (index === 2) return <Trophy size={16} className="text-amber-700" />;
        return <span className="text-[10px] font-black text-gray-400">#{index + 1}</span>;
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <Award size={24} /> Published Results
                        </h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {isRankingsMode ? "Rankings & Toppers View" : "Recent Publications View"}
                        </p>
                    </div>

                    <div className="flex items-center gap-2 bg-indigo-50 p-1 rounded-xl border border-indigo-100">
                        <button
                            onClick={() => setIsRankingsMode(false)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${!isRankingsMode ? "bg-white text-indigo-600 shadow-sm" : "text-indigo-400 hover:text-indigo-600"}`}
                        >
                            Recent
                        </button>
                        <button
                            onClick={() => setIsRankingsMode(true)}
                            className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isRankingsMode ? "bg-white text-indigo-600 shadow-sm" : "text-indigo-400 hover:text-indigo-600"}`}
                        >
                            <TrendingUp size={14} /> Toppers
                        </button>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                    <div className="col-span-full flex justify-between items-center mb-2">
                        <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Filter size={12} /> Filter Results to find Toppers
                        </h4>
                        {(filterRegion || filterCentre || filterSchool || filterExam) && (
                            <button onClick={clearFilters} className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 hover:underline">
                                <XCircle size={12} /> Reset
                            </button>
                        )}
                    </div>
                    <div>
                        <select
                            className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900 shadow-sm"
                            value={filterExam}
                            onChange={(e) => setFilterExam(e.target.value)}
                        >
                            <option value="">All Exams</option>
                            {exams.map(ex => (
                                <option key={ex.examNo} value={ex.examNo}>{ex.exam_name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <select
                            className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900 shadow-sm"
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
                    </div>
                    <div>
                        <select
                            className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900 shadow-sm"
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
                    </div>
                    <div>
                        <select
                            className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900 shadow-sm"
                            value={filterSchool}
                            onChange={(e) => setFilterSchool(e.target.value)}
                        >
                            <option value="">All Schools</option>
                            {availableSchools.map(s => (
                                <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center px-4 py-2.5 bg-indigo-600 rounded-lg text-white font-black text-xs uppercase tracking-widest shadow-md">
                        <Search size={14} className="mr-2" /> {processedResults.length} Found
                    </div>
                </div>

                {processedResults.length === 0 ? (
                    <div className="text-center p-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Award className="mx-auto text-gray-200 mb-4" size={64} />
                        <p className="text-gray-400 font-bold italic text-lg">No results match your filters</p>
                        <button onClick={clearFilters} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">
                            Load all results
                        </button>
                    </div>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {processedResults.map((res, index) => (
                            <motion.div
                                key={res.id || Math.random()}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`relative p-6 rounded-2xl border-2 transition-all group overflow-hidden ${isRankingsMode && index < 3 ? "bg-gradient-to-br from-indigo-50 to-white border-indigo-200 shadow-xl" : "bg-white border-gray-100 hover:border-indigo-100 hover:shadow-lg"}`}
                            >
                                {isRankingsMode && index < 3 && (
                                    <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                        <Trophy size={80} />
                                    </div>
                                )}

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner ${isRankingsMode && index === 0 ? "bg-amber-100 text-amber-600" : isRankingsMode && index === 1 ? "bg-slate-100 text-slate-500" : isRankingsMode && index === 2 ? "bg-amber-50 text-amber-800" : "bg-indigo-50 text-indigo-600"}`}>
                                            {getRankBadge(index) || (res.studentName?.charAt(0) || "?")}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-gray-900 group-hover:text-indigo-700 transition-colors truncate">
                                                {res.studentName}
                                            </p>
                                            <div className="flex flex-wrap gap-2 items-center">
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">
                                                    #{res.applicationId}
                                                </p>
                                                <span className="text-[9px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter truncate max-w-[120px]">
                                                    {res.examName}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                                </div>

                                <div className="space-y-3 relative z-10">
                                    <div className="flex flex-col gap-1.5 p-3 bg-gray-50/50 rounded-xl border border-gray-100">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-tighter">🏫 {res.schoolName}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">📍 {res.regionName}</span>
                                            <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest">🏢 {res.centreName}</span>
                                        </div>
                                    </div>

                                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-2xl font-black text-indigo-600 italic">
                                                {res.numericScore}%
                                            </span>
                                            <span className={`text-[10px] font-black px-3 py-1 rounded-full border shadow-sm uppercase tracking-widest ${res.remarks === "Pass" ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-red-50 text-red-700 border-red-100"}`}>
                                                {res.remarks}
                                            </span>
                                        </div>

                                        {(() => {
                                            try {
                                                const data = JSON.parse(res.resultData);
                                                if (!data.breakdown) return null;
                                                return (
                                                    <div className="pt-2 border-t border-dashed mt-2 space-y-1">
                                                        <div className="flex justify-between text-[9px] font-black text-gray-400 uppercase tracking-widest">
                                                            <span>Total Marks</span>
                                                            <span>{data.totalObtained} / {data.totalMax}</span>
                                                        </div>
                                                    </div>
                                                );
                                            } catch (e) { return null; }
                                        })()}
                                    </div>

                                    <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center mt-2">
                                        Published: {res.publishedAt ? new Date(res.publishedAt).toLocaleDateString() : "N/A"}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ResultViewer;
