import React from 'react'
import { motion } from 'framer-motion'
import { Printer, X } from 'lucide-react'

const Marksheet = ({ result, onClose }) => {
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

  const identity = examDetails.identity || {
    conductingBody: "महाराष्ट्र राष्ट्रभाषा सभा, पुणे",
    examFullTitle: "राष्ट्रभाषा प्रवीण परीक्षा",
    recognitionText: "भारत सरकार द्वारा मान्य, इंटर स्तर की हिंदी के समकक्ष"
  }

  const admin = examDetails.administrative || {
    signatoryName: "सौ. सुनीता कुलकर्णी",
    signatoryDesignation: "सचिव, परीक्षा विभाग",
    departmentName: "महाराष्ट्र राष्ट्रभाषा भवन, पुणे",
    marksCalculationNote: "मात्र हिंदी के लिखित प्रश्नपत्रों के अंकों के आधार पर परिणाम घोषित किया जाता है।"
  }

  const schedule = examDetails.schedule || {
    session: "सितंबर - 2024"
  }

  const rules = examDetails.rules || {
    gradingScheme: {
      firstClass: "300 से ऊपर",
      secondClass: "250 से 299",
      thirdClass: "175 से 249"
    }
  }

  const resultDate = examDetails.resultDate || "05/12/2024"

  const handlePrint = () => window.print()

  // Process Breakdown into Papers, Oral, and Project
  const breakdownEntries = Object.entries(resultData.breakdown || {})
  const mainPapers = breakdownEntries.filter(([k]) => k.includes('प्रश्नपत्र') || k.includes('Paper'))
  const oralMarks = breakdownEntries.find(([k]) => k.includes('मौखिक') || k.toLowerCase().includes('oral'))?.[1] || 0
  const projectMarks = breakdownEntries.find(([k]) => k.includes('परियोजना') || k.toLowerCase().includes('project'))?.[1] || 0

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center overflow-y-auto print:p-0 print:bg-white p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.98, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          backgroundColor: '#fafaf9', // Higher quality off-white (Stone/Paper tint)
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(0,0,0,0.01) 0%, transparent 100%),
            url("https://www.transparenttextures.com/patterns/natural-paper.png")
          `,
        }}
        className="
          w-full
          max-w-[820px]
          shadow-[0_25px_60px_-15px_rgba(0,0,0,0.6)]
          relative
          print:shadow-none
          print:max-w-full
          print:bg-white
          m-auto
          min-h-[1050px]
          border border-black/10
          overflow-hidden
          rounded-sm
        "
      >
        {/* Subtle Decorative Edge */}
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-black/20 via-transparent to-black/20 opacity-30"></div>

        {/* PRINT CONTROLS */}
        <div className="absolute top-5 right-5 flex gap-3 print:hidden z-20">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-[#1a1a1a] hover:bg-black text-[white] rounded shadow-xl flex items-center gap-2 font-bold transition-all hover:-translate-y-0.5"
          >
            <Printer size={16} /> Print Official Copy
          </button>
          <button
            onClick={onClose}
            className="p-2.5 bg-white/20 hover:bg-white/40 backdrop-blur-md text-gray-800 rounded border border-black/10 transition-all"
          >
            <X size={22} />
          </button>
        </div>

        {/* DOCUMENT CONTENT */}
        <div id="printable-marksheet" className="px-14 py-10 md:px-20 md:py-14 text-[#111] font-serif leading-[1.3] relative select-none">

          {/* Subtle Watermark Branding */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.015] print:hidden">
            <span className="text-[100px] font-black -rotate-30 uppercase border-[12px] border-black p-10 tracking-[10px]">MRB Sabha</span>
          </div>

          {/* Header */}
          <div className="text-center space-y-1 mb-10 relative z-10">
            <h1 className="text-[26px] md:text-[30px] font-black tracking-tight text-[#0a0a0a] uppercase">
              {identity.conductingBody}
            </h1>
            <h2 className="text-[22px] md:text-[26px] font-bold text-[#1a1a1a]">
              {identity.examFullTitle}
            </h2>
            <p className="text-[14px] md:text-[15px] font-medium italic text-gray-500 max-w-[80%] mx-auto">
              ( {identity.recognitionText} )
            </p>
            <div className="pt-6 flex justify-center">
              <span className="text-[24px] md:text-[28px] font-black border-b-[3px] border-black/80 pb-0.5 px-14 uppercase tracking-[0.25em] text-[#050505]">
                अंक - सूची
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-4 mb-10 text-[17px] md:text-[18px] border-b-2 border-black/5 pb-8 relative z-10">
            <div className="space-y-4">
              <div className="flex items-baseline">
                <span className="font-bold min-w-[130px] text-gray-500 text-[15px] uppercase tracking-wider">Candidate</span>
                <span className="font-black text-black border-b border-dotted border-black px-2 flex-grow truncate">{resultData.fullName || student.username}</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold min-w-[130px] text-gray-500 text-[15px] uppercase tracking-wider">Center</span>
                <span className="font-black text-black border-b border-dotted border-black px-2 flex-grow truncate">{admin.departmentName}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-baseline">
                <span className="font-bold min-w-[90px] text-gray-500 text-[15px] uppercase tracking-wider">ID NO</span>
                <span className="font-black text-black border-b border-dotted border-black px-2 flex-grow">{app.applicationId || "36"}</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold min-w-[90px] text-gray-500 text-[15px] uppercase tracking-wider">Session</span>
                <span className="font-black text-black border-b border-dotted border-black px-2 flex-grow">{schedule.session}</span>
              </div>
            </div>
          </div>

          {/* Table Headline */}
          <div className="text-center mb-8 font-bold text-[18px] text-[#2c1d1a] italic opacity-80 decoration-black/20 underline underline-offset-8">
            Detailed performance statement as per Papers
          </div>

          {/* Marks List Section */}
          <div className="border-t-2 border-black/10 pt-8 mb-4 space-y-4 text-[18px] md:text-[19px] relative z-10">
            {mainPapers.map(([paper, marks], idx) => (
              <div key={idx} className="flex justify-between items-center group">
                <span className="min-w-[150px] font-bold text-gray-800">{paper}</span>
                <div className="flex items-center gap-4 flex-grow px-6 opacity-60 group-hover:opacity-100 transition-opacity">
                  <div className="flex-grow border-b border-black/5"></div>
                  <span className="text-[14px] whitespace-nowrap font-medium text-gray-400">Total 100</span>
                  <div className="w-6 h-6 border-[2px] border-black/60 flex items-center justify-center text-[10px] font-black rounded-[2px] shadow-sm bg-black/5">
                    {idx === 4 ? '' : 'I'}
                  </div>
                  <div className="flex-grow border-b border-black/5"></div>
                </div>
                <div className="flex gap-4 min-w-[150px] justify-end">
                  <span className="text-gray-400 text-sm italic">Obtained</span>
                  <span className="font-black text-[22px] text-black min-w-[35px] text-right leading-none">{marks}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals Section */}
          <div className="space-y-4 text-[18px] md:text-[20px] relative z-10 py-5 bg-black/[0.015] -mx-6 px-10 rounded-lg border-y border-black/5">
            <div className="flex justify-between font-black text-[22px]">
              <span className="min-w-[150px] text-gray-400 font-bold text-[16px] uppercase tracking-[4px]">Grand Total</span>
              <span className="text-center text-gray-300 font-normal">Out of {resultData.totalMax || "500"}</span>
              <span className="min-w-[150px] text-right text-[26px] bg-gradient-to-r from-black to-gray-700 bg-clip-text text-transparent">
                {resultData.totalObtained || resultData.score}
              </span>
            </div>

            <div className="border-t-2 border-black/5 my-2"></div>

            {/* Dynamic Oral & Project Sections */}
            <div className="flex justify-between items-start min-h-[60px]">
              <div className="space-y-4 flex-grow pr-10">
                {examDetails.structure?.hasOral && (
                  <div className="flex gap-6 items-center">
                    <span className="font-bold min-w-[120px] text-gray-600">वोवा / मौखिक</span>
                    <span className="text-gray-300 text-xs tracking-widest uppercase">Max 50</span>
                    <div className="flex items-center gap-3 ml-auto">
                      <span className="text-[10px] font-black opacity-20 uppercase tracking-tighter">Verified</span>
                      <span className="font-black text-[20px] text-[#222]">{resultData.oralMarks || 0}</span>
                    </div>
                  </div>
                )}
                {examDetails.structure?.hasProject && (
                  <div className="flex gap-6 items-center">
                    <span className="font-bold min-w-[120px] text-gray-600">परियोजना कार्य</span>
                    <span className="text-gray-300 text-xs tracking-widest uppercase">Max 50</span>
                    <div className="flex items-center gap-3 ml-auto">
                      <span className="text-[10px] font-black opacity-20 uppercase tracking-tighter">Verified</span>
                      <span className="font-black text-[20px] text-[#222]">{resultData.projectMarks || 0}</span>
                    </div>
                  </div>
                )}
                {!examDetails.structure?.hasOral && !examDetails.structure?.hasProject && (
                  <div className="h-4 flex items-center">
                    <p className="text-[10px] text-gray-300 uppercase tracking-[4px] font-bold">No additional components</p>
                  </div>
                )}
              </div>
              <div className="text-right border-l-4 border-black/5 pl-10 py-1 flex flex-col justify-center">
                <p className="text-[10px] font-black uppercase text-gray-300 mb-1 tracking-widest">Final Status</p>
                <span className="font-black text-[30px] text-black leading-none drop-shadow-sm">
                  {resultData.remarks === 'Pass' ? 'उत्तीर्ण' : resultData.remarks === 'Fail' ? 'अनुत्तीर्ण' : resultData.remarks}
                </span>
              </div>
            </div>
          </div>

          {/* Status Notes */}
          <div className="mt-8 text-[15px] space-y-2 relative z-10 italic text-gray-500">
            <p className="flex items-center gap-3">
              <span className="w-6 h-[1.5px] bg-black/10"></span>
              ( {admin.marksCalculationNote} )
              <span className="font-black not-italic ml-6 text-black text-[12px] bg-black/5 border border-black/10 px-2.5 py-1 rounded shadow-inner">विशेष स्थान</span>
            </p>
          </div>

          {/* Footer Branding & Signature Area */}
          <div className="relative mt-24 z-10">
            {/* Central Seal (Premium Red Stamp) */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-14 opacity-90 scale-100 filter drop-shadow-[2px_4px_8px_rgba(139,45,45,0.2)]">
              <div className="w-28 h-28 border-[4px] border-[#8b2d2d]/20 rounded-full border-double p-0.5 flex items-center justify-center">
                <div className="w-full h-full border-2 border-[#8b2d2d]/30 rounded-full flex flex-col items-center justify-center p-2 bg-[#8b2d2d]/5 backdrop-blur-[1px] relative overflow-hidden">
                  <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/pinstripe-light.png")' }}></div>
                  <p className="text-[9px] text-[#8b2d2d] text-center font-black leading-none uppercase select-none relative z-10">
                    Authenticated<br /><span className="text-[11px] block py-1">MRB SABHA</span>Official Seal
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end pt-12 border-t border-black/5">
              <div className="space-y-8">
                <div className="flex items-center gap-4 text-[18px]">
                  <span className="font-bold text-gray-400 text-[14px] uppercase tracking-widest">Dated:</span>
                  <span className="border-b-[3px] border-black/80 min-w-[180px] text-center font-black text-[20px] pb-1 font-serif">
                    {resultDate}
                  </span>
                </div>
              </div>

              <div className="text-center group relative cursor-help">
                {/* Handwritten Signature Brush */}
                <div className="absolute -top-16 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-all duration-1000 transform -rotate-3 scale-110 pointer-events-none">
                  <p className="text-[40px] font-['Satisfy',cursive] text-blue-900/40 select-none whitespace-nowrap filter blur-[0.3px]">Sunita Kulkarni</p>
                </div>
                <p className="font-black text-[22px] leading-none text-black mb-1.5">{admin.signatoryName}</p>
                <p className="font-bold text-[14px] text-gray-400 uppercase tracking-[2px]">{admin.signatoryDesignation}</p>
              </div>
            </div>
          </div>

          {/* Final Threshold Information */}
          <div className="mt-14 text-center space-y-4 border-t-2 border-black/5 pt-8 relative z-10 bg-gradient-to-b from-black/[0.01] to-transparent rounded-xl border-dashed">
            <p className="text-[14px] font-black uppercase tracking-[6px] text-gray-300 mb-2">Grading Thresholds</p>
            <div className="flex justify-center gap-10 font-black text-[14px] text-gray-700 px-6">
              <span className="bg-white/40 px-3 py-1.5 rounded-md shadow-sm border border-black/5">THIRD: {rules.gradingScheme.thirdClass}</span>
              <span className="bg-white/40 px-3 py-1.5 rounded-md shadow-sm border border-black/5">SECOND: {rules.gradingScheme.secondClass}</span>
              <span className="bg-white/60 px-3 py-1.5 rounded-md shadow-lg border border-black/10 text-black">FIRST: {rules.gradingScheme.firstClass}</span>
            </div>
            <p className="mt-6 text-[12px] md:text-[13px] font-bold text-gray-400 px-16 italic leading-relaxed opacity-60">
              सूचना - रा.भा. पंडित परीक्षा के आवेदनपत्र के साथ इसकी प्रमाणित प्रतिलिपि भेजी जाए ।
              <br />(Certified copies are mandatory for sequential academic registrations)
            </p>
          </div>

        </div>

        {/* Security Overlay */}
        {!result.publishedAt && (
          <div className="absolute inset-0 pointer-events-none border-[20px] border-red-900/5 z-[100] flex items-center justify-center overflow-hidden">
            <span className="text-[80px] font-black text-red-900/[0.03] -rotate-45 uppercase border-[15px] border-red-900/[0.03] p-16 select-none whitespace-nowrap">DOCUMENT PREVIEW ONLY</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Marksheet
