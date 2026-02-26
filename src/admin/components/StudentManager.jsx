import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Filter, XCircle, ChevronLeft, ChevronRight, RefreshCw, Settings2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getAllRegions, getAllExamCentres, getStudents, getAllSchools } from '../../api';

const StudentManager = ({
    studentForm,
    setStudentForm,
    handleCreateStudent,
    schools = []
}) => {
    const navigate = useNavigate();
    // Filter State
    const [filterRegion, setFilterRegion] = useState("");
    const [filterCentre, setFilterCentre] = useState("");
    const [filterSchool, setFilterSchool] = useState("");
    const [filterFirstName, setFilterFirstName] = useState("");
    const [filterLastName, setFilterLastName] = useState("");
    const [filterStudentId, setFilterStudentId] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(10);

    // Metadata Queries
    const { data: regions = [] } = useQuery({ queryKey: ['regions'], queryFn: getAllRegions });
    const { data: centres = [] } = useQuery({ queryKey: ['examCentres'], queryFn: getAllExamCentres });
    const { data: allSchools = [] } = useQuery({ queryKey: ['schools'], queryFn: getAllSchools });

    // API Query for Students
    const { data: studentsData, isLoading: isLoadingStudents, refetch: refetchStudents } = useQuery({
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

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-indigo-600 h-fit">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <Plus size={24} /> Add Student
                </h2>
                <form onSubmit={handleCreateStudent} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            required
                            placeholder="e.g. Raj Kumar"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={studentForm.username}
                            onChange={(e) =>
                                setStudentForm({
                                    ...studentForm,
                                    username: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            required
                            type="password"
                            placeholder="Enter password"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={studentForm.password}
                            onChange={(e) =>
                                setStudentForm({
                                    ...studentForm,
                                    password: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Select School
                        </label>
                        <select
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                            value={studentForm.schoolId}
                            onChange={(e) =>
                                setStudentForm({
                                    ...studentForm,
                                    schoolId: e.target.value,
                                })
                            }
                        >
                            <option value="">Choose a school</option>
                            {allSchools.map(school => (
                                <option key={school.schoolId} value={school.schoolId}>
                                    {school.schoolName}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button className="w-full bg-indigo-600 text-white font-bold p-3 rounded-lg hover:bg-indigo-700 transition-colors shadow-lg">
                        Add Student
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users size={24} /> All Students
                    </h2>
                    <div className="flex items-center gap-2">
                        {(filterRegion || filterCentre || filterSchool || filterFirstName || filterLastName || filterStudentId) && (
                            <button
                                onClick={clearFilters}
                                className="text-xs text-red-500 font-bold flex items-center gap-1 hover:text-red-700"
                            >
                                <XCircle size={14} /> Clear
                            </button>
                        )}
                        <button onClick={() => refetchStudents()} className="p-1.5 text-gray-400 hover:text-indigo-600 transition-colors">
                            <RefreshCw size={18} className={isLoadingStudents ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                {/* Filter Controls */}
                <div className="space-y-3 mb-6">
                    {/* Dropdown Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100">
                        <div>
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-1 flex items-center gap-1">
                                <Filter size={10} /> Region
                            </label>
                            <select
                                className="w-full text-xs p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
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
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-1 flex items-center gap-1">
                                <Filter size={10} /> Centre
                            </label>
                            <select
                                className="w-full text-xs p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
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
                            <label className="text-[10px] font-black text-gray-400 uppercase mb-1 flex items-center gap-1">
                                <Filter size={10} /> School
                            </label>
                            <select
                                className="w-full text-xs p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                value={filterSchool}
                                onChange={(e) => { setFilterSchool(e.target.value); setPage(0); }}
                            >
                                <option value="">All Schools</option>
                                {availableSchools.map(s => (
                                    <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Text Input Filters */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-4 bg-indigo-50 rounded-xl border border-indigo-100">
                        <div>
                            <label className="text-[10px] font-black text-indigo-600 uppercase mb-1 flex items-center gap-1">
                                <Filter size={10} /> First Name
                            </label>
                            <input
                                type="text"
                                placeholder="Search by first name..."
                                className="w-full text-xs p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                value={filterFirstName}
                                onChange={(e) => { setFilterFirstName(e.target.value); setPage(0); }}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-indigo-600 uppercase mb-1 flex items-center gap-1">
                                <Filter size={10} /> Last Name
                            </label>
                            <input
                                type="text"
                                placeholder="Search by last name..."
                                className="w-full text-xs p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                value={filterLastName}
                                onChange={(e) => { setFilterLastName(e.target.value); setPage(0); }}
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-indigo-600 uppercase mb-1 flex items-center gap-1">
                                <Filter size={10} /> Student ID
                            </label>
                            <input
                                type="text"
                                placeholder="Search by student ID..."
                                className="w-full text-xs p-2 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500"
                                value={filterStudentId}
                                onChange={(e) => { setFilterStudentId(e.target.value); setPage(0); }}
                            />
                        </div>
                    </div>
                </div>

                {students.length === 0 && !isLoadingStudents ? (
                    <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                        <Users size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-medium italic">No students match your filters</p>
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {students.map((st) => (
                                <motion.div
                                    key={st.studentId}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-4 border border-gray-100 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-100 transition-all flex justify-between items-center bg-white shadow-sm group"
                                >
                                    <div className="space-y-1">
                                        <p className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">
                                            {st.firstName ? `${st.firstName} ${st.lastName || ''}`.trim() : st.username}
                                        </p>
                                        <div className="flex flex-col gap-1">
                                            <div className="flex items-center gap-2">
                                                <span className="text-[10px] font-black px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-tighter">
                                                    ID: #{st.studentId}
                                                </span>
                                                <span className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                                                    🏫 {st.schoolName || "N/A"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-indigo-600 font-bold flex items-center gap-1 text-opacity-70">
                                                    📍 {st.centreName || "Registered Centre"}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-2">
                                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            Active
                                        </span>
                                        <button
                                            onClick={() => navigate(`/admin/manage/student/${st.studentId}`)}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm border border-indigo-50 opacity-0 group-hover:opacity-100"
                                        >
                                            <Settings2 size={12} />
                                            Manage
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-6">
                                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">
                                    Page {page + 1} of {totalPages}
                                </span>
                                <div className="flex gap-2">
                                    <button
                                        disabled={page === 0}
                                        onClick={() => setPage(p => p - 1)}
                                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronLeft size={16} />
                                    </button>
                                    <button
                                        disabled={page >= totalPages - 1}
                                        onClick={() => setPage(p => p + 1)}
                                        className="p-2 rounded-xl border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all"
                                    >
                                        <ChevronRight size={16} />
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

export default StudentManager;
