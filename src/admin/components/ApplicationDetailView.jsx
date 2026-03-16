import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    ChevronLeft, 
    CheckCircle, 
    XCircle, 
    User, 
    BookOpen, 
    Calendar, 
    MapPin, 
    Phone, 
    Mail, 
    FileText,
    AlertCircle,
    Info,
    Printer,
    X
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getStudentProfile, updateExamApplication, getExamApplicationByExactId, getStudents } from '../../api';
import { getExam as getExamByNo } from '../../api/exam-api';
import toast from 'react-hot-toast';

const ApplicationDetailView = ({ application: initialApplication, onBack }) => {
    const queryClient = useQueryClient();
    const [rejectionReason, setRejectionReason] = useState("");
    const [isRejecting, setIsRejecting] = useState(false);

    // Fetch full application data using the exact ID endpoint
    const { data: applicationDetail } = useQuery({
        queryKey: ['application', initialApplication?.applicationId, initialApplication?.examNo],
        queryFn: () => getExamApplicationByExactId(initialApplication?.applicationId, initialApplication?.examNo),
        enabled: !!initialApplication?.applicationId && !!initialApplication?.examNo,
        initialData: initialApplication
    });

    const application = applicationDetail || initialApplication;

    // Fetch Student data (different from profile)
    const { data: studentData } = useQuery({
        queryKey: ['student', application?.studentId],
        queryFn: async () => {
            const response = await getStudents({ studentId: application.studentId });
            return response.content?.[0] || null;
        },
        enabled: !!application?.studentId
    });

    // Parse formData
    const parsedFormData = React.useMemo(() => {
        if (!application?.formData) return null;
        try {
            return typeof application.formData === 'string' 
                ? JSON.parse(application.formData) 
                : application.formData;
        } catch (e) {
            console.error("Error parsing formData:", e);
            return null;
        }
    }, [application?.formData]);

    // Fetch Student Profile
    const { data: profileResponse } = useQuery({
        queryKey: ['studentProfile', application?.studentId],
        queryFn: () => getStudentProfile(application?.studentId),
        enabled: !!application?.studentId
    });
    
    // getStudentProfile returns an array for a single profile fetch via student id based on current implementation
    const profile = Array.isArray(profileResponse) ? profileResponse[0] : profileResponse;

    // Fetch Exam Details
    const { data: examDetails } = useQuery({
        queryKey: ['exam', application?.examNo],
        queryFn: () => getExamByNo(application?.examNo),
        enabled: !!application?.examNo
    });

    const updateStatusMutation = useMutation({
        mutationFn: ({ id, status, remarks }) => updateExamApplication(id, { ...application, status, remarks }),
        onSuccess: () => {
            queryClient.invalidateQueries(['applications']);
            queryClient.invalidateQueries(['application', application.applicationId]);
            toast.success("Application updated successfully");
            onBack();
        },
        onError: () => {
            toast.error("Failed to update application status");
        }
    });

    const handleApprove = () => {
        if (window.confirm("Are you sure you want to APPROVE this application?")) {
            updateStatusMutation.mutate({ 
                id: application.applicationId, 
                status: 'APPROVED',
                remarks: 'Verified and approved by admin'
            });
        }
    };

    const handleReject = () => {
        if (!rejectionReason.trim()) {
            return toast.error("Please provide a reason for rejection");
        }
        updateStatusMutation.mutate({ 
            id: application.applicationId, 
            status: 'REJECTED',
            remarks: rejectionReason 
        });
    };

    if (!application) return null;

    // Replicate papers logic from ApplyModal
    const papers = (() => {
        try {
            return JSON.parse(examDetails?.papers || "[]");
        } catch {
            return [];
        }
    })();

    const Field = ({ label, value }) => (
        <div className="flex flex-col">
            <span className="label block text-[11px] color-slate-400 uppercase mb-1 font-bold">{label}</span>
            <div className="value text-sm font-medium text-slate-700 min-h-[20px] pb-0.5 border-b border-dashed border-slate-200">{value || "—"}</div>
        </div>
    );

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-[1400px] mx-auto pb-20 px-4">
            {/* Scoped Styles from ApplyModal */}
            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    @page { size: A4; margin: 10mm; }
                    body { background: white; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
                    .no-print { display: none !important; }
                    .modal-container { box-shadow: none !important; border: 1px solid #cbd5e0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; padding: 20px !important; transform: none !important; position: static !important; }
                    .photo-box { top: 80px !important; right: 20px !important; }
                }
                .modal-container {
                    max-width: 850px;
                    background: white;
                    padding: 40px;
                    border: 1px solid #cbd5e0;
                    box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
                    position: relative;
                    font-family: 'Inter', system-ui, -apple-system, sans-serif;
                }
                .header-form { text-align: center; border-bottom: 2px solid #1a365d; padding-bottom: 20px; margin-bottom: 30px; }
                .header-form h1 { margin: 0; color: #1a365d; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; }
                .header-form p { margin: 5px 0; font-size: 14px; color: #4a5568; }
                .section-form { margin-bottom: 25px; border: 1px solid #cbd5e0; border-radius: 4px; overflow: hidden; }
                .section-header-form { background-color: #edf2f7; padding: 10px 15px; font-weight: bold; text-transform: uppercase; font-size: 13px; border-bottom: 1px solid #cbd5e0; color: #2d3748; }
                .field-group-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 15px; }
                .label { font-size: 11px; color: #718096; text-transform: uppercase; margin-bottom: 4px; font-weight: 700; }
                .value { font-size: 14px; font-weight: 500; color: #2d3748; min-height: 20px; padding-bottom: 2px; border-bottom: 1px dashed #e2e8f0; }
                .photo-box-form { width: 120px; height: 150px; border: 2px dashed #a0aec0; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 12px; color: #718096; position: absolute; top: 100px; right: 40px; background: #fdfdfd; }
                .paper-table-form { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; text-align: left; }
                .paper-table-form th, .paper-table-form td { border: 1px solid #cbd5e0; padding: 8px 12px; }
                .paper-table-form th { background-color: #f8fafc; font-weight: 600; color: #4a5568; text-transform: uppercase; font-size: 11px; }
                .stamp-signature-form { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; padding: 15px; }
                .sign-box-form { height: 100px; border: 1px solid #cbd5e0; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 10px; font-size: 12px; color: #4a5568; background-color: #fafafa; }
            `}} />

            {/* Header / Navigation - Hidden on Print */}
            <div className="flex items-center justify-between mb-8 no-print">
                <button 
                    onClick={onBack}
                    className="flex items-center gap-2 text-gray-500 hover:text-[#4c84ff] font-bold text-xs uppercase tracking-widest transition-colors group"
                >
                    <div className="p-2 bg-white rounded-lg shadow-sm border border-gray-100 group-hover:border-blue-100">
                        <ChevronLeft size={16} />
                    </div>
                    Back to Applications
                </button>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => window.print()}
                        className="bg-[#1b223c] text-white px-6 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2 hover:bg-[#252d4a] transition-all shadow-lg shadow-black/10"
                    >
                        <Printer size={16} /> Print Official Form
                    </button>
                    <span className={`text-[10px] font-black px-4 py-1.5 rounded-full border shadow-sm uppercase tracking-widest ${
                        application.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                        application.status === 'REJECTED' ? 'bg-red-50 text-red-600 border-red-100' :
                        'bg-blue-50 text-blue-600 border-blue-100'
                    }`}>
                        Status: {application.status}
                    </span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Main Content: THE FORM (PARITY WITH APPLYMODAL) */}
                <div className="lg:col-span-3">
                    <div className="modal-container mx-auto">
                        {/* Header */}
                        <div className="header-form">
                            <h1>Maharashtra Rashtrabhasha Sabha, Pune</h1>
                            <p>387, Narayan Peth, Pune – 411 030 | Form No: MRS/2026/A-{application.applicationId}</p>
                            <p style={{ fontWeight: 'bold', marginTop: '10px', fontSize: '16px' }}>EXAMINATION APPLICATION FORM</p>
                        </div>

                        <div className="photo-box-form">
                            {profile?.profilePhotoUrl ? (
                                <img src={profile.profilePhotoUrl} alt="Passport Size" className="w-full h-full object-cover" />
                            ) : (
                                <>AFFIX RECENT<br/>PASSPORT SIZE<br/>PHOTOGRAPH<br/>HERE</>
                            )}
                        </div>

                        <div className="flex justify-between items-center text-sm font-bold mb-6">
                            <div>Application ID: <span className="text-red-600">#{application.applicationId}</span></div>
                            <div style={{ marginRight: '140px' }}>Date: {new Date(application.appliedAt || Date.now()).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
                        </div>

                        {/* 1. Examination Details */}
                        <div className="section-form text-left">
                            <div className="section-header-form">1. Examination Details</div>
                            <div className="field-group-form">
                                <Field label="Exam Name" value={application.examName} />
                                <Field label="Exam Code" value={examDetails?.exam_code} />
                                <Field label="Academic Session" value={new Date(application.appliedAt || Date.now()).getFullYear()} />
                                <Field label="Exam Year" value={new Date(application.appliedAt || Date.now()).getFullYear()} />
                                <Field label="Candidate Type" value="Regular Candidate" />
                                <Field label="Exam Fees Paid" value={`₹ ${examDetails?.exam_fees || '—'}.00`} />
                                <Field label="Fee Receipt Number" value={`MRS-RCPT-${application.applicationId + 1000}`} />
                                <div style={{ gridColumn: 'span 2' }}>
                                    <span className="label block border-b pb-1 mb-2">Papers included in this Examination</span>
                                    <table className="paper-table-form">
                                        <thead>
                                            <tr>
                                                <th style={{ width: '50px', textAlign: 'center' }}>Sr No</th>
                                                <th>Paper Name</th>
                                                <th>Total Marks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {papers.length > 0 ? papers.map((paper, i) => (
                                                <tr key={i}>
                                                    <td style={{ textAlign: 'center' }}>{String(i + 1).padStart(2, '0')}</td>
                                                    <td style={{ fontWeight: 'bold' }}>{paper.name}</td>
                                                    <td>{paper.maxMarks}</td>
                                                </tr>
                                            )) : (
                                                <tr>
                                                    <td colSpan="3" style={{ textAlign: 'center' }}>No papers found</td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>

                        {/* 2. Personal Information */}
                        <div className="section-form text-left">
                            <div className="section-header-form">2. Student Personal Information</div>
                            <div className="field-group-form">
                                <div style={{ gridColumn: 'span 2' }}>
                                    <Field label="Student Full Name (Last, First, Middle)" value={application.studentName} />
                                </div>
                                <Field label="Father's / Guardian's Name" value={profile?.fatherName} />
                                <Field label="Mother's Name" value={profile?.motherName} />
                                <Field label="Date of Birth" value={profile?.dateOfBirth} />
                                <Field label="Age (as of Jan 1st)" value={studentData?.age} />
                                <Field label="Gender" value={profile?.gender} />
                                <Field label="Category" value={profile?.category} />
                                <div style={{ gridColumn: 'span 2' }}>
                                    <Field label="Permanent / Communication Address" 
                                        value={profile?.address ? 
                                            `${profile.address.line1}${profile.address.line2 ? ', ' + profile.address.line2 : ''}, ${profile.address.villageOrCity}, ${profile.address.taluka ? profile.address.taluka + ', ' : ''}${profile.address.district}, ${profile.address.state} - ${profile.address.pincode}` 
                                            : "—"
                                        } 
                                    />
                                </div>
                                <Field label="Mother Tongue" value={studentData?.motherTongue} />
                                <Field label="Contact Number" value={studentData?.contact} />
                            </div>
                        </div>

                        {/* 3. Academic Details */}
                        <div className="section-form text-left">
                            <div className="section-header-form">3. Contact & Academic Details</div>
                            <div className="field-group-form">
                                <div style={{ gridColumn: 'span 2' }}>
                                    <Field label="School / Institute Name" value={application.schoolName || studentData?.schoolName} />
                                </div>
                                <Field label="Class / Standard" value="—" />
                                <Field label="Medium of Instruction" value={parsedFormData?.medium} />
                                <Field label="Category" value={parsedFormData?.category} />
                                <Field label="Exam Centre" value="—" />
                                <Field label="Email Address" value={studentData?.email} />
                                
                                {profile?.previousExamName && (
                                    <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                                        <span className="label block border-b pb-1 mb-2">Previous Exam Details</span>
                                        <table className="paper-table-form">
                                            <thead>
                                                <tr>
                                                    <th>Exam Name</th>
                                                    <th>Year</th>
                                                    <th>Roll/Reg No</th>
                                                    <th>Result/Marks</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td style={{ fontWeight: 'bold' }}>{profile.previousExamName}</td>
                                                    <td>{profile.previousExamYear}</td>
                                                    <td>{profile.previousExamRollNO || profile.previousExamRollNo}</td>
                                                    <td>Passed ({profile.previousExamMarks}%)</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Essential Documents Verification (Admin Only View) */}
                        <div className="section-form text-left no-print">
                            <div className="section-header-form" style={{ backgroundColor: '#1a365d', color: 'white' }}>Candidate Documents Verification</div>
                            <div className="p-4 grid grid-cols-2 gap-6">
                                <div>
                                    <span className="label">Candidate ID Proof</span>
                                    <div className="mt-2 border rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-2" style={{ height: '120px' }}>
                                        {profile?.idProofDocumentUrl ? (
                                            <a href={profile.idProofDocumentUrl} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-1 text-blue-600 font-bold hover:underline">
                                                <FileText size={40} />
                                                <span className="text-[10px] uppercase">View ID Proof</span>
                                            </a>
                                        ) : (
                                            <span className="text-slate-300 italic font-bold text-xs">No ID Proof Uploaded</span>
                                        )}
                                    </div>
                                </div>
                                <div>
                                    <span className="label">Candidate Signature</span>
                                    <div className="mt-2 border rounded-lg overflow-hidden bg-slate-50 flex items-center justify-center p-2" style={{ height: '120px' }}>
                                        {profile?.signatureUrl ? (
                                            <img src={profile.signatureUrl} alt="Signature" className="max-h-full max-w-full object-contain" />
                                        ) : (
                                            <span className="text-slate-300 italic font-bold text-xs">No Signature Uploaded</span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Office Use Section */}
                        <div className="section-form text-left" style={{ border: '2px solid #2d3748', backgroundColor: '#f8fafc' }}>
                            <div className="section-header-form" style={{ backgroundColor: '#2d3748', color: 'white' }}>FOR OFFICE USE ONLY</div>
                            <div className="grid grid-cols-3 gap-6 p-4">
                                <div className="flex flex-col">
                                    <span className="label">Assigned Roll Number</span>
                                    <div className="h-6 border-b border-dashed border-slate-300"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="label">Registration Number</span>
                                    <div className="h-6 border-b border-dashed border-slate-300"></div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="label">Date of Receipt</span>
                                    <div className="h-6 border-b border-dashed border-slate-300"></div>
                                </div>
                            </div>
                        </div>

                        {/* 4. Declaration & Authorization */}
                        <div className="section-form text-left">
                            <div className="section-header-form">4. Declaration & Authorization</div>
                            <div className="p-4 text-[11px] text-justify text-slate-600 leading-tight">
                                I hereby declare that all the statements made in this application are true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect, my candidature/application is liable to be cancelled or rejected.
                            </div>
                            <div className="stamp-signature-form">
                                <div className="sign-box-form">
                                    {profile?.signatureUrl ? (
                                        <img src={profile.signatureUrl} alt="Signature" className="max-h-full p-2 object-contain" />
                                    ) : (
                                        <span className="opacity-30 uppercase font-black">Candidate Sign</span>
                                    )}
                                    <span>Signature of Candidate</span>
                                </div>
                                <div className="sign-box-form">
                                    <span className="opacity-30 uppercase font-black">Stamp Area</span>
                                    <span>Principal's Signature & Stamp</span>
                                </div>
                                <div className="sign-box-form">
                                    <span className="opacity-30 uppercase font-black">Stamp Area</span>
                                    <span>Sabha Authorized Stamp</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Decisions & History - Hidden on Print */}
                <div className="space-y-8 no-print">
                    <div className="bg-white rounded-3xl shadow-xl shadow-black/5 border border-gray-100 p-8 overflow-hidden sticky top-8">
                        <h3 className="text-lg font-black text-gray-800 mb-6 tracking-tight">Review Action</h3>
                        
                        <div className="space-y-4">
                            {!isRejecting ? (
                                <>
                                    <button 
                                        onClick={handleApprove}
                                        disabled={updateStatusMutation.isPending || application.status === 'APPROVED'}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-lg shadow-emerald-200 flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        <CheckCircle size={20} /> Approve
                                    </button>
                                    
                                    <button 
                                        onClick={() => setIsRejecting(true)}
                                        disabled={updateStatusMutation.isPending || application.status === 'REJECTED'}
                                        className="w-full py-4 bg-white border-2 border-red-100 text-red-600 hover:bg-red-50 rounded-2xl font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50"
                                    >
                                        <XCircle size={20} /> Reject
                                    </button>
                                </>
                            ) : (
                                <motion.div 
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="space-y-4"
                                >
                                    <textarea 
                                        value={rejectionReason}
                                        onChange={(e) => setRejectionReason(e.target.value)}
                                        placeholder="Reason for rejection..."
                                        className="w-full min-h-[120px] p-4 bg-gray-50 border-2 border-red-50 focus:border-red-200 rounded-2xl outline-none text-sm text-gray-700 shadow-inner"
                                    />
                                    <div className="flex gap-3">
                                        <button 
                                            onClick={handleReject}
                                            className="flex-1 py-3 bg-red-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-red-700 transition-colors"
                                        >
                                            Confirm
                                        </button>
                                        <button 
                                            onClick={() => setIsRejecting(false)}
                                            className="px-6 py-3 bg-gray-100 text-gray-500 rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-200 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-100">
                            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Application History</h4>
                            <div className="space-y-4">
                                <div className="relative pl-6 pb-4 border-l border-blue-100">
                                    <div className="absolute left-[-5px] top-0 w-2 h-2 rounded-full bg-blue-500" />
                                    <p className="text-[10px] font-black text-gray-900 leading-none">Submitted</p>
                                    <p className="text-[9px] text-gray-400 mt-1">{new Date(application.appliedAt || Date.now()).toLocaleString()}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApplicationDetailView;
