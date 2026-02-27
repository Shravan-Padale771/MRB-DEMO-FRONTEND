import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-[#f8f9fe] relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />

      <div className="grid gap-8 md:grid-cols-2 max-w-4xl w-full p-6 relative z-10">

        {/* Admin Card */}
        <Link to="/admin">
          <motion.div
            whileHover={{ scale: 1.05, translateY: -10 }}
            className="bg-white p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center cursor-pointer h-72 justify-center transition-all duration-300 hover:border-blue-200"
          >
            <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6">
              <ShieldCheck size={48} className="text-[#4c84ff]" />
            </div>
            <h2 className="text-2xl font-black text-[#1b223c] tracking-tight uppercase">Admin Portal</h2>
            <p className="text-gray-400 mt-3 text-center text-sm font-medium px-4">Manage exams, students, and publish results.</p>
          </motion.div>
        </Link>

        {/* Student Card */}
        <Link to="/student">
          <motion.div
            whileHover={{ scale: 1.05, translateY: -10 }}
            className="bg-white p-10 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.05)] border border-white flex flex-col items-center cursor-pointer h-72 justify-center transition-all duration-300 hover:border-blue-200"
          >
            <div className="w-20 h-20 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6">
              <GraduationCap size={48} className="text-[#4c84ff]" />
            </div>
            <h2 className="text-2xl font-black text-[#1b223c] tracking-tight uppercase">Student Portal</h2>
            <p className="text-gray-400 mt-3 text-center text-sm font-medium px-4">View exams, apply, and check your results.</p>
          </motion.div>
        </Link>

      </div>
    </div>
  );
};

export default LandingPage;