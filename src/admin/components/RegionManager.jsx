import React, { useState } from 'react';
import { MapPin, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addRegion, getAllRegions, getAllSchools } from '../../api';

const RegionManager = () => {
    const queryClient = useQueryClient();
    const [regionName, setRegionName] = useState("");

    // Queries
    const { data: regions = [], isLoading: isLoadingRegions, refetch: refetchRegions } = useQuery({
        queryKey: ['regions'],
        queryFn: getAllRegions,
    });

    const { data: schools = [], isLoading: isLoadingSchools } = useQuery({
        queryKey: ['schools'],
        queryFn: getAllSchools,
    });

    // Mutation
    const addRegionMutation = useMutation({
        mutationFn: (payload) => addRegion(payload),
        onSuccess: () => {
            toast.success("Region added successfully!");
            setRegionName("");
            queryClient.invalidateQueries({ queryKey: ['regions'] });
        },
        onError: (error) => {
            console.error("Error adding region:", error);
            toast.error("Failed to add region");
        }
    });

    const handleAddRegion = (e) => {
        e.preventDefault();
        if (!regionName.trim()) return toast.error("Please enter a region name");
        addRegionMutation.mutate({ regionName });
    };

    const loading = isLoadingRegions || isLoadingSchools || addRegionMutation.isPending;

    return (
        <div className="space-y-6">
            <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <MapPin size={24} /> Region Management
                </h2>

                <form onSubmit={handleAddRegion} className="flex gap-4">
                    <input
                        type="text"
                        className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        placeholder="Enter Region Name (e.g. Pune, Mumbai)"
                        value={regionName}
                        onChange={(e) => setRegionName(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={addRegionMutation.isPending}
                        className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                    >
                        {addRegionMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
                        Add Region
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">Administrative Overview</h3>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Data grouped by region</p>
                    </div>
                    <button
                        onClick={() => refetchRegions()}
                        className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
                        title="Refresh Data"
                    >
                        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {regions.length === 0 && !isLoadingRegions ? (
                        <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                            <MapPin className="mx-auto text-gray-200 mb-4" size={48} />
                            <p className="text-gray-400 font-bold italic">No regions registered yet</p>
                        </div>
                    ) : (
                        regions.map((region) => {
                            const regionCentres = Array.isArray(region.examCentres) ? region.examCentres : [];
                            const regionSchools = schools.filter(s =>
                                s.examCentre?.region?.regionId === region.regionId ||
                                (typeof s.examCentre?.region === 'string' && s.examCentre.region === region.regionName)
                            );

                            return (
                                <div
                                    key={region.regionId}
                                    className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 hover:border-indigo-200 hover:shadow-lg transition-all group"
                                >
                                    <div className="flex justify-between items-start">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-600 font-black">
                                                {region.regionName?.charAt(0) || "R"}
                                            </div>
                                            <div>
                                                <h4 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors uppercase tracking-tight">
                                                    {region.regionName}
                                                </h4>
                                                <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Region ID: #{region.regionId}</p>
                                            </div>
                                        </div>
                                    </div>



                                    {regionCentres.length > 0 && (
                                        <div className="space-y-2 mt-2">
                                            <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Centres in this region:</span>
                                            <div className="flex flex-wrap gap-1.5">
                                                {regionCentres.slice(0, 5).map(c => (
                                                    <span key={c.centreId} className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[9px] font-black tracking-tighter">
                                                        {c.centreName}
                                                    </span>
                                                ))}
                                                {regionCentres.length > 5 && (
                                                    <span className="text-[9px] font-black text-gray-400 px-1">+ {regionCentres.length - 5} more</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
                                        <button className="w-full py-2 bg-white border border-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm">
                                            Manage Region Data
                                        </button>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegionManager;
