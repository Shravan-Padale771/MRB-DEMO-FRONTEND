import React from 'react';
import Sidebar from './Sidebar';

const DashboardLayout = ({ children, activeTab, setActiveTab }) => {
  return (
    <div className="min-h-screen bg-[#f8f9fe]">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="pl-64 flex flex-col min-h-screen transition-all duration-300">

        <main className="p-8 pt-6 flex-1">
          {children}
        </main>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
};

export default DashboardLayout;
