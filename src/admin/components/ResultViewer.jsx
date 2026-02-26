import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Trophy, Filter, XCircle, Search, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllRegions, getAllExamCentres, getAllSchools, getAllExams, getExamResults } from '../../api';

const ResultViewer = ({ isDashboard = false }) => {
    // Filter State
    const [filterRegion, setFilterRegion] = useState("");
    const [filterCentre, setFilterCentre] = useState("");
    const [filterSchool, setFilterSchool] = useState("");
    const [filterExam, setFilterExam] = useState("");
    const [isRankingsMode, setIsRankingsMode] = useState(false);
    const [page, setPage] = useState(0);
    const [size] = useState(isDashboard ? 4 : 12);
    const [minPercent, setMinPercent] = useState("");
    const [maxPercent, setMaxPercent] = useState("");
    const [tempMin, setTempMin] = useState("");
    const [tempMax, setTempMax] = useState("");

    // Metadata Queries
    const { data: regions = [] } = useQuery({ queryKey: ['regions'], queryFn: getAllRegions });
    const { data: centres = [] } = useQuery({ queryKey: ['examCentres'], queryFn: getAllExamCentres });
    const { data: schools = [] } = useQuery({ queryKey: ['schools'], queryFn: getAllSchools });
    const { data: exams = [] } = useQuery({ queryKey: ['exams'], queryFn: getAllExams });

    // Set default exam filter to first available exam
    React.useEffect(() => {
        if (!filterExam && exams.length > 0) {
            setFilterExam(exams[0].examNo.toString());
        }
    }, [exams, filterExam]);

    // API Query for Results
    const { data: resultsData, isLoading } = useQuery({
        queryKey: ['examResults', filterRegion, filterCentre, filterSchool, filterExam, isRankingsMode, page, size, minPercent, maxPercent],
        queryFn: () => getExamResults({
            regionId: filterRegion || undefined,
            centreId: filterCentre || undefined,
            schoolId: filterSchool || undefined,
            examId: filterExam || undefined,
            minPercentage: minPercent || undefined,
            maxPercentage: maxPercent || undefined,
            page,
            size: isRankingsMode ? 100 : size, // Fetch more in ranking mode to allow accurate client-side fallback sorting
            sort: isRankingsMode ? 'percentage,desc' : 'publishedAt,desc'
        }),
        keepPreviousData: true
    });

    const results = resultsData?.content || [];
    const totalPages = resultsData?.totalPages || 0;

    // Process results for fallback calculation and display
    const processedResults = useMemo(() => {
        return results.map(res => {
            let scoreData = {};
            try {
                scoreData = typeof res.resultData === 'string' ? JSON.parse(res.resultData) : (res.resultData || {});
            } catch (e) {
                console.error("Error parsing resultData:", e);
            }

            // Extract numeric percentage from resultData if top-level is null
            let percentage = res.percentage;
            if (percentage === null || percentage === undefined) {
                if (scoreData.score) {
                    percentage = parseFloat(scoreData.score.replace('%', ''));
                } else if (scoreData.totalMax > 0) {
                    percentage = (scoreData.totalObtained / scoreData.totalMax) * 100;
                }
            }

            return {
                ...res,
                processedPercentage: percentage || 0,
                scoreData
            };
        });
    }, [results]);

    // Client-side ranking sort if needed (backend might fail to sort nulls correctly)
    const sortedResults = useMemo(() => {
        if (!isRankingsMode) return processedResults;
        return [...processedResults].sort((a, b) => b.processedPercentage - a.processedPercentage);
    }, [processedResults, isRankingsMode]);

    // Cascading Filter Options
    const availableCentres = useMemo(() => {
        if (!filterRegion) return centres;
        return centres.filter(c => (c.regionId?.toString() === filterRegion));
    }, [filterRegion, centres]);

    const availableSchools = useMemo(() => {
        if (!filterCentre) return schools;
        return schools.filter(s => s.centreId?.toString() === filterCentre);
    }, [filterCentre, schools]);

    const clearFilters = () => {
        setFilterRegion("");
        setFilterCentre("");
        setFilterSchool("");
        setFilterExam("");
        setMinPercent("");
        setMaxPercent("");
        setTempMin("");
        setTempMax("");
        setPage(0);
    };

    const getRankBadge = (index) => {
        if (!isRankingsMode || page > 0) return null;
        if (index === 0) return <Trophy size={16} className="text-amber-500" />;
        if (index === 1) return <Trophy size={16} className="text-slate-400" />;
        if (index === 2) return <Trophy size={16} className="text-amber-700" />;
        return <span className="text-[10px] font-black text-gray-400">#{index + 1}</span>;
    };

    if (isLoading && !resultsData) {
        return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Loading Results...</div>;
    }

    return (
        <div className="space-y-6">
            <div className={`bg-white ${isDashboard ? '' : 'p-8 rounded-xl shadow-lg border-t-4 border-indigo-600'}`}>
                {!isDashboard && (
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
                                onClick={() => { setIsRankingsMode(false); setPage(0); }}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${!isRankingsMode ? "bg-white text-indigo-600 shadow-sm" : "text-indigo-400 hover:text-indigo-600"}`}
                            >
                                Recent
                            </button>
                            <button
                                onClick={() => { setIsRankingsMode(true); setPage(0); }}
                                className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isRankingsMode ? "bg-white text-indigo-600 shadow-sm" : "text-indigo-400 hover:text-indigo-600"}`}
                            >
                                <TrendingUp size={14} /> Toppers
                            </button>
                        </div>
                    </div>
                )}

                {/* Filter Controls */}
                {!isDashboard && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
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
                                className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900 shadow-sm"
                                value={filterExam}
                                onChange={(e) => { setFilterExam(e.target.value); setPage(0); }}
                            >
                                <option value="">All Exams</option>
                                {exams.map(ex => (
                                    <option key={ex.examNo} value={ex.examNo}>{ex.exam_name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <select
                                className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900 shadow-sm"
                                value={filterRegion}
                                onChange={(e) => {
                                    setFilterRegion(e.target.value);
                                    setFilterCentre("");
                                    setFilterSchool("");
                                    setPage(0);
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
                                className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900 shadow-sm"
                                value={filterCentre}
                                onChange={(e) => {
                                    setFilterCentre(e.target.value);
                                    setFilterSchool("");
                                    setPage(0);
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
                                className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900 shadow-sm"
                                value={filterSchool}
                                onChange={(e) => { setFilterSchool(e.target.value); setPage(0); }}
                            >
                                <option value="">All Schools</option>
                                {availableSchools.map(s => (
                                    <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="flex items-center justify-center px-4 py-2.5 bg-indigo-600 rounded-lg text-white font-black text-[10px] uppercase tracking-widest shadow-md">
                            <Search size={12} className="mr-2" /> {resultsData?.totalElements || 0} Found
                        </div>

                        {/* Insight Filters */}
                        <div className="col-span-full mt-2 pt-4 border-t border-gray-200">
                            <div className="flex flex-wrap items-center gap-3">
                                <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quick Insights:</span>

                                <button
                                    onClick={() => {
                                        setMinPercent("35"); setMaxPercent("39.9");
                                        setTempMin("35"); setTempMax("39.9");
                                        setPage(0);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${minPercent === "35" && maxPercent === "39.9" ? "bg-amber-100 text-amber-700 border-amber-200 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-600"}`}
                                >
                                    Show Borderline (35-39%)
                                </button>

                                <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>

                                <button
                                    onClick={() => {
                                        setMinPercent("60"); setMaxPercent("74.9");
                                        setTempMin("60"); setTempMax("74.9");
                                        setPage(0);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${minPercent === "60" && maxPercent === "74.9" ? "bg-indigo-100 text-indigo-700 border-indigo-200 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-indigo-400 hover:text-indigo-600"}`}
                                >
                                    First Class (60-74%)
                                </button>

                                <button
                                    onClick={() => {
                                        setMinPercent("75"); setMaxPercent("100");
                                        setTempMin("75"); setTempMax("100");
                                        setPage(0);
                                    }}
                                    className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${minPercent === "75" ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600"}`}
                                >
                                    Distinction (75%+)
                                </button>

                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-[10px] font-bold text-gray-400">Custom Range:</span>
                                    <div className="flex items-center gap-1">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            className="w-12 p-1 text-[10px] border rounded bg-white font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                                            value={tempMin}
                                            onChange={(e) => setTempMin(e.target.value)}
                                        />
                                        <span className="text-gray-400 text-[10px]">-</span>
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            className="w-12 p-1 text-[10px] border rounded bg-white font-bold outline-none focus:ring-1 focus:ring-indigo-500"
                                            value={tempMax}
                                            onChange={(e) => setTempMax(e.target.value)}
                                        />
                                        <button
                                            onClick={() => {
                                                setMinPercent(tempMin);
                                                setMaxPercent(tempMax);
                                                setPage(0);
                                            }}
                                            className="bg-indigo-600 text-white text-[10px] font-black px-2 py-1 rounded hover:bg-indigo-700 transition-colors"
                                        >
                                            Apply
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {sortedResults.length === 0 ? (
                    <div className="text-center p-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <Award className="mx-auto text-gray-200 mb-4" size={64} />
                        <p className="text-gray-400 font-bold italic text-lg">No results match your filters</p>
                        {!isDashboard && (
                            <button onClick={clearFilters} className="mt-4 text-indigo-600 font-black text-xs uppercase tracking-widest hover:underline">
                                Load all results
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {sortedResults.map((res, index) => {
                                const scoreData = res.scoreData;

                                return (
                                    <motion.div
                                        key={res.id || Math.random()}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`relative p-6 rounded-2xl border-2 transition-all group overflow-hidden ${isRankingsMode && index < 3 && page === 0 ? "bg-gradient-to-br from-indigo-50 to-white border-indigo-200 shadow-xl" : "bg-white border-gray-100 hover:border-indigo-100 hover:shadow-lg"}`}
                                    >
                                        {isRankingsMode && index < 3 && page === 0 && (
                                            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
                                                <Trophy size={80} />
                                            </div>
                                        )}

                                        <div className="flex justify-between items-start mb-4 relative z-10">
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center font-black text-indigo-600 shadow-sm border border-indigo-100">
                                                        {res.studentName?.charAt(0) || "?"}
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        {getRankBadge(index)}
                                                        <CheckCircle className="text-indigo-400" size={18} />
                                                    </div>
                                                </div>
                                                <h4 className="font-black text-gray-900 leading-tight group-hover:text-indigo-600 transition-colors">
                                                    {res.studentName || `Application #${res.applicationId}`}
                                                </h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                    ID: #{res.applicationId} • {res.examName}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-3 relative z-10">
                                            <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                                                <div className="flex items-baseline justify-between mb-1">
                                                    <span className="text-2xl font-black text-indigo-600 italic">
                                                        {res.processedPercentage ? `${res.processedPercentage.toFixed(2)}%` : "N/A"}
                                                    </span>
                                                    {scoreData.totalObtained !== undefined && (
                                                        <span className="text-[10px] font-black text-gray-400">
                                                            {scoreData.totalObtained}/{scoreData.totalMax}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border shadow-sm uppercase tracking-widest inline-block ${scoreData.remarks === "Pass" ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-red-50 text-red-600 border-red-100"}`}>
                                                    {scoreData.remarks || "N/A"}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-center mt-2">
                                            Published: {res.publishedAt ? new Date(res.publishedAt).toLocaleDateString() : "N/A"}
                                        </p>
                                    </motion.div>
                                );
                            })}
                        </div>

                        {!isDashboard && totalPages > 1 && (
                            <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page === 0}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft size={18} />
                                    </button>
                                    <button
                                        disabled={page >= totalPages - 1}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight size={18} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default ResultViewer;
