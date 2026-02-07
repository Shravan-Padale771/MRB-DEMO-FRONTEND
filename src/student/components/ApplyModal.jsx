import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const ApplyModal = ({
    selectedExam,
    setSelectedExam,
    applicationForm,
    setApplicationForm,
    handleFormSubmit
}) => {
    return (
        <AnimatePresence>
            {selectedExam && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden"
                    >
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center text-white">
                            <h3 className="font-bold text-lg">
                                Apply for {selectedExam.exam_name}
                            </h3>
                            <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setSelectedExam(null)}
                                className="hover:bg-white/20 p-2 rounded-lg transition-colors"
                            >
                                <X size={20} />
                            </motion.button>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleFormSubmit} className="space-y-5">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Full Name
                                    </label>
                                    <input
                                        required
                                        placeholder="Enter your full name"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                        value={applicationForm.fullName}
                                        onChange={(e) =>
                                            setApplicationForm({
                                                ...applicationForm,
                                                fullName: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number
                                    </label>
                                    <input
                                        required
                                        placeholder="Enter your phone number"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                        value={applicationForm.phone}
                                        onChange={(e) =>
                                            setApplicationForm({
                                                ...applicationForm,
                                                phone: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <textarea
                                        required
                                        placeholder="Enter your address"
                                        rows="3"
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition resize-none"
                                        value={applicationForm.address}
                                        onChange={(e) =>
                                            setApplicationForm({
                                                ...applicationForm,
                                                address: e.target.value,
                                            })
                                        }
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Gender
                                    </label>
                                    <select
                                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
                                        value={applicationForm.gender}
                                        onChange={(e) =>
                                            setApplicationForm({
                                                ...applicationForm,
                                                gender: e.target.value,
                                            })
                                        }
                                    >
                                        <option>Male</option>
                                        <option>Female</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-lg font-bold hover:shadow-lg transition-all duration-300 mt-6"
                                >
                                    Submit Application
                                </motion.button>
                            </form>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default ApplyModal;
