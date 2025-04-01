"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CustomColumnMenu = void 0;
const material_1 = require("@mui/material");
const x_data_grid_premium_1 = require("@mui/x-data-grid-premium");
//import SettingsApplicationsIcon from '@mui/icons-material/SettingsApplications';
const Groups_1 = __importDefault(require("@mui/icons-material/Groups"));
const Person_1 = __importDefault(require("@mui/icons-material/Person"));
const react_1 = require("react");
const react_redux_1 = require("react-redux");
const StyledPopper = (0, material_1.styled)(x_data_grid_premium_1.GridColumnMenu)(({}) => ({
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
const CustomUserMenuItems = ({ apiRef }) => {
    const [teamsExpanded, setTeamsExpanded] = (0, react_1.useState)(true);
    const [resourcesExpanded, setResourcesExpanded] = (0, react_1.useState)(false);
    const view = (0, react_redux_1.useSelector)((state) => state.allocationView.view);
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
    const getGroupRowIdsByDepth = (targetDepth) => {
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
    const areAllExpanded = (ids) => ids.length > 0 && ids.every(id => apiRef.current.getRowNode(id)?.childrenExpanded !== false);
    // collapse or uncollapse rows
    const toggleGroupRows = (ids, shouldExpand) => {
        requestAnimationFrame(() => {
            ids.forEach(id => {
                try {
                    apiRef.current.setRowChildrenExpansion(id, shouldExpand);
                }
                catch (err) {
                    console.warn(`failed to toggle group ${id}`, err);
                }
            });
        });
    };
    // update state on menu open
    (0, react_1.useEffect)(() => {
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
    return (React.createElement(React.Fragment, null,
        React.createElement(material_1.MenuItem, { onClick: handleToggleTeams },
            React.createElement(material_1.ListItemIcon, null,
                React.createElement(Groups_1.default, { fontSize: "small" })),
            React.createElement(material_1.ListItemText, null, teamsExpanded
                ? view === 'Projects' ? 'Collapse All Projects' : 'Collapse All Teams'
                : view === 'Projects' ? 'Expand All Projects' : 'Expand All Teams')),
        view !== 'Projects' && (React.createElement(material_1.MenuItem, { onClick: handleToggleResources },
            React.createElement(material_1.ListItemIcon, null,
                React.createElement(Person_1.default, { fontSize: "small" })),
            React.createElement(material_1.ListItemText, null, resourcesExpanded ? 'Collapse All Resources' : 'Expand All Resources')))));
};
const CustomColumnMenu = (props) => {
    const { apiRef, ...otherProps } = props;
    return (React.createElement(StyledPopper, { ...otherProps, slots: {
            ...x_data_grid_premium_1.GRID_COLUMN_MENU_SLOTS,
            columnMenuUserItem: () => React.createElement(CustomUserMenuItems, { apiRef: apiRef }),
            columnMenuSortItem: null,
            columnMenuAggregationItem: null,
            columnMenuGroupingItem: null,
        }, slotProps: {
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
        } }));
};
exports.CustomColumnMenu = CustomColumnMenu;
