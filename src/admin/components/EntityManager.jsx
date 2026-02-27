import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ChevronLeft,
    User,
    Building2,
    MapPin,
    School,
    FileText,
    Award,
    Save,
    Trash2,
    Search,
    Users,
    Activity,
    Calendar,
    ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
    getStudentById,
    getAllSchools,
    getAllRegions,
    getAllExamCentres,
    getExamApplications,
    getExamResults,
    getStudents
} from '../../api';

const EntityManager = () => {
    const { type, id } = useParams();
    const navigate = useNavigate();
    const [activeSubTab, setActiveSubTab] = useState('overview');

    // Fetch entity data based on type
    const { data: entityData, isLoading: isLoadingEntity } = useQuery({
        queryKey: ['entity', type, id],
        queryFn: async () => {
            if (type === 'student') return getStudentById(id);
            if (type === 'school') {
                const schools = await getAllSchools();
                return schools.find(s => s.schoolId.toString() === id);
            }
            if (type === 'region') {
                const regions = await getAllRegions();
                return regions.find(r => r.regionId.toString() === id);
            }
            if (type === 'centre') {
                const centres = await getAllExamCentres();
                return centres.find(c => c.centreId.toString() === id);
            }
            return null;
        }
    });

    // Fetch related applications
    const { data: applicationsData } = useQuery({
        queryKey: ['applications', type, id],
        queryFn: () => getExamApplications({
            studentId: type === 'student' ? id : undefined,
            schoolId: type === 'school' ? id : undefined,
            regionId: type === 'region' ? id : undefined,
            examCentreId: type === 'centre' ? id : undefined,
            size: 50
        }),
        enabled: !!entityData
    });
    const applications = applicationsData?.content || [];

    // Fetch related results
    const { data: resultsData } = useQuery({
        queryKey: ['results', type, id],
        queryFn: () => getExamResults({
            studentId: type === 'student' ? id : undefined,
            schoolId: type === 'school' ? id : undefined,
            regionId: type === 'region' ? id : undefined,
        }),
        enabled: !!entityData
    });
    const results = resultsData?.content || [];

    // Fetch related students (for School/Centre/Region)
    const { data: studentsData } = useQuery({
        queryKey: ['students', type, id],
        queryFn: () => getStudents({
            schoolId: type === 'school' ? id : undefined,
            examCentreId: type === 'centre' ? id : undefined,
            regionId: type === 'region' ? id : undefined,
            size: 50
        }),
        enabled: !!entityData && type !== 'student'
    });
    const students = studentsData?.content || [];

    const getIcon = () => {
        switch (type) {
            case 'student': return <User size={24} />;
            case 'school': return <School size={24} />;
            case 'region': return <MapPin size={24} />;
            case 'centre': return <Building2 size={24} />;
            default: return <Search size={24} />;
        }
    };

    const getTitle = () => {
        if (!entityData) return 'Loading...';
        if (type === 'student') return `${entityData.firstName || ''} ${entityData.lastName || ''}`.trim() || entityData.username;
        if (type === 'school') return entityData.schoolName;
        if (type === 'region') return entityData.regionName;
        if (type === 'centre') return entityData.centreName;
        return `Manage ${type} #${id}`;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'APPROVED': return 'bg-emerald-50 text-emerald-600 border-emerald-100';
            case 'REJECTED': return 'bg-red-50 text-red-600 border-red-100';
            case 'PENDING': return 'bg-amber-50 text-amber-600 border-amber-100';
            case 'SUBMITTED': return 'bg-blue-50 text-blue-600 border-blue-100';
            default: return 'bg-gray-50 text-gray-500 border-gray-100';
        }
    };

    if (isLoadingEntity) {
        return <div className="flex items-center justify-center p-20 text-gray-400 font-black uppercase tracking-widest text-xs animate-pulse">Loading Details...</div>;
    }

    if (!entityData) {
        return (
            <div className="bg-white p-12 rounded-2xl shadow-xl text-center border-t-4 border-red-500">
                <Search size={48} className="mx-auto text-gray-200 mb-4" />
                <h2 className="text-xl font-black text-gray-800 uppercase tracking-tight">Entity Not Found</h2>
                <p className="text-gray-400 font-bold italic mt-2">The requested {type} could not be located.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 px-8 py-3 bg-[#4c84ff] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 shadow-lg shadow-blue-200 transition-all"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-3 bg-white hover:bg-gray-50 rounded-xl transition-all shadow-sm border border-gray-100 text-[#4c84ff]"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-[#4c84ff] text-white flex items-center justify-center shadow-xl shadow-blue-100 border-4 border-white">
                            {getIcon()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-gray-800 leading-tight">{getTitle()}</h2>
                            <p className="text-[10px] font-black text-[#4c84ff] uppercase tracking-[0.2em]">{type} Record • ID: #{id}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-white border border-red-100 text-red-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-50 transition-all">
                        <Trash2 size={16} /> Delete
                    </button>
                    <button className="flex items-center gap-2 px-6 py-2.5 bg-[#4c84ff] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-601 transition-all shadow-lg shadow-blue-100">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>

            {/* Content Sidebar + Main Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Navigation Tabs */}
                <div className="space-y-2">
                    {[
                        { id: 'overview', label: 'General Overview', icon: <Activity size={18} /> },
                        { id: 'applications', label: 'Exam Applications', icon: <FileText size={18} /> },
                        { id: 'results', label: 'Performance / Results', icon: <Award size={18} /> },
                        ...(type !== 'student' ? [{ id: 'students', label: 'Enrolled Students', icon: <Users size={18} /> }] : []),
                        { id: 'settings', label: 'Advanced Config', icon: <Settings2 size={18} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all ${activeSubTab === tab.id
                                ? 'bg-[#4c84ff] text-white shadow-xl shadow-blue-100'
                                : 'bg-white text-gray-400 hover:bg-blue-50 hover:text-[#4c84ff] border border-gray-100/50'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Data Panels */}
                <div className="lg:col-span-3">
                    {activeSubTab === 'overview' && (
                        <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm space-y-8">
                            <div className="flex items-center justify-between border-b border-gray-50 pb-6">
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={18} className="text-[#4c84ff]" /> Primary Information
                                </h3>
                                <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-3 py-1 rounded-full uppercase tracking-widest border border-emerald-100">Verified Account</span>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {Object.entries(entityData).filter(([k]) => typeof entityData[k] !== 'object' && k !== 'examApplications').map(([key, value]) => (
                                    <div key={key} className="space-y-3">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] ml-1">{key.replace(/([A-Z])/g, ' $1')}</label>
                                        <input
                                            type="text"
                                            defaultValue={value || "N/A"}
                                            className="w-full p-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-4 focus:ring-blue-100 focus:border-[#4c84ff] transition-all outline-none font-bold text-gray-700 shadow-inner"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'applications' && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                    <FileText size={18} className="text-[#4c84ff]" /> Associated Applications
                                </h3>
                                <span className="text-[10px] font-black text-[#4c84ff] bg-blue-50 px-3 py-1 rounded-full">{applications.length} Records</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                                            <th className="px-8 py-5">App ID</th>
                                            <th className="px-8 py-5">Exam Details</th>
                                            <th className="px-8 py-5 text-center">Status</th>
                                            <th className="px-8 py-5 text-right">Applied Date</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {applications.length > 0 ? applications.map(app => (
                                            <tr key={app.applicationId} className="hover:bg-blue-50/20 transition-colors group cursor-pointer">
                                                <td className="px-8 py-5 font-black text-xs text-[#4c84ff]">#{app.applicationId}</td>
                                                <td className="px-8 py-5">
                                                    <div className="font-bold text-gray-800 text-sm group-hover:text-[#4c84ff] transition-colors">{app.examName || "Standard Exam"}</div>
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase mt-0.5">{app.examNo ? `Exam No: ${app.examNo}` : ''}</div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border border-transparent shadow-sm ${getStatusStyle(app.status)}`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right text-xs font-bold text-gray-400 flex items-center justify-end gap-3 mt-4">
                                                    <Calendar size={14} className="text-gray-200" />
                                                    {app.appliedAt ? new Date(app.appliedAt).toLocaleDateString() : 'Dec 2023'}
                                                    <ArrowRight size={14} className="text-gray-200 group-hover:text-[#4c84ff] transition-all ml-2" />
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center">
                                                    <FileText size={48} className="mx-auto text-gray-100 mb-4" />
                                                    <p className="text-gray-400 font-bold italic tracking-wide">No applications associated with this {type}.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'results' && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                    <Award size={18} className="text-[#4c84ff]" /> Performance Metrics
                                </h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                                            <th className="px-8 py-5">Exam Name</th>
                                            <th className="px-8 py-5 text-center">Percentage</th>
                                            <th className="px-8 py-5 text-center">Remarks</th>
                                            <th className="px-8 py-5 text-right">Published</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {results.length > 0 ? results.map(res => (
                                            <tr key={res.id} className="hover:bg-blue-50/20 transition-colors group">
                                                <td className="px-8 py-5">
                                                    <div className="font-bold text-gray-800 text-sm group-hover:text-[#4c84ff] transition-colors">{res.examName}</div>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className="text-sm font-black text-blue-600 italic">{res.percentage}%</span>
                                                </td>
                                                <td className="px-8 py-5 text-center">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${res.percentage >= 40 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                                                        {res.percentage >= 40 ? 'Pass' : 'Fail'}
                                                    </span>
                                                </td>
                                                <td className="px-8 py-5 text-right text-xs font-bold text-gray-400">
                                                    {res.publishedAt ? new Date(res.publishedAt).toLocaleDateString() : 'N/A'}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center">
                                                    <Award size={48} className="mx-auto text-gray-100 mb-4" />
                                                    <p className="text-gray-400 font-bold italic tracking-wide">No academic records found.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'students' && (
                        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
                                <h3 className="text-sm font-black text-gray-800 uppercase tracking-widest flex items-center gap-2">
                                    <Users size={18} className="text-[#4c84ff]" /> Associated Students
                                </h3>
                                <span className="text-[10px] font-black text-[#4c84ff] bg-blue-50 px-3 py-1 rounded-full">{students.length} Total</span>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 font-black text-[10px] text-gray-400 uppercase tracking-widest">
                                            <th className="px-8 py-5">Student Name</th>
                                            <th className="px-8 py-5">ID</th>
                                            <th className="px-8 py-5">Contact</th>
                                            <th className="px-8 py-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50">
                                        {students.length > 0 ? students.map(st => (
                                            <tr key={st.studentId} className="hover:bg-blue-50/20 transition-colors group">
                                                <td className="px-8 py-5 font-bold text-gray-800 group-hover:text-[#4c84ff] transition-colors">{st.firstName} {st.lastName}</td>
                                                <td className="px-8 py-5 text-xs font-black text-[#4c84ff]">#{st.studentId}</td>
                                                <td className="px-8 py-5 text-xs font-bold text-gray-400">{st.contact || 'No Contact'}</td>
                                                <td className="px-8 py-5 text-right">
                                                    <button
                                                        onClick={() => navigate(`/admin/manage/student/${st.studentId}`)}
                                                        className="text-[10px] font-black text-[#4c84ff] uppercase tracking-widest hover:underline flex items-center gap-2 ml-auto"
                                                    >
                                                        Details <ArrowRight size={14} />
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="px-8 py-20 text-center">
                                                    <Users size={48} className="mx-auto text-gray-100 mb-4" />
                                                    <p className="text-gray-400 font-bold italic tracking-wide">No students found associated with this {type}.</p>
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EntityManager;
