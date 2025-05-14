import { getInitialsColor } from '@/app/utils/common';
import { styled } from '@mui/material';
import { DataGridPremium, gridClasses } from '@mui/x-data-grid-premium';

export const StyledDataGrid = styled(DataGridPremium)(({
  theme,
  loading,
  groupBy,
  allocationTheme = [],
}) => {
  const allocationRangeStyles = {};

  if (Array.isArray(allocationTheme) && allocationTheme.length > 0) {
    allocationTheme.forEach(range => {
      // Primary styles for teams
      allocationRangeStyles[`& .allocation-theme-${range.id}`] = {
        backgroundColor: range.Color,
      };

      // Secondary styles for resources
      allocationRangeStyles[`& .allocation-theme-${range.id}-secondGroup`] = {
        backgroundColor: ` ${range.Color}66`,
        borderBottom: `2px solid ${range.DarkColor}`,
      };
    });
  }

  return {
    ...allocationRangeStyles,

    [`& .${gridClasses.columnHeader}[data-field="__row_group_by_columns_group__"]`]:
      {
        fontSize: '14px',
      },
    [`& .${gridClasses.columnHeader}[data-fields="|-__row_group_by_columns_group__-|"]`]:
      {
        fontWeight: 'bold',
      },
    [`& .${gridClasses.columnHeader}:focus, & .${gridClasses.columnHeader}:focus-within`]:
      {
        outline: 'none',
      },
    [`& .${gridClasses.cell}[data-field="__row_group_by_columns_group__"]`]: {
      backgroundColor: !loading && '#F1F6FF',
    },
    [`& .${gridClasses.cell}[data-field="__row_group_by_columns_group_teams__"]`]:
      {
        backgroundColor: !loading && '#F7FBFF',
      },
    [`& .${gridClasses.cell}[data-field="__row_group_by_columns_group_teams__"].secondGroupsRow`]:
      {
        backgroundColor: !loading && '#F0F7FF',
      },
    [`& .${gridClasses.cell}[data-field="__row_group_by_columns_group_resource__"]`]:
      {
        backgroundColor: !loading && '#F7FBFF',
      },
    [`& .${gridClasses.cell}[data-field="__row_group_by_columns_group_resource__"].secondGroupsRow`]:
      {
        backgroundColor: !loading && '#F0F7FF',
      },
    [`& .${gridClasses.cell}[data-field="project"].secondGroupsRow`]: {
      backgroundColor: !loading && '#F0F7FF',
    },
    [`& .${gridClasses.cell}[data-field="project"]`]: {
      backgroundColor: !loading && '#F7FBFF',
    },
    [`& .${gridClasses.cell}[data-field="resourceType"]`]: {
      backgroundColor: !loading && '#F7FBFF',
    },
    [`& .${gridClasses.cell}[data-field="FullName"]`]: {
      backgroundColor: !loading && '#F7FBFF',
    },
    [`& .${gridClasses.cell}[data-field="team"]`]: {
      backgroundColor: !loading && '#F7FBFF',
    },
    [`& .${gridClasses.cell}[data-field="organization"]`]: {
      backgroundColor: !loading && '#F7FBFF',
    },
    [`& .${gridClasses.cell}[data-field="Manager"]`]: {
      backgroundColor: !loading && '#F7FBFF',
    },
    [`& .${gridClasses.cell}[data-field="teamStatus"]`]: {
      backgroundColor: !loading && '#F7FBFF',
    },
    [`& .${gridClasses.cell}[data-field="teamStatus"].secondGroupsRow`]: {
      backgroundColor: !loading && '#F0F7FF',
    },
    [`& .${gridClasses.cell}[data-field="teamAllocationManager"]`]: {
      backgroundColor: !loading && '#F7FBFF',
    },
    [`& .${gridClasses.cell}[data-field="teamAllocationManager"].secondGroupsRow`]:
      {
        backgroundColor: !loading && '#F0F7FF',
      },
    [`& .${gridClasses.cell}[data-field="Email"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="Email"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="PhoneNumber"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="PhoneNumber"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="Department"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="Department"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="HRLevel"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="HRLevel"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="Role"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="Role"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="WorkLocation"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="WorkLocation"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="StartDate"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="StartDate"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="EndDate"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="EndDate"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="LocationCategory"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="LocationCategory"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="AverageWeeklyHours"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="AverageWeeklyHours"].secondGroupsRow`]:
      {
        backgroundColor:
          !loading &&
          (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
      },
    [`& .${gridClasses.cell}[data-field="ContractorHourlyRate"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="ContractorHourlyRate"].secondGroupsRow`]:
      {
        backgroundColor:
          !loading &&
          (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
      },
    [`& .${gridClasses.cell}[data-field="ContractorHourlyRateCurrency"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="ContractorHourlyRateCurrency"].secondGroupsRow`]:
      {
        backgroundColor:
          !loading &&
          (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
      },

    [`& .${gridClasses.cell}[data-field="projectOvertimeAllowed"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="projectOvertimeAllowed"].secondGroupsRow`]:
      {
        backgroundColor:
          !loading &&
          (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
      },
    [`& .${gridClasses.cell}[data-field="projectCost"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="projectCost"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="projectCurrency"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="projectCurrency"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="Description"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="Description"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="projectLocation"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="projectLocation"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="projectStartDate"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="projectStartDate"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="projectEndDate"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="projectEndDate"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="Owner"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="Owner"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="ProjectManager"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="ProjectManager"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="Status"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="Status"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="Type"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#F1F6FF' : '#F7FBFF '),
    },
    [`& .${gridClasses.cell}[data-field="Type"].secondGroupsRow`]: {
      backgroundColor:
        !loading &&
        (groupBy === 'project' ? '#F1F6FF !important' : '#F0F7FF !important'),
    },
    [`& .${gridClasses.cell}[data-field="Name"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#FFF3E0' : '#F7FBFF'),
    },
    [`& .${gridClasses.cell}[data-field="Location"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#FFF3E0' : '#F7FBFF'),
    },
    [`& .${gridClasses.cell}[data-field="AllowOvertime"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#FFF3E0' : '#F7FBFF'),
    },
    [`& .${gridClasses.cell}[data-field="actions"]`]: {
      backgroundColor:
        !loading && (groupBy === 'project' ? '#FFF3E0' : '#F7FBFF'),
    },
    //  '& .MuiDataGrid-row:hover': {
    //   backgroundColor: 'inherit !important',
    //   },
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
      backgroundColor: '#AAAFBC30 !important',
    },
    '& .common-NonEditableCells': {
      backgroundColor: '#F1F6FF',
    },
    '& .MuiDataGrid-row--editing .MuiDataGrid-cell.common-NonEditableCells': {
      backgroundColor: '#F1F6FF !important',
    },
    '& .project-view-projectName': {
      backgroundColor: '#E9EFF8',
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
      fontFamily: theme.typography.fontFamily,
      fontWeight: '500',
      textAlign: 'left',
    },
    '& .MuiDataGrid-columnHeader': {
      borderRight: '1px solid #DDE1E4',
      backgroundColor: '#F1F6FF',
      padding: '0 16px 10px',
      color: '#313F68',
      fontFamily: theme.typography.fontFamily,
      fontWeight: '500',
      '& .MuiDataGrid-columnHeaderTitleContainer': {
        // alignItems: 'flex-start',
        '& .MuiDataGrid-columnHeaderTitle': {
          fontSize: '14px',
          fontWeight: 'bold',
        },
      },
    },
    '& .MuiDataGrid-row': {
      '&:hover': {
        backgroundColor: '#FBFCFE',
        '& .MuiDataGrid-cell--pinnedLeft, & .MuiDataGrid-cell--pinnedRight': {
          backgroundColor:
            !loading &&
            (groupBy === 'project'
              ? '#F1F6FF !important'
              : '#F7FBFF !important'),
        },
      },
    },
    '&& .MuiDataGrid-virtualScrollerContent .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedLeft.firstGroupsRow':
      {
        backgroundColor: '#e9eff8 !important',
      },
    '&& .MuiDataGrid-virtualScrollerContent .MuiDataGrid-row:hover .MuiDataGrid-cell--pinnedLeft.secondGroupsRow':
      {
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
    '& .MuiDataGrid-groupingCriteriaCellToggle': {
      marginLeft: '-10px',
      marginRight: '4px',
    },
    '& .MuiDataGrid-columnHeader[data-field="project"] .MuiDataGrid-groupingCriteriaCellToggle':
      {
        marginLeft: '20px !important',
        marginRight: '20px !important',
      },
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
      fontFamily: theme.typography.fontFamily,
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
        fontFamily: theme.typography.fontFamily,
        fontWeight: '500',
        color: '#313F68',
        fontSize: '14px',
        padding: '3px',
        textAlign: 'center',
        border: '1px solid transparent',
        boxSizing: 'border-box',
        '&:focus': {
          backgroundColor: '#FFFFFF50',
          border: '1px solid #000000',
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
          fontFamily: theme.typography.fontFamily,
          fontWeight: 'bold',
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
    '& .poor-allocation-secondGroup': {
      backgroundColor: 'rgba(246, 200, 200, 0.40)',
      borderBottom: '2px solid #DE8787',
    },
    '& .average-allocation-secondGroup': {
      backgroundColor: 'rgba(255, 241, 211, 0.40)',
      borderBottom: '2px solid #EED297',
    },
    '& .fully-occupied-secondGroup': {
      backgroundColor: 'rgba(196, 229, 196, 0.40)',
      borderBottom: '2px solid #92C892',
    },
    '& .over-occupied-secondGroup': {
      backgroundColor: 'rgba(255, 205, 156,  0.4)',
      borderBottom: '2px solid #FFCD9C',
    },
    '& .firstGroupsRow': {
      backgroundColor: 'rgb(233, 239, 248) !important',
      fontWeight: groupBy === 'project' ? 'bold' : '',
      color: groupBy === 'project' ? '#313F68' : '',
    },
    '& .secondGroupsRow': {
      backgroundColor: '#F0F7FF',
    },
    '& .MuiDataGrid-row--editing': {
      boxShadow: 'none',
    },
    '& .total-effort-cell': {
      backgroundColor: '#E9EFF8',
      textAlign: 'center',
      fontWeight: 'bold',
    },
    '& .MuiDataGrid-row--editing .MuiDataGrid-cell.total-effort-cell': {
      backgroundColor: '#E9EFF8 !important',
    },
    '& .empty-group-header': {
      '& .MuiDataGrid-columnHeaderTitleContainer': {
        display: 'none',
      },
    },
  };
});

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
    fontFamily: theme => theme.typography.fontFamily,
    fontSize: '12px',
    fontWeight: '500',
    color: '#212121',
    boxSizing: 'border-box',
    '&::placeholder': {
      color: '#757575',
      opacity: 1,
      fontFamily: theme => theme.typography.fontFamily,
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
    fontFamily: theme => theme.typography.fontFamily,
    fontSize: '14px',
    '& .MuiFormControlLabel-root': {
      margin: '0',
      padding: '6px 0',
      '& span': {
        padding: '0',
      },
      '& .MuiTypography-root': {
        color: '#424242',
        fontFamily: theme => theme.typography.fontFamily,
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
        fontFamily: theme => theme.typography.fontFamily,
        fontSize: '12px',
        fontWeight: '500',
        paddingLeft: '10px',
      },
    },
    '& .MuiButtonBase-root': {
      color: '#298AFF',
      fontFamily: theme => theme.typography.fontFamily,
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
    fontFamily: theme => theme.typography.fontFamily,
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
    fontFamily: theme => theme.typography.fontFamily,
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
    fontFamily: theme => theme.typography.fontFamily,
    fontSize: '13px',
    lineHeight: '16px',
    textTransform: 'none',
    fontWeight: '600',
  },
  '& .MuiButtonBase-root': {
    color: '#298AFF',
    fontFamily: theme => theme.typography.fontFamily,
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
