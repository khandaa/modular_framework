import React from 'react';
import PropTypes from 'prop-types';
import { Button as MuiButton } from '@mui/material';

/**
 * Primary UI component for user interaction
 */
const Button = ({
  variant,
  color,
  size,
  disabled,
  startIcon,
  endIcon,
  fullWidth,
  onClick,
  children,
  ...props
}) => {
  return (
    <MuiButton
      variant={variant}
      color={color}
      size={size}
      disabled={disabled}
      startIcon={startIcon}
      endIcon={endIcon}
      fullWidth={fullWidth}
      onClick={onClick}
      {...props}
    >
      {children}
    </MuiButton>
  );
};

Button.propTypes = {
  /**
   * Button variant
   */
  variant: PropTypes.oneOf(['contained', 'outlined', 'text']),
  /**
   * Button color
   */
  color: PropTypes.oneOf(['primary', 'secondary', 'success', 'error', 'info', 'warning']),
  /**
   * How large should the button be?
   */
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  /**
   * Is the button disabled?
   */
  disabled: PropTypes.bool,
  /**
   * Optional start icon
   */
  startIcon: PropTypes.node,
  /**
   * Optional end icon
   */
  endIcon: PropTypes.node,
  /**
   * Should the button take full width?
   */
  fullWidth: PropTypes.bool,
  /**
   * Optional click handler
   */
  onClick: PropTypes.func,
  /**
   * Button contents
   */
  children: PropTypes.node.isRequired,
};

Button.defaultProps = {
  variant: 'contained',
  color: 'primary',
  size: 'medium',
  disabled: false,
  startIcon: null,
  endIcon: null,
  fullWidth: false,
  onClick: undefined,
};

export default Button;
