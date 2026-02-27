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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[100] flex items-center justify-center overflow-y-auto print:p-0 print:bg-white p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          backgroundColor: '#fdfbf7',
          backgroundImage: `url("https://www.transparenttextures.com/patterns/natural-paper.png")`,
          backgroundBlendMode: 'multiply'
        }}
        className="
          w-full
          max-w-[850px]
          shadow-[0_25px_60px_-15px_rgba(0,0,0,0.3)]
          relative
          print:shadow-none
          print:max-w-full
          m-auto
          min-h-[1100px]
          border border-[#e5e0d5]
          rounded-sm
          p-12
          font-serif
          text-[#1a1a1a]
        "
        id="marksheet-container"
      >
        {/* PRINT CONTROLS */}
        <div className="absolute top-5 right-5 flex gap-3 print:hidden z-20">
          <button
            onClick={handlePrint}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center gap-2 font-medium transition-colors"
          >
            <Printer size={16} /> Print
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded transition-colors"
          >
            <X size={20} />
          </button>
        </div>

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
              <span className="w-32 font-bold">: {app.applicationId || "36"}</span>
            </div>
            <div className="flex justify-end">
              <span className="w-16">सत्र</span>
              <span className="w-32 font-bold">: {schedule.session}</span>
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
              <td>{computedTotalMax || resultData.totalMax}/</td>
              <td></td>
              <td>{resultData.totalObtained || resultData.score}</td>
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

        {/* Security Overlay - Optional, keeping for consistency with logic */}
        {result && !result.publishedAt && (
          <div className="absolute inset-0 pointer-events-none border-[12px] border-red-500/5 z-[100] flex items-center justify-center overflow-hidden">
            <span className="text-[60px] font-bold text-red-500/5 -rotate-45 uppercase border-8 border-red-500/5 p-8 select-none">PREVIEW ONLY</span>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default Marksheet
