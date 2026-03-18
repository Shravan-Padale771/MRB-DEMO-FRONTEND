// import React, { useState } from 'react';
// import { MapPin, Plus, RefreshCw } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { createRegion, getRegions, getSchools } from '../../api';
// import RegionDetailView from './RegionDetailView';

// const RegionManager = () => {
//     const queryClient = useQueryClient();
//     const [regionName, setRegionName] = useState("");
//     const [selectedRegion, setSelectedRegion] = useState(null);

//     // Queries
//     const { data: regionsPage, isLoading: isLoadingRegions, refetch: refetchRegions } = useQuery({
//         queryKey: ['regions'],
//         queryFn: () => getRegions({ size: 1000 }),
//     });
//     const regions = regionsPage?.content || [];

//     // We keep this for the summary counts in the list view, but it's secondary now
//     const { data: schoolsPage, isLoading: isLoadingSchools } = useQuery({
//         queryKey: ['schools'],
//         queryFn: () => getSchools({ size: 1000 }),
//     });
//     const schools = schoolsPage?.content || [];

//     // Mutation
//     const addRegionMutation = useMutation({
//         mutationFn: (payload) => createRegion(payload),
//         onSuccess: () => {
//             toast.success("Region added successfully!");
//             setRegionName("");
//             queryClient.invalidateQueries({ queryKey: ['regions'] });
//         },
//         onError: (error) => {
//             console.error("Error adding region:", error);
//             toast.error("Failed to add region");
//         }
//     });

//     const handleAddRegion = (e) => {
//         e.preventDefault();
//         if (!regionName.trim()) return toast.error("Please enter a region name");
//         addRegionMutation.mutate({ regionName });
//     };

//     const loading = isLoadingRegions || isLoadingSchools || addRegionMutation.isPending;

//     if (selectedRegion) {
//         return (
//             <RegionDetailView 
//                 region={selectedRegion} 
//                 onBack={() => setSelectedRegion(null)} 
//             />
//         );
//     }

//     return (
//         <div className="space-y-6">
//             <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
//                 <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
//                     <MapPin size={24} /> Region Management
//                 </h2>

//                 <form onSubmit={handleAddRegion} className="flex gap-4">
//                     <input
//                         type="text"
//                         className="flex-1 p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
//                         placeholder="Enter Region Name (e.g. Pune, Mumbai)"
//                         value={regionName}
//                         onChange={(e) => setRegionName(e.target.value)}
//                         required
//                     />
//                     <button
//                         type="submit"
//                         disabled={addRegionMutation.isPending}
//                         className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center gap-2 disabled:opacity-50"
//                     >
//                         {addRegionMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
//                         Add Region
//                     </button>
//                 </form>
//             </div>

//             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//                 <div className="flex justify-between items-center mb-6">
//                     <div>
//                         <h3 className="text-lg font-bold text-gray-800">Administrative Overview</h3>
//                         <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Data grouped by region</p>
//                     </div>
//                     <button
//                         onClick={() => refetchRegions()}
//                         className="text-indigo-600 hover:text-indigo-800 p-2 hover:bg-indigo-50 rounded-lg transition-colors"
//                         title="Refresh Data"
//                     >
//                         <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
//                     </button>
//                 </div>

//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                     {regions.length === 0 && !isLoadingRegions ? (
//                         <div className="col-span-full text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
//                             <MapPin className="mx-auto text-gray-200 mb-4" size={48} />
//                             <p className="text-gray-400 font-bold italic">No regions registered yet</p>
//                         </div>
//                     ) : (
//                         regions.map((region) => {
//                             const regionCentres = Array.isArray(region.examCentres) ? region.examCentres : [];

//                             return (
//                                 <div
//                                     key={region.regionId}
//                                     className="bg-gray-50/50 rounded-2xl border border-gray-100 p-6 flex flex-col gap-4 hover:border-indigo-200 hover:shadow-lg transition-all group"
//                                 >
//                                     <div className="flex justify-between items-start">
//                                         <div className="flex items-center gap-3">
//                                             <div className="w-10 h-10 rounded-xl bg-white shadow-sm border border-indigo-100 flex items-center justify-center text-indigo-600 font-black">
//                                                 {region.regionName?.charAt(0) || "R"}
//                                             </div>
//                                             <div>
//                                                 <h4 className="font-bold text-gray-900 group-hover:text-indigo-700 transition-colors uppercase tracking-tight">
//                                                     {region.regionName}
//                                                 </h4>
//                                                 <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Region ID: #{region.regionId}</p>
//                                             </div>
//                                         </div>
//                                     </div>



//                                     {regionCentres.length > 0 && (
//                                         <div className="space-y-2 mt-2">
//                                             <span className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em]">Centres in this region:</span>
//                                             <div className="flex flex-wrap gap-1.5">
//                                                 {regionCentres.slice(0, 5).map(c => (
//                                                     <span key={c.centreId} className="px-2 py-0.5 bg-indigo-100 text-indigo-600 rounded text-[9px] font-black tracking-tighter">
//                                                         {c.centreName}
//                                                     </span>
//                                                 ))}
//                                                 {regionCentres.length > 5 && (
//                                                     <span className="text-[9px] font-black text-gray-400 px-1">+ {regionCentres.length - 5} more</span>
//                                                 )}
//                                             </div>
//                                         </div>
//                                     )}

//                                     <div className="mt-auto pt-4 border-t border-dashed border-gray-200">
//                                         <button 
//                                             onClick={() => setSelectedRegion(region)}
//                                             className="w-full py-2 bg-white border border-indigo-100 text-indigo-600 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
//                                         >
//                                             Manage Region Data
//                                         </button>
//                                     </div>
//                                 </div>
//                             );
//                         })
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RegionManager;


import React, { useState } from 'react';
import { MapPin, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { createRegion, getRegions, getSchools } from '../../../api';
import RegionDetailView from '../RegionDetailView';

const RegionManager = () => {
    const queryClient = useQueryClient();
    const [regionName, setRegionName] = useState("");
    const [selectedRegion, setSelectedRegion] = useState(null);

    const { data: regionsPage, isLoading: isLoadingRegions, refetch: refetchRegions } = useQuery({
        queryKey: ['regions'],
        queryFn: () => getRegions({ size: 1000 }),
    });
    const regions = regionsPage?.content || [];

    const { data: schoolsPage, isLoading: isLoadingSchools } = useQuery({
        queryKey: ['schools'],
        queryFn: () => getSchools({ size: 1000 }),
    });

    const addRegionMutation = useMutation({
        mutationFn: (payload) => createRegion(payload),
        onSuccess: () => {
            toast.success("Region added successfully!");
            setRegionName("");
            queryClient.invalidateQueries({ queryKey: ['regions'] });
        },
        onError: () => toast.error("Failed to add region"),
    });

    const handleAddRegion = (e) => {
        e.preventDefault();
        if (!regionName.trim()) return toast.error("Please enter a region name");
        addRegionMutation.mutate({ regionName });
    };

    const loading = isLoadingRegions || isLoadingSchools || addRegionMutation.isPending;

    if (selectedRegion) {
        return <RegionDetailView region={selectedRegion} onBack={() => setSelectedRegion(null)} />;
    }

    return (
        <div style={s.page}>

            {/* Add Region */}
            <div style={s.card}>
                <div style={s.cardHeader}>
                    <div>
                        <p style={s.cardTitle}>Region Management</p>
                        <p style={s.cardSub}>Add and manage administrative regions</p>
                    </div>
                </div>
                <form onSubmit={handleAddRegion} style={s.formRow}>
                    <input
                        type="text"
                        style={s.input}
                        placeholder="Enter Region Name (e.g. Pune, Mumbai)"
                        value={regionName}
                        onChange={(e) => setRegionName(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        disabled={addRegionMutation.isPending}
                        style={s.btn}
                    >
                        {addRegionMutation.isPending
                            ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                            : <Plus size={14} />}
                        Add Region
                    </button>
                </form>
            </div>

            {/* Region List */}
            <div style={s.card}>
                <div style={s.cardHeader}>
                    <div>
                        <p style={s.cardTitle}>Administrative Overview</p>
                        <p style={s.cardSub}>Data grouped by region</p>
                    </div>
                    <button
                        onClick={() => refetchRegions()}
                        style={s.iconBtn}
                        title="Refresh"
                    >
                        <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                    </button>
                </div>

                {regions.length === 0 && !isLoadingRegions ? (
                    <div style={s.emptyWrap}>
                        <MapPin size={32} style={{ color: '#D1D5E8', marginBottom: 10 }} />
                        <span style={s.emptyText}>No regions registered yet</span>
                    </div>
                ) : (
                    <div style={s.regionGrid}>
                        {regions.map((region) => {
                            const regionCentres = Array.isArray(region.examCentres) ? region.examCentres : [];
                            return (
                                <div key={region.regionId} style={s.regionCard}>
                                    <div style={s.regionCardTop}>
                                        <div style={s.regionAvatar}>
                                            {region.regionName?.charAt(0) || 'R'}
                                        </div>
                                        <div>
                                            <p style={s.regionName}>{region.regionName}</p>
                                            <p style={s.regionId}>Region ID: #{region.regionId}</p>
                                        </div>
                                    </div>

                                    {regionCentres.length > 0 && (
                                        <div style={{ marginTop: 12 }}>
                                            <p style={s.centreLabel}>Centres in this region</p>
                                            <div style={s.centreTagWrap}>
                                                {regionCentres.slice(0, 5).map(c => (
                                                    <span key={c.centreId} style={s.centreTag}>{c.centreName}</span>
                                                ))}
                                                {regionCentres.length > 5 && (
                                                    <span style={s.moreTag}>+{regionCentres.length - 5} more</span>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    <div style={s.regionCardFooter}>
                                        <button
                                            onClick={() => setSelectedRegion(region)}
                                            style={s.manageBtn}
                                        >
                                            Manage Region Data
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default RegionManager;

const s = {
    page: {
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    card: {
        background: '#fff',
        borderRadius: 14,
        padding: '20px 22px',
        border: '0.5px solid #E8EAF0',
    },
    cardHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    cardTitle: {
        fontSize: 13,
        fontWeight: 700,
        color: '#1A1D2E',
        margin: 0,
    },
    cardSub: {
        fontSize: 11,
        color: '#8B8FA8',
        margin: '3px 0 0',
    },
    formRow: {
        display: 'flex',
        gap: 10,
        alignItems: 'center',
    },
    input: {
        flex: 1,
        padding: '9px 12px',
        fontSize: 13,
        border: '0.5px solid #E8EAF0',
        borderRadius: 8,
        outline: 'none',
        color: '#1A1D2E',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    btn: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '9px 18px',
        fontSize: 12,
        fontWeight: 700,
        background: '#4361EE',
        color: '#fff',
        border: 'none',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        whiteSpace: 'nowrap',
    },
    iconBtn: {
        background: 'none',
        border: '0.5px solid #E8EAF0',
        borderRadius: 8,
        padding: '6px 8px',
        cursor: 'pointer',
        color: '#8B8FA8',
        display: 'flex',
        alignItems: 'center',
    },
    emptyWrap: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 0',
    },
    emptyText: {
        fontSize: 13,
        color: '#B0B3C6',
        fontStyle: 'italic',
    },
    regionGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 12,
    },
    regionCard: {
        border: '0.5px solid #E8EAF0',
        borderRadius: 12,
        padding: '16px 18px',
        display: 'flex',
        flexDirection: 'column',
        gap: 0,
        background: '#FAFBFF',
    },
    regionCardTop: {
        display: 'flex',
        alignItems: 'center',
        gap: 12,
    },
    regionAvatar: {
        width: 36,
        height: 36,
        borderRadius: 8,
        background: '#EEF3FF',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: 14,
        fontWeight: 800,
        color: '#4361EE',
        flexShrink: 0,
        textTransform: 'uppercase',
    },
    regionName: {
        fontSize: 13,
        fontWeight: 700,
        color: '#1A1D2E',
        margin: 0,
        textTransform: 'uppercase',
        letterSpacing: '0.03em',
    },
    regionId: {
        fontSize: 10,
        color: '#B0B3C6',
        fontWeight: 600,
        margin: '2px 0 0',
    },
    centreLabel: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.08em',
        color: '#8B8FA8',
        margin: '0 0 6px',
    },
    centreTagWrap: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: 5,
    },
    centreTag: {
        fontSize: 10,
        fontWeight: 700,
        padding: '2px 8px',
        background: '#EEF3FF',
        color: '#4361EE',
        borderRadius: 4,
    },
    moreTag: {
        fontSize: 10,
        fontWeight: 600,
        color: '#B0B3C6',
        padding: '2px 4px',
    },
    regionCardFooter: {
        marginTop: 14,
        paddingTop: 12,
        borderTop: '0.5px solid #E8EAF0',
    },
    manageBtn: {
        width: '100%',
        padding: '7px 0',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        background: '#fff',
        color: '#4361EE',
        border: '0.5px solid #C5D0FF',
        borderRadius: 8,
        cursor: 'pointer',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        transition: 'background 0.15s, color 0.15s',
    },
};
