import React, { useState } from 'react';
import {
    ArrowLeft,
    Building2,
    School,
    Users,
    Edit2,
    Trash2,
    Check,
    X,
    AlertCircle,
    Activity
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import {
    getSchools,
    deleteSchool,
    updateExamCentre,
    getSchoolCountByExamCentre,
    getStudentCountByExamCentre
} from '../../api';

const ExamCentreDetailView = ({ centre, onBack }) => {
    const queryClient = useQueryClient();

    // Edit State
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({
        centreName: centre.centreName,
        centreCode: centre.centreCode
    });

    // Fetch schools for this exam centre
    const { data: schoolsPage, isLoading: isLoadingSchools } = useQuery({
        queryKey: ['schools', { examCentreId: centre.centreId }],
        queryFn: () => getSchools({ examCentreId: centre.centreId, size: 1000 }),
    });
    const schools = schoolsPage?.content || [];

    // Counts
    const { data: schoolCount } = useQuery({
        queryKey: ['schoolCount', 'centre', centre.centreId],
        queryFn: () => getSchoolCountByExamCentre(centre.centreId),
    });

    const { data: studentCount } = useQuery({
        queryKey: ['studentCount', 'centre', centre.centreId],
        queryFn: () => getStudentCountByExamCentre(centre.centreId),
    });

    const updateCentreMutation = useMutation({
        mutationFn: (data) => updateExamCentre(centre.centreId, data),
        onSuccess: () => {
            toast.success("Exam Centre updated successfully");
            setIsEditing(false);
            queryClient.invalidateQueries({ queryKey: ['exam-centres'] });
            queryClient.invalidateQueries({ queryKey: ['regions'] });
        },
        onError: () => {
            toast.error("Failed to update exam centre");
        }
    });

    const deleteSchoolMutation = useMutation({
        mutationFn: (schoolId) => deleteSchool(schoolId),
        onSuccess: () => {
            toast.success("School removed successfully");
            queryClient.invalidateQueries({ queryKey: ['schools'] });
            queryClient.invalidateQueries({ queryKey: ['schoolCount', 'centre', centre.centreId] });
        },
        onError: () => {
            toast.error("Failed to remove school");
        }
    });

    const handleSaveEdit = () => {
        if (!editData.centreName.trim() || !editData.centreCode.trim()) {
            toast.error("Name and Code are required");
            return;
        }
        updateCentreMutation.mutate(editData);
    };

    const handleDeleteSchool = (schoolId) => {
        if (window.confirm("Are you sure you want to remove this school from the system?")) {
            deleteSchoolMutation.mutate(schoolId);
        }
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onBack}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
                        title="Back to Region"
                    >
                        <ArrowLeft className="text-gray-400 group-hover:text-indigo-600" size={24} />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <Building2 className="text-indigo-600" size={24} />

                            {isEditing ? (
                                <div className="flex items-center gap-2">
                                    <input
                                        type="text"
                                        value={editData.centreName}
                                        onChange={(e) => setEditData({ ...editData, centreName: e.target.value })}
                                        className="text-2xl font-black text-gray-900 border-b-2 border-indigo-500 outline-none bg-transparent px-1"
                                        placeholder="Centre Name"
                                    />
                                    <span className="text-gray-300">|</span>
                                    <input
                                        type="text"
                                        value={editData.centreCode}
                                        onChange={(e) => setEditData({ ...editData, centreCode: e.target.value })}
                                        className="text-lg font-bold text-gray-500 border-b-2 border-indigo-500 outline-none bg-transparent px-1 w-24"
                                        placeholder="Code"
                                    />
                                </div>
                            ) : (
                                <h2 className="text-2xl font-black text-gray-900 uppercase tracking-tight flex items-center gap-3">
                                    {editData.centreName}
                                    <span className="text-sm font-bold bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg">
                                        {editData.centreCode}
                                    </span>
                                </h2>
                            )}
                        </div>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 ml-9">
                            Exam Centre ID: #{centre.centreId}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 px-4 md:px-0">
                    {isEditing ? (
                        <>
                            <button
                                onClick={handleSaveEdit}
                                disabled={updateCentreMutation.isPending}
                                className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest shadow-sm transition-all"
                            >
                                <Check size={16} /> Save
                            </button>
                            <button
                                onClick={() => {
                                    setIsEditing(false);
                                    setEditData({ centreName: centre.centreName, centreCode: centre.centreCode }); // reset
                                }}
                                className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all"
                            >
                                <X size={16} /> Cancel
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setIsEditing(true)}
                            className="flex items-center gap-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 px-4 py-2 rounded-xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
                        >
                            <Edit2 size={16} /> Edit Centre
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                        <School size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Schools</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{schoolCount !== undefined ? schoolCount : schools.length}</p>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Total Students</p>
                        <p className="text-3xl font-black text-gray-900 mt-1">{studentCount || '0'}</p>
                    </div>
                </div>

                <div className="bg-gradient-to-r from-indigo-600 to-blue-500 p-6 rounded-2xl shadow-md text-white flex flex-col justify-center relative overflow-hidden">
                    <div className="relative z-10 text-center">
                        <p className="text-[10px] font-black text-indigo-100 uppercase tracking-widest mb-1">Operational Status</p>
                        <h3 className="text-xl font-black uppercase tracking-widest flex items-center justify-center gap-2">
                            <Activity size={20} className="text-emerald-300" /> Active
                        </h3>
                    </div>
                    <div className="absolute top-0 right-0 -mr-4 -mt-4 w-24 h-24 bg-white opacity-10 rounded-full blur-xl"></div>
                </div>
            </div>

            {/* Attached Schools List */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                <div className="p-6 border-b border-gray-50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <School className="text-indigo-500" size={18} />
                        <h3 className="text-sm font-black text-gray-800 uppercase tracking-wider">Associated Schools</h3>
                    </div>
                    <span className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full uppercase">
                        {schools.length} Schools Enrolled
                    </span>
                </div>

                <div className="overflow-x-auto">
                    {isLoadingSchools ? (
                        <div className="p-12 text-center text-gray-400 font-bold animate-pulse uppercase tracking-widest text-xs">Loading Schools...</div>
                    ) : schools.length === 0 ? (
                        <div className="p-16 text-center text-gray-400 font-bold italic flex flex-col items-center gap-4">
                            <AlertCircle size={48} className="text-gray-200" />
                            No schools are currently assigned to this exam centre.
                        </div>
                    ) : (
                        <table className="w-full text-left">
                            <thead className="bg-gray-50/50">
                                <tr>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">School ID</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">School Name</th>
                                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {schools.map((school) => (
                                    <tr key={school.schoolId} className="hover:bg-red-50/10 transition-colors group">
                                        <td className="px-6 py-4 font-mono text-xs text-indigo-600 font-bold">
                                            #{school.schoolId}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-bold text-gray-700">
                                                {school.schoolName}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button
                                                onClick={() => handleDeleteSchool(school.schoolId)}
                                                className="p-2 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                title="Remove School"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ExamCentreDetailView;
