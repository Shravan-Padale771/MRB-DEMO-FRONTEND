import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const ExamManager = ({
    examForm,
    setExamForm,
    handleCreateExam,
    exams
}) => {
    const [activeStep, setActiveStep] = useState(0);

    const steps = [
        { id: 'basic', title: 'Basic Info' },
        { id: 'dates', title: 'Dates' },
        { id: 'papers', title: 'Papers' },
        { id: 'identity', title: 'Identity' },
        { id: 'rules', title: 'Rules' },
        { id: 'admin', title: 'Admin' }
    ];

    const details = {
        identity: examForm.exam_details?.identity || {},
        schedule: examForm.exam_details?.schedule || {},
        rules: {
            ...examForm.exam_details?.rules || {},
            gradingScheme: examForm.exam_details?.rules?.gradingScheme || {}
        },
        administrative: examForm.exam_details?.administrative || {}
    };

    const nextStep = () => setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
    const prevStep = () => setActiveStep(prev => Math.max(prev - 1, 0));

    return (
        <div className="grid md:grid-cols-2 gap-8 items-start">
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                        <Plus size={24} className="text-indigo-600" /> Create Exam
                    </h2>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                        Step {activeStep + 1} of {steps.length}
                    </span>
                </div>

                {/* Step Indicator */}
                <div className="flex gap-1 mb-8">
                    {steps.map((step, idx) => (
                        <div
                            key={step.id}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${idx <= activeStep ? 'bg-indigo-600' : 'bg-gray-100'
                                }`}
                        />
                    ))}
                </div>

                <form onSubmit={handleCreateExam} className="min-h-[400px] flex flex-col">
                    <div className="flex-1">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                transition={{ duration: 0.2 }}
                            >
                                {activeStep === 0 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Basic Information</h3>
                                        <div className="grid grid-cols-1 gap-4">
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
                                            <div className="grid grid-cols-2 gap-4">
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
                                    </div>
                                )}

                                {activeStep === 1 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Dates & Schedule</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">App Start</label>
                                                <input
                                                    required
                                                    type="date"
                                                    className="w-full p-2 border rounded-lg text-sm"
                                                    value={examForm.application_start_date || ""}
                                                    onChange={(e) => setExamForm({ ...examForm, application_start_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">App End</label>
                                                <input
                                                    required
                                                    type="date"
                                                    className="w-full p-2 border rounded-lg text-sm"
                                                    value={examForm.application_end_date || ""}
                                                    onChange={(e) => setExamForm({ ...examForm, application_end_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Exam Start</label>
                                                <input
                                                    required
                                                    type="date"
                                                    className="w-full p-2 border rounded-lg text-sm"
                                                    value={examForm.exam_start_date || ""}
                                                    onChange={(e) => setExamForm({ ...examForm, exam_start_date: e.target.value })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Exam End</label>
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
                                )}

                                {activeStep === 2 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Papers Configuration</h3>

                                        <div className="flex gap-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 mb-4">
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={examForm.exam_details?.structure?.hasOral}
                                                    onChange={(e) => setExamForm({
                                                        ...examForm,
                                                        exam_details: {
                                                            ...examForm.exam_details,
                                                            structure: {
                                                                ...examForm.exam_details?.structure,
                                                                hasOral: e.target.checked
                                                            }
                                                        }
                                                    })}
                                                />
                                                <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">Include Oral Exam</span>
                                            </label>
                                            <label className="flex items-center gap-2 cursor-pointer group">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                    checked={examForm.exam_details?.structure?.hasProject}
                                                    onChange={(e) => setExamForm({
                                                        ...examForm,
                                                        exam_details: {
                                                            ...examForm.exam_details,
                                                            structure: {
                                                                ...examForm.exam_details?.structure,
                                                                hasProject: e.target.checked
                                                            }
                                                        }
                                                    })}
                                                />
                                                <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">Include Project Work</span>
                                            </label>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Number of Written Papers</label>
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
                                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                            {examForm.papers.map((paper, index) => (
                                                <div key={index} className="grid grid-cols-7 gap-2 items-end bg-gray-50 p-2 rounded-lg border border-gray-100">
                                                    <div className="col-span-4">
                                                        <label className="text-[9px] uppercase font-bold text-gray-400 mb-1 block text-indigo-600">Paper {index + 1} Name</label>
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
                                                        <label className="text-[9px] uppercase font-bold text-gray-400 mb-1 block">Max Marks</label>
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
                                )}

                                {activeStep === 3 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Exam Identity</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Full Title</label>
                                                <input
                                                    className="w-full p-2.5 border rounded-lg text-sm"
                                                    value={details.identity.examFullTitle}
                                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, identity: { ...details.identity, examFullTitle: e.target.value } } })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Body</label>
                                                    <input
                                                        className="w-full p-2.5 border rounded-lg text-sm"
                                                        value={details.identity.conductingBody}
                                                        onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, identity: { ...details.identity, conductingBody: e.target.value } } })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Board</label>
                                                    <input
                                                        className="w-full p-2.5 border rounded-lg text-sm"
                                                        value={details.identity.board}
                                                        onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, identity: { ...details.identity, board: e.target.value } } })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Level</label>
                                                    <input
                                                        className="w-full p-2.5 border rounded-lg text-sm"
                                                        value={details.identity.examLevel}
                                                        onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, identity: { ...details.identity, examLevel: e.target.value } } })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Language</label>
                                                    <input
                                                        className="w-full p-2.5 border rounded-lg text-sm"
                                                        value={details.identity.language}
                                                        onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, identity: { ...details.identity, language: e.target.value } } })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Recognition Text</label>
                                                <textarea
                                                    className="w-full p-2.5 border rounded-lg text-sm h-16"
                                                    value={details.identity.recognitionText}
                                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, identity: { ...details.identity, recognitionText: e.target.value } } })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeStep === 4 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Rules & Criteria</h3>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Eligibility</label>
                                                <input
                                                    className="w-full p-2.5 border rounded-lg text-sm"
                                                    value={details.rules.eligibility}
                                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, rules: { ...details.rules, eligibility: e.target.value } } })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Passing Criteria</label>
                                                <textarea
                                                    className="w-full p-2.5 border rounded-lg text-sm h-16"
                                                    value={details.rules.passingCriteria}
                                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, rules: { ...details.rules, passingCriteria: e.target.value } } })}
                                                />
                                            </div>
                                            <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
                                                <p className="text-[10px] font-bold text-indigo-600 uppercase">Grading Thresholds</p>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div>
                                                        <label className="text-[9px] text-gray-400 font-bold block mb-1">1st Class</label>
                                                        <input
                                                            className="w-full p-2 border rounded-lg text-xs"
                                                            value={details.rules.gradingScheme.firstClass}
                                                            onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, rules: { ...details.rules, gradingScheme: { ...details.rules.gradingScheme, firstClass: e.target.value } } } })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] text-gray-400 font-bold block mb-1">2nd Class</label>
                                                        <input
                                                            className="w-full p-2 border rounded-lg text-xs"
                                                            value={details.rules.gradingScheme.secondClass}
                                                            onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, rules: { ...details.rules, gradingScheme: { ...details.rules.gradingScheme, secondClass: e.target.value } } } })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] text-gray-400 font-bold block mb-1">3rd Class</label>
                                                        <input
                                                            className="w-full p-2 border rounded-lg text-xs"
                                                            value={details.rules.gradingScheme.thirdClass}
                                                            onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, rules: { ...details.rules, gradingScheme: { ...details.rules.gradingScheme, thirdClass: e.target.value } } } })}
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] text-gray-400 font-bold block mb-1">Fail Below</label>
                                                        <input
                                                            className="w-full p-2 border rounded-lg text-xs"
                                                            value={details.rules.gradingScheme.fail}
                                                            onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, rules: { ...details.rules, gradingScheme: { ...details.rules.gradingScheme, fail: e.target.value } } } })}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {activeStep === 5 && (
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Administrative Info</h3>
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Signatory</label>
                                                    <input
                                                        className="w-full p-2.5 border rounded-lg text-sm"
                                                        value={details.administrative.signatoryName}
                                                        onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, administrative: { ...details.administrative, signatoryName: e.target.value } } })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Designation</label>
                                                    <input
                                                        className="w-full p-2.5 border rounded-lg text-sm"
                                                        value={details.administrative.signatoryDesignation}
                                                        onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, administrative: { ...details.administrative, signatoryDesignation: e.target.value } } })}
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Department</label>
                                                <input
                                                    className="w-full p-2.5 border rounded-lg text-sm"
                                                    value={details.administrative.departmentName}
                                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, administrative: { ...details.administrative, departmentName: e.target.value } } })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Syllabus Year</label>
                                                <input
                                                    className="w-full p-2.5 border rounded-lg text-sm"
                                                    value={details.administrative.syllabusYear}
                                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, administrative: { ...details.administrative, syllabusYear: e.target.value } } })}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Instructions Summary</label>
                                                <textarea
                                                    className="w-full p-2.5 border rounded-lg text-sm h-20"
                                                    value={details.administrative.instructions}
                                                    onChange={(e) => setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, administrative: { ...details.administrative, instructions: e.target.value } } })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex justify-between items-center pt-8 border-t mt-auto">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={activeStep === 0}
                            className={`flex items-center gap-1 px-4 py-2 rounded-lg font-bold transition-all ${activeStep === 0
                                ? 'text-gray-300 cursor-not-allowed'
                                : 'text-gray-600 hover:bg-gray-100'
                                }`}
                        >
                            <ChevronLeft size={20} /> Previous
                        </button>

                        {activeStep < steps.length - 1 ? (
                            <button
                                type="button"
                                onClick={nextStep}
                                className="flex items-center gap-1 bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
                            >
                                Next <ChevronRight size={20} />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                className="flex items-center gap-2 bg-green-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-green-700 transition-all shadow-md shadow-green-100"
                            >
                                <Check size={20} /> Finish & Create
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* List Section - Reduced height and simplified */}
            <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
                <h2 className="text-xl font-bold mb-6 text-gray-800 flex items-center gap-2 border-b pb-4">
                    <BookOpen size={22} className="text-indigo-600" /> Existing Exams
                </h2>

                {exams.length === 0 ? (
                    <div className="py-12 text-center">
                        <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <BookOpen size={24} className="text-gray-300" />
                        </div>
                        <p className="text-gray-400 font-medium italic">No exams created yet</p>
                    </div>
                ) : (
                    <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {exams.map((ex) => (
                            <motion.div
                                key={ex.examNo}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-4 border border-gray-100 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-100 transition-all group"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="max-w-[70%]">
                                        <p className="font-bold text-gray-800 leading-tight group-hover:text-indigo-700 transition-colors">
                                            {ex.exam_name}
                                        </p>
                                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
                                            {ex.exam_code}
                                        </p>
                                    </div>
                                    <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${ex.status === 'PUBLISHED'
                                        ? 'bg-green-50 text-green-700 border-green-100'
                                        : ex.status === 'DRAFT'
                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
                                            : 'bg-gray-50 text-gray-700 border-gray-100'
                                        }`}>
                                        {ex.status}
                                    </span>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ExamManager;
