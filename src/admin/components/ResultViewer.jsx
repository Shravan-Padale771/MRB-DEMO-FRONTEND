import React from 'react';
import { motion } from 'framer-motion';
import { Award, CheckCircle } from 'lucide-react';

const ResultViewer = ({ results }) => {
    return (
        <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Award size={24} /> Published Results
            </h2>
            {results.length === 0 ? (
                <div className="text-center p-12 bg-gray-50 rounded-lg border-2 border-dashed">
                    <Award className="mx-auto text-gray-400 mb-3" size={40} />
                    <p className="text-gray-500 font-medium">
                        No results published yet
                    </p>
                </div>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {results.map((res) => (
                        <motion.div
                            key={res.id || Math.random()}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="border p-5 rounded-lg hover:shadow-lg transition bg-gradient-to-br from-green-50 to-white"
                        >
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold text-lg text-gray-800">
                                        App ID: #{res.application?.applicationId}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        {res.application?.student?.username}
                                    </p>
                                </div>
                                <CheckCircle className="text-green-500" size={24} />
                            </div>
                            <div className="bg-white p-3 rounded border border-green-200 mb-3">
                                {(() => {
                                    try {
                                        const data = JSON.parse(res.resultData);
                                        return (
                                            <div className="space-y-2">
                                                <div className="flex justify-between items-center pb-2 border-b">
                                                    <span className="text-lg font-bold text-indigo-600">
                                                        {data.score}
                                                    </span>
                                                    <span
                                                        className={`text-xs font-bold px-2 py-0.5 rounded ${data.remarks === "Pass" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
                                                    >
                                                        {data.remarks}
                                                    </span>
                                                </div>
                                                {data.breakdown && (
                                                    <div className="text-xs space-y-1">
                                                        {Object.entries(data.breakdown).map(
                                                            ([name, marks]) => (
                                                                <div
                                                                    key={name}
                                                                    className="flex justify-between text-gray-600"
                                                                >
                                                                    <span>{name}</span>
                                                                    <span className="font-semibold">
                                                                        {marks}
                                                                    </span>
                                                                </div>
                                                            )
                                                        )}
                                                        <div className="flex justify-between pt-1 border-t font-bold text-gray-800">
                                                            <span>Total</span>
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
                                            <p className="text-xs font-mono text-gray-700 break-words font-semibold">
                                                {res.resultData}
                                            </p>
                                        );
                                    }
                                })()}
                            </div>
                            <p className="text-xs text-gray-500">
                                Published:{" "}
                                {res.publishedAt
                                    ? new Date(res.publishedAt).toLocaleDateString()
                                    : "N/A"}
                            </p>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ResultViewer;
