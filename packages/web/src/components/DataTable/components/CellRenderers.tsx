import React, { useState } from 'react';
import { StatusBadgeProps, ProgressBarProps, CellRendererProps } from '../types';

// Status Badge Component
export function StatusBadge({ 
  status, 
  variant = 'default', 
  size = 'md' 
}: StatusBadgeProps) {
  return (
    <span 
      className={`
        status-badge 
        status-badge--${variant} 
        status-badge--${size}
      `.trim()}
    >
      {status}
    </span>
  );
}

// Progress Bar Component
export function ProgressBar({ 
  value, 
  max = 100, 
  showText = true, 
  variant = 'default', 
  size = 'md' 
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className={`progress-bar progress-bar--${variant} progress-bar--${size}`}>
      <div className="progress-bar__track">
        <div 
          className="progress-bar__fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showText && (
        <span className="progress-bar__text">
          {Math.round(percentage)}%
        </span>
      )}
    </div>
  );
}

// Action Menu Component
interface ActionMenuProps {
  actions: Array<{
    id: string;
    label: string;
    icon?: React.ReactNode;
    onClick: () => void;
    disabled?: boolean;
    color?: 'primary' | 'danger' | 'warning' | 'success';
  }>;
  className?: string;
}

export function ActionMenu({ actions, className = '' }: ActionMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={`action-menu ${className}`}>
      <button
        type="button"
        className="action-menu__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        <svg width="16" height="16" viewBox="0 0 16 16">
          <circle cx="8" cy="3" r="1.5" fill="currentColor" />
          <circle cx="8" cy="8" r="1.5" fill="currentColor" />
          <circle cx="8" cy="13" r="1.5" fill="currentColor" />
        </svg>
      </button>

      {isOpen && (
        <>
          <div 
            className="action-menu__backdrop"
            onClick={() => setIsOpen(false)}
          />
          <div className="action-menu__dropdown">
            {actions.map(action => (
              <button
                key={action.id}
                type="button"
                className={`
                  action-menu__item
                  action-menu__item--${action.color || 'primary'}
                  ${action.disabled ? 'action-menu__item--disabled' : ''}
                `.trim()}
                onClick={() => {
                  if (!action.disabled) {
                    action.onClick();
                    setIsOpen(false);
                  }
                }}
                disabled={action.disabled}
              >
                {action.icon && (
                  <span className="action-menu__item-icon">{action.icon}</span>
                )}
                {action.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Pre-built cell renderers
export const CellRenderers = {
  // Status renderer
  status: (statusMap?: Record<string, { variant: StatusBadgeProps['variant'] }>) => 
    ({ value }: CellRendererProps) => (
      <StatusBadge 
        status={value} 
        variant={statusMap?.[value]?.variant || 'default'}
      />
    ),

  // Progress renderer
  progress: (options?: { max?: number; showText?: boolean; variant?: ProgressBarProps['variant'] }) => 
    ({ value }: CellRendererProps) => (
      <ProgressBar 
        value={value} 
        max={options?.max}
        showText={options?.showText}
        variant={options?.variant}
      />
    ),

  // Date renderer
  date: (format?: Intl.DateTimeFormatOptions) => 
    ({ value }: CellRendererProps) => {
      if (!value) return '-';
      const date = new Date(value);
      return date.toLocaleDateString(undefined, format || { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric' 
      });
    },

  // DateTime renderer
  dateTime: (format?: Intl.DateTimeFormatOptions) => 
    ({ value }: CellRendererProps) => {
      if (!value) return '-';
      const date = new Date(value);
      return date.toLocaleString(undefined, format || {
        year: 'numeric',
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    },

  // Boolean renderer
  boolean: (options?: { trueText?: string; falseText?: string; showIcon?: boolean }) => 
    ({ value }: CellRendererProps) => {
      const { trueText = 'Yes', falseText = 'No', showIcon = true } = options || {};
      
      return (
        <span className={`boolean-cell boolean-cell--${value ? 'true' : 'false'}`}>
          {showIcon && (
            <svg 
              className="boolean-cell__icon" 
              width="14" 
              height="14" 
              viewBox="0 0 14 14"
            >
              {value ? (
                <path
                  d="M12 4L5.5 10.5L2 7"
                  stroke="currentColor"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : (
                <g>
                  <path d="M10.5 3.5L3.5 10.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M3.5 3.5l7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </g>
              )}
            </svg>
          )}
          {value ? trueText : falseText}
        </span>
      );
    },

  // Number renderer with formatting
  number: (options?: { 
    decimals?: number; 
    thousandsSeparator?: boolean; 
    prefix?: string; 
    suffix?: string 
  }) => ({ value }: CellRendererProps) => {
    if (value == null) return '-';
    
    const {
      decimals = 0,
      thousandsSeparator = true,
      prefix = '',
      suffix = ''
    } = options || {};
    
    const formatted = Number(value).toFixed(decimals);
    const withSeparators = thousandsSeparator 
      ? formatted.replace(/\B(?=(\d{3})+(?!\d))/g, ',')
      : formatted;
    
    return `${prefix}${withSeparators}${suffix}`;
  },

  // Link renderer
  link: (options?: { target?: string; className?: string }) => 
    ({ value, row }: CellRendererProps) => {
      if (!value) return '-';
      
      return (
        <a 
          href={value}
          target={options?.target || '_blank'}
          rel="noopener noreferrer"
          className={`cell-link ${options?.className || ''}`}
        >
          {value}
        </a>
      );
    },

  // Image renderer
  image: (options?: { width?: number; height?: number; alt?: string }) => 
    ({ value }: CellRendererProps) => {
      if (!value) return '-';
      
      return (
        <img
          src={value}
          alt={options?.alt || 'Image'}
          className="cell-image"
          style={{
            width: options?.width || 40,
            height: options?.height || 40,
            objectFit: 'cover',
            borderRadius: '4px'
          }}
        />
      );
    },

  // Tag list renderer
  tags: (options?: { maxVisible?: number; colorMap?: Record<string, string> }) => 
    ({ value }: CellRendererProps) => {
      if (!Array.isArray(value) || value.length === 0) return '-';
      
      const { maxVisible = 3, colorMap = {} } = options || {};
      const visibleTags = value.slice(0, maxVisible);
      const remainingCount = value.length - maxVisible;
      
      return (
        <div className="tag-list">
          {visibleTags.map((tag, index) => (
            <span 
              key={index}
              className="tag-list__tag"
              style={{ backgroundColor: colorMap[tag] }}
            >
              {tag}
            </span>
          ))}
          {remainingCount > 0 && (
            <span className="tag-list__more">+{remainingCount} more</span>
          )}
        </div>
      );
    }
};