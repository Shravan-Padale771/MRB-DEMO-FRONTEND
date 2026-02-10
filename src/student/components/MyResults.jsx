import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle, Calendar, FileText } from 'lucide-react';
import Marksheet from './Marksheet';

import { getAllExams, getAllApplications } from '../../api';
import { useQuery } from '@tanstack/react-query';

const MyResults = ({ myResults, student }) => {
    const [selectedResult, setSelectedResult] = useState(null);

    const { data: exams = [] } = useQuery({ queryKey: ['exams'], queryFn: getAllExams });
    const { data: applications = [] } = useQuery({ queryKey: ['applications'], queryFn: getAllApplications });

    // Process results to include full exam/application details for Marksheet
    const processedResults = myResults.map(result => {
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

        // Reconstruct the nested structure Marksheet expects
        return {
            ...result,
            application: {
                ...application,
                student: student, // Pass the full student object
                exam: exam
            }
        };
    });

    return (
        <div>
            <h2 className="text-2xl font-bold mb-8 text-gray-800 border-l-4 border-green-500 pl-4 flex items-center gap-2">
                <Award size={24} /> My Results
            </h2>

            <div className="space-y-4">
                {myResults.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm text-center border border-dashed border-gray-300">
                        <Award className="mx-auto text-gray-300 mb-3" size={40} />
                        <p className="text-gray-500 font-medium">No results yet</p>
                        <p className="text-xs text-gray-400 mt-1">
                            Your exam results will appear here
                        </p>
                    </div>
                ) : (
                    processedResults.map((result) => (
                        <motion.div
                            key={result.id || Math.random()}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-gradient-to-br from-green-50 to-white p-6 rounded-xl shadow-md border-l-4 border-green-500 hover:shadow-lg transition-all duration-300"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-bold text-gray-800 text-lg">
                                        {result.application?.exam?.exam_name || "Exam Result"}
                                    </h3>
                                    <p className="text-xs text-gray-600 mt-1">
                                        App ID: #{result.application?.applicationId}
                                    </p>
                                </div>
                                <CheckCircle
                                    className="text-green-500 flex-shrink-0"
                                    size={28}
                                />
                            </div>

                            <div className="bg-white p-4 rounded-lg border-2 border-green-200 mb-4">
                                {(() => {
                                    try {
                                        const data = JSON.parse(result.resultData);
                                        return (
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center pb-2 border-b">
                                                    <span className="text-2xl font-black text-indigo-600">
                                                        {data.score}
                                                    </span>
                                                    <span
                                                        className={`px-3 py-1 rounded-full text-xs font-bold ${data.remarks === "Pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                                    >
                                                        {data.remarks}
                                                    </span>
                                                </div>
                                                {data.breakdown && (
                                                    <div className="space-y-1.5">
                                                        {Object.entries(data.breakdown).map(
                                                            ([name, marks]) => (
                                                                <div
                                                                    key={name}
                                                                    className="flex justify-between text-sm text-gray-600"
                                                                >
                                                                    <span>{name}</span>
                                                                    <span className="font-bold">
                                                                        {marks}
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                        {data.oralMarks > 0 && (
                                                            <div className="flex justify-between text-sm text-indigo-600 font-medium">
                                                                <span>Oral Exam</span>
                                                                <span className="font-bold">{data.oralMarks}</span>
                                                            </div>
                                                        )}
                                                        {data.projectMarks > 0 && (
                                                            <div className="flex justify-between text-sm text-indigo-600 font-medium">
                                                                <span>Project Work</span>
                                                                <span className="font-bold">{data.projectMarks}</span>
                                                            </div>
                                                        )}
                                                        <div className="flex justify-between pt-2 border-t text-sm font-bold text-gray-800">
                                                            <span>Total Marks</span>
                                                            <span>
                                                                {data.totalObtained} / {data.totalMax}
                                                            </span>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    } catch (e) {
                                        return (
                                            <p className="text-sm font-mono text-gray-800 break-words font-semibold">
                                                {result.resultData}
                                            </p>
                                        );
                                    }
                                })()}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                    <Calendar size={14} />
                                    {new Date(result.publishedAt).toLocaleDateString()}
                                </div>
                                <button
                                    onClick={() => setSelectedResult(result)}
                                    className="flex items-center gap-1.5 bg-indigo-600 text-white px-3 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 transition shadow-sm"
                                >
                                    <FileText size={14} /> View Marksheet
                                </button>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {selectedResult && (
                <Marksheet
                    result={selectedResult}
                    onClose={() => setSelectedResult(null)}
                />
            )}
        </div>
    );
};

export default MyResults;
