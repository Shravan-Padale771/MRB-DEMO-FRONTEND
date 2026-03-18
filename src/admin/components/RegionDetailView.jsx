// import React, { useMemo, useState } from 'react';
// import { 
//     ArrowLeft, 
//     MapPin, 
//     Building2, 
//     School, 
//     Users, 
//     PieChart as PieChartIcon,
//     Table as TableIcon,
//     Activity,
//     FileText
// } from 'lucide-react';
// import { useQuery, useQueries } from '@tanstack/react-query';
// import { 
//     getSchools, 
//     getExamCentres, 
//     getExamApplications,
//     getSchoolCountByRegion,
//     getExamCentreCountByRegion,
//     getStudentCountByRegion,
//     getSchoolCountByExamCentre
// } from '../../api';
// import { 
//     ResponsiveContainer, 
//     PieChart, 
//     Pie, 
//     Cell, 
//     Tooltip, 
//     Legend,
//     BarChart,
//     Bar,
//     XAxis,
//     YAxis,
//     CartesianGrid
// } from 'recharts';
// import ExamCentreDetailView from './ExamCentreDetailView';

// const RegionDetailView = ({ region, onBack }) => {
//     const [selectedCentre, setSelectedCentre] = useState(null);

//     // Fetch exam centres for this specific region
//     const { data: centresPage, isLoading: isLoadingCentres } = useQuery({
//         queryKey: ['exam-centres', { regionId: region.regionId }],
//         queryFn: () => getExamCentres({ regionId: region.regionId, size: 1000 }),
//     });

//     // Fetch schools for this specific region only
//     const { data: schoolsPage, isLoading: isLoadingSchools } = useQuery({
//         queryKey: ['schools', { regionId: region.regionId }],
//         queryFn: () => getSchools({ regionId: region.regionId, size: 1000 }),
//     });

//     // Fetch applications for this specific region
//     const { data: applicationsPage, isLoading: isLoadingApplications } = useQuery({
//         queryKey: ['applications', { regionId: region.regionId }],
//         queryFn: () => getExamApplications({ regionId: region.regionId, size: 1000 }),
//     });

//     const schools = schoolsPage?.content || [];
//     const examCentres = centresPage?.content || [];
//     const applications = applicationsPage?.content || [];

//     // Analytics from new API endpoints
//     const { data: schoolCount } = useQuery({
//         queryKey: ['schoolCount', region.regionId],
//         queryFn: () => getSchoolCountByRegion(region.regionId),
//     });

//     const { data: centreCount } = useQuery({
//         queryKey: ['centreCount', region.regionId],
//         queryFn: () => getExamCentreCountByRegion(region.regionId),
//     });

//     const { data: studentCount } = useQuery({
//         queryKey: ['studentCount', region.regionId],
//         queryFn: () => getStudentCountByRegion(region.regionId),
//     });

//     const centreSchoolCounts = useQueries({
//         queries: examCentres.map(centre => ({
//             queryKey: ['schoolCount', 'centre', centre.centreId],
//             queryFn: () => getSchoolCountByExamCentre(centre.centreId),
//             staleTime: 60000,
//         }))
//     });

//     // Calculate metrics and distribution
//     const analytics = useMemo(() => {
//         const centreStats = examCentres.map((centre, index) => {
//             const apiCount = centreSchoolCounts[index]?.data;

//             let schoolCount = apiCount;

//             // Fallback robustly if API count is still loading
//             if (schoolCount === undefined) {
//                 const centreSchools = schools.filter(s => 
//                     String(s.centreId) === String(centre.centreId) || 
//                     s.examCentre?.centreId === centre.centreId || 
//                     (typeof s.examCentre === 'object' && s.examCentre?.centreId === centre.centreId) ||
//                     s.examCentre === centre.centreName ||
//                     s.centreName === centre.centreName
//                 );
//                 schoolCount = centreSchools.length;
//             }

//             return {
//                 name: centre.centreName,
//                 code: centre.centreCode,
//                 schoolCount: schoolCount,
//                 id: centre.centreId
//             };
//         });

//         const totalSchools = schools.length;
//         const totalCentres = examCentres.length;
//         const totalApplications = applications.length;

//         return {
//             centreStats,
//             totalSchools: schoolCount ?? schools.length,
//             totalCentres: centreCount ?? examCentres.length,
//             totalStudents: studentCount ?? 0,
//             totalApplications: applications.length
//         };
//     }, [schools, examCentres, applications, schoolCount, centreCount, studentCount, centreSchoolCounts]);

//     const COLORS = ['#4c84ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

//     if (isLoadingSchools || isLoadingCentres || isLoadingApplications) {
//         return (
//             <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
//                 <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
//                 <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Regional Data...</p>
//             </div>
//         );
//     }

//     if (selectedCentre) {
//         return <ExamCentreDetailView centre={selectedCentre} onBack={() => setSelectedCentre(null)} />;
//     }

//     return (
//         <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
//             {/* Header */}
//             <div className="flex items-center justify-between">
//                 <div className="flex items-center gap-4">
//                     <button 
//                         onClick={onBack}
//                         className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
//                     >
//                         <ArrowLeft className="text-gray-400 group-hover:text-indigo-600" size={24} />
//                     </button>
//                     <div>
//                         <div className="flex items-center gap-2">
//                             <MapPin className="text-indigo-600" size={20} />
//                             <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
//                                 {region.regionName} <span className="text-gray-300 font-medium ml-2">#{region.regionId}</span>
//                             </h2>
//                         </div>
//                         <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 ml-7">Regional Management Hub</p>
//                     </div>
//                 </div>

//                 <div className="flex gap-2">
//                     <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
//                         <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
//                             <Building2 size={16} />
//                         </div>
//                         <div>
//                             <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Exam Centres</p>
//                             <p className="text-lg font-black text-gray-900 leading-none mt-1">{analytics.totalCentres}</p>
//                         </div>
//                     </div>
//                     <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
//                         <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
//                             <School size={16} />
//                         </div>
//                         <div>
//                             <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Total Schools</p>
//                             <p className="text-lg font-black text-gray-900 leading-none mt-1">{analytics.totalSchools}</p>
//                         </div>
//                     </div>
//                     <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
//                         <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
//                             <Users size={16} />
//                         </div>
//                         <div>
//                             <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Total Students</p>
//                             <p className="text-lg font-black text-gray-900 leading-none mt-1">{analytics.totalStudents}</p>
//                         </div>
//                     </div>
//                     <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
//                         <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
//                             <FileText size={16} />
//                         </div>
//                         <div>
//                             <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Applications</p>
//                             <p className="text-lg font-black text-gray-900 leading-none mt-1">{analytics.totalApplications}</p>
//                         </div>
//                     </div>
//                 </div>
//             </div>

//             {/* Content Grid */}
//             <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

//                 {/* Distribution Chart */}
//                 <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
//                     <div className="flex items-center gap-2 mb-6">
//                         <PieChartIcon className="text-indigo-500" size={18} />
//                         <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">School Distribution</h3>
//                     </div>

//                     <div className="flex-1 min-h-[250px] flex items-center justify-center">
//                         <ResponsiveContainer width="100%" height="100%">
//                             <PieChart>
//                                 <Pie
//                                     data={analytics.centreStats}
//                                     cx="50%"
//                                     cy="50%"
//                                     innerRadius={60}
//                                     outerRadius={80}
//                                     paddingAngle={5}
//                                     dataKey="schoolCount"
//                                 >
//                                     {analytics.centreStats.map((entry, index) => (
//                                         <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
//                                     ))}
//                                 </Pie>
//                                 <Tooltip 
//                                     contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
//                                 />
//                                 <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
//                             </PieChart>
//                         </ResponsiveContainer>
//                     </div>
//                 </div>

//                 {/* Centres Table */}
//                 <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
//                     <div className="p-6 border-b border-gray-50 flex items-center justify-between">
//                         <div className="flex items-center gap-2">
//                             <TableIcon className="text-indigo-500" size={18} />
//                             <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Exam Centres Breakdown</h3>
//                         </div>
//                         <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full uppercase">
//                             Operational Units
//                         </span>
//                     </div>

//                     <div className="overflow-x-auto">
//                         <table className="w-full text-left">
//                             <thead className="bg-gray-50/50">
//                                 <tr>
//                                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Centre Name</th>
//                                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Centre Code</th>
//                                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Schools</th>
//                                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
//                                     <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
//                                 </tr>
//                             </thead>
//                             <tbody className="divide-y divide-gray-50">
//                                 {analytics.centreStats.map((centre, idx) => {
//                                     const fullCentre = examCentres.find(c => c.centreId === centre.id) || centre;
//                                     return (
//                                     <tr key={centre.id} className="hover:bg-gray-50/80 transition-colors group">
//                                         <td className="px-6 py-4">
//                                             <div className="flex items-center gap-3">
//                                                 <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
//                                                 <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
//                                                     {centre.name}
//                                                 </span>
//                                             </div>
//                                         </td>
//                                         <td className="px-6 py-4">
//                                             <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
//                                                 {centre.code}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black">
//                                                 {centre.schoolCount}
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-center">
//                                             <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded uppercase tracking-tighter">
//                                                 Active
//                                             </span>
//                                         </td>
//                                         <td className="px-6 py-4 text-right">
//                                             <button 
//                                                 onClick={() => setSelectedCentre(fullCentre)}
//                                                 className="text-[10px] font-black bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all shadow-sm"
//                                             >
//                                                 Details
//                                             </button>
//                                         </td>
//                                     </tr>
//                                     );
//                                 })}
//                                 {analytics.centreStats.length === 0 && (
//                                     <tr>
//                                         <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic font-bold">
//                                             No exam centres mapped to this region
//                                         </td>
//                                     </tr>
//                                 )}
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>

//                 {/* Efficiency Note */}
//                 <div className="col-span-full bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-2xl text-white shadow-lg flex items-center justify-between">
//                     <div className="flex items-center gap-4">
//                         <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
//                             <Activity size={24} />
//                         </div>
//                         <div>
//                             <h4 className="font-black uppercase tracking-tight text-lg leading-tight">Regional Performance Index</h4>
//                             <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">Real-time resource allocation monitoring</p>
//                         </div>
//                     </div>
//                     <div className="text-right hidden md:block">
//                         <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Average Density</p>
//                         <p className="text-2xl font-black">
//                             {analytics.totalCentres > 0 ? (analytics.totalSchools / analytics.totalCentres).toFixed(1) : 0}
//                             <span className="text-xs font-bold ml-1 opacity-60">S/C</span>
//                         </p>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default RegionDetailView;


import React, { useMemo, useState } from 'react';
import { ArrowLeft, MapPin, Building2, Users, FileText, Table as TableIcon } from 'lucide-react';
import { useQuery, useQueries } from '@tanstack/react-query';
import {
    getSchools, getExamCentres, getExamApplications,
    getSchoolCountByRegion, getExamCentreCountByRegion,
    getStudentCountByRegion, getSchoolCountByExamCentre,
} from '../../api';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';
import ExamCentreDetailView from './ExamCentreDetailView';

const COLORS = ['#4361EE', '#2F9E44', '#F59F00', '#F03E3E', '#AE3EC9', '#0CA678'];

const RegionDetailView = ({ region, onBack }) => {
    const [selectedCentre, setSelectedCentre] = useState(null);

    const { data: centresPage, isLoading: isLoadingCentres } = useQuery({
        queryKey: ['exam-centres', { regionId: region.regionId }],
        queryFn: () => getExamCentres({ regionId: region.regionId, size: 1000 }),
    });
    const { data: schoolsPage, isLoading: isLoadingSchools } = useQuery({
        queryKey: ['schools', { regionId: region.regionId }],
        queryFn: () => getSchools({ regionId: region.regionId, size: 1000 }),
    });
    const { data: applicationsPage, isLoading: isLoadingApplications } = useQuery({
        queryKey: ['applications', { regionId: region.regionId }],
        queryFn: () => getExamApplications({ regionId: region.regionId, size: 1000 }),
    });

    const schools = schoolsPage?.content || [];
    const examCentres = centresPage?.content || [];
    const applications = applicationsPage?.content || [];

    const { data: schoolCount } = useQuery({ queryKey: ['schoolCount', region.regionId], queryFn: () => getSchoolCountByRegion(region.regionId) });
    const { data: centreCount } = useQuery({ queryKey: ['centreCount', region.regionId], queryFn: () => getExamCentreCountByRegion(region.regionId) });
    const { data: studentCount } = useQuery({ queryKey: ['studentCount', region.regionId], queryFn: () => getStudentCountByRegion(region.regionId) });

    const centreSchoolCounts = useQueries({
        queries: examCentres.map(c => ({
            queryKey: ['schoolCount', 'centre', c.centreId],
            queryFn: () => getSchoolCountByExamCentre(c.centreId),
            staleTime: 60000,
        })),
    });

    const analytics = useMemo(() => {
        const centreStats = examCentres.map((centre, idx) => {
            const apiCount = centreSchoolCounts[idx]?.data;
            let count = apiCount;
            if (count === undefined) {
                count = schools.filter(s =>
                    String(s.centreId) === String(centre.centreId) ||
                    s.examCentre?.centreId === centre.centreId ||
                    s.examCentre === centre.centreName ||
                    s.centreName === centre.centreName
                ).length;
            }
            return { name: centre.centreName, code: centre.centreCode, schoolCount: count, id: centre.centreId };
        });
        return {
            centreStats,
            totalSchools: schoolCount ?? schools.length,
            totalCentres: centreCount ?? examCentres.length,
            totalStudents: studentCount ?? 0,
            totalApplications: applications.length,
        };
    }, [schools, examCentres, applications, schoolCount, centreCount, studentCount, centreSchoolCounts]);

    if (isLoadingSchools || isLoadingCentres || isLoadingApplications) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 320, gap: 12, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>
                <div style={{ width: 36, height: 36, border: '3px solid #EEF3FF', borderTopColor: '#4361EE', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
                <p style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8B8FA8' }}>Loading Regional Data…</p>
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    if (selectedCentre) {
        return <ExamCentreDetailView centre={selectedCentre} onBack={() => setSelectedCentre(null)} />;
    }

    const kpis = [
        { label: 'Exam Centres', value: analytics.totalCentres, accent: '#4361EE' },
        { label: 'Schools', value: analytics.totalSchools, accent: '#2F9E44' },
        { label: 'Students', value: analytics.totalStudents, accent: '#F59F00' },
        { label: 'Applications', value: analytics.totalApplications, accent: '#AE3EC9' },
    ];

    return (
        <div style={s.page}>

            {/* Header */}
            <div style={s.headerCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <button onClick={onBack} style={s.backBtn}><ArrowLeft size={16} /></button>
                    <div>
                        <p style={s.pageTitle}>{region.regionName}</p>
                        <p style={s.pageSub}>Regional Management Hub · #{region.regionId}</p>
                    </div>
                </div>
                {/* KPI strip in header */}
                <div style={{ display: 'flex', gap: 10 }}>
                    {kpis.map((k, i) => (
                        <div key={i} style={{ ...s.kpiChip, borderLeftColor: k.accent }}>
                            <span style={s.kpiChipLabel}>{k.label}</span>
                            <span style={s.kpiChipVal}>{k.value}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div style={s.bodyGrid}>

                {/* Pie chart */}
                <div style={s.card}>
                    <div style={s.sectionHdr}>School Distribution</div>
                    {analytics.centreStats.length === 0 ? (
                        <div style={s.emptyWrap}><span style={s.emptyText}>No centres to display</span></div>
                    ) : (
                        <div style={{ height: 240 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={analytics.centreStats} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={4} dataKey="schoolCount">
                                        {analytics.centreStats.map((_, idx) => (
                                            <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: 10, border: '0.5px solid #E8EAF0', fontSize: 11 }} />
                                    <Legend iconType="circle" wrapperStyle={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Centres table */}
                <div style={{ ...s.card, gridColumn: 'span 2' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <div style={s.sectionHdr}>Exam Centres Breakdown</div>
                        <span style={s.badge}>Operational Units</span>
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={s.table}>
                            <thead>
                                <tr style={s.thead}>
                                    <th style={s.th}>Centre Name</th>
                                    <th style={s.th}>Code</th>
                                    <th style={{ ...s.th, textAlign: 'center' }}>Schools</th>
                                    <th style={{ ...s.th, textAlign: 'center' }}>Status</th>
                                    <th style={{ ...s.th, textAlign: 'right' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {analytics.centreStats.length === 0 ? (
                                    <tr><td colSpan="5" style={s.emptyCell}><span style={s.emptyText}>No exam centres mapped to this region</span></td></tr>
                                ) : (
                                    analytics.centreStats.map((centre, idx) => {
                                        const fullCentre = examCentres.find(c => c.centreId === centre.id) || centre;
                                        return (
                                            <tr key={centre.id} style={s.tr}>
                                                <td style={s.tdMain}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[idx % COLORS.length], flexShrink: 0 }} />
                                                        {centre.name}
                                                    </div>
                                                </td>
                                                <td style={s.tdCode}>{centre.code}</td>
                                                <td style={{ ...s.td, textAlign: 'center' }}>
                                                    <span style={s.countBadge}>{centre.schoolCount}</span>
                                                </td>
                                                <td style={{ ...s.td, textAlign: 'center' }}>
                                                    <span style={{ ...s.badge, background: '#EBFBEE', color: '#2F9E44' }}>Active</span>
                                                </td>
                                                <td style={{ ...s.td, textAlign: 'right' }}>
                                                    <button onClick={() => setSelectedCentre(fullCentre)} style={s.detailBtn}>Details</button>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Density callout */}
                <div style={s.densityCard}>
                    <div>
                        <p style={{ fontSize: 13, fontWeight: 700, color: '#4361EE', margin: 0 }}>Regional Density Index</p>
                        <p style={{ fontSize: 11, color: '#8B8FA8', margin: '3px 0 0' }}>Average schools per exam centre</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: 32, fontWeight: 800, color: '#1A1D2E', margin: 0, lineHeight: 1 }}>
                            {analytics.totalCentres > 0 ? (analytics.totalSchools / analytics.totalCentres).toFixed(1) : '—'}
                        </p>
                        <p style={{ fontSize: 10, color: '#8B8FA8', margin: '4px 0 0', fontWeight: 600 }}>S / C ratio</p>
                    </div>
                </div>
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

export default RegionDetailView;

const s = {
    page: { display: 'flex', flexDirection: 'column', gap: 14, fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    headerCard: {
        background: '#fff', borderRadius: 14, padding: '16px 22px',
        border: '0.5px solid #E8EAF0',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12,
    },
    backBtn: {
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 8,
        background: '#FAFBFF', border: '0.5px solid #E8EAF0', cursor: 'pointer', color: '#3D405B',
    },
    pageTitle: { fontSize: 14, fontWeight: 700, color: '#1A1D2E', margin: 0 },
    pageSub: { fontSize: 11, color: '#8B8FA8', margin: '2px 0 0' },
    kpiChip: {
        background: '#fff', borderRadius: 10, padding: '8px 14px',
        border: '0.5px solid #E8EAF0', borderLeft: '3px solid',
        display: 'flex', flexDirection: 'column', gap: 2, minWidth: 80,
    },
    kpiChipLabel: { fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#8B8FA8' },
    kpiChipVal: { fontSize: 20, fontWeight: 800, color: '#1A1D2E', lineHeight: 1 },
    bodyGrid: { display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 14 },
    card: { background: '#fff', borderRadius: 14, padding: '20px 22px', border: '0.5px solid #E8EAF0' },
    sectionHdr: {
        fontSize: 11, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: '#3D405B', marginBottom: 14,
    },
    badge: { fontSize: 10, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: '#EEF3FF', color: '#4361EE', letterSpacing: '0.04em' },
    table: { width: '100%', borderCollapse: 'collapse', fontSize: 13 },
    thead: { background: '#FAFBFF' },
    th: { padding: '10px 14px', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#8B8FA8', borderBottom: '0.5px solid #E8EAF0', textAlign: 'left', whiteSpace: 'nowrap' },
    tr: { borderBottom: '0.5px solid #F0F1F7' },
    td: { padding: '11px 14px', color: '#1A1D2E' },
    tdMain: { padding: '11px 14px', fontSize: 13, fontWeight: 500, color: '#1A1D2E' },
    tdCode: { padding: '11px 14px', fontSize: 12, fontWeight: 700, color: '#4361EE', fontFamily: 'monospace', textTransform: 'uppercase' },
    countBadge: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: '50%', background: '#EEF3FF', color: '#4361EE', fontSize: 12, fontWeight: 800 },
    detailBtn: { fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', padding: '5px 12px', background: '#EEF3FF', color: '#4361EE', border: 'none', borderRadius: 6, cursor: 'pointer', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    densityCard: {
        gridColumn: 'span 3', background: '#FAFBFF', borderRadius: 12, padding: '16px 22px',
        border: '0.5px solid #E8EAF0', borderLeft: '3px solid #4361EE',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    },
    emptyWrap: { display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '32px 0' },
    emptyText: { fontSize: 13, color: '#B0B3C6', fontStyle: 'italic' },
    emptyCell: { textAlign: 'center', padding: '32px 0' },
};