# Advanced DataTable Component

A comprehensive, feature-rich data table component inspired by Sonarr/Radarr/Prowlarr applications, built with React and TypeScript.

## Features

### Core Features
- ✅ **Sortable columns** with visual indicators
- ✅ **Advanced filtering** (search, date ranges, status filters)  
- ✅ **Pagination** with page size options
- ✅ **Row selection** (single and multi-select)
- ✅ **Bulk actions** (delete, edit, etc.)
- ✅ **Export functionality** (CSV, JSON, Excel)
- ✅ **Loading states** and empty states
- ✅ **Responsive design** (mobile-friendly)
- ✅ **Custom cell renderers** (status badges, progress bars, etc.)
- ✅ **TypeScript generics** for type safety
- ⚠️ **Column resizing and reordering** (planned)

### Cell Renderers
- Status badges with color variants
- Progress bars with customizable styling
- Date/DateTime formatting
- Boolean indicators with icons
- Number formatting with prefixes/suffixes
- Image thumbnails
- Tag lists with color mapping
- Action menus
- Links

## Quick Start

```tsx
import { DataTable, CellRenderers, TableColumn } from './components/DataTable';
import './components/DataTable/DataTable.css';

interface User {
  id: number;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  createdAt: Date;
}

const columns: TableColumn<User>[] = [
  {
    key: 'name',
    label: 'Name',
    sortable: true
  },
  {
    key: 'email', 
    label: 'Email',
    sortable: true
  },
  {
    key: 'status',
    label: 'Status',
    sortable: true,
    render: CellRenderers.status({
      active: { variant: 'success' },
      inactive: { variant: 'error' }
    })
  },
  {
    key: 'createdAt',
    label: 'Created',
    sortable: true,
    render: CellRenderers.date()
  }
];

function UserTable() {
  const [users, setUsers] = useState<User[]>([]);
  
  return (
    <DataTable
      data={users}
      columns={columns}
      sortable
      filterable
      pagination
      selectable
      exportable
      bulkActions={[
        {
          id: 'activate',
          label: 'Activate',
          color: 'success',
          onClick: (selectedData) => {
            console.log('Activating users:', selectedData);
          }
        }
      ]}
      exportOptions={{
        formats: ['csv', 'json'],
        filename: 'users'
      }}
    />
  );
}
```

## API Reference

### DataTable Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `data` | `T[]` | **required** | Array of data objects |
| `columns` | `TableColumn<T>[]` | **required** | Column definitions |
| `loading` | `boolean` | `false` | Show loading state |
| `error` | `string` | `undefined` | Error message to display |
| `emptyMessage` | `string` | `'No data available'` | Empty state message |
| `className` | `string` | `''` | Additional CSS classes |

#### Sorting Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `sortable` | `boolean` | `true` | Enable column sorting |
| `defaultSort` | `SortConfig` | `undefined` | Default sort configuration |
| `onSort` | `(sort: SortConfig \| null) => void` | `undefined` | Sort change handler |

#### Filtering Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `filterable` | `boolean` | `true` | Enable filtering |
| `filters` | `FilterConfig` | `{}` | Current filter values |
| `onFilterChange` | `(filters: FilterConfig) => void` | `undefined` | Filter change handler |

#### Pagination Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `pagination` | `boolean` | `true` | Enable pagination |
| `pageSize` | `number` | `25` | Items per page |
| `pageSizeOptions` | `number[]` | `[10, 25, 50, 100]` | Page size options |
| `onPaginationChange` | `(config: PaginationConfig) => void` | `undefined` | Pagination change handler |

#### Selection Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `selectable` | `boolean` | `false` | Enable row selection |
| `selectionMode` | `'single' \| 'multiple'` | `'multiple'` | Selection mode |
| `selectedRows` | `Set<string \| number>` | `new Set()` | Currently selected rows |
| `onSelectionChange` | `(selected: Set, data: T[]) => void` | `undefined` | Selection change handler |
| `getRowId` | `(row: T, index: number) => string \| number` | `(row, index) => index` | Row ID getter |

#### Bulk Actions Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `bulkActions` | `BulkAction[]` | `[]` | Available bulk actions |

#### Export Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `exportable` | `boolean` | `false` | Enable export functionality |
| `exportOptions` | `ExportOptions` | `{ formats: ['csv', 'json'] }` | Export configuration |

#### Responsive Props
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `responsive` | `boolean` | `true` | Enable responsive behavior |
| `breakpoint` | `'sm' \| 'md' \| 'lg' \| 'xl'` | `'md'` | Responsive breakpoint |

### Column Configuration

```tsx
interface TableColumn<T> {
  key: keyof T | string;           // Data key or custom identifier
  label: string;                   // Column header text
  sortable?: boolean;              // Enable sorting for this column
  filterable?: boolean;            // Enable filtering for this column
  resizable?: boolean;             // Enable column resizing
  width?: number;                  // Fixed column width
  minWidth?: number;               // Minimum column width
  maxWidth?: number;               // Maximum column width
  render?: (value: any, row: T, column: TableColumn<T>) => React.ReactNode;
  className?: string;              // Column cell CSS classes
  headerClassName?: string;        // Column header CSS classes
  align?: 'left' | 'center' | 'right'; // Text alignment
  sticky?: boolean;                // Sticky column (planned)
  hidden?: boolean;                // Hide column
}
```

### Built-in Cell Renderers

#### Status Badge
```tsx
{
  key: 'status',
  label: 'Status',
  render: CellRenderers.status({
    active: { variant: 'success' },
    inactive: { variant: 'error' },
    pending: { variant: 'warning' }
  })
}
```

#### Progress Bar
```tsx
{
  key: 'progress',
  label: 'Progress',
  render: CellRenderers.progress({
    max: 100,
    showText: true,
    variant: 'success'
  })
}
```

#### Date Formatting
```tsx
{
  key: 'createdAt',
  label: 'Created',
  render: CellRenderers.date({
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
```

#### Boolean Display
```tsx
{
  key: 'isActive',
  label: 'Active',
  render: CellRenderers.boolean({
    trueText: 'Yes',
    falseText: 'No',
    showIcon: true
  })
}
```

#### Number Formatting
```tsx
{
  key: 'price',
  label: 'Price',
  render: CellRenderers.number({
    decimals: 2,
    prefix: '$',
    thousandsSeparator: true
  })
}
```

#### Tags
```tsx
{
  key: 'tags',
  label: 'Tags',
  render: CellRenderers.tags({
    maxVisible: 3,
    colorMap: {
      'urgent': '#ef4444',
      'normal': '#3b82f6'
    }
  })
}
```

## Styling

The component comes with comprehensive CSS styles that can be customized:

```css
/* Import the base styles */
@import './components/DataTable/DataTable.css';

/* Customize colors */
.data-table {
  --primary-color: #3b82f6;
  --success-color: #059669;
  --warning-color: #d97706;
  --error-color: #dc2626;
}

/* Custom row styling */
.data-table__row--custom {
  background-color: #f0f9ff;
}
```

## Advanced Usage

### External State Management

```tsx
function ExternalStateTable() {
  const [sort, setSort] = useState<SortConfig | null>(null);
  const [filters, setFilters] = useState<FilterConfig>({});
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 25,
    total: 0
  });

  return (
    <DataTable
      data={data}
      columns={columns}
      // External state
      sort={sort}
      onSort={setSort}
      filters={filters}
      onFilterChange={setFilters}
      pagination={pagination}
      onPaginationChange={setPagination}
    />
  );
}
```

### Custom Cell Renderers

```tsx
const customColumns: TableColumn<MediaItem>[] = [
  {
    key: 'poster',
    label: 'Poster',
    render: (value, row) => (
      <img 
        src={value} 
        alt={row.title}
        style={{ width: 48, height: 72, objectFit: 'cover' }}
      />
    )
  },
  {
    key: 'title',
    label: 'Title',
    render: (value, row) => (
      <div>
        <div style={{ fontWeight: 'bold' }}>{value}</div>
        <div style={{ fontSize: '12px', opacity: 0.7 }}>({row.year})</div>
      </div>
    )
  }
];
```

### Bulk Actions

```tsx
const bulkActions: BulkAction[] = [
  {
    id: 'delete',
    label: 'Delete Selected',
    color: 'danger',
    icon: <TrashIcon />,
    onClick: async (selectedData) => {
      if (confirm(`Delete ${selectedData.length} items?`)) {
        await deleteItems(selectedData.map(item => item.id));
        // Refresh data
      }
    }
  },
  {
    id: 'export',
    label: 'Export Selected',
    color: 'primary',
    onClick: (selectedData) => {
      exportToCSV(selectedData);
    }
  }
];
```

## File Structure

```
DataTable/
├── DataTable.tsx              # Main component
├── DataTable.css              # Styles
├── types.ts                   # TypeScript interfaces
├── index.ts                   # Public API exports
├── hooks/
│   └── useTableState.ts       # State management hook
├── components/
│   ├── ColumnHeader.tsx       # Sortable column headers
│   ├── SelectionCheckbox.tsx  # Selection controls
│   ├── FilterBar.tsx          # Filtering interface
│   ├── Pagination.tsx         # Pagination controls
│   ├── BulkActions.tsx        # Bulk action buttons
│   ├── ExportButton.tsx       # Export functionality
│   ├── CellRenderers.tsx      # Pre-built cell renderers
│   └── TableStates.tsx        # Loading/empty states
├── utils/
│   └── exportUtils.ts         # Export utilities
├── examples/
│   └── MediaLibraryExample.tsx # Example usage
└── README.md                  # This file
```

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- IE11+ (with polyfills)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Dependencies

- React 18+
- TypeScript 4.5+

## Contributing

1. Add new cell renderers to `CellRenderers.tsx`
2. Extend the `TableColumn` interface for new features
3. Update styles in `DataTable.css`
4. Add examples to demonstrate new functionality

## Roadmap

- [ ] Column resizing and reordering
- [ ] Virtual scrolling for large datasets
- [ ] Column groups/nested headers
- [ ] Row grouping and aggregation
- [ ] Advanced filtering (date pickers, multi-select)
- [ ] Keyboard navigation
- [ ] Accessibility improvements (ARIA labels)
- [ ] Print-friendly layouts