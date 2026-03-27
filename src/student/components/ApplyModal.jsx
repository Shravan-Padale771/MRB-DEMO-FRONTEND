import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Printer, CheckCircle, AlertCircle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { createExamApplication, getStudentProfileByStudentIdString } from "../../api";

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
        const data = await getStudentProfileByStudentIdString(student.studentId);
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

  
  const renderModernView = () => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -30 }}
      className="max-w-[850px] mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden font-sans border border-slate-200"
    >
      {/* Header Area */}
      <div className="bg-gradient-to-r from-blue-600 to-[#1b223c] p-10 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl -mr-10 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="w-24 h-24 bg-white rounded-2xl shadow-lg p-2 flex items-center justify-center shrink-0 border border-blue-400/30">
            {(exam.boardLogoUrl || exam.boardSealUrl) ? (
              <img src={exam.boardLogoUrl || exam.boardSealUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-3xl font-black text-slate-800 tracking-tighter">MRB</span>
            )}
          </div>
          <div className="flex-1 text-center md:text-left">
            <span className="inline-block px-3 py-1 bg-blue-500/30 backdrop-blur-md border border-blue-400/50 rounded-full text-[10px] font-bold tracking-widest uppercase mb-3">
              Exam Application Portal
            </span>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-2 leading-tight">{exam.exam_name}</h1>
            <p className="text-blue-100/80 font-medium text-sm md:text-base flex items-center justify-center md:justify-start gap-2">
              <Calendar size={16} /> Maharashtra Rashtrabhasha Sabha, Pune &bull; {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-10 space-y-10 bg-slate-50/50">
        {/* Candidate Info Card */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><User size={20} /></div>
            <h2 className="text-xl font-bold text-slate-800">Candidate Information</h2>
          </div>
          
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-8">
            <div className="w-32 h-40 shrink-0 bg-slate-50 rounded-xl border border-slate-200 overflow-hidden shadow-inner flex items-center justify-center text-slate-400 text-xs text-center p-4">
              {profile?.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt="Photo" className="w-full h-full object-cover" />
              ) : "No Photo Available"}
            </div>
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Student ID</p>
                <p className="font-semibold text-slate-800">{student.studentId || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Full Name</p>
                <p className="font-semibold text-slate-800">
                  {student.firstName ? `${student.firstName} ${student.middleName || ''} ${student.lastName || ''}`.trim() : (student.username || "—")}
                </p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date of Birth</p>
                <p className="font-semibold text-slate-800">{profile?.dateOfBirth || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact / Email</p>
                <p className="font-semibold text-slate-800">{profile?.guardianContact || "—"} / {profile?.guardianEmail || "—"}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Father / Mother</p>
                <p className="font-semibold text-slate-800">{profile?.fatherName || "—"} / {profile?.motherName || "—"}</p>
              </div>
              <div className="col-span-1 md:col-span-2">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Address & Aadhaar</p>
                <p className="font-semibold text-slate-800">
                  {profile?.address ? Object.values(profile.address).filter(Boolean).join(', ') : "—"} | <span className="text-slate-500 font-normal">UIDAI: {profile?.aadhaarNo || "—"}</span>
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Papers / Subjects Card */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg"><CheckSquare size={20} /></div>
            <h2 className="text-xl font-bold text-slate-800">Selected Papers</h2>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {papers.map((p, idx) => (
              <div key={idx} className={`p-4 md:p-5 flex items-center justify-between ${idx !== papers.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 font-bold text-xs">
                    {idx + 1}
                  </div>
                  <span className="font-bold text-slate-700">{p.name}</span>
                </div>
                <div className="px-3 py-1 bg-slate-100 rounded-full text-xs font-bold text-slate-500">
                  {p.maxMarks} Marks
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Form Options */}
        <section>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Examination Medium</label>
              <select value={medium} onChange={(e) => setMedium(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                <option value="Hindi">Hindi</option>
                <option value="Marathi">Marathi</option>
                <option value="English">English</option>
                <option value="Urdu">Urdu</option>
              </select>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Candidature Category</label>
              <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-slate-50 border border-slate-200 text-slate-800 rounded-xl px-4 py-3 font-semibold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all">
                <option value="General">General</option>
                <option value="OBC">OBC</option>
                <option value="SC">SC</option>
                <option value="ST">ST</option>
                <option value="EWS">EWS</option>
              </select>
            </div>
          </div>
        </section>

        {/* Signatures Review */}
        <section>
          <div className="flex items-center gap-3 mb-5">
            <div className="p-2 bg-amber-100 text-amber-600 rounded-lg"><FileSignature size={20} /></div>
            <h2 className="text-xl font-bold text-slate-800">Verification / Signatures</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center gap-2 h-32">
              {profile?.signatureUrl ? (
                <img src={profile.signatureUrl} alt="Sign" className="max-h-12 opacity-80" />
              ) : <span className="text-xs text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">Missing</span>}
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Candidate</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center gap-2 h-32">
              {principalSigUrl ? (
                <img src={principalSigUrl} alt="Sign" className="max-h-12 opacity-80" />
              ) : <span className="text-xs text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">Missing</span>}
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Principal</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center text-center gap-2 h-32 col-span-2 md:col-span-1">
              {schoolStampUrl ? (
                <img src={schoolStampUrl} alt="Sign" className="max-h-12 opacity-80" />
              ) : <span className="text-xs text-amber-500 font-bold bg-amber-50 px-2 py-1 rounded">Missing</span>}
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">School Stamp</span>
            </div>
          </div>
        </section>

        {/* Submission Area */}
        <div className="mt-10 bg-white p-8 rounded-2xl border-2 border-blue-100 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 left-0 w-2 h-full bg-blue-500"></div>
          
          <label className="flex items-start gap-4 cursor-pointer group mb-6">
            <div className="mt-1 relative flex items-center justify-center">
              <input type="checkbox" checked={agreed} onChange={(e) => {setAgreed(e.target.checked); if(e.target.checked) setError("");}} className="w-6 h-6 peer appearance-none border-2 border-slate-300 rounded-lg checked:border-blue-500 checked:bg-blue-500 transition-all cursor-pointer shadow-sm" />
              <CheckCircle size={16} className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" />
            </div>
            <div>
              <span className="text-base font-bold text-slate-800 group-hover:text-blue-600 transition-colors">I confirm all details are authentic and true.</span>
              <p className="text-xs text-slate-500 mt-1">By checking this box, I acknowledge that any falsification of records may result in disqualification from the exam session without refund.</p>
            </div>
          </label>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100 text-sm font-bold flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-100">
            <button onClick={onClose} className="px-6 py-4 rounded-xl font-bold text-slate-500 bg-slate-50 hover:bg-slate-100 transition-colors">
              Cancel
            </button>
            <button onClick={handleSubmit} className="flex-1 flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 transition-all">
              Submit Digital Application <ChevronRight size={20} />
            </button>
          </div>
        </div>

      </div>
    </motion.div>
  );

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-slate-200/90 backdrop-blur-sm z-50 overflow-y-auto p-4 sm:p-10 print:p-0 print:bg-white print:relative print:overflow-visible">
        <style dangerouslySetInnerHTML={{ __html: `
          @media print {
            @page { size: A4; margin: 10mm; }
            body { background: white; margin: 0; padding: 0; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .no-print { display: none !important; }
            
          .modal-container.paper-mode {
            background-color: #fdfbf7 !important;
            background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png") !important;
            background-blend-mode: multiply !important;
            border: 1px solid #e5e0d5 !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
          }

          .modal-container { box-shadow: none !important; border: 1px solid #cbd5e0 !important; margin: 0 !important; width: 100% !important; max-width: 100% !important; padding: 20px !important; transform: none !important; position: static !important; }
            .photo-box { top: 80px !important; right: 20px !important; }
          }
          
          .modal-container.paper-mode {
            background-color: #fdfbf7 !important;
            background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png") !important;
            background-blend-mode: multiply !important;
            border: 1px solid #e5e0d5 !important;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25) !important;
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
          .header { text-align: center; border-bottom: 2px solid #4c84ff; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #1e293b; font-size: 24px; text-transform: uppercase; letter-spacing: 1px; font-weight: 800; }
          .header p { margin: 5px 0; font-size: 14px; color: #64748b; }
          .section { margin-bottom: 25px; border: 1px solid #cbd5e0; border-radius: 4px; overflow: hidden; }
          .section-header { background-color: #f8fafc; padding: 10px 15px; font-weight: bold; text-transform: uppercase; font-size: 13px; border-bottom: 1px solid #cbd5e0; color: #1e293b; }
          .field-group-form { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; padding: 15px; }
          .label-form { font-size: 11px; color: #64748b; text-transform: uppercase; margin-bottom: 4px; font-weight: 700; }
          .value-form { font-size: 14px; font-weight: 500; color: #1e293b; min-height: 20px; padding-bottom: 2px; border-bottom: 1px dashed #e2e8f0; }
          .photo-box { width: 120px; height: 150px; border: 2px dashed #cbd5e1; display: flex; align-items: center; justify-content: center; text-align: center; font-size: 12px; color: #64748b; position: absolute; top: 100px; right: 40px; background: #fafafa; }
          .paper-table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 13px; text-align: left; }
          .paper-table th, .paper-table td { border: 1px solid #cbd5e0; padding: 8px 12px; }
          .paper-table th { background-color: #f8fafc; font-weight: 600; color: #475569; text-transform: uppercase; font-size: 11px; }
          .stamp-signature { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; margin-top: 20px; padding: 15px; }
          .sign-box { height: 100px; border: 1px solid #cbd5e0; display: flex; flex-direction: column; justify-content: flex-end; align-items: center; padding-bottom: 10px; font-size: 12px; color: #475569; background-color: #fafafa; }
          .instruction-box { margin-top: 30px; font-size: 12px; color: #92400e; background: #fffbeb; padding: 15px; border: 1px solid #fef3c7; border-radius: 4px; }
        `}} />

        <div className="max-w-[850px] w-full mx-auto mb-6 flex justify-between items-center no-print bg-white p-3 rounded-xl shadow-sm border border-slate-200 font-sans sticky top-0 z-[100] print:hidden">
           <div className="flex bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setViewMode('paper')} className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${viewMode === 'paper' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}><FileText size={16}/> Paper Form</button>
             <button onClick={() => setViewMode('modern')} className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${viewMode === 'modern' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}><LayoutDashboard size={16}/> Modern UI</button>
           </div>
           
           <div className="flex gap-2">
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-lg transition-colors">
              <Printer size={16} /> Print
            </button>
            <button onClick={onClose} className="flex items-center justify-center w-8 h-8 bg-rose-50 hover:bg-rose-100 text-rose-500 rounded-lg transition-colors">
              <X size={18} />
            </button>
           </div>
        </div>

        {viewMode === 'paper' ? (
          <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          className="modal-container paper-mode"
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
            <p style={{ fontWeight: 'bold', marginTop: '10px', fontSize: '16px', color: '#10b981' }}>EXAMINATION APPLICATION FORM</p>
          </div>

          <div className="photo-box">
            {profile?.profilePhotoUrl ? (
              <img src={profile.profilePhotoUrl} alt="Passport Size" className="w-full h-full object-cover" />
            ) : (
              <>AFFIX RECENT<br/>PASSPORT SIZE<br/>PHOTOGRAPH<br/>HERE</>
            )}
          </div>

          <div className="flex justify-between items-center text-sm font-bold mb-6">
            <div className="flex items-center gap-2">Status: <span style={s.statusPill}>APPLYING</span></div>
            <div style={{ marginRight: '140px' }}>Date: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
          </div>

          {/* 1. Examination Details */}
          <div className="section">
            <div className="section-header">1. Examination Details</div>
            <div className="field-group-form">
              <Field label="Exam Name" value={exam.exam_name} />
              <Field label="Exam Code" value={exam.exam_code} />
              <Field label="Academic Session" value={new Date().getFullYear()} />
              <Field label="Exam Year" value={new Date().getFullYear()} />
              <Field label="Candidate Type" value="Regular Candidate" />
              <Field label="Exam Fees Payable" value={`₹ ${exam.exam_fees}.00`} />
              <div style={{ gridColumn: 'span 2' }}>
                <span className="label-form block border-b pb-1 mb-2">SCHEME OF EXAMINATION (PAPERS)</span>
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
            <div className="field-group-form">
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Candidate Name" value={`${student.lastName}, ${student.firstName} ${student.middleName || ""}`} />
              </div>
              <Field label="Father's / Guardian" value={profile?.fatherName || "—"} />
              <Field label="Mother's Name" value={profile?.motherName || "—"} />
              <Field label="Date of Birth" value={profile?.dateOfBirth || "—"} />
              <Field label="Gender" value={profile?.gender || "—"} />
              <Field label="Category" value={profile?.category || "—"} />
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="Mailing Address" 
                  value={profile?.address ? 
                    `${profile.address.line1}, ${profile.address.villageOrCity}, ${profile.address.district}, ${profile.address.state} - ${profile.address.pincode}` 
                    : "—"
                  } 
                />
              </div>
              <Field label="Contact Number" value={student.contact} />
              <Field label="Aadhar Profile ID" value={profile?.idProofNumber || "PENDING"} />
            </div>
          </div>

          {/* 3. Academic Details */}
          <div className="section text-left">
            <div className="section-header">3. Application Preferences</div>
            <div className="field-group-form">
              <div style={{ gridColumn: 'span 2' }}>
                <Field label="School / Institute Name" value={student.schoolName || "NOT REGISTERED"} />
              </div>
              <Field label="Medium Opted" value={medium.toUpperCase()} />
              <Field label="Application Category" value={category.toUpperCase()} />
              <Field label="Registered Email" value={student.email} />
            </div>
          </div>

          {/* Office Use Section */}
          <div className="section" style={{ border: '2px solid #2d3748', backgroundColor: '#f8fafc' }}>
            <div className="section-header" style={{ backgroundColor: '#2d3748', color: 'white' }}>FOR OFFICE USE ONLY</div>
            <div className="grid grid-cols-3 gap-6 p-4">
              <div className="flex flex-col">
                <span className="label-form">Assigned Roll Number</span>
                <div className="h-6 border-b border-dashed"></div>
              </div>
              <div className="flex flex-col">
                <span className="label-form">Registration Number</span>
                <div className="h-6 border-b border-dashed"></div>
              </div>
              <div className="flex flex-col">
                <span className="label-form">Date of Receipt</span>
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
                <span>Candidate Signature</span>
              </div>
              <div className="sign-box" style={{ backgroundColor: 'transparent', border: 'none', position: 'relative' }}>
                {schoolStampUrl && (
                  <img src={schoolStampUrl} alt="School Stamp" className="absolute opacity-20 max-w-full max-h-[80px] object-contain" />
                )}
                {principalSigUrl ? (
                  <img src={principalSigUrl} alt="Principal Signature" className="max-h-[60px] p-1 object-contain mb-1 z-10" />
                ) : (
                  <span className="opacity-30">OFFICIAL STAMP</span>
                )}
                <span className="z-10" style={{ fontSize: '10px', fontWeight: 'bold' }}>Principal Signature</span>
              </div>
              <div className="sign-box" style={{ backgroundColor: 'transparent', border: 'none' }}>
                {(exam.boardLogoUrl || exam.boardSealUrl) ? (
                  <img src={exam.boardLogoUrl || exam.boardSealUrl} alt="Sabha Seal" className="max-h-[70px] p-1 object-contain opacity-50 mb-1" />
                ) : (
                  <span className="opacity-30">SABHA SEAL</span>
                )}
                <span style={{ fontSize: '10px', fontWeight: 'bold' }}>Authorized Official</span>
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

          {/* submission footer */}
          <div style={s.submissionFooter} className="no-print">
            <div style={s.selectionGrid}>
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>VERIFY MEDIUM</label>
                <select
                  value={medium}
                  onChange={(e) => setMedium(e.target.value)}
                  style={s.select}
                >
                  <option value="Hindi">Hindi</option>
                  <option value="Marathi">Marathi</option>
                  <option value="English">English</option>
                  <option value="Urdu">Urdu</option>
                </select>
              </div>
              <div style={s.fieldGroup}>
                <label style={s.fieldLabel}>VERIFY CATEGORY</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  style={s.select}
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>

            <label style={s.agreeLabel}>
              <input 
                type="checkbox" 
                checked={agreed} 
                onChange={(e) => {setAgreed(e.target.checked); if(e.target.checked) setError("");}}
                style={s.checkbox}
              />
              <span style={s.agreeText}>I confirm all details are correct as per my board records.</span>
            </label>
            
            {error && <div style={s.errorBox}><AlertCircle size={14} /> {error}</div>}

            <div style={s.actionRow}>
              <button onClick={onClose} style={s.footerCancelBtn}>
                CANCEL
              </button>
              <button 
                onClick={handleSubmit} 
                style={s.footerSubmitBtn}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#3b6ddb'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#4c84ff'}
              >
                SUBMIT FINAL APPLICATION <ArrowRight size={18} />
              </button>
            </div>
          </div>

          <p className="text-center mt-10 text-[9px] text-slate-400 font-medium tracking-widest uppercase">
            ELECTRONICALLY GENERATED ON {new Date().toLocaleString()} | MRS PORTAL IDENTITY: {Math.floor(Math.random()*99999)}
          </p>
        </motion.div>
        ) : renderModernView()}
      </div>
    </AnimatePresence>
  );
}


const Field = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="label-form">{label}</span>
    <div className="value-form">{value || "—"}</div>
  </div>
);

/* --- Header Styles for Modern UI --- */
const s = {
    controls: {
        maxWidth: '850px',
        margin: '0 auto 24px auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontFamily: 'DM Sans, Segoe UI, sans-serif'
    },
    controlsLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
    badge: {
        backgroundColor: '#4c84ff',
        color: '#fff',
        padding: '5px 10px',
        borderRadius: '6px',
        fontSize: '10px',
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    controlsText: { fontSize: '13px', fontWeight: '800', color: '#475569', letterSpacing: '0.02em' },
    controlsRight: { display: 'flex', gap: '12px', alignItems: 'center' },
    secondaryBtn: {
        backgroundColor: '#fff',
        color: '#475569',
        padding: '10px 16px',
        borderRadius: '8px',
        fontSize: '11px',
        fontWeight: '900',
        letterSpacing: '0.05em',
        border: '1px solid #e2e8f0',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    closeBtn: {
        backgroundColor: '#fff',
        color: '#94a3b8',
        padding: '10px',
        borderRadius: '8px',
        border: '1px solid #f1f5f9',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        transition: 'all 0.2s ease'
    },
    statusPill: {
        backgroundColor: '#f0fdfa',
        color: '#0f766e',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '11px',
        border: '1px solid #ccfbf1',
        fontWeight: '900'
    },
    submissionFooter: {
        marginTop: '40px',
        padding: '32px',
        backgroundColor: '#f8fafc',
        borderRadius: '16px',
        border: '1px solid #f1f5f9',
        display: 'flex',
        flexDirection: 'column',
    },
    selectionGrid: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '24px',
        marginBottom: '24px'
    },
    fieldGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
    fieldLabel: { fontSize: '10px', fontWeight: '900', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em' },
    select: {
        height: '42px',
        padding: '0 12px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#fff',
        fontSize: '13px',
        color: '#1e293b',
        fontWeight: '600',
        outline: 'none',
        cursor: 'pointer'
    },
    agreeLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: 'pointer',
        marginBottom: '32px'
    },
    checkbox: { width: '20px', height: '20px', cursor: 'pointer', accentColor: '#4c84ff' },
    agreeText: { fontSize: '14px', fontWeight: '700', color: '#1e293b' },
    errorBox: { 
        padding: '12px', 
        backgroundColor: '#fef2f2', 
        color: '#b91c1c', 
        borderRadius: '8px', 
        fontSize: '12px', 
        fontWeight: '700', 
        marginBottom: '24px', 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        border: '1px solid #fee2e2'
    },
    actionRow: { display: 'flex', gap: '16px' },
    footerCancelBtn: {
        flex: 1,
        padding: '14px',
        borderRadius: '8px',
        backgroundColor: '#fff',
        color: '#64748b',
        fontSize: '11px',
        fontWeight: '900',
        letterSpacing: '0.05em',
        border: '1px solid #e2e8f0',
        cursor: 'pointer'
    },
    footerSubmitBtn: {
        flex: 2,
        padding: '14px',
        borderRadius: '8px',
        backgroundColor: '#4c84ff',
        color: '#fff',
        fontSize: '12px',
        fontWeight: '900',
        letterSpacing: '0.1em',
        border: 'none',
        cursor: 'pointer',
        boxShadow: '0 4px 12px rgba(76, 132, 255, 0.2)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        transition: 'all 0.2s ease'
    }
};

export default ApplyModal;
