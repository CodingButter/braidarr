// Loading State Component
interface LoadingStateProps {
  rows?: number;
  columns?: number;
  className?: string;
}

export function LoadingState({ 
  rows = 10, 
  columns = 5, 
  className = '' 
}: LoadingStateProps) {
  return (
    <div className={`table-loading ${className}`}>
      <div className="table-loading__header">
        {Array.from({ length: columns }, (_, i) => (
          <div key={i} className="table-loading__header-cell">
            <div className="skeleton skeleton--header" />
          </div>
        ))}
      </div>
      <div className="table-loading__body">
        {Array.from({ length: rows }, (_, rowIndex) => (
          <div key={rowIndex} className="table-loading__row">
            {Array.from({ length: columns }, (_, colIndex) => (
              <div key={colIndex} className="table-loading__cell">
                <div className={`skeleton skeleton--cell skeleton--${Math.random() > 0.5 ? 'wide' : 'narrow'}`} />
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// Empty State Component
interface EmptyStateProps {
  message?: string;
  description?: string;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  message = 'No data available',
  description = 'There are no items to display at this time.',
  icon,
  action,
  className = ''
}: EmptyStateProps) {
  const defaultIcon = (
    <svg width="64" height="64" viewBox="0 0 64 64" className="empty-state__default-icon">
      <rect
        x="8"
        y="12"
        width="48"
        height="40"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M16 20h32M16 28h24M16 36h16"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="44" cy="36" r="2" fill="currentColor" opacity="0.3" />
    </svg>
  );

  return (
    <div className={`empty-state ${className}`}>
      <div className="empty-state__content">
        <div className="empty-state__icon">
          {icon || defaultIcon}
        </div>
        <h3 className="empty-state__message">{message}</h3>
        <p className="empty-state__description">{description}</p>
        {action && (
          <button
            type="button"
            className="empty-state__action"
            onClick={action.onClick}
          >
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}

// Error State Component
interface ErrorStateProps {
  error?: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorState({
  error = 'An error occurred while loading data',
  onRetry,
  className = ''
}: ErrorStateProps) {
  return (
    <div className={`error-state ${className}`}>
      <div className="error-state__content">
        <div className="error-state__icon">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <circle
              cx="32"
              cy="32"
              r="28"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path
              d="M32 16v16M32 40v4"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <h3 className="error-state__title">Something went wrong</h3>
        <p className="error-state__message">{error}</p>
        {onRetry && (
          <button
            type="button"
            className="error-state__retry"
            onClick={onRetry}
          >
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

// Filtered Empty State Component
interface FilteredEmptyStateProps {
  onClearFilters: () => void;
  hasActiveFilters?: boolean;
  className?: string;
}

export function FilteredEmptyState({
  onClearFilters,
  hasActiveFilters = true,
  className = ''
}: FilteredEmptyStateProps) {
  return (
    <div className={`filtered-empty-state ${className}`}>
      <div className="filtered-empty-state__content">
        <div className="filtered-empty-state__icon">
          <svg width="64" height="64" viewBox="0 0 64 64">
            <path
              d="M12 16h40l-16 16v16l-8-4V32L12 16z"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="50" cy="50" r="8" fill="none" stroke="currentColor" strokeWidth="2" />
            <path d="M45 45l10 10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </div>
        <h3 className="filtered-empty-state__title">No results found</h3>
        <p className="filtered-empty-state__description">
          No items match your current filter criteria.
        </p>
        {hasActiveFilters && (
          <button
            type="button"
            className="filtered-empty-state__action"
            onClick={onClearFilters}
          >
            Clear all filters
          </button>
        )}
      </div>
    </div>
  );
}

// Generic table overlay component
interface TableOverlayProps {
  show: boolean;
  children: React.ReactNode;
  className?: string;
}

export function TableOverlay({ 
  show, 
  children, 
  className = '' 
}: TableOverlayProps) {
  if (!show) return null;

  return (
    <div className={`table-overlay ${className}`}>
      <div className="table-overlay__content">
        {children}
      </div>
    </div>
  );
}

// Compact loading indicator for in-place updates
export function InlineLoader({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <div className={`inline-loader ${className}`} style={{ width: size, height: size }}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        className="inline-loader__spinner"
      >
        <circle
          cx="12"
          cy="12"
          r="10"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray="31.416"
          strokeDashoffset="31.416"
        />
      </svg>
    </div>
  );
}