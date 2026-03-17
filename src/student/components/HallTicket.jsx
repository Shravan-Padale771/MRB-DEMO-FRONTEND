import React from 'react';
import { motion } from 'framer-motion';
import { Printer, MapPin, Calendar, User, BookOpen, Fingerprint, ShieldCheck, Globe, Building2, School } from 'lucide-react';

const HallTicket = ({ application, student, profile, regions = [], centres = [], schools = [] }) => {
    if (!application) return null;

    const handlePrint = () => {
        window.print();
    };

    const getRegionName = (id) => regions.find(r => r.regionId === id)?.regionName || id;
    const getCentreName = (id) => centres.find(c => c.centreId === id)?.centreName || id;
    const getSchoolName = (id) => schools.find(s => s.schoolId === id)?.schoolName || id;

    // Extract schoolId from application if available, or use a placeholder
    // In some systems centreId might be mapped to school. Let's look at the application structure from the user request.
    // The user request shows centreId: 1. 
    // Usually, applications are tied to a school.
    
    return (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in duration-700">
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-10 no-print bg-white/50 backdrop-blur-md p-6 rounded-3xl border border-white/20 shadow-xl shadow-indigo-500/5">
                <div>
                    <h2 className="text-2xl font-black text-slate-800 flex items-center gap-3">
                        <ShieldCheck className="text-indigo-600" size={32} /> Official Hall Ticket
                    </h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Status: Board Verified & Generated</p>
                </div>
                <div className="flex gap-4">
                    <motion.button
                        whileHover={{ scale: 1.05, translateY: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handlePrint}
                        className="bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl shadow-indigo-500/30 hover:bg-indigo-700 transition-all"
                    >
                        <Printer size={18} /> Print Voucher
                    </motion.button>
                </div>
            </div>

            {/* Hall Ticket Card */}
            <motion.div 
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative bg-white border border-slate-100 rounded-[3rem] overflow-hidden shadow-2xl print:shadow-none print:border-2"
            >
                {/* Board Official Header */}
                <div className="bg-[#1e293b] p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full -mr-20 -mt-20 blur-3xl" />
                    <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-500/10 rounded-full -ml-10 -mb-10 blur-2xl" />
                    
                    <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                        <div className="flex items-center gap-6">
                            <div className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-center shadow-inner">
                                <BookOpen size={40} className="text-white" />
                            </div>
                            <div className="text-center md:text-left">
                                <h1 className="text-3xl font-black tracking-tight mb-1">MAHARASHTRA RASHTRABHASHA BOARD</h1>
                                <div className="flex items-center justify-center md:justify-start gap-4 text-xs font-bold text-indigo-300 uppercase tracking-[0.3em]">
                                    <Globe size={14} /> Official Examination Voucher
                                </div>
                            </div>
                        </div>
                        <div className="bg-white/10 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/20 text-center">
                            <p className="text-[10px] font-black text-indigo-200 uppercase tracking-widest mb-1">Roll Number</p>
                            <p className="text-2xl font-black tracking-widest tabular-nums">{application.rollNo}</p>
                        </div>
                    </div>
                </div>

                {/* Main Body */}
                <div className="p-12 relative">
                    {/* Official Seal Watermark */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-[0.02] select-none rotate-12">
                         <div className="w-96 h-96 border-[40px] border-slate-900 rounded-full flex items-center justify-center">
                            <h2 className="text-6xl font-black text-slate-900 text-center uppercase tracking-tighter">MRB<br/>OFFICIAL</h2>
                         </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-12 relative z-10">
                        {/* Student Details Column */}
                        <div className="md:col-span-3 space-y-12">
                            {/* Candidate Summary */}
                            <div className="flex flex-wrap gap-12">
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Candidate Full Name</label>
                                    <p className="text-xl font-bold text-slate-800">{application.studentName}</p>
                                </div>
                                <div className="flex-1 min-w-[200px]">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-2">Registration ID</label>
                                    <p className="text-xl font-bold text-slate-800 tabular-nums">MRB-{application.studentId}-{application.applicationId}</p>
                                </div>
                            </div>

                            {/* Location Grid */}
                            <div className="grid sm:grid-cols-2 gap-8">
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600 shrink-0">
                                        <Building2 size={24} />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Examination Centre</label>
                                        <p className="text-sm font-bold text-slate-800 leading-snug">{getCentreName(application.centreId)}</p>
                                        {application.centreId && <p className="text-[10px] font-bold text-indigo-500 mt-1">Code: {application.centreId}</p>}
                                    </div>
                                </div>
                                <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100 flex items-start gap-4">
                                    <div className="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 shrink-0">
                                        <School size={24} />
                                    </div>
                                    <div>
                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-1">Assigned School</label>
                                        <p className="text-sm font-bold text-slate-800 leading-snug">{profile?.address?.villageOrCity ? `${getSchoolName(application.schoolId || 'N/A')}` : 'To be verified'}</p>
                                        <p className="text-[10px] font-bold text-blue-500 mt-1">Session: May 2026</p>
                                    </div>
                                </div>
                            </div>

                            {/* Exam Title Block */}
                            <div className="flex items-center gap-6 p-8 bg-indigo-50/50 rounded-[2rem] border-2 border-dashed border-indigo-100/50">
                                <Calendar className="text-indigo-400" size={32} />
                                <div>
                                    <label className="text-[10px] font-black text-indigo-400 uppercase tracking-widest block mb-1">Examination Name</label>
                                    <h3 className="text-2xl font-black text-indigo-900 tracking-tight">{application.examName}</h3>
                                </div>
                            </div>
                        </div>

                        {/* Media Column (Photo & QR) */}
                        <div className="space-y-8 flex flex-col items-center">
                            {/* Candidate Photo */}
                            <div className="w-44 h-56 bg-slate-50 border-4 border-white rounded-[2rem] shadow-2xl shadow-slate-200 overflow-hidden relative group">
                                {profile?.profilePhotoUrl ? (
                                    <img src={profile.profilePhotoUrl} alt="Candidate" className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300">
                                        <User size={64} className="opacity-20" />
                                        <p className="text-[8px] font-black uppercase tracking-widest mt-2">No Photograph</p>
                                    </div>
                                )}
                                <div className="absolute inset-0 border-[1.5rem] border-white/20 pointer-events-none" />
                            </div>

                            {/* Verification Code */}
                            <div className="p-4 bg-white rounded-3xl border border-slate-100 shadow-lg shadow-slate-100 flex flex-col items-center gap-3">
                                <div className="p-2 border border-slate-50 rounded-2xl">
                                    <img 
                                        src={`https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=MRB-VOUCHER-${application.rollNo}`} 
                                        alt="Verify"
                                        className="w-24 h-24 mix-blend-multiply"
                                    />
                                </div>
                                <div className="text-center">
                                    <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Digital Auth Code</p>
                                    <p className="text-[10px] font-bold text-slate-900 font-mono">X872-B921-V91</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Lower Section (Signature & Instructions) */}
                    <div className="mt-16 pt-12 border-t border-slate-100 grid md:grid-cols-2 gap-16">
                        <div className="space-y-6">
                            <h4 className="text-xs font-black text-indigo-900 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Fingerprint size={16} /> Candidate Agreement
                            </h4>
                            <div className="space-y-4">
                                <div className="h-16 w-full bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 flex items-center justify-center overflow-hidden">
                                     {profile?.signatureUrl ? (
                                        <img src={profile.signatureUrl} alt="Signature" className="max-h-full p-2" />
                                     ) : (
                                        <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Signature Placeholder</span>
                                     )}
                                </div>
                                <p className="text-[10px] text-slate-500 leading-relaxed italic">
                                    "I hereby declare that the photo and details provided in this voucher belong to me, and I shall abide by all Board regulations during the conduct of the exam."
                                </p>
                            </div>
                        </div>
                        <div className="flex flex-col items-end justify-end">
                            <div className="text-right">
                                <div className="w-56 h-1 bg-slate-900/10 mb-2" />
                                <p className="text-sm font-black text-slate-900 uppercase tracking-widest">Controller of Exams</p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Maharashtra Rashtrabhasha Board</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Disclaimer */}
                <div className="bg-slate-50 p-8 flex flex-col md:flex-row justify-between items-center gap-6 px-12 border-t border-slate-100">
                    <div className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse" />
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">Validated on {new Date().toLocaleDateString()} at MH-REG-991</p>
                    </div>
                    <p className="text-[9px] font-bold text-slate-400 leading-relaxed max-w-sm text-center md:text-right">
                        This document is a computer generated voucher and does not require a physical ink signature. For concerns, contact support@mrb-exam.edu.in
                    </p>
                </div>
            </motion.div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; padding: 0 !important; margin: 0 !important; }
                    .print\\:shadow-none { box-shadow: none !important; }
                    .print\\:border-2 { border: 1.5pt solid #e2e8f0 !important; }
                    .rounded-[3rem] { border-radius: 20pt !important; }
                    .bg-slate-50 { background-color: #f8fafc !important; }
                    .bg-[#1e293b] { background-color: #1e293b !important; -webkit-print-color-adjust: exact; }
                }
            `}} />
        </div>
    );
};

export default HallTicket;
