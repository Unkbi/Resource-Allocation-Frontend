'use client';

import type React from 'react';
import { useState, useRef, useEffect } from 'react';
import {
  TextField,
  InputAdornment,
  Button,
  styled,
  IconButton,
  Tooltip,
  Typography,
} from '@mui/material';
import { ContentCopy, Check } from '@mui/icons-material';

// Styled components
const CopyButton = styled(Button)(({ theme }) => ({
  height: '32px',
  borderTopLeftRadius: 0,
  borderBottomLeftRadius: 0,
  minWidth: 'auto',
  padding: '6px 16px',
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  color: '#000',
  fontSize: '14px',
  fontStyle: 'normal',
  fontWeight: '400',
  lineHeight: 'normal',
  '& .MuiOutlinedInput-root': {
    paddingRight: 0,
    '& .MuiInputAdornment-root': {
      margin: 0,
      height: '32px',
    },
  },
}));

interface CopyLinkInputProps {
  value?: string;
  placeholder?: string;
  readOnly?: boolean;
  fullWidth?: boolean;
  label?: string;
  variant?: 'outlined' | 'filled' | 'standard';
  onChange?: (value: string) => void;
  buttonText?: string;
  showButtonText?: boolean;
  onButtonClick?: () => void;
}

export default function CopyLinkInput({
  value = 'https://example.com/share/abc123',
  placeholder = 'Share link',
  readOnly = true,
  fullWidth = true,
  label = 'Share link',
  variant = 'outlined',
  onChange,
  buttonText = 'Copy',
  showButtonText = true,
  onButtonClick,
}: CopyLinkInputProps) {
  const [copied, setCopied] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const [fullValue, setFullValue] = useState(value);
  const [displayValue, setDisplayValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleCopy = async () => {
    try {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);

      if (onButtonClick) {
        onButtonClick();
      }
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    if (onChange) {
      onChange(newValue);
    }
  };

  // Function to truncate text with ellipsis at the end
  const truncateEnd = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text;

    const ellipsis = '...';
    const charsToShow = maxLength - ellipsis.length;

    return text.substring(0, charsToShow) + ellipsis;
  };

  // Calculate and set the truncated display value
  const updateDisplayValue = () => {
    if (!inputRef.current || !buttonRef.current) return;

    // Get the width of the input and button
    const inputWidth = inputRef.current.clientWidth;
    const buttonWidth = buttonRef.current.clientWidth;

    // Estimate available space for text (rough calculation)
    // Subtracting button width, padding, and some buffer
    const availableWidth = inputWidth - buttonWidth - 40;

    // Estimate how many characters can fit (assuming average char width)
    // This is an approximation - each font and character has different widths
    const averageCharWidth = 8; // Approximate width in pixels for average character
    const maxChars = Math.floor(availableWidth / averageCharWidth);

    // Truncate if needed
    if (fullValue.length > maxChars && maxChars > 10) {
      setDisplayValue(truncateEnd(fullValue, maxChars));
    } else {
      setDisplayValue(fullValue);
    }
  };

  useEffect(() => {
    setFullValue(value);

    // Use a small delay to ensure the DOM is fully rendered
    const timer = setTimeout(() => {
      updateDisplayValue();
    }, 0);

    return () => clearTimeout(timer);
  }, [value]);

  return (
    <>
      <StyledTextField
        inputRef={inputRef}
        size="small"
        value={truncateEnd(value, 52)}
        onChange={handleChange}
        placeholder={placeholder}
        label={label}
        variant={variant}
        fullWidth={fullWidth}
        InputProps={{
          readOnly: readOnly,
          endAdornment: (
            <InputAdornment position="end">
              {showButtonText ? (
                <IconButton
                  onClick={handleCopy}
                  size="small"
                  className="nextPrevIcon"
                  value="Copy link"
                  sx={{
                    fontSize: '12px',
                  }}
                >
                  <img src={'/images/icons/copyPin.svg'} alt="copy-pin" />
                  {copied ? <Check fontSize="small" /> : null}
                  {
                    <Typography
                      sx={{
                        color: '#0A1B39',
                      }}
                    >
                      {copied ? 'Copied' : buttonText}
                    </Typography>
                  }
                </IconButton>
              ) : (
                <Tooltip title="Copy link">
                  <IconButton
                    onClick={handleCopy}
                    color="primary"
                    sx={{ height: '100%', borderRadius: '0 4px 4px 0' }}
                  >
                    {copied ? <Check /> : <ContentCopy />}
                  </IconButton>
                </Tooltip>
              )}
            </InputAdornment>
          ),
        }}
      />
    </>
  );
}
