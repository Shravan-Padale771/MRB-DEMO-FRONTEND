import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { Printer, X, FileText, Award } from 'lucide-react';

const ResultLedger = ({ results, filters, onClose }) => {
    const printRef = useRef();

    const handlePrint = () => {
        window.print();
    };

    // Group results by exam if needed, or just a continuous list
    // The user mentioned "all results from all exams one after another pages"
    // So we should group by Exam Name if there are multiple.
    const groupedResults = results.reduce((acc, res) => {
        const examName = res.examName || "Unknown Exam";
        if (!acc[examName]) acc[examName] = [];
        acc[examName].push(res);
        return acc;
    }, {});

    return (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[200] flex flex-col items-center p-4 md:p-10 overflow-hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white w-full max-w-6xl h-full rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header/Toolbar */}
                <div className="bg-[#1b223c] p-6 flex justify-between items-center text-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-blue-500/20 rounded-xl">
                            <FileText size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Result Ledger Preview</h2>
                            <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">
                                Total {results.length} results matching current filters
                            </p>
                        </div>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={handlePrint}
                            className="bg-[#4c84ff] hover:bg-blue-600 px-6 py-2.5 rounded-xl font-black text-sm uppercase tracking-widest flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20"
                        >
                            <Printer size={18} /> Print All
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
                <div className="flex-1 overflow-y-auto p-8 md:p-12 bg-gray-50 print:bg-white print:p-0 print:overflow-visible">
                    <div ref={printRef} className="max-w-[1000px] mx-auto space-y-12">
                        {Object.entries(groupedResults).map(([examName, examResults]) => (
                            <div key={examName} className="bg-white p-8 border border-gray-100 shadow-sm print:shadow-none print:border-none print:p-4 break-after-page">
                                {/* Letter Head */}
                                <div className="text-center mb-8 border-b-2 border-black pb-4">
                                    <h1 className="text-2xl font-black text-gray-900 mb-1">महाराष्ट्र राष्ट्रभाषा सभा, पुणे</h1>
                                    <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Maharashtra Rashtrabhasha Sabha, Pune</p>
                                    <div className="mt-4 flex justify-between items-end">
                                        <div className="text-left">
                                            <h3 className="text-lg font-black text-blue-600">{examName}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase">Examination Statement of Marks (Ledger)</p>
                                        </div>
                                        <div className="text-right text-[10px] font-bold text-gray-500 space-y-0.5">
                                            {filters.region && <p>REGION: {filters.region}</p>}
                                            {filters.centre && <p>CENTRE: {filters.centre}</p>}
                                            {filters.school && <p>SCHOOL: {filters.school}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Table */}
                                <table className="w-full border-collapse border border-black text-sm">
                                    <thead>
                                        <tr className="bg-gray-100 print:bg-gray-100">
                                            <th className="border border-black p-2 text-center w-20">Roll No</th>
                                            <th className="border border-black p-2 text-left">Student Name</th>
                                            <th className="border border-black p-2 text-center w-24">Obtained</th>
                                            <th className="border border-black p-2 text-center w-24">Percentage</th>
                                            <th className="border border-black p-2 text-center w-32">Result / Shreni</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {examResults.map((res, idx) => {
                                            const scoreData = typeof res.resultData === 'string' ? JSON.parse(res.resultData || '{}') : (res.resultData || {});
                                            return (
                                                <tr key={idx} className="hover:bg-gray-50 print:hover:bg-transparent">
                                                    <td className="border border-black p-2 text-center font-bold">{res.applicationId}</td>
                                                    <td className="border border-black p-2 font-medium">{res.studentName}</td>
                                                    <td className="border border-black p-2 text-center font-bold">
                                                        {scoreData.totalObtained || res.score || "-"}
                                                        <span className="text-[10px] text-gray-400 font-normal ml-1">/{scoreData.totalMax || 100}</span>
                                                    </td>
                                                    <td className="border border-black p-2 text-center font-black">
                                                        {res.percentage ? `${res.percentage.toFixed(2)}%` : "-"}
                                                    </td>
                                                    <td className="border border-black p-2 text-center">
                                                        <span className={`font-black uppercase tracking-tighter ${scoreData.remarks === 'Pass' ? 'text-green-700' : 'text-red-700'}`}>
                                                            {scoreData.remarks || "-"}
                                                        </span>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>

                                {/* Footer for Print */}
                                <div className="mt-8 flex justify-between items-center text-[11px] font-bold">
                                    <div>Printed on: {new Date().toLocaleString()}</div>
                                    <div className="text-right">Page ______ of ______</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Global CSS for Print */}
                <style>{`
                    @media print {
                        body * {
                            visibility: hidden;
                        }
                        #report-ledger, #report-ledger * {
                            visibility: visible;
                        }
                        #report-ledger {
                            position: absolute;
                            left: 0;
                            top: 0;
                            width: 100%;
                            height: auto !important;
                            overflow: visible !important;
                        }
                        .break-after-page {
                            page-break-after: always;
                            border: none !important;
                            padding: 0 !important;
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

export default ResultLedger;
