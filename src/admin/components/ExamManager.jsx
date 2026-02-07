import React from 'react';
import { motion } from 'framer-motion';
import { Plus, BookOpen } from 'lucide-react';

const ExamManager = ({
    examForm,
    setExamForm,
    handleCreateExam,
    exams
}) => {
    // Safety check for exam_details

    const details = {
        identity: examForm.exam_details?.identity || {},
        schedule: examForm.exam_details?.schedule || {},
        rules: {
            ...examForm.exam_details?.rules || {},
            gradingScheme: examForm.exam_details?.rules?.gradingScheme || {}
        },
        administrative: examForm.exam_details?.administrative || {}
    };






    return (
        <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <Plus size={24} /> Create Exam
                </h2>

                <form onSubmit={handleCreateExam} className="space-y-6">
                    {/* Basic Info Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Code</label>
                                <input
                                    required
                                    placeholder="e.g. PRAVIN_HINDI"
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={examForm.exam_code || ""}
                                    onChange={(e) => setExamForm({ ...examForm, exam_code: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Name</label>
                                <input
                                    required
                                    placeholder="e.g. Hindi Final Exam"
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={examForm.exam_name}
                                    onChange={(e) => setExamForm({ ...examForm, exam_name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
                                <select
                                    required
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={examForm.status || "DRAFT"}
                                    onChange={(e) => setExamForm({ ...examForm, status: e.target.value })}
                                >
                                    <option value="DRAFT">DRAFT</option>
                                    <option value="PUBLISHED">PUBLISHED</option>
                                    <option value="CLOSED">CLOSED</option>
                                    <option value="RESULT_PUBLISHED">RESULT_PUBLISHED</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Fees</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    value={examForm.exam_fees}
                                    onChange={(e) => setExamForm({ ...examForm, exam_fees: parseFloat(e.target.value) || 0 })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Dates Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Schedule & Dates</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 text-xs">Application Start</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full p-2 border rounded-lg text-sm"
                                    value={examForm.application_start_date || ""}
                                    onChange={(e) => setExamForm({ ...examForm, application_start_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 text-xs">Application End</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full p-2 border rounded-lg text-sm"
                                    value={examForm.application_end_date || ""}
                                    onChange={(e) => setExamForm({ ...examForm, application_end_date: e.target.value })}
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 text-xs">Exam Start</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full p-2 border rounded-lg text-sm"
                                    value={examForm.exam_start_date || ""}
                                    onChange={(e) => setExamForm({ ...examForm, exam_start_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1 text-xs">Exam End</label>
                                <input
                                    required
                                    type="date"
                                    className="w-full p-2 border rounded-lg text-sm"
                                    value={examForm.exam_end_date || ""}
                                    onChange={(e) => setExamForm({ ...examForm, exam_end_date: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Papers Section */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Papers Configuration</h3>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Papers</label>
                            <input
                                required
                                type="number"
                                min="1"
                                className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none"
                                value={examForm.no_of_papers}
                                onChange={(e) => {
                                    const val = parseInt(e.target.value) || 1;
                                    const newPapers = [...examForm.papers];
                                    if (val > newPapers.length) {
                                        for (let i = newPapers.length; i < val; i++) {
                                            newPapers.push({ name: "", maxMarks: 100 });
                                        }
                                    } else {
                                        newPapers.splice(val);
                                    }
                                    setExamForm({ ...examForm, no_of_papers: val, papers: newPapers });
                                }}
                            />
                        </div>
                        <div className="space-y-3 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                            {examForm.papers.map((paper, index) => (
                                <div key={index} className="grid grid-cols-7 gap-2 items-end">
                                    <div className="col-span-4">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Paper {index + 1} Name</label>
                                        <input
                                            required
                                            placeholder="Name"
                                            className="w-full p-2 border rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                            value={paper.name}
                                            onChange={(e) => {
                                                const newPapers = [...examForm.papers];
                                                newPapers[index].name = e.target.value;
                                                setExamForm({ ...examForm, papers: newPapers });
                                            }}
                                        />
                                    </div>
                                    <div className="col-span-3">
                                        <label className="text-[10px] uppercase font-bold text-gray-400 mb-1 block">Max Marks</label>
                                        <input
                                            required
                                            type="number"
                                            className="w-full p-2 border rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500"
                                            value={paper.maxMarks}
                                            onChange={(e) => {
                                                const newPapers = [...examForm.papers];
                                                newPapers[index].maxMarks = parseInt(e.target.value) || 0;
                                                setExamForm({ ...examForm, papers: newPapers });
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Detailed Info - Identity */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Exam Identity</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Full Title</label>
                                <input
                                    className="w-full p-2.5 border rounded-lg text-sm"
                                    value={details.identity.examFullTitle}
                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, identity: { ...details.identity, examFullTitle: e.target.value } } })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Conducting Body</label>
                                <input
                                    className="w-full p-2.5 border rounded-lg text-sm"
                                    value={details.identity.conductingBody}
                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, identity: { ...details.identity, conductingBody: e.target.value } } })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Board / Sabha</label>
                                <input
                                    className="w-full p-2.5 border rounded-lg text-sm"
                                    value={details.identity.board}
                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, identity: { ...details.identity, board: e.target.value } } })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Exam Level</label>
                                <input
                                    className="w-full p-2.5 border rounded-lg text-sm"
                                    value={details.identity.examLevel}
                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, identity: { ...details.identity, examLevel: e.target.value } } })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Language</label>
                                <input
                                    className="w-full p-2.5 border rounded-lg text-sm"
                                    value={details.identity.language}
                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, identity: { ...details.identity, language: e.target.value } } })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Recognition Text</label>
                                <textarea
                                    className="w-full p-2.5 border rounded-lg text-sm h-20"
                                    value={details.identity.recognitionText}
                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, identity: { ...details.identity, recognitionText: e.target.value } } })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Detailed Info - Rules */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Rules & Criteria</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Eligibility</label>
                                <input
                                    className="w-full p-2.5 border rounded-lg text-sm"
                                    value={details.rules.eligibility}
                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, rules: { ...details.rules, eligibility: e.target.value } } })}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Passing Criteria</label>
                                <textarea
                                    className="w-full p-2.5 border rounded-lg text-sm h-20"
                                    value={details.rules.passingCriteria}
                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, rules: { ...details.rules, passingCriteria: e.target.value } } })}
                                />
                            </div>
                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2 md:col-span-2">
                                <p className="text-xs font-bold text-gray-500 uppercase">Grading Scheme (Thresholds)</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold block">1st Class</label>
                                        <input
                                            className="w-full p-1.5 border rounded text-xs"
                                            value={details.rules.gradingScheme.firstClass}
                                            onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, rules: { ...details.rules, gradingScheme: { ...details.rules.gradingScheme, firstClass: e.target.value } } } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold block">2nd Class</label>
                                        <input
                                            className="w-full p-1.5 border rounded text-xs"
                                            value={details.rules.gradingScheme.secondClass}
                                            onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, rules: { ...details.rules, gradingScheme: { ...details.rules.gradingScheme, secondClass: e.target.value } } } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold block">3rd Class</label>
                                        <input
                                            className="w-full p-1.5 border rounded text-xs"
                                            value={details.rules.gradingScheme.thirdClass}
                                            onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, rules: { ...details.rules, gradingScheme: { ...details.rules.gradingScheme, thirdClass: e.target.value } } } })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] text-gray-400 font-bold block">Fail Below</label>
                                        <input
                                            className="w-full p-1.5 border rounded text-xs"
                                            value={details.rules.gradingScheme.fail}
                                            onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, rules: { ...details.rules, gradingScheme: { ...details.rules.gradingScheme, fail: e.target.value } } } })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Detailed Info - Administrative */}
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2">Administrative Info</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Signatory Name</label>
                                <input
                                    className="w-full p-2.5 border rounded-lg text-sm"
                                    value={details.administrative.signatoryName}
                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, administrative: { ...details.administrative, signatoryName: e.target.value } } })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Designation</label>
                                <input
                                    className="w-full p-2.5 border rounded-lg text-sm"
                                    value={details.administrative.signatoryDesignation}
                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, administrative: { ...details.administrative, signatoryDesignation: e.target.value } } })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Dept Name</label>
                                <input
                                    className="w-full p-2.5 border rounded-lg text-sm"
                                    value={details.administrative.departmentName}
                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, administrative: { ...details.administrative, departmentName: e.target.value } } })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-1">Syllabus Year</label>
                                <input
                                    className="w-full p-2.5 border rounded-lg text-sm"
                                    value={details.administrative.syllabusYear}
                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...details, administrative: { ...details.administrative, syllabusYear: e.target.value } } })}
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-bold p-4 rounded-xl hover:bg-indigo-700 hover:shadow-lg transition-all active:scale-[0.98] mt-4 shadow-indigo-200"
                    >
                        Create New Exam
                    </button>
                </form>
            </div>

            {/* Existing Exam List – unchanged */}
            <div className="bg-white p-6 rounded-xl shadow-md">
                <h2 className="text-2xl font-bold mb-6 text-gray-800 flex items-center gap-2">
                    <BookOpen size={24} /> All Exams
                </h2>

                {exams.length === 0 ? (
                    <p className="text-gray-400 text-center py-8">
                        No exams created yet
                    </p>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {exams.map((ex) => (
                            <motion.div
                                key={ex.examNo}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="p-4 border rounded-lg hover:bg-indigo-50"
                            >
                                <p className="font-bold">{ex.exam_name}</p>
                                <p className="text-xs text-gray-500">
                                    {ex.exam_code} · {ex.status}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamManager;
