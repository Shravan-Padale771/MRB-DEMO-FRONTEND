import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, ArrowRight, ShieldCheck } from 'lucide-react';
import Certificate from './Certificate';

const MyCertificates = ({ myResults, applications, exams, student }) => {
    const [selectedCertificate, setSelectedCertificate] = useState(null);

    // Filter results where the student passed
    const passedResults = myResults.filter(result => {
        try {
            const data = typeof result.resultData === 'string' ? JSON.parse(result.resultData) : (result.resultData || {});
            return data.remarks === 'Pass' || data.remarks?.toLowerCase().includes('pass') || data.score >= 35; // Assuming 35 is passing just in case remarks is empty
        } catch (e) {
            return false;
        }
    }).map(result => {
        let application = null;
        let exam = null;

        if (result.application && result.application.applicationId) {
            application = applications.find(a => a.applicationId === result.application.applicationId);
        } else if (result.applicationId) {
            application = applications.find(a => a.applicationId === result.applicationId);
        }

        if (application) {
            exam = exams.find(e => e.examNo === application.examNo);
        }

        return {
            ...result,
            application: {
                ...application,
                student: student,
                exam: exam
            }
        };
    });

    return (
        <div style={{ fontFamily: 'DM Sans, Segoe UI, sans-serif' }}>
            <div className="mb-8 border-b border-gray-100 pb-5">
                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
                    <Award size={24} className="text-amber-500" /> Digital Certificates
                </h2>
                <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em] uppercase mt-1">OFFICIAL VERIFIED AWARDS</p>
            </div>

            <div className="flex flex-col gap-5">
                {passedResults.length === 0 ? (
                    <div className="bg-white p-12 rounded-3xl border border-gray-100 text-center shadow-xl shadow-black/5 animate-in fade-in duration-500">
                        <div className="w-24 h-24 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mx-auto mb-8 shadow-inner">
                            <Award size={48} />
                        </div>
                        <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">Digital Certificates</h2>
                        <p className="text-gray-500 max-w-sm mx-auto leading-relaxed">
                            Complete your examinations and achieve qualifying marks to unlock your verifiable digital certificates here.
                        </p>
                        <div className="mt-10 flex justify-center gap-4">
                            <div className="w-3 h-3 rounded-full bg-indigo-100" />
                            <div className="w-3 h-3 rounded-full bg-indigo-200" />
                            <div className="w-3 h-3 rounded-full bg-indigo-300" />
                        </div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 gap-6">
                        {passedResults.map((result) => {
                            let scoreData = {};
                            try {
                                if (result.resultData) scoreData = typeof result.resultData === 'string' ? JSON.parse(result.resultData) : result.resultData;
                            } catch (e) { }

                            return (
                                <motion.div
                                    key={result.id || Math.random()}
                                    initial={{ opacity: 0, scale: 0.98 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    whileHover={{ y: -4, borderColor: '#f59e0b' }}
                                    className="bg-white rounded-2xl border border-amber-100/50 shadow-sm overflow-hidden flex flex-col transition-all duration-300 group"
                                >
                                    <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 flex justify-between items-start border-b border-amber-100/30">
                                        <div>
                                            <div className="text-[9px] font-black text-amber-600 uppercase tracking-widest mb-1 flex items-center gap-1">
                                                <ShieldCheck size={10} /> VERIFIED ACHIEVEMENT
                                            </div>
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight">
                                                {result.application?.exam?.exam_name || "Examination"}
                                            </h3>
                                        </div>
                                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm text-amber-500 flex-shrink-0 border border-amber-100">
                                            <Award size={24} />
                                        </div>
                                    </div>

                                    <div className="p-6 flex-grow flex flex-col justify-between">
                                        <div className="mb-6 space-y-2">
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-medium">Issue Date</span>
                                                <span className="font-bold text-gray-900">{new Date(result.publishedAt).toLocaleDateString()}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-medium">Grade</span>
                                                <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 uppercase text-xs tracking-wider">{scoreData.remarks || 'PASS'}</span>
                                            </div>
                                            <div className="flex justify-between items-center text-sm">
                                                <span className="text-gray-500 font-medium">Score Rank</span>
                                                <span className="font-bold text-gray-900">{scoreData.score || scoreData.totalObtained} / {scoreData.totalMax}</span>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => setSelectedCertificate(result)}
                                            className="w-full bg-white border border-gray-200 text-gray-700 font-bold py-3 rounded-xl text-xs uppercase tracking-widest flex items-center justify-center gap-2 group-hover:bg-amber-50 group-hover:text-amber-600 group-hover:border-amber-200 transition-all duration-300"
                                        >
                                            <Download size={14} /> View Certificate <ArrowRight size={14} />
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>

            {selectedCertificate && (
                <Certificate
                    result={selectedCertificate}
                    onClose={() => setSelectedCertificate(null)}
                />
            )}
        </div>
    );
};

export default MyCertificates;
