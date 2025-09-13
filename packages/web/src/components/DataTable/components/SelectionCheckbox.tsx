import { useCallback } from 'react';

interface SelectionCheckboxProps {
  checked: boolean;
  indeterminate?: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  className?: string;
  'aria-label'?: string;
}

export function SelectionCheckbox({
  checked,
  indeterminate = false,
  onChange,
  disabled = false,
  className = '',
  'aria-label': ariaLabel
}: SelectionCheckboxProps) {
  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  }, [onChange]);

  return (
    <div className={`selection-checkbox ${className}`}>
      <input
        type="checkbox"
        className="selection-checkbox__input"
        checked={checked}
        onChange={handleChange}
        disabled={disabled}
        ref={(input) => {
          if (input) {
            input.indeterminate = indeterminate;
          }
        }}
        aria-label={ariaLabel}
      />
      <div className="selection-checkbox__visual">
        {indeterminate ? (
          <svg className="selection-checkbox__icon" width="12" height="12" viewBox="0 0 12 12">
            <rect x="2" y="5" width="8" height="2" rx="1" fill="currentColor" />
          </svg>
        ) : checked ? (
          <svg className="selection-checkbox__icon" width="12" height="12" viewBox="0 0 12 12">
            <path
              d="M10 3L4.5 8.5L2 6"
              stroke="currentColor"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : null}
      </div>
    </div>
  );
}