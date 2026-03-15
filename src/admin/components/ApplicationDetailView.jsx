import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, 
    CheckCircle, 
    XCircle, 
    User, 
    BookOpen, 
    Calendar, 
    MapPin, 
    Phone, 
    Mail, 
    FileText,
    AlertCircle,
    Info,
    ArrowRight
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentProfile, updateExamApplication } from '../../api';
import toast from 'react-hot-toast';

const ApplicationDetailView = ({ application, onBack }) => {
    const queryClient = useQueryClient();
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    // Fetch Student Profile for deep dive
    const { data: profile, isLoading: isLoadingProfile } = useQuery({
        queryKey: ['studentProfile', application?.studentId],
        queryFn: () => getStudentProfile(application?.studentId),
        enabled: !!application?.studentId
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status, remarks }) => updateExamApplication(id, { ...application, status, remarks }),
        onSuccess: () => {
            queryClient.invalidateQueries(['applications']);
            toast.success("Application updated successfully");
            onBack();
        },
        onError: () => {
            toast.error("Failed to update application status");
        }
    });

    const handleApprove = () => {
        if (window.confirm("Are you sure you want to APPROVE this application?")) {
            updateStatusMutation.mutate({ 
                id: application.applicationId, 
                status: 'APPROVED',
                remarks: 'Verified and approved by admin'
            });
        }
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            return toast.error("Please provide a reason for rejection");
        }
        updateStatusMutation.mutate({ 
            id: application.applicationId, 
            status: 'REJECTED',
            remarks: rejectionReason 
        });
    };

    const formatAddress = (addr) => {
        if (!addr) return 'Address details not available';
        if (typeof addr === 'string') return addr;
        
        const parts = [
            addr.line1,
            addr.line2,
            addr.villageOrCity,
            addr.taluka,
            addr.district,
            addr.state,
            addr.pincode
        ].filter(Boolean);
        
        return parts.length > 0 ? parts.join(", ") : 'Empty address record';
    };

    if (!application) return null;

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header / Navigation */}
            <div className="flex items-center justify-between mb-8">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#4c84ff] font-bold text-xs uppercase tracking-widest transition-colors group"
                >
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:border-blue-100">
                        <ChevronLeft size={16} />
                    </div>
                    Back to Applications
                </button>

                <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border shadow-sm uppercase tracking-widest ${
                        application.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        application.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                        Status: {application.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Student Profile & Basic Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Primary Application Card */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-[#1b223c] to-[#2d3a61] p-8 text-white">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center font-black text-3xl text-white shadow-inner">
                                        {application.studentName?.charAt(0) || <User size={40} />}
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black tracking-tight">{application.studentName}</h2>
                                        <p className="text-blue-300 font-bold text-xs uppercase tracking-[0.2em] mt-1">
                                            Application ID: #{application.applicationId} • Student ID: {application.studentId}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20">
                                        <p className="text-[10px] font-bold text-blue-200 uppercase tracking-widest mb-1">Applied On</p>
                                        <p className="font-black text-lg">{new Date(application.appliedAt || Date.now()).toLocaleDateString()}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="p-8">
                            <h3 className="text-[10px] font-black text-[#4c84ff] uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Info size={14} /> Application Details
                            </h3>
                            
                            <div className="grid grid-cols-2 gap-8">
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <BookOpen className="text-gray-400" size={20} />
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Exam Name</p>
                                            <p className="font-bold text-gray-800">{application.examName}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <MapPin className="text-gray-400" size={20} />
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Region / School</p>
                                            <p className="font-bold text-gray-800">{application.schoolName || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <Calendar className="text-gray-400" size={20} />
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Session</p>
                                            <p className="font-bold text-gray-800">September 2026</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                        <AlertCircle className="text-gray-400" size={20} />
                                        <div>
                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Current Status</p>
                                            <p className="font-black text-blue-600 italic tracking-tight">{application.status}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Student Full Profile Section */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-gray-50">
                            <h3 className="text-xl font-black text-gray-800 tracking-tight flex items-center gap-3">
                                <User className="text-[#4c84ff]" size={24} /> Detailed Student Profile
                            </h3>
                            {isLoadingProfile && (
                                <div className="flex items-center gap-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest animate-pulse">
                                    Fetching Profile...
                                </div>
                            )}
                        </div>

                        {profile ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                                <div className="space-y-6">
                                    <div className="group">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-[#4c84ff] transition-colors">Father's Name</p>
                                        <p className="font-bold text-gray-900 border-b border-gray-50 pb-2 capitalize">{profile.fatherName || 'Not Provided'}</p>
                                    </div>
                                    <div className="group">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-[#4c84ff] transition-colors">Mother's Name</p>
                                        <p className="font-bold text-gray-900 border-b border-gray-50 pb-2 capitalize">{profile.motherName || 'Not Provided'}</p>
                                    </div>
                                    <div className="group">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-[#4c84ff] transition-colors">Educational Qualification</p>
                                        <p className="font-bold text-gray-900 border-b border-gray-50 pb-2">{profile.qualification || 'Not Provided'}</p>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <div className="group">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-[#4c84ff] transition-colors">Contact Information</p>
                                        <div className="space-y-2 pt-1">
                                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                                <Phone size={14} className="text-gray-300" /> {profile.mobileNumber || 'N/A'}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-gray-700">
                                                <Mail size={14} className="text-gray-300" /> {profile.email || 'N/A'}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="group">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 group-hover:text-[#4c84ff] transition-colors">Residential Address</p>
                                        <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                                            {formatAddress(profile.address)}
                                        </p>
                                    </div>
                                </div>

                                <div className="col-span-full pt-4">
                                    <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 flex items-start gap-4">
                                        <div className="p-2 bg-white rounded-lg text-blue-600 shadow-sm">
                                            <FileText size={18} />
                                        </div>
                                        <div>
                                            <p className="text-xs font-bold text-blue-900">Guardian Contact</p>
                                            <p className="text-sm text-blue-700">{profile.guardianContact || 'No separate guardian contact mentioned.'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : !isLoadingProfile && (
                            <div className="text-center py-12 px-6 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                                <AlertCircle className="mx-auto text-gray-300 mb-3" size={32} />
                                <p className="text-gray-500 font-bold">No extended profile info found for this student.</p>
                                <p className="text-[10px] text-gray-400 uppercase tracking-widest mt-1">Please verify metadata from application form.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Column: Decisions & Audit */}
                <div className="space-y-8">
                    {/* Action Card */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8 overflow-hidden sticky top-8">
                        <h3 className="text-lg font-black text-gray-800 mb-6 tracking-tight">Review Action</h3>
                        
                        <div className="space-y-4">
                            {!isRejecting ? (
                                <>
                                    <button 
                                        onClick={handleApprove}
                                        disabled={updateStatusMutation.isPending || application.status === 'APPROVED'}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        <CheckCircle size={20} /> Approve Application
                                    </button>
                                    
                                    <button 
                                        onClick={() => setIsRejecting(true)}
                                        disabled={updateStatusMutation.isPending || application.status === 'REJECTED'}
                                        className="w-full py-4 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        <XCircle size={20} /> Reject with Reason
                                    </button>
                                </>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-4"
                                >
                                    <textarea 
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Reason for rejection (e.g. Fees not received, Document unclear...)"
                                        className="w-full min-h-[120px] p-4 bg-gray-50 border-2 border-red-50 focus:border-red-200 rounded-2xl outline-none font-medium text-gray-700 text-sm italic shadow-inner"
                                    />
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={handleReject}
                                            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-colors"
                                        >
                                            Confirm Reject
                                        </button>
                                        <button 
                                            onClick={() => setIsRejecting(false)}
                                            className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-50">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Application History</h4>
                            <div className="space-y-4">
                                <div className="relative pl-6 pb-4 border-l border-blue-100">
                                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-500" />
                                    <p className="text-[10px] font-black text-gray-900 leading-none">Submitted</p>
                                    <p className="text-[9px] text-gray-400 mt-1">{new Date(application.appliedAt || Date.now()).toLocaleString()}</p>
                                </div>
                                <div className="relative pl-6">
                                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-gray-200" />
                                    <p className="text-[10px] font-black text-gray-400 leading-none italic uppercase">Awaiting Action</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-10 p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                            <AlertCircle size={18} className="text-amber-500 shrink-0" />
                            <p className="text-[10px] font-bold text-amber-700 leading-relaxed italic">
                                Note: Approving this application will notify the student and allow them to download their Hall Ticket (Admit Card).
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailView;
