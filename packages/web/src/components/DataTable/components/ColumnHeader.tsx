import { useState, useRef, useEffect } from 'react';
import { TableColumn, SortConfig } from '../types';

interface ColumnHeaderProps<T> {
  column: TableColumn<T>;
  sort?: SortConfig | null;
  onSort?: (sort: SortConfig | null) => void;
  onResize?: (key: string, width: number) => void;
  resizable?: boolean;
}

export function ColumnHeader<T>({ 
  column, 
  sort, 
  onSort, 
  onResize,
  resizable = false 
}: ColumnHeaderProps<T>) {
  const [isResizing, setIsResizing] = useState(false);
  const [startWidth, setStartWidth] = useState(0);
  const [startX, setStartX] = useState(0);
  const headerRef = useRef<HTMLTableCellElement>(null);
  const resizerRef = useRef<HTMLDivElement>(null);

  const isSorted = sort?.key === column.key;
  const sortDirection = isSorted ? sort?.direction : null;

  const handleSort = () => {
    if (!column.sortable || !onSort) return;

    let newSort: SortConfig | null = null;

    if (!isSorted) {
      // Not sorted, sort ascending
      newSort = { key: column.key as string, direction: 'asc' };
    } else if (sortDirection === 'asc') {
      // Currently asc, change to desc
      newSort = { key: column.key as string, direction: 'desc' };
    }
    // Currently desc, remove sort (newSort remains null)

    onSort(newSort);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable || !onResize || !headerRef.current) return;

    e.preventDefault();
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(headerRef.current.offsetWidth);

    // Add global mouse events
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isResizing || !onResize) return;

    const diff = e.clientX - startX;
    const newWidth = Math.max(startWidth + diff, column.minWidth || 50);
    
    if (column.maxWidth && newWidth > column.maxWidth) return;

    onResize(column.key as string, newWidth);
  };

  const handleMouseUp = () => {
    setIsResizing(false);
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  };

  useEffect(() => {
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const getSortIcon = () => {
    if (!column.sortable) return null;

    if (sortDirection === 'asc') {
      return (
        <svg className="sort-icon sort-icon--asc" width="12" height="12" viewBox="0 0 12 12">
          <path d="M6 2L2 8h8L6 2z" fill="currentColor" />
        </svg>
      );
    }

    if (sortDirection === 'desc') {
      return (
        <svg className="sort-icon sort-icon--desc" width="12" height="12" viewBox="0 0 12 12">
          <path d="M6 10L2 4h8l-4 6z" fill="currentColor" />
        </svg>
      );
    }

    return (
      <svg className="sort-icon sort-icon--none" width="12" height="12" viewBox="0 0 12 12">
        <path d="M6 2L2 6h8L6 2zM6 10L2 6h8l-4 4z" fill="currentColor" opacity="0.3" />
      </svg>
    );
  };

  return (
    <th
      ref={headerRef}
      className={`
        column-header
        ${column.headerClassName || ''}
        ${column.sortable ? 'column-header--sortable' : ''}
        ${isSorted ? 'column-header--sorted' : ''}
        ${column.sticky ? 'column-header--sticky' : ''}
        ${column.align ? `column-header--${column.align}` : ''}
        ${isResizing ? 'column-header--resizing' : ''}
      `.trim()}
      style={{
        width: column.width,
        minWidth: column.minWidth,
        maxWidth: column.maxWidth,
        textAlign: column.align || 'left'
      }}
      onClick={handleSort}
    >
      <div className="column-header__content">
        <span className="column-header__label">{column.label}</span>
        {getSortIcon()}
      </div>
      
      {resizable && column.resizable !== false && (
        <div
          ref={resizerRef}
          className="column-header__resizer"
          onMouseDown={handleMouseDown}
        />
      )}
    </th>
  );
}