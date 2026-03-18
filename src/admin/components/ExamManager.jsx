// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { Plus, BookOpen, ChevronRight, ChevronLeft, Check, Edit, Trash2, X, Filter, RefreshCw, Upload, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
// import { useQuery } from '@tanstack/react-query';
// import Pagination from '../../common/components/Pagination';
// import { searchExams as getExams } from '../../api/exam-api';
// import { uploadFiles } from '../../api';

// const ExamManager = ({
//     examForm,
//     setExamForm,
//     handleCreateExam,
//     handleUpdateExam,
//     handleDeleteExam,
//     startEditing,
//     isEditing,
//     resetExamForm
// }) => {
//     const [activeStep, setActiveStep] = useState(0);
//     const [page, setPage] = useState(0);
//     const [size] = useState(10);
//     const [filterName, setFilterName] = useState("");
//     const [errors, setErrors] = useState({});
//     const [uploading, setUploading] = useState({});

//     const handleFileUpload = async (field, file) => {
//         if (!file) return;
//         setUploading(prev => ({ ...prev, [field]: true }));
//         try {
//             const response = await uploadFiles(file);
//             // Extract URL from Map<String, String> response
//             let url = "";
//             if (typeof response === 'string') {
//                 url = response;
//             } else if (Array.isArray(response)) {
//                 url = response[0];
//             } else if (response && typeof response === 'object') {
//                 // Backend returns Map<Filename, URL>
//                 url = Object.values(response)[0] || "";
//             }

//             if (url) {
//                 setExamForm(prev => ({ ...prev, [field]: url }));
//             }
//         } catch (error) {
//             console.error("Upload failed", error);
//         } finally {
//             setUploading(prev => ({ ...prev, [field]: false }));
//         }
//     };

//     // API Query for Exams
//     const { data: examsData, isLoading, refetch } = useQuery({
//         queryKey: ['exams', filterName, page, size],
//         queryFn: () => getExams({
//             exam_name: filterName || undefined,
//             page,
//             size,
//         }),
//         keepPreviousData: true
//     });

//     const exams = examsData?.content || [];
//     const totalPages = examsData?.totalPages ?? (examsData?.totalElements ? Math.ceil(examsData.totalElements / size) : 0);

//     const steps = [
//         { id: 'basic', title: 'Basic Info' },
//         { id: 'dates', title: 'Dates' },
//         { id: 'papers', title: 'Papers' },
//         { id: 'identity', title: 'Identity' },
//         { id: 'rules', title: 'Rules' },
//         { id: 'admin', title: 'Admin' }
//     ];

//     const details = {
//         identity: examForm.exam_details?.identity || {},
//         schedule: examForm.exam_details?.schedule || {},
//         rules: {
//             ...examForm.exam_details?.rules || {},
//             gradingScheme: examForm.exam_details?.rules?.gradingScheme || {}
//         },
//         administrative: examForm.exam_details?.administrative || {}
//     };

//     const validateStep = (step) => {
//         const newErrors = {};

//         if (step === 0) {
//             if (!examForm.exam_code?.trim()) newErrors.exam_code = "Exam Code is required";
//             if (!examForm.exam_name?.trim()) newErrors.exam_name = "Exam Name is required";
//             if (examForm.exam_fees === "" || examForm.exam_fees === null || examForm.exam_fees === undefined || examForm.exam_fees < 0) {
//                 newErrors.exam_fees = "Exam Fees is required and cannot be negative";
//             }
//         } 
//         else if (step === 1) {
//             if (!examForm.application_start_date) newErrors.application_start_date = "Required";
//             if (!examForm.application_end_date) newErrors.application_end_date = "Required";
//             if (!examForm.exam_start_date) newErrors.exam_start_date = "Required";
//             if (!examForm.exam_end_date) newErrors.exam_end_date = "Required";

//             const now = new Date();
//             now.setHours(0,0,0,0);
//             const oneYearFromNow = new Date();
//             oneYearFromNow.setFullYear(now.getFullYear() + 1);

//             const checkDate = (dateStr, fieldName) => {
//                 if (!dateStr) return;
//                 const d = new Date(dateStr);
//                 if (d < now) newErrors[fieldName] = "Date cannot be in the past";
//                 if (d > oneYearFromNow) newErrors[fieldName] = "Date cannot be more than 1 year in future";
//             };

//             checkDate(examForm.application_start_date, 'application_start_date');
//             checkDate(examForm.application_end_date, 'application_end_date');
//             checkDate(examForm.exam_start_date, 'exam_start_date');
//             checkDate(examForm.exam_end_date, 'exam_end_date');

//             if (examForm.application_start_date && examForm.application_end_date && 
//                 new Date(examForm.application_end_date) < new Date(examForm.application_start_date)) {
//                 newErrors.application_end_date = "Must be after start date";
//             }

//             if (examForm.exam_start_date && examForm.exam_end_date && 
//                 new Date(examForm.exam_end_date) < new Date(examForm.exam_start_date)) {
//                 newErrors.exam_end_date = "Must be after start date";
//             }

//             if (examForm.application_end_date && examForm.exam_start_date &&
//                 new Date(examForm.exam_start_date) < new Date(examForm.application_end_date)) {
//                 newErrors.exam_start_date = "Must be after application end date";
//             }
//         }
//         else if (step === 2) {
//             const struct = examForm.exam_details?.structure || {};
//             if (!examForm.no_of_papers || examForm.no_of_papers < 1) {
//                 newErrors.no_of_papers = "Must have at least 1 paper";
//             }
//             examForm.papers?.forEach((paper, idx) => {
//                 if (!paper.name?.trim()) newErrors[`paper_${idx}_name`] = "Required";
//                 if (paper.maxMarks < 1) newErrors[`paper_${idx}_marks`] = "Required";
//             });
//             if (struct.hasOral && (!struct.oralMarks || struct.oralMarks < 1)) {
//                 newErrors.oralMarks = "Oral Marks is required";
//             }
//             if (struct.hasProject && (!struct.projectMarks || struct.projectMarks < 1)) {
//                 newErrors.projectMarks = "Project Marks is required";
//             }
//         }
//         else if (step === 3) {
//             const iden = examForm.exam_details?.identity || {};
//             if (!iden.examFullTitle?.trim()) newErrors.examFullTitle = "Full Title is required";
//             if (!iden.conductingBody?.trim()) newErrors.conductingBody = "Body is required";
//             if (!iden.board?.trim()) newErrors.board = "Board is required";
//             if (!iden.examLevel?.trim()) newErrors.examLevel = "Level is required";
//             if (!iden.language?.trim()) newErrors.language = "Language is required";
//         }
//         else if (step === 4) {
//             const rules = examForm.exam_details?.rules || {};
//             const gs = rules.gradingScheme || {};
//             if (!rules.eligibility?.trim()) newErrors.eligibility = "Eligibility is required";
//             if (!rules.passingCriteria?.trim()) newErrors.passingCriteria = "Passing Criteria is required";
//             if (!gs.firstClass) newErrors.firstClass = "Required";
//             if (!gs.secondClass) newErrors.secondClass = "Required";
//             if (!gs.thirdClass) newErrors.thirdClass = "Required";
//             if (!gs.fail) newErrors.failThreshold = "Required";
//         }
//         else if (step === 5) {
//             const admin = examForm.exam_details?.administrative || {};
//             if (!admin.signatoryName?.trim()) newErrors.signatoryName = "Signatory Name is required";
//             if (!admin.signatoryDesignation?.trim()) newErrors.signatoryDesignation = "Designation is required";
//             if (!admin.departmentName?.trim()) newErrors.departmentName = "Department is required";
//             if (!admin.syllabusYear?.trim()) newErrors.syllabusYear = "Syllabus Year is required";
//             if (!admin.instructions?.trim()) newErrors.instructions = "Instructions are required";
//         }

//         setErrors(newErrors);
//         return Object.keys(newErrors).length === 0;
//     };

//     const nextStep = () => {
//         if (validateStep(activeStep)) {
//             setActiveStep(prev => Math.min(prev + 1, steps.length - 1));
//         }
//     };

//     const prevStep = () => {
//         setErrors({});
//         setActiveStep(prev => Math.max(prev - 1, 0));
//     };

//     const onFormSubmit = (e) => {
//         e.preventDefault();

//         // If not on the last step, handle Enter key by attempting to advance
//         if (activeStep < steps.length - 1) {
//             nextStep();
//             return;
//         }

//         // On the last step, validate and then submit
//         if (validateStep(activeStep)) {
//             if (isEditing) {
//                 handleUpdateExam(e);
//             } else {
//                 handleCreateExam(e);
//             }
//         }
//     };

//     return (
//         <div className="grid md:grid-cols-2 gap-8 items-start">
//             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//                 <div className="flex justify-between items-center mb-6">
//                     <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
//                         {isEditing ? (
//                             <><Edit size={24} className="text-amber-500" /> Edit Exam</>
//                         ) : (
//                             <><Plus size={24} className="text-indigo-600" /> Create Exam</>
//                         )}
//                     </h2>
//                     <div className="flex flex-col items-end">
//                         {isEditing && (
//                             <button
//                                 onClick={resetExamForm}
//                                 className="text-xs font-bold text-red-500 hover:text-red-600 flex items-center gap-1 mb-1 transition-colors"
//                             >
//                                 <X size={14} /> Cancel Edit
//                             </button>
//                         )}
//                         <span data-testid="step-indicator" className="text-xs font-bold text-gray-400 uppercase tracking-wider">
//                             Step {activeStep + 1} of {steps.length}
//                         </span>
//                     </div>
//                 </div>

//                 {/* Step Indicator */}
//                 <div className="flex gap-1 mb-8">
//                     {steps.map((step, idx) => (
//                         <div
//                             key={step.id}
//                             className={`h-1.5 flex-1 rounded-full transition-all duration-300 ${idx <= activeStep ? 'bg-indigo-600' : 'bg-gray-100'
//                                 }`}
//                         />
//                     ))}
//                 </div>

//                 <form onSubmit={onFormSubmit} className="min-h-[400px] flex flex-col">
//                     <div className="flex-1">
//                         <AnimatePresence mode="wait">
//                             <motion.div
//                                 key={activeStep}
//                                 initial={{ opacity: 0, x: 10 }}
//                                 animate={{ opacity: 1, x: 0 }}
//                                 exit={{ opacity: 0, x: -10 }}
//                                 transition={{ duration: 0.2 }}
//                             >
//                                 {activeStep === 0 && (
//                                     <div className="space-y-4">
//                                         <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Basic Information</h3>
//                                         <div className="grid grid-cols-1 gap-4">
//                                             <div>
//                                                 <label htmlFor="exam_code" className="block text-sm font-semibold text-gray-700 mb-1">Exam Code</label>
//                                                 <input
//                                                     required
//                                                     id="exam_code"
//                                                     placeholder="e.g. PRAVIN_HINDI"
//                                                     className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.exam_code ? 'border-red-500' : ''}`}
//                                                     value={examForm.exam_code || ""}
//                                                     onChange={(e) => {
//                                                         setExamForm({ ...examForm, exam_code: e.target.value });
//                                                         if (errors.exam_code) setErrors({...errors, exam_code: ""});
//                                                     }}
//                                                 />
//                                                 {errors.exam_code && <p data-testid="error-exam_code" className="text-red-500 text-xs mt-1">{errors.exam_code}</p>}
//                                             </div>
//                                              <div>
//                                                 <label htmlFor="exam_name" className="block text-sm font-semibold text-gray-700 mb-1">Exam Name</label>
//                                                 <input
//                                                     required
//                                                     id="exam_name"
//                                                     placeholder="e.g. Hindi Final Exam"
//                                                     className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.exam_name ? 'border-red-500' : ''}`}
//                                                     value={examForm.exam_name || ""}
//                                                     onChange={(e) => {
//                                                         setExamForm({ ...examForm, exam_name: e.target.value });
//                                                         if (errors.exam_name) setErrors({...errors, exam_name: ""});
//                                                     }}
//                                                 />
//                                                 {errors.exam_name && <p data-testid="error-exam_name" className="text-red-500 text-xs mt-1">{errors.exam_name}</p>}
//                                             </div>
//                                             <div className="grid grid-cols-2 gap-4">
//                                                 <div>
//                                                     <label htmlFor="status" className="block text-sm font-semibold text-gray-700 mb-1">Status</label>
//                                                     <select
//                                                         required
//                                                         id="status"
//                                                         className="w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
//                                                         value={examForm.status || "DRAFT"}
//                                                         onChange={(e) => setExamForm({ ...examForm, status: e.target.value })}
//                                                     >
//                                                         <option value="DRAFT">DRAFT</option>
//                                                         <option value="PUBLISHED">PUBLISHED</option>
//                                                         <option value="CLOSED">CLOSED</option>
//                                                         <option value="RESULT_PUBLISHED">RESULT_PUBLISHED</option>
//                                                     </select>
//                                                 </div>
//                                                 <div>
//                                                     <label htmlFor="exam_fees" className="block text-sm font-semibold text-gray-700 mb-1">Exam Fees</label>
//                                                         <input
//                                                     required
//                                                     type="number"
//                                                     id="exam_fees"
//                                                     className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all ${errors.exam_fees ? 'border-red-500' : ''}`}
//                                                     value={examForm.exam_fees}
//                                                     onChange={(e) => {
//                                                         setExamForm({ ...examForm, exam_fees: parseFloat(e.target.value) || 0 });
//                                                         if (errors.exam_fees) setErrors({...errors, exam_fees: ""});
//                                                     }}
//                                                 />
//                                                 {errors.exam_fees && <p data-testid="error-exam_fees" className="text-red-500 text-xs mt-1">{errors.exam_fees}</p>}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </div>
//                             )}

//                                 {activeStep === 1 && (
//                                     <div className="space-y-4">
//                                         <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Dates & Schedule</h3>
//                                         <div className="grid grid-cols-2 gap-4">
//                                             <div>
//                                                 <label htmlFor="application_start_date" className="block text-[10px] uppercase font-bold text-gray-500 mb-1">App Start</label>
//                                                 <input
//                                                     required
//                                                     type="date"
//                                                     id="application_start_date"
//                                                     className={`w-full p-2 border rounded-lg text-sm ${errors.application_start_date ? 'border-red-500' : ''}`}
//                                                     value={examForm.application_start_date || ""}
//                                                     onChange={(e) => {
//                                                         setExamForm({ ...examForm, application_start_date: e.target.value });
//                                                         if (errors.application_start_date) setErrors({...errors, application_start_date: ""});
//                                                     }}
//                                                 />
//                                                 {errors.application_start_date && <p data-testid="error-application_start_date" className="text-red-500 text-[10px] mt-1">{errors.application_start_date}</p>}
//                                             </div>
//                                              <div>
//                                                  <label htmlFor="application_end_date" className="block text-[10px] uppercase font-bold text-gray-500 mb-1">App End</label>
//                                                  <input
//                                                      required
//                                                      type="date"
//                                                      id="application_end_date"
//                                                      className={`w-full p-2 border rounded-lg text-sm ${errors.application_end_date ? 'border-red-500' : ''}`}
//                                                      value={examForm.application_end_date || ""}
//                                                      onChange={(e) => {
//                                                          setExamForm({ ...examForm, application_end_date: e.target.value });
//                                                          if (errors.application_end_date) setErrors({...errors, application_end_date: ""});
//                                                      }}
//                                                  />
//                                                  {errors.application_end_date && <p data-testid="error-application_end_date" className="text-red-500 text-[10px] mt-1">{errors.application_end_date}</p>}
//                                              </div>
//                                             <div>
//                                                 <label htmlFor="exam_start_date" className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Exam Start</label>
//                                                 <input
//                                                     required
//                                                     type="date"
//                                                     id="exam_start_date"
//                                                     className={`w-full p-2 border rounded-lg text-sm ${errors.exam_start_date ? 'border-red-500' : ''}`}
//                                                     value={examForm.exam_start_date || ""}
//                                                     onChange={(e) => {
//                                                         setExamForm({ ...examForm, exam_start_date: e.target.value });
//                                                         if (errors.exam_start_date) setErrors({...errors, exam_start_date: ""});
//                                                     }}
//                                                 />
//                                                 {errors.exam_start_date && <p data-testid="error-exam_start_date" className="text-red-500 text-[10px] mt-1">{errors.exam_start_date}</p>}
//                                             </div>
//                                             <div>
//                                                 <label htmlFor="exam_end_date" className="block text-[10px] uppercase font-bold text-gray-500 mb-1">Exam End</label>
//                                                 <input
//                                                     required
//                                                     type="date"
//                                                     id="exam_end_date"
//                                                     className={`w-full p-2 border rounded-lg text-sm ${errors.exam_end_date ? 'border-red-500' : ''}`}
//                                                     value={examForm.exam_end_date || ""}
//                                                     onChange={(e) => {
//                                                         setExamForm({ ...examForm, exam_end_date: e.target.value });
//                                                         if (errors.exam_end_date) setErrors({...errors, exam_end_date: ""});
//                                                     }}
//                                                 />
//                                                 {errors.exam_end_date && <p data-testid="error-exam_end_date" className="text-red-500 text-[10px] mt-1">{errors.exam_end_date}</p>}
//                                             </div>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {activeStep === 2 && (
//                                     <div className="space-y-4">
//                                         <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Papers Configuration</h3>

//                                         <div className="flex gap-4 p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 mb-4">
//                                             <div className="flex-1 space-y-2">
//                                                 <label className="flex items-center gap-2 cursor-pointer group">
//                                                     <input
//                                                         type="checkbox"
//                                                         className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                                                         checked={examForm.exam_details?.structure?.hasOral}
//                                                         onChange={(e) => setExamForm({
//                                                             ...examForm,
//                                                             exam_details: {
//                                                                 ...examForm.exam_details,
//                                                                 structure: {
//                                                                     ...examForm.exam_details?.structure,
//                                                                     hasOral: e.target.checked
//                                                                 }
//                                                             }
//                                                         })}
//                                                     />
//                                                     <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">Include Oral Exam</span>
//                                                 </label>
//                                                 {examForm.exam_details?.structure?.hasOral && (
//                                                     <div>
//                                                         <input
//                                                             required
//                                                             type="number"
//                                                             placeholder="Oral Max Marks"
//                                                             id="oralMarks"
//                                                             className={`w-full p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500 ${errors.oralMarks ? 'border-red-500' : ''}`}
//                                                             value={examForm.exam_details?.structure?.oralMarks || ""}
//                                                             onChange={(e) => {
//                                                                 setExamForm({
//                                                                     ...examForm,
//                                                                     exam_details: {
//                                                                         ...examForm.exam_details,
//                                                                         structure: {
//                                                                             ...examForm.exam_details?.structure,
//                                                                             oralMarks: parseInt(e.target.value) || 0
//                                                                         }
//                                                                     }
//                                                                 });
//                                                                 if (errors.oralMarks) setErrors({...errors, oralMarks: ""});
//                                                             }}
//                                                         />
//                                                         {errors.oralMarks && <p data-testid="error-oralMarks" className="text-red-500 text-[9px] mt-1">{errors.oralMarks}</p>}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                             <div className="flex-1 space-y-2">
//                                                 <label className="flex items-center gap-2 cursor-pointer group">
//                                                     <input
//                                                         type="checkbox"
//                                                         className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
//                                                         checked={examForm.exam_details?.structure?.hasProject}
//                                                         onChange={(e) => setExamForm({
//                                                             ...examForm,
//                                                             exam_details: {
//                                                                 ...examForm.exam_details,
//                                                                 structure: {
//                                                                     ...examForm.exam_details?.structure,
//                                                                     hasProject: e.target.checked
//                                                                 }
//                                                             }
//                                                         })}
//                                                     />
//                                                     <span className="text-sm font-bold text-gray-700 group-hover:text-indigo-600 transition-colors">Include Project Work</span>
//                                                 </label>
//                                                 {examForm.exam_details?.structure?.hasProject && (
//                                                     <div>
//                                                         <input
//                                                             required
//                                                             type="number"
//                                                             placeholder="Project Max Marks"
//                                                             id="projectMarks"
//                                                             className={`w-full p-2 border rounded text-xs outline-none focus:ring-1 focus:ring-indigo-500 ${errors.projectMarks ? 'border-red-500' : ''}`}
//                                                             value={examForm.exam_details?.structure?.projectMarks || ""}
//                                                             onChange={(e) => {
//                                                                 setExamForm({
//                                                                     ...examForm,
//                                                                     exam_details: {
//                                                                         ...examForm.exam_details,
//                                                                         structure: {
//                                                                             ...examForm.exam_details?.structure,
//                                                                             projectMarks: parseInt(e.target.value) || 0
//                                                                         }
//                                                                     }
//                                                                 });
//                                                                 if (errors.projectMarks) setErrors({...errors, projectMarks: ""});
//                                                             }}
//                                                         />
//                                                         {errors.projectMarks && <p data-testid="error-projectMarks" className="text-red-500 text-[9px] mt-1">{errors.projectMarks}</p>}
//                                                     </div>
//                                                 )}
//                                             </div>
//                                         </div>

//                                         <div>
//                                             <label htmlFor="no_of_papers" className="block text-sm font-semibold text-gray-700 mb-1">Number of Written Papers</label>
//                                             <input
//                                                 required
//                                                 type="number"
//                                                 id="no_of_papers"
//                                                 min="1"
//                                                 className={`w-full p-2.5 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none ${errors.no_of_papers ? 'border-red-500' : ''}`}
//                                                 value={examForm.no_of_papers || ""}
//                                                 onChange={(e) => {
//                                                     const val = parseInt(e.target.value) || 1;
//                                                     const newPapers = [...(examForm.papers || [])];
//                                                     if (val > newPapers.length) {
//                                                         for (let i = newPapers.length; i < val; i++) {
//                                                             newPapers.push({ name: "", maxMarks: 100 });
//                                                         }
//                                                     } else {
//                                                         newPapers.splice(val);
//                                                     }
//                                                     setExamForm({ ...examForm, no_of_papers: val, papers: newPapers });
//                                                     if (errors.no_of_papers) setErrors({...errors, no_of_papers: ""});
//                                                 }}
//                                             />
//                                             {errors.no_of_papers && <p data-testid="error-no_of_papers" className="text-red-500 text-xs mt-1">{errors.no_of_papers}</p>}
//                                         </div>
//                                         <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
//                                             {(examForm.papers || []).map((paper, index) => (
//                                                 <div key={index} className="grid grid-cols-7 gap-2 items-end bg-gray-50 p-2 rounded-lg border border-gray-100">
//                                                     <div className="col-span-4">
//                                                         <label htmlFor={`paper_${index}_name`} className="text-[9px] uppercase font-bold text-gray-400 mb-1 block text-indigo-600">Paper {index + 1} Name</label>
//                                                         <input
//                                                             required
//                                                             id={`paper_${index}_name`}
//                                                             placeholder="Name"
//                                                             className={`w-full p-2 border rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${errors[`paper_${index}_name`] ? 'border-red-500' : ''}`}
//                                                             value={paper.name}
//                                                             onChange={(e) => {
//                                                                 const newPapers = [...examForm.papers];
//                                                                 newPapers[index].name = e.target.value;
//                                                                 setExamForm({ ...examForm, papers: newPapers });
//                                                                 if (errors[`paper_${index}_name`]) setErrors({...errors, [`paper_${index}_name`]: ""});
//                                                             }}
//                                                         />
//                                                         {errors[`paper_${index}_name`] && <p data-testid={`error-paper_${index}_name`} className="text-red-500 text-[10px] mt-1">{errors[`paper_${index}_name`]}</p>}
//                                                     </div>
//                                                     <div className="col-span-3">
//                                                         <label htmlFor={`paper_${index}_marks`} className="text-[9px] uppercase font-bold text-gray-400 mb-1 block">Max Marks</label>
//                                                         <input
//                                                             required
//                                                             type="number"
//                                                             id={`paper_${index}_marks`}
//                                                             className={`w-full p-2 border rounded text-sm outline-none focus:ring-1 focus:ring-indigo-500 ${errors[`paper_${index}_marks`] ? 'border-red-500' : ''}`}
//                                                             value={paper.maxMarks}
//                                                             onChange={(e) => {
//                                                                 const newPapers = [...examForm.papers];
//                                                                 newPapers[index].maxMarks = parseInt(e.target.value) || 0;
//                                                                 setExamForm({ ...examForm, papers: newPapers });
//                                                                 if (errors[`paper_${index}_marks`]) setErrors({...errors, [`paper_${index}_marks`]: ""});
//                                                             }}
//                                                         />
//                                                         {errors[`paper_${index}_marks`] && <p data-testid={`error-paper_${index}_marks`} className="text-red-500 text-[10px] mt-1">{errors[`paper_${index}_marks`]}</p>}
//                                                     </div>
//                                                 </div>
//                                             ))}
//                                         </div>
//                                     </div>
//                                 )}

//                                 {activeStep === 3 && (
//                                     <div className="space-y-4">
//                                         <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Exam Identity</h3>
//                                         <div className="grid grid-cols-1 gap-4">
//                                             <div>
//                                                  <label htmlFor="examFullTitle" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Full Title</label>
//                                                  <input
//                                                      id="examFullTitle"
//                                                      className={`w-full p-2.5 border rounded-lg text-sm ${errors.examFullTitle ? 'border-red-500' : ''}`}
//                                                      value={details.identity.examFullTitle}
//                                                      onChange={(e) => {
//                                                          setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, identity: { ...details.identity, examFullTitle: e.target.value } } });
//                                                          if (errors.examFullTitle) setErrors({...errors, examFullTitle: ""});
//                                                      }}
//                                                  />
//                                                  {errors.examFullTitle && <p data-testid="error-examFullTitle" className="text-red-500 text-[10px] mt-1">{errors.examFullTitle}</p>}
//                                              </div>
//                                              <div className="grid grid-cols-2 gap-4">
//                                                  <div>
//                                                      <label htmlFor="conductingBody" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Body</label>
//                                                      <input
//                                                          id="conductingBody"
//                                                          className={`w-full p-2.5 border rounded-lg text-sm ${errors.conductingBody ? 'border-red-500' : ''}`}
//                                                          value={details.identity.conductingBody}
//                                                          onChange={(e) => {
//                                                              setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, identity: { ...details.identity, conductingBody: e.target.value } } });
//                                                              if (errors.conductingBody) setErrors({...errors, conductingBody: ""});
//                                                          }}
//                                                      />
//                                                      {errors.conductingBody && <p data-testid="error-conductingBody" className="text-red-500 text-[10px] mt-1">{errors.conductingBody}</p>}
//                                                  </div>
//                                                  <div>
//                                                      <label htmlFor="board" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Board</label>
//                                                      <input
//                                                          id="board"
//                                                          className={`w-full p-2.5 border rounded-lg text-sm ${errors.board ? 'border-red-500' : ''}`}
//                                                          value={details.identity.board}
//                                                          onChange={(e) => {
//                                                              setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, identity: { ...details.identity, board: e.target.value } } });
//                                                              if (errors.board) setErrors({...errors, board: ""});
//                                                          }}
//                                                      />
//                                                      {errors.board && <p data-testid="error-board" className="text-red-500 text-[10px] mt-1">{errors.board}</p>}
//                                                  </div>
//                                              </div>
//                                              <div className="grid grid-cols-2 gap-4">
//                                                  <div>
//                                                      <label htmlFor="examLevel" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Level</label>
//                                                      <input
//                                                          id="examLevel"
//                                                          className={`w-full p-2.5 border rounded-lg text-sm ${errors.examLevel ? 'border-red-500' : ''}`}
//                                                          value={details.identity.examLevel}
//                                                          onChange={(e) => {
//                                                              setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, identity: { ...details.identity, examLevel: e.target.value } } });
//                                                              if (errors.examLevel) setErrors({...errors, examLevel: ""});
//                                                          }}
//                                                      />
//                                                      {errors.examLevel && <p data-testid="error-examLevel" className="text-red-500 text-[10px] mt-1">{errors.examLevel}</p>}
//                                                  </div>
//                                                  <div>
//                                                      <label htmlFor="language" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Language</label>
//                                                      <input
//                                                          id="language"
//                                                          className={`w-full p-2.5 border rounded-lg text-sm ${errors.language ? 'border-red-500' : ''}`}
//                                                          value={details.identity.language}
//                                                          onChange={(e) => {
//                                                              setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, identity: { ...details.identity, language: e.target.value } } });
//                                                              if (errors.language) setErrors({...errors, language: ""});
//                                                          }}
//                                                      />
//                                                      {errors.language && <p data-testid="error-language" className="text-red-500 text-[10px] mt-1">{errors.language}</p>}
//                                                  </div>
//                                              </div>
//                                              <div>
//                                                  <label htmlFor="recognitionText" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Recognition Text</label>
//                                                  <textarea
//                                                      id="recognitionText"
//                                                      className={`w-full p-2.5 border rounded-lg text-sm h-16 ${errors.recognitionText ? 'border-red-500' : ''}`}
//                                                      value={details.identity.recognitionText}
//                                                      onChange={(e) => {
//                                                          setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, identity: { ...details.identity, recognitionText: e.target.value } } });
//                                                          if (errors.recognitionText) setErrors({...errors, recognitionText: ""});
//                                                      }}
//                                                  />
//                                                  {errors.recognitionText && <p data-testid="error-recognitionText" className="text-red-500 text-[10px] mt-1">{errors.recognitionText}</p>}
//                                              </div>

//                                              <div className="grid grid-cols-2 gap-4">
//                                                  <div className="space-y-2">
//                                                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Board Logo</label>
//                                                      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
//                                                          {examForm.boardLogoUrl ? (
//                                                              <div className="relative group">
//                                                                  <img src={examForm.boardLogoUrl} alt="Logo" className="w-12 h-12 rounded-lg object-cover border" />
//                                                                  <button 
//                                                                     type="button"
//                                                                     onClick={() => setExamForm({...examForm, boardLogoUrl: ""})}
//                                                                     className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                                                                  >
//                                                                      <X size={10} />
//                                                                  </button>
//                                                              </div>
//                                                          ) : (
//                                                              <div className="w-12 h-12 rounded-lg bg-white border border-dashed flex items-center justify-center text-gray-300">
//                                                                  <ImageIcon size={20} />
//                                                              </div>
//                                                          )}
//                                                          <div className="flex-1">
//                                                              <label className="cursor-pointer bg-white border px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all">
//                                                                  {uploading.boardLogoUrl ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
//                                                                  {uploading.boardLogoUrl ? "Uploading..." : examForm.boardLogoUrl ? "Change" : "Upload Logo"}
//                                                                  <input 
//                                                                     type="file" 
//                                                                     className="hidden" 
//                                                                     accept="image/*" 
//                                                                     onChange={(e) => handleFileUpload('boardLogoUrl', e.target.files[0])}
//                                                                     disabled={uploading.boardLogoUrl}
//                                                                  />
//                                                              </label>
//                                                          </div>
//                                                      </div>
//                                                  </div>
//                                                  <div className="space-y-2">
//                                                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Board Seal</label>
//                                                      <div className="flex items-center gap-3 p-3 bg-gray-50 border border-gray-100 rounded-xl">
//                                                          {examForm.boardSealUrl ? (
//                                                              <div className="relative group">
//                                                                  <img src={examForm.boardSealUrl} alt="Seal" className="w-12 h-12 rounded-lg object-cover border" />
//                                                                  <button 
//                                                                     type="button"
//                                                                     onClick={() => setExamForm({...examForm, boardSealUrl: ""})}
//                                                                     className="absolute -top-1 -right-1 bg-red-500 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
//                                                                  >
//                                                                      <X size={10} />
//                                                                  </button>
//                                                              </div>
//                                                          ) : (
//                                                              <div className="w-12 h-12 rounded-lg bg-white border border-dashed flex items-center justify-center text-gray-300">
//                                                                  <ImageIcon size={20} />
//                                                              </div>
//                                                          )}
//                                                          <div className="flex-1">
//                                                              <label className="cursor-pointer bg-white border px-3 py-1.5 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 flex items-center justify-center gap-2 transition-all">
//                                                                  {uploading.boardSealUrl ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
//                                                                  {uploading.boardSealUrl ? "Uploading..." : examForm.boardSealUrl ? "Change" : "Upload Seal"}
//                                                                  <input 
//                                                                     type="file" 
//                                                                     className="hidden" 
//                                                                     accept="image/*" 
//                                                                     onChange={(e) => handleFileUpload('boardSealUrl', e.target.files[0])}
//                                                                     disabled={uploading.boardSealUrl}
//                                                                  />
//                                                              </label>
//                                                          </div>
//                                                      </div>
//                                                  </div>
//                                              </div>
//                                         </div>
//                                     </div>
//                                 )}

//                                 {activeStep === 4 && (
//                                     <div className="space-y-4">
//                                         <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Rules & Criteria</h3>
//                                          <div className="space-y-4">
//                                              <div>
//                                                  <label htmlFor="eligibility" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Eligibility</label>
//                                                  <input
//                                                      id="eligibility"
//                                                      className={`w-full p-2.5 border rounded-lg text-sm ${errors.eligibility ? 'border-red-500' : ''}`}
//                                                      value={details.rules.eligibility}
//                                                      onChange={(e) => {
//                                                          setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, rules: { ...details.rules, eligibility: e.target.value } } });
//                                                          if (errors.eligibility) setErrors({...errors, eligibility: ""});
//                                                      }}
//                                                  />
//                                                  {errors.eligibility && <p data-testid="error-eligibility" className="text-red-500 text-[10px] mt-1">{errors.eligibility}</p>}
//                                              </div>
//                                              <div>
//                                                  <label htmlFor="passingCriteria" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Passing Criteria</label>
//                                                  <textarea
//                                                      id="passingCriteria"
//                                                      className={`w-full p-2.5 border rounded-lg text-sm h-16 ${errors.passingCriteria ? 'border-red-500' : ''}`}
//                                                      value={details.rules.passingCriteria}
//                                                      onChange={(e) => {
//                                                          setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, rules: { ...details.rules, passingCriteria: e.target.value } } });
//                                                          if (errors.passingCriteria) setErrors({...errors, passingCriteria: ""});
//                                                      }}
//                                                  />
//                                                  {errors.passingCriteria && <p data-testid="error-passingCriteria" className="text-red-500 text-[10px] mt-1">{errors.passingCriteria}</p>}
//                                              </div>
//                                              <div className="p-3 bg-gray-50 rounded-lg border border-gray-100 space-y-3">
//                                                  <p className="text-[10px] font-bold text-indigo-600 uppercase">Grading Thresholds</p>
//                                                  <div className="grid grid-cols-2 gap-3">
//                                                      <div>
//                                                          <label htmlFor="firstClass" className="text-[9px] text-gray-400 font-bold block mb-1">1st Class</label>
//                                                          <input
//                                                              id="firstClass"
//                                                              className={`w-full p-2 border rounded-lg text-xs ${errors.firstClass ? 'border-red-500' : ''}`}
//                                                              value={details.rules.gradingScheme.firstClass}
//                                                              onChange={(e) => {
//                                                                  setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, rules: { ...details.rules, gradingScheme: { ...details.rules.gradingScheme, firstClass: e.target.value } } } });
//                                                                  if (errors.firstClass) setErrors({...errors, firstClass: ""});
//                                                              }}
//                                                          />
//                                                          {errors.firstClass && <p data-testid="error-firstClass" className="text-red-500 text-[9px] mt-1">{errors.firstClass}</p>}
//                                                      </div>
//                                                      <div>
//                                                          <label htmlFor="secondClass" className="text-[9px] text-gray-400 font-bold block mb-1">2nd Class</label>
//                                                          <input
//                                                              id="secondClass"
//                                                              className={`w-full p-2 border rounded-lg text-xs ${errors.secondClass ? 'border-red-500' : ''}`}
//                                                              value={details.rules.gradingScheme.secondClass}
//                                                              onChange={(e) => {
//                                                                  setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, rules: { ...details.rules, gradingScheme: { ...details.rules.gradingScheme, secondClass: e.target.value } } } });
//                                                                  if (errors.secondClass) setErrors({...errors, secondClass: ""});
//                                                              }}
//                                                          />
//                                                          {errors.secondClass && <p data-testid="error-secondClass" className="text-red-500 text-[9px] mt-1">{errors.secondClass}</p>}
//                                                      </div>
//                                                      <div>
//                                                          <label htmlFor="thirdClass" className="text-[9px] text-gray-400 font-bold block mb-1">3rd Class</label>
//                                                          <input
//                                                              id="thirdClass"
//                                                              className={`w-full p-2 border rounded-lg text-xs ${errors.thirdClass ? 'border-red-500' : ''}`}
//                                                              value={details.rules.gradingScheme.thirdClass}
//                                                              onChange={(e) => {
//                                                                  setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, rules: { ...details.rules, gradingScheme: { ...details.rules.gradingScheme, thirdClass: e.target.value } } } });
//                                                                  if (errors.thirdClass) setErrors({...errors, thirdClass: ""});
//                                                              }}
//                                                          />
//                                                          {errors.thirdClass && <p data-testid="error-thirdClass" className="text-red-500 text-[9px] mt-1">{errors.thirdClass}</p>}
//                                                      </div>
//                                                      <div>
//                                                          <label htmlFor="failThreshold" className="text-[9px] text-gray-400 font-bold block mb-1">Fail Below</label>
//                                                          <input
//                                                              id="failThreshold"
//                                                              className={`w-full p-2 border rounded-lg text-xs ${errors.failThreshold ? 'border-red-500' : ''}`}
//                                                              value={details.rules.gradingScheme.fail}
//                                                              onChange={(e) => {
//                                                                  setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, rules: { ...details.rules, gradingScheme: { ...details.rules.gradingScheme, fail: e.target.value } } } });
//                                                                  if (errors.failThreshold) setErrors({...errors, failThreshold: ""});
//                                                              }}
//                                                          />
//                                                          {errors.failThreshold && <p data-testid="error-failThreshold" className="text-red-500 text-[9px] mt-1">{errors.failThreshold}</p>}
//                                                      </div>
//                                                  </div>
//                                              </div>
//                                          </div>
//                                     </div>
//                                 )}

//                                 {activeStep === 5 && (
//                                     <div className="space-y-4">
//                                         <h3 className="text-lg font-semibold text-gray-800 border-b pb-2 mb-4">Administrative Info</h3>
//                                         <div className="grid grid-cols-1 gap-4">
//                                              <div className="grid grid-cols-2 gap-4">
//                                                  <div>
//                                                      <label htmlFor="signatoryName" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Signatory</label>
//                                                      <input
//                                                          id="signatoryName"
//                                                          className={`w-full p-2.5 border rounded-lg text-sm ${errors.signatoryName ? 'border-red-500' : ''}`}
//                                                          value={details.administrative.signatoryName}
//                                                          onChange={(e) => {
//                                                              setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, administrative: { ...details.administrative, signatoryName: e.target.value } } });
//                                                              if (errors.signatoryName) setErrors({...errors, signatoryName: ""});
//                                                          }}
//                                                      />
//                                                      {errors.signatoryName && <p data-testid="error-signatoryName" className="text-red-500 text-[10px] mt-1">{errors.signatoryName}</p>}
//                                                  </div>
//                                                  <div>
//                                                      <label htmlFor="signatoryDesignation" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Designation</label>
//                                                      <input
//                                                          id="signatoryDesignation"
//                                                          className={`w-full p-2.5 border rounded-lg text-sm ${errors.signatoryDesignation ? 'border-red-500' : ''}`}
//                                                          value={details.administrative.signatoryDesignation}
//                                                          onChange={(e) => {
//                                                              setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, administrative: { ...details.administrative, signatoryDesignation: e.target.value } } });
//                                                              if (errors.signatoryDesignation) setErrors({...errors, signatoryDesignation: ""});
//                                                          }}
//                                                      />
//                                                      {errors.signatoryDesignation && <p data-testid="error-signatoryDesignation" className="text-red-500 text-[10px] mt-1">{errors.signatoryDesignation}</p>}
//                                                  </div>
//                                              </div>
//                                              <div>
//                                                  <label htmlFor="departmentName" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Department</label>
//                                                  <input
//                                                      id="departmentName"
//                                                      className={`w-full p-2.5 border rounded-lg text-sm ${errors.departmentName ? 'border-red-500' : ''}`}
//                                                      value={details.administrative.departmentName}
//                                                      onChange={(e) => {
//                                                          setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, administrative: { ...details.administrative, departmentName: e.target.value } } });
//                                                          if (errors.departmentName) setErrors({...errors, departmentName: ""});
//                                                      }}
//                                                  />
//                                                  {errors.departmentName && <p data-testid="error-departmentName" className="text-red-500 text-[10px] mt-1">{errors.departmentName}</p>}
//                                              </div>
//                                              <div>
//                                                  <label htmlFor="syllabusYear" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Syllabus Year</label>
//                                                  <input
//                                                      id="syllabusYear"
//                                                      className={`w-full p-2.5 border rounded-lg text-sm ${errors.syllabusYear ? 'border-red-500' : ''}`}
//                                                      value={details.administrative.syllabusYear}
//                                                      onChange={(e) => {
//                                                          setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, administrative: { ...details.administrative, syllabusYear: e.target.value } } });
//                                                          if (errors.syllabusYear) setErrors({...errors, syllabusYear: ""});
//                                                      }}
//                                                  />
//                                                  {errors.syllabusYear && <p data-testid="error-syllabusYear" className="text-red-500 text-[10px] mt-1">{errors.syllabusYear}</p>}
//                                              </div>
//                                              <div>
//                                                  <label htmlFor="instructions" className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Instructions Summary</label>
//                                                  <textarea
//                                                      id="instructions"
//                                                      className={`w-full p-2.5 border rounded-lg text-sm h-20 ${errors.instructions ? 'border-red-500' : ''}`}
//                                                      value={details.administrative.instructions}
//                                                      onChange={(e) => {
//                                                          setExamForm({ ...examForm, exam_details: { ...examForm.exam_details, administrative: { ...details.administrative, instructions: e.target.value } } });
//                                                          if (errors.instructions) setErrors({...errors, instructions: ""});
//                                                      }}
//                                                  />
//                                                  {errors.instructions && <p data-testid="error-instructions" className="text-red-500 text-[10px] mt-1">{errors.instructions}</p>}
//                                              </div>

//                                              <div className="space-y-2">
//                                                  <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Controller Signature</label>
//                                                  <div className="flex items-center gap-4 p-4 bg-gray-50 border border-gray-100 rounded-xl">
//                                                      {examForm.controllerSignatureUrl ? (
//                                                          <div className="relative group">
//                                                              <img src={examForm.controllerSignatureUrl} alt="Signature" className="h-16 w-32 object-contain bg-white border rounded-lg" />
//                                                              <button 
//                                                                 type="button"
//                                                                 onClick={() => setExamForm({...examForm, controllerSignatureUrl: ""})}
//                                                                 className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity shadow-md"
//                                                              >
//                                                                  <X size={12} />
//                                                              </button>
//                                                          </div>
//                                                      ) : (
//                                                          <div className="h-16 w-32 rounded-lg bg-white border border-dashed flex flex-col items-center justify-center text-gray-300">
//                                                              <FileText size={24} />
//                                                              <span className="text-[8px] font-bold uppercase mt-1">No Signature</span>
//                                                          </div>
//                                                      )}
//                                                      <div className="flex-1">
//                                                          <p className="text-[10px] text-gray-500 mb-2 leading-tight">Upload high-quality PNG/JPG of the controller's signature.</p>
//                                                          <label className="cursor-pointer bg-white border border-gray-200 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest text-[#4c84ff] hover:bg-blue-50 hover:border-[#4c84ff] flex items-center justify-center gap-2 transition-all shadow-sm">
//                                                              {uploading.controllerSignatureUrl ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
//                                                              {uploading.controllerSignatureUrl ? "Uploading..." : examForm.controllerSignatureUrl ? "Change Signature" : "Upload Signature"}
//                                                              <input 
//                                                                 type="file" 
//                                                                 className="hidden" 
//                                                                 accept="image/*" 
//                                                                 onChange={(e) => handleFileUpload('controllerSignatureUrl', e.target.files[0])}
//                                                                 disabled={uploading.controllerSignatureUrl}
//                                                              />
//                                                          </label>
//                                                      </div>
//                                                  </div>
//                                              </div>
//                                         </div>
//                                     </div>
//                                 )}
//                             </motion.div>
//                         </AnimatePresence>
//                     </div>

//                     {/* Navigation Buttons */}
//                     <div className="flex justify-between items-center pt-8 border-t mt-auto">
//                         <button
//                             type="button"
//                             onClick={prevStep}
//                             disabled={activeStep === 0}
//                             data-testid="prev-wizard-button"
//                             className={`flex items-center gap-1 px-4 py-2 rounded-lg font-bold transition-all ${activeStep === 0
//                                 ? 'text-gray-300 cursor-not-allowed'
//                                 : 'text-gray-600 hover:bg-gray-100'
//                                 }`}
//                         >
//                             <ChevronLeft size={20} /> Previous
//                         </button>
//                         <div className="flex gap-3">
//                             {activeStep < steps.length - 1 ? (
//                                 <button
//                                     type="button"
//                                     onClick={nextStep}
//                                     data-testid="next-wizard-button"
//                                     className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all"
//                                 >
//                                     Next <ChevronRight size={20} />
//                                 </button>
//                             ) : (
//                                 <button
//                                     type="submit"
//                                     data-testid="next-wizard-button"
//                                     className="flex items-center gap-2 bg-green-600 text-white px-8 py-2.5 rounded-lg font-bold hover:bg-green-700 shadow-lg shadow-green-200 transition-all animate-pulse"
//                                 >
//                                     {isEditing ? 'Update Exam' : 'Create Exam'}
//                                 </button>
//                             )
//                             }
//                         </div>
//                     </div>
//                 </form>
//             </div>

//             {/* List Section */}
//             <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100">
//                 <div className="flex justify-between items-center mb-6 border-b pb-4">
//                     <h2 className="text-xl font-bold text-gray-800 flex items-center gap-2">
//                         <BookOpen size={22} className="text-indigo-600" /> Existing Exams
//                     </h2>
//                     <div className="flex items-center gap-2">
//                         <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
//                             <Filter size={12} className="text-gray-400" />
//                             <input
//                                 type="text"
//                                 placeholder="Search..."
//                                 className="bg-transparent border-none outline-none text-[10px] font-bold text-gray-600 w-24"
//                                 value={filterName}
//                                 onChange={(e) => { setFilterName(e.target.value); setPage(0); }}
//                             />
//                         </div>
//                         <button onClick={() => refetch()} className="p-1.5 text-gray-400 hover:text-indigo-600">
//                             <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} />
//                         </button>
//                     </div>
//                 </div>

//                 {exams.length === 0 && !isLoading ? (
//                     <div className="py-12 text-center">
//                         <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
//                             <BookOpen size={24} className="text-gray-300" />
//                         </div>
//                         <p className="text-gray-400 font-medium italic">No exams found</p>
//                     </div>
//                 ) : (
//                     <>
//                         <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
//                             {exams.map((ex) => (
//                                 <motion.div
//                                     key={ex.examNo}
//                                     initial={{ opacity: 0, y: 10 }}
//                                     animate={{ opacity: 1, y: 0 }}
//                                     className="p-4 border border-gray-100 rounded-xl hover:bg-indigo-50/50 hover:border-indigo-100 transition-all group"
//                                 >
//                                     <div className="flex justify-between items-start">
//                                         <div className="max-w-[70%]">
//                                             <p className="font-bold text-gray-800 leading-tight group-hover:text-indigo-700 transition-colors">
//                                                 {ex.exam_name}
//                                             </p>
//                                             <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-wider">
//                                                 {ex.exam_code}
//                                             </p>
//                                         </div>
//                                         <div className="flex flex-col items-end gap-2">
//                                             <span className={`text-[9px] font-bold px-2 py-1 rounded-full border ${ex.status === 'PUBLISHED'
//                                                 ? 'bg-green-50 text-green-700 border-green-100'
//                                                 : ex.status === 'DRAFT'
//                                                     ? 'bg-yellow-50 text-yellow-700 border-yellow-100'
//                                                     : 'bg-gray-50 text-gray-700 border-gray-100'
//                                                 }`}>
//                                                 {ex.status}
//                                             </span>
//                                             <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
//                                                 <button
//                                                     onClick={() => startEditing(ex)}
//                                                     className="p-1.5 bg-amber-50 text-amber-600 rounded-lg hover:bg-amber-600 hover:text-white transition-all border border-amber-100"
//                                                     title="Edit Exam"
//                                                 >
//                                                     <Edit size={14} />
//                                                 </button>
//                                                 <button
//                                                     onClick={() => handleDeleteExam(ex.examNo)}
//                                                     className="p-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-600 hover:text-white transition-all border border-red-100"
//                                                     title="Delete Exam"
//                                                 >
//                                                     <Trash2 size={14} />
//                                                 </button>
//                                             </div>
//                                         </div>
//                                     </div>
//                                 </motion.div>
//                             ))}
//                         </div>

//                         {totalPages > 1 && (
//                             <Pagination 
//                                 currentPage={page} 
//                                 totalPages={totalPages} 
//                                 onPageChange={setPage} 
//                                 className="mt-6"
//                             />
//                         )}
//                     </>
//                 )}
//             </div>
//         </div>
//     );
// };

// export default ExamManager;



import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, BookOpen, ChevronRight, ChevronLeft, Edit, Trash2, X, Filter, RefreshCw, Upload, Image as ImageIcon, FileText, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import Pagination from '../../common/components/Pagination';
import { searchExams as getExams } from '../../api/exam-api';
import { uploadFiles } from '../../api';

const STATUS_STYLES = {
    PUBLISHED: { bg: '#EBFBEE', color: '#2F9E44' },
    DRAFT: { bg: '#FFF9DB', color: '#E67700' },
    CLOSED: { bg: '#F1F3F5', color: '#868E96' },
    RESULT_PUBLISHED: { bg: '#EEF3FF', color: '#4361EE' },
};

const ExamManager = ({
    examForm, setExamForm,
    handleCreateExam, handleUpdateExam, handleDeleteExam,
    startEditing, isEditing, resetExamForm,
}) => {
    const [activeStep, setActiveStep] = useState(0);
    const [page, setPage] = useState(0);
    const [size] = useState(10);
    const [filterName, setFilterName] = useState('');
    const [errors, setErrors] = useState({});
    const [uploading, setUploading] = useState({});

    const handleFileUpload = async (field, file) => {
        if (!file) return;
        setUploading(prev => ({ ...prev, [field]: true }));
        try {
            const response = await uploadFiles(file);
            let url = '';
            if (typeof response === 'string') url = response;
            else if (Array.isArray(response)) url = response[0];
            else if (response && typeof response === 'object') url = Object.values(response)[0] || '';
            if (url) setExamForm(prev => ({ ...prev, [field]: url }));
        } catch (e) {
            console.error('Upload failed', e);
        } finally {
            setUploading(prev => ({ ...prev, [field]: false }));
        }
    };

    const { data: examsData, isLoading, refetch } = useQuery({
        queryKey: ['exams', filterName, page, size],
        queryFn: () => getExams({ exam_name: filterName || undefined, page, size }),
        keepPreviousData: true,
    });

    const exams = examsData?.content || [];
    const totalPages = examsData?.totalPages ?? (examsData?.totalElements ? Math.ceil(examsData.totalElements / size) : 0);

    const steps = [
        { id: 'basic', title: 'Basic Info' },
        { id: 'dates', title: 'Dates' },
        { id: 'papers', title: 'Papers' },
        { id: 'identity', title: 'Identity' },
        { id: 'rules', title: 'Rules' },
        { id: 'admin', title: 'Admin' },
    ];

    const details = {
        identity: examForm.exam_details?.identity || {},
        schedule: examForm.exam_details?.schedule || {},
        rules: {
            ...(examForm.exam_details?.rules || {}),
            gradingScheme: examForm.exam_details?.rules?.gradingScheme || {},
        },
        administrative: examForm.exam_details?.administrative || {},
    };

    const validateStep = (step) => {
        const e = {};
        if (step === 0) {
            if (!examForm.exam_code?.trim()) e.exam_code = 'Required';
            if (!examForm.exam_name?.trim()) e.exam_name = 'Required';
            if (examForm.exam_fees === '' || examForm.exam_fees < 0) e.exam_fees = 'Required, cannot be negative';
        } else if (step === 1) {
            ['application_start_date', 'application_end_date', 'exam_start_date', 'exam_end_date'].forEach(f => {
                if (!examForm[f]) e[f] = 'Required';
            });
            const now = new Date(); now.setHours(0, 0, 0, 0);
            const max = new Date(); max.setFullYear(now.getFullYear() + 1);
            const chk = (d, f) => { if (!d) return; const dt = new Date(d); if (dt < now) e[f] = 'Cannot be in the past'; if (dt > max) e[f] = 'Cannot exceed 1 year'; };
            chk(examForm.application_start_date, 'application_start_date');
            chk(examForm.application_end_date, 'application_end_date');
            chk(examForm.exam_start_date, 'exam_start_date');
            chk(examForm.exam_end_date, 'exam_end_date');
            if (examForm.application_end_date && examForm.application_start_date && new Date(examForm.application_end_date) < new Date(examForm.application_start_date)) e.application_end_date = 'Must be after start';
            if (examForm.exam_end_date && examForm.exam_start_date && new Date(examForm.exam_end_date) < new Date(examForm.exam_start_date)) e.exam_end_date = 'Must be after start';
            if (examForm.exam_start_date && examForm.application_end_date && new Date(examForm.exam_start_date) < new Date(examForm.application_end_date)) e.exam_start_date = 'Must be after app end';
        } else if (step === 2) {
            if (!examForm.no_of_papers || examForm.no_of_papers < 1) e.no_of_papers = 'At least 1 paper required';
            examForm.papers?.forEach((p, i) => {
                if (!p.name?.trim()) e[`paper_${i}_name`] = 'Required';
                if (p.maxMarks < 1) e[`paper_${i}_marks`] = 'Required';
            });
            const st = examForm.exam_details?.structure || {};
            if (st.hasOral && (!st.oralMarks || st.oralMarks < 1)) e.oralMarks = 'Required';
            if (st.hasProject && (!st.projectMarks || st.projectMarks < 1)) e.projectMarks = 'Required';
        } else if (step === 3) {
            const id = details.identity;
            if (!id.examFullTitle?.trim()) e.examFullTitle = 'Required';
            if (!id.conductingBody?.trim()) e.conductingBody = 'Required';
            if (!id.board?.trim()) e.board = 'Required';
            if (!id.examLevel?.trim()) e.examLevel = 'Required';
            if (!id.language?.trim()) e.language = 'Required';
        } else if (step === 4) {
            const r = details.rules; const gs = r.gradingScheme;
            if (!r.eligibility?.trim()) e.eligibility = 'Required';
            if (!r.passingCriteria?.trim()) e.passingCriteria = 'Required';
            if (!gs.firstClass) e.firstClass = 'Required';
            if (!gs.secondClass) e.secondClass = 'Required';
            if (!gs.thirdClass) e.thirdClass = 'Required';
            if (!gs.fail) e.failThreshold = 'Required';
        } else if (step === 5) {
            const a = details.administrative;
            if (!a.signatoryName?.trim()) e.signatoryName = 'Required';
            if (!a.signatoryDesignation?.trim()) e.signatoryDesignation = 'Required';
            if (!a.departmentName?.trim()) e.departmentName = 'Required';
            if (!a.syllabusYear?.trim()) e.syllabusYear = 'Required';
            if (!a.instructions?.trim()) e.instructions = 'Required';
        }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const nextStep = () => { if (validateStep(activeStep)) setActiveStep(p => Math.min(p + 1, steps.length - 1)); };
    const prevStep = () => { setErrors({}); setActiveStep(p => Math.max(p - 1, 0)); };
    const onFormSubmit = (e) => {
        e.preventDefault();
        if (activeStep < steps.length - 1) { nextStep(); return; }
        if (validateStep(activeStep)) { isEditing ? handleUpdateExam(e) : handleCreateExam(e); }
    };

    // ── shared field helpers ──────────────────────────────────────
    const Field = ({ id, label, error, children }) => (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <label htmlFor={id} style={s.label}>{label}</label>
            {children}
            {error && <span style={s.errText} data-testid={`error-${id}`}>{error}</span>}
        </div>
    );

    const inp = (hasErr) => ({ ...s.input, ...(hasErr ? s.inputErr : {}) });
    const upd = (key, val) => setExamForm(prev => ({ ...prev, [key]: val }));
    const updDetails = (section, key, val) => setExamForm(prev => ({
        ...prev,
        exam_details: { ...prev.exam_details, [section]: { ...prev.exam_details?.[section], [key]: val } }
    }));
    const updRules = (key, val) => setExamForm(prev => ({
        ...prev,
        exam_details: { ...prev.exam_details, rules: { ...prev.exam_details?.rules, [key]: val } }
    }));
    const updGrading = (key, val) => setExamForm(prev => ({
        ...prev,
        exam_details: { ...prev.exam_details, rules: { ...prev.exam_details?.rules, gradingScheme: { ...prev.exam_details?.rules?.gradingScheme, [key]: val } } }
    }));
    const updStructure = (key, val) => setExamForm(prev => ({
        ...prev,
        exam_details: { ...prev.exam_details, structure: { ...prev.exam_details?.structure, [key]: val } }
    }));

    const clrErr = (key) => errors[key] && setErrors(p => ({ ...p, [key]: '' }));

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, alignItems: 'start', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }}>

            {/* ══════ FORM PANEL ══════ */}
            <div style={s.card}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
                    <div>
                        <p style={s.cardTitle}>{isEditing ? 'Edit Exam' : 'Create Exam'}</p>
                        <p style={s.cardSub}>{steps[activeStep].title} · Step {activeStep + 1} of {steps.length}</p>
                    </div>
                    {isEditing && (
                        <button onClick={resetExamForm} style={s.cancelBtn}>
                            <X size={12} /> Cancel Edit
                        </button>
                    )}
                </div>

                {/* Step progress bar */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 24 }}>
                    {steps.map((step, idx) => (
                        <div key={step.id} style={{ flex: 1, height: 3, borderRadius: 2, background: idx <= activeStep ? '#4361EE' : '#E8EAF0', transition: 'background 0.3s' }} />
                    ))}
                </div>

                {/* Step labels */}
                <div style={{ display: 'flex', gap: 4, marginBottom: 22 }}>
                    {steps.map((step, idx) => (
                        <div key={step.id} style={{ flex: 1, textAlign: 'center', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: idx === activeStep ? '#4361EE' : idx < activeStep ? '#2F9E44' : '#B0B3C6' }}>
                            {step.title}
                        </div>
                    ))}
                </div>

                <form onSubmit={onFormSubmit} style={{ minHeight: 380, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ flex: 1 }}>
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, x: 12 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -12 }}
                                transition={{ duration: 0.18 }}
                            >
                                {/* ── STEP 0: Basic ── */}
                                {activeStep === 0 && (
                                    <div style={s.stepWrap}>
                                        <Field id="exam_code" label="Exam Code" error={errors.exam_code}>
                                            <input id="exam_code" style={inp(errors.exam_code)} placeholder="e.g. PRAVIN_HINDI"
                                                value={examForm.exam_code || ''} onChange={e => { upd('exam_code', e.target.value); clrErr('exam_code'); }} />
                                        </Field>
                                        <Field id="exam_name" label="Exam Name" error={errors.exam_name}>
                                            <input id="exam_name" style={inp(errors.exam_name)} placeholder="e.g. Hindi Final Exam"
                                                value={examForm.exam_name || ''} onChange={e => { upd('exam_name', e.target.value); clrErr('exam_name'); }} />
                                        </Field>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <Field id="status" label="Status">
                                                <select id="status" style={s.input} value={examForm.status || 'DRAFT'} onChange={e => upd('status', e.target.value)}>
                                                    <option value="DRAFT">DRAFT</option>
                                                    <option value="PUBLISHED">PUBLISHED</option>
                                                    <option value="CLOSED">CLOSED</option>
                                                    <option value="RESULT_PUBLISHED">RESULT_PUBLISHED</option>
                                                </select>
                                            </Field>
                                            <Field id="exam_fees" label="Exam Fees (₹)" error={errors.exam_fees}>
                                                <input id="exam_fees" type="number" style={inp(errors.exam_fees)}
                                                    value={examForm.exam_fees ?? ''} onChange={e => { upd('exam_fees', parseFloat(e.target.value) || 0); clrErr('exam_fees'); }} />
                                            </Field>
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 1: Dates ── */}
                                {activeStep === 1 && (
                                    <div style={s.stepWrap}>
                                        <div style={s.sectionHdr}>Application Period</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <Field id="application_start_date" label="Start Date" error={errors.application_start_date}>
                                                <input id="application_start_date" type="date" style={inp(errors.application_start_date)}
                                                    value={examForm.application_start_date || ''} onChange={e => { upd('application_start_date', e.target.value); clrErr('application_start_date'); }} />
                                            </Field>
                                            <Field id="application_end_date" label="End Date" error={errors.application_end_date}>
                                                <input id="application_end_date" type="date" style={inp(errors.application_end_date)}
                                                    value={examForm.application_end_date || ''} onChange={e => { upd('application_end_date', e.target.value); clrErr('application_end_date'); }} />
                                            </Field>
                                        </div>
                                        <div style={s.sectionHdr}>Exam Period</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <Field id="exam_start_date" label="Start Date" error={errors.exam_start_date}>
                                                <input id="exam_start_date" type="date" style={inp(errors.exam_start_date)}
                                                    value={examForm.exam_start_date || ''} onChange={e => { upd('exam_start_date', e.target.value); clrErr('exam_start_date'); }} />
                                            </Field>
                                            <Field id="exam_end_date" label="End Date" error={errors.exam_end_date}>
                                                <input id="exam_end_date" type="date" style={inp(errors.exam_end_date)}
                                                    value={examForm.exam_end_date || ''} onChange={e => { upd('exam_end_date', e.target.value); clrErr('exam_end_date'); }} />
                                            </Field>
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 2: Papers ── */}
                                {activeStep === 2 && (
                                    <div style={s.stepWrap}>
                                        {/* Oral / Project toggles */}
                                        <div style={s.toggleRow}>
                                            <div style={{ flex: 1 }}>
                                                <label style={s.checkLabel}>
                                                    <input type="checkbox" style={{ accentColor: '#4361EE' }}
                                                        checked={!!examForm.exam_details?.structure?.hasOral}
                                                        onChange={e => updStructure('hasOral', e.target.checked)} />
                                                    Include Oral Exam
                                                </label>
                                                {examForm.exam_details?.structure?.hasOral && (
                                                    <Field id="oralMarks" label="Oral Max Marks" error={errors.oralMarks}>
                                                        <input id="oralMarks" type="number" style={{ ...inp(errors.oralMarks), marginTop: 6 }}
                                                            placeholder="e.g. 25"
                                                            value={examForm.exam_details?.structure?.oralMarks || ''}
                                                            onChange={e => { updStructure('oralMarks', parseInt(e.target.value) || 0); clrErr('oralMarks'); }} />
                                                    </Field>
                                                )}
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <label style={s.checkLabel}>
                                                    <input type="checkbox" style={{ accentColor: '#4361EE' }}
                                                        checked={!!examForm.exam_details?.structure?.hasProject}
                                                        onChange={e => updStructure('hasProject', e.target.checked)} />
                                                    Include Project Work
                                                </label>
                                                {examForm.exam_details?.structure?.hasProject && (
                                                    <Field id="projectMarks" label="Project Max Marks" error={errors.projectMarks}>
                                                        <input id="projectMarks" type="number" style={{ ...inp(errors.projectMarks), marginTop: 6 }}
                                                            placeholder="e.g. 20"
                                                            value={examForm.exam_details?.structure?.projectMarks || ''}
                                                            onChange={e => { updStructure('projectMarks', parseInt(e.target.value) || 0); clrErr('projectMarks'); }} />
                                                    </Field>
                                                )}
                                            </div>
                                        </div>

                                        <Field id="no_of_papers" label="Number of Written Papers" error={errors.no_of_papers}>
                                            <input id="no_of_papers" type="number" min="1" style={inp(errors.no_of_papers)}
                                                value={examForm.no_of_papers || ''}
                                                onChange={e => {
                                                    const val = parseInt(e.target.value) || 1;
                                                    const newPapers = [...(examForm.papers || [])];
                                                    if (val > newPapers.length) for (let i = newPapers.length; i < val; i++) newPapers.push({ name: '', maxMarks: 100 });
                                                    else newPapers.splice(val);
                                                    setExamForm(p => ({ ...p, no_of_papers: val, papers: newPapers }));
                                                    clrErr('no_of_papers');
                                                }} />
                                        </Field>

                                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 200, overflowY: 'auto' }}>
                                            {(examForm.papers || []).map((paper, idx) => (
                                                <div key={idx} style={s.paperRow}>
                                                    <div style={{ flex: 2 }}>
                                                        <label style={s.label}>Paper {idx + 1} Name</label>
                                                        <input style={inp(errors[`paper_${idx}_name`])} placeholder="Paper Name"
                                                            value={paper.name}
                                                            onChange={e => {
                                                                const np = [...examForm.papers]; np[idx].name = e.target.value;
                                                                setExamForm(p => ({ ...p, papers: np })); clrErr(`paper_${idx}_name`);
                                                            }} />
                                                        {errors[`paper_${idx}_name`] && <span style={s.errText}>{errors[`paper_${idx}_name`]}</span>}
                                                    </div>
                                                    <div style={{ flex: 1 }}>
                                                        <label style={s.label}>Max Marks</label>
                                                        <input type="number" style={inp(errors[`paper_${idx}_marks`])}
                                                            value={paper.maxMarks}
                                                            onChange={e => {
                                                                const np = [...examForm.papers]; np[idx].maxMarks = parseInt(e.target.value) || 0;
                                                                setExamForm(p => ({ ...p, papers: np })); clrErr(`paper_${idx}_marks`);
                                                            }} />
                                                        {errors[`paper_${idx}_marks`] && <span style={s.errText}>{errors[`paper_${idx}_marks`]}</span>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 3: Identity ── */}
                                {activeStep === 3 && (
                                    <div style={s.stepWrap}>
                                        <Field id="examFullTitle" label="Full Title" error={errors.examFullTitle}>
                                            <input id="examFullTitle" style={inp(errors.examFullTitle)}
                                                value={details.identity.examFullTitle || ''}
                                                onChange={e => { updDetails('identity', 'examFullTitle', e.target.value); clrErr('examFullTitle'); }} />
                                        </Field>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <Field id="conductingBody" label="Conducting Body" error={errors.conductingBody}>
                                                <input id="conductingBody" style={inp(errors.conductingBody)}
                                                    value={details.identity.conductingBody || ''}
                                                    onChange={e => { updDetails('identity', 'conductingBody', e.target.value); clrErr('conductingBody'); }} />
                                            </Field>
                                            <Field id="board" label="Board" error={errors.board}>
                                                <input id="board" style={inp(errors.board)}
                                                    value={details.identity.board || ''}
                                                    onChange={e => { updDetails('identity', 'board', e.target.value); clrErr('board'); }} />
                                            </Field>
                                            <Field id="examLevel" label="Level" error={errors.examLevel}>
                                                <input id="examLevel" style={inp(errors.examLevel)}
                                                    value={details.identity.examLevel || ''}
                                                    onChange={e => { updDetails('identity', 'examLevel', e.target.value); clrErr('examLevel'); }} />
                                            </Field>
                                            <Field id="language" label="Language" error={errors.language}>
                                                <input id="language" style={inp(errors.language)}
                                                    value={details.identity.language || ''}
                                                    onChange={e => { updDetails('identity', 'language', e.target.value); clrErr('language'); }} />
                                            </Field>
                                        </div>
                                        <Field id="recognitionText" label="Recognition Text">
                                            <textarea id="recognitionText" style={{ ...s.input, height: 60, resize: 'none' }}
                                                value={details.identity.recognitionText || ''}
                                                onChange={e => updDetails('identity', 'recognitionText', e.target.value)} />
                                        </Field>
                                        {/* Upload row */}
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <UploadField label="Board Logo" field="boardLogoUrl" examForm={examForm} setExamForm={setExamForm} uploading={uploading} handleFileUpload={handleFileUpload} type="image" />
                                            <UploadField label="Board Seal" field="boardSealUrl" examForm={examForm} setExamForm={setExamForm} uploading={uploading} handleFileUpload={handleFileUpload} type="image" />
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 4: Rules ── */}
                                {activeStep === 4 && (
                                    <div style={s.stepWrap}>
                                        <Field id="eligibility" label="Eligibility" error={errors.eligibility}>
                                            <input id="eligibility" style={inp(errors.eligibility)}
                                                value={details.rules.eligibility || ''}
                                                onChange={e => { updRules('eligibility', e.target.value); clrErr('eligibility'); }} />
                                        </Field>
                                        <Field id="passingCriteria" label="Passing Criteria" error={errors.passingCriteria}>
                                            <textarea id="passingCriteria" style={{ ...inp(errors.passingCriteria), height: 60, resize: 'none' }}
                                                value={details.rules.passingCriteria || ''}
                                                onChange={e => { updRules('passingCriteria', e.target.value); clrErr('passingCriteria'); }} />
                                        </Field>
                                        <div style={s.sectionHdr}>Grading Thresholds</div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            {[
                                                { id: 'firstClass', label: '1st Class (%)', key: 'firstClass' },
                                                { id: 'secondClass', label: '2nd Class (%)', key: 'secondClass' },
                                                { id: 'thirdClass', label: '3rd Class (%)', key: 'thirdClass' },
                                                { id: 'failThreshold', label: 'Fail Below (%)', key: 'fail' },
                                            ].map(({ id, label, key }) => (
                                                <Field key={id} id={id} label={label} error={errors[id]}>
                                                    <input id={id} style={inp(errors[id])}
                                                        value={details.rules.gradingScheme[key] || ''}
                                                        onChange={e => { updGrading(key, e.target.value); clrErr(id); }} />
                                                </Field>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* ── STEP 5: Admin ── */}
                                {activeStep === 5 && (
                                    <div style={s.stepWrap}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <Field id="signatoryName" label="Signatory Name" error={errors.signatoryName}>
                                                <input id="signatoryName" style={inp(errors.signatoryName)}
                                                    value={details.administrative.signatoryName || ''}
                                                    onChange={e => { updDetails('administrative', 'signatoryName', e.target.value); clrErr('signatoryName'); }} />
                                            </Field>
                                            <Field id="signatoryDesignation" label="Designation" error={errors.signatoryDesignation}>
                                                <input id="signatoryDesignation" style={inp(errors.signatoryDesignation)}
                                                    value={details.administrative.signatoryDesignation || ''}
                                                    onChange={e => { updDetails('administrative', 'signatoryDesignation', e.target.value); clrErr('signatoryDesignation'); }} />
                                            </Field>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                                            <Field id="departmentName" label="Department" error={errors.departmentName}>
                                                <input id="departmentName" style={inp(errors.departmentName)}
                                                    value={details.administrative.departmentName || ''}
                                                    onChange={e => { updDetails('administrative', 'departmentName', e.target.value); clrErr('departmentName'); }} />
                                            </Field>
                                            <Field id="syllabusYear" label="Syllabus Year" error={errors.syllabusYear}>
                                                <input id="syllabusYear" style={inp(errors.syllabusYear)}
                                                    value={details.administrative.syllabusYear || ''}
                                                    onChange={e => { updDetails('administrative', 'syllabusYear', e.target.value); clrErr('syllabusYear'); }} />
                                            </Field>
                                        </div>
                                        <Field id="instructions" label="Instructions Summary" error={errors.instructions}>
                                            <textarea id="instructions" style={{ ...inp(errors.instructions), height: 68, resize: 'none' }}
                                                value={details.administrative.instructions || ''}
                                                onChange={e => { updDetails('administrative', 'instructions', e.target.value); clrErr('instructions'); }} />
                                        </Field>
                                        <UploadField label="Controller Signature" field="controllerSignatureUrl" examForm={examForm} setExamForm={setExamForm} uploading={uploading} handleFileUpload={handleFileUpload} type="signature" />
                                    </div>
                                )}
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Nav buttons */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 18, marginTop: 16, borderTop: '0.5px solid #E8EAF0' }}>
                        <button type="button" onClick={prevStep} disabled={activeStep === 0} data-testid="prev-wizard-button"
                            style={{ ...s.navBtn, ...(activeStep === 0 ? s.navBtnDisabled : {}) }}>
                            <ChevronLeft size={16} /> Prev
                        </button>
                        {activeStep < steps.length - 1 ? (
                            <button type="button" onClick={nextStep} data-testid="next-wizard-button" style={s.primaryBtn}>
                                Next <ChevronRight size={16} />
                            </button>
                        ) : (
                            <button type="submit" data-testid="next-wizard-button" style={{ ...s.primaryBtn, background: '#2F9E44' }}>
                                {isEditing ? 'Update Exam' : 'Create Exam'}
                            </button>
                        )}
                    </div>
                </form>
            </div>

            {/* ══════ LIST PANEL ══════ */}
            <div style={s.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
                    <div>
                        <p style={s.cardTitle}>Existing Exams</p>
                        <p style={s.cardSub}>{examsData?.totalElements || 0} exams total</p>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={s.filterWrap}>
                            <Filter size={11} style={{ color: '#B0B3C6' }} />
                            <input type="text" placeholder="Search..." style={s.filterInput}
                                value={filterName} onChange={e => { setFilterName(e.target.value); setPage(0); }} />
                        </div>
                        <button onClick={() => refetch()} style={s.iconBtn}>
                            <RefreshCw size={13} style={isLoading ? { animation: 'spin 1s linear infinite' } : {}} />
                        </button>
                    </div>
                </div>

                {exams.length === 0 && !isLoading ? (
                    <div style={s.emptyWrap}>
                        <BookOpen size={28} style={{ color: '#D1D5E8', marginBottom: 10 }} />
                        <span style={s.emptyText}>No exams found</span>
                    </div>
                ) : (
                    <>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 520, overflowY: 'auto' }}>
                            {exams.map(ex => {
                                const st = STATUS_STYLES[ex.status] || STATUS_STYLES.DRAFT;
                                return (
                                    <motion.div key={ex.examNo}
                                        initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                                        style={s.examRow}
                                        onMouseEnter={e => e.currentTarget.style.borderColor = '#C5D0FF'}
                                        onMouseLeave={e => e.currentTarget.style.borderColor = '#E8EAF0'}
                                    >
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <p style={s.examName}>{ex.exam_name}</p>
                                            <p style={s.examCode}>{ex.exam_code}</p>
                                        </div>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                                            <span style={{ ...s.statusPill, background: st.bg, color: st.color }}>{ex.status}</span>
                                            <button onClick={() => startEditing(ex)} style={s.editBtn} title="Edit">
                                                <Edit size={13} />
                                            </button>
                                            <button onClick={() => handleDeleteExam(ex.examNo)} style={s.deleteBtn} title="Delete">
                                                <Trash2 size={13} />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </div>
                        {totalPages > 1 && (
                            <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
                        )}
                    </>
                )}
            </div>

            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
    );
};

/* ── Upload Field sub-component ── */
const UploadField = ({ label, field, examForm, setExamForm, uploading, handleFileUpload, type }) => {
    const url = examForm[field];
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
            <span style={s.label}>{label}</span>
            <div style={s.uploadBox}>
                {url ? (
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                        <img src={url} alt={label} style={{ width: type === 'signature' ? 80 : 44, height: 44, objectFit: 'contain', borderRadius: 6, border: '0.5px solid #E8EAF0', background: '#fff' }} />
                        <button type="button" onClick={() => setExamForm(p => ({ ...p, [field]: '' }))}
                            style={s.removeBtn}><X size={9} /></button>
                    </div>
                ) : (
                    <div style={s.uploadPlaceholder}>
                        {type === 'signature' ? <FileText size={18} style={{ color: '#D1D5E8' }} /> : <ImageIcon size={18} style={{ color: '#D1D5E8' }} />}
                    </div>
                )}
                <label style={s.uploadBtn}>
                    {uploading[field] ? <Loader2 size={12} style={{ animation: 'spin 1s linear infinite' }} /> : <Upload size={12} />}
                    {uploading[field] ? 'Uploading…' : url ? 'Change' : `Upload ${label}`}
                    <input type="file" style={{ display: 'none' }} accept="image/*"
                        onChange={e => handleFileUpload(field, e.target.files[0])} disabled={uploading[field]} />
                </label>
            </div>
        </div>
    );
};

export default ExamManager;

/* ── Styles ── */
const s = {
    card: {
        background: '#fff',
        borderRadius: 14,
        padding: '20px 22px',
        border: '0.5px solid #E8EAF0',
    },
    cardTitle: { fontSize: 13, fontWeight: 700, color: '#1A1D2E', margin: 0 },
    cardSub: { fontSize: 11, color: '#8B8FA8', margin: '3px 0 0' },

    label: {
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.07em', color: '#8B8FA8',
    },
    input: {
        padding: '8px 11px', fontSize: 13, color: '#1A1D2E',
        border: '0.5px solid #E8EAF0', borderRadius: 8, outline: 'none',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
        background: '#fff', width: '100%', boxSizing: 'border-box',
    },
    inputErr: { borderColor: '#F03E3E' },
    errText: { fontSize: 10, color: '#F03E3E', marginTop: 2 },

    sectionHdr: {
        fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
        letterSpacing: '0.08em', color: '#4361EE',
        paddingBottom: 6, borderBottom: '0.5px solid #EEF3FF',
        marginBottom: 2,
    },

    stepWrap: { display: 'flex', flexDirection: 'column', gap: 12 },

    toggleRow: {
        display: 'flex', gap: 12, padding: '12px 14px',
        background: '#FAFBFF', borderRadius: 10,
        border: '0.5px solid #E8EAF0',
    },
    checkLabel: {
        display: 'flex', alignItems: 'center', gap: 8,
        fontSize: 12, fontWeight: 600, color: '#3D405B', cursor: 'pointer',
    },

    paperRow: {
        display: 'flex', gap: 8, padding: '10px 12px',
        background: '#FAFBFF', borderRadius: 8, border: '0.5px solid #E8EAF0',
    },

    navBtn: {
        display: 'flex', alignItems: 'center', gap: 4,
        padding: '7px 14px', fontSize: 12, fontWeight: 700,
        background: 'none', border: '0.5px solid #E8EAF0',
        borderRadius: 8, cursor: 'pointer', color: '#3D405B',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    navBtnDisabled: { color: '#D1D5E8', cursor: 'not-allowed', borderColor: '#F0F1F7' },
    primaryBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '7px 18px', fontSize: 12, fontWeight: 700,
        background: '#4361EE', color: '#fff',
        border: 'none', borderRadius: 8, cursor: 'pointer',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    cancelBtn: {
        display: 'flex', alignItems: 'center', gap: 4,
        fontSize: 11, fontWeight: 700, color: '#F03E3E',
        background: 'none', border: 'none', cursor: 'pointer',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },

    filterWrap: {
        display: 'flex', alignItems: 'center', gap: 6,
        background: '#FAFBFF', border: '0.5px solid #E8EAF0',
        borderRadius: 8, padding: '5px 10px',
    },
    filterInput: {
        fontSize: 12, fontWeight: 500, color: '#1A1D2E',
        background: 'transparent', border: 'none', outline: 'none',
        width: 100, fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    iconBtn: {
        background: 'none', border: '0.5px solid #E8EAF0',
        borderRadius: 8, padding: '6px 8px', cursor: 'pointer',
        color: '#8B8FA8', display: 'flex', alignItems: 'center',
    },

    examRow: {
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '11px 14px', borderRadius: 10,
        border: '0.5px solid #E8EAF0', background: '#FAFBFF',
        transition: 'border-color 0.15s',
    },
    examName: { fontSize: 13, fontWeight: 600, color: '#1A1D2E', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' },
    examCode: { fontSize: 10, fontWeight: 700, color: '#B0B3C6', margin: '2px 0 0', textTransform: 'uppercase', letterSpacing: '0.06em' },
    statusPill: { fontSize: 9, fontWeight: 700, padding: '3px 8px', borderRadius: 20, whiteSpace: 'nowrap' },
    editBtn: {
        padding: '5px', background: '#FFF9DB', color: '#E67700',
        border: '0.5px solid #FFE066', borderRadius: 6, cursor: 'pointer', display: 'flex',
    },
    deleteBtn: {
        padding: '5px', background: '#FFF5F5', color: '#F03E3E',
        border: '0.5px solid #FFC9C9', borderRadius: 6, cursor: 'pointer', display: 'flex',
    },

    emptyWrap: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0' },
    emptyText: { fontSize: 13, color: '#B0B3C6', fontStyle: 'italic' },

    uploadBox: {
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px', background: '#FAFBFF',
        border: '0.5px solid #E8EAF0', borderRadius: 10,
    },
    uploadPlaceholder: {
        width: 44, height: 44, borderRadius: 8, flexShrink: 0,
        background: '#fff', border: '0.5px dashed #D1D5E8',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
    },
    uploadBtn: {
        display: 'flex', alignItems: 'center', gap: 6,
        padding: '6px 12px', fontSize: 10, fontWeight: 700,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        background: '#fff', color: '#4361EE',
        border: '0.5px solid #C5D0FF', borderRadius: 7, cursor: 'pointer',
        fontFamily: "'DM Sans', 'Segoe UI', sans-serif",
    },
    removeBtn: {
        position: 'absolute', top: -4, right: -4,
        background: '#F03E3E', color: '#fff', border: 'none',
        borderRadius: '50%', width: 16, height: 16, cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0,
    },
};
