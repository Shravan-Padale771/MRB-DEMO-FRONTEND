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
    resultData = JSON.parse(result.resultData || '{}')
  } catch (e) {}

  let examDetails = {}
  try {
    examDetails = JSON.parse(exam.exam_details || '{}')
  } catch (e) {
    examDetails = {
      institution: 'Maharashtra Rashtrabhasha Sabha, Pune',
      recognition: '(Recognized by Govt. of India)',
      session: 'Annual Session 2024',
      resultDate: new Date(result.publishedAt).toLocaleDateString(),
    }
  }

  const handlePrint = () => window.print()

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center overflow-y-auto print:bg-white">
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 0.85 }}
        className="
          bg-white
          w-full
          max-w-4xl
          rounded-2xl
          shadow-2xl
          overflow-hidden
          relative

          transform
          scale-[1.2]           /* 🔥 30% smaller */
          origin-center

          print:scale-100
          print:max-w-full
          print:rounded-none
          print:shadow-none
        "
      >
        {/* Actions */}
        <div className="absolute top-4 right-4 flex gap-2 print:hidden">
          <button
            onClick={handlePrint}
            className="p-2 bg-indigo-600 text-white rounded-full"
          >
            <Printer size={20} />
          </button>
          <button
            onClick={onClose}
            className="p-2 bg-gray-200 rounded-full"
          >
            <X size={20} />
          </button>
        </div>

        {/* CONTENT */}
        <div
          id="printable-marksheet"
          className="p-8 text-gray-900 font-serif"
        >
          {/* Header */}
          <div className="text-center mb-8 border-b-2 border-double pb-6">
            <h1 className="text-2xl font-black uppercase tracking-widest">
              {examDetails.institution}
            </h1>
            <p className="text-sm font-bold text-gray-600">
              {examDetails.recognition}
            </p>
            <div className="mt-4">
              <span className="inline-block border-2 px-6 py-1 text-lg font-bold">
                Marksheet (Ank-Suchi)
              </span>
            </div>
          </div>

          {/* Student Info */}
          <div className="grid grid-cols-2 gap-y-3 gap-x-8 mb-8 text-base">
            <div><b>Student Name:</b> {resultData.fullName || student.username}</div>
            <div><b>Roll No:</b> #{app.applicationId}</div>
            <div><b>Examination:</b> {exam.exam_name}</div>
            <div><b>Session:</b> {examDetails.session}</div>
          </div>

          {/* Table */}
          <table className="w-full border-2 mb-6">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-2 text-left">Paper</th>
                <th className="border p-2 text-center w-28">Max</th>
                <th className="border p-2 text-center w-28">Obtained</th>
              </tr>
            </thead>
            <tbody>
              {resultData.breakdown &&
                Object.entries(resultData.breakdown).map(([k, v], i) => (
                  <tr key={i}>
                    <td className="border p-2">{k}</td>
                    <td className="border p-2 text-center">100</td>
                    <td className="border p-2 text-center font-bold">{v}</td>
                  </tr>
                ))}
              <tr className="bg-gray-50 font-bold">
                <td className="border p-2 text-right">Total</td>
                <td className="border p-2 text-center">{resultData.totalMax}</td>
                <td className="border p-2 text-center text-indigo-700">
                  {resultData.totalObtained}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Result */}
          <div className="flex gap-6 items-center mb-10">
            <span><b>Final Score:</b> {resultData.score}</span>
            <span className={`font-bold ${resultData.remarks === 'Pass' ? 'text-green-700' : 'text-red-700'}`}>
              {resultData.remarks}
            </span>
          </div>

          {/* Footer */}
          <div className="flex justify-between text-sm border-t pt-6">
            <div>
              <p><b>Date:</b> {examDetails.resultDate}</p>
              <p className="italic text-gray-500">Computer generated document</p>
            </div>
            <div className="text-center">
              <div className="w-40 h-[2px] bg-black mb-2"></div>
              <p className="font-bold">Controller of Examinations</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Marksheet
