import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Users } from 'lucide-react';

const StudentManager = ({
    studentForm,
    setStudentForm,
    handleCreateStudent,
    students
}) => {
    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <Plus size={24} /> Add Student
                </h2>
                <form onSubmit={handleCreateStudent} className="space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Username
                        </label>
                        <input
                            required
                            placeholder="e.g. Raj Kumar"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={studentForm.username}
                            onChange={(e) =>
                                setStudentForm({
                                    ...studentForm,
                                    username: e.target.value,
                                })
                            }
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Password
                        </label>
                        <input
                            required
                            type="password"
                            placeholder="Enter password"
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                            value={studentForm.password}
                            onChange={(e) =>
                                setStudentForm({
                                    ...studentForm,
                                    password: e.target.value,
                                })
                            }
                        />
                    </div>
                    <button className="w-full bg-green-600 text-white font-bold p-3 rounded-lg hover:bg-green-700 transition-colors">
                        Add Student
                    </button>
                </form>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <Users size={24} /> All Students
                </h2>
                {students.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                        No students added yet
                    </p>
                ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                        {students.map((st) => (
                            <motion.div
                                key={st.studentId}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 border rounded-lg hover:bg-blue-50 transition flex justify-between items-center"
                            >
                                <div>
                                    <p className="font-bold text-gray-800">{st.username}</p>
                                    <p className="text-xs text-gray-500">
                                        ID: #{st.studentId}
                                    </p>
                                </div>
                                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                                    Active
                                </span>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StudentManager;
