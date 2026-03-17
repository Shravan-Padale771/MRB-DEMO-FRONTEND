import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer } from "lucide-react";
import toast from "react-hot-toast";
import { createExamApplication, getStudentProfile } from "../../api";

const ApplyModal = ({ exam, student, school, onClose, onSuccess }) => {
  const [agreed, setAgreed] = useState(false);
  const [error, setError] = useState("");
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [medium, setMedium] = useState("Hindi");
  const [category, setCategory] = useState("General");

  // Parse the papers JSON string from the exam entity
  const papers = useMemo(() => {
    try {
      return JSON.parse(exam?.papers || "[]");
    } catch {
      return [];
    }
  }, [exam?.papers]);

  // Backend stores these as JSON map strings: {"filename":"url"}
  // This helper extracts the first URL value from the map string
  const parseUrlFromJsonString = (str) => {
    if (!str) return null;
    // If already a plain URL, return as-is
    if (str.startsWith("http")) return str;
    try {
      const parsed = JSON.parse(str);
      if (typeof parsed === "object" && parsed !== null) {
        return Object.values(parsed)[0] || null;
      }
    } catch {
      // Not JSON, return as-is
      return str;
    }
    return null;
  };

  const principalSigUrl = parseUrlFromJsonString(school?.principalSignatureUrl);
  const schoolStampUrl  = parseUrlFromJsonString(school?.schoolStampUrl);

  // All papers are opted by default (student applies for all)
  const optedPapers = papers.map((p) => p.name);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getStudentProfile(student.studentId);
        setProfile(data);
      } catch (err) {
        console.error("Failed to fetch profile:", err);
      } finally {
        setLoading(false);
      }
    };
    if (student?.studentId) {
      fetchProfile();
    }
  }, [student]);

  if (!exam || !student) return null;

  const handleSubmit = async () => {
    if (!agreed) {
      setError("Please accept the declaration before submitting");
      toast.error("Please accept the declaration before submitting");
      return;
    }
    setError("");

    const applicationPayload = {
      examNo: exam.examNo,
      studentId: student.studentId,
      status: "APPLIED",
      formData: JSON.stringify({
        medium,
        category,
        optedPapers,
      }),
    };

    try {
      await createExamApplication(applicationPayload);
      toast.success("Application Submitted Successfully");
      onClose();
      onSuccess?.();
    } catch {
      toast.error("Application Failed");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-100/90 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-10 print:p-0 print:bg-white print:relative print:overflow-visible">
        {/* CSS Reset for Print and Scoped Styles */}
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
            margin: 0 auto;
            background: white;
            padding: 40px;
            border: 1px solid #cbd5e0;
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
            position: relative;
            font-family: 'Inter', system-ui, -apple-system, sans-serif;
          }
          .header { text-align: center; border-bottom: 2px solid #1a365d; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #1a365d; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; }
          .header p { margin: 5px 0; font-size: 14px; color: #4a5568; }
          .section { margin-bottom: 25px; border: 1px solid #cbd5e0; border-radius: 4px; overflow: hidden; }
          .section-header { background-color: #edf2f7; padding: 10px 15px; font-weight: bold; text-transform: uppercase; font-size: 13px; border-bottom: 1px solid #cbd5e0; color: #2d3748; }
          .field-group { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 15px; }
          .label { font-size: 11px; color: #718096; text-transform: uppercase; margin-bottom: 4px; font-weight: 700; }
          .value { font-size: 14px; font-weight: 500; color: #2d3748; min-height: 20px; padding-bottom: 2px; border-bottom: 1px dashed #e2e8f0; }
          .photo-box { width: 120px; height: 150px; border: 2px dashed #a0aec0; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 12px; color: #718096; position: absolute; top: 100px; right: 40px; background: #fdfdfd; }
          .paper-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; text-align: left; }
          .paper-table th, .paper-table td { border: 1px solid #cbd5e0; padding: 8px 12px; }
          .paper-table th { background-color: #f8fafc; font-weight: 600; color: #4a5568; text-transform: uppercase; font-size: 11px; }
          .stamp-signature { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; padding: 15px; }
          .sign-box { height: 100px; border: 1px solid #cbd5e0; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 10px; font-size: 12px; color: #4a5568; background-color: #fafafa; }
          .instruction-box { margin-top: 30px; font-size: 12px; color: #4a5568; background: #fffaf0; padding: 15px; border: 1px solid #feebc8; border-radius: 4px; }
        `}} />

        {/* Floating Controls - No Print */}
        <div className="max-w-[850px] mx-auto mb-6 flex justify-between items-center no-print">
          <div className="flex items-center gap-2">
            <span className="bg-indigo-600 text-white text-[10px] px-2 py-1 rounded font-black">REF-04</span>
            <span className="text-sm font-bold text-slate-600">Official Exam Application Form</span>
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="bg-white hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-xs font-bold border shadow-sm flex items-center gap-2 transition-all">
              <Printer size={14} /> Print Preview
            </button>
            <button onClick={onClose} className="bg-white hover:bg-slate-50 text-slate-400 p-2 rounded-lg border shadow-sm transition-all">
              <X size={18} />
            </button>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="modal-container"
        >
          {/* Header */}
          <div className="header" style={{ position: 'relative' }}>
            {/* Board Seal - top left */}
            {exam.boardSealUrl && (
              <img src={exam.boardSealUrl} alt="Board Seal" style={{ position:'absolute', left:0, top:0, width:'80px', height:'80px', objectFit:'contain' }} />
            )}
            {/* Board Logo - top right */}
            {exam.boardLogoUrl && (
              <img src={exam.boardLogoUrl} alt="Board Logo" style={{ position:'absolute', right:0, top:0, width:'80px', height:'80px', objectFit:'contain' }} />
            )}
            <h1>Maharashtra Rashtrabhasha Sabha, Pune</h1>
            <p>387, Narayan Peth, Pune – 411 030 | Form No: MRS/2026/A-{Math.floor(Math.random() * 9000) + 1000}</p>
            <p style={{ fontWeight: 'bold', marginTop: '10px', fontSize: '16px' }}>EXAMINATION APPLICATION FORM</p>
          </div>

          <div className="photo-box">
            {profile?.profilePhotoUrl ? (
              <img src={profile.profilePhotoUrl} alt="Passport Size" className="w-full h-full object-cover" />
            ) : (
              <>AFFIX RECENT<br/>PASSPORT SIZE<br/>PHOTOGRAPH<br/>HERE</>
            )}
          </div>

          <div className="flex justify-between items-center text-sm font-bold mb-6">
            <div>Application ID: <span className="text-red-600">PENDING</span></div>
            <div style={{ marginRight: '140px' }}>Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>

          {/* 1. Examination Details */}
          <div className="section">
            <div className="section-header">1. Examination Details</div>
            <div className="field-group">
              <Field label="Exam Name" value={exam.exam_name} />
              <Field label="Exam Code" value={exam.exam_code} />
              <Field label="Academic Session" value={new Date().getFullYear()} />
              <Field label="Exam Year" value={new Date().getFullYear()} />
              <Field label="Candidate Type" value="Regular Candidate" />
              <Field label="Exam Fees Paid" value={`₹ ${exam.exam_fees}.00`} />
              <Field label="Fee Receipt Number" value={`MRS-RCPT-${Math.floor(Math.random()*9000)+1000}`} />
              <div style={{ gridColumn: 'span 2' }}>
                <span className="label block border-b pb-1 mb-2">Papers included in this Examination</span>
                <table className="paper-table">
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
                         <td style={{ textAlign: 'center' }}>{String(i+1).padStart(2, '0')}</td>
                         <td style={{ fontWeight: 'bold' }}>{paper.name}</td>
                         <td>{paper.maxMarks}</td>
                       </tr>
                     )) : [...Array(exam.no_of_papers || 1)].map((_, i) => (
                       <tr key={i}>
                         <td style={{ textAlign: 'center' }}>{String(i+1).padStart(2, '0')}</td>
                         <td style={{ fontWeight: 'bold' }}>Paper {i+1}</td>
                         <td>—</td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* 2. Personal Information */}
          <div className="section text-left">
            <div className="section-header">2. Student Personal Information</div>
            <div className="field-group">
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Student Full Name (Last, First, Middle)" value={`${student.lastName}, ${student.firstName} ${student.middleName || ""}`} />
              </div>
              <Field label="Father's / Guardian's Name" value={profile?.fatherName || "—"} />
              <Field label="Mother's Name" value={profile?.motherName || "—"} />
              <Field label="Date of Birth" value={profile?.dateOfBirth || "—"} />
              <Field label="Age (as of Jan 1st)" value="—" />
              <Field label="Gender" value={profile?.gender || "—"} />
              <Field label="Category" value={profile?.category || "—"} />
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Permanent / Communication Address" 
                  value={profile?.address ? 
                    `${profile.address.line1}${profile.address.line2 ? ', ' + profile.address.line2 : ''}, ${profile.address.villageOrCity}, ${profile.address.taluka ? profile.address.taluka + ', ' : ''}${profile.address.district}, ${profile.address.state} - ${profile.address.pincode}` 
                    : "—"
                  } 
                />
              </div>
              <Field label="Mother Tongue" value={student.motherTongue || "—"} />
              <Field label="Contact Number" value={student.contact} />
            </div>
          </div>

          {/* 3. Academic Details */}
          <div className="section text-left">
            <div className="section-header">3. Contact & Academic Details</div>
            <div className="field-group">
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="School / Institute Name" value={student.schoolName || "—"} />
              </div>
              <Field label="Class / Standard" value="—" />
              <Field label="Medium of Instruction" value={medium} />
              <Field label="Category" value={category} />
              <Field label="Exam Centre" value="—" />
              <Field label="Email Address" value={student.email} />
              
              {profile?.previousExamName && (
                <div style={{ gridColumn: 'span 2', marginTop: '10px' }}>
                  <span className="label block border-b pb-1 mb-2">Previous Exam Details</span>
                  <table className="paper-table">
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
                        <td>{profile.previousExamRollNo}</td>
                        <td>Passed ({profile.previousExamMarks}%)</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Office Use Section */}
          <div className="section" style={{ border: '2px solid #2d3748', backgroundColor: '#f8fafc' }}>
            <div className="section-header" style={{ backgroundColor: '#2d3748', color: 'white' }}>FOR OFFICE USE ONLY</div>
            <div className="grid grid-cols-3 gap-6 p-4">
              <div className="flex flex-col">
                <span className="label">Assigned Roll Number</span>
                <div className="h-6 border-b border-dashed"></div>
              </div>
              <div className="flex flex-col">
                <span className="label">Registration Number</span>
                <div className="h-6 border-b border-dashed"></div>
              </div>
              <div className="flex flex-col">
                <span className="label">Date of Receipt</span>
                <div className="h-6 border-b border-dashed"></div>
              </div>
            </div>
          </div>

          {/* 4. Declaration & Authorization */}
          <div className="section text-left">
            <div className="section-header">4. Declaration & Authorization</div>
            <div className="p-4 text-[11px] text-justify text-slate-600 leading-tight">
              I hereby declare that all the statements made in this application are true, complete and correct to the best of my knowledge and belief. I understand that in the event of any information being found false or incorrect, my candidature/application is liable to be cancelled or rejected.
            </div>
            <div className="stamp-signature">
              <div className="sign-box">
                {profile?.signatureUrl ? (
                  <img src={profile.signatureUrl} alt="Signature" className="max-h-full p-2 object-contain" />
                ) : (
                  <span className="opacity-30">CANDIDATE SIGN</span>
                )}
                <span>Signature of Candidate</span>
              </div>
              <div className="sign-box">
                {principalSigUrl ? (
                  <img src={principalSigUrl} alt="Principal Signature" className="max-h-16 p-1 object-contain" />
                ) : (
                  <span className="opacity-30">SIGN AREA</span>
                )}
                {schoolStampUrl && (
                  <img src={schoolStampUrl} alt="School Stamp" className="max-h-10 p-1 object-contain" />
                )}
                <span>Principal's Signature &amp; Stamp</span>
              </div>
              <div className="sign-box">
                {exam.controllerSignatureUrl ? (
                  <img src={exam.controllerSignatureUrl} alt="Controller Signature" className="max-h-16 p-1 object-contain" />
                ) : (
                  <span className="opacity-30">STAMP AREA</span>
                )}
                {exam.boardSealUrl && (
                  <img src={exam.boardSealUrl} alt="Board Seal" className="max-h-10 p-1 object-contain" />
                )}
                <span>Sabha Authorized Stamp</span>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="instruction-box text-left no-print">
            <strong className="text-xs uppercase">Important Instructions:</strong>
            <ul className="list-disc ml-5 mt-2 space-y-1">
              <li>Verify all personal and academic details before final submission.</li>
              <li>Signature and Attestation are mandatory for physical form submissions.</li>
              <li>Online submission acts as an intent to appear for the exam.</li>
            </ul>
          </div>

          {/* Submission Footer - No Print */}
          <div className="pt-10 border-t-2 border-slate-100 mt-10 no-print flex flex-col items-center">

            {/* Medium & Category selection */}
            <div className="w-full grid grid-cols-2 gap-4 mb-6">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">Medium of Instruction</label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                  <option value="English">English</option>
                  <option value="Urdu">Urdu</option>
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-bold uppercase text-slate-500">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="border border-slate-200 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-400"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="NT">NT</option>
                  <option value="SBC">SBC</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>

            <label className="flex items-center gap-3 cursor-pointer mb-6">
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => {setAgreed(e.target.checked); if(e.target.checked) setError("");}}
                className={`h-5 w-5 rounded border-slate-300 text-indigo-600 ${error ? 'ring-2 ring-red-500' : ''}`}
              />
              <span className="text-sm font-bold text-slate-700">I agree to the declaration and examination rules.</span>
            </label>
            
            {error && <p className="text-red-500 text-xs font-bold mb-4">{error}</p>}

            <div className="flex gap-4 w-full">
              <button onClick={onClose} className="flex-1 py-4 border-2 border-slate-200 text-slate-500 font-bold rounded-xl hover:bg-slate-50 transition-all">
                Cancel
              </button>
              <button onClick={handleSubmit} className="flex-[2] bg-indigo-600 text-white py-4 rounded-xl font-black text-lg shadow-xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform hover:-translate-y-1">
                Submit Application
              </button>
            </div>
          </div>

          <p className="text-center mt-10 text-[9px] text-slate-400 font-medium">
            Generated on {new Date().toLocaleString()} | System ID: MRS-{Math.floor(Math.random()*99999)}
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* --- Helper --- */
const Field = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="label">{label}</span>
    <div className="value">{value || "—"}</div>
  </div>
);

export default ApplyModal;
