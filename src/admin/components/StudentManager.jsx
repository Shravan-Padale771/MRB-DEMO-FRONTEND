import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Users, Filter, XCircle, ChevronLeft, ChevronRight, Search, Printer, LayoutGrid, List, Settings2, UserCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import StudentLedger from './StudentLedger';
import { getAllRegions, getAllExamCentres, getStudents, getAllSchools } from '../../api';

const StudentManager = ({ isDashboard = false }) => {
    const navigate = useNavigate();
    // Filter State
    const [filterRegion, setFilterRegion] = useState("");
    const [filterCentre, setFilterCentre] = useState("");
    const [filterSchool, setFilterSchool] = useState("");
    const [filterFirstName, setFilterFirstName] = useState("");
    const [filterLastName, setFilterLastName] = useState("");
    const [filterStudentId, setFilterStudentId] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(isDashboard ? 5 : 12);
    const [viewMode, setViewMode] = useState("table");
    const [isLedgerOpen, setIsLedgerOpen] = useState(false);

    // Metadata Queries
    const { data: regions = [] } = useQuery({ queryKey: ['regions'], queryFn: getAllRegions });
    const { data: centres = [] } = useQuery({ queryKey: ['examCentres'], queryFn: getAllExamCentres });
    const { data: allSchools = [] } = useQuery({ queryKey: ['schools'], queryFn: getAllSchools });

    // API Query for Students
    const { data: studentsData, isLoading } = useQuery({
        queryKey: ['students', filterSchool, filterFirstName, filterLastName, filterStudentId, page, size],
        queryFn: () => getStudents({
            schoolId: filterSchool || undefined,
            firstName: filterFirstName || undefined,
            lastName: filterLastName || undefined,
            studentId: filterStudentId || undefined,
            page,
            size,
            sort: 'studentId,desc'
        }),
        keepPreviousData: true
    });

    // Special Query for All Students (for Printing)
    const { data: allStudentsData } = useQuery({
        queryKey: ['studentsAll', filterSchool, filterFirstName, filterLastName, filterStudentId],
        queryFn: () => getStudents({
            schoolId: filterSchool || undefined,
            firstName: filterFirstName || undefined,
            lastName: filterLastName || undefined,
            studentId: filterStudentId || undefined,
            size: 2000,
            page: 0
        }),
        enabled: isLedgerOpen
    });

    const ledgerStudents = allStudentsData?.content || [];
    const students = studentsData?.content || [];
    const totalPages = studentsData?.totalPages || 0;

    // Derived states for filter options
    const availableCentres = useMemo(() => {
        if (!filterRegion) return centres;
        return centres.filter(c => c.regionId?.toString() === filterRegion);
    }, [filterRegion, centres]);

    const availableSchools = useMemo(() => {
        if (!filterCentre) return allSchools;
        return allSchools.filter(s => s.centreId?.toString() === filterCentre);
    }, [filterCentre, allSchools]);

    const clearFilters = () => {
        setFilterRegion("");
        setFilterCentre("");
        setFilterSchool("");
        setFilterFirstName("");
        setFilterLastName("");
        setFilterStudentId("");
        setPage(0);
    };

    if (isLoading && !studentsData) {
        return <div className="p-8 text-center text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Student Directory...</div>;
    }

    return (
        <div className={`space-y-6 ${isDashboard ? '' : 'animate-in fade-in duration-500'}`}>
            {!isDashboard ? (
                <div className={`bg-white p-8 rounded-xl shadow-lg border-t-4 border-[#4c84ff]`}>
                    <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 flex items-center gap-3">
                                <Users size={28} className="text-[#4c84ff]" /> Student Directory
                            </h2>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1">
                                Manage and View Enrolled Students
                            </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                            {/* View Mode Toggle */}
                            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl border border-gray-200">
                                <button
                                    onClick={() => setViewMode("table")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "table" ? "bg-white text-[#4c84ff] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                    title="Table View (Excel Style)"
                                >
                                    <List size={18} />
                                </button>
                                <button
                                    onClick={() => setViewMode("card")}
                                    className={`p-2 rounded-lg transition-all ${viewMode === "card" ? "bg-white text-[#4c84ff] shadow-sm" : "text-gray-400 hover:text-gray-600"}`}
                                    title="Grid View"
                                >
                                    <LayoutGrid size={18} />
                                </button>
                            </div>

                            <button
                                onClick={() => setIsLedgerOpen(true)}
                                className="bg-[#1b223c] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#252d4a] transition-all shadow-lg hover:shadow-blue-500/10 ml-auto lg:ml-0"
                            >
                                <Printer size={16} /> Print Directory
                            </button>
                        </div>
                    </div>

                    {/* Filter Bar */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3 mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-100">
                        <div className="col-span-full flex justify-between items-center mb-2">
                            <h4 className="text-[10px] font-black text-[#4c84ff] uppercase tracking-[0.2em] flex items-center gap-2">
                                <Filter size={12} /> Filter Students
                            </h4>
                            {(filterRegion || filterCentre || filterSchool || filterFirstName || filterLastName || filterStudentId) && (
                                <button onClick={clearFilters} className="text-[10px] font-black text-red-500 uppercase flex items-center gap-1 hover:underline">
                                    <XCircle size={12} /> Reset
                                </button>
                            )}
                        </div>
                        <div>
                            <select
                                className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
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
                                className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
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
                                className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
                                value={filterSchool}
                                onChange={(e) => { setFilterSchool(e.target.value); setPage(0); }}
                            >
                                <option value="">All Schools</option>
                                {availableSchools.map(s => (
                                    <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                                ))}
                            </select>
                        </div>
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Student ID"
                                className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm pl-8"
                                value={filterStudentId}
                                onChange={(e) => { setFilterStudentId(e.target.value); setPage(0); }}
                            />
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
                        </div>
                        <div className="lg:col-span-2">
                            <div className="grid grid-cols-2 gap-2">
                                <input
                                    type="text"
                                    placeholder="First Name"
                                    className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
                                    value={filterFirstName}
                                    onChange={(e) => { setFilterFirstName(e.target.value); setPage(0); }}
                                />
                                <input
                                    type="text"
                                    placeholder="Last Name"
                                    className="w-full text-[11px] p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-[#4c84ff] font-bold text-slate-700 shadow-sm"
                                    value={filterLastName}
                                    onChange={(e) => { setFilterLastName(e.target.value); setPage(0); }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 border-t border-gray-100 pt-8">
                        {students.length === 0 ? (
                            <div className="text-center p-16 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <Users className="mx-auto text-gray-200 mb-4" size={64} />
                                <p className="text-gray-400 font-bold italic text-lg">No students found matching filters</p>
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
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student ID</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Full Name</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">School Name</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Age</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Language</th>
                                                        <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-gray-50 text-sm">
                                                    {students.map((st) => (
                                                        <tr key={st.studentId} className="hover:bg-blue-50/20 transition-colors group">
                                                            <td className="px-6 py-4 font-black text-xs text-[#4c84ff]">#{st.studentId}</td>
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center font-black text-[10px] text-gray-500 group-hover:bg-[#4c84ff] group-hover:text-white transition-all">
                                                                        {st.firstName?.charAt(0) || "?"}
                                                                    </div>
                                                                    <div className="flex flex-col">
                                                                        <span className="font-bold text-gray-900 group-hover:text-[#4c84ff] transition-colors line-clamp-1">
                                                                            {st.firstName} {st.lastName}
                                                                        </span>
                                                                        <span className="text-[9px] text-gray-400 font-bold uppercase tracking-widest line-clamp-1">{st.contact || "No Contact"}</span>
                                                                    </div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className="text-xs font-bold text-gray-600 truncate max-w-[200px] block">
                                                                    {st.schoolName || "Private Candidate"}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-center font-black text-gray-500 text-xs">{st.age}</td>
                                                            <td className="px-6 py-4 text-center">
                                                                <span className="text-[9px] font-black px-2 py-0.5 bg-gray-50 text-gray-500 border border-gray-100 rounded-full uppercase tracking-widest">{st.motherTongue}</span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <button
                                                                    onClick={() => navigate(`/admin/manage/student/${st.studentId}`)}
                                                                    className="p-2 rounded-lg bg-gray-50 text-gray-400 hover:bg-[#4c84ff] hover:text-white transition-all shadow-sm"
                                                                >
                                                                    <Settings2 size={16} />
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
                                        {students.map((st) => (
                                            <motion.div
                                                key={st.studentId}
                                                initial={{ opacity: 0, y: 20 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="relative p-6 bg-white rounded-2xl border-2 border-gray-100 hover:border-[#4c84ff] hover:shadow-xl transition-all group cursor-pointer"
                                                onClick={() => navigate(`/admin/manage/student/${st.studentId}`)}
                                            >
                                                <div className="flex justify-between items-start mb-4 relative z-10">
                                                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center font-black text-xl text-[#4c84ff] shadow-sm border border-blue-100 group-hover:bg-[#4c84ff] group-hover:text-white transition-all">
                                                        {st.firstName?.charAt(0) || "?"}
                                                    </div>
                                                    <div className="bg-emerald-50 p-1.5 rounded-lg">
                                                        <UserCheck className="text-emerald-500" size={16} />
                                                    </div>
                                                </div>
                                                <h4 className="font-black text-gray-900 group-hover:text-[#4c84ff] transition-colors truncate">
                                                    {st.firstName} {st.lastName}
                                                </h4>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                                    Student ID: #{st.studentId}
                                                </p>

                                                <div className="mt-4 pt-4 border-t border-gray-50 space-y-2">
                                                    <div className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                                        <span className="text-blue-400 opacity-50">🏫</span>
                                                        <span className="truncate">{st.schoolName || "Private Candidate"}</span>
                                                    </div>
                                                    <div className="flex items-center justify-between mt-4">
                                                        <span className="text-[9px] font-black px-3 py-1 bg-gray-50 text-gray-400 rounded-full border border-gray-100 uppercase tracking-widest">{st.motherTongue || "Hindi"}</span>
                                                        <Settings2 className="text-gray-300 group-hover:text-[#4c84ff] transition-all" size={16} />
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </div>
                                )}

                                {totalPages > 1 && (
                                    <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-6">
                                        <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                            Page {page + 1} of {totalPages}
                                        </span>
                                        <div className="flex gap-2">
                                            <button
                                                disabled={page === 0}
                                                onClick={() => setPage(p => p - 1)}
                                                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <button
                                                disabled={page >= totalPages - 1}
                                                onClick={() => setPage(p => p + 1)}
                                                className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all font-bold"
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
            ) : (
                <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                    {students.length === 0 ? (
                        <div className="text-center p-8 text-gray-400 italic font-bold">No recent students</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-gray-50/50 border-b border-gray-100">
                                    <tr>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">ID</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">Student Name</th>
                                        <th className="px-6 py-3 text-[9px] font-black text-gray-400 uppercase tracking-widest">School</th>
                                        <th className="px-6 py-3 text-right"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-50 text-sm">
                                    {students.map((st) => (
                                        <tr key={st.studentId} className="hover:bg-blue-50/20 cursor-pointer" onClick={() => navigate(`/admin/manage/student/${st.studentId}`)}>
                                            <td className="px-6 py-4 font-black text-xs text-[#4c84ff]">#{st.studentId}</td>
                                            <td className="px-6 py-4 font-bold text-gray-900 line-clamp-1">{st.firstName} {st.lastName}</td>
                                            <td className="px-6 py-4 text-xs font-bold text-gray-500 truncate max-w-[150px]">{st.schoolName || "Self"}</td>
                                            <td className="px-6 py-4 text-right">
                                                <Settings2 size={14} className="ml-auto text-gray-300" />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

            {isLedgerOpen && (
                <StudentLedger
                    students={ledgerStudents}
                    filters={{
                        region: regions.find(r => r.regionId.toString() === filterRegion)?.regionName,
                        centre: centres.find(c => c.centreId.toString() === filterCentre)?.centreName,
                        school: allSchools.find(s => s.schoolId.toString() === filterSchool)?.schoolName,
                    }}
                    onClose={() => setIsLedgerOpen(false)}
                />
            )}
        </div>
    );
};

export default StudentManager;
