import { ListItemIcon, ListItemText, MenuItem } from '@mui/material';
import { GridColumnMenu } from '@mui/x-data-grid-premium';
import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';

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
    <GridColumnMenu
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
