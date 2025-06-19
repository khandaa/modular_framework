import React, { useState } from 'react';
import { action } from '@storybook/addon-actions';
import Form from './Form';
import { Typography, Box } from '@mui/material';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';

export default {
  title: 'Components/Form',
  component: Form,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle: 'A reusable form builder component for consistent form creation',
  },
};

// Simple login form demo
export const LoginForm = () => {
  const [values, setValues] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const handleSubmit = async (formValues) => {
    setLoading(true);
    setError('');
    setSuccess('');
    
    // Simulate API call
    action('form-submit')(formValues);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful login
    if (formValues.email === 'admin@example.com' && formValues.password === 'password123') {
      setSuccess('Login successful!');
    } else {
      setError('Invalid email or password.');
    }
    
    setLoading(false);
  };
  
  return (
    <Form
      title="Login"
      subtitle="Enter your credentials to access your account"
      fields={[
        {
          name: 'email',
          label: 'Email Address',
          type: 'email',
          placeholder: 'your@email.com',
          startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
          validation: {
            required: true,
            pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
            patternMessage: 'Please enter a valid email address',
          },
        },
        {
          name: 'password',
          label: 'Password',
          type: 'password',
          startAdornment: <LockIcon color="action" sx={{ mr: 1 }} />,
          validation: {
            required: true,
            minLength: 8,
          },
        },
        {
          name: 'remember',
          label: 'Remember me',
          type: 'checkbox',
        },
      ]}
      values={values}
      onChange={setValues}
      onSubmit={handleSubmit}
      submitText="Login"
      loading={loading}
      error={error}
      success={success}
      layout="full"
    />
  );
};

// Registration form with different field types
export const RegistrationForm = () => {
  const [values, setValues] = useState({});
  
  const fields = [
    {
      name: 'heading',
      label: 'Personal Information',
      type: 'heading',
    },
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      gridProps: { xs: 12, sm: 6 },
      validation: { required: true },
      startAdornment: <AccountCircleIcon color="action" sx={{ mr: 1 }} />,
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      gridProps: { xs: 12, sm: 6 },
      validation: { required: true },
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      validation: {
        required: true,
        pattern: '^[\\w-\\.]+@([\\w-]+\\.)+[\\w-]{2,4}$',
        patternMessage: 'Please enter a valid email address',
      },
      startAdornment: <EmailIcon color="action" sx={{ mr: 1 }} />,
    },
    {
      name: 'birthDate',
      label: 'Date of Birth',
      type: 'date',
      gridProps: { xs: 12, sm: 6 },
    },
    {
      name: 'gender',
      label: 'Gender',
      type: 'radio',
      gridProps: { xs: 12, sm: 6 },
      options: [
        { value: 'male', label: 'Male' },
        { value: 'female', label: 'Female' },
        { value: 'other', label: 'Other' },
      ],
    },
    {
      name: 'divider1',
      type: 'divider',
    },
    {
      name: 'heading2',
      label: 'Account Information',
      type: 'heading',
    },
    {
      name: 'username',
      label: 'Username',
      type: 'text',
      validation: {
        required: true,
        minLength: 4,
      },
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      validation: {
        required: true,
        minLength: 8,
        validate: (value) => {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value)
            ? null
            : 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character';
        }
      },
      helperText: 'Minimum 8 characters with uppercase, lowercase, number, and special character',
      gridProps: { xs: 12, sm: 6 },
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      validation: {
        required: true,
        validate: (value, formValues) => {
          return value === formValues.password ? null : 'Passwords do not match';
        },
      },
      gridProps: { xs: 12, sm: 6 },
    },
    {
      name: 'userType',
      label: 'User Type',
      type: 'select',
      options: [
        { value: 'user', label: 'Regular User' },
        { value: 'admin', label: 'Administrator' },
        { value: 'editor', label: 'Content Editor' },
      ],
      validation: { required: true },
    },
    {
      name: 'divider2',
      type: 'divider',
    },
    {
      name: 'heading3',
      label: 'Preferences',
      type: 'heading',
    },
    {
      name: 'receiveEmails',
      label: 'Receive Marketing Emails',
      type: 'switch',
    },
    {
      name: 'bio',
      label: 'About You',
      type: 'textarea',
      rows: 3,
      helperText: 'Tell us about yourself (optional)',
    },
    {
      name: 'terms',
      label: 'I agree to the Terms and Conditions',
      type: 'checkbox',
      validation: {
        required: true,
        validate: (value) => value ? null : 'You must accept the terms',
      },
    },
  ];
  
  return (
    <Form
      title="Create Account"
      subtitle="Fill in the details to register a new account"
      fields={fields}
      values={values}
      onChange={setValues}
      onSubmit={action('registration-submit')}
      submitText="Register"
      cancelText="Cancel"
      onCancel={action('cancel')}
    />
  );
};

// Different layouts showcase
export const LayoutVariations = () => {
  // Generate field sets for each layout
  const createFields = (suffix) => [
    {
      name: `name${suffix}`,
      label: 'Name',
      type: 'text',
    },
    {
      name: `email${suffix}`,
      label: 'Email',
      type: 'email',
    },
    {
      name: `phone${suffix}`,
      label: 'Phone Number',
      type: 'tel',
    },
    {
      name: `address${suffix}`,
      label: 'Address',
      type: 'text',
    },
  ];
  
  return (
    <>
      <Box mb={6}>
        <Typography variant="h6" gutterBottom>Full Width Layout</Typography>
        <Form
          fields={createFields('1')}
          onSubmit={action('submit')}
          layout="full"
        />
      </Box>
      
      <Box mb={6}>
        <Typography variant="h6" gutterBottom>Half Width Layout</Typography>
        <Form
          fields={createFields('2')}
          onSubmit={action('submit')}
          layout="half"
        />
      </Box>
      
      <Box mb={6}>
        <Typography variant="h6" gutterBottom>Third Width Layout</Typography>
        <Form
          fields={createFields('3')}
          onSubmit={action('submit')}
          layout="third"
        />
      </Box>
      
      <Box>
        <Typography variant="h6" gutterBottom>Quarter Width Layout</Typography>
        <Form
          fields={createFields('4')}
          onSubmit={action('submit')}
          layout="quarter"
        />
      </Box>
    </>
  );
};

// States showcase
export const FormStates = () => {
  return (
    <>
      <Box mb={6}>
        <Typography variant="h6" gutterBottom>Loading State</Typography>
        <Form
          title="Loading Form"
          fields={[
            { name: 'field1', label: 'Field 1', type: 'text' },
            { name: 'field2', label: 'Field 2', type: 'text' },
          ]}
          onSubmit={action('submit')}
          loading={true}
        />
      </Box>
      
      <Box mb={6}>
        <Typography variant="h6" gutterBottom>Error State</Typography>
        <Form
          title="Error Form"
          fields={[
            { name: 'field1', label: 'Field 1', type: 'text' },
            { name: 'field2', label: 'Field 2', type: 'text' },
          ]}
          onSubmit={action('submit')}
          error="Something went wrong while submitting the form. Please try again."
        />
      </Box>
      
      <Box mb={6}>
        <Typography variant="h6" gutterBottom>Success State</Typography>
        <Form
          title="Success Form"
          fields={[
            { name: 'field1', label: 'Field 1', type: 'text' },
            { name: 'field2', label: 'Field 2', type: 'text' },
          ]}
          onSubmit={action('submit')}
          success="Form submitted successfully!"
        />
      </Box>
      
      <Box mb={6}>
        <Typography variant="h6" gutterBottom>Disabled State</Typography>
        <Form
          title="Disabled Form"
          fields={[
            { name: 'field1', label: 'Field 1', type: 'text' },
            { name: 'field2', label: 'Field 2', type: 'text' },
          ]}
          onSubmit={action('submit')}
          disabled={true}
        />
      </Box>
    </>
  );
};

// Field types showcase
export const FieldTypesShowcase = () => {
  const [values, setValues] = useState({
    select: 'option1',
    checkbox: true,
    switch: true,
    radio: 'option1',
    date: new Date(),
  });
  
  const fields = [
    {
      name: 'heading1',
      label: 'Text Input Fields',
      type: 'heading',
    },
    {
      name: 'text',
      label: 'Text Field',
      type: 'text',
      placeholder: 'Enter text here',
      helperText: 'Standard text input field',
      gridProps: { xs: 12, sm: 4 },
    },
    {
      name: 'email',
      label: 'Email Field',
      type: 'email',
      placeholder: 'your@email.com',
      helperText: 'Email input with validation',
      gridProps: { xs: 12, sm: 4 },
    },
    {
      name: 'password',
      label: 'Password Field',
      type: 'password',
      helperText: 'Password input with masking',
      gridProps: { xs: 12, sm: 4 },
    },
    {
      name: 'number',
      label: 'Number Field',
      type: 'number',
      min: 0,
      max: 100,
      step: 5,
      helperText: 'Numeric input with min/max/step',
      gridProps: { xs: 12, sm: 4 },
    },
    {
      name: 'tel',
      label: 'Telephone Field',
      type: 'tel',
      placeholder: '+1 (123) 456-7890',
      helperText: 'Telephone input field',
      gridProps: { xs: 12, sm: 4 },
    },
    {
      name: 'url',
      label: 'URL Field',
      type: 'url',
      placeholder: 'https://example.com',
      helperText: 'URL input field',
      gridProps: { xs: 12, sm: 4 },
    },
    {
      name: 'textarea',
      label: 'Text Area',
      type: 'textarea',
      rows: 3,
      helperText: 'Multi-line text input',
    },
    
    {
      name: 'divider1',
      type: 'divider',
    },
    
    {
      name: 'heading2',
      label: 'Selection Fields',
      type: 'heading',
    },
    {
      name: 'select',
      label: 'Select Field',
      type: 'select',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
      helperText: 'Dropdown selection field',
      gridProps: { xs: 12, sm: 4 },
    },
    {
      name: 'checkbox',
      label: 'Checkbox Field',
      type: 'checkbox',
      helperText: 'Single checkbox option',
      gridProps: { xs: 12, sm: 4 },
    },
    {
      name: 'switch',
      label: 'Switch Field',
      type: 'switch',
      helperText: 'Toggle switch option',
      gridProps: { xs: 12, sm: 4 },
    },
    {
      name: 'radio',
      label: 'Radio Button Group',
      type: 'radio',
      options: [
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' },
        { value: 'option3', label: 'Option 3' },
      ],
      helperText: 'Radio button selection group',
    },
    
    {
      name: 'divider2',
      type: 'divider',
    },
    
    {
      name: 'heading3',
      label: 'Date and Time Fields',
      type: 'heading',
    },
    {
      name: 'date',
      label: 'Date Field',
      type: 'date',
      helperText: 'Date picker field',
      gridProps: { xs: 12, sm: 6 },
    },
    {
      name: 'time',
      label: 'Time Field',
      type: 'time',
      helperText: 'Time picker field',
      gridProps: { xs: 12, sm: 6 },
    },
  ];
  
  return (
    <Form
      title="Field Types Demo"
      subtitle="Showcase of all available field types"
      fields={fields}
      values={values}
      onChange={setValues}
      onSubmit={action('submit')}
      fieldSpacing={3}
    />
  );
};

// Variants showcase
export const FormVariants = () => {
  const fields = [
    {
      name: 'field1',
      label: 'Field 1',
      type: 'text',
    },
    {
      name: 'field2',
      label: 'Field 2',
      type: 'text',
    },
  ];
  
  return (
    <>
      <Box mb={6}>
        <Typography variant="h6" gutterBottom>Outlined Variant</Typography>
        <Form
          fields={fields}
          onSubmit={action('submit')}
          variant="outlined"
        />
      </Box>
      
      <Box mb={6}>
        <Typography variant="h6" gutterBottom>Filled Variant</Typography>
        <Form
          fields={fields}
          onSubmit={action('submit')}
          variant="filled"
        />
      </Box>
      
      <Box mb={6}>
        <Typography variant="h6" gutterBottom>Standard Variant</Typography>
        <Form
          fields={fields}
          onSubmit={action('submit')}
          variant="standard"
        />
      </Box>
    </>
  );
};

// Validation showcase
export const FormValidation = () => {
  const [values, setValues] = useState({});
  
  const fields = [
    {
      name: 'requiredField',
      label: 'Required Field',
      type: 'text',
      validation: {
        required: true,
        requiredMessage: 'This field is mandatory',
      },
      helperText: 'This field cannot be empty',
    },
    {
      name: 'minMaxLength',
      label: 'Text with Length Constraints',
      type: 'text',
      validation: {
        minLength: 5,
        maxLength: 10,
      },
      helperText: 'Must be between 5-10 characters',
    },
    {
      name: 'pattern',
      label: 'Pattern Validation',
      type: 'text',
      validation: {
        pattern: '^[A-Za-z]+$',
        patternMessage: 'Only alphabetic characters are allowed',
      },
      helperText: 'Only letters allowed (no numbers or special characters)',
    },
    {
      name: 'numberRange',
      label: 'Number Range',
      type: 'number',
      validation: {
        min: 1,
        max: 100,
      },
      helperText: 'Enter a number between 1 and 100',
    },
    {
      name: 'password',
      label: 'Password',
      type: 'password',
      validation: {
        required: true,
        validate: (value) => {
          if (!/(?=.*[A-Z])/.test(value)) return 'Must include uppercase letter';
          if (!/(?=.*[a-z])/.test(value)) return 'Must include lowercase letter';
          if (!/(?=.*[0-9])/.test(value)) return 'Must include number';
          if (!/(?=.*[!@#$%^&*])/.test(value)) return 'Must include special character';
          if (value.length < 8) return 'Must be at least 8 characters';
          return null;
        }
      },
      helperText: 'Complex password validation with custom rules',
    },
    {
      name: 'confirmPassword',
      label: 'Confirm Password',
      type: 'password',
      validation: {
        required: true,
        validate: (value, formValues) => {
          return value === formValues.password ? null : 'Passwords do not match';
        }
      },
      helperText: 'Must match the password field above',
    },
  ];
  
  return (
    <Form
      title="Form Validation Demo"
      subtitle="Test different validation rules"
      fields={fields}
      values={values}
      onChange={setValues}
      onSubmit={action('validated-submit')}
    />
  );
};
