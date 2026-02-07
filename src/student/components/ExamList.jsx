import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, FileText, DollarSign } from 'lucide-react';

const ExamList = ({ exams, openApplyModal }) => {
    return (
        <div>
            <h2 className="text-2xl font-bold mb-8 text-gray-800 border-l-4 border-indigo-600 pl-4 flex items-center gap-2">
                <BookOpen size={24} /> Available Exams
            </h2>
            {exams.length === 0 ? (
                <div className="text-center p-12 bg-white rounded-xl border-2 border-dashed">
                    <BookOpen className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-gray-500 font-medium">No exams available</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 gap-6">
                    {exams.map((exam) => (
                        <motion.div
                            key={exam.examNo}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            whileHover={{ translateY: -5 }}
                            className="bg-white p-6 rounded-xl shadow-md border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col justify-between"
                        >
                            <div className="mb-4">
                                <div className="flex items-start justify-between mb-3">
                                    <h3 className="text-xl font-bold text-gray-900 flex-1">
                                        {exam.exam_name}
                                    </h3>
                                    <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                                        Exam #{exam.examNo}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-gray-400" />
                                        <span>
                                            <strong>{exam.no_of_papers}</strong> Papers
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DollarSign size={16} className="text-green-500" />
                                        <span className="font-semibold text-green-600">
                                            ${exam.exam_fees}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => openApplyModal(exam)}
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg hover:shadow-lg font-semibold transition-all duration-300"
                            >
                                Apply Now
                            </motion.button>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ExamList;
