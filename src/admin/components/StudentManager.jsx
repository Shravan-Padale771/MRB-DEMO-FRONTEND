import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Plus, Users, Filter, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllRegions, getAllExamCentres } from '../../api';

const StudentManager = ({
    studentForm,
    setStudentForm,
    handleCreateStudent,
    students = [],
    schools = []
}) => {
    // Filter State
    const [filterRegion, setFilterRegion] = useState("");
    const [filterCentre, setFilterCentre] = useState("");
    const [filterSchool, setFilterSchool] = useState("");

    // Additional data for filters
    const { data: regions = [] } = useQuery({
        queryKey: ['regions'],
        queryFn: getAllRegions,
    });

    const { data: centres = [] } = useQuery({
        queryKey: ['examCentres'],
        queryFn: getAllExamCentres,
    });

    // Derived states for filter options
    const availableCentres = useMemo(() => {
        if (!filterRegion) return centres;
        return centres.filter(c => {
            const regionId = typeof c.region === 'object' ? c.region?.regionId : null;
            return regionId && regionId.toString() === filterRegion;
        });
    }, [filterRegion, centres]);

    const availableSchools = useMemo(() => {
        if (!filterCentre) return schools;
        return schools.filter(s => s.examCentre?.centreId?.toString() === filterCentre);
    }, [filterCentre, schools]);

    // Final filtered list
    const filteredStudents = useMemo(() => {
        return students.filter(st => {
            const matchesRegion = !filterRegion ||
                (st.school?.examCentre?.region?.regionId?.toString() === filterRegion);
            const matchesCentre = !filterCentre ||
                (st.school?.examCentre?.centreId?.toString() === filterCentre);
            const matchesSchool = !filterSchool ||
                (st.school?.schoolId?.toString() === filterSchool);
            return matchesRegion && matchesCentre && matchesSchool;
        });
    }, [students, filterRegion, filterCentre, filterSchool]);

    const clearFilters = () => {
        setFilterRegion("");
        setFilterCentre("");
        setFilterSchool("");
    };

    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md border-t-4 border-green-600 h-fit">
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
                            {schools.map(school => (
                                <option key={school.schoolId} value={school.schoolId}>
                                    {school.schoolName} ({school.examCentre?.centreCode || "N/A"})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button className="w-full bg-green-600 text-white font-bold p-3 rounded-lg hover:bg-green-700 transition-colors shadow-lg">
                        Add Student
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Users size={24} /> All Students
                    </h2>
                    {(filterRegion || filterCentre || filterSchool) && (
                        <button
                            onClick={clearFilters}
                            className="text-xs text-red-500 font-bold flex items-center gap-1 hover:text-red-700"
                        >
                            <XCircle size={14} /> Clear Filters
                        </button>
                    )}
                </div>

                {/* Filter Controls */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
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
                            }}
                        >
                            <option value="">All Centres</option>
                            {availableCentres.map(c => (
                                <option key={c.centreId} value={c.centreId}>{c.centreName} ({c.centreCode})</option>
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
                            onChange={(e) => setFilterSchool(e.target.value)}
                        >
                            <option value="">All Schools</option>
                            {availableSchools.map(s => (
                                <option key={s.schoolId} value={s.schoolId}>{s.schoolName}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {filteredStudents.length === 0 ? (
                    <div className="text-center py-12 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100">
                        <Users size={48} className="mx-auto text-gray-200 mb-4" />
                        <p className="text-gray-400 font-medium italic">No students match your filters</p>
                        {(filterRegion || filterCentre || filterSchool) && (
                            <button
                                onClick={clearFilters}
                                className="mt-4 text-indigo-600 font-bold text-sm underline"
                            >
                                Reset Filters
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {filteredStudents.map((st) => (
                            <motion.div
                                key={st.studentId}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 border border-gray-100 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-100 transition-all flex justify-between items-center bg-white shadow-sm group"
                            >
                                <div className="space-y-1">
                                    <p className="font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{st.username}</p>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black px-1.5 py-0.5 bg-gray-100 text-gray-500 rounded uppercase tracking-tighter">
                                                ID: #{st.studentId}
                                            </span>
                                            <span className="text-xs text-indigo-600 font-bold flex items-center gap-1">
                                                🏫 {st.school?.schoolName || "No School"}
                                            </span>
                                        </div>
                                        {st.school?.examCentre?.region && (
                                            <div className="flex items-center gap-3">
                                                <span className="text-[10px] text-green-600 font-bold flex items-center gap-1">
                                                    📍 {typeof st.school.examCentre.region === 'string'
                                                        ? st.school.examCentre.region
                                                        : st.school.examCentre.region.regionName}
                                                </span>
                                                <span className="text-[10px] text-amber-600 font-bold flex items-center gap-1">
                                                    🏢 {st.school.examCentre.centreName}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm">
                                        Active
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentManager;
