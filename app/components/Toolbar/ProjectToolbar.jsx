import { Box, Tabs, Tab, styled } from '@mui/material';
import { useState } from 'react';
import {
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarFilterButton,
  } from '@mui/x-data-grid';

const StyledGridToolbarColumnsButton = styled(GridToolbarColumnsButton)({
    "& .MuiButton-startIcon": {
      marginRight: 0,
    },
    "& .MuiButton-endIcon": {
      display: "none",
    },
    "& .MuiButton-text": {
      fontSize: 0,
      width: 0,
      padding: 0,
      overflow: "hidden",
    },
})

const ProjectToolbar = ({ setFilterButtonEl }) => {
    const [value, setValue] = useState('project');

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box style={{display: "flex", justifyContent: "space-between", marginTop: "12px"}}>
            <Tabs
                value={value}
                onChange={handleChange}
                textColor="primary"
                indicatorColor="primary"
                aria-label="secondary tabs example"
                >
                <Tab value="project" label="Project" />
                <Tab value="businessImpact" label="Business Impact" />
            </Tabs>
            <Box>
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
                },
                }}
                />
                <GridToolbarFilterButton
                slotProps={{
                    tooltip: { title: 'Filter' },
                    button: {
                    variant: 'outlined',
                    sx: { color: '#555', borderColor: '#ddd' },
                    startIcon: (
                        <img src="/images/icons/filter.svg" alt="filter" />
                    ),
                    },
                }}
                />
            </GridToolbarContainer>
            </Box>
        </Box>
    )
}

export default ProjectToolbar;
