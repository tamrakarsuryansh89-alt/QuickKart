import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export default function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  itemName = 'items'
}) {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (currentPage <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 bg-white border-t border-slate-200 text-sm text-slate-600">
      <div className="flex items-center gap-3">
        <span>
          Showing <strong className="font-semibold text-slate-900">{startItem}</strong> to{' '}
          <strong className="font-semibold text-slate-900">{endItem}</strong> of{' '}
          <strong className="font-semibold text-slate-900">{totalItems}</strong> {itemName}
        </span>
        
        <div className="flex items-center gap-1.5 ml-2 border-l border-slate-200 pl-3">
          <label htmlFor="pageSizeSelect" className="text-xs text-slate-500">Per page:</label>
          <select
            id="pageSizeSelect"
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="text-xs font-medium bg-slate-50 border border-slate-300 rounded px-2 py-1 text-slate-700 focus:outline-none focus:ring-1 focus:ring-brand-500 cursor-pointer"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={20}>20</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1 || totalPages === 0}
          title="First Page"
          className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1 || totalPages === 0}
          title="Previous Page"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition font-medium"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Prev</span>
        </button>

        <div className="flex items-center gap-1 mx-1">
          {getPageNumbers().map((page, idx) => (
            page === '...' ? (
              <span key={`dots-${idx}`} className="px-2 text-slate-400 select-none">
                ...
              </span>
            ) : (
              <button
                key={`page-${page}`}
                onClick={() => onPageChange(page)}
                aria-current={currentPage === page ? 'page' : undefined}
                className={`min-w-[32px] h-8 px-2 rounded font-medium text-xs transition ${
                  currentPage === page
                    ? 'bg-brand-600 text-white shadow-sm font-semibold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {page}
              </button>
            )
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || totalPages === 0}
          title="Next Page"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded text-slate-600 hover:text-slate-900 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition font-medium"
        >
          <span className="hidden sm:inline">Next</span>
          <ChevronRight className="w-4 h-4" />
        </button>

        <button
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages || totalPages === 0}
          title="Last Page"
          className="p-1.5 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:pointer-events-none transition"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
