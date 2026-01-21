'use client';

import { TextField, Tooltip } from '@mui/material';
import { GridRenderEditCellParams } from '@mui/x-data-grid-premium';
import { useState, useEffect, useMemo } from 'react';

interface CommentCellProps extends GridRenderEditCellParams {
  showInitialError?: boolean;
  readonly?: boolean;
}

/**
 * Truncate text to `maxChars` OR after `maxLines` line breaks, whichever comes first.
 * Returns { displayText, isTruncated }.
 */
const MAX_CHARS_PER_LAST_LINE = 30;
const MAX_CHARS = 80;
const MAX_LINES = 1;

function truncateText(text: string, maxChars: number, maxLines: number) {
  if (!text) return { displayText: '', isTruncated: false };

  const lines = text.split('\n');
  let isTruncated = false;
  let truncated = '';

  // --- RULE 1: limit by maxLines first ---
  if (lines.length >= maxLines) {
    const allowedLines = lines.slice(0, maxLines);
    const lastIndex = maxLines - 1;
    const lastLine = allowedLines[lastIndex];

    // the max allowed length for the last line:
    const lastLineLimit = Math.min(MAX_CHARS_PER_LAST_LINE, maxChars);

    // truncate ONLY last line (this handles your failing case)
    if (lastLine.length > lastLineLimit) {
      allowedLines[lastIndex] = lastLine.slice(0, lastLineLimit);
      isTruncated = true;
    }

    truncated = allowedLines.join('\n');
    isTruncated = true;
  } else {
    truncated = text;
  }

  // --- RULE 2: global MAX_CHARS (fallback) ---
  if (truncated.length > maxChars) {
    truncated = truncated.slice(0, maxChars);
    isTruncated = true;
  }

  // Append ...
  if (isTruncated) truncated += '...';

  return { displayText: truncated, isTruncated };
}

export default function CommentCell(props: CommentCellProps) {
  const {
    id,
    value,
    api,
    field,
    showInitialError = false,
    readonly = false,
    disableView = false,
  } = props;

  const [inputValue, setInputValue] = useState(value || '');
  const [showError, setShowError] = useState(showInitialError);

  useEffect(() => {
    setInputValue(value || '');
    setShowError(!value && showInitialError);
  }, [value, showInitialError]);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = event.target.value;
    setInputValue(newVal);
    setShowError(newVal.trim() === '');
    api.setEditCellValue({ id, field, value: newVal }, event);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      // Prevent DataGrid from exiting edit mode
      event.stopPropagation();
    }
  };

  // compute truncation only for readonly mode
  const { displayText, isTruncated } = useMemo(() => {
    if (!readonly) return { displayText: inputValue, isTruncated: false };
    return truncateText(inputValue ?? '', MAX_CHARS, MAX_LINES); // 1 row max
  }, [inputValue, readonly]);

  // Build the TextField element once so we can conditionally wrap it with Tooltip
  const textField = (
    <TextField
      value={displayText}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      variant="outlined"
      fullWidth
      required
      autoFocus={!readonly}
      multiline
      minRows={1}
      maxRows={!readonly ? MAX_LINES : undefined}
      error={showError}
      placeholder={disableView ? '' : 'Double Click to Enter Comment'}
      InputProps={{
        readOnly: readonly,
        inputProps: {
          onMouseDown: (e: React.MouseEvent) => {
            e.stopPropagation(); //this is to enter edit mode onclick
          },
        },
      }}
      // keep your existing styling; tweak if needed
      sx={{
        zIndex: 1001,
        backgroundColor: disableView ? '#f8f9fa' : '#fff',
        height: '100%',
        '& .MuiDataGrid-cell.MuiDataGrid-cell--editing ': {
          paddingLeft: '8px !important',
        },
        '& .MuiOutlinedInput-input': {
          paddingX: '0px',
        },
        '& .MuiOutlinedInput-root': {
          height: '100%',
          fontSize: 14,
          alignItems: 'center',
          '&.Mui-focused': showError
            ? {}
            : {
                outline: 'none',
                boxShadow: 'none',
              },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': showError
            ? {}
            : {
                border: 'none',
              },
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: 'transparent',
          },
        },
        '& .MuiOutlinedInput-notchedOutline': {
          borderColor: 'transparent',
        },
        '& input::placeholder': {
          color: showError ? '#d32f2f' : '#aaa',
          opacity: 1,
        },
        '& .MuiFormHelperText-root': {
          marginLeft: '4px',
          fontSize: '11px',
        },
        '& .MuiOutlinedInput-root.Mui-error .MuiOutlinedInput-notchedOutline': {
          borderColor: 'transparent !important', // Remove the red border
        },
      }}
    />
  );

  // Only in readonly & only when truncated do we show tooltip (per request).
  if (readonly && isTruncated) {
    return (
      <Tooltip title={inputValue || ''} placement="right" arrow>
        {textField}
      </Tooltip>
    );
  }

  // Otherwise return the TextField as-is (no tooltip)
  return textField;
}
