// import React, { useState, useMemo } from 'react';
// import { motion } from 'framer-motion';
// import { Award, CheckCircle, Trophy, Filter, XCircle, Search, TrendingUp, ChevronLeft, ChevronRight, FileText, Printer, LayoutGrid, List } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';
// import ResultLedger from './ResultLedger';
// import Pagination from '../../common/components/Pagination';
// import { getRegions, getExamCentres, getSchools, getExamResults } from '../../api';
// import { searchExams as getExams } from '../../api/exam-api';

// const ResultViewer = ({ isDashboard = false }) => {
//     // Filter State
//     const [filterRegion, setFilterRegion] = useState("");
//     const [filterCentre, setFilterCentre] = useState("");
//     const [filterSchool, setFilterSchool] = useState("");
//     const [filterExam, setFilterExam] = useState("");
//     const [isRankingsMode, setIsRankingsMode] = useState(false);
//     const [page, setPage] = useState(0);
//     const [size] = useState(isDashboard ? 4 : 12);
//     const [minPercent, setMinPercent] = useState("");
//     const [maxPercent, setMaxPercent] = useState("");
//     const [tempMin, setTempMin] = useState("");
//     const [tempMax, setTempMax] = useState("");
//     const [viewMode, setViewMode] = useState("table");
//     const [isLedgerOpen, setIsLedgerOpen] = useState(false);

//     // Metadata Queries
//     const { data: regionsPage } = useQuery({ queryKey: ['regions'], queryFn: () => getRegions({ size: 1000 }) });
//     const regions = regionsPage?.content || [];

//     const { data: centresPage } = useQuery({ queryKey: ['examCentres'], queryFn: () => getExamCentres({ size: 1000 }) });
//     const centres = centresPage?.content || [];

//     const { data: schoolsPage } = useQuery({ queryKey: ['schools'], queryFn: () => getSchools({ size: 1000 }) });
//     const schools = schoolsPage?.content || [];

//     const { data: examsPage } = useQuery({ queryKey: ['exams'], queryFn: () => getExams({ size: 1000 }) });
//     const exams = examsPage?.content || [];



//     // API Query for Results
//     const { data: resultsData, isLoading } = useQuery({
//         queryKey: ['examResults', filterRegion, filterCentre, filterSchool, filterExam, isRankingsMode, page, size, minPercent, maxPercent],
//         queryFn: () => getExamResults({
//             regionId: filterRegion || undefined,
//             centreId: filterCentre || undefined,
//             schoolId: filterSchool || undefined,
//             examId: filterExam || undefined,
//             minPercentage: minPercent || undefined,
//             maxPercentage: maxPercent || undefined,
//             page,
//             size: isRankingsMode ? 100 : size, // Fetch more in ranking mode to allow accurate client-side fallback sorting
//             sort: isRankingsMode ? 'percentage,desc' : 'publishedAt,desc'
//         }),
//         keepPreviousData: true
//     });

//     const results = resultsData?.content || [];
//     const totalPages = resultsData?.totalPages ?? (resultsData?.totalElements ? Math.ceil(resultsData.totalElements / size) : 0);

//     // Separate Query for Bullk Ledger (Larger size, non-paginated intent)
//     const { data: allResultsData, isLoading: isLoadingAll } = useQuery({
//         queryKey: ['examResultsAll', filterRegion, filterCentre, filterSchool, filterExam],
//         queryFn: () => getExamResults({
//             regionId: filterRegion || undefined,
//             centreId: filterCentre || undefined,
//             schoolId: filterSchool || undefined,
//             examId: filterExam || undefined,
//             size: 2000, // Fetch a large batch for printing
//             page: 0
//         }),
//         enabled: isLedgerOpen
//     });

//     const ledgerResults = allResultsData?.content || [];

//     // Process results for fallback calculation and display
//     const processedResults = useMemo(() => {
//         return results.map(res => {
//             let scoreData = {};
//             try {
//                 scoreData = typeof res.resultData === 'string' ? JSON.parse(res.resultData) : (res.resultData || {});
//             } catch (e) {
//                 console.error("Error parsing resultData:", e);
//             }

//             // Extract numeric percentage from resultData if top-level is null
//             let percentage = res.percentage;
//             if (percentage === null || percentage === undefined) {
//                 if (scoreData.score) {
//                     percentage = parseFloat(scoreData.score.replace('%', ''));
//                 } else if (scoreData.totalMax > 0) {
//                     percentage = (scoreData.totalObtained / scoreData.totalMax) * 100;
//                 }
//             }

//             return {
//                 ...res,
//                 processedPercentage: percentage || 0,
//                 scoreData
//             };
//         });
//     }, [results]);

//     // Client-side ranking sort if needed (backend might fail to sort nulls correctly)
//     const sortedResults = useMemo(() => {
//         if (!isRankingsMode) return processedResults;
//         return [...processedResults].sort((a, b) => b.processedPercentage - a.processedPercentage);
//     }, [processedResults, isRankingsMode]);

//     // Cascading Filter Options
//     const availableCentres = useMemo(() => {
//         if (!filterRegion) return centres;
//         return centres.filter(c => (c.regionId?.toString() === filterRegion));
//     }, [filterRegion, centres]);

//     const availableSchools = useMemo(() => {
//         if (!filterCentre) return schools;
//         return schools.filter(s => s.centreId?.toString() === filterCentre);
//     }, [filterCentre, schools]);

//     const clearFilters = () => {
//         setFilterRegion("");
//         setFilterCentre("");
//         setFilterSchool("");
//         setFilterExam("");
//         setMinPercent("");
//         setMaxPercent("");
//         setTempMin("");
//         setTempMax("");
//         setPage(0);
//     };

//     const getRankBadge = (index) => {
//         if (!isRankingsMode || page > 0) return null;
//         if (index === 0) return <Trophy size={16} className="text-amber-500" />;
//         if (index === 1) return <Trophy size={16} className="text-slate-400" />;
//         if (index === 2) return <Trophy size={16} className="text-amber-700" />;
//         return <span className="text-[10px] font-black text-gray-400">#{index + 1}</span>;
//     };

//     if (isLoading && !resultsData) {
//         return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Loading Results...</div>;
//     }

//     return (
//         <div className="space-y-6">
//             <div className={`bg-white ${isDashboard ? '' : 'p-8 rounded-xl shadow-lg border-t-4 border-[#4c84ff]'}`}>
//                 {!isDashboard && (
//                     <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
//                         <div>
//                             <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
//                                 <Award size={28} className="text-[#4c84ff]" /> Published Results
//                             </h2>
//                             <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
//                                 {isRankingsMode ? "Rankings & Toppers View" : "Recent Publications View"}
//                             </p>
//                         </div>

//                         <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
//                             {/* Sort Mode Toggle */}
//                             <div className="flex items-center gap-1 bg-blue-50 p-1 rounded-xl border border-blue-100">
//                                 <button
//                                     onClick={() => { setIsRankingsMode(false); setPage(0); }}
//                                     className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!isRankingsMode ? "bg-white text-[#4c84ff] shadow-sm" : "text-blue-400 hover:text-[#4c84ff]"}`}
//                                 >
//                                     Recent
//                                 </button>
//                                 <button
//                                     onClick={() => { setIsRankingsMode(true); setPage(0); }}
//                                     className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${isRankingsMode ? "bg-white text-[#4c84ff] shadow-sm" : "text-blue-400 hover:text-[#4c84ff]"}`}
//                                 >
//                                     <Trophy size={14} /> Toppers
//                                 </button>
//                             </div>

//                             {/* View Mode Toggle */}
//                             <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
//                                 <button
//                                     onClick={() => setViewMode("table")}
//                                     className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-[#4c84ff] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
//                                     title="Table View (Excel Style)"
//                                 >
//                                     <List size={18} />
//                                 </button>
//                                 <button
//                                     onClick={() => setViewMode("card")}
//                                     className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-white text-[#4c84ff] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
//                                     title="Grid View"
//                                 >
//                                     <LayoutGrid size={18} />
//                                 </button>
//                             </div>

//                             {/* Print Ledger Button */}
//                             <button
//                                 onClick={() => setIsLedgerOpen(true)}
//                                 className="bg-[#1b223c] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#252d4a] transition-all shadow-lg hover:shadow-blue-500/10 ml-auto lg:ml-0"
//                             >
//                                 <Printer size={16} /> Print Ledger
//                             </button>
//                         </div>
//                     </div>
//                 )}

//                 {/* Filter Controls */}
//                 {!isDashboard && (
//                     <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
//                         <div className="col-span-full flex justify-between items-center mb-2">
//                             <h4 className="text-[10px] font-black text-[#4c84ff] uppercase tracking-[0.2em] flex items-center gap-2">
//                                 <Filter size={12} /> Filter Results to find Toppers
//                             </h4>
//                             {(filterRegion || filterCentre || filterSchool || filterExam) && (
//                                 <button onClick={clearFilters} className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 hover:underline">
//                                     <XCircle size={12} /> Reset
//                                 </button>
//                             )}
//                         </div>
//                         <div>
//                             <select
//                                 className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
//                                 value={filterExam}
//                                 onChange={(e) => { setFilterExam(e.target.value); setPage(0); }}
//                             >
//                                 <option value="">All Exams</option>
//                                 {exams.map(ex => (
//                                     <option key={ex.examNo} value={ex.examNo}>{ex.exam_name}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div>
//                             <select
//                                 className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
//                                 value={filterRegion}
//                                 onChange={(e) => {
//                                     setFilterRegion(e.target.value);
//                                     setFilterCentre("");
//                                     setFilterSchool("");
//                                     setPage(0);
//                                 }}
//                             >
//                                 <option value="">All Regions</option>
//                                 {regions.map(r => (
//                                     <option key={r.regionId} value={r.regionId}>{r.regionName}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div>
//                             <select
//                                 className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
//                                 value={filterCentre}
//                                 onChange={(e) => {
//                                     setFilterCentre(e.target.value);
//                                     setFilterSchool("");
//                                     setPage(0);
//                                 }}
//                             >
//                                 <option value="">All Centres</option>
//                                 {availableCentres.map(c => (
//                                     <option key={c.centreId} value={c.centreId}>{c.centreName}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div>
//                             <select
//                                 className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
//                                 value={filterSchool}
//                                 onChange={(e) => { setFilterSchool(e.target.value); setPage(0); }}
//                             >
//                                 <option value="">All Schools</option>
//                                 {availableSchools.map(s => (
//                                     <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <div className="flex items-center justify-center px-4 py-2.5 bg-[#4c84ff] rounded-lg text-white font-black text-[10px] uppercase tracking-widest shadow-md">
//                             <Search size={12} className="mr-2" /> {resultsData?.totalElements || 0} Found
//                         </div>

//                         {/* Insight Filters */}
//                         <div className="col-span-full mt-2 pt-4 border-t border-gray-200">
//                             <div className="flex flex-wrap items-center gap-3">
//                                 <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Quick Insights:</span>

//                                 <button
//                                     onClick={() => {
//                                         setMinPercent("35"); setMaxPercent("39.9");
//                                         setTempMin("35"); setTempMax("39.9");
//                                         setPage(0);
//                                     }}
//                                     className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${minPercent === "35" && maxPercent === "39.9" ? "bg-amber-100 text-amber-700 border-amber-200 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-amber-400 hover:text-amber-600"}`}
//                                 >
//                                     Show Borderline (35-39%)
//                                 </button>

//                                 <div className="h-4 w-[1px] bg-gray-200 mx-1"></div>

//                                 <button
//                                     onClick={() => {
//                                         setMinPercent("60"); setMaxPercent("74.9");
//                                         setTempMin("60"); setTempMax("74.9");
//                                         setPage(0);
//                                     }}
//                                     className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${minPercent === "60" && maxPercent === "74.9" ? "bg-blue-50 text-blue-700 border-blue-200 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"}`}
//                                 >
//                                     First Class (60-74%)
//                                 </button>

//                                 <button
//                                     onClick={() => {
//                                         setMinPercent("75"); setMaxPercent("100");
//                                         setTempMin("75"); setTempMax("100");
//                                         setPage(0);
//                                     }}
//                                     className={`px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border ${minPercent === "75" ? "bg-emerald-100 text-emerald-700 border-emerald-200 shadow-sm" : "bg-white text-gray-600 border-gray-200 hover:border-emerald-400 hover:text-emerald-600"}`}
//                                 >
//                                     Distinction (75%+)
//                                 </button>

//                                 <div className="flex items-center gap-2 ml-auto">
//                                     <span className="text-[10px] font-bold text-gray-400">Custom Range:</span>
//                                     <div className="flex items-center gap-1">
//                                         <input
//                                             type="number"
//                                             placeholder="Min"
//                                             className="w-12 p-1 text-[10px] border rounded bg-white font-bold outline-none focus:ring-1 focus:ring-[#4c84ff]"
//                                             value={tempMin}
//                                             onChange={(e) => setTempMin(e.target.value)}
//                                         />
//                                         <span className="text-gray-400 text-[10px]">-</span>
//                                         <input
//                                             type="number"
//                                             placeholder="Max"
//                                             className="w-12 p-1 text-[10px] border rounded bg-white font-bold outline-none focus:ring-1 focus:ring-[#4c84ff]"
//                                             value={tempMax}
//                                             onChange={(e) => setTempMax(e.target.value)}
//                                         />
//                                         <button
//                                             onClick={() => {
//                                                 setMinPercent(tempMin);
//                                                 setMaxPercent(tempMax);
//                                                 setPage(0);
//                                             }}
//                                             className="bg-[#4c84ff] text-white text-[10px] font-black px-2 py-1 rounded hover:bg-[#3b6edb] transition-colors"
//                                         >
//                                             Apply
//                                         </button>
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 )}

//                 {sortedResults.length === 0 ? (
//                     <div className="text-center p-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
//                         <Award className="mx-auto text-gray-200 mb-4" size={64} />
//                         <p className="text-gray-400 font-bold italic text-lg">No results match your filters</p>
//                         {!isDashboard && (
//                             <button onClick={clearFilters} className="mt-4 text-[#4c84ff] font-black text-xs uppercase tracking-widest hover:underline">
//                                 Load all results
//                             </button>
//                         )}
//                     </div>
//                 ) : (
//                     <>
//                         {viewMode === "table" ? (
//                             <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
//                                 <div className="overflow-x-auto">
//                                     <table className="w-full text-left border-collapse">
//                                         <thead>
//                                             <tr className="bg-gray-50/50 border-b border-gray-100">
//                                                 {isRankingsMode && <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rank</th>}
//                                                 <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Roll No</th>
//                                                 <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
//                                                 <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Exam Name</th>
//                                                 <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Marks</th>
//                                                 <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Percentage</th>
//                                                 <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
//                                                 <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Date</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody className="divide-y divide-gray-50 text-sm">
//                                             {sortedResults.map((res, index) => {
//                                                 const scoreData = res.scoreData;
//                                                 return (
//                                                     <tr key={res.id || Math.random()} className="hover:bg-blue-50/20 transition-colors group">
//                                                         {isRankingsMode && (
//                                                             <td className="px-6 py-4">
//                                                                 <div className="flex items-center justify-center w-6">
//                                                                     {getRankBadge(index)}
//                                                                 </div>
//                                                             </td>
//                                                         )}
//                                                         <td className="px-6 py-4 font-black text-xs text-[#4c84ff]">#{res.applicationId}</td>
//                                                         <td className="px-6 py-4">
//                                                             <div className="flex items-center gap-3">
//                                                                 <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-[10px] text-gray-500">
//                                                                     {res.studentName?.charAt(0) || "?"}
//                                                                 </div>
//                                                                 <span className="font-bold text-gray-900">{res.studentName}</span>
//                                                             </div>
//                                                         </td>
//                                                         <td className="px-6 py-4 text-xs font-bold text-gray-500">{res.examName}</td>
//                                                         <td className="px-6 py-4 text-center">
//                                                             <span className="text-xs font-black text-gray-900">
//                                                                 {scoreData.totalObtained || res.score || "-"}/{scoreData.totalMax || 100}
//                                                             </span>
//                                                         </td>
//                                                         <td className="px-6 py-4 text-center">
//                                                             <span className="text-sm font-black text-blue-600 italic">
//                                                                 {res.processedPercentage ? `${res.processedPercentage.toFixed(2)}%` : "N/A"}
//                                                             </span>
//                                                         </td>
//                                                         <td className="px-6 py-4 text-center">
//                                                             <span className={`text-[10px] font-black px-3 py-1 rounded-full border shadow-sm uppercase tracking-tighter ${scoreData.remarks === "Pass" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
//                                                                 {scoreData.remarks || "N/A"}
//                                                             </span>
//                                                         </td>
//                                                         <td className="px-6 py-4 text-right text-[10px] font-bold text-gray-400">
//                                                             {res.publishedAt ? new Date(res.publishedAt).toLocaleDateString() : "N/A"}
//                                                         </td>
//                                                     </tr>
//                                                 );
//                                             })}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         ) : (
//                             <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
//                                 {sortedResults.map((res, index) => {
//                                     const scoreData = res.scoreData;
//                                     return (
//                                         <motion.div
//                                             key={res.id || Math.random()}
//                                             initial={{ opacity: 0, y: 20 }}
//                                             animate={{ opacity: 1, y: 0 }}
//                                             className={`relative p-6 rounded-2xl border-2 transition-all group overflow-hidden ${isRankingsMode && index < 3 && page === 0 ? "bg-gradient-to-br from-blue-50 to-white border-blue-200 shadow-xl" : "bg-white border-gray-100 hover:border-blue-100 hover:shadow-lg"}`}
//                                         >
//                                             <div className="flex justify-between items-start mb-4 relative z-10">
//                                                 <div className="flex-1">
//                                                     <div className="flex items-center justify-between mb-3">
//                                                         <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-black text-[#4c84ff] shadow-sm border border-blue-100">
//                                                             {res.studentName?.charAt(0) || "?"}
//                                                         </div>
//                                                         <div className="flex items-center gap-2">
//                                                             {getRankBadge(index)}
//                                                             <CheckCircle className="text-indigo-400" size={18} />
//                                                         </div>
//                                                     </div>
//                                                     <h4 className="font-black text-gray-900 leading-tight group-hover:text-[#4c84ff] transition-colors">
//                                                         {res.studentName || `Application #${res.applicationId}`}
//                                                     </h4>
//                                                     <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
//                                                         ID: #{res.applicationId} • {res.examName}
//                                                     </p>
//                                                 </div>
//                                             </div>

//                                             <div className="space-y-3 relative z-10">
//                                                 <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
//                                                     <div className="flex items-baseline justify-between mb-1">
//                                                         <span className="text-2xl font-black text-indigo-600 italic">
//                                                             {res.processedPercentage ? `${res.processedPercentage.toFixed(2)}%` : "N/A"}
//                                                         </span>
//                                                         <span className="text-[10px] font-black text-gray-400">
//                                                             {scoreData.totalObtained || res.score || "-"}/{scoreData.totalMax || 100}
//                                                         </span>
//                                                     </div>
//                                                     <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border shadow-sm uppercase tracking-widest inline-block ${scoreData.remarks === "Pass" ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-red-50 text-red-600 border-red-100"}`}>
//                                                         {scoreData.remarks || "N/A"}
//                                                     </span>
//                                                 </div>
//                                             </div>
//                                         </motion.div>
//                                     );
//                                 })}
//                             </div>
//                         )}

//                         {!isDashboard && totalPages > 1 && (
//                             <Pagination 
//                                 currentPage={page} 
//                                 totalPages={totalPages} 
//                                 onPageChange={setPage} 
//                             />
//                         )}
//                     </>
//                 )}
//             </div>

//             {isLedgerOpen && (
//                 <ResultLedger
//                     results={ledgerResults}
//                     onClose={() => setIsLedgerOpen(false)}
//                     filters={{
//                         exam: exams.find(e => e.examNo.toString() === filterExam)?.exam_name,
//                         region: regions.find(r => r.regionId.toString() === filterRegion)?.regionName,
//                         centre: centres.find(c => c.centreId.toString() === filterCentre)?.centreName,
//                         school: schools.find(s => s.schoolId.toString() === filterSchool)?.schoolName,
//                     }}
//                 />
//             )}
//         </div>
//     );
// };

// export default ResultViewer;


import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Award, Trophy, Filter, XCircle, TrendingUp, Printer, LayoutGrid, List } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import ResultLedger from './ResultLedger';
import Pagination from '../../common/components/Pagination';
import { getRegions, getExamCentres, getSchools, getExamResults } from '../../api';
import { searchExams as getExams } from '../../api/exam-api';

const REMARK_STYLES = {
    Pass: { bg: '#EBFBEE', color: '#2F9E44' },
    Fail: { bg: '#FFF5F5', color: '#F03E3E' },
    Withheld: { bg: '#FFF9DB', color: '#E67700' },
};

const ResultViewer = ({ isDashboard = false }) => {
    const [filterRegion, setFilterRegion] = useState('');
    const [filterCentre, setFilterCentre] = useState('');
    const [filterSchool, setFilterSchool] = useState('');
    const [filterExam, setFilterExam] = useState('');
    const [isRankingsMode, setIsRankingsMode] = useState(false);
    const [page, setPage] = useState(0);
    const [size] = useState(isDashboard ? 4 : 12);
    const [minPercent, setMinPercent] = useState('');
    const [maxPercent, setMaxPercent] = useState('');
    const [tempMin, setTempMin] = useState('');
    const [tempMax, setTempMax] = useState('');
    const [viewMode, setViewMode] = useState('table');
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);

    const { data: regionsPage } = useQuery({ queryKey: ['regions'], queryFn: () => getRegions({ size: 1000 }) });
    const { data: centresPage } = useQuery({ queryKey: ['examCentres'], queryFn: () => getExamCentres({ size: 1000 }) });
    const { data: schoolsPage } = useQuery({ queryKey: ['schools'], queryFn: () => getSchools({ size: 1000 }) });
    const { data: examsPage } = useQuery({ queryKey: ['exams'], queryFn: () => getExams({ size: 1000 }) });

    const regions = regionsPage?.content || [];
    const centres = centresPage?.content || [];
    const schools = schoolsPage?.content || [];
    const exams = examsPage?.content || [];

    const { data: resultsData, isLoading } = useQuery({
        queryKey: ['examResults', filterRegion, filterCentre, filterSchool, filterExam, isRankingsMode, page, size, minPercent, maxPercent],
        queryFn: () => getExamResults({
            regionId: filterRegion || undefined, centreId: filterCentre || undefined,
            schoolId: filterSchool || undefined, examId: filterExam || undefined,
            minPercentage: minPercent || undefined, maxPercentage: maxPercent || undefined,
            page, size: isRankingsMode ? 100 : size,
            sort: isRankingsMode ? 'percentage,desc' : 'publishedAt,desc',
        }),
        keepPreviousData: true,
    });

    const { data: allResultsData } = useQuery({
        queryKey: ['examResultsAll', filterRegion, filterCentre, filterSchool, filterExam],
        queryFn: () => getExamResults({ regionId: filterRegion || undefined, centreId: filterCentre || undefined, schoolId: filterSchool || undefined, examId: filterExam || undefined, size: 2000, page: 0 }),
        enabled: isLedgerOpen,
    });

    const results = resultsData?.content || [];
    const ledgerResults = allResultsData?.content || [];
    const totalPages = resultsData?.totalPages ?? (resultsData?.totalElements ? Math.ceil(resultsData.totalElements / size) : 0);

    const processedResults = useMemo(() => results.map(res => {
        let scoreData = {};
        try { scoreData = typeof res.resultData === 'string' ? JSON.parse(res.resultData) : (res.resultData || {}); } catch { }
        let pct = res.percentage;
        if (pct === null || pct === undefined) {
            if (scoreData.score) pct = parseFloat(scoreData.score.replace('%', ''));
            else if (scoreData.totalMax > 0) pct = (scoreData.totalObtained / scoreData.totalMax) * 100;
        }
        return { ...res, processedPercentage: pct || 0, scoreData };
    }), [results]);

    const sortedResults = useMemo(() => {
        if (!isRankingsMode) return processedResults;
        return [...processedResults].sort((a, b) => b.processedPercentage - a.processedPercentage);
    }, [processedResults, isRankingsMode]);

    const availableCentres = useMemo(() => !filterRegion ? centres : centres.filter(c => c.regionId?.toString() === filterRegion), [filterRegion, centres]);
    const availableSchools = useMemo(() => !filterCentre ? schools : schools.filter(s => s.centreId?.toString() === filterCentre), [filterCentre, schools]);

    const clearFilters = () => { setFilterRegion(''); setFilterCentre(''); setFilterSchool(''); setFilterExam(''); setMinPercent(''); setMaxPercent(''); setTempMin(''); setTempMax(''); setPage(0); };
    const hasFilters = filterRegion || filterCentre || filterSchool || filterExam;

    const getRankIcon = (idx) => {
        if (!isRankingsMode || page > 0) return null;
        if (idx === 0) return <Trophy size={14} style={{ color: '#F59F00' }} />;
        if (idx === 1) return <Trophy size={14} style={{ color: '#868E96' }} />;
        if (idx === 2) return <Trophy size={14} style={{ color: '#CD7F32' }} />;
        return <span style={{ fontSize: 10, fontWeight: 700, color: '#B0B3C6' }}>#{idx + 1}</span>;
    };

    const INSIGHT_RANGES = [
        { label: 'Borderline (35–39%)', min: '35', max: '39.9' },
        { label: 'First Class (60–74%)', min: '60', max: '74.9' },
        { label: 'Distinction (75%+)', min: '75', max: '100' },
    ];

    if (isLoading && !resultsData) {
        return (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
                <div style={{ width: 32, height: 32, border: '3px solid #EEF3FF', borderTopColor: '#4361EE', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={s.page}>

            {!isDashboard && (
                <>
                    {/* Header */}
                    <div style={s.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                            <div>
                                <p style={s.cardTitle}>Published Results</p>
                                <p style={s.cardSub}>{isRankingsMode ? 'Rankings & Toppers View' : 'Recent Publications View'}</p>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                                {/* Recent / Toppers toggle */}
                                <div style={s.segmented}>
                                    <button style={{ ...s.segBtn, ...((!isRankingsMode) ? s.segBtnActive : {}) }} onClick={() => { setIsRankingsMode(false); setPage(0); }}>Recent</button>
                                    <button style={{ ...s.segBtn, ...(isRankingsMode ? s.segBtnActive : {}), display: 'flex', alignItems: 'center', gap: 5 }} onClick={() => { setIsRankingsMode(true); setPage(0); }}>
                                        <Trophy size={11} /> Toppers
                                    </button>
                                </div>
                                {/* Table / Card toggle */}
                                <div style={s.segmented}>
                                    <button style={{ ...s.segBtn, ...(viewMode === 'table' ? s.segBtnActive : {}), display: 'flex', alignItems: 'center' }} onClick={() => setViewMode('table')}><List size={14} /></button>
                                    <button style={{ ...s.segBtn, ...(viewMode === 'card' ? s.segBtnActive : {}), display: 'flex', alignItems: 'center' }} onClick={() => setViewMode('card')}><LayoutGrid size={14} /></button>
                                </div>
                                <button onClick={() => setIsLedgerOpen(true)} style={s.printBtn}>
                                    <Printer size={13} /> Print Ledger
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Filters */}
                    <div style={s.card}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                            <p style={s.sectionHdr}><Filter size={11} style={{ color: '#4361EE' }} /> Filter Results</p>
                            {hasFilters && <button onClick={clearFilters} style={s.clearBtn}><XCircle size={11} /> Reset</button>}
                        </div>
                        <div style={s.filterGrid}>
                            {[
                                { label: 'Exam', val: filterExam, onChange: e => { setFilterExam(e.target.value); setPage(0); }, opts: exams.map(ex => ({ v: ex.examNo, l: ex.exam_name })) },
                                { label: 'Region', val: filterRegion, onChange: e => { setFilterRegion(e.target.value); setFilterCentre(''); setFilterSchool(''); setPage(0); }, opts: regions.map(r => ({ v: r.regionId, l: r.regionName })) },
                                { label: 'Centre', val: filterCentre, onChange: e => { setFilterCentre(e.target.value); setFilterSchool(''); setPage(0); }, opts: availableCentres.map(c => ({ v: c.centreId, l: c.centreName })) },
                                { label: 'School', val: filterSchool, onChange: e => { setFilterSchool(e.target.value); setPage(0); }, opts: availableSchools.map(s => ({ v: s.schoolId, l: s.schoolName })) },
                            ].map(({ label, val, onChange, opts }) => (
                                <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <label style={s.label}>Filter by {label}</label>
                                    <select style={s.select} value={val} onChange={onChange}>
                                        <option value="">All {label}s</option>
                                        {opts.map(o => <option key={o.v} value={o.v}>{o.l}</option>)}
                                    </select>
                                </div>
                            ))}
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                                <div style={s.countChip}>{resultsData?.totalElements || 0} Found</div>
                            </div>
                        </div>

                        {/* Insight ranges */}
                        <div style={{ marginTop: 14, paddingTop: 12, borderTop: '0.5px solid #E8EAF0' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                                <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8B8FA8' }}>Quick Insights:</span>
                                {INSIGHT_RANGES.map(r => {
                                    const active = minPercent === r.min && maxPercent === r.max;
                                    return (
                                        <button key={r.label} onClick={() => { setMinPercent(r.min); setMaxPercent(r.max); setTempMin(r.min); setTempMax(r.max); setPage(0); }}
                                            style={{ ...s.insightBtn, ...(active ? s.insightBtnActive : {}) }}>
                                            {r.label}
                                        </button>
                                    );
                                })}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto' }}>
                                    <span style={{ fontSize: 10, color: '#8B8FA8', fontWeight: 600 }}>Custom:</span>
                                    <input type="number" placeholder="Min" style={s.rangeInput} value={tempMin} onChange={e => setTempMin(e.target.value)} />
                                    <span style={{ fontSize: 10, color: '#B0B3C6' }}>—</span>
                                    <input type="number" placeholder="Max" style={s.rangeInput} value={tempMax} onChange={e => setTempMax(e.target.value)} />
                                    <button onClick={() => { setMinPercent(tempMin); setMaxPercent(tempMax); setPage(0); }} style={s.applyBtn}>Apply</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Results */}
            {sortedResults.length === 0 ? (
                <div style={{ ...s.card, display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '48px 20px', gap: 12 }}>
                    <Award size={36} style={{ color: '#D1D5E8' }} />
                    <p style={s.emptyText}>No results match your filters</p>
                    {!isDashboard && <button onClick={clearFilters} style={{ fontSize: 11, fontWeight: 700, color: '#4361EE', background: 'none', border: 'none', cursor: 'pointer', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Load all results</button>}
                </div>
            ) : viewMode === 'table' ? (
                <div style={s.card}>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={s.table}>
                            <thead>
                                <tr style={s.thead}>
                                    {isRankingsMode && <th style={s.th}>Rank</th>}
                                    <th style={s.th}>Roll No</th>
                                    <th style={s.th}>Student Name</th>
                                    <th style={s.th}>Exam</th>
                                    <th style={{ ...s.th, textAlign: 'center' }}>Marks</th>
                                    <th style={{ ...s.th, textAlign: 'center' }}>Percentage</th>
                                    <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
                                    <th style={{ ...s.th, textAlign: 'right' }}>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedResults.map((res, idx) => {
                                    const sd = res.scoreData;
                                    const rm = REMARK_STYLES[sd.remarks] || REMARK_STYLES.Fail;
                                    return (
                                        <tr key={res.id || idx} style={s.tr}>
                                            {isRankingsMode && <td style={{ ...s.td, textAlign: 'center' }}>{getRankIcon(idx)}</td>}
                                            <td style={s.tdCode}>#{res.applicationId}</td>
                                            <td style={s.tdMain}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                                    <div style={s.avatar}>{res.studentName?.charAt(0) || '?'}</div>
                                                    {res.studentName}
                                                </div>
                                            </td>
                                            <td style={s.tdMuted}>{res.examName}</td>
                                            <td style={{ ...s.td, textAlign: 'center', fontWeight: 700, fontSize: 12 }}>{sd.totalObtained || res.score || '—'}/{sd.totalMax || 100}</td>
                                            <td style={{ ...s.td, textAlign: 'center', fontWeight: 800, color: '#4361EE', fontSize: 14 }}>{res.processedPercentage ? `${res.processedPercentage.toFixed(2)}%` : 'N/A'}</td>
                                            <td style={{ ...s.td, textAlign: 'center' }}>
                                                <span style={{ ...s.remarkPill, background: rm.bg, color: rm.color }}>{sd.remarks || 'N/A'}</span>
                                            </td>
                                            <td style={{ ...s.td, textAlign: 'right', fontSize: 11, color: '#8B8FA8' }}>
                                                {res.publishedAt ? new Date(res.publishedAt).toLocaleDateString() : 'N/A'}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    {!isDashboard && totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
                </div>
            ) : (
                <>
                    <div style={s.cardGrid}>
                        {sortedResults.map((res, idx) => {
                            const sd = res.scoreData;
                            const rm = REMARK_STYLES[sd.remarks] || REMARK_STYLES.Fail;
                            const isTop = isRankingsMode && idx < 3 && page === 0;
                            return (
                                <motion.div key={res.id || idx} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                    style={{ ...s.resultCard, ...(isTop ? s.resultCardTop : {}) }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                                        <div style={s.avatar}>{res.studentName?.charAt(0) || '?'}</div>
                                        {getRankIcon(idx)}
                                    </div>
                                    <p style={{ fontSize: 13, fontWeight: 700, color: '#1A1D2E', margin: '0 0 2px' }}>{res.studentName || `Application #${res.applicationId}`}</p>
                                    <p style={{ fontSize: 10, color: '#8B8FA8', margin: '0 0 14px' }}>#{res.applicationId} · {res.examName}</p>
                                    <div style={s.scoreBox}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
                                            <span style={{ fontSize: 24, fontWeight: 800, color: '#4361EE' }}>{res.processedPercentage ? `${res.processedPercentage.toFixed(2)}%` : 'N/A'}</span>
                                            <span style={{ fontSize: 11, color: '#8B8FA8', fontWeight: 600 }}>{sd.totalObtained || '—'}/{sd.totalMax || 100}</span>
                                        </div>
                                        <span style={{ ...s.remarkPill, background: rm.bg, color: rm.color }}>{sd.remarks || 'N/A'}</span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                    {!isDashboard && totalPages > 1 && <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />}
                </>
            )}

            {isLedgerOpen && (
                <ResultLedger
                    results={ledgerResults}
                    onClose={() => setIsLedgerOpen(false)}
                    filters={{
                        exam: exams.find(e => e.examNo.toString() === filterExam)?.exam_name,
                        region: regions.find(r => r.regionId.toString() === filterRegion)?.regionName,
                        centre: centres.find(c => c.centreId.toString() === filterCentre)?.centreName,
                        school: schools.find(s => s.schoolId.toString() === filterSchool)?.schoolName,
                    }}
                />
            )}
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default ResultViewer;

const s = {
    page: { display: 'flex', flexDirection: 'column', gap: 14, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    card: { background: '#fff', borderRadius: 14, padding: '20px 22px', border: '0.5px solid #E8EAF0' },
    cardTitle: { fontSize: 13, fontWeight: 700, color: '#1A1D2E', margin: 0 },
    cardSub: { fontSize: 11, color: '#8B8FA8', margin: '3px 0 0' },
    sectionHdr: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8B8FA8', margin: 0 },
    label: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#8B8FA8' },
    select: { padding: '8px 11px', fontSize: 13, color: '#1A1D2E', border: '0.5px solid #E8EAF0', borderRadius: 8, outline: 'none', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: '#fff', width: '100%', boxSizing: 'border-box' },
    filterGrid: { display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 },
    segmented: { display: 'flex', background: '#F0F1F7', borderRadius: 8, padding: 3, gap: 2 },
    segBtn: { padding: '5px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', background: 'transparent', border: 'none', borderRadius: 6, cursor: 'pointer', color: '#8B8FA8', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    segBtnActive: { background: '#fff', color: '#4361EE', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' },
    clearBtn: { display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700, color: '#F03E3E', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    printBtn: { display: 'flex', alignItems: 'center', gap: 6, padding: '7px 14px', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff', background: '#1A1D2E', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    countChip: { padding: '8px 14px', background: '#4361EE', color: '#fff', borderRadius: 8, fontSize: 11, fontWeight: 700, textAlign: 'center' },
    insightBtn: { padding: '4px 12px', fontSize: 10, fontWeight: 600, borderRadius: 20, border: '0.5px solid #E8EAF0', background: '#fff', color: '#3D405B', cursor: 'pointer', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    insightBtnActive: { background: '#EEF3FF', color: '#4361EE', borderColor: '#C5D0FF' },
    rangeInput: { width: 52, padding: '4px 6px', fontSize: 11, border: '0.5px solid #E8EAF0', borderRadius: 6, outline: 'none', textAlign: 'center', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: '#fff' },
    applyBtn: { padding: '4px 10px', fontSize: 10, fontWeight: 700, background: '#4361EE', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    thead: { background: '#FAFBFF' },
    th: { padding: '10px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#8B8FA8', borderBottom: '0.5px solid #E8EAF0', textAlign: 'left', whiteSpace: 'nowrap' },
    tr: { borderBottom: '0.5px solid #F0F1F7' },
    td: { padding: '11px 14px', color: '#1A1D2E' },
    tdCode: { padding: '11px 14px', fontSize: 12, fontWeight: 700, color: '#4361EE', fontFamily: 'monospace' },
    tdMain: { padding: '11px 14px', fontSize: 13, fontWeight: 500, color: '#1A1D2E' },
    tdMuted: { padding: '11px 14px', fontSize: 12, color: '#8B8FA8' },
    avatar: { width: 30, height: 30, borderRadius: 8, background: '#EEF3FF', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#4361EE', flexShrink: 0 },
    remarkPill: { fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 20, whiteSpace: 'nowrap' },
    cardGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 },
    resultCard: { background: '#fff', borderRadius: 14, padding: '18px 20px', border: '0.5px solid #E8EAF0' },
    resultCardTop: { border: '0.5px solid #C5D0FF', background: '#FAFBFF' },
    scoreBox: { background: '#FAFBFF', borderRadius: 10, padding: '12px 14px', border: '0.5px solid #E8EAF0' },
    emptyText: { fontSize: 13, color: '#B0B3C6', fontStyle: 'italic' },
};