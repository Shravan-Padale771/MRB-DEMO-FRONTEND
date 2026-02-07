import React from 'react';
import { motion } from 'framer-motion';
import { User } from 'lucide-react';

const StudentLogin = ({ students, setCurrentUser }) => {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100">
                <div className="text-center mb-6">
                    <User size={48} className="mx-auto text-indigo-600 mb-3" />
                    <h2 className="text-3xl font-bold text-gray-800">Student Login</h2>
                    <p className="text-gray-500 text-sm mt-2">
                        Select your account to continue
                    </p>
                </div>
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {students.length === 0 ? (
                        <div className="text-center p-8 text-gray-400">
                            <p>No students available</p>
                        </div>
                    ) : (
                        students.map((s) => (
                            <motion.button
                                key={s.studentId}
                                whileHover={{ scale: 1.02 }}
                                onClick={() => setCurrentUser(s)}
                                className="w-full flex justify-between items-center p-4 bg-gray-50 hover:bg-indigo-50 border border-transparent hover:border-indigo-200 rounded-xl transition-all duration-200"
                            >
                                <span className="font-semibold text-gray-700">
                                    {s.username}
                                </span>
                                <span className="text-xs bg-white border px-2 py-1 rounded text-gray-400">
                                    ID: {s.studentId}
                                </span>
                            </motion.button>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default StudentLogin;
