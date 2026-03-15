import React, { useState, memo } from 'react';
import {
    LayoutDashboard,
    User,
    BookOpen,
    Bell,
    Download,
    Award,
    FileCheck,
    ChevronDown,
    ChevronRight,
    Search,
    LogOut
} from 'lucide-react';

const StudentSidebar = ({ activeTab, setActiveTab, currentUser, onLogout }) => {
    const [openMenus, setOpenMenus] = useState(['exams']);

    const toggleMenu = (id) => {
        setOpenMenus(prev => 
            prev.includes(id) 
                ? prev.filter(m => m !== id) 
                : [...prev, id]
        );
    };

    const menuItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'My Profile', icon: User },
        { 
            id: 'exams', 
            label: 'Exam Services', 
            icon: BookOpen,
            children: [
                { id: 'notices', label: 'Exam Notices', icon: Bell },
                { id: 'hall_ticket', label: 'Hall Ticket', icon: Download },
                { id: 'certificates', label: 'Certificates', icon: Award },
                { id: 'results_view', label: 'Results & Marksheets', icon: FileCheck },
            ]
        },
    ];

    const renderMenuItem = (item, isSub = false) => {
        const isActive = activeTab === item.id;
        const hasChildren = item.children && item.children.length > 0;
        const isOpen = openMenus.includes(item.id);

        return (
            <div key={item.id} className="w-full">
                <button
                    onClick={() => {
                        if (hasChildren) {
                            toggleMenu(item.id);
                        } else {
                            setActiveTab(item.id);
                        }
                    }}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 group ${
                        isActive 
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                            : isSub 
                                ? 'text-gray-400 hover:text-white hover:bg-white/5'
                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`}
                >
                    <div className="flex items-center gap-3">
                        <item.icon size={isSub ? 18 : 20} className={isActive ? 'text-white' : 'text-gray-400 group-hover:text-white'} />
                        <span className={`${isSub ? 'text-xs' : 'text-sm'} font-medium tracking-wide`}>
                            {item.label}
                        </span>
                    </div>
                    {hasChildren && (
                        isOpen ? <ChevronDown size={14} className="opacity-50" /> : <ChevronRight size={14} className="opacity-50" />
                    )}
                </button>

                {hasChildren && isOpen && (
                    <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                        {item.children.map(child => renderMenuItem(child, true))}
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="w-72 bg-[#0f172a] text-white min-h-screen flex flex-col fixed left-0 top-0 z-50 shadow-2xl border-r border-white/5 font-sans">
            {/* Brand Header */}
            <div className="h-20 flex items-center px-8 bg-gradient-to-r from-indigo-600 to-purple-600">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mr-4 shadow-inner">
                    <LayoutDashboard size={24} className="text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="font-black text-lg tracking-tight leading-none">STUDENT</span>
                    <span className="text-[10px] font-bold opacity-60 tracking-[0.2em] mt-1 uppercase">Portal</span>
                </div>
            </div>

            {/* User Profile Summary */}
            <div className="p-6">
                <div className="bg-white/5 rounded-2xl p-4 border border-white/5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center font-bold text-sm">
                            {currentUser?.firstName?.charAt(0) || 'S'}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                            <span className="text-sm font-bold truncate">{currentUser?.firstName || 'Student'}</span>
                            <span className="text-[10px] text-gray-500 font-bold truncate">ID: #{currentUser?.studentId || 'N/A'}</span>
                        </div>
                    </div>
                    <button 
                        onClick={onLogout}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-red-500/10 text-red-400 text-[10px] font-bold uppercase tracking-wider hover:bg-red-500 hover:text-white transition-all duration-300"
                    >
                        <LogOut size={12} /> Logout
                    </button>
                </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar pb-10">
                <div className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] px-4 mb-4 mt-2">
                    Main Menu
                </div>
                {menuItems.map(item => renderMenuItem(item))}
            </nav>

            {/* Bottom Credits */}
            <div className="p-6 border-t border-white/5">
                <div className="p-4 bg-indigo-600/10 rounded-xl border border-indigo-500/20">
                    <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider text-center">
                        MRB Examination System
                    </p>
                </div>
            </div>
        </div>
    );
};

export default memo(StudentSidebar);
