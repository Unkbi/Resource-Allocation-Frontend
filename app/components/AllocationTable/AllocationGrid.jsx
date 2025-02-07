import { useState, lazy } from 'react';
import { Box } from '@mui/material';
import {
  GridColumnMenuPinningItem,
  useGridApiRef,
  useKeepGroupedColumnsHidden,
} from '@mui/x-data-grid-premium';
import { calculateTotalEffort } from '@/app/utils/common';
import { demoRows } from './data';
import { StyledDataGrid } from './styles/StyledDataGrid';
import './styles/AllocationGrid.css';
import {
  getInitialState,
  getFinalColumns,
  getGroupingColDef,
  groupPage,
  getCellClassName,
} from './AllocationGridUtils';

const CustomToolbar = lazy(() => import('../Toolbar/CustomToolbar'));
const ResourcePopper = lazy(() => import('./components/ResourcePopper'));

export default function AllocationGrid({
  groupBy,
  columns,
  columnGroupingModel,
  data,
}) {
  const apiRef = useGridApiRef();
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedProject, setSelectedProject] = useState('');
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [filterButtonEl, setFilterButtonEl] = useState(null);

  const mapData = groupBy === 'project' ? data : demoRows;
  const updatedRows = mapData.map(row => ({
    ...row,
    totalEffort: calculateTotalEffort(row),
  }));

  const [rowsState, setRowsState] = useState(() => [
    ...updatedRows,
    ...Array.from(new Set(updatedRows.map(row => row.project))).map(
      project => ({
        id: `${project}-add-resource`,
        project: project,
        resource: '',
        role: '',
        totalEffort: '',
        hasButton: true,
        ...Object.keys(updatedRows[0])
          .filter(key => key.startsWith('W'))
          .reduce((acc, week) => {
            acc[week] = '';
            return acc;
          }, {}),
      })
    ),
  ]);

  const initialState = useKeepGroupedColumnsHidden({
    apiRef,
    initialState: getInitialState(groupBy, updatedRows),
  });

  const handleAddRow = (e, resource) => {
    const newRow = {
      id: `${selectedProject}-${resource.FullName}-${rowsState.length + 1}`,
      resourceId: resource.Id,
      project: selectedProject,
      resource: resource.FullName,
      role: resource.Role,
      totalEffort: resource.totalHours,
      ...Object.keys(updatedRows[0])
        .filter(key => key.startsWith('W'))
        .reduce((acc, week) => {
          acc[week] = '';
          return acc;
        }, {}),
      hasButton: false,
    };
    setRowsState(prevRows =>
      prevRows.flatMap(row =>
        row.id === `${selectedProject}-add-resource` ? [newRow, row] : [row]
      )
    );
    setIsSearchMode(false);
  };
  const finalColumns = getFinalColumns(
    columns,
    groupBy,
    setSelectedProject,
    handleAddRow,
    isSearchMode,
    setIsSearchMode
  );

  const showField = [
    ...columns.map(col => col.field),
    ...finalColumns.filter(i => i.field === 'resource').map(col => col.field),
  ];

  const getTogglableColumns = columns =>
    columns
      .filter(column => showField.includes(column.field))
      .map(column => column.field);

  const transformRowData = data => {
    return data.map(row => {
      const modifiedRow = { ...row };

      Object.keys(row).forEach(key => {
        if (
          key.startsWith('W') &&
          row[key] &&
          typeof row[key] === 'object' &&
          row[key].value !== undefined
        ) {
          modifiedRow[key] = row[key].value;
        }
      });

      return modifiedRow;
    });
  };

  return (
    <Box sx={{ height: 'calc(100vh - 54px)', width: '100%' }}>
      <StyledDataGrid
        rows={transformRowData(rowsState)}
        columns={finalColumns}
        apiRef={apiRef}
        loading={false}
        disableRowSelectionOnClick
        initialState={initialState}
        columnGroupingModel={columnGroupingModel}
        defaultGroupingExpansionDepth={1}
        getRowClassName={params => `super-app-theme--${params.row.status}`}
        disableAutosize
        getCellClassName={params => getCellClassName(params, updatedRows)}
        slots={{
          toolbar: CustomToolbar,
          columnMenu: props => {
            return <GridColumnMenuPinningItem {...props} />;
          },
        }}
        slotProps={{
          panel: {
            anchorEl: filterButtonEl,
            className: 'parent-grid-panel',
          },
          columnsManagement: {
            getTogglableColumns,
          },
          toolbar: {
            setFilterButtonEl,
          },
          columnsPanel: {
            className: 'styleColumnMenu',
            sx: {
              '& .MuiDataGrid-columnsManagementHeader': {
                padding:"0"
              },
              "& .MuiInputBase-input": {
                height: "32px",
                lineHeight: "32px",
                background: "#FFFFFF 0% 0% no-repeat padding-box",
                padding: "0",
                borderRadius: "5px",
                fontFamily: "'Manrope', serif",
                fontSize: "12px",
                fontWeight: "500",
                color: "#212121",
                boxSizing: "border-box",
                "&::placeholder": {
                    color: "#757575",
                    opacity: 1,
                    fontFamily: "'Manrope', serif",
                    fontSize: "14px"
                },
              },
              "& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline": {
                  border: "1px solid #D6DCE1",
                  backgroundColor:"rgba(242, 245, 250, 0.3)"
              },
              "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  border: "1px solid #D6DCE1",
                  borderRadius: "4px"
              },
              "& .MuiSvgIcon-root":{
                fontSize:"18px"
              },
              "& .MuiDataGrid-columnsManagement":{
                padding: "5px 0",
                color: "#424242",
                fontFamily: "'Manrope', serif",
                fontSize:"14px",
                "& .MuiFormControlLabel-root":{
                  margin:"0",
                  padding:"6px 0",
                  "& span":{
                    padding:"0"
                  },
                  "& .MuiTypography-root":{
                    color: "#424242",
                    fontFamily: "'Manrope', serif",
                    fontSize: "12px",
                    fontWeight:"500",
                    paddingLeft:"10px"
                  }
                }
              },
              "& .MuiDataGrid-columnsManagementFooter":{
                padding:"0",
                borderColor:"#F2F5FA",
                paddingTop: "6px",
                "& .MuiFormControlLabel-root":{
                  margin:"0",
                  "& span":{
                    padding:"0"
                  },
                  "& .MuiTypography-root":{
                    color: "#424242",
                    fontFamily: "'Manrope', serif",
                    fontSize: "12px",
                    fontWeight:"500",
                    paddingLeft:"10px"
                  }
                },
                "& .MuiButtonBase-root":{
                  color: "#298AFF",
                  fontFamily: "'Manrope', serif",
                  fontSize: "11px",
                  lineHeight: "30px",
                  textTransform: "none",
                  fontWeight: "600",
                  cursor:"pointer",
                  padding:"0",
                  "&:hover":{
                    background:"none"
                  }
                }
              },
            },
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
            sx: {
              // Customize inputs using css selectors
              '& .MuiDataGrid-filterForm': { p: 2 },
              '& .MuiDataGrid-filterForm:nth-child(even)': {
                backgroundColor: theme =>
                  theme.palette.mode === 'dark' ? '#444' : '#f5f5f5',
              },
              '& .MuiDataGrid-filterFormLogicOperatorInput': { mr: 2 },
              '& .MuiDataGrid-filterFormColumnInput': { mr: 2, width: 150 },
              '& .MuiDataGrid-filterFormOperatorInput': { mr: 2 },
              '& .MuiDataGrid-filterFormValueInput': { width: 200 },
              "& .MuiDataGrid-filterForm":{
                padding:"0"
              },
              "& .MuiDataGrid-panelFooter":{
                paddingBottom:"0",
                marginBottom:"-5px"
              },
              "& .MuiSelect-select":{
                backgroundColor: "rgba(255, 255, 255, 0.3)",
                border: "1px solid #D6DCE1",
                borderRadius: "4px",
                color: "#212121",
                fontFamily: "'Manrope', serif",
                fontSize: "13px",
                lineHeight: "16px",
                textTransform: "none",
                fontWeight: "600",
                padding:"8px 10px"
              },
              "& .MuiInputBase-formControl":{
                "&::before":{
                  border:"none !important"
                },
                "&::after":{
                  border:"none !important"
                }
              },
              "& .MuiFormLabel-root":{
                color: "#757575",
                fontFamily: "'Manrope', serif",
                fontSize: "13px",
                lineHeight: "16px",
                textTransform: "none",
                fontWeight: "600",
              },
              "& .MuiButtonBase-root":{
                color: "#298AFF",
                fontFamily: "'Manrope', serif",
                fontSize: "12px",
                lineHeight: "14px",
                textTransform: "none",
                fontWeight: "600",
                "& svg":{
                  fontSize: "16px"
                },
                "& .MuiButton-icon":{
                  marginRight:"3px"
                }
              },
              "& .MuiDataGrid-filterFormDeleteIcon":{
                display:"none"
              },
              "& .MuiDataGrid-filterFormLogicOperatorInput":{
                display:"none"
              }
            },
          },
        }}
        getAggregationPosition={groupNode =>
          groupNode.depth === -1 ? null : 'inline'
        }
        groupingColDef={getGroupingColDef(groupBy)}
        treeDataGroupingHeaderName={groupPage(groupBy)}
        hideFooter
        editMode="row"
      />
    </Box>
  );
}
