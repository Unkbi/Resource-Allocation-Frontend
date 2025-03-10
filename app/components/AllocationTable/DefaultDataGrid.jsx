import * as React from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/DeleteOutlined';
import SaveIcon from '@mui/icons-material/Save';
import CancelIcon from '@mui/icons-material/Close';
import {
  GridRowModes,
  DataGridPremium,
  GridToolbarContainer,
  GridActionsCellItem,
  GridRowEditStopReasons,
  GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD,
  useKeepGroupedColumnsHidden,
  useGridApiRef,
} from '@mui/x-data-grid-premium';
import {
  //   randomCreatedDate,
  //   randomTraderName,
  randomId,
  //   randomArrayItem,
} from '@mui/x-data-grid-generator';
import { getInitialState } from './AllocationGridUtils';
import { generateColumnGroupingModel } from './TableHeader';
import { StyledDataGrid } from './styles/StyledDataGrid';
import { CustomColumnMenu } from './components/CustomColumnMenu';
import CustomToolbar from '../Toolbar/CustomToolbar';

const roles = ['Market', 'Finance', 'Development'];
// const randomRole = () => {
//   return randomArrayItem(roles);
// };

// const initialRows = [
//   {
//     id: randomId(),
//     name: randomTraderName(),
//     age: 25,
//     joinDate: randomCreatedDate(),
//     role: randomRole(),
//   },
//   {
//     id: randomId(),
//     name: randomTraderName(),
//     age: 36,
//     joinDate: randomCreatedDate(),
//     role: randomRole(),
//   },
//   {
//     id: randomId(),
//     name: randomTraderName(),
//     age: 19,
//     joinDate: randomCreatedDate(),
//     role: randomRole(),
//   },
//   {
//     id: randomId(),
//     name: randomTraderName(),
//     age: 28,
//     joinDate: randomCreatedDate(),
//     role: randomRole(),
//   },
//   {
//     id: randomId(),
//     name: randomTraderName(),
//     age: 23,
//     joinDate: randomCreatedDate(),
//     role: randomRole(),
//   },
// ];

function EditToolbar(props) {
  const { setRows, setRowModesModel } = props;

  const handleClick = () => {
    const id = randomId();
    setRows(oldRows => [
      ...oldRows,
      { id, name: '', age: '', role: '', isNew: true },
    ]);
    setRowModesModel(oldModel => ({
      ...oldModel,
      [id]: { mode: GridRowModes.Edit, fieldToFocus: 'name' },
    }));
  };

  return (
    <GridToolbarContainer>
      <Button color="primary" startIcon={<AddIcon />} onClick={handleClick}>
        Add record
      </Button>
    </GridToolbarContainer>
  );
}

export default function FullFeaturedCrudGrid({
  rows,
  setRows,
  columns,
  rowModesModel,
  setRowModesModel,
  startDate,
}) {
    console.log('rows', rows);
  //   const [rows, setRows] = React.useState(initialRows);
  // const apiRef = useGridApiRef();
  // const initialState = useKeepGroupedColumnsHidden({
  //   apiRef,
  //   initialState: getInitialState(
  //     'teams',
  //     'updatedRows',
  //     GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD
  //   ),
  // });
  const [selectedCell, setSelectedCell] = React.useState('');
  const initialState = getInitialState(
    'teams',
    'updatedRows',
    GRID_ROW_GROUPING_SINGLE_GROUPING_FIELD
  );
  const handleRowEditStop = (params, event) => {
    if (params.reason === GridRowEditStopReasons.rowFocusOut) {
      event.defaultMuiPrevented = true;
    }
    alert('Edit stopped');
    console.log('params', params);
  };

  const processRowUpdate = (newRow, oldRow) => {
    console.log('oldRow', oldRow);
    console.log('newRow', newRow);
    // const updatedRow = { ...newRow, isNew: false };
    // setRows(rows.map(row => (row.id === newRow.id ? updatedRow : row)));
    // setRows(rows.map(row => (row.id === newRow.id ? updatedRow : row)));
    // setRows(prevRows =>
    //     prevRows.map(row =>
    //       row.id === newRow.id
    //         ? {
    //             ...oldRow,
    //             [selectedCell]: {
    //               allocationId: row[selectedCell]?.allocationId || null,
    //               value: newRow[selectedCell],
    //             },
    //             totalEffort: 100
    //             // totalEffort: calculateTotalEffort({
    //             //   ...row,
    //             //   [selectedCell]: {
    //             //     allocationId: row[selectedCell]?.allocationId || null,
    //             //     value: newRow[selectedCell].value,
    //             //   },
    //             // }),
    //           }
    //         : row
    //     )
    //   );


    return {...oldRow, [selectedCell]: {
        allocationId: oldRow[selectedCell]?.allocationId || null,
        value: newRow[selectedCell].toFixed(1),
    }}
  };

  const handleRowModesModelChange = newRowModesModel => {
    // alert('Row modes model changed');
    setRowModesModel(newRowModesModel);
  };

  //   const columns = [
  //     { field: 'name', headerName: 'Name', width: 180, editable: true },
  //     {
  //       field: 'age',
  //       headerName: 'Age',
  //       type: 'number',
  //       width: 80,
  //       align: 'left',
  //       headerAlign: 'left',
  //       editable: true,
  //     },
  //     {
  //       field: 'joinDate',
  //       headerName: 'Join date',
  //       type: 'date',
  //       width: 180,
  //       editable: true,
  //     },
  //     {
  //       field: 'role',
  //       headerName: 'Department',
  //       width: 220,
  //       editable: true,
  //       type: 'singleSelect',
  //       valueOptions: ['Market', 'Finance', 'Development'],
  //     },
  //     {
  //       field: 'actions',
  //       type: 'actions',
  //       headerName: 'Actions',
  //       width: 100,
  //       cellClassName: 'actions',
  //       getActions: ({ id }) => {
  //         const isInEditMode = rowModesModel[id]?.mode === GridRowModes.Edit;

  //         if (isInEditMode) {
  //           return [
  //             <GridActionsCellItem
  //               icon={<SaveIcon />}
  //               label="Save"
  //               sx={{
  //                 color: 'primary.main',
  //               }}
  //               onClick={handleSaveClick(id)}
  //             />,
  //             <GridActionsCellItem
  //               icon={<CancelIcon />}
  //               label="Cancel"
  //               className="textPrimary"
  //               onClick={handleCancelClick(id)}
  //               color="inherit"
  //             />,
  //           ];
  //         }

  //         return [
  //           <GridActionsCellItem
  //             icon={<EditIcon />}
  //             label="Edit"
  //             className="textPrimary"
  //             onClick={handleEditClick(id)}
  //             color="inherit"
  //           />,
  //           <GridActionsCellItem
  //             icon={<DeleteIcon />}
  //             label="Delete"
  //             onClick={handleDeleteClick(id)}
  //             color="inherit"
  //           />,
  //         ];
  //       },
  //     },
  //   ];
//   console.log('finalColumns', columns);
console.log("initialState", initialState);
console.log("columns", columns);
  return (
    <Box
      sx={{
        // height: 500,
        width: '100%',
        '& .actions': {
          color: 'text.secondary',
        },
        '& .textPrimary': {
          color: 'text.primary',
        },
      }}
    >
      <StyledDataGrid
        rows={rows}
        columns={columns}
        isCellEditable={params => !params.row.hasButton}
        editMode="row"
        initialState={initialState}
        columnHeaderHeight={30}
        defaultGroupingExpansionDepth={-1}
        columnGroupHeaderHeight={22}
        getAggregationPosition={groupNode =>
          groupNode.depth === -1 ? null : 'inline'
        }
        rowModesModel={rowModesModel}
        onRowModesModelChange={handleRowModesModelChange}
        columnGroupingModel={generateColumnGroupingModel(startDate, columns)}
        onRowEditStop={handleRowEditStop}
        processRowUpdate={processRowUpdate}
        slots={{
              toolbar: CustomToolbar,
              columnMenu: props => {
                return <CustomColumnMenu {...props} apiRef={apiRef} />;
              },
            }}
        slotProps={{
          toolbar: { setRows, setRowModesModel },
        }}
        onCellClick={params => {
            setSelectedCell(params.field);
        }}
      />
    </Box>
  );
}
