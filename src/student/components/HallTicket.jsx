import React, { useState, useMemo, useRef } from 'react';
import { Printer, Download, FileText, LayoutDashboard } from 'lucide-react';
import html2pdf from 'html2pdf.js';

// Helper: extract URL from backend JSON map strings like {"filename":"url"}
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

const HallTicket = ({ application, student, profile, exam, school, regions = [], centres = [], schools = [] }) => {
    const reportTemplateRef = useRef(null);
    const [viewMode, setViewMode] = useState('paper');

    if (!application) return null;

    const getCentreName = (id) => centres.find(c => c.centreId === id)?.centreName || '—';

    const papers = useMemo(() => {
        try { return JSON.parse(exam?.papers || '[]'); } catch { return []; }
    }, [exam?.papers]);

    const examDetails = useMemo(() => {
        try {
            const d = typeof exam?.exam_details === 'string' ? JSON.parse(exam?.exam_details) : exam?.exam_details;
            return d || {};
        } catch { return {}; }
    }, [exam?.exam_details]);

    const principalSigUrl = parseUrl(school?.principalSignatureUrl);
    const schoolStampUrl  = parseUrl(school?.schoolStampUrl);
    const controllerSigUrl = parseUrl(exam?.controllerSignatureUrl);
    const boardSealUrl    = parseUrl(exam?.boardSealUrl);
    const boardLogoUrl    = parseUrl(exam?.boardLogoUrl);

    const schedule = examDetails?.schedule || {};
    const adminDetails = examDetails?.administrative || {};
    const identity = examDetails?.identity || {};

    const formatAddress = (addr) => {
        if (!addr) return '—';
        return [addr.line1, addr.line2, addr.villageOrCity, addr.taluka, addr.district, addr.state, addr.pincode]
            .filter(Boolean).join(', ');
    };

    const handleDownloadPDF = () => {
        const element = reportTemplateRef.current;
        const opt = {
            margin: 0,
            filename: `HallTicket_${application.rollNo || application.applicationId}.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { scale: 2, useCORS: true, letterRendering: true },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        html2pdf().from(element).set(opt).save();
    };

    const renderPaperView = () => (
        <div className="mx-auto border border-[#e5e0d5] text-[#1a1a1a] pb-10" style={{ 
            maxWidth: '850px', 
            backgroundColor: '#fdfbf7', 
            backgroundImage: 'url("https://www.transparenttextures.com/patterns/natural-paper.png")', 
            backgroundBlendMode: 'multiply',
            fontFamily: 'Georgia, serif'
        }}>
            {/* Header */}
            <div className="flex justify-between items-center p-8 border-b-2 border-slate-800">
                <div className="w-24 h-24 border border-slate-800 p-1 flex items-center justify-center">
                    {boardSealUrl ? <img src={boardSealUrl} alt="Seal" className="w-full h-full object-contain" /> : "SEAL"}
                </div>
                <div className="text-center px-4">
                    <h1 className="text-2xl font-bold uppercase tracking-widest leading-tight">{identity.conductingBody || 'Maharashtra Rashtrabhasha Sabha, Pune'}</h1>
                    <h2 className="text-xl font-bold mt-2">{exam?.exam_name || application.examName}</h2>
                    <h3 className="text-lg font-bold mt-2 underline italic">ADMIT CARD / HALL TICKET</h3>
                </div>
                <div className="w-24 h-24 border border-slate-800 flex items-center justify-center text-xs text-center p-1 font-sans text-slate-400">
                    {profile?.profilePhotoUrl ? <img src={profile.profilePhotoUrl} alt="Student" className="w-full h-full object-cover" /> : "AFFIX PHOTO"}
                </div>
            </div>

            {/* Application Meta */}
            <div className="flex justify-between p-4 border-b border-slate-800 font-bold text-[15px]">
                <div>Roll No: <span className="text-xl ml-2">{application.rollNo || 'PENDING'}</span></div>
                <div>Application No: {application.applicationId}</div>
            </div>

            {/* Details Grid */}
            <div className="px-10 pt-6 pb-2">
                
                {/* 1. Candidate Information */}
                <h4 className="font-bold mb-2 text-[14px] uppercase tracking-wide border-b border-slate-800 pb-1">1. Candidate Information</h4>
                <table className="w-full text-left text-[14px] border-collapse border border-slate-800 mb-6">
                    <tbody>
                        <tr>
                            <th className="border border-slate-800 p-2 w-[140px]">Candidate Name</th>
                            <td className="border border-slate-800 p-2 font-bold text-lg" colSpan="3">
                                {application.studentName || `${student?.lastName || ''}, ${student?.firstName || ''} ${student?.middleName || ''}`}
                            </td>
                        </tr>
                        <tr>
                            <th className="border border-slate-800 p-2">Father / Mother</th>
                            <td className="border border-slate-800 p-2 font-bold" colSpan="3">
                                {profile?.fatherName || '—'} / {profile?.motherName || '—'}
                            </td>
                        </tr>
                        <tr>
                            <th className="border border-slate-800 p-2">DOB & Gender</th>
                            <td className="border border-slate-800 p-2 font-bold">{profile?.dateOfBirth || '—'} | {profile?.gender || '—'}</td>
                            <th className="border border-slate-800 p-2 w-[100px]">Category</th>
                            <td className="border border-slate-800 p-2 font-bold">{profile?.category || '—'}</td>
                        </tr>
                        <tr>
                            <th className="border border-slate-800 p-2">Address</th>
                            <td className="border border-slate-800 p-2 text-[13px]" colSpan="3">{formatAddress(profile?.address)}</td>
                        </tr>
                    </tbody>
                </table>

                {/* 2. Examination Details */}
                <h4 className="font-bold mb-2 text-[14px] uppercase tracking-wide border-b border-slate-800 pb-1">2. Examination Details</h4>
                <table className="w-full text-left text-[14px] border-collapse border border-slate-800 mb-6">
                    <tbody>
                        <tr>
                            <th className="border border-slate-800 p-2 w-[140px]">Exam Schedule</th>
                            <td className="border border-slate-800 p-2" colSpan="3">
                                Mode: <span className="font-bold">{schedule.mode || 'Paper-based'}</span> | 
                                Duration: <span className="font-bold">{schedule.totalDuration || '3 Hours'}</span> | 
                                Medium: <span className="font-bold">{schedule.medium || 'Hindi / English'}</span>
                            </td>
                        </tr>
                        <tr>
                            <th className="border border-slate-800 p-2">Dates & Fees</th>
                            <td className="border border-slate-800 p-2" colSpan="3">
                                Start: <span className="font-bold text-blue-800">{exam?.exam_start_date || '—'}</span> | 
                                End: <span className="font-bold">{exam?.exam_end_date || '—'}</span> | 
                                Fees: <span className="font-bold">Paid (₹ {exam?.exam_fees || '—'})</span>
                            </td>
                        </tr>
                    </tbody>
                </table>

                {/* 3. Institution & Centre Information */}
                <h4 className="font-bold mb-2 text-[14px] uppercase tracking-wide border-b border-slate-800 pb-1">3. Institution & Centre Info</h4>
                <table className="w-full text-left text-[14px] border-collapse border border-slate-800 mb-6">
                    <tbody>
                        <tr>
                            <th className="border border-slate-800 p-2 w-[140px]">School (Inst.)</th>
                            <td className="border border-slate-800 p-2 font-bold">
                                {application.schoolName || student?.schoolName || school?.schoolName || '—'} 
                                {school?.boardAffiliation ? ` (${school.boardAffiliation})` : ''}
                            </td>
                        </tr>
                        <tr>
                            <th className="border border-slate-800 p-2">Exam Center</th>
                            <td className="border border-slate-800 p-2 font-bold bg-slate-100/50">{getCentreName(application.centreId) || school?.centreName || '—'}</td>
                        </tr>
                    </tbody>
                </table>

                {/* Papers */}
                <h4 className="font-bold mb-3 underline text-[16px]">Opted Subjects</h4>
                <table className="w-full text-left text-[15px] border-collapse border border-slate-800 mb-8">
                    <thead>
                        <tr className="bg-slate-100/50">
                            <th className="border border-slate-800 p-3 w-16 text-center">Sr</th>
                            <th className="border border-slate-800 p-3">Subject Name</th>
                            <th className="border border-slate-800 p-3 w-32">Max Marks</th>
                        </tr>
                    </thead>
                    <tbody>
                        {papers.map((p, i) => (
                            <tr key={i}>
                                <td className="border border-slate-800 p-3 text-center">{i + 1}</td>
                                <td className="border border-slate-800 p-3 font-bold">{p.name}</td>
                                <td className="border border-slate-800 p-3 font-bold">{p.maxMarks}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                
                {/* Instructions */}
                <div className="mt-6 border border-slate-800 p-5 text-[14px]">
                    <strong>Instructions:</strong> {adminDetails.instructions || 'It is mandatory to present a physical copy of this Admit Card and a valid ID proof at the exam centre. Examinees should reach the centre 45 minutes before.'} {adminDetails.disclaimer || 'Use of unfair means will lead to immediate disqualification.'}
                </div>

                {/* Signatures */}
                <div className="grid grid-cols-3 gap-10 mt-16 text-center text-[14px] font-bold pt-12">
                    <div className="border-t border-slate-800 pt-3 relative">
                        {profile?.signatureUrl && <img src={profile.signatureUrl} alt="Sign" className="absolute bottom-10 left-1/2 -translate-x-1/2 max-h-14" />}
                        Signature of Candidate
                    </div>
                    <div className="border-t border-slate-800 pt-3 relative">
                        {schoolStampUrl && <img src={schoolStampUrl} alt="Stamp" className="absolute bottom-10 left-1/2 -translate-x-1/2 max-h-16 opacity-30" />}
                        {principalSigUrl && <img src={principalSigUrl} alt="Sign" className="absolute bottom-10 left-1/2 -translate-x-1/2 max-h-12" />}
                        Principal Seal & Sign
                    </div>
                    <div className="border-t border-slate-800 pt-3 relative">
                        {boardSealUrl && <img src={boardSealUrl} alt="Seal" className="absolute bottom-10 left-1/2 -translate-x-1/2 max-h-16 opacity-30" />}
                        {controllerSigUrl && <img src={controllerSigUrl} alt="Sign" className="absolute bottom-10 left-1/2 -translate-x-1/2 max-h-12" />}
                        {adminDetails.signatoryDesignation || 'Controller of Examinations'}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderModernView = () => (
        <div className="ht-container mx-auto font-sans">
            {/* Top Indigo Stripe */}
            <div className="ht-indigo-stripe" />

            {/* Official Header */}
            <div className="ht-header-bg px-10 py-10 relative" style={{ minHeight: '120px' }}>
                <div className="flex items-center justify-between gap-8">
                    {/* Board Seal / Logo Left */}
                    <div style={{ width: '100px', height: '100px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {boardSealUrl ? (
                            <img src={boardSealUrl} alt="Board Seal" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ width: '90px', height: '90px', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', color: 'rgba(255,255,255,0.5)', fontSize: '10px', fontWeight: 800, textAlign: 'center', letterSpacing: '0.05em' }}>
                                <span style={{ fontSize: '24px', fontWeight: 900 }}>MRB</span>
                                <span>OFFICIAL</span>
                            </div>
                        )}
                    </div>

                    {/* Center Text */}
                    <div style={{ textAlign: 'center', flex: 1 }}>
                        <div style={{ fontSize: '12px', fontWeight: 700, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '8px' }}>
                            {identity.conductingBody || 'Maharashtra Rashtrabhasha Sabha, Pune'}
                        </div>
                        <h1 style={{ margin: 0, fontSize: '28px', fontWeight: 900, color: 'white', textTransform: 'uppercase', letterSpacing: '1.5px', lineHeight: 1.1 }}>
                            {exam?.exam_name || application.examName}
                        </h1>
                        <div style={{ marginTop: '12px', fontSize: '14px', fontWeight: 800, color: '#fbbf24', textTransform: 'uppercase', letterSpacing: '0.3em', borderTop: '1px solid rgba(255,255,255,0.2)', display: 'inline-block', paddingTop: '8px' }}>
                            ADMIT CARD / HALL TICKET
                        </div>
                        <div style={{ marginTop: '8px', fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                            387, Narayan Peth, Pune – 411 030
                        </div>
                    </div>

                    {/* Board Logo Right */}
                    <div style={{ width: '100px', height: '100px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {boardLogoUrl ? (
                            <img src={boardLogoUrl} alt="Board Logo" style={{ width: '100px', height: '100px', objectFit: 'contain' }} />
                        ) : (
                            <div style={{ width: '90px', height: '90px', borderRadius: '8px', border: '3px solid rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.4)', fontSize: '10px', fontWeight: 800, textAlign: 'center', padding: '6px' }}>
                                BOARD LOGO
                            </div>
                        )}
                    </div>
                </div>

                {/* Sub-row: exam code and recognition */}
                <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px solid rgba(255,255,255,0.15)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                        Exam Code: <strong style={{ color: 'white' }}>{exam?.exam_code || '—'}</strong>
                    </span>
                    {identity.recognitionText && (
                        <span style={{ fontSize: '11px', color: '#a5b4fc', fontStyle: 'italic', fontWeight: 500 }}>{identity.recognitionText}</span>
                    )}
                    <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.8)' }}>
                        Session: <strong style={{ color: 'white' }}>{schedule.session || exam?.exam_start_date || '—'}</strong>
                    </span>
                </div>
            </div>

            {/* Indigo separator stripe */}
            <div style={{ height: '5px', background: 'linear-gradient(90deg, #4f46e5, #4c84ff, #4f46e5)' }} />

            {/* Roll Number + Application ID bar */}
            <div style={{ background: '#f8fafc', padding: '16px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #cbd5e0', flexWrap: 'wrap', gap: '15px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span style={{ fontSize: '11px', fontWeight: 800, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.1em' }}>Roll Number</span>
                    <span className="ht-roll">{application.rollNo || 'PENDING'}</span>
                </div>
                <div className="flex flex-col items-end">
                    <div style={{ fontSize: '14px', color: '#1e293b', fontWeight: 700 }}>
                        Application ID: <span style={{ color: '#e11d48', fontWeight: 900 }}>#{application.applicationId}</span>
                    </div>
                    <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 600, marginTop: '2px' }}>
                        Issued: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </div>
                </div>
            </div>

            {/* Candidate Details + Photo */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: 0 }}>
                {/* Left: candidate fields */}
                <div className="ht-section" style={{ border: 'none', borderRight: '1px solid #cbd5e0', borderBottom: '1px solid #cbd5e0' }}>
                    <div className="ht-section-header">1. Candidate Information</div>
                    <div className="ht-field-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                        <div className="ht-field" style={{ gridColumn: 'span 2' }}>
                            <span className="ht-label">Full Name (Last, First, Middle)</span>
                            <span className="ht-value" style={{ fontSize: '18px', fontWeight: 800, color: '#1e293b' }}>
                                {application.studentName || `${student?.lastName || ''}, ${student?.firstName || ''} ${student?.middleName || ''}`}
                            </span>
                        </div>
                        <div className="ht-field">
                            <span className="ht-label">Father's / Guardian's Name</span>
                            <span className="ht-value">{profile?.fatherName || '—'}</span>
                        </div>
                        <div className="ht-field">
                            <span className="ht-label">Mother's Name</span>
                            <span className="ht-value">{profile?.motherName || '—'}</span>
                        </div>
                        <div className="ht-field">
                            <span className="ht-label">Date of Birth</span>
                            <span className="ht-value">{profile?.dateOfBirth || '—'}</span>
                        </div>
                        <div className="ht-field">
                            <span className="ht-label">Gender / Category</span>
                            <span className="ht-value">{profile?.gender || '—'} / {profile?.category || '—'}</span>
                        </div>
                        <div className="ht-field" style={{ gridColumn: 'span 2' }}>
                            <span className="ht-label">Permanent Communication Address</span>
                            <span className="ht-value" style={{ fontSize: '12px', lineHeight: 1.4 }}>{formatAddress(profile?.address)}</span>
                        </div>
                    </div>
                </div>

                {/* Right: Photo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', borderBottom: '1px solid #cbd5e0', background: '#fcfcfc', gap: '12px' }}>
                    <div className="ht-photo">
                        {profile?.profilePhotoUrl ? (
                            <img src={profile.profilePhotoUrl} alt="Candidate" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span style={{ fontWeight: 700, padding: '10px' }}>AFFIX RECENT<br />PASSPORT SIZE<br />PHOTOGRAPH</span>
                        )}
                    </div>
                    <div style={{ fontSize: '10px', color: '#475569', textAlign: 'center', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Candidate Signature</div>
                    <div style={{ width: '140px', height: '40px', border: '1px dashed #cbd5e0', background: 'white' }}></div>
                </div>
            </div>

            {/* Exam Details */}
            <div className="ht-section">
                <div className="ht-section-header">2. Examination Details & Schedule</div>
                <div className="ht-field-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
                    <div className="ht-field">
                        <span className="ht-label">Exam Mode</span>
                        <span className="ht-value">{schedule.mode || 'Paper-based'}</span>
                    </div>
                    <div className="ht-field">
                        <span className="ht-label">Total Duration</span>
                        <span className="ht-value">{schedule.totalDuration || '3 Hours'}</span>
                    </div>
                    <div className="ht-field">
                        <span className="ht-label">Medium</span>
                        <span className="ht-value">{schedule.medium || 'Hindi / English'}</span>
                    </div>
                    <div className="ht-field">
                        <span className="ht-label">Commencement Date</span>
                        <span className="ht-value" style={{ color: '#1d4ed8' }}>{exam?.exam_start_date || '—'}</span>
                    </div>
                    <div className="ht-field">
                        <span className="ht-label">Conclusive Date</span>
                        <span className="ht-value">{exam?.exam_end_date || '—'}</span>
                    </div>
                    <div className="ht-field">
                        <span className="ht-label">Fee Status</span>
                        <span className="ht-value" style={{ color: '#059669' }}>Paid (₹ {exam?.exam_fees || '—'})</span>
                    </div>
                </div>

                {/* Papers table */}
                {papers.length > 0 && (
                    <div style={{ padding: '0 18px 18px 18px' }}>
                        <div className="ht-label" style={{ marginBottom: '10px' }}>Exam Papers Detail</div>
                        <table className="ht-table">
                            <thead>
                                <tr>
                                    <th style={{ width: '60px', textAlign: 'center' }}>Sr No</th>
                                    <th>Paper Name / Subject Code</th>
                                    <th style={{ width: '120px' }}>Max Marks</th>
                                    <th style={{ width: '150px' }}>Duration</th>
                                </tr>
                            </thead>
                            <tbody>
                                {papers.map((p, i) => (
                                    <tr key={i}>
                                        <td style={{ textAlign: 'center', fontWeight: 800, color: '#475569' }}>{String(i + 1).padStart(2, '0')}</td>
                                        <td style={{ fontWeight: 700, color: '#1e293b' }}>{p.name}</td>
                                        <td style={{ fontWeight: 600 }}>{p.maxMarks} Marks</td>
                                        <td>{schedule.totalDuration || '3 Hours'}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* School & Centre Details */}
            <div className="ht-section">
                <div className="ht-section-header">3. Institution & Centre Information</div>
                <div className="ht-field-grid" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
                    <div className="ht-field" style={{ gridColumn: 'span 2' }}>
                        <span className="ht-label">School / Institution Name</span>
                        <span className="ht-value" style={{ fontSize: '15px' }}>{application.schoolName || student?.schoolName || school?.schoolName || '—'}</span>
                    </div>
                    <div className="ht-field">
                        <span className="ht-label">Authorized Principal</span>
                        <span className="ht-value">{school?.principalName || '—'}</span>
                    </div>
                    <div className="ht-field">
                        <span className="ht-label">Board Affiliation Location</span>
                        <span className="ht-value">{school?.boardAffiliation || '—'}</span>
                    </div>
                    <div className="ht-field" style={{ gridColumn: 'span 2' }}>
                        <span className="ht-label">Assigned Examination Centre</span>
                        <span className="ht-value" style={{ background: '#f1f5f9', borderBottom: '2px solid #334155', padding: '4px 8px' }}>{getCentreName(application.centreId) || school?.centreName || 'To be updated'}</span>
                    </div>
                </div>
            </div>

            {/* Instructions */}
            <div className="ht-notice">
                <strong style={{ fontSize: '12px', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Essential Instructions for the Examinee</strong>
                <ul style={{ margin: '0 0 0 20px', padding: 0, listStyleType: 'decimal' }}>
                    <li style={{ marginBottom: '4px' }}>It is mandatory to present a physical copy of this Admit Card and a valid ID proof at the exam centre.</li>
                    <li style={{ marginBottom: '4px' }}>{adminDetails.instructions || 'Examinees should reach the centre 45 minutes before the commencement of the exam.'}</li>
                    <li style={{ marginBottom: '4px' }}>Calculators, mobile logs, and any electronic wearable devices are strictly prohibited.</li>
                    <li style={{ marginBottom: '4px' }}>{adminDetails.disclaimer || 'Use of unfair means will lead to immediate disqualification and legal action.'}</li>
                </ul>
            </div>

            {/* Signature & Stamp Row */}
            <div className="ht-sign-row">
                {/* Candidate Signature */}
                <div className="ht-sign-box">
                    <div className="ht-sign-img-area">
                        {profile?.signatureUrl ? (
                            <img src={profile.signatureUrl} alt="Candidate Signature" style={{ maxHeight: '70px', maxWidth: '100%', objectFit: 'contain' }} />
                        ) : (
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', border: '1px dashed #cbd5e0', padding: '10px 20px' }}>SPECIMEN SIGNATURE</span>
                        )}
                    </div>
                    <div className="ht-sign-label">Signature of Candidate</div>
                </div>

                {/* Principal Signature + School Stamp */}
                <div className="ht-sign-box">
                    <div className="ht-sign-img-area" style={{ flexDirection: 'column', gap: '6px' }}>
                        {principalSigUrl ? (
                            <img src={principalSigUrl} alt="Principal Signature" style={{ maxHeight: '50px', maxWidth: '100%', objectFit: 'contain', zIndex: 10 }} />
                        ) : (
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', zIndex: 10 }}>OFFICIAL SEAL</span>
                        )}
                        {schoolStampUrl && (
                            <img src={schoolStampUrl} alt="School Stamp" style={{ maxHeight: '60px', maxWidth: '90%', objectFit: 'contain', opacity: 0.3, position: 'absolute' }} />
                        )}
                    </div>
                    <div className="ht-sign-label z-10">Principal Attestation & Seal</div>
                </div>

                {/* Controller Signature + Board Seal */}
                <div className="ht-sign-box">
                    <div className="ht-sign-img-area" style={{ flexDirection: 'column', gap: '6px' }}>
                        {boardSealUrl && (
                            <img src={boardSealUrl} alt="Board Seal" style={{ maxHeight: '60px', maxWidth: '90%', objectFit: 'contain', opacity: 0.3, position: 'absolute' }} />
                        )}
                        {controllerSigUrl ? (
                            <img src={controllerSigUrl} alt="Controller Signature" style={{ maxHeight: '50px', maxWidth: '100%', objectFit: 'contain', zIndex: 10 }} />
                        ) : (
                            <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 800, textTransform: 'uppercase', zIndex: 10 }}>BOARD VERIFIED</span>
                        )}
                    </div>
                    <div className="ht-sign-label z-10">
                        {adminDetails.signatoryDesignation || 'Controller of Examinations'}
                    </div>
                </div>
            </div>

            {/* Footer text then stripe at very bottom */}
            <div style={{ padding: '14px 30px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700 }}>
                    System Generated: {new Date().toLocaleString('en-IN')} | UID: {application.applicationId}
                </span>
                <span style={{ fontSize: '10px', color: '#64748b', fontWeight: 700, textAlign: 'right' }}>
                    {adminDetails.departmentName || 'Examination Department'} &mdash; {new Date().getFullYear()}
                </span>
            </div>
            {/* Bottom Indigo Stripe — truly last element */}
            <div className="ht-indigo-stripe" />
        </div>
    );

    return (
        <div className="bg-transparent print:bg-white print:p-0">
            {/* Print Styles */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4; margin: 0; }
                    body { background: white !important; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    /* Hide everything except the hall ticket */
                    body * { visibility: hidden; }
                    .ht-print-area, .ht-print-area * { visibility: visible; }
                    .ht-print-area { 
                        position: absolute; 
                        left: 0; 
                        top: 0; 
                        width: 100%; 
                        z-index: 9999; 
                        padding: 0;
                        margin: 0;
                    }
                    .no-print { display: none !important; }
                    .ht-container { 
                        width: 100% !important; 
                        max-width: 100% !important; 
                        height: auto !important;
                        margin: 0 !important; 
                        border: none !important; 
                        box-shadow: none !important;
                    }
                    .ht-header-bg { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .ht-indigo-stripe { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                }

                .ht-container { 
                    max-width: 850px; 
                    margin: 0 auto; 
                    background: white; 
                    position: relative; 
                    border: 1px solid #cbd5e0; 
                    box-shadow: 0 10px 30px rgba(0,0,0,0.12); 
                    transition: all 0.3s ease;
                }
                .ht-header-bg { background: #1b223c; color: white; }
                .ht-indigo-stripe { height: 6px; background: linear-gradient(90deg, #4f46e5 0%, #4c84ff 50%, #4f46e5 100%); width: 100%; }
                .ht-section { margin-bottom: 0; border: 1px solid #cbd5e0; }
                .ht-section + .ht-section { border-top: none; }
                .ht-section-header { background-color: #edf2f7; padding: 10px 16px; font-weight: 700; text-transform: uppercase; font-size: 12px; border-bottom: 1px solid #cbd5e0; color: #1e293b; letter-spacing: 0.05em; }
                .ht-field-grid { display: grid; gap: 16px; padding: 18px; }
                .ht-field { display: flex; flex-direction: column; }
                .ht-label { font-size: 10px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; font-weight: 700; letter-spacing: 0.06em; }
                .ht-value { font-size: 14px; font-weight: 600; color: #0f172a; min-height: 24px; padding-bottom: 2px; border-bottom: 1px dashed #e2e8f0; }
                .ht-table { width: 100%; border-collapse: collapse; font-size: 13px; }
                .ht-table th, .ht-table td { border: 1px solid #cbd5e0; padding: 10px 14px; text-align: left; }
                .ht-table th { background-color: #f8fafc; font-weight: 700; color: #475569; text-transform: uppercase; font-size: 11px; letter-spacing: 0.07em; }
                .ht-sign-row { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; border-top: 1px solid #cbd5e0; }
                .ht-sign-box { height: 130px; display: flex; flex-direction: column; justify-content: space-between; align-items: center; padding: 12px; font-size: 11px; color: #1e293b; background: #fafafa; }
                .ht-sign-box + .ht-sign-box { border-left: 1px solid #cbd5e0; }
                .ht-sign-img-area { flex: 1; width: 100%; display: flex; align-items: center; justify-content: center; position: relative; }
                .ht-sign-label { font-size: 10px; font-weight: 700; text-align: center; color: #334155; text-transform: uppercase; letter-spacing: 0.05em; border-top: 1px solid #e2e8f0; padding-top: 8px; width: 100%; }
                .ht-photo { width: 130px; height: 160px; border: 2px solid #94a3b8; object-fit: cover; background: #f8fafc; display: flex; align-items: center; justify-content: center; font-size: 11px; color: #64748b; text-align: center; }
                .ht-roll { background: #1b223c; color: white; padding: 12px 24px; display: inline-block; font-size: 26px; font-weight: 900; letter-spacing: 0.15em; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); }
                .ht-notice { background: #fefce8; border: 1px solid #fef08a; padding: 16px; font-size: 12px; color: #164e63; border-radius: 4px; margin: 18px; line-height: 1.6; }
                .ht-notice strong { color: #155e75; }
            `}} />

            {/* View Toggle and Actions */}
            <div className="no-print max-w-[850px] mx-auto mb-6 flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 sticky top-4 z-[100]" style={{fontFamily: 'DM Sans, Segoe UI, sans-serif'}}>
                <div className="flex bg-slate-100 p-1 rounded-lg">
                    <button onClick={() => setViewMode('paper')} className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${viewMode === 'paper' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}><FileText size={16}/> Paper Form</button>
                    <button onClick={() => setViewMode('modern')} className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${viewMode === 'modern' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}><LayoutDashboard size={16}/> Modern UI</button>
                </div>
                
                <div className="flex gap-2">
                    <button onClick={() => window.print()} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors">
                        <Printer size={16} /> Print
                    </button>
                    <button onClick={handleDownloadPDF} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg transition-colors">
                        <Download size={16} /> Save PDF
                    </button>
                </div>
            </div>

            <div className="ht-print-area" ref={reportTemplateRef}>
                {viewMode === 'paper' ? renderPaperView() : renderModernView()}
            </div>
        </div>
    );
};

export default HallTicket;
