import React, { useRef, useState } from 'react';
import { Download, Award, Printer, X, LayoutDashboard, FileText } from 'lucide-react';
import html2pdf from 'html2pdf.js';
import { motion, AnimatePresence } from 'framer-motion';

const parseUrl = (str) => {
    if (!str) return null;
    if (str.startsWith('http')) return str;
    try {
        const parsed = JSON.parse(str);
        if (typeof parsed === 'object' && parsed !== null) {
            return Object.values(parsed)[0] || null;
        }
    } catch { return str; }
    return null;
};

const Certificate = ({ result, onClose }) => {
    const certificateRef = useRef(null);
    const [viewMode, setViewMode] = useState('modern');

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
        departmentName: examDetails.administrative?.departmentName || 'Examination Department',
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
            filename: `Certificate_${studentName.replace(/\\s+/g, '_')}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true, backgroundColor: '#ffffff' },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'landscape' }
        };
        html2pdf().from(element).set(opt).save();
    };

    const boardSealUrl = parseUrl(exam?.boardSealUrl);
    const controllerSigUrl = parseUrl(exam?.controllerSignatureUrl);
    const boardLogoUrl = parseUrl(exam?.boardLogoUrl);

    const renderModernView = () => (
        <motion.div
            key="modern"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            className="bg-white relative overflow-hidden w-full mx-auto"
            style={{
                fontFamily: "'Georgia', 'Times New Roman', serif",
                border: '8px solid #1b223c',
                minHeight: '750px',
                maxWidth: '900px'
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

            {/* Top indigo stripe */}
            <div style={{ height: 6, background: 'linear-gradient(90deg, #4f46e5 0%, #4c84ff 50%, #4f46e5 100%)' }} />

            {/* ─── Header ─── */}
            <div style={{ background: '#1b223c', padding: '28px 40px 22px', textAlign: 'center' }}>
                <div style={{ fontSize: 10, fontWeight: 800, color: '#c9a227', letterSpacing: '0.22em', textTransform: 'uppercase', marginBottom: 8, fontFamily: 'DM Sans, sans-serif' }}>
                    {identity.conductingBody}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'center', gap: 14, marginBottom: 8 }}>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right, transparent, rgba(201,162,39,0.5))' }} />
                    <Award size={28} style={{ color: '#c9a227', flexShrink: 0 }} />
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left, transparent, rgba(201,162,39,0.5))' }} />
                </div>
                <h1 style={{ margin: 0, fontSize: 32, fontWeight: 900, color: '#ffffff', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
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
                    <h2 style={{ margin: 0, fontSize: 36, fontWeight: 700, color: '#1b223c', letterSpacing: '0.02em', fontStyle: 'italic' }}>
                        {studentName}
                    </h2>
                    <div style={{ height: 2, background: 'linear-gradient(to right, transparent, #c9a227, transparent)', marginTop: 6 }} />
                </div>

                <p style={{ fontSize: 13, color: '#64748b', fontStyle: 'italic', margin: '14px 0 10px', fontFamily: 'DM Sans, sans-serif' }}>
                    has successfully completed the prescribed requirements for the
                </p>

                {/* Exam Name */}
                <h3 style={{ margin: '0 0 18px', fontSize: 22, fontWeight: 800, color: '#1b223c', textTransform: 'uppercase', letterSpacing: '0.04em', fontFamily: 'DM Sans, sans-serif' }}>
                    {exam.exam_name || identity.examFullTitle}
                </h3>

                {/* Score Pills Row */}
                <div style={{ display: 'flex', justifyItems: 'center', justifyContent: 'center', gap: 20, margin: '0 0 28px', flexWrap: 'wrap', fontFamily: 'DM Sans, sans-serif' }}>
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
                <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', gap: 12, marginBottom: 20 }}>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a227' }} />
                    <div style={{ width: 4, height: 4, borderRadius: '50%', background: '#e2c97a' }} />
                    <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c9a227' }} />
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                </div>

                {/* Signature & Date Row */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'end', gap: 20 }}>
                    <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 13, fontWeight: 700, color: '#1e293b', borderBottom: '1px solid #cbd5e0', paddingBottom: 6, marginBottom: 6 }}>
                            {issueDate}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'DM Sans, sans-serif' }}>
                            Date of Issue
                        </div>
                    </div>

                    <div style={{
                        width: 90, height: 90, borderRadius: '50%', border: '2px solid #c9a227',
                        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                        background: '#fffbeb', color: '#c9a227', boxShadow: '0 0 0 4px #fef9c3', flexShrink: 0, margin: '0 auto'
                    }}>
                        {boardSealUrl ? (
                            <img src={boardSealUrl} alt="Seal" style={{ width: '80%', height: '80%', objectFit: 'contain' }} />
                        ) : (
                            <><Award size={26} /><span style={{ fontSize: 8, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.05em', marginTop: 2, fontFamily: 'DM Sans, sans-serif' }}>Official</span></>
                        )}
                    </div>

                    <div style={{ textAlign: 'center', position: 'relative' }}>
                        <div className="flex flex-col items-center justify-end" style={{ borderBottom: '1px solid #cbd5e0', paddingBottom: 6, marginBottom: 6, minHeight: '40px' }}>
                            {controllerSigUrl ? (
                                <img src={controllerSigUrl} alt="Signature" style={{ maxHeight: '40px', objectFit: 'contain' }} />
                            ) : (
                                <span style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', fontFamily: "'Dancing Script', cursive, Georgia, serif" }}>{admin.signatoryName}</span>
                            )}
                        </div>
                        <div style={{ fontSize: 9, fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontFamily: 'DM Sans, sans-serif' }}>
                            {admin.signatoryDesignation}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bottom stripe */}
            <div style={{ height: 5, background: 'linear-gradient(90deg, #4f46e5 0%, #4c84ff 50%, #4f46e5 100%)', position: 'absolute', bottom: 0, width: '100%' }} />
        </motion.div>
    );

    const renderPaperView = () => (
        <motion.div
            key="paper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mx-auto text-[#1a1a1a] relative w-full min-h-[850px] flex flex-col items-center justify-center p-8 z-0 cursor-default"
            style={{ 
                maxWidth: '960px', 
                backgroundColor: '#fdfbf7', 
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")', 
                backgroundBlendMode: 'multiply',
                fontFamily: "'Georgia', serif"
            }}
        >
            {/* Outline complex border effect for that official look */}
            <div className="absolute inset-4 pointer-events-none" style={{ border: '8px solid #2e3440', zIndex: 1 }} />
            <div className="absolute inset-6 pointer-events-none" style={{ border: '1px solid #2e3440', zIndex: 1 }} />
            <div className="absolute inset-8 pointer-events-none" style={{ border: '1px solid #4c566a', zIndex: 1 }} />

            {/* Central faint watermark seal */}
            {boardSealUrl && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-[0.05] pointer-events-none z-0">
                    <img src={boardSealUrl} alt="Watermark" style={{ width: '400px', height: '400px', objectFit: 'contain' }} />
                </div>
            )}
            
            <div className="relative z-10 w-full px-16 flex flex-col h-full justify-between items-center py-6">
                
                {/* Header Section */}
                <div className="text-center w-full">
                    {/* Header Logo */}
                    {boardLogoUrl && (
                         <div className="flex justify-center mb-4">
                             <img src={boardLogoUrl} alt="Board Logo" className="h-16 object-contain" />
                         </div>
                    )}
                    <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-[0.15em] text-[#2e3440]">
                        {identity.conductingBody}
                    </h1>
                    <p className="text-sm font-bold uppercase tracking-widest mt-2 border-b-2 border-slate-300 pb-4 inline-block px-12 text-[#4c566a]">
                        {identity.recognitionText}
                    </p>
                </div>

                {/* Central Focus: The Certificate Title */}
                <div className="text-center mt-6 w-full">
                    <h2 className="text-5xl md:text-6xl font-black uppercase tracking-[0.1em] text-[#1a1a1a] mb-6" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
                        Certificate
                    </h2>
                    <p className="text-lg italic font-medium tracking-wide">
                        This document is to officially verify and certify that
                    </p>
                    
                    {/* Beautiful Cursive Name */}
                    <div className="my-6 block">
                        <span className="text-5xl md:text-6xl text-slate-800" style={{ fontFamily: "'Great Vibes', 'Dancing Script', 'Brush Script MT', 'Tangerine', cursive", padding: "0 40px", borderBottom: '2px solid #2e3440' }}>
                            {studentName}
                        </span>
                    </div>
                    
                    <p className="text-lg italic font-medium">
                        has successfully fulfilled the prescribed requirements and passed the
                    </p>
                    
                    <h3 className="text-2xl font-bold uppercase tracking-widest mt-6 text-[#2e3440]">
                        {exam.exam_name || identity.examFullTitle}
                    </h3>

                    <div className="mt-4 text-base italic text-slate-700">
                        obtaining <strong className="text-black text-xl px-1">{resultData.totalObtained || resultData.score || '—'}</strong> marks out of a total <strong className="text-black px-1">{resultData.totalMax || '—'}</strong>, <br/>
                        achieving an overall standing of <strong className="text-black text-xl uppercase px-1 border-b border-dashed border-slate-400">{resultData.remarks || 'PASS'}</strong>.
                    </div>
                </div>

                {/* Footer Signatures */}
                <div className="w-full grid grid-cols-3 items-end mt-12 px-6">
                    {/* Date Block */}
                    <div className="text-center">
                        <div className="text-lg font-medium border-b border-slate-600 pb-1 mx-8">{issueDate}</div>
                        <div className="text-xs font-bold uppercase tracking-widest mt-2 text-slate-600">Date of Award</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest mt-4 text-slate-400">Reg ID: {app.applicationId || 'N/A'}</div>
                    </div>
                    
                    {/* Central Seal rendering */}
                    <div className="flex justify-center flex-col items-center">
                        <div className="w-28 h-28 border-[3px] border-[#2e3440] rounded-full flex flex-col items-center justify-center p-1 relative shadow-sm" style={{mixBlendMode: 'multiply'}}>
                            {boardSealUrl ? (
                                <img src={boardSealUrl} alt="Seal" className="w-[90%] h-[90%] object-contain opacity-80" />
                            ) : (
                                <div className="w-full h-full border border-dashed border-[#2e3440] rounded-full flex flex-col items-center justify-center text-center">
                                    <span className="text-[14px] font-bold uppercase leading-none tracking-widest">Official</span>
                                    <span className="text-xs font-bold uppercase leading-none tracking-widest mt-1">Seal</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Authority Signature */}
                    <div className="text-center">
                        <div className="flex justify-center border-b border-slate-600 pb-1 mx-8 min-h-[50px] items-end">
                            {controllerSigUrl ? (
                                <img src={controllerSigUrl} alt="Authorized Signature" className="max-h-[50px] object-contain" />
                            ) : (
                                <span className="text-xl italic font-serif" style={{ fontFamily: "'Dancing Script', cursive, serif"}}>{admin.signatoryName}</span>
                            )}
                        </div>
                        <div className="text-xs font-bold uppercase tracking-widest mt-2 text-slate-600">{admin.signatoryDesignation}</div>
                    </div>
                </div>
            </div>
        </motion.div>
    );

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center overflow-y-auto p-4 print:p-0 print:bg-white font-sans">
            <div className="w-full max-w-[960px] m-auto flex flex-col pt-10 pb-10 print:pt-0 print:pb-0">
                
                {/* Action bar (Modern UI look, hidden on print) */}
                <div className="no-print bg-white p-3 rounded-xl shadow-lg border border-slate-200 mb-6 flex justify-between items-center z-20 sticky top-4 w-full mx-auto" style={{fontFamily: 'DM Sans, Segoe UI, sans-serif'}}>
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button onClick={() => setViewMode('paper')} className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${viewMode === 'paper' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}><FileText size={16}/> Traditional Paper</button>
                        <button onClick={() => setViewMode('modern')} className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${viewMode === 'modern' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}><LayoutDashboard size={16}/> Digital Certificate</button>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleDownloadPDF} className="hidden md:flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 font-bold text-[11px] uppercase tracking-wider rounded-lg transition-colors border border-blue-100"><Download size={14} /> Download PDF</button>
                        <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all"><Printer size={16} /> Print Document</button>
                        <button onClick={onClose} className="flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"><X size={20} /></button>
                    </div>
                </div>

                {/* Print area wrapper */}
                <div ref={certificateRef} className="print:w-full flex justify-center">
                    <style dangerouslySetInnerHTML={{ __html: `
                        @media print {
                            @page { size: landscape; margin: 0; }
                            body { background: white !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; margin: 0; padding: 0;}
                            body * { visibility: hidden; }
                            .print\\:w-full, .print\\:w-full * { visibility: visible; }
                            .print\\:w-full { 
                                position: absolute; 
                                left: 50%; 
                                top: 50%;
                                transform: translate(-50%, -50%);
                                width: 100%; 
                                z-index: 9999;
                                display: flex;
                                justify-content: center;
                            }
                            .no-print { display: none !important; }
                        }
                    `}} />
                    <AnimatePresence mode="wait">
                        {viewMode === 'modern' ? renderModernView() : renderPaperView()}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
};

export default Certificate;
