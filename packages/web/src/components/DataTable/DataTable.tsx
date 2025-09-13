import { useCallback, useMemo } from 'react';
import { DataTableProps } from './types';
import { useTableState } from './hooks/useTableState';
import { ColumnHeader } from './components/ColumnHeader';
import { SelectionCheckbox } from './components/SelectionCheckbox';
import { FilterBar } from './components/FilterBar';
import { Pagination } from './components/Pagination';
import { BulkActions } from './components/BulkActions';
import { ExportButton } from './components/ExportButton';
import { LoadingState, EmptyState, ErrorState, FilteredEmptyState, TableOverlay } from './components/TableStates';

export function DataTable<T extends Record<string, any>>({
  data,
  columns,
  loading = false,
  error,
  emptyMessage = 'No data available',
  className = '',
  
  // Sorting
  sortable = true,
  defaultSort,
  onSort,
  
  // Filtering
  filterable = true,
  filters: externalFilters,
  onFilterChange: externalOnFilterChange,
  
  // Pagination
  pagination = true,
  pageSize = 25,
  pageSizeOptions = [10, 25, 50, 100],
  onPaginationChange: externalOnPaginationChange,
  
  // Selection
  selectable = false,
  selectionMode = 'multiple',
  selectedRows: externalSelectedRows,
  onSelectionChange: externalOnSelectionChange,
  getRowId = (row, index) => index,
  
  // Bulk actions
  bulkActions = [],
  
  // Export
  exportable = false,
  exportOptions = { formats: ['csv', 'json'] },
  
  // Responsive
  responsive = true,
  breakpoint = 'md',
  
  // Customization
  rowClassName,
  onRowClick,
  onRowDoubleClick
}: DataTableProps<T>) {
  
  // Use internal state management
  const {
    tableState,
    handlers,
    computed,
    setters
  } = useTableState({
    data,
    defaultSort,
    defaultPageSize: pageSize,
    getRowId
  });

  // Use external state if provided, otherwise use internal state
  const sort = tableState.sort;
  const filters = externalFilters || tableState.filters;
  const paginationState = tableState.pagination;
  const selectedRows = externalSelectedRows || tableState.selection.selectedRows;

  // Handle external callbacks
  const handleSort = useCallback((newSort: any) => {
    if (onSort) {
      onSort(newSort);
    } else {
      handlers.handleSort(newSort);
    }
  }, [onSort, handlers.handleSort]);

  const handleFilterChange = useCallback((newFilters: any) => {
    if (externalOnFilterChange) {
      externalOnFilterChange(newFilters);
    } else {
      handlers.handleFilterChange(newFilters);
    }
  }, [externalOnFilterChange, handlers.handleFilterChange]);

  const handlePaginationChange = useCallback((newPagination: any) => {
    if (externalOnPaginationChange) {
      externalOnPaginationChange(newPagination);
    } else {
      handlers.handlePaginationChange(newPagination);
    }
  }, [externalOnPaginationChange, handlers.handlePaginationChange]);

  const handleSelectionChange = useCallback((newSelection: Set<string | number>) => {
    if (externalOnSelectionChange) {
      const selectedData = data.filter(row => newSelection.has(getRowId(row)));
      externalOnSelectionChange(newSelection, selectedData);
    } else {
      handlers.handleSelectionChange(newSelection);
    }
  }, [externalOnSelectionChange, handlers.handleSelectionChange, data, getRowId]);

  // Status options for filters (you might want to make this configurable)
  const statusOptions = useMemo(() => {
    const statuses = new Set<string>();
    data.forEach(row => {
      const status = row.status;
      if (status && typeof status === 'string') {
        statuses.add(status);
      }
    });
    return Array.from(statuses).map(status => ({ value: status, label: status }));
  }, [data]);

  const hasActiveFilters = !!(
    filters.search ||
    filters.dateRange?.start ||
    filters.dateRange?.end ||
    (filters.status && filters.status.length > 0)
  );

  const displayData = tableState.data;
  const selectedData = computed.selectedData;

  // Render table cell
  const renderCell = useCallback((row: T, column: any, rowIndex: number, columnIndex: number) => {
    const value = row[column.key];
    
    if (column.render) {
      return column.render(value, row, column);
    }
    
    if (value === null || value === undefined) {
      return '-';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    if (value instanceof Date) {
      return value.toLocaleDateString();
    }
    
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    
    return String(value);
  }, []);

  // Render row selection checkbox
  const renderRowSelection = useCallback((row: T, rowIndex: number) => {
    if (!selectable) return null;

    const rowId = getRowId(row, rowIndex);
    const isSelected = selectedRows.has(rowId);

    return (
      <td className="data-table__cell data-table__cell--selection">
        <SelectionCheckbox
          checked={isSelected}
          onChange={(checked) => {
            const newSelection = new Set(selectedRows);
            if (checked) {
              newSelection.add(rowId);
            } else {
              newSelection.delete(rowId);
            }
            handleSelectionChange(newSelection);
          }}
          aria-label={`Select row ${rowIndex + 1}`}
        />
      </td>
    );
  }, [selectable, selectedRows, getRowId, handleSelectionChange]);

  // Render header selection checkbox
  const renderHeaderSelection = useCallback(() => {
    if (!selectable || selectionMode !== 'multiple') return null;

    return (
      <th className="data-table__header-cell data-table__header-cell--selection">
        <SelectionCheckbox
          checked={computed.isAllSelected}
          indeterminate={computed.isPartiallySelected}
          onChange={(checked) => {
            if (checked) {
              computed.selectAll();
            } else {
              handlers.clearSelection();
            }
          }}
          aria-label="Select all rows"
        />
      </th>
    );
  }, [selectable, selectionMode, computed.isAllSelected, computed.isPartiallySelected]);

  return (
    <div className={`data-table ${className} ${responsive ? `data-table--responsive-${breakpoint}` : ''}`}>
      {/* Toolbar */}
      <div className="data-table__toolbar">
        {/* Filters */}
        {filterable && (
          <FilterBar
            filters={filters}
            onFilterChange={handleFilterChange}
            statusOptions={statusOptions}
            className="data-table__filters"
          />
        )}

        {/* Actions */}
        <div className="data-table__actions">
          {/* Bulk actions */}
          {selectable && bulkActions.length > 0 && (
            <BulkActions
              actions={bulkActions}
              selectedCount={selectedRows.size}
              selectedData={selectedData}
              onClearSelection={handlers.clearSelection}
            />
          )}

          {/* Export button */}
          {exportable && (
            <ExportButton
              data={displayData}
              columns={columns}
              selectedData={selectedData}
              exportOptions={exportOptions}
            />
          )}
        </div>
      </div>

      {/* Table container */}
      <div className="data-table__container">
        <TableOverlay show={loading}>
          <LoadingState columns={columns.length + (selectable ? 1 : 0)} />
        </TableOverlay>

        {/* Error state */}
        {error && !loading && (
          <ErrorState 
            error={error} 
            onRetry={() => window.location.reload()}
          />
        )}

        {/* Empty states */}
        {!loading && !error && displayData.length === 0 && (
          <>
            {hasActiveFilters ? (
              <FilteredEmptyState 
                onClearFilters={() => handleFilterChange({})}
                hasActiveFilters={hasActiveFilters}
              />
            ) : (
              <EmptyState message={emptyMessage} />
            )}
          </>
        )}

        {/* Data table */}
        {!loading && !error && displayData.length > 0 && (
          <table className="data-table__table">
            <thead className="data-table__header">
              <tr className="data-table__header-row">
                {renderHeaderSelection()}
                {columns.filter(col => !col.hidden).map((column, index) => (
                  <ColumnHeader
                    key={column.key as string}
                    column={column}
                    sort={sort}
                    onSort={sortable ? handleSort : undefined}
                    resizable={false} // TODO: Implement resizing
                  />
                ))}
              </tr>
            </thead>
            <tbody className="data-table__body">
              {displayData.map((row, rowIndex) => (
                <tr
                  key={getRowId(row, rowIndex)}
                  className={`
                    data-table__row
                    ${selectedRows.has(getRowId(row, rowIndex)) ? 'data-table__row--selected' : ''}
                    ${rowClassName ? rowClassName(row, rowIndex) : ''}
                  `.trim()}
                  onClick={() => onRowClick?.(row, rowIndex)}
                  onDoubleClick={() => onRowDoubleClick?.(row, rowIndex)}
                >
                  {renderRowSelection(row, rowIndex)}
                  {columns.filter(col => !col.hidden).map((column, columnIndex) => (
                    <td
                      key={column.key as string}
                      className={`
                        data-table__cell
                        ${column.className || ''}
                        ${column.align ? `data-table__cell--${column.align}` : ''}
                      `.trim()}
                      style={{
                        textAlign: column.align || 'left'
                      }}
                    >
                      {renderCell(row, column, rowIndex, columnIndex)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && !loading && !error && displayData.length > 0 && (
        <Pagination
          pagination={paginationState}
          onPaginationChange={handlePaginationChange}
          pageSizeOptions={pageSizeOptions}
          className="data-table__pagination"
        />
      )}
    </div>
  );
}