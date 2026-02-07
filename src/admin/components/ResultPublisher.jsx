import React from 'react';
import { Award } from 'lucide-react';
import toast from 'react-hot-toast';

const ResultPublisher = ({
    resultForm,
    setResultForm,
    handlePublishResult,
    applications
}) => {

    const handleIdChange = (e) => {
        const appId = e.target.value;
        const numericId = parseInt(appId);

        // Always update the ID field
        setResultForm(prev => ({ ...prev, applicationId: appId }));

        // Try to find matching application
        const app = applications.find((a) => a.applicationId === numericId);

        if (app && app.exam && app.exam.papers) {
            let papers = [];
            try {
                papers = JSON.parse(app.exam.papers);
            } catch (err) {
                console.error("Error parsing papers:", err);
            }

            setResultForm(prev => ({
                ...prev,
                applicationId: appId,
                examPapers: papers,
                paperMarks: papers.reduce((acc, p) => ({ ...acc, [p.name]: 0 }), {}),
                oralMarks: 0,
                projectMarks: 0,
                score: "",
            }));
            toast.success(`Loaded papers for App #${appId}`);
        } else if (appId.length > 0) {
            // Clear papers if ID is entered but not found (optional, but prevents confusion)
            setResultForm(prev => ({
                ...prev,
                examPapers: [],
                paperMarks: {},
                oralMarks: 0,
                projectMarks: 0,
                score: "",
            }));
        }
    };

    return (
        <div className="max-w-2xl mx-auto bg-white p-8 rounded-xl shadow-lg border-t-4 border-indigo-600">
            <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                <Award size={24} /> Publish Exam Result
            </h2>
            <form onSubmit={handlePublishResult} className="space-y-6">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Application ID
                    </label>
                    <input
                        type="number"
                        required
                        className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={resultForm.applicationId}
                        onChange={handleIdChange}
                        placeholder="Enter Application ID"
                    />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 border-b pb-2">
                            Paper-wise Marks
                        </h3>
                        {resultForm.examPapers.length === 0 ? (
                            <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed">
                                <p className="text-gray-400 text-sm">
                                    Enter a valid Application ID to load papers
                                </p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {resultForm.examPapers.map((paper, idx) => (
                                    <div
                                        key={idx}
                                        className="flex items-center justify-between gap-4"
                                    >
                                        <label className="text-sm font-medium text-gray-600 flex-1">
                                            {paper.name} (Max: {paper.maxMarks})
                                        </label>
                                        <input
                                            type="number"
                                            required
                                            max={paper.maxMarks}
                                            min="0"
                                            className="w-24 p-2 border rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={resultForm.paperMarks[paper.name] || 0}
                                            onChange={(e) => {
                                                const val = parseFloat(e.target.value) || 0;
                                                setResultForm({
                                                    ...resultForm,
                                                    paperMarks: {
                                                        ...resultForm.paperMarks,
                                                        [paper.name]: val,
                                                    },
                                                });
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 border-b pb-2">
                            Final Result
                        </h3>

                        {/* Special Components: Oral & Project */}
                        {(() => {
                            const app = applications.find(a => a.applicationId === parseInt(resultForm.applicationId));
                            if (!app || !app.exam) return null;

                            let details = {};
                            try {
                                details = typeof app.exam.exam_details === 'string'
                                    ? JSON.parse(app.exam.exam_details)
                                    : (app.exam.exam_details || {});
                            } catch (e) {
                                console.error("Error parsing exam_details:", e);
                            }

                            const hasOral = details.structure?.hasOral;
                            const hasProject = details.structure?.hasProject;

                            return (
                                <div className="space-y-4 mb-6 bg-indigo-50/30 p-4 rounded-xl border border-indigo-100/50">
                                    {hasOral && (
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                Oral Marks (Max 50)
                                            </label>
                                            <input
                                                type="number"
                                                max="50"
                                                min="0"
                                                className="w-20 p-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-black text-indigo-600 bg-white"
                                                value={resultForm.oralMarks}
                                                onChange={(e) => setResultForm({
                                                    ...resultForm,
                                                    oralMarks: parseFloat(e.target.value) || 0
                                                })}
                                            />
                                        </div>
                                    )}
                                    {hasProject && (
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-indigo-900 flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
                                                Project Marks (Max 50)
                                            </label>
                                            <input
                                                type="number"
                                                max="50"
                                                min="0"
                                                className="w-20 p-2 border border-indigo-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none font-black text-indigo-600 bg-white"
                                                value={resultForm.projectMarks}
                                                onChange={(e) => setResultForm({
                                                    ...resultForm,
                                                    projectMarks: parseFloat(e.target.value) || 0
                                                })}
                                            />
                                        </div>
                                    )}
                                    {!hasOral && !hasProject && (
                                        <p className="text-[10px] text-gray-400 italic text-center uppercase tracking-widest">No extra components enabled</p>
                                    )}
                                </div>
                            )
                        })()}

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Total Percentage
                            </label>
                            <input
                                readOnly
                                className="w-full p-3 border rounded-lg bg-gray-50 font-bold text-indigo-600 outline-none"
                                value={resultForm.score}
                                placeholder="Auto-calculated"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Status
                            </label>
                            <select
                                required
                                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={resultForm.remarks}
                                onChange={(e) =>
                                    setResultForm({
                                        ...resultForm,
                                        remarks: e.target.value,
                                    })
                                }
                            >
                                <option>Pass</option>
                                <option>Fail</option>
                                <option>Withheld</option>
                            </select>
                        </div>
                    </div>
                </div>
                <button className="w-full bg-indigo-600 text-white font-bold py-3 rounded-lg hover:bg-indigo-700 transition-colors">
                    Publish Result
                </button>
            </form>
        </div>
    );
};

export default ResultPublisher;
