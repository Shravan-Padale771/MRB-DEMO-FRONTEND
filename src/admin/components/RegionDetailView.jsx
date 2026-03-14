import React, { useMemo, useState } from 'react';
import { 
    ArrowLeft, 
    MapPin, 
    Building2, 
    School, 
    Users, 
    PieChart as PieChartIcon,
    Table as TableIcon,
    Activity,
    FileText
} from 'lucide-react';
import { useQuery, useQueries } from '@tanstack/react-query';
import { 
    getSchools, 
    getExamCentres, 
    getExamApplications,
    getSchoolCountByRegion,
    getExamCentreCountByRegion,
    getStudentCountByRegion,
    getSchoolCountByExamCentre
} from '../../api';
import { 
    ResponsiveContainer, 
    PieChart, 
    Pie, 
    Cell, 
    Tooltip, 
    Legend,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid
} from 'recharts';
import ExamCentreDetailView from './ExamCentreDetailView';

const RegionDetailView = ({ region, onBack }) => {
    const [selectedCentre, setSelectedCentre] = useState(null);

    // Fetch exam centres for this specific region
    const { data: centresPage, isLoading: isLoadingCentres } = useQuery({
        queryKey: ['exam-centres', { regionId: region.regionId }],
        queryFn: () => getExamCentres({ regionId: region.regionId, size: 1000 }),
    });

    // Fetch schools for this specific region only
    const { data: schoolsPage, isLoading: isLoadingSchools } = useQuery({
        queryKey: ['schools', { regionId: region.regionId }],
        queryFn: () => getSchools({ regionId: region.regionId, size: 1000 }),
    });

    // Fetch applications for this specific region
    const { data: applicationsPage, isLoading: isLoadingApplications } = useQuery({
        queryKey: ['applications', { regionId: region.regionId }],
        queryFn: () => getExamApplications({ regionId: region.regionId, size: 1000 }),
    });

    const schools = schoolsPage?.content || [];
    const examCentres = centresPage?.content || [];
    const applications = applicationsPage?.content || [];

    // Analytics from new API endpoints
    const { data: schoolCount } = useQuery({
        queryKey: ['schoolCount', region.regionId],
        queryFn: () => getSchoolCountByRegion(region.regionId),
    });

    const { data: centreCount } = useQuery({
        queryKey: ['centreCount', region.regionId],
        queryFn: () => getExamCentreCountByRegion(region.regionId),
    });

    const { data: studentCount } = useQuery({
        queryKey: ['studentCount', region.regionId],
        queryFn: () => getStudentCountByRegion(region.regionId),
    });

    const centreSchoolCounts = useQueries({
        queries: examCentres.map(centre => ({
            queryKey: ['schoolCount', 'centre', centre.centreId],
            queryFn: () => getSchoolCountByExamCentre(centre.centreId),
            staleTime: 60000,
        }))
    });

    // Calculate metrics and distribution
    const analytics = useMemo(() => {
        const centreStats = examCentres.map((centre, index) => {
            const apiCount = centreSchoolCounts[index]?.data;

            let schoolCount = apiCount;

            // Fallback robustly if API count is still loading
            if (schoolCount === undefined) {
                const centreSchools = schools.filter(s => 
                    String(s.centreId) === String(centre.centreId) || 
                    s.examCentre?.centreId === centre.centreId || 
                    (typeof s.examCentre === 'object' && s.examCentre?.centreId === centre.centreId) ||
                    s.examCentre === centre.centreName ||
                    s.centreName === centre.centreName
                );
                schoolCount = centreSchools.length;
            }

            return {
                name: centre.centreName,
                code: centre.centreCode,
                schoolCount: schoolCount,
                id: centre.centreId
            };
        });

        const totalSchools = schools.length;
        const totalCentres = examCentres.length;
        const totalApplications = applications.length;

        return {
            centreStats,
            totalSchools: schoolCount ?? schools.length,
            totalCentres: centreCount ?? examCentres.length,
            totalStudents: studentCount ?? 0,
            totalApplications: applications.length
        };
    }, [schools, examCentres, applications, schoolCount, centreCount, studentCount, centreSchoolCounts]);

    const COLORS = ['#4c84ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (isLoadingSchools || isLoadingCentres || isLoadingApplications) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-gray-500 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Regional Data...</p>
            </div>
        );
    }

    if (selectedCentre) {
        return <ExamCentreDetailView centre={selectedCentre} onBack={() => setSelectedCentre(null)} />;
    }

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button 
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                    >
                        <ArrowLeft className="text-gray-400 group-hover:text-indigo-600" size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-2">
                            <MapPin className="text-indigo-600" size={20} />
                            <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight">
                                {region.regionName} <span className="text-gray-300 font-medium ml-2">#{region.regionId}</span>
                            </h2>
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 ml-7">Regional Management Hub</p>
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Building2 size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Exam Centres</p>
                            <p className="text-lg font-black text-gray-900 leading-none mt-1">{analytics.totalCentres}</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                            <School size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Total Schools</p>
                            <p className="text-lg font-black text-gray-900 leading-none mt-1">{analytics.totalSchools}</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Total Students</p>
                            <p className="text-lg font-black text-gray-900 leading-none mt-1">{analytics.totalStudents}</p>
                        </div>
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600">
                            <FileText size={16} />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-gray-400 uppercase leading-none">Applications</p>
                            <p className="text-lg font-black text-gray-900 leading-none mt-1">{analytics.totalApplications}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Distribution Chart */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                    <div className="flex items-center gap-2 mb-6">
                        <PieChartIcon className="text-indigo-500" size={18} />
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">School Distribution</h3>
                    </div>
                    
                    <div className="flex-1 min-h-[250px] flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={analytics.centreStats}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="schoolCount"
                                >
                                    {analytics.centreStats.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend iconType="circle" wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Centres Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TableIcon className="text-indigo-500" size={18} />
                            <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Exam Centres Breakdown</h3>
                        </div>
                        <span className="text-[10px] font-black bg-indigo-50 text-indigo-600 px-2 py-1 rounded-full uppercase">
                            Operational Units
                        </span>
                    </div>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Centre Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Centre Code</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Schools</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Status</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Action</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {analytics.centreStats.map((centre, idx) => {
                                    const fullCentre = examCentres.find(c => c.centreId === centre.id) || centre;
                                    return (
                                    <tr key={centre.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-2 rounded-full`} style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                                                <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">
                                                    {centre.name}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                                                {centre.code}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-indigo-50 text-indigo-700 text-xs font-black">
                                                {centre.schoolCount}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded uppercase tracking-tighter">
                                                Active
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button 
                                                onClick={() => setSelectedCentre(fullCentre)}
                                                className="text-[10px] font-black bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white px-3 py-1.5 rounded-lg uppercase tracking-widest transition-all shadow-sm"
                                            >
                                                Details
                                            </button>
                                        </td>
                                    </tr>
                                    );
                                })}
                                {analytics.centreStats.length === 0 && (
                                    <tr>
                                        <td colSpan="4" className="px-6 py-12 text-center text-gray-400 italic font-bold">
                                            No exam centres mapped to this region
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Efficiency Note */}
                <div className="col-span-full bg-gradient-to-r from-indigo-600 to-blue-600 p-6 rounded-2xl text-white shadow-lg flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h4 className="font-black uppercase tracking-tight text-lg leading-tight">Regional Performance Index</h4>
                            <p className="text-indigo-100 text-xs font-bold uppercase tracking-widest mt-1">Real-time resource allocation monitoring</p>
                        </div>
                    </div>
                    <div className="text-right hidden md:block">
                        <p className="text-[10px] font-black text-white/60 uppercase tracking-widest">Average Density</p>
                        <p className="text-2xl font-black">
                            {analytics.totalCentres > 0 ? (analytics.totalSchools / analytics.totalCentres).toFixed(1) : 0}
                            <span className="text-xs font-bold ml-1 opacity-60">S/C</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegionDetailView;
