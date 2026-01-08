import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ShieldCheck, GraduationCap } from 'lucide-react';

const LandingPage = () => {
  return (
    <div className="flex h-screen items-center justify-center bg-gradient-to-br from-indigo-500 to-purple-600">
      <div className="grid gap-8 md:grid-cols-2 max-w-4xl w-full p-6">
        
        {/* Admin Card */}
        <Link to="/admin">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center cursor-pointer h-64 justify-center"
          >
            <ShieldCheck size={64} className="text-indigo-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Admin Portal</h2>
            <p className="text-gray-500 mt-2 text-center">Manage exams, students, and publish results.</p>
          </motion.div>
        </Link>

        {/* Student Card */}
        <Link to="/student">
          <motion.div 
            whileHover={{ scale: 1.05 }}
            className="bg-white p-8 rounded-2xl shadow-2xl flex flex-col items-center cursor-pointer h-64 justify-center"
          >
            <GraduationCap size={64} className="text-purple-600 mb-4" />
            <h2 className="text-2xl font-bold text-gray-800">Student Portal</h2>
            <p className="text-gray-500 mt-2 text-center">View exams, apply, and check your results.</p>
          </motion.div>
        </Link>

      </div>
    </div>
  );
};

export default LandingPage;