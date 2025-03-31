import { getInitialsColor } from '@/app/utils/common';
import { BackHand } from '@mui/icons-material';
import { styled } from '@mui/material';
import { DataGridPremium, gridClasses } from '@mui/x-data-grid-premium';

export const StyledDataGrid = styled(DataGridPremium)(({ theme }) => ({
  [`& .${gridClasses.columnHeader}[data-field="__row_group_by_columns_group__"]`]:
    {
      // width: '240px !important',
      fontSize: '14px',
    },
  [`& .${gridClasses.columnHeader}[data-fields="|-__row_group_by_columns_group__-|"]`]:
    {
      // width: '240px !important',
      fontWeight:"bold",
    },
  [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
    {
      outline: 'none',
    },
  [`& .${gridClasses.cell}[data-field="__row_group_by_columns_group__"]`]: {
    // width: '240px',
  },
  [`& .${gridClasses.cell}[data-field="__row_group_by_columns_group__"].firstGroupsRow`]:
    {
      '&:before': {
        content: '""',
        position: 'absolute',
        top: '5px',
        left: '0px',
        width: '5px',
        height: '40px',
        // backgroundColor: getInitialsColor('A', 'B', 'C', 'D') || '#FFBFB0',
      },
    },
  '& .MuiDataGrid-cell.MuiDataGrid-cell--editing': {
    boxShadow: 'none !important',
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
    backgroundColor :" rgb(240, 247, 255)",
  },
  '& .MuiDataGrid-columnHeader': {
    borderRight: '1px solid #DDE1E4',
    backgroundColor: '#F1F6FF',
    padding: '0 16px 10px',
    color: '#313F68',
    fontFamily: "'Manrope', serif",
    fontWeight: '500',
    '& .MuiDataGrid-columnHeaderTitleContainer': {
      // alignItems: 'flex-start',
      '& .MuiDataGrid-columnHeaderTitle': {
        fontSize: '14px',
        fontWeight:"bold",
      },
    },
  },
  '& .MuiDataGrid-row': {
    '&:hover': {
      backgroundColor: '#FBFCFE',
      '& .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-cell--pinnedRight': {
        backgroundColor: '#FBFCFE !important',
      },
    },
  },
  '&& .MuiDataGrid-virtualScrollerContent .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedLeft.firstGroupsRow': {
    backgroundColor: '#e9eff8 !important',
  },
    '&& .MuiDataGrid-virtualScrollerContent .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedLeft.secondGroupsRow': {
    backgroundColor: '#f0f7ff !important',
  },
  border: 'none',
  '& .MuiDataGrid-groupingCriteriaCell span[style*="white-space: pre"]': {
    display: 'none',
  },
  '& .MuiDataGrid-groupingCriteriaCell': {
    padding: '0',
  },
  '& .MuiDataGrid-cellContent': {
    paddingLeft: '8px',
  },
  // '& .MuiDataGrid-groupingCriteriaCellToggle': {
  //   display: 'none',
  // },
  '& .MuiDataGrid-aggregationColumnHeaderLabel': {
    display: 'none',
  },
  '& .errorCell': {
    '& input': {
      border: '1px solid red !important',
      backgroundColor: 'rgb(126,10,15, 0.1) !important',
    },
  },
  '& .MuiDataGrid-filler--pinnedLeft': {
    width: '240px',
  },
  '& .Mui-error': {
    '& input': {
      border: '1px solid red !important',
      backgroundColor: 'rgb(126,10,15, 0.1)',
      color: theme.palette.error.main,
      ...theme.applyStyles('dark', {
        backgroundColor: 'rgb(126,10,15, 0)',
      }),
    },
  },
  '.MuiSvgIcon-colorAction': {
    display: 'none',
  },
  '& .weeklyCell': {
    textAlign: 'center',
    fontFamily: "'Manrope', serif",
    fontWeight: '500',
    fontSize: '14px',
    color: '#212121',
    padding: '3px',
    lineHeight: '45px',
    '&.MuiDataGrid-cell--editing:focus-within': {
      outline: 'none',
    },
    '&.MuiDataGrid-cell.MuiDataGrid-cell--editing': {
      padding: '0',
    },
    '& .MuiDataGrid-editInputCell': {},
    '& input': {
      fontFamily: "'Manrope', serif",
      fontWeight: '500',
      color: '#313F68',
      fontSize: '14px',
      padding: '3px',
      textAlign: 'center',
      border: '1px solid transparent',
      boxSizing: 'border-box',
      '&:focus': {
        backgroundColor: 'rgba(157, 201, 255, 0.3)',
        border: '1px solid #298AFF',
      },
    },
  },
  '& .weekly-header': {
    padding: '3px',
    backgroundColor: 'rgba(20, 43, 81, 0.72)',
    '& .MuiDataGrid-columnHeaderTitleContainer': {
      justifyContent: 'center',
      alignItems: 'center',
      '& .MuiDataGrid-columnHeaderTitle': {
        fontFamily: "'Manrope', serif",
        fontWeight:"bold",
        fontSize: '12px',
        color: '#fff',
      },
    },
  },
  '& .grouping-header': {
    padding: '3px',
    '& .MuiDataGrid-columnHeaderTitleContainer': {
      alignItems: 'center',
      borderBottom: 'none',
      '& .MuiDataGrid-columnHeaderTitle': {
        fontWeight: 'bold',
        fontSize: '12px',
      },
    },
  },
  '& .current-week-header': {
    backgroundColor: 'rgb(43 102 199 / 72%)',
  },
  '& .MuiDataGrid-columnSeparator--resizable': {
    opacity: '0',
  },
  '& .MuiDataGrid-columnSeparator--sideRight': {
    opacity: 0,
  },
  '& .MuiDataGrid-cellEmpty': {
    display: 'none',
  },
  '& .poor-allocation': {
    backgroundColor: '#F6C8C8',
    // border: '#CE8585',
  },
  '& .average-allocation': {
    backgroundColor: '#FFF1D3',
    // border: '#BDAE88',
  },
  '& .fully-occupied': {
    backgroundColor: '#C4E5C4',
    // border: '#7AB17A',
  },
  '& .over-occupied': {
    backgroundColor: '#FFCD9C',
  },
  '& .firstGroupsRow': {
    backgroundColor: '#E9EFF8',
  },
  '& .secondGroupsRow': {
    backgroundColor: '#F0F7FF',
  },
  '& .MuiDataGrid-row--editing': {
    boxShadow: 'none',
  },
  '& .total-effort-cell' : {
     backgroundColor: '#E9EFF8',
},'& .MuiDataGrid-row--editing .MuiDataGrid-cell.total-effort-cell': {
  backgroundColor: '#E9EFF8 !important',
},
  '& .empty-group-header': {
    '& .MuiDataGrid-columnHeaderTitleContainer': {
      display: 'none',
    },
  },
}));

export const ColumnManagementStyles = {
  '& .MuiDataGrid-columnsManagementHeader': {
    padding: '0',
  },
  '& .MuiInputBase-input': {
    height: '32px',
    lineHeight: '32px',
    background: '#FFFFFF 0% 0% no-repeat padding-box',
    padding: '0',
    borderRadius: '5px',
    fontFamily: "'Manrope', serif",
    fontSize: '12px',
    fontWeight: '500',
    color: '#212121',
    boxSizing: 'border-box',
    '&::placeholder': {
      color: '#757575',
      opacity: 1,
      fontFamily: "'Manrope', serif",
      fontSize: '14px',
    },
  },
  '& .MuiOutlinedInput-root .MuiOutlinedInput-notchedOutline': {
    border: '1px solid #D6DCE1',
    backgroundColor: 'rgba(242, 245, 250, 0.3)',
  },
  '& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: '1px solid #D6DCE1',
    borderRadius: '4px',
  },
  '& .MuiSvgIcon-root': {
    fontSize: '18px',
  },
  '& .MuiDataGrid-columnsManagement': {
    padding: '5px 0',
    color: '#424242',
    fontFamily: "'Manrope', serif",
    fontSize: '14px',
    '& .MuiFormControlLabel-root': {
      margin: '0',
      padding: '6px 0',
      '& span': {
        padding: '0',
      },
      '& .MuiTypography-root': {
        color: '#424242',
        fontFamily: "'Manrope', serif",
        fontSize: '12px',
        fontWeight: '500',
        paddingLeft: '10px',
      },
    },
  },
  '& .MuiDataGrid-columnsManagementFooter': {
    padding: '0',
    borderColor: '#F2F5FA',
    paddingTop: '6px',
    '& .MuiFormControlLabel-root': {
      margin: '0',
      '& span': {
        padding: '0',
      },
      '& .MuiTypography-root': {
        color: '#424242',
        fontFamily: "'Manrope', serif",
        fontSize: '12px',
        fontWeight: '500',
        paddingLeft: '10px',
      },
    },
    '& .MuiButtonBase-root': {
      color: '#298AFF',
      fontFamily: "'Manrope', serif",
      fontSize: '11px',
      lineHeight: '30px',
      textTransform: 'none',
      fontWeight: '600',
      cursor: 'pointer',
      padding: '0',
      '&:hover': {
        background: 'none',
      },
    },
  },
};

export const FilterPanelStyles = {
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
  '& .MuiDataGrid-filterForm': {
    padding: '0',
  },
  '& .MuiDataGrid-panelFooter': {
    paddingBottom: '0',
    marginBottom: '-5px',
  },
  '& .MuiInputBase-input': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    border: '1px solid #D6DCE1',
    borderRadius: '4px',
    color: '#212121',
    fontFamily: "'Manrope', serif",
    fontSize: '13px',
    lineHeight: '16px',
    textTransform: 'none',
    fontWeight: '600',
    padding: '8px 10px',
  },
  '& .MuiSelect-select': {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    border: '1px solid #D6DCE1',
    borderRadius: '4px',
    color: '#212121',
    fontFamily: "'Manrope', serif",
    fontSize: '13px',
    lineHeight: '16px',
    textTransform: 'none',
    fontWeight: '600',
    padding: '8px 10px',
  },
  '& .MuiInputBase-formControl': {
    '&::before': {
      border: 'none !important',
    },
    '&::after': {
      border: 'none !important',
    },
  },
  '& .MuiFormLabel-root': {
    color: '#757575',
    fontFamily: "'Manrope', serif",
    fontSize: '13px',
    lineHeight: '16px',
    textTransform: 'none',
    fontWeight: '600',
  },
  '& .MuiButtonBase-root': {
    color: '#298AFF',
    fontFamily: "'Manrope', serif",
    fontSize: '12px',
    lineHeight: '14px',
    textTransform: 'none',
    fontWeight: '600',
    '& svg': {
      fontSize: '16px',
    },
    '& .MuiButton-icon': {
      marginRight: '3px',
    },
  },
  '& .MuiDataGrid-filterFormDeleteIcon': {
    display: 'none',
  },
  '& .MuiDataGrid-filterFormLogicOperatorInput': {
    display: 'none',
  },
};
