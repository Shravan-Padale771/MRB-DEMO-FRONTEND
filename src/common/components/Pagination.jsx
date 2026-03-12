import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, className = "" }) => {
    if (totalPages <= 1) return null;

    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(0, currentPage - Math.floor(maxVisiblePages / 2));
        let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(0, endPage - maxVisiblePages + 1);
        }

        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={`min-w-[32px] h-8 px-2 rounded-lg font-bold text-xs transition-all ${currentPage === i
                        ? "bg-[#4c84ff] text-white shadow-md shadow-blue-200"
                        : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-200"
                        }`}
                >
                    {i + 1}
                </button>
            );
        }
        return pages;
    };

    return (
        <div className={`flex items-center justify-between border-t border-gray-100 pt-6 mt-8 ${className}`}>
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                Page {currentPage + 1} of {totalPages}
            </span>

            <div className="flex items-center gap-1">
                <button
                    disabled={currentPage === 0}
                    onClick={() => onPageChange(0)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all text-gray-400"
                    title="First Page"
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    disabled={currentPage === 0}
                    onClick={() => onPageChange(currentPage - 1)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all text-gray-400"
                    title="Previous Page"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-1 mx-2">
                    {renderPageNumbers()}
                </div>

                <button
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => onPageChange(currentPage + 1)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all text-gray-400"
                    title="Next Page"
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    disabled={currentPage >= totalPages - 1}
                    onClick={() => onPageChange(totalPages - 1)}
                    className="p-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-30 transition-all text-gray-400"
                    title="Last Page"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
};

export default Pagination;
