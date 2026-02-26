import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { FileText, AlertTriangle, Filter, XCircle, ChevronLeft, ChevronRight, ArrowRight, Award } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllRegions, getAllExamCentres, getAllSchools, getExamApplications } from '../../api';

const ApplicationManager = ({
    selectApplication,
    onPublishWithFilters,
    activeFilters = {},
    isDashboard = false
}) => {
    // Filter State
    const [filterRegion, setFilterRegion] = useState(activeFilters.region || "");
    const [filterCentre, setFilterCentre] = useState(activeFilters.centre || "");
    const [filterSchool, setFilterSchool] = useState(activeFilters.school || "");
    const [filterStatus, setFilterStatus] = useState(activeFilters.status || "");
    const [page, setPage] = useState(0);
    const [size] = useState(isDashboard ? 5 : 10);

    // Metadata Queries
    const { data: regions = [] } = useQuery({ queryKey: ['regions'], queryFn: getAllRegions });
    const { data: centres = [] } = useQuery({ queryKey: ['examCentres'], queryFn: getAllExamCentres });
    const { data: schools = [] } = useQuery({ queryKey: ['schools'], queryFn: getAllSchools });

    // API Query for Applications
    const { data: applicationsData, isLoading } = useQuery({
        queryKey: ['examApplications', filterRegion, filterCentre, filterSchool, filterStatus, page, size],
        queryFn: () => getExamApplications({
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

    const applications = applicationsData?.content || [];
    const totalPages = applicationsData?.totalPages || 0;

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
        setFilterStatus("");
        setPage(0);
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPLIED': return 'bg-blue-50 text-blue-600 border-blue-100';
            case 'APPROVED': return 'bg-green-50 text-green-600 border-green-100';
            case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
            default: return 'bg-gray-50 text-gray-600 border-gray-100';
        }
    };

    if (isLoading && !applicationsData) {
        return <div className="p-8 text-center text-gray-500 font-bold animate-pulse">Loading Applications...</div>;
    }

    return (
        <div className={`bg-white ${isDashboard ? '' : 'p-6 rounded-xl shadow-md border border-gray-100'}`}>
            {!isDashboard && (
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div className="flex items-center gap-3">
                        <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                            <FileText size={24} /> Student Applications
                        </h2>

                        <button
                            onClick={() => onPublishWithFilters({
                                region: filterRegion,
                                centre: filterCentre,
                                school: filterSchool,
                                status: filterStatus
                            })}
                            className="bg-indigo-600 text-white text-[10px] font-black px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 uppercase tracking-widest"
                        >
                            <Award size={14} /> Publish Results
                        </button>
                    </div>

                    {(filterRegion || filterCentre || filterSchool || filterStatus) && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-red-500 font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                        >
                            <XCircle size={14} /> Clear All Filters
                        </button>
                    )}
                </div>
            )}

            {/* Filter Bar */}
            {
                !isDashboard && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block tracking-widest">Region</label>
                            <select
                                className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
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
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block tracking-widest">Centre</label>
                            <select
                                className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
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
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block tracking-widest">School</label>
                            <select
                                className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
                                value={filterSchool}
                                onChange={(e) => {
                                    setFilterSchool(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="">All Schools</option>
                                {availableSchools.map(s => (
                                    <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block tracking-widest">Status</label>
                            <select
                                className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
                                value={filterStatus}
                                onChange={(e) => {
                                    setFilterStatus(e.target.value);
                                    setPage(0);
                                }}
                            >
                                <option value="">All Statuses</option>
                                <option value="SUBMITTED">SUBMITTED</option>
                                <option value="APPROVED">APPROVED</option>
                                <option value="REJECTED">REJECTED</option>
                            </select>
                        </div>
                    </div>
                )
            }

            {
                applications.length === 0 ? (
                    <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                        <AlertTriangle
                            className="mx-auto text-gray-300 mb-4"
                            size={48}
                        />
                        <p className="text-gray-500 font-bold italic">
                            No applications match your filtering criteria
                        </p>
                        {!isDashboard && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-indigo-600 text-sm font-black uppercase tracking-widest hover:underline"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto custom-scrollbar">
                            <table className="w-full border-separate border-spacing-0">
                                <thead>
                                    <tr className="bg-gray-50">
                                        <th className="p-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider border-b">Student</th>
                                        <th className="p-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider border-b">Exam</th>
                                        <th className="p-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider border-b">School</th>
                                        <th className="p-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider border-b">Status</th>
                                        <th className="p-4 text-center text-[11px] font-black text-gray-400 uppercase tracking-wider border-b">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {applications.map((app) => (
                                        <motion.tr
                                            key={app.applicationId}
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            className="border-b last:border-0 hover:bg-amber-50/30 transition-colors group cursor-pointer"
                                            onClick={() => selectApplication(app)}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center font-black text-amber-700 shadow-sm border border-amber-200">
                                                        {app.studentName?.charAt(0) || "?"}
                                                    </div>
                                                    <div>
                                                        <h4 className="font-bold text-gray-900 group-hover:text-amber-700 transition-colors">
                                                            {app.studentName || "Unknown Student"}
                                                        </h4>
                                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">ID: #{app.applicationId}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-gray-700">{app.examName}</span>
                                                    <div className="flex items-center gap-2 mt-1">
                                                        <span className="text-[10px] font-black px-1.5 py-0.5 bg-indigo-50 text-indigo-600 rounded uppercase border border-indigo-100">
                                                            {app.centreName || "Common Centre"}
                                                        </span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-gray-500">{app.schoolName || "Self Study"}</span>
                                                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-tighter">Registered School</span>
                                                </div>
                                            </td>
                                            <td className="p-4">
                                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-sm ${getStatusStyle(app.status)}`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td className="p-4 text-center">
                                                <button className="p-2 hover:bg-amber-100 rounded-lg text-amber-600 transition-all opacity-0 group-hover:opacity-100">
                                                    <ArrowRight size={18} />
                                                </button>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {!isDashboard && totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between border-t pt-6">
                                <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page === 0}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        disabled={page >= totalPages - 1}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-2 rounded-lg border hover:bg-gray-50 disabled:opacity-50 transition-colors"
                                    >
                                        <ChevronRight size={16} />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )
            }
        </div >
    );
};

export default ApplicationManager;
