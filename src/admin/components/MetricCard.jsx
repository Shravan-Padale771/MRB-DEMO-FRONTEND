import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';

const MetricCard = ({ label, value, color = "#4c84ff" }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
        >
            <div className="flex items-center gap-4">
                <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center text-white"
                    style={{ backgroundColor: color }}
                >
                    <BookOpen size={24} />
                </div>
                <div>
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">{label}</p>
                    <h3 className="text-2xl font-bold text-gray-800 mt-0.5">{value}</h3>
                </div>
            </div>
        </motion.div>
    );
};

export default MetricCard;
