import { styled } from '@mui/material';
import { DataGridPremium, gridClasses } from '@mui/x-data-grid-premium';

export const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
  [`& .${gridClasses.columnHeader}[data-field="__row_group_by_columns_group__"]`]:
    {
      width: '290px !important',
    },
  [`& .${gridClasses.columnHeader}[data-fields="|-__row_group_by_columns_group__-|"]`]:
    {
      width: '290px !important',
    },
  [`& .${gridClasses.cell}[data-field="__row_group_by_columns_group__"]`]: {
    width: '290px',
  },

  [`& .${gridClasses.columnHeader}`]: {
    '&.prime-header': {},
    '&.secondary-header': {},
    '&.weekly-header': {},
  },
  [`& .${gridClasses.cell}`]: {
    '&.prime-cell': {},
    '&.secondary-cell': {},
    '&.weeklyCell': {},
  },
  [`.${gridClasses.cell}`]: {
    "& input[type='number']": {
      appearance: 'textfield',
      margin: 0,
    },
    "& input[type='number']::-webkit-outer-spin-button, & input[type='number']::-webkit-inner-spin-button":
      {
        display: 'none',
      },
  },
  '& .MuiDataGrid-cell': {
    borderRight: '1px solid #DDE1E4',
    fontSize: '14px',
    padding: '0 16px',
    color: '#313F68',
    fontFamily: "'Manrope', serif",
    fontWeight: '500',
  },
  '& .MuiDataGrid-columnHeader': {
    borderRight: '1px solid #DDE1E4',
    backgroundColor: '#FBFCFE',
    padding: '0 16px',
    color: '#313F68',
    fontFamily: "'Manrope', serif",
    fontWeight: '500',
  },
  '& .MuiDataGrid-row': {
    '&:hover': {
      backgroundColor: '#FBFCFE',
    },
  },
  border: 'none',
  '& .MuiDataGrid-cell:focus': {
    outline: 'none',
  },
  '& .MuiDataGrid-columnHeader:focus': {
    outline: 'none',
  },
  '& .MuiDataGrid-groupingCriteriaCellToggle button': {
    display: 'none',
  },
  '& .MuiDataGrid-groupingCriteriaCell': {
    padding: '0',
  },
  '& .MuiDataGrid-cellContent': {
    paddingLeft: '8px',
  },
  '& .MuiDataGrid-groupingCriteriaCellToggle': {
    display: 'none',
  },
  '& .MuiDataGrid-aggregationColumnHeaderLabel': {
    display: 'none',
  },
  '& .weeklyCell': {
    textAlign: 'center',
    fontFamily: "'Manrope', serif",
    fontWeight: '500',
    fontSize: '14px',
    color: '#212121',
    padding: '3px',
    "&.MuiDataGrid-cell--editing:focus-within":{
      outline:"none"
    },
    "&.MuiDataGrid-cell.MuiDataGrid-cell--editing":{
      padding:"0"
    },
    "& .MuiDataGrid-editInputCell":{
      
    },
    "& input":{
      fontFamily: "'Manrope', serif",
      fontWeight: "500",
      color: "#313F68",
      fontSize: "14px",
      padding:"3px",
      textAlign:"center",
      border:"1px solid transparent",
      boxSizing: "border-box",
      "&:focus":{
        backgroundColor: "rgba(157, 201, 255, 0.3)",
        border:"1px solid #298AFF"
      }
    }
  },
  '& .weekly-header': {
    padding: '3px',
    backgroundColor: 'rgba(20, 43, 81, 0.72)',
    '& .MuiDataGrid-columnHeaderTitleContainer': {
      justifyContent: 'center',
      '& .MuiDataGrid-columnHeaderTitle': {
        fontFamily: "'Manrope', serif",
        fontWeight: '500',
        fontSize: '12px',
        color: '#fff',
      },
    },
  },
  '& .current-week-header': {
    backgroundColor: 'rgb(43 102 199 / 72%)',
  },
  '& .MuiDataGrid-columnSeparator--resizable': {
    opacity: '0',
  },
  '& .MuiDataGrid-cellEmpty': {
    display: 'none',
  },
  '& .MuiDataGrid-cell:focus-within': {
    outline: 'none',
  },
  '& .poor-allocation': {
    backgroundColor: '#F6C8C8',
    border: '#CE8585',
  },
  '& .average-allocation': {
    backgroundColor: '#FFF1D3',
    border: '#BDAE88',
  },
  '& .fully-occupied': {
    backgroundColor: '#C4E5C4',
    border: '#7AB17A',
  },
  '& .MuiDataGrid-cell:focus-within': {
    outline: 'none',
  },
  "& .MuiDataGrid-row--editing":{
    boxShadow:"none"
  }
}));
