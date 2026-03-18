// import React, { useState } from 'react';
// import { motion, AnimatePresence } from 'framer-motion';
// import { 
//     ChevronLeft, 
//     CheckCircle, 
//     XCircle, 
//     User, 
//     BookOpen, 
//     Calendar, 
//     MapPin, 
//     Phone, 
//     Mail, 
//     FileText,
//     AlertCircle,
//     Info,
//     Printer,
//     X
// } from 'lucide-react';
// import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
// import { getStudentProfileByStudentIdString, updateExamApplication, getExamApplicationByExactId, getStudents, getSchools } from '../../api';
// import { getExam as getExamByNo } from '../../api/exam-api';
// import toast from 'react-hot-toast';

// const ApplicationDetailView = ({ application: initialApplication, onBack }) => {
//     const queryClient = useQueryClient();
//     const [rejectionReason, setRejectionReason] = useState("");
//     const [isRejecting, setIsRejecting] = useState(false);

//     // Fetch full application data using the exact ID endpoint
//     const { data: applicationDetail } = useQuery({
//         queryKey: ['application', initialApplication?.applicationId, initialApplication?.examNo],
//         queryFn: () => getExamApplicationByExactId(initialApplication?.applicationId, initialApplication?.examNo),
//         enabled: !!initialApplication?.applicationId && !!initialApplication?.examNo,
//         initialData: initialApplication
//     });

//     const application = applicationDetail || initialApplication;

//     // Fetch Student data (different from profile)
//     const { data: studentData } = useQuery({
//         queryKey: ['student', application?.studentId],
//         queryFn: async () => {
//             const response = await getStudents({ studentId: application.studentId });
//             return response.content?.[0] || null;
//         },
//         enabled: !!application?.studentId
//     });

//     // Parse formData
//     const parsedFormData = React.useMemo(() => {
//         if (!application?.formData) return null;
//         try {
//             return typeof application.formData === 'string' 
//                 ? JSON.parse(application.formData) 
//                 : application.formData;
//         } catch (e) {
//             console.error("Error parsing formData:", e);
//             return null;
//         }
//     }, [application?.formData]);

//     // Fetch Student Profile via the new studentId endpoint
//     const { data: profileResponse } = useQuery({
//         queryKey: ['studentProfile', application?.studentId],
//         queryFn: () => getStudentProfileByStudentIdString(application?.studentId),
//         enabled: !!application?.studentId
//     });

//     // getStudentProfile may return array or single object
//     const profile = Array.isArray(profileResponse) ? profileResponse[0] : profileResponse;

//     // Fetch Exam Details
//     const { data: examDetails } = useQuery({
//         queryKey: ['exam', application?.examNo],
//         queryFn: () => getExamByNo(application?.examNo),
//         enabled: !!application?.examNo
//     });

//     // Fetch all schools to find the student's school for seal/signature
//     const { data: schoolsData } = useQuery({
//         queryKey: ['schools-for-app'],
//         queryFn: () => getSchools({ size: 1000 }),
//         staleTime: 5 * 60 * 1000,
//     });
//     const studentSchool = (schoolsData?.content || []).find(
//         s => s.schoolName === (application?.schoolName || studentData?.schoolName)
//     ) || null;

//     // Helper: extract URL from backend JSON map strings like {"filename":"url"}
//     const parseUrlFromJsonString = (str) => {
//         if (!str) return null;
//         if (str.startsWith('http')) return str;
//         try {
//             const parsed = JSON.parse(str);
//             if (typeof parsed === 'object' && parsed !== null) {
//                 return Object.values(parsed)[0] || null;
//             }
//         } catch { return str; }
//         return null;
//     };

//     const principalSigUrl = parseUrlFromJsonString(studentSchool?.principalSignatureUrl);
//     const schoolStampUrl  = parseUrlFromJsonString(studentSchool?.schoolStampUrl);

//     const updateStatusMutation = useMutation({
//         mutationFn: ({ id, status, remarks }) => updateExamApplication(id, { ...application, status, remarks }),
//         onSuccess: () => {
//             queryClient.invalidateQueries(['applications']);
//             queryClient.invalidateQueries(['application', application.applicationId]);
//             toast.success("Application updated successfully");
//             onBack();
//         },
//         onError: () => {
//             toast.error("Failed to update application status");
//         }
//     });

//     const handleApprove = () => {
//         if (window.confirm("Are you sure you want to APPROVE this application?")) {
//             updateStatusMutation.mutate({ 
//                 id: application.applicationId, 
//                 status: 'APPROVED',
//                 remarks: 'Verified and approved by admin'
//             });
//         }
//     };

//     const handleReject = () => {
//         if (!rejectionReason.trim()) {
//             return toast.error("Please provide a reason for rejection");
//         }
//         updateStatusMutation.mutate({ 
//             id: application.applicationId, 
//             status: 'REJECTED',
//             remarks: rejectionReason 
//         });
//     };

//     if (!application) return null;

//     // Replicate papers logic from ApplyModal
//     const papers = (() => {
//         try {
//             return JSON.parse(examDetails?.papers || "[]");
//         } catch {
//             return [];
//         }
//     })();

//     const Field = ({ label, value }) => (
//         <div className="flex flex-col">
//             <span className="label block text-[11px] color-slate-400 uppercase mb-1 font-bold">{label}</span>
//             <div className="value text-sm font-medium text-slate-700 min-h-[20px] pb-0.5 border-b border-dashed border-slate-200">{value || "—"}</div>
//         </div>
//     );

//     return (
//         <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto pb-20 px-4">
//             {/* Scoped Styles from ApplyModal */}
//             <style dangerouslySetInnerHTML={{ __html: `
//                 @media print {
//                     @page { size: A4; margin: 10mm; }
//                     body { background: white; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
//                     .no-print { display: none !important; }
//                     .modal-container { box-shadow: none !important; border: 1px solid #cbd5e0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; padding: 20px !important; transform: none !important; position: static !important; }
//                     .photo-box { top: 80px !important; right: 20px !important; }
//                 }
//                 .modal-container {
//                     max-width: 850px;
//                     background: white;
//                     padding: 40px;
//                     border: 1px solid #cbd5e0;
//                     box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
//                     position: relative;
//                     font-family: 'Inter', system-ui, -apple-system, sans-serif;
//                 }
//                 .header-form { text-align: center; border-bottom: 2px solid #1a365d; padding-bottom: 20px; margin-bottom: 30px; }
//                 .header-form h1 { margin: 0; color: #1a365d; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; }
//                 .header-form p { margin: 5px 0; font-size: 14px; color: #4a5568; }
//                 .section-form { margin-bottom: 25px; border: 1px solid #cbd5e0; border-radius: 4px; overflow: hidden; }
//                 .section-header-form { background-color: #edf2f7; padding: 10px 15px; font-weight: bold; text-transform: uppercase; font-size: 13px; border-bottom: 1px solid #cbd5e0; color: #2d3748; }
//                 .field-group-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 15px; }
//                 .label { font-size: 11px; color: #718096; text-transform: uppercase; margin-bottom: 4px; font-weight: 700; }
//                 .value { font-size: 14px; font-weight: 500; color: #2d3748; min-height: 20px; padding-bottom: 2px; border-bottom: 1px dashed #e2e8f0; }
//                 .photo-box-form { width: 120px; height: 150px; border: 2px dashed #a0aec0; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 12px; color: #718096; position: absolute; top: 100px; right: 40px; background: #fdfdfd; }
//                 .paper-table-form { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; text-align: left; }
//                 .paper-table-form th, .paper-table-form td { border: 1px solid #cbd5e0; padding: 8px 12px; }
//                 .paper-table-form th { background-color: #f8fafc; font-weight: 600; color: #4a5568; text-transform: uppercase; font-size: 11px; }
//                 .stamp-signature-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; padding: 15px; }
//                 .sign-box-form { height: 100px; border: 1px solid #cbd5e0; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 10px; font-size: 12px; color: #4a5568; background-color: #fafafa; }
//             `}} />

//             {/* Header / Navigation - Hidden on Print */}
//             <div className="flex items-center justify-between mb-8 no-print">
//                 <button 
//                     onClick={onBack}
//                     className="flex items-center gap-2 text-gray-500 hover:text-[#4c84ff] font-bold text-xs uppercase tracking-widest transition-colors group"
//                 >
//                     <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:border-blue-100">
//                         <ChevronLeft size={16} />
//                     </div>
//                     Back to Applications
//                 </button>

//                 <div className="flex items-center gap-3">
//                     <button 
//                         onClick={() => window.print()}
//                         className="bg-[#1b223c] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#252d4a] transition-all shadow-lg shadow-black/10"
//                     >
//                         <Printer size={16} /> Print Official Form
//                     </button>
//                     <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border shadow-sm uppercase tracking-widest ${
//                         application.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
//                         application.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
//                         'bg-blue-50 text-blue-600 border-blue-100'
//                     }`}>
//                         Status: {application.status}
//                     </span>
//                 </div>
//             </div>

//             <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
//                 {/* Main Content: THE FORM (PARITY WITH APPLYMODAL) */}
//                 <div className="lg:col-span-3">
//                     <div className="modal-container mx-auto">
//                         {/* Header */}
//                         <div className="header-form" style={{ position: 'relative' }}>
//                             {/* Board Seal - top left */}
//                             {examDetails?.boardSealUrl && (
//                                 <img src={examDetails.boardSealUrl} alt="Board Seal" style={{ position:'absolute', left:0, top:0, width:'80px', height:'80px', objectFit:'contain' }} />
//                             )}
//                             {/* Board Logo - top right */}
//                             {examDetails?.boardLogoUrl && (
//                                 <img src={examDetails.boardLogoUrl} alt="Board Logo" style={{ position:'absolute', right:0, top:0, width:'80px', height:'80px', objectFit:'contain' }} />
//                             )}
//                             <h1>Maharashtra Rashtrabhasha Sabha, Pune</h1>
//                             <p>387, Narayan Peth, Pune &ndash; 411 030 | Form No: MRS/2026/A-{application.applicationId}</p>
//                             <p style={{ fontWeight: 'bold', marginTop: '10px', fontSize: '16px' }}>EXAMINATION APPLICATION FORM</p>
//                         </div>

//                         <div className="photo-box-form">
//                             {profile?.profilePhotoUrl ? (
//                                 <img src={profile.profilePhotoUrl} alt="Passport Size" className="w-full h-full object-cover" />
//                             ) : (
//                                 <>AFFIX RECENT<br/>PASSPORT SIZE<br/>PHOTOGRAPH<br/>HERE</>
//                             )}
//                         </div>

//                         <div className="flex justify-between items-center text-sm font-bold mb-6">
//                             <div>Application ID: <span className="text-red-600">#{application.applicationId}</span></div>
//                             <div style={{ marginRight: '140px' }}>Date: {new Date(application.appliedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
//                         </div>

//                         {/* 1. Examination Details */}
//                         <div className="section-form text-left">
//                             <div className="section-header-form">1. Examination Details</div>
//                             <div className="field-group-form">
//                                 <Field label="Exam Name" value={application.examName} />
//                                 <Field label="Exam Code" value={examDetails?.exam_code} />
//                                 <Field label="Academic Session" value={new Date(application.appliedAt || Date.now()).getFullYear()} />
//                                 <Field label="Exam Year" value={new Date(application.appliedAt || Date.now()).getFullYear()} />
//                                 <Field label="Candidate Type" value="Regular Candidate" />
//                                 <Field label="Exam Fees Paid" value={`₹ ${examDetails?.exam_fees || '—'}.00`} />
//                                 <Field label="Fee Receipt Number" value={`MRS-RCPT-${application.applicationId + 1000}`} />
//                                 <div style={{ gridColumn: 'span 2' }}>
//                                     <span className="label block border-b pb-1 mb-2">Papers included in this Examination</span>
//                                     <table className="paper-table-form">
//                                         <thead>
//                                             <tr>
//                                                 <th style={{ width: '50px', textAlign: 'center' }}>Sr No</th>
//                                                 <th>Paper Name</th>
//                                                 <th>Total Marks</th>
//                                             </tr>
//                                         </thead>
//                                         <tbody>
//                                             {papers.length > 0 ? papers.map((paper, i) => (
//                                                 <tr key={i}>
//                                                     <td style={{ textAlign: 'center' }}>{String(i + 1).padStart(2, '0')}</td>
//                                                     <td style={{ fontWeight: 'bold' }}>{paper.name}</td>
//                                                     <td>{paper.maxMarks}</td>
//                                                 </tr>
//                                             )) : (
//                                                 <tr>
//                                                     <td colSpan="3" style={{ textAlign: 'center' }}>No papers found</td>
//                                                 </tr>
//                                             )}
//                                         </tbody>
//                                     </table>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* 2. Personal Information */}
//                         <div className="section-form text-left">
//                             <div className="section-header-form">2. Student Personal Information</div>
//                             <div className="field-group-form">
//                                 <div style={{ gridColumn: 'span 2' }}>
//                                     <Field label="Student Full Name (Last, First, Middle)" value={application.studentName} />
//                                 </div>
//                                 <Field label="Father's / Guardian's Name" value={profile?.fatherName} />
//                                 <Field label="Mother's Name" value={profile?.motherName} />
//                                 <Field label="Date of Birth" value={profile?.dateOfBirth} />
//                                 <Field label="Age (as of Jan 1st)" value={studentData?.age} />
//                                 <Field label="Gender" value={profile?.gender} />
//                                 <Field label="Category" value={profile?.category} />
//                                 <div style={{ gridColumn: 'span 2' }}>
//                                     <Field label="Permanent / Communication Address" 
//                                         value={profile?.address ? 
//                                             `${profile.address.line1}${profile.address.line2 ? ', ' + profile.address.line2 : ''}, ${profile.address.villageOrCity}, ${profile.address.taluka ? profile.address.taluka + ', ' : ''}${profile.address.district}, ${profile.address.state} - ${profile.address.pincode}` 
//                                             : "—"
//                                         } 
//                                     />
//                                 </div>
//                                 <Field label="Mother Tongue" value={studentData?.motherTongue} />
//                                 <Field label="Contact Number" value={studentData?.contact} />
//                             </div>
//                         </div>

//                         {/* 3. Academic Details */}
//                         <div className="section-form text-left">
//                             <div className="section-header-form">3. Contact & Academic Details</div>
//                             <div className="field-group-form">
//                                 <div style={{ gridColumn: 'span 2' }}>
//                                     <Field label="School / Institute Name" value={application.schoolName || studentData?.schoolName} />
//                                 </div>
//                                 <Field label="Class / Standard" value="—" />
//                                 <Field label="Medium of Instruction" value={parsedFormData?.medium} />
//                                 <Field label="Category" value={parsedFormData?.category} />
//                                 <Field label="Exam Centre" value="—" />
//                                 <Field label="Email Address" value={studentData?.email} />

//                                 {profile?.previousExamName && (
//                                     <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
//                                         <span className="label block border-b pb-1 mb-2">Previous Exam Details</span>
//                                         <table className="paper-table-form">
//                                             <thead>
//                                                 <tr>
//                                                     <th>Exam Name</th>
//                                                     <th>Year</th>
//                                                     <th>Roll/Reg No</th>
//                                                     <th>Result/Marks</th>
//                                                 </tr>
//                                             </thead>
//                                             <tbody>
//                                                 <tr>
//                                                     <td style={{ fontWeight: 'bold' }}>{profile.previousExamName}</td>
//                                                     <td>{profile.previousExamYear}</td>
//                                                     <td>{profile.previousExamRollNO || profile.previousExamRollNo}</td>
//                                                     <td>Passed ({profile.previousExamMarks}%)</td>
//                                                 </tr>
//                                             </tbody>
//                                         </table>
//                                     </div>
//                                 )}
//                             </div>
//                         </div>

//                         {/* Essential Documents Verification (Admin Only View) */}
//                         <div className="section-form text-left no-print">
//                             <div className="section-header-form" style={{ backgroundColor: '#1a365d', color: 'white' }}>Candidate Documents Verification</div>
//                             <div className="p-4 grid grid-cols-2 gap-6">
//                                 <div>
//                                     <span className="label">Candidate ID Proof</span>
//                                     <div className="mt-2 border rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-2" style={{ height: '120px' }}>
//                                         {profile?.idProofDocumentUrl ? (
//                                             <a href={profile.idProofDocumentUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-blue-600 font-bold hover:underline">
//                                                 <FileText size={40} />
//                                                 <span className="text-[10px] uppercase">View ID Proof</span>
//                                             </a>
//                                         ) : (
//                                             <span className="text-slate-300 italic font-bold text-xs">No ID Proof Uploaded</span>
//                                         )}
//                                     </div>
//                                 </div>
//                                 <div>
//                                     <span className="label">Candidate Signature</span>
//                                     <div className="mt-2 border rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-2" style={{ height: '120px' }}>
//                                         {profile?.signatureUrl ? (
//                                             <img src={profile.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
//                                         ) : (
//                                             <span className="text-slate-300 italic font-bold text-xs">No Signature Uploaded</span>
//                                         )}
//                                     </div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* Office Use Section */}
//                         <div className="section-form text-left" style={{ border: '2px solid #2d3748', backgroundColor: '#f8fafc' }}>
//                             <div className="section-header-form" style={{ backgroundColor: '#2d3748', color: 'white' }}>FOR OFFICE USE ONLY</div>
//                             <div className="grid grid-cols-3 gap-6 p-4">
//                                 <div className="flex flex-col">
//                                     <span className="label">Assigned Roll Number</span>
//                                     <div className="h-6 border-b border-dashed border-slate-300"></div>
//                                 </div>
//                                 <div className="flex flex-col">
//                                     <span className="label">Registration Number</span>
//                                     <div className="h-6 border-b border-dashed border-slate-300"></div>
//                                 </div>
//                                 <div className="flex flex-col">
//                                     <span className="label">Date of Receipt</span>
//                                     <div className="h-6 border-b border-dashed border-slate-300"></div>
//                                 </div>
//                             </div>
//                         </div>

//                         {/* 4. Declaration & Authorization */}
//                         <div className="section-form text-left">
//                             <div className="section-header-form">4. Declaration & Authorization</div>
//                             <div className="p-4 text-[11px] text-justify text-slate-600 leading-tight">
//                                 I hereby declare that all the statements made in this application are true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect, my candidature/application is liable to be cancelled or rejected.
//                             </div>
//                             <div className="stamp-signature-form">
//                                 <div className="sign-box-form">
//                                     {profile?.signatureUrl ? (
//                                         <img src={profile.signatureUrl} alt="Signature" className="max-h-full p-2 object-contain" />
//                                     ) : (
//                                         <span className="opacity-30 uppercase font-black">Candidate Sign</span>
//                                     )}
//                                     <span>Signature of Candidate</span>
//                                 </div>
//                                 <div className="sign-box-form">
//                                     {principalSigUrl ? (
//                                         <img src={principalSigUrl} alt="Principal Signature" className="max-h-16 p-1 object-contain" />
//                                     ) : (
//                                         <span className="opacity-30 uppercase font-black">Stamp Area</span>
//                                     )}
//                                     {schoolStampUrl && (
//                                         <img src={schoolStampUrl} alt="School Stamp" className="max-h-10 p-1 object-contain" />
//                                     )}
//                                     <span>Principal's Signature &amp; Stamp</span>
//                                 </div>
//                                 <div className="sign-box-form">
//                                     {examDetails?.controllerSignatureUrl ? (
//                                         <img src={examDetails.controllerSignatureUrl} alt="Controller Signature" className="max-h-16 p-1 object-contain" />
//                                     ) : (
//                                         <span className="opacity-30 uppercase font-black">Stamp Area</span>
//                                     )}
//                                     {examDetails?.boardSealUrl && (
//                                         <img src={examDetails.boardSealUrl} alt="Board Seal" className="max-h-10 p-1 object-contain" />
//                                     )}
//                                     <span>Sabha Authorized Stamp</span>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>

//                 {/* Right Column: Decisions & History - Hidden on Print */}
//                 <div className="space-y-8 no-print">
//                     <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8 overflow-hidden sticky top-8">
//                         <h3 className="text-lg font-black text-gray-800 mb-6 tracking-tight">Review Action</h3>

//                         <div className="space-y-4">
//                             {!isRejecting ? (
//                                 <>
//                                     <button 
//                                         onClick={handleApprove}
//                                         disabled={updateStatusMutation.isPending || application.status === 'APPROVED'}
//                                         className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50"
//                                     >
//                                         <CheckCircle size={20} /> Approve
//                                     </button>

//                                     <button 
//                                         onClick={() => setIsRejecting(true)}
//                                         disabled={updateStatusMutation.isPending || application.status === 'REJECTED'}
//                                         className="w-full py-4 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50"
//                                     >
//                                         <XCircle size={20} /> Reject
//                                     </button>
//                                 </>
//                             ) : (
//                                 <motion.div 
//                                     initial={{ opacity: 0, scale: 0.95 }}
//                                     animate={{ opacity: 1, scale: 1 }}
//                                     className="space-y-4"
//                                 >
//                                     <textarea 
//                                         value={rejectionReason}
//                                         onChange={(e) => setRejectionReason(e.target.value)}
//                                         placeholder="Reason for rejection..."
//                                         className="w-full min-h-[120px] p-4 bg-gray-50 border-2 border-red-50 focus:border-red-200 rounded-2xl outline-none text-sm text-gray-700 shadow-inner"
//                                     />
//                                     <div className="flex gap-3">
//                                         <button 
//                                             onClick={handleReject}
//                                             className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-colors"
//                                         >
//                                             Confirm
//                                         </button>
//                                         <button 
//                                             onClick={() => setIsRejecting(false)}
//                                             className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors"
//                                         >
//                                             Cancel
//                                         </button>
//                                     </div>
//                                 </motion.div>
//                             )}
//                         </div>

//                         <div className="mt-8 pt-8 border-t border-gray-100">
//                             <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Application History</h4>
//                             <div className="space-y-4">
//                                 <div className="relative pl-6 pb-4 border-l border-blue-100">
//                                     <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-500" />
//                                     <p className="text-[10px] font-black text-gray-900 leading-none">Submitted</p>
//                                     <p className="text-[9px] text-gray-400 mt-1">{new Date(application.appliedAt || Date.now()).toLocaleString()}</p>
//                                 </div>
//                             </div>
//                         </div>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default ApplicationDetailView;


import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, CheckCircle, XCircle, FileText, Printer } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentProfileByStudentIdString, updateExamApplication, getExamApplicationByExactId, getStudents, getSchools } from '../../api';
import { getExam as getExamByNo } from '../../api/exam-api';
import toast from 'react-hot-toast';

const STATUS_STYLES = {
    APPROVED: { bg: '#EBFBEE', color: '#2F9E44' },
    REJECTED: { bg: '#FFF5F5', color: '#F03E3E' },
    PENDING: { bg: '#EEF3FF', color: '#4361EE' },
};

const ApplicationDetailView = ({ application: initialApplication, onBack }) => {
    const queryClient = useQueryClient();
    const [rejectionReason, setRejectionReason] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    const { data: applicationDetail } = useQuery({
        queryKey: ['application', initialApplication?.applicationId, initialApplication?.examNo],
        queryFn: () => getExamApplicationByExactId(initialApplication?.applicationId, initialApplication?.examNo),
        enabled: !!initialApplication?.applicationId && !!initialApplication?.examNo,
        initialData: initialApplication,
    });
    const application = applicationDetail || initialApplication;

    const { data: studentData } = useQuery({
        queryKey: ['student', application?.studentId],
        queryFn: async () => { const r = await getStudents({ studentId: application.studentId }); return r.content?.[0] || null; },
        enabled: !!application?.studentId,
    });

    const parsedFormData = React.useMemo(() => {
        if (!application?.formData) return null;
        try { return typeof application.formData === 'string' ? JSON.parse(application.formData) : application.formData; }
        catch { return null; }
    }, [application?.formData]);

    const { data: profileResponse } = useQuery({
        queryKey: ['studentProfile', application?.studentId],
        queryFn: () => getStudentProfileByStudentIdString(application?.studentId),
        enabled: !!application?.studentId,
    });
    const profile = Array.isArray(profileResponse) ? profileResponse[0] : profileResponse;

    const { data: examDetails } = useQuery({
        queryKey: ['exam', application?.examNo],
        queryFn: () => getExamByNo(application?.examNo),
        enabled: !!application?.examNo,
    });

    const { data: schoolsData } = useQuery({
        queryKey: ['schools-for-app'],
        queryFn: () => getSchools({ size: 1000 }),
        staleTime: 5 * 60 * 1000,
    });
    const studentSchool = (schoolsData?.content || []).find(s => s.schoolName === (application?.schoolName || studentData?.schoolName)) || null;

    const parseUrl = (str) => {
        if (!str) return null;
        if (str.startsWith('http')) return str;
        try { const p = JSON.parse(str); if (typeof p === 'object') return Object.values(p)[0] || null; } catch { }
        return str;
    };
    const principalSigUrl = parseUrl(studentSchool?.principalSignatureUrl);
    const schoolStampUrl = parseUrl(studentSchool?.schoolStampUrl);

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status, remarks }) => updateExamApplication(id, { ...application, status, remarks }),
        onSuccess: () => {
            queryClient.invalidateQueries(['applications']);
            queryClient.invalidateQueries(['application', application.applicationId]);
            toast.success('Application updated');
            onBack();
        },
        onError: () => toast.error('Failed to update application'),
    });

    const handleApprove = () => {
        if (window.confirm('Approve this application?')) {
            updateStatusMutation.mutate({ id: application.applicationId, status: 'APPROVED', remarks: 'Verified and approved by admin' });
        }
    };
    const handleReject = () => {
        if (!rejectionReason.trim()) return toast.error('Please provide a rejection reason');
        updateStatusMutation.mutate({ id: application.applicationId, status: 'REJECTED', remarks: rejectionReason });
    };

    if (!application) return null;

    const papers = (() => { try { return JSON.parse(examDetails?.papers || '[]'); } catch { return []; } })();
    const st = STATUS_STYLES[application.status] || STATUS_STYLES.PENDING;

    return (
        <div style={s.page}>

            {/* Top nav — hidden on print */}
            <div style={s.navBar} className="no-print">
                <button onClick={onBack} style={s.backBtn}>
                    <ChevronLeft size={15} /> Back to Applications
                </button>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => window.print()} style={s.printBtn}>
                        <Printer size={13} /> Print Official Form
                    </button>
                    <span style={{ ...s.statusPill, background: st.bg, color: st.color }}>
                        {application.status}
                    </span>
                </div>
            </div>

            <div style={s.bodyGrid}>

                {/* ── Official Form ── */}
                <div style={s.formCard} className="modal-container">
                    <style dangerouslySetInnerHTML={{ __html: PRINT_STYLES }} />

                    {/* Form header */}
                    <div style={s.formHeader}>
                        {examDetails?.boardSealUrl && <img src={examDetails.boardSealUrl} alt="Seal" style={s.headerImgLeft} />}
                        {examDetails?.boardLogoUrl && <img src={examDetails.boardLogoUrl} alt="Logo" style={s.headerImgRight} />}
                        <h1 style={s.formTitle}>Maharashtra Rashtrabhasha Sabha, Pune</h1>
                        <p style={s.formSubtitle}>387, Narayan Peth, Pune – 411 030 | Form No: MRS/2026/A-{application.applicationId}</p>
                        <p style={s.formSubtitle}><strong>EXAMINATION APPLICATION FORM</strong></p>
                    </div>

                    {/* Photo box */}
                    <div style={s.photoBox}>
                        {profile?.profilePhotoUrl
                            ? <img src={profile.profilePhotoUrl} alt="Passport" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : <span style={{ fontSize: 9, textAlign: 'center', color: '#999', padding: 4 }}>AFFIX PASSPORT PHOTO</span>}
                    </div>

                    <div style={s.metaRow}>
                        <span>Application ID: <strong style={{ color: '#F03E3E' }}>#{application.applicationId}</strong></span>
                        <span style={{ marginRight: 148 }}>Date: {new Date(application.appliedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>

                    <FormSection title="1. Examination Details">
                        <div style={s.fieldGrid}>
                            <FormField label="Exam Name" value={application.examName} />
                            <FormField label="Exam Code" value={examDetails?.exam_code} />
                            <FormField label="Academic Session" value={new Date(application.appliedAt || Date.now()).getFullYear()} />
                            <FormField label="Exam Fees Paid" value={`₹ ${examDetails?.exam_fees || '—'}.00`} />
                            <FormField label="Candidate Type" value="Regular Candidate" />
                            <FormField label="Fee Receipt Number" value={`MRS-RCPT-${application.applicationId + 1000}`} />
                        </div>
                        <div style={{ padding: '0 14px 14px' }}>
                            <span style={s.formLabel}>Papers included in this Examination</span>
                            <table style={s.paperTable}>
                                <thead>
                                    <tr style={{ background: '#F8FAFC' }}>
                                        <th style={{ ...s.paperTh, width: 50, textAlign: 'center' }}>Sr No</th>
                                        <th style={s.paperTh}>Paper Name</th>
                                        <th style={s.paperTh}>Total Marks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {papers.length > 0 ? papers.map((p, i) => (
                                        <tr key={i}>
                                            <td style={{ ...s.paperTd, textAlign: 'center' }}>{String(i + 1).padStart(2, '0')}</td>
                                            <td style={{ ...s.paperTd, fontWeight: 600 }}>{p.name}</td>
                                            <td style={s.paperTd}>{p.maxMarks}</td>
                                        </tr>
                                    )) : <tr><td colSpan="3" style={{ ...s.paperTd, textAlign: 'center', color: '#B0B3C6', fontStyle: 'italic' }}>No papers found</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </FormSection>

                    <FormSection title="2. Student Personal Information">
                        <div style={{ ...s.fieldGrid, gridColumn: 'span 2' }}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <FormField label="Student Full Name" value={application.studentName} />
                            </div>
                            <FormField label="Father's / Guardian's Name" value={profile?.fatherName} />
                            <FormField label="Mother's Name" value={profile?.motherName} />
                            <FormField label="Date of Birth" value={profile?.dateOfBirth} />
                            <FormField label="Age (as of Jan 1st)" value={studentData?.age} />
                            <FormField label="Gender" value={profile?.gender} />
                            <FormField label="Category" value={profile?.category} />
                            <div style={{ gridColumn: 'span 2' }}>
                                <FormField label="Address" value={profile?.address ? `${profile.address.line1}${profile.address.line2 ? ', ' + profile.address.line2 : ''}, ${profile.address.villageOrCity}, ${profile.address.district}, ${profile.address.state} - ${profile.address.pincode}` : ''} />
                            </div>
                            <FormField label="Mother Tongue" value={studentData?.motherTongue} />
                            <FormField label="Contact Number" value={studentData?.contact} />
                        </div>
                    </FormSection>

                    <FormSection title="3. Contact & Academic Details">
                        <div style={s.fieldGrid}>
                            <div style={{ gridColumn: 'span 2' }}>
                                <FormField label="School / Institute Name" value={application.schoolName || studentData?.schoolName} />
                            </div>
                            <FormField label="Medium of Instruction" value={parsedFormData?.medium} />
                            <FormField label="Category" value={parsedFormData?.category} />
                            <FormField label="Email Address" value={studentData?.email} />
                        </div>
                    </FormSection>

                    {/* Documents verification — no-print section */}
                    <FormSection title="Candidate Documents Verification" headerStyle={{ background: '#1A1D2E', color: '#fff' }} className="no-print">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, padding: 14 }}>
                            {[
                                { label: 'ID Proof', url: profile?.idProofDocumentUrl, isDoc: true },
                                { label: 'Signature', url: profile?.signatureUrl },
                            ].map(({ label, url, isDoc }) => (
                                <div key={label}>
                                    <span style={s.formLabel}>{label}</span>
                                    <div style={s.docBox}>
                                        {url
                                            ? isDoc
                                                ? <a href={url} target="_blank" rel="noreferrer" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, color: '#4361EE', fontWeight: 700, textDecoration: 'none', fontSize: 11 }}><FileText size={32} />View</a>
                                                : <img src={url} alt={label} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                            : <span style={{ fontSize: 12, color: '#D1D5E8', fontStyle: 'italic' }}>Not uploaded</span>}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </FormSection>

                    {/* Office use */}
                    <FormSection title="For Office Use Only" headerStyle={{ background: '#2D3748', color: '#fff' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: 14 }}>
                            {['Assigned Roll Number', 'Registration Number', 'Date of Receipt'].map(l => (
                                <div key={l} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                    <span style={s.formLabel}>{l}</span>
                                    <div style={{ height: 24, borderBottom: '1px dashed #E2E8F0' }} />
                                </div>
                            ))}
                        </div>
                    </FormSection>

                    <FormSection title="4. Declaration & Authorization">
                        <p style={{ fontSize: 11, color: '#4A5568', padding: '4px 14px 14px', lineHeight: 1.6, textAlign: 'justify' }}>
                            I hereby declare that all the statements made in this application are true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect, my candidature/application is liable to be cancelled or rejected.
                        </p>
                        <div style={s.stampRow}>
                            {[
                                { label: 'Signature of Candidate', url: profile?.signatureUrl },
                                { label: "Principal's Signature & Stamp", url: principalSigUrl, stamp: schoolStampUrl },
                                { label: 'Sabha Authorized Stamp', url: examDetails?.controllerSignatureUrl, stamp: examDetails?.boardSealUrl },
                            ].map(({ label, url, stamp }) => (
                                <div key={label} style={s.signBox}>
                                    {url && <img src={url} alt={label} style={{ maxHeight: 48, objectFit: 'contain' }} />}
                                    {stamp && <img src={stamp} alt="stamp" style={{ maxHeight: 32, objectFit: 'contain' }} />}
                                    <span style={{ fontSize: 11, color: '#4A5568', marginTop: 'auto' }}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </FormSection>
                </div>

                {/* ── Right panel: Review actions ── */}
                <div style={s.rightPanel} className="no-print">
                    <p style={s.cardTitle}>Review Action</p>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 16 }}>
                        {!isRejecting ? (
                            <>
                                <button
                                    onClick={handleApprove}
                                    disabled={updateStatusMutation.isPending || application.status === 'APPROVED'}
                                    style={{ ...s.actionBtn, background: '#2F9E44', color: '#fff' }}
                                >
                                    <CheckCircle size={15} /> Approve
                                </button>
                                <button
                                    onClick={() => setIsRejecting(true)}
                                    disabled={updateStatusMutation.isPending || application.status === 'REJECTED'}
                                    style={{ ...s.actionBtn, background: '#fff', color: '#F03E3E', border: '0.5px solid #FFC9C9' }}
                                >
                                    <XCircle size={15} /> Reject
                                </button>
                            </>
                        ) : (
                            <motion.div initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                                <textarea
                                    value={rejectionReason}
                                    onChange={e => setRejectionReason(e.target.value)}
                                    placeholder="Reason for rejection…"
                                    style={{ ...s.input, minHeight: 100, resize: 'vertical', border: '0.5px solid #FFC9C9' }}
                                />
                                <div style={{ display: 'flex', gap: 8 }}>
                                    <button onClick={handleReject} style={{ ...s.actionBtn, flex: 1, background: '#F03E3E', color: '#fff' }}>Confirm</button>
                                    <button onClick={() => setIsRejecting(false)} style={{ ...s.actionBtn, padding: '8px 14px', background: '#F0F1F7', color: '#3D405B', border: 'none' }}>Cancel</button>
                                </div>
                            </motion.div>
                        )}
                    </div>

                    <div style={{ marginTop: 20, paddingTop: 16, borderTop: '0.5px solid #E8EAF0' }}>
                        <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#8B8FA8', marginBottom: 12 }}>Application History</p>
                        <div style={{ position: 'relative', paddingLeft: 18, paddingBottom: 4, borderLeft: '2px solid #EEF3FF' }}>
                            <div style={{ position: 'absolute', left: -5, top: 2, width: 8, height: 8, borderRadius: '50%', background: '#4361EE' }} />
                            <p style={{ fontSize: 12, fontWeight: 600, color: '#1A1D2E', margin: 0 }}>Submitted</p>
                            <p style={{ fontSize: 11, color: '#8B8FA8', margin: '3px 0 0' }}>{new Date(application.appliedAt || Date.now()).toLocaleString()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                @keyframes spin { to { transform: rotate(360deg); } }
                @media print {
                    @page { size: A4; margin: 10mm; }
                    body { background: white; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .modal-container { box-shadow: none !important; border: 1px solid #cbd5e0 !important; margin: 0 !important; width: 100% !important; }
                }
            `}</style>
        </div>
    );
};

/* ── Sub-components ── */
const FormSection = ({ title, children, headerStyle = {}, className = '' }) => (
    <div className={className} style={{ border: '1px solid #E2E8F0', borderRadius: 4, overflow: 'hidden', marginBottom: 16 }}>
        <div style={{ background: '#EDF2F7', padding: '8px 14px', fontSize: 12, fontWeight: 700, textTransform: 'uppercase', borderBottom: '1px solid #E2E8F0', color: '#2D3748', ...headerStyle }}>
            {title}
        </div>
        {children}
    </div>
);

const FormField = ({ label, value }) => (
    <div style={{ display: 'flex', flexDirection: 'column', padding: '0 0 8px' }}>
        <span style={{ fontSize: 10, color: '#718096', textTransform: 'uppercase', fontWeight: 700, marginBottom: 3 }}>{label}</span>
        <div style={{ fontSize: 13, fontWeight: 500, color: '#2D3748', minHeight: 18, borderBottom: '1px dashed #E2E8F0', paddingBottom: 2 }}>{value || '—'}</div>
    </div>
);

const PRINT_STYLES = '';

export default ApplicationDetailView;

const s = {
    page: { display: 'flex', flexDirection: 'column', gap: 14, fontFamily: "'DM Sans', 'Segoe UI', sans-serif", maxWidth: 1400, margin: '0 auto', paddingBottom: 40 },
    navBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
    backBtn: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#3D405B', background: '#fff', border: '0.5px solid #E8EAF0', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    printBtn: { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', color: '#fff', background: '#1A1D2E', border: 'none', borderRadius: 8, padding: '7px 14px', cursor: 'pointer', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" },
    statusPill: { fontSize: 10, fontWeight: 700, padding: '4px 12px', borderRadius: 20, textTransform: 'uppercase' },
    bodyGrid: { display: 'grid', gridTemplateColumns: '3fr 1fr', gap: 14, alignItems: 'start' },
    formCard: { background: '#fff', borderRadius: 14, padding: '28px 32px', border: '0.5px solid #E8EAF0', position: 'relative' },
    formHeader: { textAlign: 'center', borderBottom: '2px solid #1A365D', paddingBottom: 16, marginBottom: 24, position: 'relative' },
    formTitle: { fontSize: 20, fontWeight: 800, color: '#1A365D', textTransform: 'uppercase', letterSpacing: 1, margin: '0 0 6px' },
    formSubtitle: { fontSize: 13, color: '#4A5568', margin: '4px 0' },
    headerImgLeft: { position: 'absolute', left: 0, top: 0, width: 72, height: 72, objectFit: 'contain' },
    headerImgRight: { position: 'absolute', right: 0, top: 0, width: 72, height: 72, objectFit: 'contain' },
    photoBox: { position: 'absolute', top: 96, right: 32, width: 110, height: 140, border: '2px dashed #A0AEC0', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#FDFDFD', borderRadius: 4 },
    metaRow: { display: 'flex', justifyContent: 'space-between', fontSize: 12, fontWeight: 600, color: '#2D3748', marginBottom: 16 },
    fieldGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, padding: 14 },
    formLabel: { fontSize: 10, color: '#718096', textTransform: 'uppercase', fontWeight: 700, display: 'block', marginBottom: 4 },
    paperTable: { width: '100%', borderCollapse: 'collapse', marginTop: 8, fontSize: 12 },
    paperTh: { border: '1px solid #CBD5E0', padding: '7px 10px', fontWeight: 700, color: '#4A5568', textTransform: 'uppercase', fontSize: 10 },
    paperTd: { border: '1px solid #CBD5E0', padding: '7px 10px' },
    stampRow: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: 14 },
    signBox: { height: 90, border: '1px solid #CBD5E0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-end', padding: '8px 6px', gap: 4, background: '#FAFAFA', borderRadius: 4 },
    docBox: { height: 100, border: '0.5px solid #E8EAF0', borderRadius: 8, background: '#FAFBFF', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: 4 },
    rightPanel: { background: '#fff', borderRadius: 14, padding: '20px 22px', border: '0.5px solid #E8EAF0', position: 'sticky', top: 8 },
    cardTitle: { fontSize: 13, fontWeight: 700, color: '#1A1D2E', margin: 0 },
    actionBtn: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '10px 0', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em', border: 'none', borderRadius: 8, cursor: 'pointer', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", width: '100%' },
    input: { padding: '8px 11px', fontSize: 13, color: '#1A1D2E', border: '0.5px solid #E8EAF0', borderRadius: 8, outline: 'none', fontFamily: "'DM Sans', 'Segoe UI', sans-serif", background: '#FAFBFF', width: '100%', boxSizing: 'border-box' },
};