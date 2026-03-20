import React, { useRef } from 'react';
import { Download, Award, Printer, X } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { motion } from 'framer-motion';

const Certificate = ({ result, onClose }) => {
    const certificateRef = useRef(null);

    if (!result) return null;

    const app = result.application || {};
    const exam = app.exam || {};
    const student = app.student || {};

    let resultData = {};
    try {
        resultData = typeof result.resultData === 'string'
            ? JSON.parse(result.resultData || '{}')
            : (result.resultData || {});
    } catch (e) { console.error("Error parsing resultData:", e); }

    let examDetails = {};
    try {
        examDetails = typeof exam.exam_details === 'string'
            ? JSON.parse(exam.exam_details || '{}')
            : (exam.exam_details || {});
    } catch (e) { console.error("Error parsing exam_details:", e); }

    const identity = {
        conductingBody: examDetails.identity?.conductingBody || 'Maharashtra Rashtrabhasha Sabha, Pune',
        examFullTitle: examDetails.identity?.examFullTitle || 'Rashtrabhasha Praveen Pariksha',
        recognitionText: examDetails.identity?.recognitionText || 'Recognized by Govt. of India',
    };
    const admin = {
        signatoryName: examDetails.administrative?.signatoryName || 'Sunita Kulkarni',
        signatoryDesignation: examDetails.administrative?.signatoryDesignation || 'Secretary, Examination Dept.',
        departmentName: examDetails.administrative?.departmentName || 'MRB Examination Dept.',
    };

    const studentName = resultData.fullName ||
        (student.firstName
            ? `${student.firstName} ${student.middleName || ''} ${student.lastName || ''}`.trim()
            : student.username || '—');

    const issueDate = new Date(result.publishedAt || Date.now())
        .toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' });

    const handleDownloadPDF = () => {
        const element = certificateRef.current;
        const opt = {
            margin: 0,
            filename: `Certificate_${studentName.replace(/\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center overflow-y-auto p-4 print:p-0 print:bg-white">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="relative w-full m-auto"
                style={{ maxWidth: 720 }}
            >
                {/* ─── Action bar ─── */}
                <div
                    className="print:hidden flex justify-between items-center mb-4 px-1"
                    style={{ fontFamily: 'DM Sans, Segoe UI, sans-serif' }}
                >
                    <div>
                        <h2 className="text-base font-black text-white flex items-center gap-2">
                            <Award size={18} className="text-amber-400" /> EXAMINATION CERTIFICATE
                        </h2>
                        <p className="text-[10px] text-white/50 font-bold uppercase tracking-[0.15em] mt-0.5">Official Achievement Document</p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => window.print()}
                            className="bg-white/10 text-white px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 hover:bg-white/20 transition"
                        >
                            <Printer size={14} /> Print
                        </button>
                        <button
                            onClick={handleDownloadPDF}
                            className="bg-[#4c84ff] text-white px-4 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-blue-500/20 hover:bg-[#3b6ddb] transition"
                        >
                            <Download size={14} /> PDF
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-white/10 text-white px-3 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10 hover:bg-white/20 transition"
                        >
                            <X size={14} />
                        </button>
                    </div>
                </div>

                {/* ─── Printable Certificate ─── */}
                <div
                    ref={certificateRef}
                    className="bg-white relative overflow-hidden"
                    style={{
                        fontFamily: "'Georgia', 'Times New Roman', serif",
                        border: '8px solid #1b223c',
                    }}
                >
                    {/* Inner golden border */}
                    <div className="absolute inset-3 pointer-events-none z-10" style={{ border: '2px solid #c9a227' }} />
                    <div className="absolute inset-4 pointer-events-none z-10" style={{ border: '0.5px solid #e6c84a' }} />

                    {/* Background watermark grid */}
                    <div
                        className="absolute inset-0 opacity-[0.025] pointer-events-none"
                        style={{
                            backgroundImage: 'repeating-linear-gradient(45deg, #1b223c 0px, #1b223c 1px, transparent 0px, transparent 50%)',
                            backgroundSize: '14px 14px',
                        }}
                    />

                    {/* Top indigo stripe (matches HallTicket) */}
                    <div style={{ height: 6, background: 'linear-gradient(90deg, #4f46e5 0%, #4c84ff 50%, #4f46e5 100%)' }} />

                    {/* ─── Header ─── */}
                    <div style={{ background: '#1b223c', padding: '28px 40px 22px', textAlign: 'center' }}>
                        {/* Org */}
                        <div style={{ fontSize: 10, fontWeight: 800, color: '#c9a227', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'DM Sans, sans-serif' }}>
                            {identity.conductingBody}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 8 }}>
                            {/* Decorative lines */}
                            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,162,39,0.5))' }} />
                            <Award size={28} style={{ color: '#c9a227', flexShrink: 0 }} />
                            <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(201,162,39,0.5))' }} />
                        </div>
                        <h1 style={{ margin: 0, fontSize: 26, fontWeight: 900, color: '#ffffff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                            Certificate of Achievement
                        </h1>
                        <p style={{ margin: '6px 0 0', fontSize: 10, color: 'rgba(255,255,255,0.5)', fontFamily: 'DM Sans, sans-serif', fontStyle: 'italic', letterSpacing: '0.1em' }}>
                            {identity.recognitionText}
                        </p>
                    </div>

                    {/* ─── Body ─── */}
                    <div style={{ padding: '36px 60px 28px', textAlign: 'center' }}>
                        <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', margin: '0 0 12px', fontFamily: 'DM Sans, sans-serif' }}>
                            This is to certify that
                        </p>

                        {/* Student Name */}
                        <div style={{ margin: '0 0 14px', position: 'relative', display: 'inline-block' }}>
                            <h2 style={{ margin: 0, fontSize: 30, fontWeight: 700, color: '#1b223c', letterSpacing: '0.02em' }}>
                                {studentName}
                            </h2>
                            <div style={{ height: 2, background: 'linear-gradient(to right, transparent, #c9a227, transparent)', marginTop: 6 }} />
                        </div>

                        <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', margin: '14px 0 10px', fontFamily: 'DM Sans, sans-serif' }}>
                            has successfully completed the prescribed requirements for the
                        </p>

                        {/* Exam Name */}
                        <h3 style={{ margin: '0 0 18px', fontSize: 18, fontWeight: 800, color: '#1b223c', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'DM Sans, sans-serif' }}>
                            {exam.exam_name || identity.examFullTitle}
                        </h3>

                        {/* Score Pills Row */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 20, margin: '0 0 28px', flexWrap: 'wrap', fontFamily: 'DM Sans, sans-serif' }}>
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 20px', minWidth: 100 }}>
                                <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Score</div>
                                <div style={{ fontSize: 22, fontWeight: 900, color: '#1b223c' }}>
                                    {resultData.totalObtained || resultData.score || '—'}
                                </div>
                                <div style={{ fontSize: 9, color: '#94a3b8', fontWeight: 700 }}>out of {resultData.totalMax || '—'}</div>
                            </div>
                            <div style={{ background: '#EBFBEE', border: '1px solid #d3f9d8', borderRadius: 8, padding: '10px 20px', minWidth: 100 }}>
                                <div style={{ fontSize: 9, fontWeight: 800, color: '#2F9E44', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>Result</div>
                                <div style={{ fontSize: 18, fontWeight: 900, color: '#2F9E44', textTransform: 'uppercase' }}>
                                    {resultData.remarks || 'PASS'}
                                </div>
                            </div>
                            <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '10px 20px', minWidth: 100 }}>
                                <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 4 }}>App ID</div>
                                <div style={{ fontSize: 16, fontWeight: 900, color: '#1b223c' }}>#{app.applicationId || '—'}</div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
                            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a227' }} />
                            <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#e2c97a' }} />
                            <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a227' }} />
                            <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                        </div>

                        {/* Signature & Date Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', gap: 20 }}>
                            {/* Date */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #cbd5e0', paddingBottom: 6, marginBottom: 6 }}>
                                    {issueDate}
                                </div>
                                <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'DM Sans, sans-serif' }}>
                                    Date of Issue
                                </div>
                            </div>

                            {/* Seal */}
                            <div style={{
                                width: 72, height: 72, borderRadius: '50%',
                                border: '2px solid #c9a227',
                                display: 'flex', flexDirection: 'column',
                                alignItems: 'center', justifyContent: 'center',
                                background: '#fffbeb', color: '#c9a227',
                                boxShadow: '0 0 0 4px #fef9c3',
                                flexShrink: 0,
                            }}>
                                <Award size={22} />
                                <span style={{ fontSize: 7, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>Official</span>
                            </div>

                            {/* Signature */}
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #cbd5e0', paddingBottom: 6, marginBottom: 6, fontFamily: "'Dancing Script', cursive, Georgia, serif" }}>
                                    {admin.signatoryName}
                                </div>
                                <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'DM Sans, sans-serif' }}>
                                    {admin.signatoryDesignation}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Bottom stripe */}
                    <div style={{ height: 5, background: 'linear-gradient(90deg, #4f46e5 0%, #4c84ff 50%, #4f46e5 100%)' }} />

                    {/* Footer bar */}
                    <div style={{
                        background: '#1b223c', padding: '8px 40px',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontFamily: 'DM Sans, sans-serif'
                    }}>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
                            MRB Examination System
                        </span>
                        <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 700, letterSpacing: '0.05em' }}>
                            Credential ID: {app.applicationId || 'N/A'} • {new Date().getFullYear()}
                        </span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default Certificate;
