import React from 'react';
import { FileText, AlertTriangle } from 'lucide-react';

const ApplicationManager = ({
    applications,
    selectApplication
}) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <FileText size={24} /> Student Applications
            </h2>

            {applications.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed">
                    <AlertTriangle
                        className="mx-auto text-yellow-500 mb-3"
                        size={40}
                    />
                    <p className="text-gray-500 font-medium">
                        No applications found
                    </p>
                    <p className="text-xs text-gray-400 mt-2">
                        Students who apply for exams will appear here
                    </p>
                </div>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-indigo-50 text-gray-700">
                            <tr>
                                <th className="p-4 text-left font-semibold">App ID</th>
                                <th className="p-4 text-left font-semibold">Student</th>
                                <th className="p-4 text-left font-semibold">Exam</th>
                                <th className="p-4 text-left font-semibold">Status</th>
                                <th className="p-4 text-left font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {applications.map((app) => (
                                <tr
                                    key={app.applicationId}
                                    className="hover:bg-gray-50 transition"
                                >
                                    <td className="p-4 font-bold text-indigo-600">
                                        #{app.applicationId}
                                    </td>
                                    <td className="p-4">
                                        {app.student?.username || "N/A"}
                                    </td>
                                    <td className="p-4">{app.exam?.exam_name || "N/A"}</td>
                                    <td className="p-4">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-bold ${app.status === "APPLIED"
                                                ? "bg-blue-100 text-blue-800"
                                                : "bg-green-100 text-green-800"
                                                }`}
                                        >
                                            {app.status}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        <button
                                            onClick={() => selectApplication(app.applicationId)}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 text-sm font-medium transition"
                                        >
                                            Publish Result
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default ApplicationManager;
