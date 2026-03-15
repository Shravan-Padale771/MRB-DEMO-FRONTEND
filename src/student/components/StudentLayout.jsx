import React from 'react';
import StudentSidebar from './StudentSidebar';

const StudentLayout = ({ children, activeTab, setActiveTab, currentUser, onLogout }) => {
    return (
        <div className="min-h-screen bg-[#f8f9fe] relative overflow-hidden transition-all duration-500">
            {/* Decorative background elements for premium feel */}
            <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-500/5 blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[20%] w-[30%] h-[30%] rounded-full bg-indigo-500/5 blur-[100px] pointer-events-none" />

            <StudentSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                currentUser={currentUser} 
                onLogout={onLogout} 
            />

            <div className="pl-72 flex flex-col min-h-screen transition-all duration-500 relative z-10">
                <main className="p-8 pt-6 flex-1 animate-in fade-in slide-in-from-bottom-2 duration-700">
                    {children}
                </main>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(0, 0, 0, 0.08);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.15);
                }
                
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-in {
                    animation: fade-in 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                }
            `}</style>
        </div>
    );
};

export default StudentLayout;
