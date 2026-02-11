import React, { useState, useMemo } from 'react';
import { FileText, AlertTriangle, Filter, XCircle } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { getAllRegions, getAllExamCentres, getAllSchools, getAllStudents } from '../../api';

const ApplicationManager = ({
    applications = [],
    selectApplication
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

    // Cascading Filter Options
    const availableCentres = useMemo(() => {
        if (!filterRegion) return centres;
        return centres.filter(c => (c.region?.regionId?.toString() === filterRegion));
    }, [filterRegion, centres]);

    const availableSchools = useMemo(() => {
        if (!filterCentre) return schools;
        return schools.filter(s => s.examCentre?.centreId?.toString() === filterCentre);
    }, [filterCentre, schools]);

    // Filtered Applications
    const filteredApplications = useMemo(() => {
        return applications.filter(app => {
            // Reconstruct hierarchy from studentId
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

    const clearFilters = () => {
        setFilterRegion("");
        setFilterCentre("");
        setFilterSchool("");
    };

    return (
        <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <FileText size={24} /> Student Applications
                </h2>

                {(filterRegion || filterCentre || filterSchool) && (
                    <button
                        onClick={clearFilters}
                        className="text-xs text-red-500 font-bold flex items-center gap-1 hover:bg-red-50 px-2 py-1 rounded transition-colors"
                    >
                        <XCircle size={14} /> Clear All Filters
                    </button>
                )}
            </div>

            {/* Filter Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
                <div>
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block tracking-widest">Region</label>
                    <select
                        className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
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
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block tracking-widest">Centre</label>
                    <select
                        className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
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
                    <label className="text-[10px] font-black text-gray-400 uppercase mb-1 block tracking-widest">School</label>
                    <select
                        className="w-full text-xs p-2.5 border rounded-lg bg-white outline-none focus:ring-2 focus:ring-indigo-500 font-bold text-indigo-900"
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

            {filteredApplications.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                    <AlertTriangle
                        className="mx-auto text-gray-300 mb-4"
                        size={48}
                    />
                    <p className="text-gray-500 font-bold italic">
                        No applications match your filtering criteria
                    </p>
                    <button
                        onClick={clearFilters}
                        className="mt-4 text-indigo-600 text-sm font-black uppercase tracking-widest hover:underline"
                    >
                        Reset Filters
                    </button>
                </div>
            ) : (
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full border-separate border-spacing-0">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="p-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider border-b">ID</th>
                                <th className="p-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider border-b">Student Info</th>
                                <th className="p-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider border-b">Placement</th>
                                <th className="p-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider border-b">Exam</th>
                                <th className="p-4 text-left text-[11px] font-black text-gray-400 uppercase tracking-wider border-b">Status</th>
                                <th className="p-4 text-center text-[11px] font-black text-gray-400 uppercase tracking-wider border-b">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredApplications.map((app) => {
                                // Helper to get related data for display
                                const student = students.find(s => s.studentId === app.studentId);
                                const school = schools.find(s => s.schoolId === student?.schoolId);
                                const centre = centres.find(c => c.centreId === school?.centreId);
                                const region = regions.find(r => r.regionId === centre?.regionId);

                                let formData = {};
                                try {
                                    formData = typeof app.formData === 'string' ? JSON.parse(app.formData) : app.formData;
                                } catch (e) {
                                    console.error("Error parsing formData", e);
                                }

                                return (
                                    <tr
                                        key={app.applicationId}
                                        className="hover:bg-indigo-50/30 transition-colors group"
                                    >
                                        <td className="p-4 font-black text-indigo-600 text-sm">
                                            #{app.applicationId}
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col">
                                                <span className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                    {app.studentName || "N/A"}
                                                </span>
                                                <div className="flex gap-2 mt-1">
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                        Roll: {app.studentId}
                                                    </span>

                                                    {student?.contact && (
                                                     <span className="text-[10px] text-gray-500 font-bold">
                                                       📞 {student.contact}
                                                     </span>
                                                   )}

                                                    
                                                </div>
                                                
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-xs font-bold text-gray-700">🏫 {school?.schoolName || "N/A"}</span>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[10px] bg-indigo-100 text-indigo-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                                                        📍 {region?.regionName || "City"}
                                                    </span>
                                                    <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded font-black uppercase tracking-tighter">
                                                        🏢 {centre?.centreCode || "EC"}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-xs font-black text-indigo-900 uppercase">{app.examName || "N/A"}</span>
                                        </td>
                                        <td className="p-4">
                                            <span
                                                className={`px-2 py-1 rounded text-[10px] font-black uppercase tracking-widest shadow-sm border ${app.status === "APPLIED"
                                                    ? "bg-blue-50 text-blue-700 border-blue-100"
                                                    : "bg-emerald-50 text-emerald-700 border-emerald-100"
                                                    }`}
                                            >
                                                {app.status}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button
                                                onClick={() => selectApplication(app.applicationId)}
                                                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-[10px] font-black uppercase tracking-widest transition shadow-md hover:shadow-lg"
                                            >
                                                Publish Result
                                            </button>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ApplicationManager;
