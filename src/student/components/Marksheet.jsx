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
          backgroundColor: '#ffffff', // Pure white for better clarity
          backgroundImage: `
            radial-gradient(circle at 50% 50%, rgba(0,0,0,0.005) 0%, transparent 100%),
            url("https://www.transparenttextures.com/patterns/natural-paper.png")
          `,
          backgroundBlendMode: 'multiply'
        }}
        className="
          w-full
          max-w-[800px]
          shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)]
          relative
          print:shadow-none
          print:max-w-full
          print:bg-white
          m-auto
          min-h-[1050px]
          border border-black/10
          overflow-hidden
          rounded-xl
        "
      >
        {/* Subtle Decorative Edge */}
        <div className="absolute top-0 left-0 w-full h-2 bg-black opacity-10"></div>

        {/* PRINT CONTROLS */}
        <div className="absolute top-5 right-5 flex gap-3 print:hidden z-20">
          <button
            onClick={handlePrint}
            className="px-5 py-2.5 bg-[#000] hover:bg-gray-900 text-white rounded-lg shadow-xl flex items-center gap-2 font-bold transition-all hover:scale-105 active:scale-95"
          >
            <Printer size={16} /> Print Official Copy
          </button>
          <button
            onClick={onClose}
            className="p-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-lg border border-black/5 transition-all shadow-sm"
          >
            <X size={22} />
          </button>
        </div>

        {/* DOCUMENT CONTENT */}
        <div id="printable-marksheet" className="px-10 py-8 md:px-16 md:py-10 text-black font-['Inter',sans-serif] leading-[1.25] relative select-none">

          {/* Subtle Watermark Branding */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.02] print:hidden">
            <span className="text-[120px] font-black -rotate-30 uppercase border-[12px] border-black p-10 tracking-[10px]">MRB Sabha</span>
          </div>

          {/* Header */}
          <div className="text-center space-y-2 mb-8 relative z-10">
            <h1 className="text-[28px] md:text-[32px] font-black tracking-tight text-black uppercase leading-tight">
              {identity.conductingBody}
            </h1>
            <h2 className="text-[24px] md:text-[28px] font-extrabold text-[#000]">
              {identity.examFullTitle}
            </h2>
            <p className="text-[15px] md:text-[16px] font-semibold italic text-gray-600 max-w-[85%] mx-auto">
              ( {identity.recognitionText} )
            </p>
            <div className="pt-4 flex justify-center">
              <span className="text-[30px] md:text-[34px] font-black border-b-[4px] border-black pb-1 px-16 uppercase tracking-[0.2em] text-black">
                अंक - सूची
              </span>
            </div>
          </div>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-x-12 gap-y-5 mb-8 text-[18px] border-b-2 border-black pb-8 relative z-10">
            <div className="space-y-4">
              <div className="flex items-baseline">
                <span className="font-bold min-w-[120px] text-gray-800 text-[14px] uppercase tracking-wider">Candidate</span>
                <span className="font-black text-black border-b-2 border-dotted border-black px-2 flex-grow truncate">{resultData.fullName || student.username}</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold min-w-[120px] text-gray-800 text-[14px] uppercase tracking-wider">Center</span>
                <span className="font-black text-black border-b-2 border-dotted border-black px-2 flex-grow truncate">{admin.departmentName}</span>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-baseline">
                <span className="font-bold min-w-[80px] text-gray-800 text-[14px] uppercase tracking-wider">ID NO</span>
                <span className="font-black text-black border-b-2 border-dotted border-black px-2 flex-grow">{app.applicationId || "36"}</span>
              </div>
              <div className="flex items-baseline">
                <span className="font-bold min-w-[80px] text-gray-800 text-[14px] uppercase tracking-wider">Session</span>
                <span className="font-black text-black border-b-2 border-dotted border-black px-2 flex-grow">{schedule.session}</span>
              </div>
            </div>
          </div>

          {/* Table Headline */}
          <div className="text-center mb-8 font-bold text-[18px] text-[#2c1d1a] italic opacity-80 decoration-black/20 underline underline-offset-8">
            Detailed performance statement as per Papers
          </div>

          {/* Marks List Section */}
          <div className="border-t-2 border-black/10 pt-8 mb-4 space-y-4 text-[18px] md:text-[19px] relative z-10 font-serif">
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
          <div className="space-y-4 text-[20px] relative z-10 py-6 bg-black/[0.02] -mx-4 px-8 rounded-xl border-2 border-black">
            <div className="flex justify-between items-center font-black">
              <span className="text-black font-black text-[18px] uppercase tracking-[4px]">Grand Total</span>
              <div className="flex items-center gap-8">
                <span className="text-gray-500 font-bold text-[14px] uppercase">Out of {resultData.totalMax || "500"}</span>
                <span className="text-[32px] text-black tabular-nums border-b-4 border-black px-2">
                  {resultData.totalObtained || resultData.score}
                </span>
              </div>
            </div>

            <div className="border-t border-black/10 my-1"></div>

            {/* Dynamic Oral & Project Sections */}
            <div className="flex justify-between items-center min-h-[60px]">
              <div className="space-y-3 flex-grow pr-10">
                {examDetails.structure?.hasOral && (
                  <div className="flex gap-6 items-center">
                    <span className="font-black min-w-[120px] text-black text-[14px] uppercase tracking-wider">वोवा / मौखिक</span>
                    <span className="text-gray-500 text-[11px] font-black uppercase tracking-widest">Max 50</span>
                    <div className="flex items-center gap-4 ml-auto">
                      <span className="font-black text-[22px] text-black">{resultData.oralMarks || 0}</span>
                    </div>
                  </div>
                )}
                {examDetails.structure?.hasProject && (
                  <div className="flex gap-6 items-center">
                    <span className="font-black min-w-[120px] text-black text-[14px] uppercase tracking-wider">परियोजना कार्य</span>
                    <span className="text-gray-500 text-[11px] font-black uppercase tracking-widest">Max 50</span>
                    <div className="flex items-center gap-4 ml-auto">
                      <span className="font-black text-[22px] text-black">{resultData.projectMarks || 0}</span>
                    </div>
                  </div>
                )}
                {!examDetails.structure?.hasOral && !examDetails.structure?.hasProject && (
                  <div className="h-4 flex items-center">
                    {/* Empty spacer when no additional components exist */}
                  </div>
                )}
              </div>
              <div className="text-right border-l-4 border-black pl-8 py-1 flex flex-col justify-center">
                <p className="text-[11px] font-black uppercase text-gray-500 mb-1 tracking-widest leading-none">Final Status</p>
                <span className="font-black text-[34px] text-black leading-none uppercase tracking-tighter">
                  {resultData.remarks === 'Pass' ? 'उत्तीर्ण' : resultData.remarks === 'Fail' ? 'अनुत्तीर्ण' : resultData.remarks}
                </span>
              </div>
            </div>
          </div>

          {/* Status Notes */}
          <div className="mt-8 text-[15px] space-y-2 relative z-10 font-bold text-gray-700">
            <p className="flex items-center gap-4">
              <span className="w-8 h-0.5 bg-black"></span>
              ( {admin.marksCalculationNote} )
              <span className="font-black uppercase ml-auto text-black text-[13px] bg-black text-white px-4 py-1.5 rounded-sm">विशेष स्थान</span>
            </p>
          </div>

          {/* Footer Branding & Signature Area */}
          <div className="relative mt-20 z-10">
            {/* Central Seal (Premium Red Stamp) */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-16 opacity-95 scale-110 filter drop-shadow-md">
              <div className="w-24 h-24 border-[4px] border-[#8b2d2d] rounded-full border-double p-0.5 flex items-center justify-center">
                <div className="w-full h-full border-2 border-[#8b2d2d] rounded-full flex flex-col items-center justify-center p-2 bg-white/40">
                  <p className="text-[9px] text-[#8b2d2d] text-center font-black leading-none uppercase select-none">
                    Authenticated<br /><span className="text-[11px] block py-1 font-bold">MRB SABHA</span>Official Seal
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-end pt-8 border-t-2 border-black">
              <div className="space-y-6">
                <div className="flex items-center gap-4 text-[18px]">
                  <span className="font-black text-gray-800 text-[13px] uppercase tracking-widest">Dated:</span>
                  <span className="border-b-4 border-black min-w-[160px] text-center font-black text-[22px] pb-1">
                    {resultDate}
                  </span>
                </div>
              </div>

              <div className="text-center relative">
                {/* Handwritten Signature Brush */}
                <div className="absolute -top-14 left-1/2 -translate-x-1/2 opacity-70 transform -rotate-2 select-none pointer-events-none">
                  <p className="text-[44px] font-['Satisfy',cursive] text-blue-900 whitespace-nowrap filter blur-[0.2px] drop-shadow-sm">Sunita Kulkarni</p>
                </div>
                <p className="font-black text-[24px] leading-none text-black mb-1.5">{admin.signatoryName}</p>
                <p className="font-black text-[13px] text-gray-600 uppercase tracking-[2px]">{admin.signatoryDesignation}</p>
              </div>
            </div>
          </div>

          {/* Final Threshold Information */}
          <div className="mt-12 text-center space-y-4 border-t-4 border-black pt-6 relative z-10 bg-black/5 rounded-xl">
            <p className="text-[13px] font-black uppercase tracking-[8px] text-black">Grading Thresholds</p>
            <div className="flex justify-center gap-10 font-black text-[15px] text-black px-6">
              <span className="border-b-2 border-black/20 pb-1">THIRD: {rules.gradingScheme.thirdClass}</span>
              <span className="border-b-2 border-black/20 pb-1">SECOND: {rules.gradingScheme.secondClass}</span>
              <span className="border-b-4 border-black pb-1">FIRST: {rules.gradingScheme.firstClass}</span>
            </div>
            <p className="mt-4 text-[13px] font-black text-gray-800 px-16 leading-relaxed">
              सूचना - रा.भा. पंडित परीक्षा के आवेदनपत्र के साथ इसकी प्रमाणित प्रतिलिपि भेजी जाए ।
              <br /><span className="text-[11px] opacity-60 uppercase mt-1 block">(Certified copies are mandatory for sequential academic registrations)</span>
            </p>
          </div>

        </div>

        {/* Security Overlay */}
        {!result.publishedAt && (
          <div className="absolute inset-0 pointer-events-none border-[20px] border-red-900/10 z-[100] flex items-center justify-center overflow-hidden">
            <span className="text-[80px] font-black text-red-900/5 -rotate-45 uppercase border-[15px] border-red-900/5 p-16 select-none whitespace-nowrap">DOCUMENT PREVIEW ONLY</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Marksheet
