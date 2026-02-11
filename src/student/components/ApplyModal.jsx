import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";
import { applyForExam } from "../../api";

const ApplyModal = ({ exam, student, onClose, onSuccess }) => {
  const [agreed, setAgreed] = useState(false);

  if (!exam || !student) return null;

  const handleSubmit = async () => {
    if (!agreed) {
      toast.error("Please accept the declaration before submitting");
      return;
    }

    try {
      await applyForExam({
        student: { studentId: student.studentId },
        exam: { examNo: exam.examNo },
        status: "APPLIED",

        /*
          NOTE:
          Signature, photo, and document uploads are NOT included
          in payload intentionally.
          These will require DB + API changes later.
        */
      });

      toast.success("Application Submitted Successfully");
      onClose();
      onSuccess?.();
    } catch {
      toast.error("Application Failed");
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 overflow-y-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="bg-white max-w-5xl mx-auto rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 flex justify-between items-center text-white">
            <div>
              <h2 className="text-xl font-bold">{exam.exam_name}</h2>
              <p className="text-xs opacity-90">
                Official Examination Application Form
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg">
              <X />
            </button>
          </div>

          {/* Body */}
          <div className="p-8 space-y-10 text-sm">

            {/* STUDENT DETAILS */}
            <Section title="Candidate Details">
              <TwoCol>
                <Info label="Full Name" value={`${student.firstName} ${student.middleName || ""} ${student.lastName}`} />
                <Info label="Student ID" value={student.studentId} />
                <Info label="Email" value={student.email} />
                <Info label="Contact Number" value={student.contact} />
                <Info label="School Name" value={student.schoolName} />
                <Info label="Mother Tongue" value={student.motherTongue || "—"} />
              </TwoCol>
            </Section>

            {/* EXAM DETAILS */}
            <Section title="Examination Details">
              <TwoCol>
                <Info label="Exam Name" value={exam.exam_name} />
                <Info label="Exam Code" value={exam.exam_code} />
                <Info label="Number of Papers" value={exam.no_of_papers} />
                <Info label="Examination Fees" value={`₹ ${exam.exam_fees}`} />
                <Info label="Exam Dates" value={`${exam.exam_start_date} to ${exam.exam_end_date}`} />
                <Info label="Application Window" value={`${exam.application_start_date} to ${exam.application_end_date}`} />
              </TwoCol>
            </Section>

            {/* DECLARATION */}
            <Section title="Declaration by Candidate">
              <div className="space-y-4">
                <p className="text-gray-700 leading-relaxed">
                  I hereby declare that all the information provided above is
                  true and correct to the best of my knowledge. I understand that
                  if any information is found to be false or incorrect, my
                  candidature for the examination may be cancelled.
                </p>

                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 w-4 h-4"
                  />
                  <span className="font-semibold text-gray-800">
                    I agree to the above declaration and examination rules.
                  </span>
                </label>
              </div>
            </Section>

            {/* SIGNATURE / UPLOAD PLACEHOLDERS */}
            <Section title="Signatures & Uploads (To be enabled later)">
              <div className="grid md:grid-cols-3 gap-6 text-xs text-gray-500">
                <Placeholder label="Candidate Signature" />
                <Placeholder label="Guardian Signature" />
                <Placeholder label="Passport Size Photograph" />

                {/*
                  NOTE:
                  These uploads/signatures are UI placeholders only.
                  Backend + DB schema does not support them yet.
                */}
              </div>
            </Section>

            {/* SUBMIT */}
            <div className="flex justify-end pt-6 border-t">
              <button
                onClick={handleSubmit}
                className="flex items-center gap-2 bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 shadow-md"
              >
                <CheckCircle size={18} />
                Submit Application
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

/* ---------- Helper Components ---------- */

const Section = ({ title, children }) => (
  <section className="space-y-4">
    <h3 className="text-lg font-bold text-gray-800 border-b pb-2">{title}</h3>
    {children}
  </section>
);

const TwoCol = ({ children }) => (
  <div className="grid md:grid-cols-2 gap-4">{children}</div>
);

const Info = ({ label, value }) => (
  <div>
    <p className="text-[10px] uppercase font-bold text-gray-400 mb-1">{label}</p>
    <div className="p-2.5 border rounded-lg bg-gray-50 font-semibold text-gray-800">
      {value}
    </div>
  </div>
);

const Placeholder = ({ label }) => (
  <div className="h-28 border-2 border-dashed rounded-lg flex items-center justify-center text-center">
    {label}
  </div>
);

export default ApplyModal;
