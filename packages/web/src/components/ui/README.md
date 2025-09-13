# Braidarr UI Component Library

A comprehensive component library for Braidarr that provides reusable UI components matching the *arr application design system.

## Features

- **TypeScript Support**: Full TypeScript interfaces and type safety
- **Theme Aware**: Built-in support for light/dark themes
- **Accessibility**: Proper ARIA attributes and keyboard navigation
- **Responsive**: Mobile-first responsive design
- **Consistent**: Follows *arr application design patterns
- **Modular**: Import only what you need

## Installation

Components are part of the Braidarr web application. Import from the ui package:

```tsx
import { Button, Card, Input, Modal } from '@/components/ui';
```

## Theme Support

All components support light and dark themes automatically. Use the ThemeProvider to manage theme state:

```tsx
import { ThemeProvider, ThemeToggle } from '@/components/ui';

function App() {
  return (
    <ThemeProvider defaultTheme="system">
      <div className="app">
        <ThemeToggle />
        {/* Your app content */}
      </div>
    </ThemeProvider>
  );
}
```

## Components

### Button

Versatile button component with multiple variants and sizes.

```tsx
import { Button } from '@/components/ui';

<Button variant="primary" size="md" onClick={handleClick}>
  Click me
</Button>

<Button variant="danger" loading disabled>
  Loading...
</Button>
```

**Props:**
- `variant`: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'ghost' | 'outline'
- `size`: 'sm' | 'md' | 'lg'
- `loading`: boolean
- `disabled`: boolean

### Input Fields

Form input components with error states and validation.

```tsx
import { Input, Select, Checkbox } from '@/components/ui';

<Input
  label="Email"
  type="email"
  placeholder="Enter your email"
  error="Please enter a valid email"
  helperText="We'll never share your email"
/>

<Select
  label="Country"
  options={[
    { value: 'us', label: 'United States' },
    { value: 'ca', label: 'Canada' }
  ]}
  placeholder="Select a country"
/>

<Checkbox
  label="I agree to the terms"
  error="You must agree to continue"
/>
```

### Modal

Accessible modal dialog with customizable sizes.

```tsx
import { Modal, Button } from '@/components/ui';

const [isOpen, setIsOpen] = useState(false);

<Modal
  isOpen={isOpen}
  onClose={() => setIsOpen(false)}
  title="Confirm Action"
  size="md"
>
  <p>Are you sure you want to delete this item?</p>
  <div className="flex justify-end space-x-2 mt-4">
    <Button variant="secondary" onClick={() => setIsOpen(false)}>
      Cancel
    </Button>
    <Button variant="danger" onClick={handleDelete}>
      Delete
    </Button>
  </div>
</Modal>
```

### Card

Flexible card component for content sections.

```tsx
import { Card, CardHeader, CardTitle, CardContent, CardFooter, Button } from '@/components/ui';

<Card shadow="md" hover>
  <CardHeader>
    <CardTitle>Server Status</CardTitle>
  </CardHeader>
  <CardContent>
    <p>All services are running normally.</p>
  </CardContent>
  <CardFooter>
    <Button size="sm">Refresh</Button>
  </CardFooter>
</Card>
```

### Loading States

Components for loading and skeleton states.

```tsx
import { LoadingSpinner, Skeleton, SkeletonCard } from '@/components/ui';

<LoadingSpinner size="lg" />

<Skeleton lines={3} />
<SkeletonCard />
```

### Alerts

Notification components for different message types.

```tsx
import { Alert } from '@/components/ui';

<Alert type="success" dismissible onDismiss={handleDismiss}>
  Your changes have been saved successfully!
</Alert>

<Alert type="error" title="Error">
  Failed to connect to the server. Please try again.
</Alert>
```

### Forms

Form wrapper components with consistent styling.

```tsx
import { Form, FormSection, FormRow, FormActions, Button } from '@/components/ui';

<Form onSubmit={handleSubmit}>
  <FormSection title="Account Information">
    <FormRow>
      <Input label="First Name" />
      <Input label="Last Name" />
    </FormRow>
    <Input label="Email" type="email" />
  </FormSection>
  
  <FormActions>
    <Button variant="secondary">Cancel</Button>
    <Button type="submit">Save Changes</Button>
  </FormActions>
</Form>
```

### Badges

Badge components for status indicators and labels.

```tsx
import { Badge, StatusBadge, CountBadge, DotBadge } from '@/components/ui';

<Badge variant="primary">New</Badge>
<StatusBadge status="active" />
<CountBadge count={42} />
<DotBadge variant="success" />
```

## Styling

Components use Tailwind CSS classes and follow the *arr design system:

- **Colors**: Blue primary, semantic colors for success/warning/danger
- **Typography**: Inter font family, consistent sizing
- **Spacing**: 4px base unit (0.25rem)
- **Shadows**: Subtle shadows for depth
- **Borders**: Rounded corners, subtle borders

### CSS Variables

The following CSS variables are available for customization:

```css
:root {
  --color-primary: #646cff;
  --color-primary-dark: #535bf2;
  --color-background: #ffffff;
  --color-background-alt: #f8f9fa;
  --color-text: #213547;
  --color-text-light: #6c757d;
  --color-border: #e9ecef;
}
```

## Best Practices

1. **Accessibility**: Always provide `aria-label` for buttons without text
2. **Form Validation**: Use the `error` prop to show validation messages
3. **Loading States**: Use `loading` prop on buttons during async operations
4. **Keyboard Navigation**: All interactive components support keyboard navigation
5. **Theme Consistency**: Use theme-aware classes for custom components

## Examples

See the component files for detailed prop interfaces and usage examples. Each component includes proper TypeScript types and comprehensive accessibility features.