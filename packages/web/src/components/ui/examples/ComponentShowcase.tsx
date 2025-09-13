import React, { useState } from 'react';
import {
  Button,
  Input,
  Select,
  Checkbox,
  Modal,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
  Alert,
  Badge,
  StatusBadge,
  LoadingSpinner,
  Skeleton,
  Form,
  FormSection,
  FormRow,
  FormActions,
  ThemeToggle
} from '../index';

/**
 * Component Showcase - demonstrates all UI components
 * This is for development and testing purposes
 */
export const ComponentShowcase: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [alertVisible, setAlertVisible] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(false);
  const [selectValue, setSelectValue] = useState('');

  const selectOptions = [
    { value: 'option1', label: 'Option 1' },
    { value: 'option2', label: 'Option 2' },
    { value: 'option3', label: 'Option 3' }
  ];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted');
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Braidarr UI Component Library
        </h1>
        <ThemeToggle />
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="outline">Outline</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button loading>Loading</Button>
              <Button disabled>Disabled</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Form Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Form Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <Form onSubmit={handleFormSubmit}>
            <FormSection title="User Information">
              <FormRow>
                <Input label="First Name" placeholder="Enter first name" />
                <Input label="Last Name" placeholder="Enter last name" />
              </FormRow>
              <Input
                label="Email"
                type="email"
                placeholder="user@example.com"
                helperText="We'll never share your email"
              />
              <Input
                label="Password"
                type="password"
                error="Password must be at least 8 characters"
              />
              <Select
                label="Country"
                options={selectOptions}
                value={selectValue}
                onChange={setSelectValue}
                placeholder="Select a country"
              />
              <Checkbox
                label="I agree to the terms and conditions"
                checked={checkboxChecked}
                onChange={(e) => setCheckboxChecked(e.target.checked)}
              />
            </FormSection>
            <FormActions>
              <Button variant="secondary" type="button">Cancel</Button>
              <Button type="submit">Submit</Button>
            </FormActions>
          </Form>
        </CardContent>
      </Card>

      {/* Badges */}
      <Card>
        <CardHeader>
          <CardTitle>Badges</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Badge>Default</Badge>
              <Badge variant="primary">Primary</Badge>
              <Badge variant="success">Success</Badge>
              <Badge variant="warning">Warning</Badge>
              <Badge variant="danger">Danger</Badge>
              <Badge variant="info">Info</Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <StatusBadge status="active" />
              <StatusBadge status="inactive" />
              <StatusBadge status="pending" />
              <StatusBadge status="error" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Alerts */}
      <div className="space-y-4">
        {alertVisible && (
          <Alert
            type="info"
            title="Information"
            dismissible
            onDismiss={() => setAlertVisible(false)}
          >
            This is an informational alert with a dismiss button.
          </Alert>
        )}
        <Alert type="success">
          Operation completed successfully!
        </Alert>
        <Alert type="warning" title="Warning">
          Please check your configuration settings.
        </Alert>
        <Alert type="error" title="Error">
          Failed to connect to the server. Please try again later.
        </Alert>
      </div>

      {/* Loading States */}
      <Card>
        <CardHeader>
          <CardTitle>Loading States</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div>
              <h4 className="text-sm font-medium mb-2">Spinners</h4>
              <div className="flex items-center gap-4">
                <LoadingSpinner size="sm" />
                <LoadingSpinner size="md" />
                <LoadingSpinner size="lg" />
              </div>
            </div>
            <div>
              <h4 className="text-sm font-medium mb-2">Skeletons</h4>
              <div className="space-y-2">
                <Skeleton width="60%" height="1.5rem" />
                <Skeleton lines={3} />
                <Skeleton width="40%" height="1rem" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card shadow="sm">
          <CardContent>
            <h3 className="font-semibold mb-2">Simple Card</h3>
            <p className="text-gray-600 dark:text-gray-400">
              This is a simple card with minimal styling.
            </p>
          </CardContent>
        </Card>

        <Card shadow="md" hover>
          <CardHeader>
            <CardTitle>Interactive Card</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 dark:text-gray-400">
              This card has hover effects and more prominent shadows.
            </p>
          </CardContent>
          <CardFooter>
            <Button size="sm" variant="outline">Learn More</Button>
          </CardFooter>
        </Card>
      </div>

      {/* Modal */}
      <Card>
        <CardHeader>
          <CardTitle>Modal</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={() => setIsModalOpen(true)}>Open Modal</Button>
        </CardContent>
      </Card>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Example Modal"
        size="md"
      >
        <div className="space-y-4">
          <p>This is an example modal dialog. It includes:</p>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>Keyboard navigation (ESC to close)</li>
            <li>Click outside to close</li>
            <li>Focus management</li>
            <li>Accessible ARIA attributes</li>
          </ul>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => setIsModalOpen(false)}>
              Confirm
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};