import React from 'react';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import Button from './Button';

export default {
  title: 'Components/Button',
  component: Button,
  tags: ['autodocs'],
  parameters: {
    componentSubtitle: 'Interactive button component with various styles and states',
  },
  argTypes: {
    onClick: { action: 'clicked' },
    children: { control: 'text' },
    startIcon: { control: { disable: true } },
    endIcon: { control: { disable: true } },
  },
};

// Template for creating stories
const Template = (args) => <Button {...args} />;

// Basic button variants
export const Primary = Template.bind({});
Primary.args = {
  variant: 'contained',
  color: 'primary',
  children: 'Primary Button',
};

export const Secondary = Template.bind({});
Secondary.args = {
  variant: 'contained',
  color: 'secondary',
  children: 'Secondary Button',
};

export const Outlined = Template.bind({});
Outlined.args = {
  variant: 'outlined',
  children: 'Outlined Button',
};

export const Text = Template.bind({});
Text.args = {
  variant: 'text',
  children: 'Text Button',
};

// Size variations
export const Large = Template.bind({});
Large.args = {
  size: 'large',
  children: 'Large Button',
};

export const Small = Template.bind({});
Small.args = {
  size: 'small',
  children: 'Small Button',
};

// State variations
export const Disabled = Template.bind({});
Disabled.args = {
  disabled: true,
  children: 'Disabled Button',
};

// Full width
export const FullWidth = Template.bind({});
FullWidth.args = {
  fullWidth: true,
  children: 'Full Width Button',
};

// With icons
export const WithStartIcon = Template.bind({});
WithStartIcon.args = {
  startIcon: <SaveIcon />,
  children: 'Save',
};

export const WithEndIcon = Template.bind({});
WithEndIcon.args = {
  endIcon: <DeleteIcon />,
  children: 'Delete',
};

// Different colors
export const Success = Template.bind({});
Success.args = {
  color: 'success',
  children: 'Success Button',
};

export const Error = Template.bind({});
Error.args = {
  color: 'error',
  children: 'Error Button',
};

export const Info = Template.bind({});
Info.args = {
  color: 'info',
  children: 'Info Button',
};

export const Warning = Template.bind({});
Warning.args = {
  color: 'warning',
  children: 'Warning Button',
};
