import React, { useState, useMemo } from 'react';
import { Building2, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addSchool, getAllSchools, getAllExamCentres, getAllRegions } from '../../api';

const SchoolManager = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        schoolName: "",
        centreId: ""
    });
    const [filterRegion, setFilterRegion] = useState("");
    const [filterCentre, setFilterCentre] = useState("");

    // Queries
    const { data: schools = [], isLoading: isLoadingSchools, refetch: refetchSchools } = useQuery({
        queryKey: ['schools'],
        queryFn: getAllSchools,
    });

    const { data: centres = [], isLoading: isLoadingCentres, refetch: refetchCentres } = useQuery({
        queryKey: ['examCentres'],
        queryFn: getAllExamCentres,
    });

    const { data: regions = [] } = useQuery({
        queryKey: ['regions'],
        queryFn: getAllRegions,
    });

    // Mutation
    const addSchoolMutation = useMutation({
        mutationFn: ({ centreId, schoolData }) => addSchool(centreId, schoolData),
        onSuccess: () => {
            toast.success("School Added!");
            setFormData({ schoolName: "", centreId: "" });
            queryClient.invalidateQueries({ queryKey: ['schools'] });
        },
        onError: (error) => {
            console.error("Error adding school:", error);
            toast.error("Failed to add school");
        }
    });

    const loading = isLoadingSchools || isLoadingCentres || addSchoolMutation.isPending;

    // Derived filter options
    const availableCentresForFilter = useMemo(() => {
        if (!filterRegion) return centres;
        return centres.filter(c => {
            const regionId = typeof c.region === 'object' ? c.region?.regionId : null;
            return regionId && regionId.toString() === filterRegion;
        });
    }, [filterRegion, centres]);

    // Final filtered schools
    const filteredSchools = useMemo(() => {
        return schools.filter(s => {
            const matchesRegion = !filterRegion ||
                (s.examCentre?.region?.regionId?.toString() === filterRegion ||
                    (typeof s.examCentre?.region === 'string' && s.examCentre?.region === filterRegion));
            const matchesCentre = !filterCentre || s.examCentre?.centreId?.toString() === filterCentre;
            return matchesRegion && matchesCentre;
        });
    }, [schools, filterRegion, filterCentre]);

    const handleCreateSchool = (e) => {
        e.preventDefault();
        if (!formData.schoolName || !formData.centreId) {
            return toast.error("Please fill all fields");
        }
        addSchoolMutation.mutate({
            centreId: formData.centreId,
            schoolData: { schoolName: formData.schoolName }
        });
    };

    const handleRefresh = () => {
        refetchSchools();
        refetchCentres();
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <Building2 size={24} /> School Management
                </h2>

                <form onSubmit={handleCreateSchool} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">School Name</label>
                        <input
                            type="text"
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. KV School"
                            value={formData.schoolName}
                            onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">Select Exam Centre</label>
                        <select
                            required
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                            value={formData.centreId}
                            onChange={(e) => setFormData({ ...formData, centreId: e.target.value })}
                        >
                            <option value="">Select Exam Centre</option>
                            {Array.isArray(centres) && centres.map((c, idx) => (
                                <option key={c.centreId || `c-${idx}`} value={c.centreId}>
                                    {c.centreName} ({c.centreCode})
                                </option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={addSchoolMutation.isPending}
                        className="bg-indigo-600 text-white p-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {addSchoolMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
                        Add School
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Existing Schools</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Listing {filteredSchools.length} Schools</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Region:</span>
                            <select
                                className="text-xs bg-transparent outline-none font-bold text-indigo-600"
                                value={filterRegion}
                                onChange={(e) => {
                                    setFilterRegion(e.target.value);
                                    setFilterCentre("");
                                }}
                            >
                                <option value="">All Regions</option>
                                {regions.map(r => (
                                    <option key={r.regionId} value={r.regionId}>{r.regionName}</option>
                                ))}
                            </select>
                        </div>

                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Centre:</span>
                            <select
                                className="text-xs bg-transparent outline-none font-bold text-indigo-600"
                                value={filterCentre}
                                onChange={(e) => setFilterCentre(e.target.value)}
                            >
                                <option value="">All Centres</option>
                                {availableCentresForFilter.map(c => (
                                    <option key={c.centreId} value={c.centreId}>{c.centreName}</option>
                                ))}
                            </select>
                        </div>

                        <button
                            onClick={handleRefresh}
                            className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                            title="Refresh Data"
                        >
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">School Name</th>
                                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Exam Centre</th>
                                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Region</th>
                                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(filteredSchools.length === 0 && !isLoadingSchools) ? (
                                <tr>
                                    <td colSpan="4" className="p-12 text-center">
                                        <Building2 size={48} className="mx-auto text-gray-100 mb-4" />
                                        <p className="text-gray-400 italic font-medium">No schools match your filter</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredSchools.map((school, idx) => (
                                    <tr key={school.schoolId || `school-${idx}`} className="border-b transition-colors hover:bg-indigo-50/30 group">
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs group-hover:bg-indigo-200 transition-colors shadow-sm">
                                                    {school.schoolName?.charAt(0) || "S"}
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors">{school.schoolName}</span>
                                                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">ID: #{school.schoolId}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="space-y-1">
                                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-blue-100 text-blue-700 shadow-sm">
                                                    {school.centreName || school.examCentre?.centreName || "N/A"}
                                                </span>
                                                <p className="text-[10px] font-mono text-gray-400 font-bold">
                                                    {school.examCentre?.centreCode || ""}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter bg-purple-100 text-purple-700 shadow-sm">
                                                {school.regionName || (typeof school.examCentre?.region === 'string'
                                                    ? school.examCentre.region
                                                    : (school.examCentre?.region?.regionName || "City Area")) || "City Area"}
                                            </span>
                                        </td>
                                        <td className="p-4 align-middle text-right">
                                            <button className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-100">
                                                Manage
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SchoolManager;
