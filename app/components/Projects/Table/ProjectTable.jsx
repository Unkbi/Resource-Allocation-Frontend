import { ColumnManagementStyles, FilterPanelStyles, StyledDataGrid } from "../../AllocationTable/styles/StyledDataGrid";
import {
    useGridApiRef
  } from '@mui/x-data-grid-premium';
import ProjectToolbar from "../../Toolbar/ProjectToolbar";
import { useState } from "react";

const ProjectTable = ({columns, rows}) => {
    const apiRef = useGridApiRef();
    const [filterButtonEl, setFilterButtonEl] = useState(null);
    return (
        <StyledDataGrid
            apiRef={apiRef}
            columns={columns}
            rows={rows}
            hideFooter={true}
            slots={{
                toolbar: ProjectToolbar
            }}
            sx={{
                '& .MuiDataGrid-columnSeparator': {
                    display: 'none', // This removes the vertical lines between columns
                },
                '& .MuiDataGrid-cell': {
                    borderRight: 'none', // This removes the vertical borders between cells
                },
                '& .MuiDataGrid-columnHeader': {
                    padding: '0 16px',
                    borderRight: 'none',
                }
            }}
            slotProps={{
                loadingOverlay: {
                variant: 'skeleton',
                noRowsVariant: 'skeleton',
                },
                panel: {
                anchorEl: filterButtonEl,
                className: 'parent-grid-panel',
                },
                toolbar: {
                    setFilterButtonEl,
                },
                columnsPanel: {
                className: 'styleColumnMenu',
                sx: ColumnManagementStyles,
                },
                filterPanel: {
                columnsSort: 'asc',
                className: 'filterPopup',
                filterFormProps: {
                    columnInputProps: {
                    size: 'small',
                    sx: { mt: 'auto' },
                    },
                    operatorInputProps: {
                    size: 'small',
                    sx: { mt: 'auto' },
                    },
                    valueInputProps: {
                    InputComponentProps: {
                        size: 'small',
                    },
                    },
                    deleteIconProps: {
                    sx: {
                        '& .MuiSvgIcon-root': { color: '#d32f2f' },
                    },
                    },
                },
                sx: FilterPanelStyles,
                },
            }}
        />
    );
}

export default ProjectTable;
