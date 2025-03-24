import React, { useState } from 'react';
import {
  Popper,
  Paper,
  ClickAwayListener,
  MenuItem,
  Checkbox,
  ListItemText,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Box,
  Switch,
  Button,
} from '@mui/material';
import { Search, Close } from '@mui/icons-material';

const ColumnManagementPopper = ({
  handleColumnVisibilityChange,
  handlePopperToggle,
  popperOpen,
  allColumns,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAll, setShowAll] = useState(true);

  const handleClose = () => {
    setAnchorEl(null);
    handlePopperToggle();
  };

  // Filter columns based on search term
  const filteredColumns = allColumns?.filter(column =>
    (column.headerName || column.field)
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const handleReset = () => {
    const allColumns = apiRef.current.getAllColumns(); // Get all columns again
    // setColumns(allColumns);
    setShowAll(allColumns.every(col => !col.hide));
    allColumns.forEach(col => {
      apiRef.current.setColumnVisibility(col.field, !col.hide);
    });
  };
  const handleShowHideAll = () => {
    const newShowAll = !showAll;
    setShowAll(newShowAll);
  };

  return (
    <div>
      <Popper
        open={popperOpen}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ zIndex: 1300 }}
      >
        <Paper elevation={3} sx={{ width: 320, maxHeight: 480 }}>
          {/* Search Field */}
          <TextField
            fullWidth
            size="small"
            placeholder="Search columns"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search fontSize="small" />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={() => setSearchTerm('')}>
                    <Close fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{ p: 2, borderBottom: '1px solid #DDE1E4' }}
          />

          {/* Column List */}
          <Box sx={{ maxHeight: 320, overflowY: 'auto' }}>
            {filteredColumns.length > 0 ? (
              filteredColumns.map(column => {
                const isVisible = !column.hide; // Column is visible if `hide` is false
                return (
                  <MenuItem
                    key={column.field}
                    onClick={() => handleColumnVisibilityChange(column.field)}
                    sx={{ py: 1, px: 2 }}
                  >
                    <Checkbox checked={isVisible} size="small" />
                    <ListItemText primary={column.headerName || column.field} />
                  </MenuItem>
                );
              })
            ) : (
              <Typography
                variant="body2"
                sx={{ p: 2, color: '#999', textAlign: 'center' }}
              >
                No columns available
              </Typography>
            )}
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              px: 2,
              py: 1,
              borderBottom: '1px solid #DDE1E4',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Show/Hide All
              </Typography>
              <Switch
                size="small"
                checked={showAll}
                onChange={handleShowHideAll}
              />
            </Box>
            <Button
              size="small"
              onClick={handleReset}
              sx={{
                color: '#2B66C7',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'transparent',
                  textDecoration: 'underline',
                },
              }}
            >
              Reset
            </Button>
          </Box>
        </Paper>
      </Popper>
    </div>
  );
};

export default ColumnManagementPopper;
