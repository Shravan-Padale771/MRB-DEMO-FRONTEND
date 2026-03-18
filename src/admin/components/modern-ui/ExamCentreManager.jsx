// import React, { useState, useMemo } from 'react';
// import { Building2, Plus, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';
// import toast from 'react-hot-toast';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import Pagination from '../../common/components/Pagination';
// import { createExamCentre, getExamCentres, getRegions } from '../../api';
// import ExamCentreDetailView from './ExamCentreDetailView';

// const ExamCentreManager = () => {
//     const queryClient = useQueryClient();
//     const [formData, setFormData] = useState({
//         centreCode: "",
//         centreName: "",
//         regionId: ""
//     });
//     const [filterRegion, setFilterRegion] = useState("");
//     const [page, setPage] = useState(0);
//     const [size] = useState(10);
//     const [selectedCentre, setSelectedCentre] = useState(null);

//     // Metadata Queries
//     const { data: regionsPage, isLoading: isLoadingRegions } = useQuery({
//         queryKey: ['regions'],
//         queryFn: () => getRegions({ size: 1000 }),
//     });
//     const regions = regionsPage?.content || [];

//     // API Query for Exam Centres
//     const { data: centresData, isLoading: isLoadingCentres, refetch: refetchCentres } = useQuery({
//         queryKey: ['examCentres', filterRegion, page, size],
//         queryFn: () => getExamCentres({
//             regionId: filterRegion || undefined,
//             page,
//             size,
//             sort: 'centreName,asc'
//         }),
//         keepPreviousData: true
//     });

//     const centres = centresData?.content || [];
//     const totalPages = centresData?.totalPages ?? (centresData?.totalElements ? Math.ceil(centresData.totalElements / size) : 0);

//     // Mutation
//     const addCentreMutation = useMutation({
//         mutationFn: ({ regionId, payload }) => createExamCentre(payload, regionId),
//         onSuccess: () => {
//             toast.success("Exam Centre added!");
//             setFormData({ centreCode: "", centreName: "", regionId: "" });
//             queryClient.invalidateQueries({ queryKey: ['examCentres'] });
//         },
//         onError: (error) => {
//             console.error("Error adding exam centre:", error);
//             toast.error("Failed to add exam centre");
//         }
//     });

//     const loading = isLoadingCentres || isLoadingRegions || addCentreMutation.isPending;

//     const handleAddCentre = (e) => {
//         e.preventDefault();
//         if (!formData.centreCode || !formData.centreName || !formData.regionId) {
//             return toast.error("Please fill all fields");
//         }

//         addCentreMutation.mutate({
//             regionId: formData.regionId,
//             payload: {
//                 centreCode: formData.centreCode,
//                 centreName: formData.centreName
//             }
//         });
//     };

//     const handleRefresh = () => {
//         refetchCentres();
//     };

//     if (selectedCentre) {
//         return <ExamCentreDetailView centre={selectedCentre} onBack={() => setSelectedCentre(null)} />;
//     }

//     return (
//         <div className="space-y-6">
//             <div className="bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
//                 <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
//                     <Building2 size={24} /> Exam Centre Management
//                 </h2>

//                 <form onSubmit={handleAddCentre} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//                     <div className="space-y-2">
//                         <label className="text-sm font-semibold text-gray-600">Centre Code</label>
//                         <input
//                             type="text"
//                             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
//                             placeholder="e.g. EC101"
//                             value={formData.centreCode}
//                             onChange={(e) => setFormData({ ...formData, centreCode: e.target.value })}
//                             required
//                         />
//                     </div>
//                     <div className="space-y-2">
//                         <label className="text-sm font-semibold text-gray-600">Centre Name</label>
//                         <input
//                             type="text"
//                             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
//                             placeholder="e.g. Modern School Pune"
//                             value={formData.centreName}
//                             onChange={(e) => setFormData({ ...formData, centreName: e.target.value })}
//                             required
//                         />
//                     </div>
//                     <div className="space-y-2">
//                         <label className="text-sm font-semibold text-gray-600">Region</label>
//                         <select
//                             className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white font-medium"
//                             value={formData.regionId}
//                             onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
//                             required
//                         >
//                             <option value="">Select Region</option>
//                             {Array.isArray(regions) && regions.map((r, idx) => (
//                                 <option key={r.regionId || `opt-${idx}`} value={r.regionId}>{r.regionName}</option>
//                             ))}
//                         </select>
//                     </div>
//                     <button
//                         type="submit"
//                         disabled={addCentreMutation.isPending}
//                         className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
//                     >
//                         {addCentreMutation.isPending ? <RefreshCw className="animate-spin" size={20} /> : <Plus size={20} />}
//                         Add Centre
//                     </button>
//                 </form>
//             </div>

//             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//                 <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
//                     <div>
//                         <h3 className="text-lg font-bold text-gray-800">Existing Exam Centres</h3>
//                         <p className="text-xs text-gray-500 mt-1 uppercase font-bold tracking-widest">Listing {centresData?.totalElements || 0} Centres</p>
//                     </div>

//                     <div className="flex items-center gap-4 w-full md:w-auto">
//                         <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100 flex-1 md:flex-initial">
//                             <span className="text-[10px] font-black text-gray-400 uppercase">Filter Region:</span>
//                             <select
//                                 className="text-xs bg-transparent outline-none font-bold text-indigo-600"
//                                 value={filterRegion}
//                                 onChange={(e) => { setFilterRegion(e.target.value); setPage(0); }}
//                             >
//                                 <option value="">All Regions</option>
//                                 {regions.map(r => (
//                                     <option key={r.regionId} value={r.regionId}>{r.regionName}</option>
//                                 ))}
//                             </select>
//                         </div>
//                         <button
//                             onClick={handleRefresh}
//                             className="text-indigo-600 hover:text-indigo-800 flex items-center gap-1 text-sm font-medium p-2 hover:bg-indigo-50 rounded-lg transition-colors"
//                         >
//                             <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
//                         </button>
//                     </div>
//                 </div>

//                 <div className="overflow-x-auto custom-scrollbar">
//                     <table className="w-full text-left border-collapse">
//                         <thead>
//                             <tr className="bg-gray-50 border-b">
//                                 <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">ID</th>
//                                 <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Code</th>
//                                 <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Centre Name</th>
//                                 <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider">Region</th>
//                                 <th className="p-4 text-[11px] font-black text-gray-400 uppercase tracking-wider text-right">Action</th>
//                             </tr>
//                         </thead>
//                         <tbody>
//                             {(centres.length === 0 && !isLoadingCentres) ? (
//                                 <tr>
//                                     <td colSpan="4" className="p-12 text-center">
//                                         <Building2 size={48} className="mx-auto text-gray-100 mb-4" />
//                                         <p className="text-gray-400 italic font-medium">No centres match your filter</p>
//                                     </td>
//                                 </tr>
//                             ) : (
//                                 centres.map((centre, idx) => {
//                                     return (
//                                         <tr key={centre.centreId || `centre-${idx}`} className="border-b hover:bg-indigo-50/30 transition-colors group">
//                                             <td className="p-4 text-xs font-bold text-gray-400">#{centre.centreId}</td>
//                                             <td className="p-4 text-sm font-mono font-bold text-indigo-600 uppercase">{centre.centreCode}</td>
//                                             <td className="p-4 text-sm font-bold text-gray-800 group-hover:text-indigo-700 transition-colors">{centre.centreName}</td>
//                                             <td className="p-4">
//                                                 <span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-[10px] font-black uppercase tracking-tighter shadow-sm">
//                                                     {centre.regionName || "City Area"}
//                                                 </span>
//                                             </td>
//                                             <td className="p-4 text-right">
//                                                 <button 
//                                                     onClick={() => setSelectedCentre(centre)}
//                                                     className="text-[10px] font-black bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all shadow-sm"
//                                                 >
//                                                     Details
//                                                 </button>
//                                             </td>
//                                         </tr>
//                                     )
//                                 })
//                             )}
//                         </tbody>
//                     </table>
//                 </div>

//                 {totalPages > 1 && (
//                     <Pagination 
//                         currentPage={page} 
//                         totalPages={totalPages} 
//                         onPageChange={setPage} 
//                     />
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ExamCentreManager;



import React, { useState } from 'react';
import { Building2, Plus, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import Pagination from '../../../common/components/Pagination';
import { createExamCentre, getExamCentres, getRegions } from '../../../api';
import ExamCentreDetailView from '../ExamCentreDetailView';

const ExamCentreManager = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ centreCode: "", centreName: "", regionId: "" });
    const [filterRegion, setFilterRegion] = useState("");
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [selectedCentre, setSelectedCentre] = useState(null);

    const { data: regionsPage, isLoading: isLoadingRegions } = useQuery({
        queryKey: ['regions'],
        queryFn: () => getRegions({ size: 1000 }),
    });
    const regions = regionsPage?.content || [];

    const { data: centresData, isLoading: isLoadingCentres, refetch: refetchCentres } = useQuery({
        queryKey: ['examCentres', filterRegion, page, size],
        queryFn: () => getExamCentres({ regionId: filterRegion || undefined, page, size, sort: 'centreName,asc' }),
        keepPreviousData: true,
    });

    const centres = centresData?.content || [];
    const totalPages = centresData?.totalPages ?? (centresData?.totalElements ? Math.ceil(centresData.totalElements / size) : 0);

    const addCentreMutation = useMutation({
        mutationFn: ({ regionId, payload }) => createExamCentre(payload, regionId),
        onSuccess: () => {
            toast.success("Exam Centre added!");
            setFormData({ centreCode: "", centreName: "", regionId: "" });
            queryClient.invalidateQueries({ queryKey: ['examCentres'] });
        },
        onError: () => toast.error("Failed to add exam centre"),
    });

    const loading = isLoadingCentres || isLoadingRegions || addCentreMutation.isPending;

    const handleAddCentre = (e) => {
        e.preventDefault();
        if (!formData.centreCode || !formData.centreName || !formData.regionId)
            return toast.error("Please fill all fields");
        addCentreMutation.mutate({
            regionId: formData.regionId,
            payload: { centreCode: formData.centreCode, centreName: formData.centreName },
        });
    };

    if (selectedCentre) {
        return <ExamCentreDetailView centre={selectedCentre} onBack={() => setSelectedCentre(null)} />;
    }

    return (
        <div style={s.page}>

            {/* Add Centre Form */}
            <div style={s.card}>
                <div style={s.cardHeader}>
                    <div>
                        <p style={s.cardTitle}>Exam Centre Management</p>
                        <p style={s.cardSub}>Register new exam centres and assign them to regions</p>
                    </div>
                </div>
                <form onSubmit={handleAddCentre} style={s.formGrid}>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>Centre Code</label>
                        <input
                            type="text"
                            style={s.input}
                            placeholder="e.g. EC101"
                            value={formData.centreCode}
                            onChange={(e) => setFormData({ ...formData, centreCode: e.target.value })}
                            required
                        />
                    </div>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>Centre Name</label>
                        <input
                            type="text"
                            style={s.input}
                            placeholder="e.g. Modern School Pune"
                            value={formData.centreName}
                            onChange={(e) => setFormData({ ...formData, centreName: e.target.value })}
                            required
                        />
                    </div>
                    <div style={s.fieldWrap}>
                        <label style={s.label}>Region</label>
                        <select
                            style={s.select}
                            value={formData.regionId}
                            onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                            required
                        >
                            <option value="">Select Region</option>
                            {regions.map((r, idx) => (
                                <option key={r.regionId || idx} value={r.regionId}>{r.regionName}</option>
                            ))}
                        </select>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end' }}>
                        <button type="submit" disabled={addCentreMutation.isPending} style={s.btn}>
                            {addCentreMutation.isPending
                                ? <RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} />
                                : <Plus size={14} />}
                            Add Centre
                        </button>
                    </div>
                </form>
            </div>

            {/* Centre List */}
            <div style={s.card}>
                <div style={s.cardHeader}>
                    <div>
                        <p style={s.cardTitle}>Existing Exam Centres</p>
                        <p style={s.cardSub}>{centresData?.totalElements || 0} centres total</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={s.filterWrap}>
                            <span style={s.filterLabel}>Region</span>
                            <select
                                style={s.filterSelect}
                                value={filterRegion}
                                onChange={(e) => { setFilterRegion(e.target.value); setPage(0); }}
                            >
                                <option value="">All</option>
                                {regions.map(r => (
                                    <option key={r.regionId} value={r.regionId}>{r.regionName}</option>
                                ))}
                            </select>
                        </div>
                        <button onClick={() => refetchCentres()} style={s.iconBtn} title="Refresh">
                            <RefreshCw size={14} style={loading ? { animation: 'spin 1s linear infinite' } : {}} />
                        </button>
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    <table style={s.table}>
                        <thead>
                            <tr style={s.thead}>
                                <th style={s.th}>ID</th>
                                <th style={s.th}>Code</th>
                                <th style={s.th}>Centre Name</th>
                                <th style={s.th}>Region</th>
                                <th style={{ ...s.th, textAlign: 'right' }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {centres.length === 0 && !isLoadingCentres ? (
                                <tr>
                                    <td colSpan="5" style={s.emptyCell}>
                                        <Building2 size={32} style={{ color: '#D1D5E8', marginBottom: 10 }} />
                                        <p style={s.emptyText}>No centres match your filter</p>
                                    </td>
                                </tr>
                            ) : (
                                centres.map((centre, idx) => (
                                    <tr key={centre.centreId || idx} style={s.tr}>
                                        <td style={s.tdMuted}>#{centre.centreId}</td>
                                        <td style={s.tdCode}>{centre.centreCode}</td>
                                        <td style={s.tdMain}>{centre.centreName}</td>
                                        <td style={s.tdRegion}>
                                            <span style={s.regionTag}>{centre.regionName || '—'}</span>
                                        </td>
                                        <td style={{ ...s.td, textAlign: 'right' }}>
                                            <button
                                                onClick={() => setSelectedCentre(centre)}
                                                style={s.detailBtn}
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {totalPages > 1 && (
                    <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default ExamCentreManager;

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
    formGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr auto',
        gap: 12,
        alignItems: 'end',
    },
    fieldWrap: {
        display: 'flex',
        flexDirection: 'column',
        gap: 5,
    },
    label: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#8B8FA8',
    },
    input: {
        padding: '9px 12px',
        fontSize: 13,
        border: '0.5px solid #E8EAF0',
        borderRadius: 8,
        outline: 'none',
        color: '#1A1D2E',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: '#fff',
    },
    select: {
        padding: '9px 12px',
        fontSize: 13,
        border: '0.5px solid #E8EAF0',
        borderRadius: 8,
        outline: 'none',
        color: '#1A1D2E',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: '#fff',
        width: '100%',
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
        width: '100%',
        justifyContent: 'center',
    },
    filterWrap: {
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        background: '#FAFBFF',
        border: '0.5px solid #E8EAF0',
        borderRadius: 8,
        padding: '5px 10px',
    },
    filterLabel: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: '#8B8FA8',
        whiteSpace: 'nowrap',
    },
    filterSelect: {
        fontSize: 12,
        fontWeight: 600,
        color: '#4361EE',
        background: 'transparent',
        border: 'none',
        outline: 'none',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        cursor: 'pointer',
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
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: 13,
    },
    thead: {
        background: '#FAFBFF',
    },
    th: {
        padding: '10px 14px',
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        color: '#8B8FA8',
        borderBottom: '0.5px solid #E8EAF0',
        textAlign: 'left',
        whiteSpace: 'nowrap',
    },
    tr: {
        borderBottom: '0.5px solid #F0F1F7',
    },
    td: {
        padding: '11px 14px',
        color: '#1A1D2E',
    },
    tdMuted: {
        padding: '11px 14px',
        fontSize: 12,
        fontWeight: 600,
        color: '#B0B3C6',
    },
    tdCode: {
        padding: '11px 14px',
        fontSize: 12,
        fontWeight: 700,
        color: '#4361EE',
        fontFamily: 'monospace',
        textTransform: 'uppercase',
    },
    tdMain: {
        padding: '11px 14px',
        fontSize: 13,
        fontWeight: 500,
        color: '#1A1D2E',
    },
    tdRegion: {
        padding: '11px 14px',
    },
    regionTag: {
        fontSize: 10,
        fontWeight: 700,
        padding: '3px 8px',
        background: '#EEF3FF',
        color: '#4361EE',
        borderRadius: 4,
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
    },
    detailBtn: {
        fontSize: 10,
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: '0.07em',
        padding: '5px 12px',
        background: '#EEF3FF',
        color: '#4361EE',
        border: 'none',
        borderRadius: 6,
        cursor: 'pointer',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif',",
    },
    emptyCell: {
        textAlign: 'center',
        padding: '40px 0',
        color: '#B0B3C6',
    },
    emptyText: {
        fontSize: 13,
        color: '#B0B3C6',
        fontStyle: 'italic',
        margin: 0,
    },
};