import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, X, FileText, Users } from 'lucide-react';

const ApplicationLedger = ({ applications, filters, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    // Group by exam if multiple exist
    const groupedApplications = applications.reduce((acc, app) => {
        const examName = app.examName || "Unknown Exam";
        if (!acc[examName]) acc[examName] = [];
        acc[examName].push(app);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[200] flex flex-col items-center p-4 md:p-10 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.15 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-6xl h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header/Toolbar */}
                <div className="bg-[#1b223c] p-6 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <Users size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Application List Preview</h2>
                            <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">
                                Total {applications.length} applications matching current filters
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="bg-[#4c84ff] hover:bg-blue-600 px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                        >
                            <Printer size={18} /> Print Now
                        </button>
                        <button
                            onClick={onClose}
                            className="p-2.5 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Print Preview Content */}
                <div id="print-area" className="flex-1 overflow-y-auto p-8 md:p-12 bg-gray-50 print:bg-white print:p-0 print:overflow-visible">
                    <div className="max-w-[1000px] mx-auto space-y-12">
                        {Object.entries(groupedApplications).map(([examName, examApps]) => (
                            <div key={examName} className="bg-white p-8 border border-gray-100 shadow-sm print:shadow-none print:border-none print:p-4 break-after-page">
                                {/* Letter Head */}
                                <div className="text-center mb-8 border-b-2 border-black pb-4">
                                    <h1 className="text-2xl font-black text-gray-900 mb-1">महाराष्ट्र राष्ट्रभाषा सभा, पुणे</h1>
                                    <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Maharashtra Rashtrabhasha Sabha, Pune</p>
                                    <div className="mt-4 flex justify-between items-end">
                                        <div className="text-left">
                                            <h3 className="text-lg font-black text-[#4c84ff]">{examName}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Student Enrollment / Application List</p>
                                        </div>
                                        <div className="text-right text-[10px] font-bold text-gray-500 space-y-0.5">
                                            {filters.region && <p>REGION: {filters.region}</p>}
                                            {filters.centre && <p>CENTRE: {filters.centre}</p>}
                                            {filters.school && <p>SCHOOL: {filters.school}</p>}
                                            {filters.status && <p>STATUS: {filters.status}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Table */}
                                <table className="w-full border-collapse border border-black text-xs">
                                    <thead>
                                        <tr className="bg-gray-100 print:bg-gray-100 uppercase tracking-tighter">
                                            <th className="border border-black p-2 text-center w-12">Sr.No</th>
                                            <th className="border border-black p-2 text-center w-24">App ID</th>
                                            <th className="border border-black p-2 text-center w-24">Student ID</th>
                                            <th className="border border-black p-2 text-left">Student Name</th>
                                            <th className="border border-black p-2 text-center w-32">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {examApps.map((app, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="border border-black p-2 text-center font-bold">{idx + 1}</td>
                                                <td className="border border-black p-2 text-center font-bold">#{app.applicationId}</td>
                                                <td className="border border-black p-2 text-center font-medium">SID: {app.studentId}</td>
                                                <td className="border border-black p-2 font-black text-sm uppercase">{app.studentName}</td>
                                                <td className="border border-black p-2 text-center font-black uppercase tracking-tighter">
                                                    {app.status}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Stats Summary */}
                                <div className="mt-6 flex gap-8 items-center justify-end">
                                    <div className="text-[11px] font-black uppercase text-gray-400">Application Breakup:</div>
                                    <div className="flex gap-4">
                                        {['SUBMITTED', 'APPROVED', 'REJECTED'].map(status => {
                                            const count = examApps.filter(a => a.status === status).length;
                                            if (count === 0) return null;
                                            return (
                                                <div key={status} className="flex items-center gap-1.5 px-3 py-1 rounded bg-gray-50 border border-gray-100">
                                                    <span className="text-[10px] font-black text-gray-500">{status}:</span>
                                                    <span className="text-xs font-black text-gray-900">{count}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Signatures Area */}
                                <div className="mt-20 flex justify-between items-end">
                                    <div className="text-center w-48 border-t border-dotted border-black pt-2 text-[10px] font-bold uppercase">
                                        Prepared By
                                    </div>
                                    <div className="text-center w-48 border-t border-dotted border-black pt-2 text-[10px] font-bold uppercase">
                                        Centre Incharge
                                    </div>
                                    <div className="text-center w-48 border-t border-dotted border-black pt-2 text-[10px] font-bold uppercase font-black text-[#4c84ff]">
                                        Controller of Exams
                                    </div>
                                </div>

                                {/* Footer for Print */}
                                <div className="mt-12 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div>Maharashtra Rashtrabhasha Sabha, Pune • Generated: {new Date().toLocaleString()}</div>
                                    <div>Page ______ of ______</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #print-area, #print-area * {
                            visibility: visible;
                        }
                        #print-area {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100% !important;
                            height: auto !important;
                            overflow: visible !important;
                            padding: 0 !important;
                        }
                        .break-after-page {
                            page-break-after: always;
                            border: none !important;
                        }
                        @page {
                            size: portrait;
                            margin: 1cm;
                        }
                    }
                `}</style>
            </motion.div>
        </div>
    );
};

export default ApplicationLedger;
