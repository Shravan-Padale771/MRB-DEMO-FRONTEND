import React, { useState } from 'react';
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
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
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

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Existing Exam Centres</h3>
                    <button
                        onClick={handleRefresh}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium"
                    >
                        <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-gray-50 border-b">
                                <th className="p-4 text-sm font-bold text-gray-600">ID</th>
                                <th className="p-4 text-sm font-bold text-gray-600">Code</th>
                                <th className="p-4 text-sm font-bold text-gray-600">Centre Name</th>
                                <th className="p-4 text-sm font-bold text-gray-600">Region</th>
                                <th className="p-4 text-sm font-bold text-gray-600">Schools</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(Array.isArray(centres) && centres.length === 0 && !isLoadingCentres) ? (
                                <tr>
                                    <td colSpan="5" className="p-8 text-center text-gray-400 italic">No exam centres found</td>
                                </tr>
                            ) : (
                                Array.isArray(centres) && centres.map((centre, idx) => (
                                    <tr key={centre.centreId || `centre-${idx}`} className="border-b hover:bg-gray-50 transition-colors">
                                        <td className="p-4 text-sm text-gray-500">#{centre.centreId}</td>
                                        <td className="p-4 text-sm font-mono font-bold text-indigo-600">{centre.centreCode}</td>
                                        <td className="p-4 text-sm text-gray-800">{centre.centreName}</td>
                                        <td className="p-4 text-sm">
                                            <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">
                                                {typeof centre.region === 'string'
                                                    ? centre.region
                                                    : (centre.region?.regionName || "N/A")}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm">
                                            <span className="text-gray-600 font-medium">{(Array.isArray(centre.schools) ? centre.schools.length : 0)}</span>
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
