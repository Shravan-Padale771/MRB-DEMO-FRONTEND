import React, { useState, useEffect, useRef } from 'react';
import { Search, User, BookOpen, FileText, Command, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const GlobalSearch = ({ students = [], exams = [], applications = [], schools = [], onSelect }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                setIsOpen(true);
            }
            if (e.key === 'Escape') {
                setIsOpen(false);
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        if (!query.trim()) {
            setResults([]);
            return;
        }

        const q = query.toLowerCase();
        const studentResults = students
            .filter(s => s.username?.toLowerCase().includes(q) || s.student_id?.toString().includes(q))
            .slice(0, 5)
            .map(s => ({ type: 'student', id: s.id, label: s.username, sublabel: `ID: ${s.student_id}`, icon: User, tab: 'students' }));

        const examResults = exams
            .filter(e => e.exam_name?.toLowerCase().includes(q) || e.exam_code?.toLowerCase().includes(q))
            .slice(0, 5)
            .map(e => ({ type: 'exam', id: e.examNo, label: e.exam_name, sublabel: e.exam_code, icon: BookOpen, tab: 'exams' }));

        const schoolResults = schools
            .filter(s => s.schoolName?.toLowerCase().includes(q) || s.schoolCode?.toLowerCase().includes(q))
            .slice(0, 5)
            .map(s => ({ type: 'school', id: s.schoolId, label: s.schoolName, sublabel: s.city, icon: FileText, tab: 'schools' }));

        setResults([...studentResults, ...examResults, ...schoolResults]);
        setSelectedIndex(0);
    }, [query, students, exams, schools]);

    const handleSelect = (result) => {
        onSelect(result.tab, result.id);
        setIsOpen(false);
        setQuery('');
    };

    const onKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev + 1) % results.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev - 1 + results.length) % results.length);
        } else if (e.key === 'Enter' && results[selectedIndex]) {
            handleSelect(results[selectedIndex]);
        }
    };

    return (
        <>
            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100"
                        >
                            <div className="flex items-center px-4 py-4 border-b border-gray-100">
                                <Search className="text-gray-400 mr-3" size={20} />
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="Search students, exams, schools... (Ctrl+K)"
                                    className="flex-1 bg-transparent border-none outline-none text-gray-800 text-lg placeholder:text-gray-400"
                                    value={query}
                                    onChange={(e) => setQuery(e.target.value)}
                                    onKeyDown={onKeyDown}
                                />
                                <div className="flex items-center gap-2">
                                    <kbd className="hidden sm:inline-flex items-center px-1.5 py-0.5 text-xs font-mono text-gray-400 bg-gray-50 border border-gray-200 rounded">ESC</kbd>
                                    <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-gray-100 rounded-full transition-colors text-gray-400">
                                        <X size={18} />
                                    </button>
                                </div>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                                {results.length > 0 ? (
                                    <div className="py-2">
                                        {results.map((result, index) => (
                                            <button
                                                key={`${result.type}-${result.id}`}
                                                onClick={() => handleSelect(result)}
                                                onMouseEnter={() => setSelectedIndex(index)}
                                                className={`w-full flex items-center px-4 py-3 text-left transition-colors ${index === selectedIndex ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mr-4 ${index === selectedIndex ? 'bg-blue-100' : 'bg-gray-100'
                                                    }`}>
                                                    <result.icon size={20} />
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-semibold">{result.label}</div>
                                                    <div className={`text-xs ${index === selectedIndex ? 'text-blue-500' : 'text-gray-400'}`}>
                                                        {result.sublabel} • {result.type.toUpperCase()}
                                                    </div>
                                                </div>
                                                {index === selectedIndex && (
                                                    <div className="text-xs font-mono bg-blue-100 px-1.5 py-0.5 rounded">ENTER</div>
                                                )}
                                            </button>
                                        ))}
                                    </div>
                                ) : query.trim() ? (
                                    <div className="p-8 text-center text-gray-400">
                                        No results found for "{query}"
                                    </div>
                                ) : (
                                    <div className="p-8 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gray-50 mb-3">
                                            <Command className="text-gray-300" size={24} />
                                        </div>
                                        <p className="text-gray-500 font-medium">Search for anything</p>
                                        <p className="text-gray-400 text-sm mt-1">Start typing to see results across your dashboard</p>
                                    </div>
                                )}
                            </div>

                            <div className="px-4 py-2 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-400 font-medium uppercase tracking-wider">
                                <div className="flex gap-4">
                                    <span className="flex items-center gap-1"><kbd className="px-1 bg-white border border-gray-300 rounded shadow-sm">↑↓</kbd> Navigate</span>
                                    <span className="flex items-center gap-1"><kbd className="px-1 bg-white border border-gray-300 rounded shadow-sm">↵</kbd> Select</span>
                                </div>
                                <div>MRB SEARCH</div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GlobalSearch;
