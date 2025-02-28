import { ListItemIcon, ListItemText, MenuItem, styled } from '@mui/material';
import { GridColumnMenu } from '@mui/x-data-grid-premium';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';

const StyledPopper = styled(GridColumnMenu)(({}) => ({
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
  minWidth: '186px',
  '& .MuiListItemText-primary': {
    border: 'none',
    color: '#313F68',
    fontFamily: "'Manrope', serif",
    fontSize: '14px',
    fontWeight: '600',
    alignItems: 'flex-start !important',
  },
}));
export const CustomColumnMenu = props => {
  const { colDef, apiRef } = props;
  const isPinnedColumn = apiRef.current.isColumnPinned(colDef.field) === 'left';
  const currentPinnedColumns = apiRef.current.getPinnedColumns();
  const currentLeftPinnedColumns = currentPinnedColumns.left || [];
  const handleFreezClick = () => {
    apiRef.current.setPinnedColumns({
      left: [...currentLeftPinnedColumns, colDef.field],
    });
  };

  const handleUnFreezClick = () => {
    const updatedLeftPinnedColumns = currentLeftPinnedColumns.filter(
      field => field !== colDef.field
    );
    apiRef.current.setPinnedColumns({
      left: updatedLeftPinnedColumns,
    });
  };

  return (
    <StyledPopper
      {...props}
      slots={{
        columnMenuUserItem: MenuItem,
        columnMenuSortItem: null,
        columnMenuFilterItem: null,
        columnMenuHideItem: null,
        columnMenuManageItem: null,
        columnMenuPinningItem: null,
        columnMenuAggregationItem: null,
        columnMenuGroupingItem: null,
        columnMenuColumnsItem: null,
      }}
      slotProps={{
        columnMenuUserItem: {
          displayOrder: 15,
          onClick: isPinnedColumn ? handleUnFreezClick : handleFreezClick,
          children: (
            <>
              <ListItemIcon>
                <SettingsApplicationsIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>
                {isPinnedColumn ? 'Unfreeze' : 'Freeze'}
              </ListItemText>
            </>
          ),
        },
      }}
    />
  );
};
