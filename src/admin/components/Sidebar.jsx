import React from 'react';
import {
    LayoutDashboard,
    MapPin,
    Building2,
    School,
    Users,
    BookOpen,
    FileText,
    Send,
    Award,
    ChevronDown,
    Monitor,
    Database
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menuItems = [
        { id: 'dashboard', label: 'DASHBOARD', icon: LayoutDashboard, hasSub: true },
        { id: 'regions', label: 'Regions', icon: MapPin },
        { id: 'exam_centres', label: 'Exam Centres', icon: Building2 },
        { id: 'schools', label: 'Schools', icon: School },
        { id: 'students', label: 'Students', icon: Users },
        { id: 'exams', label: 'Exams', icon: BookOpen },
        { id: 'applications', label: 'Applications', icon: FileText },
        { id: 'publish', label: 'Publish Results', icon: Send },
        { id: 'results', label: 'View Results', icon: Award },
    ];

    return (
        <div className="w-64 bg-[#1b223c] text-white min-h-screen flex flex-col fixed left-0 top-0 z-50">
            {/* Brand Header */}
            <div className="h-16 flex items-center px-6 bg-[#4c84ff]">
                <div className="w-8 h-8 rounded bg-white/20 flex items-center justify-center mr-3">
                    <LayoutDashboard size={20} className="text-white" />
                </div>
                <span className="font-bold text-lg tracking-tight">MRB Admin</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 mt-6 px-4 space-y-1 overflow-y-auto custom-scrollbar pb-6">
                {menuItems.map((item) => (
                    <div key={item.id}>
                        <button
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-3 py-3 rounded-lg transition-colors group ${activeTab === item.id
                                ? 'bg-blue-600/10 text-blue-400'
                                : 'text-gray-400 hover:bg-white/5 hover:text-white'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon size={20} className={activeTab === item.id ? 'text-blue-400' : 'text-gray-400 group-hover:text-white'} />
                                <span className="text-sm font-medium uppercase tracking-wider">{item.label}</span>
                            </div>
                            {item.hasSub && <ChevronDown size={14} className="opacity-50" />}
                        </button>

                        {/* Simple indicators for active state */}
                        {activeTab === item.id && (
                            <div className="h-0.5 bg-blue-500 rounded-full mx-3 mt-1 shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        )}
                    </div>
                ))}
            </nav>
        </div>
    );
};

export default Sidebar;
