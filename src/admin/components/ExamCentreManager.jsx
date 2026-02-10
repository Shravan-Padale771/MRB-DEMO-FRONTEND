import React, { useState, useMemo } from 'react';
import { Building2, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addExamCentre, getAllExamCentres, getAllRegions } from '../../api';

const ExamCentreManager = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({
        centreCode: "",
        centreName: "",
        regionId: ""
    });
    const [filterRegion, setFilterRegion] = useState("");

    // Queries
    const { data: centres = [], isLoading: isLoadingCentres, refetch: refetchCentres } = useQuery({
        queryKey: ['examCentres'],
        queryFn: getAllExamCentres,
    });

    const { data: regions = [], isLoading: isLoadingRegions, refetch: refetchRegions } = useQuery({
        queryKey: ['regions'],
        queryFn: getAllRegions,
    });

    // Mutation
    const addCentreMutation = useMutation({
        mutationFn: ({ regionId, payload }) => addExamCentre(regionId, payload),
        onSuccess: () => {
            toast.success("Exam Centre added!");
            setFormData({ centreCode: "", centreName: "", regionId: "" });
            queryClient.invalidateQueries({ queryKey: ['examCentres'] });
        },
        onError: (error) => {
            console.error("Error adding exam centre:", error);
            toast.error("Failed to add exam centre");
        }
    });

    const loading = isLoadingCentres || isLoadingRegions || addCentreMutation.isPending;

    // Filtered centres
    const filteredCentres = useMemo(() => {
        if (!filterRegion) return centres;
        return centres.filter(c => {
            const regionId = typeof c.region === 'object' ? c.region?.regionId : null;
            return regionId && regionId.toString() === filterRegion;
        });
    }, [centres, filterRegion]);

    const handleAddCentre = (e) => {
        e.preventDefault();
        if (!formData.centreCode || !formData.centreName || !formData.regionId) {
            return toast.error("Please fill all fields");
        }

        addCentreMutation.mutate({
            regionId: formData.regionId,
            payload: {
                centreCode: formData.centreCode,
                centreName: formData.centreName
            }
        });
    };

    const handleRefresh = () => {
        refetchCentres();
        refetchRegions();
    };

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <Building2 size={24} /> Exam Centre Management
                </h2>

                <form onSubmit={handleAddCentre} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">Centre Code</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. EC101"
                            value={formData.centreCode}
                            onChange={(e) => setFormData({ ...formData, centreCode: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">Centre Name</label>
                        <input
                            type="text"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            placeholder="e.g. Modern School Pune"
                            value={formData.centreName}
                            onChange={(e) => setFormData({ ...formData, centreName: e.target.value })}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-600">Region</label>
                        <select
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
                            value={formData.regionId}
                            onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                            required
                        >
                            <option value="">Select Region</option>
                            {Array.isArray(regions) && regions.map((r, idx) => (
                                <option key={r.regionId || `opt-${idx}`} value={r.regionId}>{r.regionName}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        type="submit"
                        disabled={addCentreMutation.isPending}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {addCentreMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
                        Add Centre
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Existing Exam Centres</h3>
                        <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Listing {filteredCentres.length} Centres</p>
                    </div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex-1 md:flex-initial">
                            <span className="text-[10px] font-black text-gray-400 uppercase">Filter Region:</span>
                            <select
                                className="text-xs bg-transparent outline-none font-bold text-indigo-600"
                                value={filterRegion}
                                onChange={(e) => setFilterRegion(e.target.value)}
                            >
                                <option value="">All Regions</option>
                                {regions.map(r => (
                                    <option key={r.regionId} value={r.regionId}>{r.regionName}</option>
                                ))}
                            </select>
                        </div>
                        <button
                            onClick={handleRefresh}
                            className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                        >
                            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">ID</th>
                                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Code</th>
                                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Centre Name</th>
                                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Region</th>
                                <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-center">Schools</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(filteredCentres.length === 0 && !isLoadingCentres) ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center">
                                        <Building2 size={48} className="mx-auto text-gray-100 mb-4" />
                                        <p className="text-gray-400 italic font-medium">No centres match your filter</p>
                                    </td>
                                </tr>
                            ) : (
                                filteredCentres.map((centre, idx) => (
                                    <tr key={centre.centreId || `centre-${idx}`} className="border-b hover:bg-indigo-50/30 transition-colors group">
                                        <td className="p-4 text-xs font-bold text-gray-400">#{centre.centreId}</td>
                                        <td className="p-4 text-sm font-mono font-bold text-indigo-600 uppercase">{centre.centreCode}</td>
                                        <td className="p-4 text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{centre.centreName}</td>
                                        <td className="p-4">
                                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm">
                                                {centre.regionName || (typeof centre.region === 'string'
                                                    ? centre.region
                                                    : (centre.region?.regionName || "N/A"))}
                                            </span>
                                        </td>
                                        <td className="p-4 text-center">
                                            <span className="bg-emerald-50 text-emerald-700 px-2 py-1 rounded-full text-[10px] font-black border border-emerald-100">
                                                {(Array.isArray(centre.schools) ? centre.schools.length : 0)} Schools
                                            </span>
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

export default ExamCentreManager;
