import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Grid,
  TextField,
  MenuItem,
  Switch,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  RadioGroup,
  Radio,
  Checkbox,
  InputLabel,
  Select,
  Button,
  Typography,
  Divider,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { TimePicker } from '@mui/x-date-pickers/TimePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

/**
 * Reusable Form component for consistent form creation across the application
 */
const Form = ({
  fields,
  values,
  onChange,
  onSubmit,
  submitText,
  cancelText,
  onCancel,
  loading,
  error,
  success,
  title,
  subtitle,
  layout,
  disabled,
  fieldSpacing,
  variant,
  elevation,
  resetAfterSubmit
}) => {
  // State
  const [formValues, setFormValues] = useState(values || {});
  const [formErrors, setFormErrors] = useState({});
  const [formTouched, setFormTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update form values when values prop changes
  useEffect(() => {
    if (values) {
      setFormValues(values);
    }
  }, [values]);

  // Reset form after successful submission if resetAfterSubmit is true
  useEffect(() => {
    if (resetAfterSubmit && success && !loading) {
      setFormValues({});
      setFormErrors({});
      setFormTouched({});
    }
  }, [success, loading, resetAfterSubmit]);

  // Handle form field changes
  const handleChange = (name, value) => {
    const newValues = { ...formValues, [name]: value };
    
    // Update form values
    setFormValues(newValues);
    
    // Mark field as touched
    if (!formTouched[name]) {
      setFormTouched({ ...formTouched, [name]: true });
    }
    
    // Validate field if it's been touched
    if (formTouched[name]) {
      validateField(name, value);
    }
    
    // Call onChange prop if provided
    if (onChange) {
      onChange(newValues);
    }
  };

  // Validate individual field
  const validateField = (name, value) => {
    const field = fields.find(f => f.name === name);
    if (!field || !field.validation) return true;

    let error = null;
    
    // Required validation
    if (field.validation.required && 
        (value === undefined || value === null || value === '')) {
      error = field.validation.requiredMessage || 'This field is required';
    }
    
    // Min length validation
    else if (field.validation.minLength && 
             value.length < field.validation.minLength) {
      error = `Minimum length is ${field.validation.minLength} characters`;
    }
    
    // Max length validation
    else if (field.validation.maxLength && 
             value.length > field.validation.maxLength) {
      error = `Maximum length is ${field.validation.maxLength} characters`;
    }
    
    // Pattern validation
    else if (field.validation.pattern && 
             !new RegExp(field.validation.pattern).test(value)) {
      error = field.validation.patternMessage || 'Invalid format';
    }
    
    // Min value validation
    else if (field.validation.min !== undefined && 
             Number(value) < field.validation.min) {
      error = `Value must be at least ${field.validation.min}`;
    }
    
    // Max value validation
    else if (field.validation.max !== undefined && 
             Number(value) > field.validation.max) {
      error = `Value must be at most ${field.validation.max}`;
    }
    
    // Custom validation
    else if (field.validation.validate) {
      error = field.validation.validate(value, formValues);
    }
    
    // Update errors state
    setFormErrors(prev => ({
      ...prev,
      [name]: error
    }));
    
    return error === null;
  };

  // Validate all fields
  const validateForm = () => {
    const newErrors = {};
    let isValid = true;
    
    fields.forEach(field => {
      const value = formValues[field.name];
      if (!validateField(field.name, value)) {
        newErrors[field.name] = formErrors[field.name];
        isValid = false;
      }
    });
    
    setFormErrors(newErrors);
    return isValid;
  };

  // Handle form submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    
    // Mark all fields as touched
    const allTouched = {};
    fields.forEach(field => {
      allTouched[field.name] = true;
    });
    setFormTouched(allTouched);
    
    // Validate form
    const isValid = validateForm();
    
    if (isValid && onSubmit) {
      setIsSubmitting(true);
      try {
        await onSubmit(formValues);
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Render different field types
  const renderField = (field) => {
    const {
      name,
      label,
      type,
      placeholder,
      helperText,
      options,
      fullWidth,
      disabled: fieldDisabled,
      hidden,
      multiline,
      rows,
      InputProps,
      size,
      variant: fieldVariant,
      startAdornment,
      endAdornment,
      readOnly,
      min,
      max,
      step
    } = field;
    
    const value = formValues[name] !== undefined ? formValues[name] : '';
    const error = !!formErrors[name];
    const errorText = formErrors[name] || '';
    const isDisabled = disabled || fieldDisabled || loading;
    
    // Hidden fields
    if (hidden) {
      return null;
    }
    
    // Generate common props for text fields
    const commonProps = {
      id: `form-field-${name}`,
      name,
      label,
      value,
      error,
      helperText: error ? errorText : helperText,
      disabled: isDisabled,
      fullWidth: fullWidth !== false,
      placeholder,
      size: size || 'medium',
      variant: fieldVariant || variant || 'outlined',
      onChange: (e) => handleChange(name, e.target.value),
      onBlur: () => {
        if (!formTouched[name]) {
          setFormTouched({ ...formTouched, [name]: true });
          validateField(name, value);
        }
      },
      InputProps: {
        readOnly,
        ...InputProps,
        ...(startAdornment && {
          startAdornment
        }),
        ...(endAdornment && {
          endAdornment
        })
      }
    };
    
    // Render specific field types
    switch (type) {
      case 'text':
      case 'email':
      case 'password':
      case 'number':
      case 'tel':
      case 'url':
        return (
          <TextField 
            {...commonProps} 
            type={type} 
            multiline={multiline}
            rows={rows}
            inputProps={{
              min,
              max,
              step
            }}
          />
        );
        
      case 'select':
        return (
          <FormControl 
            fullWidth={fullWidth !== false}
            error={error}
            disabled={isDisabled}
            variant={fieldVariant || variant || 'outlined'}
            size={size || 'medium'}
          >
            <InputLabel id={`form-select-${name}-label`}>{label}</InputLabel>
            <Select
              labelId={`form-select-${name}-label`}
              id={`form-select-${name}`}
              value={value || ''}
              label={label}
              onChange={(e) => handleChange(name, e.target.value)}
              onBlur={() => {
                if (!formTouched[name]) {
                  setFormTouched({ ...formTouched, [name]: true });
                  validateField(name, value);
                }
              }}
            >
              {options && options.map((option) => (
                <MenuItem 
                  key={`${name}-option-${option.value}`} 
                  value={option.value}
                >
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || helperText) && (
              <FormLabel 
                error={error} 
                sx={{ mt: 1, ml: 2, fontSize: '0.75rem' }}
              >
                {error ? errorText : helperText}
              </FormLabel>
            )}
          </FormControl>
        );
        
      case 'checkbox':
        return (
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => handleChange(name, e.target.checked)}
                name={name}
                color="primary"
                disabled={isDisabled}
              />
            }
            label={label}
            disabled={isDisabled}
          />
        );
        
      case 'switch':
        return (
          <FormControlLabel
            control={
              <Switch
                checked={!!value}
                onChange={(e) => handleChange(name, e.target.checked)}
                name={name}
                color="primary"
                disabled={isDisabled}
              />
            }
            label={label}
            disabled={isDisabled}
          />
        );
        
      case 'radio':
        return (
          <FormControl 
            component="fieldset" 
            error={error} 
            disabled={isDisabled}
          >
            <FormLabel component="legend">{label}</FormLabel>
            <RadioGroup
              name={name}
              value={value || ''}
              onChange={(e) => handleChange(name, e.target.value)}
            >
              {options && options.map((option) => (
                <FormControlLabel
                  key={`${name}-option-${option.value}`}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {(error || helperText) && (
              <FormLabel 
                error={error} 
                sx={{ mt: 1, fontSize: '0.75rem' }}
              >
                {error ? errorText : helperText}
              </FormLabel>
            )}
          </FormControl>
        );
        
      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={label}
              value={value || null}
              onChange={(newValue) => handleChange(name, newValue)}
              disabled={isDisabled}
              slotProps={{
                textField: {
                  variant: fieldVariant || variant || 'outlined',
                  fullWidth: fullWidth !== false,
                  helperText: error ? errorText : helperText,
                  error: error,
                  size: size || 'medium',
                }
              }}
            />
          </LocalizationProvider>
        );
        
      case 'time':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TimePicker
              label={label}
              value={value || null}
              onChange={(newValue) => handleChange(name, newValue)}
              disabled={isDisabled}
              slotProps={{
                textField: {
                  variant: fieldVariant || variant || 'outlined',
                  fullWidth: fullWidth !== false,
                  helperText: error ? errorText : helperText,
                  error: error,
                  size: size || 'medium',
                }
              }}
            />
          </LocalizationProvider>
        );
        
      case 'textarea':
        return (
          <TextField
            {...commonProps}
            multiline
            rows={rows || 4}
          />
        );
        
      case 'divider':
        return <Divider sx={{ my: 2 }} />;
        
      case 'heading':
        return (
          <Typography 
            variant={field.variant || 'h6'} 
            component={field.component || 'h2'}
            gutterBottom
            sx={field.sx || { mt: 2, mb: 1 }}
          >
            {label}
          </Typography>
        );
        
      default:
        return <TextField {...commonProps} />;
    }
  };
  
  // Determine column size based on layout and field config
  const getFieldColumnSize = (field) => {
    // Priority: field specific setting, then layout, then default to 12 (full width)
    if (field.gridProps && field.gridProps.xs !== undefined) {
      return {
        xs: 12, // Always full width on extra small screens
        sm: field.gridProps.sm !== undefined ? field.gridProps.sm : 
            field.gridProps.xs < 12 ? field.gridProps.xs : 12,
        md: field.gridProps.md !== undefined ? field.gridProps.md : 
            field.gridProps.xs,
        ...field.gridProps
      };
    }
    
    // Use layout setting
    if (layout === 'half') return { xs: 12, sm: 6 };
    if (layout === 'third') return { xs: 12, sm: 6, md: 4 };
    if (layout === 'quarter') return { xs: 12, sm: 6, md: 3 };
    
    // Default to full width
    return { xs: 12 };
  };

  return (
    <Paper
      elevation={elevation}
      sx={{ p: 3 }}
      component="form"
      onSubmit={handleSubmit}
      noValidate
    >
      {/* Title and subtitle */}
      {title && (
        <Typography variant="h5" component="h2" gutterBottom>
          {title}
        </Typography>
      )}
      {subtitle && (
        <Typography variant="body2" color="textSecondary" paragraph>
          {subtitle}
        </Typography>
      )}
      
      {/* Error message */}
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {/* Success message */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}
      
      {/* Form fields */}
      <Grid container spacing={fieldSpacing || 2}>
        {fields.map((field) => (
          <Grid item {...getFieldColumnSize(field)} key={field.name || `field-${field.type}-${field.label}`}>
            {renderField(field)}
          </Grid>
        ))}
      </Grid>
      
      {/* Form buttons */}
      {(onSubmit || onCancel) && (
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
          {onCancel && (
            <Button
              variant="outlined"
              onClick={onCancel}
              disabled={loading || isSubmitting}
              sx={{ mr: 1 }}
            >
              {cancelText || 'Cancel'}
            </Button>
          )}
          {onSubmit && (
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading || isSubmitting || disabled}
              startIcon={
                (loading || isSubmitting) ? <CircularProgress size={20} color="inherit" /> : null
              }
            >
              {submitText || 'Submit'}
            </Button>
          )}
        </Box>
      )}
    </Paper>
  );
};

Form.propTypes = {
  /**
   * Array of field configurations
   */
  fields: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string,
      type: PropTypes.oneOf([
        'text', 'email', 'password', 'number', 'tel', 'url', 
        'select', 'checkbox', 'switch', 'radio', 'date', 'time', 
        'textarea', 'divider', 'heading'
      ]),
      placeholder: PropTypes.string,
      helperText: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.any.isRequired,
          label: PropTypes.string.isRequired,
        })
      ),
      fullWidth: PropTypes.bool,
      disabled: PropTypes.bool,
      hidden: PropTypes.bool,
      multiline: PropTypes.bool,
      rows: PropTypes.number,
      InputProps: PropTypes.object,
      size: PropTypes.oneOf(['small', 'medium', 'large']),
      variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
      startAdornment: PropTypes.node,
      endAdornment: PropTypes.node,
      readOnly: PropTypes.bool,
      min: PropTypes.number,
      max: PropTypes.number,
      step: PropTypes.number,
      gridProps: PropTypes.object,
      validation: PropTypes.shape({
        required: PropTypes.bool,
        requiredMessage: PropTypes.string,
        minLength: PropTypes.number,
        maxLength: PropTypes.number,
        min: PropTypes.number,
        max: PropTypes.number,
        pattern: PropTypes.string,
        patternMessage: PropTypes.string,
        validate: PropTypes.func,
      }),
    })
  ).isRequired,
  /**
   * Form values object
   */
  values: PropTypes.object,
  /**
   * Callback when form values change
   */
  onChange: PropTypes.func,
  /**
   * Callback when form is submitted
   */
  onSubmit: PropTypes.func,
  /**
   * Text for the submit button
   */
  submitText: PropTypes.string,
  /**
   * Text for the cancel button
   */
  cancelText: PropTypes.string,
  /**
   * Callback when cancel button is clicked
   */
  onCancel: PropTypes.func,
  /**
   * Whether the form is in loading state
   */
  loading: PropTypes.bool,
  /**
   * Error message to display
   */
  error: PropTypes.string,
  /**
   * Success message to display
   */
  success: PropTypes.string,
  /**
   * Form title
   */
  title: PropTypes.string,
  /**
   * Form subtitle
   */
  subtitle: PropTypes.string,
  /**
   * Layout preset for form fields
   */
  layout: PropTypes.oneOf(['full', 'half', 'third', 'quarter']),
  /**
   * Whether the form is disabled
   */
  disabled: PropTypes.bool,
  /**
   * Spacing between form fields
   */
  fieldSpacing: PropTypes.number,
  /**
   * Default variant for form fields
   */
  variant: PropTypes.oneOf(['outlined', 'filled', 'standard']),
  /**
   * Paper elevation
   */
  elevation: PropTypes.number,
  /**
   * Whether to reset form after successful submission
   */
  resetAfterSubmit: PropTypes.bool,
};

Form.defaultProps = {
  values: {},
  submitText: 'Submit',
  cancelText: 'Cancel',
  loading: false,
  layout: 'full',
  disabled: false,
  fieldSpacing: 2,
  variant: 'outlined',
  elevation: 1,
  resetAfterSubmit: false,
};

export default Form;
