'use client';

import { Box, Tabs, Tab, styled } from '@mui/material';
import { useState, MouseEvent } from 'react';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import type { MutableRefObject } from 'react';

const commonButtonStyles = {
  backgroundColor: 'rgba(242, 245, 250, 0.3)',
  border: '1px solid rgb(214, 220, 225)',
  borderRadius: '4px',
  height: '32px',
  padding: '5px 12px',
  fontSize: '13px',
  color: 'rgb(33, 33, 33)',
  fontFamily: (theme: any) => theme.typography.fontFamily,
  fontWeight: 600,
  textTransform: 'none' as const,
};

const StyledGridToolbarColumnsButton = styled(GridToolbarColumnsButton)({
  '& .MuiButton-startIcon': {
    marginRight: 0,
  },
  '& .MuiButton-endIcon': {
    display: 'none',
  },
  '& .MuiButton-text': {
    fontSize: 0,
    width: 0,
    padding: 0,
    overflow: 'hidden',
  },
  '& .filterColBlock': {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '& button': commonButtonStyles,
  },
  '& .columns-button': {
    textTransform: 'none',
  },
});

import type { GridToolbarProps } from '@mui/x-data-grid-premium';


interface ProjectToolbarProps extends Partial<GridToolbarProps> {
  setFilterButtonEl: (instance: HTMLDivElement | null) => void;
}

const ProjectToolbar: React.FC<ProjectToolbarProps> = ({ setFilterButtonEl }) => {
  const [value, setValue] = useState<'project' | 'businessImpact'>('project');

  const handleChange = (_event: React.SyntheticEvent, newValue: 'project' | 'businessImpact') => {
    setValue(newValue);
  };

  return (
    <Box
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '12px',
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        textColor="primary"
        indicatorColor="primary"
        aria-label="secondary tabs example"
      >
        <Tab value="project" label="Projects" />
        <Tab value="businessImpact" label="Business Impact" />
      </Tabs>
      <Box>
        <Box className="filterColBlock">
          <GridToolbarContainer ref={setFilterButtonEl}>
            <StyledGridToolbarColumnsButton
              slotProps={{
                tooltip: { title: 'Columns' },
                button: {
                  variant: 'outlined',
                  startIcon: (
                    <img src="/images/icons/columns.svg" alt="columns" />
                  ),
                  className: 'columns-button',
                  sx: commonButtonStyles,
                },
              }}
            />
            <GridToolbarFilterButton
              slotProps={{
                tooltip: { title: 'Filter' },
                button: {
                  variant: 'outlined',
                  startIcon: (
                    <img src="/images/icons/filter.svg" alt="filter" />
                  ),
                  className: 'columns-button',
                  sx: commonButtonStyles,
                },
              }}
            />
          </GridToolbarContainer>
        </Box>
      </Box>
    </Box>
  );
};

export default ProjectToolbar;