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
    Search
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import {
    getStudentById,
    getAllSchools,
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
            // Add more types as needed
            return null;
        }
    });

    // Fetch related applications
    const { data: applications = [] } = useQuery({
        queryKey: ['applications', type, id],
        queryFn: () => getExamApplications({
            studentId: type === 'student' ? id : undefined,
            schoolId: type === 'school' ? id : undefined,
            regionId: type === 'region' ? id : undefined,
            // Add more as needed
        }),
        enabled: !!entityData
    });

    // Fetch related results
    const { data: results = [] } = useQuery({
        queryKey: ['results', type, id],
        queryFn: () => getExamResults({
            studentId: type === 'student' ? id : undefined,
            schoolId: type === 'school' ? id : undefined,
            regionId: type === 'region' ? id : undefined,
        }),
        enabled: !!entityData
    });

    // Fetch related students (for School/Centre/Region)
    const { data: studentsData = [] } = useQuery({
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
        return `Manage ${type} #${id}`;
    };

    if (isLoadingEntity) {
        return <div className="flex items-center justify-center p-20 text-gray-400">Loading details...</div>;
    }

    if (!entityData) {
        return (
            <div className="bg-white p-12 rounded-2xl shadow-sm text-center border border-gray-100">
                <Search size={48} className="mx-auto text-gray-200 mb-4" />
                <h2 className="text-xl font-bold text-gray-800">Entity Not Found</h2>
                <p className="text-gray-500 mt-2">The requested {type} could not be located.</p>
                <button
                    onClick={() => navigate(-1)}
                    className="mt-6 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold"
                >
                    Go Back
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-white rounded-xl transition-all shadow-sm border border-transparent hover:border-gray-100"
                    >
                        <ChevronLeft size={20} />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-100">
                            {getIcon()}
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">{getTitle()}</h2>
                            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">{type} ID: #{id}</p>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-white border border-red-100 text-red-600 rounded-xl font-bold text-sm hover:bg-red-50 transition-all">
                        <Trash2 size={16} /> Delete
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100">
                        <Save size={16} /> Save Changes
                    </button>
                </div>
            </div>

            {/* Content Sidebar + Main Area */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Navigation Tabs */}
                <div className="space-y-2">
                    {[
                        { id: 'overview', label: 'Overview', icon: <FileText size={18} /> },
                        { id: 'applications', label: 'Applications', icon: <FileText size={18} /> },
                        { id: 'results', label: 'Exam Results', icon: <Award size={18} /> },
                        ...(type !== 'student' ? [{ id: 'students', label: 'Students', icon: <User size={18} /> }] : []),
                        { id: 'settings', label: 'Advanced Settings', icon: <Trash2 size={18} /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveSubTab(tab.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeSubTab === tab.id
                                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                                : 'bg-white text-gray-500 hover:bg-indigo-50 hover:text-indigo-600 border border-gray-100/50'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Data Panels */}
                <div className="lg:col-span-3 space-y-6">
                    {activeSubTab === 'overview' && (
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm space-y-6">
                            <h3 className="text-lg font-bold text-gray-800 border-b pb-4">Basic Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {Object.entries(entityData).filter(([k]) => typeof entityData[k] !== 'object').map(([key, value]) => (
                                    <div key={key} className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{key.replace(/([A-Z])/g, ' $1')}</label>
                                        <input
                                            type="text"
                                            defaultValue={value}
                                            className="w-full p-3 bg-gray-50 border border-gray-100 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none font-medium text-gray-700"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'applications' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-bold text-gray-800 text">Applications</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase">App ID</th>
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Exam</th>
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Status</th>
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {applications?.content?.length > 0 ? applications.content.map(app => (
                                            <tr key={app.applicationId} className="border-b text-sm">
                                                <td className="p-4 font-bold">#{app.applicationId}</td>
                                                <td className="p-4">{app.exam?.exam_name}</td>
                                                <td className="p-4">
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${app.status === 'APPROVED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                        }`}>
                                                        {app.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 text-gray-500">{new Date(app.appliedAt).toLocaleDateString()}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="p-12 text-center text-gray-400 italic">No applications found for this {type}.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'results' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-bold text-gray-800 text">Academic Results</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Exam</th>
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Score</th>
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Remarks</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {results?.content?.length > 0 ? results.content.map(res => (
                                            <tr key={res.id} className="border-b text-sm">
                                                <td className="p-4">{res.exam?.exam_name}</td>
                                                <td className="p-4 text-indigo-600 font-bold">{res.score}</td>
                                                <td className="p-4">{res.remarks}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="p-12 text-center text-gray-400 italic">No results available for this {type}.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {activeSubTab === 'students' && (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                            <div className="p-6 border-b">
                                <h3 className="text-lg font-bold text-gray-800 text">Associated Students</h3>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Name</th>
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase">ID</th>
                                            <th className="p-4 text-[10px] font-black text-gray-400 uppercase">Username</th>
                                            <th className="p-4 text-right p-4 text-[10px] font-black text-gray-400 uppercase">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {students.length > 0 ? students.map(st => (
                                            <tr key={st.studentId} className="border-b text-sm">
                                                <td className="p-4 font-bold">{st.firstName} {st.lastName}</td>
                                                <td className="p-4 text-gray-500">#{st.studentId}</td>
                                                <td className="p-4">{st.username}</td>
                                                <td className="p-4 text-right">
                                                    <button
                                                        onClick={() => navigate(`/admin/manage/student/${st.studentId}`)}
                                                        className="text-indigo-600 font-bold hover:underline"
                                                    >
                                                        View Details
                                                    </button>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="p-12 text-center text-gray-400 italic">No students found for this {type}.</td>
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
