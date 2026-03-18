import React from 'react';
import StudentSidebar from './StudentSidebar';

const StudentLayout = ({ children, activeTab, setActiveTab, currentUser, onLogout }) => {
    return (
        <div style={s.layout}>
            <StudentSidebar 
                activeTab={activeTab} 
                setActiveTab={setActiveTab} 
                currentUser={currentUser} 
                onLogout={onLogout} 
            />

            <div style={s.mainWrapper}>
                <main style={s.mainContent}>
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
                    background: rgba(0, 0, 0, 0.05);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(0, 0, 0, 0.1);
                }
            `}</style>
        </div>
    );
};

const s = {
    layout: {
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        position: 'relative',
        fontFamily: 'DM Sans, Segoe UI, sans-serif',
    },
    mainWrapper: {
        paddingLeft: '260px',
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
    },
    mainContent: {
        padding: '24px',
        flex: 1,
    }
};

export default StudentLayout;
