import { useMemo } from 'react';
import { PaginationConfig } from '../types';

interface PaginationProps {
  pagination: PaginationConfig;
  onPaginationChange: (pagination: Partial<PaginationConfig>) => void;
  pageSizeOptions?: number[];
  showPageSizeSelector?: boolean;
  showInfo?: boolean;
  className?: string;
}

export function Pagination({
  pagination,
  onPaginationChange,
  pageSizeOptions = [10, 25, 50, 100],
  showPageSizeSelector = true,
  showInfo = true,
  className = ''
}: PaginationProps) {
  const { page, pageSize, total } = pagination;

  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize + 1;
  const endIndex = Math.min(page * pageSize, total);

  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  // Generate page numbers to show
  const pageNumbers = useMemo(() => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 7;
    
    if (totalPages <= maxVisiblePages) {
      // Show all pages if total is small
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);
      
      let startPage = Math.max(2, page - 2);
      let endPage = Math.min(totalPages - 1, page + 2);
      
      // Adjust range if we're near the beginning or end
      if (page <= 3) {
        endPage = Math.min(totalPages - 1, 5);
      }
      if (page >= totalPages - 2) {
        startPage = Math.max(2, totalPages - 4);
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pages.push('...');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        pages.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pages.push('...');
      }
      
      // Always show last page (unless it's already included)
      if (totalPages > 1) {
        pages.push(totalPages);
      }
    }
    
    return pages;
  }, [page, totalPages]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      onPaginationChange({ page: newPage });
    }
  };

  const handlePageSizeChange = (newPageSize: number) => {
    // Calculate what page the user should be on after changing page size
    const currentFirstIndex = (page - 1) * pageSize;
    const newPage = Math.floor(currentFirstIndex / newPageSize) + 1;
    
    onPaginationChange({ 
      pageSize: newPageSize,
      page: Math.max(1, newPage)
    });
  };

  if (totalPages <= 1 && !showPageSizeSelector) {
    return null;
  }

  return (
    <div className={`pagination ${className}`}>
      {/* Page size selector */}
      {showPageSizeSelector && (
        <div className="pagination__page-size">
          <label className="pagination__page-size-label">
            Show:
            <select
              className="pagination__page-size-select"
              value={pageSize}
              onChange={(e) => handlePageSizeChange(Number(e.target.value))}
            >
              {pageSizeOptions.map(size => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
            per page
          </label>
        </div>
      )}

      {/* Page info */}
      {showInfo && total > 0 && (
        <div className="pagination__info">
          Showing {startIndex.toLocaleString()}-{endIndex.toLocaleString()} of {total.toLocaleString()} items
        </div>
      )}

      {/* Page navigation */}
      {totalPages > 1 && (
        <div className="pagination__nav">
          {/* First page button */}
          <button
            type="button"
            className="pagination__btn pagination__btn--first"
            onClick={() => handlePageChange(1)}
            disabled={!canGoPrevious}
            aria-label="Go to first page"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M3 2v12M13 2L7 8l6 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>

          {/* Previous page button */}
          <button
            type="button"
            className="pagination__btn pagination__btn--prev"
            onClick={() => handlePageChange(page - 1)}
            disabled={!canGoPrevious}
            aria-label="Go to previous page"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M10 2L4 8l6 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>

          {/* Page numbers */}
          <div className="pagination__pages">
            {pageNumbers.map((pageNum, index) => (
              <button
                key={`${pageNum}-${index}`}
                type="button"
                className={`
                  pagination__btn pagination__btn--page
                  ${pageNum === page ? 'pagination__btn--current' : ''}
                  ${pageNum === '...' ? 'pagination__btn--ellipsis' : ''}
                `.trim()}
                onClick={() => typeof pageNum === 'number' ? handlePageChange(pageNum) : undefined}
                disabled={pageNum === '...'}
                aria-label={`Go to page ${pageNum}`}
                aria-current={pageNum === page ? 'page' : undefined}
              >
                {pageNum}
              </button>
            ))}
          </div>

          {/* Next page button */}
          <button
            type="button"
            className="pagination__btn pagination__btn--next"
            onClick={() => handlePageChange(page + 1)}
            disabled={!canGoNext}
            aria-label="Go to next page"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M6 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>

          {/* Last page button */}
          <button
            type="button"
            className="pagination__btn pagination__btn--last"
            onClick={() => handlePageChange(totalPages)}
            disabled={!canGoNext}
            aria-label="Go to last page"
          >
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M13 2v12M3 2l6 6-6 6" stroke="currentColor" strokeWidth="1.5" fill="none" />
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}