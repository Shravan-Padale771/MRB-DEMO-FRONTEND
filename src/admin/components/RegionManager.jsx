import React, { useState } from 'react';
import { MapPin, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { addRegion, getAllRegions } from '../../api';

const RegionManager = () => {
    const queryClient = useQueryClient();
    const [regionName, setRegionName] = useState("");

    // Query
    const { data: regions = [], isLoading, refetch } = useQuery({
        queryKey: ['regions'],
        queryFn: getAllRegions,
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

            <div className="bg-white p-6 rounded-xl shadow-md">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold text-gray-800">Existing Regions</h3>
                    <button
                        onClick={() => refetch()}
                        className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} /> Refresh
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {regions.length === 0 && !isLoading ? (
                        <div className="col-span-full text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed">
                            <p className="text-gray-400">No regions found</p>
                        </div>
                    ) : (
                        regions.map((region, idx) => (
                            <div
                                key={region.regionId || `reg-${idx}`}
                                className="p-4 bg-indigo-50 rounded-lg border border-indigo-100 flex flex-col gap-2"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-semibold text-indigo-900">{region.regionName}</span>
                                    <span className="text-xs text-indigo-400">ID: {region.regionId}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="bg-white px-2 py-1 rounded text-[10px] font-bold text-indigo-500 border border-indigo-100 uppercase tracking-wider">
                                        {(Array.isArray(region.examCentres) ? region.examCentres.length : 0)} Centres
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default RegionManager;
