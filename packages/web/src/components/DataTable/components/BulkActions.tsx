import { useState } from 'react';
import { BulkAction } from '../types';

interface BulkActionsProps<T> {
  actions: BulkAction[];
  selectedCount: number;
  selectedData: T[];
  onClearSelection: () => void;
  className?: string;
}

export function BulkActions<T>({
  actions,
  selectedCount,
  selectedData,
  onClearSelection,
  className = ''
}: BulkActionsProps<T>) {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  if (selectedCount === 0 || actions.length === 0) {
    return null;
  }

  const handleActionClick = (action: BulkAction) => {
    if (!action.disabled) {
      action.onClick(selectedData);
      setDropdownOpen(false);
    }
  };

  // Show first few actions as buttons, rest in dropdown
  const buttonActions = actions.slice(0, 2);
  const dropdownActions = actions.slice(2);

  return (
    <div className={`bulk-actions ${className}`}>
      <div className="bulk-actions__info">
        <span className="bulk-actions__count">
          {selectedCount} item{selectedCount !== 1 ? 's' : ''} selected
        </span>
        <button
          type="button"
          className="bulk-actions__clear"
          onClick={onClearSelection}
        >
          Clear selection
        </button>
      </div>

      <div className="bulk-actions__buttons">
        {/* Primary action buttons */}
        {buttonActions.map(action => (
          <button
            key={action.id}
            type="button"
            className={`
              bulk-actions__btn
              bulk-actions__btn--${action.color || 'primary'}
              ${action.disabled ? 'bulk-actions__btn--disabled' : ''}
            `.trim()}
            onClick={() => handleActionClick(action)}
            disabled={action.disabled}
          >
            {action.icon && <span className="bulk-actions__btn-icon">{action.icon}</span>}
            {action.label}
          </button>
        ))}

        {/* Dropdown for additional actions */}
        {dropdownActions.length > 0 && (
          <div className="bulk-actions__dropdown">
            <button
              type="button"
              className="bulk-actions__dropdown-trigger"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              More actions
              <svg
                className={`
                  bulk-actions__dropdown-arrow
                  ${dropdownOpen ? 'bulk-actions__dropdown-arrow--open' : ''}
                `.trim()}
                width="12"
                height="12"
                viewBox="0 0 12 12"
              >
                <path d="M6 8L2 4h8L6 8z" fill="currentColor" />
              </svg>
            </button>

            {dropdownOpen && (
              <>
                <div
                  className="bulk-actions__dropdown-backdrop"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="bulk-actions__dropdown-menu">
                  {dropdownActions.map(action => (
                    <button
                      key={action.id}
                      type="button"
                      className={`
                        bulk-actions__dropdown-item
                        bulk-actions__dropdown-item--${action.color || 'primary'}
                        ${action.disabled ? 'bulk-actions__dropdown-item--disabled' : ''}
                      `.trim()}
                      onClick={() => handleActionClick(action)}
                      disabled={action.disabled}
                    >
                      {action.icon && (
                        <span className="bulk-actions__dropdown-item-icon">
                          {action.icon}
                        </span>
                      )}
                      {action.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}