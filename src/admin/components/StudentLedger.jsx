import React from 'react';
import { motion } from 'framer-motion';
import { Printer, X, Users, UserCheck } from 'lucide-react';

const StudentLedger = ({ students, filters, onClose }) => {
    const handlePrint = () => {
        window.print();
    };

    // Group by school if multiple exist
    const groupedStudents = (students || []).reduce((acc, st) => {
        const schoolName = st.schoolName || "Self Study / Private";
        if (!acc[schoolName]) acc[schoolName] = [];
        acc[schoolName].push(st);
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
                            <Users size={24} className="text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-black uppercase tracking-tight">Student Directory Preview</h2>
                            <p className="text-[10px] text-blue-300 font-bold uppercase tracking-widest">
                                Total {students.length} students matching current filters
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
                        {Object.entries(groupedStudents).map(([schoolName, schoolSts]) => (
                            <div key={schoolName} className="bg-white p-8 border border-gray-100 shadow-sm print:shadow-none print:border-none print:p-4 break-after-page">
                                {/* Letter Head */}
                                <div className="text-center mb-8 border-b-2 border-black pb-4">
                                    <h1 className="text-2xl font-black text-gray-900 mb-1">महाराष्ट्र राष्ट्रभाषा सभा, पुणे</h1>
                                    <p className="text-sm font-bold text-gray-700 uppercase tracking-widest">Maharashtra Rashtrabhasha Sabha, Pune</p>
                                    <div className="mt-4 flex justify-between items-end">
                                        <div className="text-left">
                                            <h3 className="text-lg font-black text-[#4c84ff] truncate max-w-lg">{schoolName}</h3>
                                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Registered Student Directory</p>
                                        </div>
                                        <div className="text-right text-[10px] font-bold text-gray-500 space-y-0.5">
                                            {filters.region && <p>REGION: {filters.region}</p>}
                                            {filters.centre && <p>CENTRE: {filters.centre}</p>}
                                        </div>
                                    </div>
                                </div>

                                {/* Table */}
                                <table className="w-full border-collapse border border-black text-[11px]">
                                    <thead>
                                        <tr className="bg-gray-100 print:bg-gray-100 uppercase tracking-tighter font-black">
                                            <th className="border border-black p-2 text-center w-10">Sr</th>
                                            <th className="border border-black p-2 text-center w-20">ID</th>
                                            <th className="border border-black p-2 text-left">Full Name</th>
                                            <th className="border border-black p-2 text-left">Contact / Mobile</th>
                                            <th className="border border-black p-2 text-left">Email Address</th>
                                            <th className="border border-black p-2 text-center w-16">Age</th>
                                            <th className="border border-black p-2 text-center w-24">Mother Tongue</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {schoolSts.map((st, idx) => (
                                            <tr key={idx} className="hover:bg-gray-50 print:hover:bg-transparent">
                                                <td className="border border-black p-2 text-center">{idx + 1}</td>
                                                <td className="border border-black p-2 text-center font-bold">#{st.studentId}</td>
                                                <td className="border border-black p-2 font-black uppercase">
                                                    {st.firstName} {st.middleName || ""} {st.lastName}
                                                </td>
                                                <td className="border border-black p-2 font-medium">{st.contact || "-"}</td>
                                                <td className="border border-black p-2 font-medium">{st.email || "-"}</td>
                                                <td className="border border-black p-2 text-center">{st.age || "-"}</td>
                                                <td className="border border-black p-2 text-center font-bold uppercase tracking-tighter">
                                                    {st.motherTongue || "-"}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>

                                {/* Footer for Print */}
                                <div className="mt-12 pt-4 border-t border-gray-100 flex justify-between items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                                    <div>Maharashtra Rashtrabhasha Sabha, Pune • Generated: {new Date().toLocaleString()}</div>
                                    <div className="text-right">Total Students in school: {schoolSts.length} • Page ______</div>
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
                            size: landscape;
                            margin: 1cm;
                        }
                    }
                `}</style>
            </motion.div>
        </div>
    );
};

export default StudentLedger;
