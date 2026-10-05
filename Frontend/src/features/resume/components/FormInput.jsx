import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';

/**
 * Enhanced Form Input Component
 * 
 * Features:
 * - Real-time validation
 * - Error display with helpful messages
 * - Character count
 * - Loading state
 * - Accessibility (labels, hints, errors)
 * - Placeholder hints
 */
const FormInput = React.forwardRef(({
  label,
  name,
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  hint,
  required = false,
  disabled = false,
  loading = false,
  maxLength,
  minLength,
  pattern,
  validation,
  className = '',
  inputClassName = '',
  ...props
}, ref) => {
  const [touched, setTouched] = useState(false);
  const [localError, setLocalError] = useState(null);

  // Validate input
  const validateInput = useCallback((inputValue) => {
    // Clear previous error
    setLocalError(null);

    // Custom validation function
    if (validation) {
      const validationError = validation(inputValue);
      if (validationError) {
        setLocalError(validationError);
        return false;
      }
    }

    // Required validation
    if (required && !inputValue?.trim()) {
      setLocalError(`${label} is required`);
      return false;
    }

    // Min length validation
    if (minLength && inputValue?.length < minLength) {
      setLocalError(`${label} must be at least ${minLength} characters`);
      return false;
    }

    // Max length validation
    if (maxLength && inputValue?.length > maxLength) {
      setLocalError(`${label} must not exceed ${maxLength} characters`);
      return false;
    }

    // Pattern validation
    if (pattern && !pattern.test(inputValue)) {
      setLocalError(`${label} format is invalid`);
      return false;
    }

    // Email validation
    if (type === 'email' && inputValue) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(inputValue)) {
        setLocalError('Please enter a valid email address');
        return false;
      }
    }

    // URL validation
    if (type === 'url' && inputValue) {
      try {
        new URL(inputValue);
      } catch {
        setLocalError('Please enter a valid URL');
        return false;
      }
    }

    return true;
  }, [label, required, minLength, maxLength, pattern, validation, type]);

  const handleChange = (e) => {
    const newValue = e.target.value;
    onChange?.(newValue);
    
    // Validate on change if touched
    if (touched) {
      validateInput(newValue);
    }
  };

  const handleBlur = (e) => {
    setTouched(true);
    validateInput(value);
    onBlur?.(e);
  };

  const displayError = error || localError;
  const showError = touched && displayError;
  const charCount = value?.length || 0;
  const showCharCount = maxLength && charCount > maxLength * 0.8;

  return (
    <div className={`form-input-group ${className}`}>
      {label && (
        <label htmlFor={name} className="form-input__label">
          {label}
          {required && <span className="form-input__required">*</span>}
        </label>
      )}

      <div className="form-input__wrapper">
        <input
          ref={ref}
          id={name}
          name={name}
          type={type}
          value={value || ''}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled || loading}
          maxLength={maxLength}
          minLength={minLength}
          className={`
            form-input__field
            ${inputClassName}
            ${showError ? 'form-input__field--error' : ''}
            ${disabled ? 'form-input__field--disabled' : ''}
            ${loading ? 'form-input__field--loading' : ''}
          `}
          aria-label={label}
          aria-invalid={!!showError}
          aria-describedby={
            showError ? `${name}-error` : hint ? `${name}-hint` : undefined
          }
          {...props}
        />

        {loading && (
          <div className="form-input__loader">
            <div className="spinner"></div>
          </div>
        )}
      </div>

      {hint && !showError && (
        <small id={`${name}-hint`} className="form-input__hint">
          {hint}
        </small>
      )}

      {showError && (
        <small id={`${name}-error`} className="form-input__error">
          {displayError}
        </small>
      )}

      {showCharCount && (
        <small className="form-input__char-count">
          {charCount}/{maxLength} characters
        </small>
      )}
    </div>
  );
});

FormInput.displayName = 'FormInput';

FormInput.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string.isRequired,
  type: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  onBlur: PropTypes.func,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  hint: PropTypes.string,
  required: PropTypes.bool,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.instanceOf(RegExp),
  validation: PropTypes.func,
  className: PropTypes.string,
  inputClassName: PropTypes.string,
};

export default FormInput;
