import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, Filter, XCircle, Search, Printer, List, LayoutGrid, Award, ArrowRight, CheckCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import ApplicationLedger from './ApplicationLedger';
import { getAllExams, getAllRegions, getAllExamCentres, getAllSchools, getExamApplications } from '../../api';

const ApplicationManager = ({ isDashboard = false, onPublishWithFilters, selectApplication }) => {
    // Filter State
    const [filterExam, setFilterExam] = useState("");
    const [filterRegion, setFilterRegion] = useState("");
    const [filterCentre, setFilterCentre] = useState("");
    const [filterSchool, setFilterSchool] = useState("");
    const [filterStatus, setFilterStatus] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(isDashboard ? 5 : 12);
    const [viewMode, setViewMode] = useState("table");
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);

    // Queries
    const { data: exams = [] } = useQuery({ queryKey: ['exams'], queryFn: getAllExams });
    const { data: regions = [] } = useQuery({ queryKey: ['regions'], queryFn: getAllRegions });
    const { data: centres = [] } = useQuery({ queryKey: ['examCentres'], queryFn: getAllExamCentres });
    const { data: schools = [] } = useQuery({ queryKey: ['schools'], queryFn: getAllSchools });

    const { data: applicationsData, isLoading } = useQuery({
        queryKey: ['applications', filterExam, filterRegion, filterCentre, filterSchool, filterStatus, page, size],
        queryFn: () => getExamApplications({
            examNo: filterExam || undefined,
            regionId: filterRegion || undefined,
            examCentre: filterCentre || undefined,
            schoolId: filterSchool || undefined,
            status: filterStatus || undefined,
            page,
            size,
            sort: 'applicationId,desc'
        }),
        keepPreviousData: true
    });

    const { data: allApplicationsData } = useQuery({
        queryKey: ['applicationsPrint', filterExam, filterRegion, filterCentre, filterSchool, filterStatus],
        queryFn: () => getExamApplications({
            examNo: filterExam || undefined,
            regionId: filterRegion || undefined,
            examCentre: filterCentre || undefined,
            schoolId: filterSchool || undefined,
            status: filterStatus || undefined,
            size: 2000,
            page: 0
        }),
        enabled: isLedgerOpen
    });

    const applications = applicationsData?.content || [];
    const totalPages = applicationsData?.totalPages || 0;
    const ledgerApplications = allApplicationsData?.content || [];

    // Cascading Logic
    const availableCentres = useMemo(() => {
        if (!filterRegion) return centres;
        return centres.filter(c => c.regionId?.toString() === filterRegion);
    }, [filterRegion, centres]);

    const availableSchools = useMemo(() => {
        if (!filterCentre) return schools;
        return schools.filter(s => s.centreId?.toString() === filterCentre);
    }, [filterCentre, schools]);

    const clearFilters = () => {
        setFilterExam("");
        setFilterRegion("");
        setFilterCentre("");
        setFilterSchool("");
        setFilterStatus("");
        setPage(0);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'SUBMITTED': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    if (isLoading && !applicationsData) {
        return <div className="p-8 text-center text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Applications...</div>;
    }

    return (
        <div className={`space-y-6 ${isDashboard ? '' : 'animate-in fade-in duration-500'}`}>
            {!isDashboard ? (
                <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-[#4c84ff]">
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                <FileText size={28} className="text-[#4c84ff]" /> Student Applications
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                                Manage and Review Exam Applications
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-[#4c84ff] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                    title="Table View"
                                >
                                    <List size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode("card")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-white text-[#4c84ff] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                    title="Card View"
                                >
                                    <LayoutGrid size={18} />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsLedgerOpen(true)}
                                className="bg-[#1b223c] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#252d4a] transition-all"
                            >
                                <Printer size={16} /> Print List
                            </button>

                            <button
                                onClick={() => onPublishWithFilters({
                                    region: filterRegion,
                                    centre: filterCentre,
                                    school: filterSchool,
                                    status: filterStatus,
                                    exam: filterExam
                                })}
                                className="bg-[#4c84ff] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-blue-600 transition-all shadow-lg shadow-blue-500/20"
                            >
                                <Award size={16} /> Publish Results
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="col-span-full flex justify-between items-center mb-2">
                            <h4 className="text-[10px] font-black text-[#4c84ff] uppercase tracking-[0.2em] flex items-center gap-2">
                                <Filter size={12} /> Filter Applications
                            </h4>
                            <div className="flex items-center gap-4">
                                <div className="flex items-center justify-center px-4 py-1.5 bg-[#4c84ff] rounded-lg text-white font-black text-[9px] uppercase tracking-widest shadow-md">
                                    <Search size={10} className="mr-2" /> {applicationsData?.totalElements || 0} Found
                                </div>
                                {(filterRegion || filterCentre || filterSchool || filterStatus || filterExam) && (
                                    <button onClick={clearFilters} className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 hover:underline">
                                        <XCircle size={12} /> Reset
                                    </button>
                                )}
                            </div>
                        </div>
                        <select
                            className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
                            value={filterExam}
                            onChange={(e) => { setFilterExam(e.target.value); setPage(0); }}
                        >
                            <option value="">All Exams</option>
                            {exams.map(ex => (
                                <option key={ex.examNo} value={ex.examNo}>{ex.exam_name}</option>
                            ))}
                        </select>
                        <select
                            className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
                            value={filterRegion}
                            onChange={(e) => { setFilterRegion(e.target.value); setFilterCentre(""); setFilterSchool(""); setPage(0); }}
                        >
                            <option value="">All Regions</option>
                            {regions.map(r => (
                                <option key={r.regionId} value={r.regionId}>{r.regionName}</option>
                            ))}
                        </select>
                        <select
                            className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
                            value={filterCentre}
                            onChange={(e) => { setFilterCentre(e.target.value); setFilterSchool(""); setPage(0); }}
                        >
                            <option value="">All Centres</option>
                            {availableCentres.map(c => (
                                <option key={c.centreId} value={c.centreId}>{c.centreName}</option>
                            ))}
                        </select>
                        <select
                            className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
                            value={filterSchool}
                            onChange={(e) => { setFilterSchool(e.target.value); setPage(0); }}
                        >
                            <option value="">All Schools</option>
                            {availableSchools.map(s => (
                                <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                            ))}
                        </select>
                        <select
                            className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
                            value={filterStatus}
                            onChange={(e) => { setFilterStatus(e.target.value); setPage(0); }}
                        >
                            <option value="">All Statuses</option>
                            <option value="SUBMITTED">SUBMITTED</option>
                            <option value="APPROVED">APPROVED</option>
                            <option value="REJECTED">REJECTED</option>
                            <option value="PENDING">PENDING</option>
                            <option value="APPLIED">APPLIED</option>
                        </select>
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-8">
                        {applications.length === 0 ? (
                            <div className="text-center p-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <FileText className="mx-auto text-gray-200 mb-4" size={64} />
                                <p className="text-gray-400 font-bold italic text-lg">No applications found</p>
                                <button onClick={clearFilters} className="mt-4 text-[#4c84ff] font-black text-xs uppercase tracking-widest hover:underline">Load All</button>
                            </div>
                        ) : (
                            <>
                                {viewMode === "table" ? (
                                    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-left border-collapse">
                                                <thead>
                                                    <tr className="bg-gray-50/50 border-b border-gray-100 text-sm">
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">App ID</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student ID</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Exam Name</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 text-sm">
                                                    {applications.map((app) => (
                                                        <tr key={app.applicationId} className="hover:bg-blue-50/20 transition-colors group cursor-pointer" onClick={() => selectApplication(app)}>
                                                            <td className="px-6 py-4 font-black text-xs text-[#4c84ff]">#{app.applicationId}</td>
                                                            <td className="px-6 py-4 font-bold text-gray-400 text-xs">{app.studentId}</td>
                                                            <td className="px-6 py-4 font-bold text-gray-900 truncate max-w-[200px]">{app.studentName}</td>
                                                            <td className="px-6 py-4 font-bold text-gray-600 text-xs">{app.examName}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className={`text-[10px] font-black px-3 py-1 rounded-full border shadow-sm uppercase tracking-tighter ${getStatusStyle(app.status)}`}>
                                                                    {app.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <ArrowRight size={16} className="ml-auto text-gray-200 group-hover:text-[#4c84ff] transition-colors" />
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                        {applications.map((app) => (
                                            <motion.div key={app.applicationId} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#4c84ff] hover:shadow-xl transition-all group cursor-pointer" onClick={() => selectApplication(app)}>
                                                <div className="flex justify-between items-start mb-4">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center font-black text-[#4c84ff] shadow-sm border border-blue-100 group-hover:bg-[#4c84ff] group-hover:text-white transition-all">
                                                        {app.studentName?.charAt(0) || "?"}
                                                    </div>
                                                </div>
                                                <h4 className="font-black text-gray-900 group-hover:text-[#4c84ff] transition-colors truncate">{app.studentName}</h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">App: #{app.applicationId} • SID: {app.studentId}</p>
                                                <p className="text-[10px] text-[#4c84ff] font-black uppercase tracking-widest mt-3 bg-blue-50 w-fit px-2 py-0.5 rounded truncate max-w-full">{app.examName}</p>
                                                <div className="mt-4 pt-4 border-t border-gray-50 flex items-center justify-between">
                                                    <span className={`text-[9px] font-black px-3 py-1 rounded-full border shadow-sm uppercase tracking-widest ${getStatusStyle(app.status)}`}>{app.status}</span>
                                                    <ArrowRight size={16} className="text-gray-300 group-hover:text-[#4c84ff] transition-all transform group-hover:translate-x-1" />
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}
                                {totalPages > 1 && (
                                    <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Page {page + 1} of {totalPages}</span>
                                        <div className="flex gap-2">
                                            <button disabled={page === 0} onClick={() => setPage(p => p - 1)} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronLeft size={18} /></button>
                                            <button disabled={page >= totalPages - 1} onClick={() => setPage(p => p + 1)} className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all"><ChevronRight size={18} /></button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    {applications.length === 0 ? (
                        <div className="text-center p-8 text-gray-400 italic font-bold">No recent applications</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">App ID</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Exam</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                        <th className="px-6 py-3 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {applications.map((app) => (
                                        <tr key={app.applicationId} className="hover:bg-blue-50/20 cursor-pointer" onClick={() => selectApplication(app)}>
                                            <td className="px-6 py-4 font-black text-xs text-[#4c84ff]">#{app.applicationId}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900">{app.studentName}</td>
                                            <td className="px-6 py-4 font-bold text-gray-600 text-[10px] uppercase truncate max-w-[150px]">{app.examName}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={`text-[9px] font-black px-2 py-0.5 rounded-full border shadow-sm uppercase tracking-tighter ${getStatusStyle(app.status)}`}>{app.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-right"><ArrowRight size={14} className="ml-auto text-gray-300" /></td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {isLedgerOpen && (
                <ApplicationLedger
                    applications={ledgerApplications}
                    filters={{
                        region: regions.find(r => r.regionId.toString() === filterRegion)?.regionName,
                        centre: centres.find(c => c.centreId.toString() === filterCentre)?.centreName,
                        school: schools.find(s => s.schoolId.toString() === filterSchool)?.schoolName,
                        status: filterStatus,
                        exam: exams.find(e => e.examNo.toString() === filterExam)?.exam_name
                    }}
                    onClose={() => setIsLedgerOpen(false)}
                />
            )}
        </div>
    );
};

export default ApplicationManager;
