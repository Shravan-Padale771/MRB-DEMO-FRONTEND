import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Printer, X, LayoutDashboard, FileText, CheckCircle, AlertCircle, Award, Target, BookOpen } from 'lucide-react'

const Marksheet = ({ result, onClose }) => {
  const [viewMode, setViewMode] = useState('modern')
  if (!result) return null

  const app = result.application || {}
  const exam = app.exam || {}
  const student = app.student || {}

  let resultData = {}
  try {
    resultData = typeof result.resultData === 'string'
      ? JSON.parse(result.resultData || '{}')
      : (result.resultData || {})
  } catch (e) {
    console.error("Error parsing resultData:", e)
  }

  let examDetails = {}
  try {
    examDetails = typeof exam.exam_details === 'string'
      ? JSON.parse(exam.exam_details || '{}')
      : (exam.exam_details || {})
  } catch (e) {
    console.error("Error parsing exam_details:", e)
  }

  const identity = {
    conductingBody: examDetails.identity?.conductingBody || "महाराष्ट्र राष्ट्रभाषा सभा, पुणे",
    examFullTitle: examDetails.identity?.examFullTitle || "राष्ट्रभाषा प्रवीण परीक्षा",
    recognitionText: examDetails.identity?.recognitionText || "भारत सरकार द्वारा मान्य, इंटर स्तर की हिंदी के समकक्ष"
  }

  const admin = {
    signatoryName: examDetails.administrative?.signatoryName || "सौ. सुनीता कुलकर्णी",
    signatoryDesignation: examDetails.administrative?.signatoryDesignation || "सचिव, परीक्षा विभाग",
    departmentName: examDetails.administrative?.departmentName || "महाराष्ट्र राष्ट्रभाषा भवन, पुणे",
    marksCalculationNote: examDetails.administrative?.marksCalculationNote || "मात्र हिंदी के लिखित प्रश्नपत्रों के अंकों के आधार पर परिणाम घोषित किया जाता है।"
  }

  const schedule = {
    session: examDetails.schedule?.session || "सितंबर - 2024"
  }

  const rules = {
    gradingScheme: {
      firstClass: examDetails.rules?.gradingScheme?.firstClass || "300 से ऊपर",
      secondClass: examDetails.rules?.gradingScheme?.secondClass || "250 से 299",
      thirdClass: examDetails.rules?.gradingScheme?.thirdClass || "175 से 249"
    }
  }

  const resultDate = examDetails.resultDate || "05/12/2024"

  const handlePrint = () => window.print()

  // Process Breakdown into Papers, Oral, and Project
  let examPapers = []
  try {
    examPapers = typeof exam.papers === 'string'
      ? JSON.parse(exam.papers || '[]')
      : (exam.papers || [])
  } catch (e) {
    console.error("Error parsing exam.papers:", e)
  }

  const breakdown = resultData.breakdown || {}

  // Map marks to defined papers
  const mainPapers = examPapers.map(paperDef => {
    // Try to find marks by name match (case insensitive/trimmed)
    const marks = breakdown[paperDef.name] ||
      breakdown[paperDef.name.trim()] ||
      Object.entries(breakdown).find(([k]) => k.toLowerCase() === paperDef.name.toLowerCase())?.[1] ||
      0
    return {
      name: paperDef.name,
      maxMarks: paperDef.maxMarks,
      obtained: marks
    }
  })

  // Fallback if mainPapers is empty but breakdown has items
  if (mainPapers.length === 0 && Object.keys(breakdown).length > 0) {
    Object.entries(breakdown).forEach(([k, v]) => {
      if (k.includes('प्रश्नपत्र') || k.includes('Paper')) {
        mainPapers.push({ name: k, maxMarks: 100, obtained: v })
      }
    })
  }

  const oralMarks = resultData.oralMarks || breakdown.oralMarks || breakdown['मौखिक'] || 0
  const projectMarks = breakdown.projectMarks || breakdown['परियोजना'] || 0
  const computedTotalMax = mainPapers.reduce((sum, p) => sum + (p.maxMarks || 0), 0)

  // Status computation for Modern View
  const isPass = resultData.remarks === 'Pass' || resultData.remarks === 'उत्तीर्ण'
  const isFail = resultData.remarks === 'Fail' || resultData.remarks === 'अनुत्तीर्ण'

  const totalScore = resultData.totalObtained || resultData.score
  const totalMaxScore = computedTotalMax || resultData.totalMax
  const scorePercent = ((totalScore / totalMaxScore) * 100).toFixed(1)

  const renderPaperView = () => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        style={{
          backgroundColor: '#fdfbf7',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")`,
          backgroundBlendMode: 'multiply'
        }}
        className="w-full relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)] print:shadow-none min-h-[1100px] border border-[#e5e0d5] rounded-sm p-12 font-serif text-[#1a1a1a]"
      >
        {/* DOCUMENT HEADER */}
        <div className="text-center space-y-1 mb-10">
          <h1 className="text-2xl font-bold">
            {identity.conductingBody}
          </h1>
          <h2 className="text-xl font-bold">
            {identity.examFullTitle}
          </h2>
          <p className="text-sm font-medium">
            ( {identity.recognitionText} )
          </p>
          <div className="pt-4">
            <span className="text-2xl font-bold border-b border-black pb-0.5 px-8">
              अंक - सूची
            </span>
          </div>
        </div>

        {/* METADATA SECTION */}
        <div className="flex justify-between mb-8 text-[17px]">
          <div className="space-y-2 w-2/3">
            <div className="flex">
              <span className="w-32">परीक्षार्थी का नाम</span>
              <span className="flex-grow font-bold">: {resultData.fullName || (student.firstName ? `${student.firstName} ${student.middleName || ''} ${student.lastName || ''}`.trim() : student.username)}</span>
            </div>
            <div className="flex">
              <span className="w-32">परीक्षा केंद्र</span>
              <span className="flex-grow font-bold">: {student.centreName || (typeof student.school?.examCentre?.centreName === 'string' ? student.school.examCentre.centreName : admin.departmentName)}</span>
            </div>
          </div>
          <div className="space-y-2 w-1/3">
            <div className="flex justify-end">
              <span className="w-20">क्रमांक</span>
              <span className="w-32 font-bold text-right">: {app.applicationId || "—"}</span>
            </div>
            <div className="flex justify-end">
              <span className="w-16">सत्र</span>
              <span className="w-32 font-bold text-right">: {schedule.session}</span>
            </div>
            <div className="flex justify-end">
              <span className="w-16">प्रतिशत</span>
              <span className="w-32 font-bold text-right">: {scorePercent}%</span>
            </div>
          </div>
        </div>

        {/* INTRO TEXT */}
        <div className="text-center font-bold mb-6 text-[16px]">
          {identity.examFullTitle} में प्राप्त किए अंकों का प्रश्नपत्र के अनुसार विवरण
        </div>

        {/* MARKS TABLE */}
        <div className="border-t border-black mb-1"></div>
        <table className="w-full text-left text-[17px] border-collapse">
          <tbody>
            {mainPapers.map((paper, idx) => (
              <tr key={idx} className="h-10">
                <td className="w-56 py-1 pr-6">{paper.name}</td>
                <td className="w-52 py-1">
                  कुल अंक {paper.maxMarks} <span className="inline-block border border-black w-4 h-4 text-center leading-3 text-[11px] font-bold ml-1">{idx < 4 ? 'I' : ''}</span>
                </td>
                <td className="w-32 py-1">प्राप्त अंक</td>
                <td className="font-bold py-1 text-lg">{paper.obtained}</td>
              </tr>
            ))}

            <tr className="border-t border-black h-10 font-bold">
              <td>कुल</td>
              <td>{totalMaxScore}/</td>
              <td></td>
              <td>{totalScore}</td>
            </tr>
          </tbody>
        </table>
        <div className="border-b border-black mb-4"></div>

        {/* ORAL & PROJECT SECTION */}
        <div className="flex justify-between text-[17px] mb-8 min-h-[60px]">
          <div className="space-y-1 w-2/3">
            {examDetails.structure?.hasOral && (
              <div className="flex gap-4">
                <span className="w-40">मौखिक परीक्षा</span>
                <span className="w-32">कुल अंक {examDetails.structure?.oralMax || 50} <span className="inline-block border border-black w-4 h-4 text-center leading-3 text-[12px] font-bold ml-1">ट</span></span>
                <span>प्राप्त अंक</span>
                <span className="font-bold">{oralMarks}</span>
              </div>
            )}
            {examDetails.structure?.hasProject && (
              <div className="flex gap-4">
                <span className="w-40">परियोजना</span>
                <span className="w-32">कुल अंक {examDetails.structure?.projectMax || 50}</span>
                <span>प्राप्त अंक</span>
                <span className="font-bold">{projectMarks}</span>
              </div>
            )}
            <div className="flex pt-2">
              <span className="italic">( {admin.marksCalculationNote} )</span>
              <span className="ml-4 font-bold">विशेष स्थान</span>
            </div>
          </div>
          <div className="w-1/3 flex flex-col justify-start pt-1">
            <div className="flex gap-2">
              <span>श्रेणी</span>
              <span className="font-bold text-lg">
                {resultData.remarks === 'Pass' ? 'उत्तीर्ण' : resultData.remarks === 'Fail' ? 'अनुत्तीर्ण' : resultData.remarks}
              </span>
            </div>
          </div>
        </div>

        {/* FINAL RESULT */}
        <div className="mb-8 text-[17px]">
          <span className="font-bold">परीक्षा फल</span>
        </div>

        {/* FOOTER SECTION */}
        <div className="relative">
          {/* Circular Seal */}
          <div className="absolute left-1/2 -translate-x-1/2 -top-12">
            <div className="w-20 h-20 border-2 border-black rounded-full flex items-center justify-center p-1">
              <div className="w-full h-full border border-black rounded-full flex items-center justify-center text-[10px] text-center font-bold px-1 uppercase scale-90">
                MRB SABHA PUNE
              </div>
            </div>
          </div>

          <div className="flex justify-between items-baseline pt-8">
            <div className="text-[17px]">
              <span className="font-bold">परीक्षा फल ता.</span> {resultDate}
            </div>
            <div className="text-center space-y-1">
              <p className="font-bold text-lg leading-tight">{admin.signatoryName}</p>
              <p className="font-bold text-sm border-t border-black pt-1">{admin.signatoryDesignation}</p>
            </div>
          </div>
        </div>

        {/* THRESHOLDS SECTION */}
        <div className="mt-8 pt-4 border-t border-black text-center text-[15px]">
          <div className="flex justify-center gap-10 font-bold mb-2">
            <span>तृतीय श्रेणी {rules.gradingScheme.thirdClass}, I</span>
            <span>द्वितीय श्रेणी {rules.gradingScheme.secondClass}, I</span>
            <span>प्रथम श्रेणी {rules.gradingScheme.firstClass}</span>
          </div>
          <p className="font-bold whitespace-pre-line">
            सूचना - रा.भा. पंडित परीक्षा के आवेदनपत्र के साथ इसकी प्रमाणित प्रतिलिपि भेजी जाए ।
          </p>
        </div>

        {/* Security Overlay */}
        {result && !result.publishedAt && (
          <div className="absolute inset-0 pointer-events-none border-[12px] border-red-500/5 z-[100] flex items-center justify-center overflow-hidden">
            <span className="text-[60px] font-bold text-red-500/5 -rotate-45 uppercase border-8 border-red-500/5 p-8 select-none">PREVIEW ONLY</span>
          </div>
        )}
      </motion.div>
  );

  const renderModernView = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="bg-slate-50 w-full min-h-[900px] rounded-3xl overflow-hidden shadow-2xl border border-slate-200"
    >
      {/* Dynamic Header */}
      <div className={`relative p-10 overflow-hidden ${isFail ? 'bg-gradient-to-r from-rose-600 to-rose-400' : isPass ? 'bg-gradient-to-r from-emerald-600 to-emerald-400' : 'bg-gradient-to-r from-blue-600 to-indigo-500'}`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white opacity-10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6 text-white">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-bold tracking-widest uppercase mb-4 border border-white/30">
              <Award size={14} /> Official Result Record
            </div>
            <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-2 drop-shadow-sm">{identity.examFullTitle}</h1>
            <p className="text-white/80 font-bold tracking-wider">{identity.conductingBody}</p>
          </div>

          <div className="bg-white text-slate-800 rounded-3xl p-6 shadow-xl flex flex-col items-center min-w-[200px] border-4 border-white/20 transform hover:scale-105 transition-transform duration-300">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-1">Total Score</span>
            <div className={`text-5xl font-black ${isFail ? 'text-rose-500' : 'text-emerald-500'} tracking-tighter`}>
              {totalScore}
            </div>
            <div className="text-sm font-bold text-slate-400 mt-1 uppercase tracking-widest bg-slate-100 px-3 py-1 rounded-full">
              Out of {totalMaxScore}
            </div>
          </div>
        </div>
      </div>

      <div className="p-8 md:p-12 space-y-8 max-w-5xl mx-auto">
        
        {/* Quick Highlights Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Verdict</span>
            {isPass ? (
              <div className="flex items-center gap-2 text-emerald-500 font-black text-xl bg-emerald-50 px-4 py-1 rounded-full"><CheckCircle size={20} /> PASS</div>
            ) : isFail ? (
              <div className="flex items-center gap-2 text-rose-500 font-black text-xl bg-rose-50 px-4 py-1 rounded-full"><AlertCircle size={20} /> FAIL</div>
            ) : (
               <div className="font-black text-xl text-slate-700">{resultData.remarks}</div>
            )}
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Percentage</span>
            <div className="font-black text-2xl text-slate-700">{scorePercent}%</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">App ID</span>
            <div className="font-black text-lg text-slate-700">#{app.applicationId || "—"}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center justify-center text-center">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Session</span>
            <div className="font-black text-lg text-slate-700">{schedule.session}</div>
          </div>
        </div>

        {/* Candidate Detail Card */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-4">
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Candidate Full Name</span>
              <span className="text-lg font-bold text-slate-800">{resultData.fullName || (student.firstName ? `${student.firstName} ${student.middleName || ''} ${student.lastName || ''}`.trim() : student.username)}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Registration Venue (Centre)</span>
              <span className="text-lg font-bold text-slate-800">{student.centreName || (typeof student.school?.examCentre?.centreName === 'string' ? student.school.examCentre.centreName : admin.departmentName)}</span>
            </div>
          </div>
          <div className="w-full md:w-32 h-32 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center shadow-inner shrink-0 overflow-hidden">
             {profile?.profilePhotoUrl ? (
                <img src={profile.profilePhotoUrl} alt="Candidate" className="w-full h-full object-cover" />
             ) : <Target size={32} className="text-slate-300"/>}
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div>
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 mb-4"><BookOpen size={20} className="text-blue-500" /> Score Breakdown By Subject</h3>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            {mainPapers.map((paper, idx) => (
              <div key={idx} className={`flex items-center justify-between p-5 ${idx !== mainPapers.length - 1 ? 'border-b border-slate-100' : ''}`}>
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm border border-blue-100">
                    P{idx + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 text-lg">{paper.name}</h4>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Maximum Marks: {paper.maxMarks}</p>
                  </div>
                </div>
                <div className="text-3xl font-black text-slate-700 w-24 text-right">
                  {paper.obtained}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Oral / Project if applicable */}
        {(examDetails.structure?.hasOral || examDetails.structure?.hasProject) && (
          <div className="bg-slate-800 rounded-2xl p-6 text-white shadow-xl bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-blend-soft-light relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl"></div>
            <div className="relative z-10 flex divide-x divide-white/20">
              {examDetails.structure?.hasOral && (
                <div className="flex-1 px-4 text-center">
                  <span className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Oral Evaluation</span>
                  <div className="text-3xl font-black text-emerald-400">{oralMarks} <span className="text-lg text-white/30">/ {examDetails.structure?.oralMax || 50}</span></div>
                </div>
              )}
              {examDetails.structure?.hasProject && (
                <div className="flex-1 px-4 text-center">
                  <span className="block text-[10px] font-bold text-white/50 uppercase tracking-widest mb-1">Project Score</span>
                  <div className="text-3xl font-black text-emerald-400">{projectMarks} <span className="text-lg text-white/30">/ {examDetails.structure?.projectMax || 50}</span></div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </motion.div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center overflow-y-auto print:p-0 print:bg-white p-4 font-sans">
      <div className="w-full max-w-[850px] m-auto flex flex-col pt-10 pb-10 print:pt-0 print:pb-0">
        
        {/* View Controls - Hidden on Print */}
        <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 mb-6 flex justify-between items-center print:hidden z-20 sticky top-4 max-w-[850px] w-full mx-auto">
          <div className="flex bg-slate-100 p-1 rounded-lg">
             <button onClick={() => setViewMode('modern')} className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${viewMode === 'modern' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}><LayoutDashboard size={16}/> Modern UI</button>
             <button onClick={() => setViewMode('paper')} className={`px-5 py-2.5 text-[11px] font-black uppercase tracking-wider rounded-md transition-all flex items-center gap-2 ${viewMode === 'paper' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}><FileText size={16}/> Trad. Paper</button>
          </div>
          <div className="flex gap-2">
             <button onClick={handlePrint} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 font-bold text-[11px] uppercase tracking-wider rounded-lg transition-all"><Printer size={16} /> Print</button>
             <button onClick={onClose} className="flex items-center justify-center p-2 bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-700 rounded-lg transition-colors"><X size={20} /></button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {viewMode === 'paper' ? renderPaperView() : renderModernView()}
        </AnimatePresence>

      </div>
    </div>
  )
}

export default Marksheet
