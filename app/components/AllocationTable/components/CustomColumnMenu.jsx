import { ListItemIcon, ListItemText, MenuItem, styled } from '@mui/material';
import {
  GridColumnMenu,
  GRID_COLUMN_MENU_SLOTS,
} from '@mui/x-data-grid-premium';
//import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
import GroupIcon from '@mui/icons-material/Groups';
import PersonIcon from '@mui/icons-material/Person';
import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const StyledPopper = styled(GridColumnMenu)(({ theme }) => ({
  backgroundColor: '#ffffff',
  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
  minWidth: '186px',
  '& .MuiListItemText-primary': {
    border: 'none',
    color: '#313F68',
    fontFamily: theme.typography.fontFamily,
    fontSize: '14px',
    fontWeight: '600',
    alignItems: 'flex-start !important',
  },
}));

const CustomUserMenuItems = ({ apiRef }) => {
  const [teamsExpanded, setTeamsExpanded] = useState(true);
  const [resourcesExpanded, setResourcesExpanded] = useState(false);
  const view = useSelector(state => state.allocationView.view);

  /* freeze click not in use
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
  */

  // get group row IDs by depth: teams/projects = 0, resources = 1
  const getGroupRowIdsByDepth = targetDepth => {
    const tree = apiRef.current.state.rows.tree;
    const groupIds = [];

    for (const id in tree) {
      const node = tree[id];
      if (node?.type === 'group' && node?.depth === targetDepth) {
        groupIds.push(id);
      }
    }

    return groupIds;
  };

  // check if all rows with given IDs are expanded
  const areAllExpanded = ids =>
    ids.length > 0 &&
    ids.every(id => apiRef.current.getRowNode(id)?.childrenExpanded !== false);

  // collapse or uncollapse rows
  const toggleGroupRows = (ids, shouldExpand) => {
    requestAnimationFrame(() => {
      ids.forEach(id => {
        try {
          apiRef.current.setRowChildrenExpansion(id, shouldExpand);
        } catch (err) {
          console.warn(`failed to toggle group ${id}`, err);
        }
      });
    });
  };

  // update state on menu open
  useEffect(() => {
    const teamIds = getGroupRowIdsByDepth(0);
    const resourceIds = getGroupRowIdsByDepth(1);

    setTeamsExpanded(areAllExpanded(teamIds));
    setResourcesExpanded(areAllExpanded(resourceIds));
  }, []);

  // toggle team/project rows (depth 0)
  const handleToggleTeams = () => {
    const teamIds = getGroupRowIdsByDepth(0);
    const shouldExpand = !teamsExpanded;
    toggleGroupRows(teamIds, shouldExpand);
    setTeamsExpanded(shouldExpand);
    apiRef.current.hideColumnMenu();
  };

  // toggle resource rows (depth 1)
  const handleToggleResources = () => {
    const teamIds = getGroupRowIdsByDepth(0);
    const resourceIds = getGroupRowIdsByDepth(1);
    const shouldExpand = !resourcesExpanded;

    if (shouldExpand && !areAllExpanded(teamIds)) {
      toggleGroupRows(teamIds, true);
      setTeamsExpanded(true);
    }

    toggleGroupRows(resourceIds, shouldExpand);
    setResourcesExpanded(shouldExpand);
    apiRef.current.hideColumnMenu();
  };

  return (
    <>
      <MenuItem onClick={handleToggleTeams}>
        <ListItemIcon>
          <GroupIcon fontSize="small" />
        </ListItemIcon>
        <ListItemText>
          {teamsExpanded
            ? view === 'Project'
              ? 'Collapse All Projects'
              : 'Collapse All Teams'
            : view === 'Project'
              ? 'Expand All Projects'
              : 'Expand All Teams'}
        </ListItemText>
      </MenuItem>

      {view !== 'Project' && (
        <MenuItem onClick={handleToggleResources}>
          <ListItemIcon>
            <PersonIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>
            {resourcesExpanded
              ? 'Collapse All Resources'
              : 'Expand All Resources'}
          </ListItemText>
        </MenuItem>
      )}
    </>
  );
};

export const CustomColumnMenu = props => {
  const { apiRef, ...otherProps } = props;

  return (
    <StyledPopper
      {...otherProps}
      slots={{
        ...GRID_COLUMN_MENU_SLOTS,
        columnMenuUserItem: () => <CustomUserMenuItems apiRef={apiRef} />,
        columnMenuSortItem: null,
        columnMenuAggregationItem: null,
        columnMenuGroupingItem: null,
      }}
      slotProps={{
        columnMenuUserItem: {
          displayOrder: 0,
        },
        columnMenuColumnsItem: {
          displayOrder: 2,
        },
        columnMenuPinningItem: {
          displayOrder: 99,
        },
        /* freeze click not in use
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
        */
      }}
    />
  );
};
