'use client';

import React, { useMemo, useState, useRef } from 'react';
import {
  Box,
  Button,
  Typography,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Badge,
} from '@mui/material';
import { StyledInput } from '../Input/StyledInput';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import {
  DataGrid,
  GridCsvExportMenuItem,
  GridRowSelectionModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExportContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import {
  ColumnManagementStyles,
  FilterPanelStyles,
} from '../AllocationTable/styles/StyledDataGrid';
import SettingsToolbar from '../Toolbar/SettingsToolbar';
import { DataGridPremium, GridExcelExportMenuItem } from '@mui/x-data-grid-premium';
interface AccessTableProps {
  title: string;
  data: any[];
  onAdd: () => void;
  onEdit: (item: any) => void;
  onDelete: (id: string) => void;
  renderMenu: (id: string) => React.ReactNode;
  menuId: string | null;
  setMenuId: (id: string | null) => void;
  setAnchorEl: (el: HTMLElement | null) => void;
  anchorEl: HTMLElement | null;
  buttonLabel?: string;
  toolbarType?: 'filter' | 'none';
  columns?: any[];
  apiRef?: any;
  loading?: boolean;
  checkboxSelection?: boolean;
  setMode?: () => void;
  onBulkAddUser?: (resources: any[]) => void;
  onBulkSendInvite?: (resources: any[]) => void;
  onBulkResendInvite?: (resources: any[]) => void;
  onBulkDeactivateUser?: (resources: any[]) => void;
  onBulkReactivateUser?: (resources: any[]) => void;
  selectedRowIds?: Set<string>;
  onSelectionChange?: (hasSelection: boolean, selectedIds: Set<string>) => void;
  isRowSelectable?: (params: any) => boolean;
  initialState?: any;
}

export default function AccessTable({
  title,
  data,
  onAdd,
  onEdit,
  onDelete,
  renderMenu,
  menuId,
  setMenuId,
  setAnchorEl,
  anchorEl,
  buttonLabel = '',
  columns = [],
  toolbarType,
  apiRef,
  loading = false,
  checkboxSelection = false,
  setMode,
  onBulkAddUser,
  onBulkSendInvite,
  onBulkResendInvite,
  onBulkDeactivateUser,
  onBulkReactivateUser,
  selectedRowIds = new Set(),
  onSelectionChange,
  isRowSelectable,
  initialState = {},
}: AccessTableProps) {
  const [search, setSearch] = useState('');
  const [gridView, setGridView] = useState<'grid' | 'list'>('grid');
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [selectionModel, setSelectionModel] = useState<GridRowSelectionModel>(
    []
  );
  const [filterButtonEl, setFilterButtonEl] = useState(null);
  const [showToolbar, setShowToolbar] = useState(false);
  const [activeQuickFilter, setActiveQuickFilter] = useState('Not Created');
  const [filterModel, setFilterModel] = useState({
    items: [],
  });
  const [columnVisibilityModel, setColumnVisibilityModel] = useState(
    initialState.columns?.columnVisibilityModel || {}
  );
  const [filterCount, setFilterCount] = useState(0);

  // Track filter count
  React.useEffect(() => {
    if (apiRef?.current) {
      const updateFilterCount = () => {
        const filters = apiRef.current.state.filter.filterModel.items;
        const activeCount = filters.filter((f: any) => !!f.value).length;
        setFilterCount(activeCount);
      };
      updateFilterCount();
      const unsubscribe = apiRef.current.subscribeEvent(
        'filterModelChange',
        updateFilterCount
      );
      return unsubscribe;
    }
  }, [apiRef]);

  // Sync internal selectionModel with parent's selectedRowIds
  React.useEffect(() => {
    if (selectedRowIds.size === 0) {
      setSelectionModel([]);
      setSelectedRows([]);
      setShowToolbar(false);
    }
  }, [selectedRowIds]);

  // Refs for external filter and column buttons to use as anchor elements
  const externalFilterButtonRef = useRef<HTMLButtonElement>(null);
  const externalColumnButtonRef = useRef<HTMLButtonElement>(null);
  const [currentAnchorEl, setCurrentAnchorEl] = useState<HTMLElement | null>(
    null
  );

  const quickFilterOptions = [
    { label: 'All', value: 'All' },
    { label: 'Not Created', value: 'Not Created' },
    { label: 'Invited', value: 'Invited' },
    { label: 'Active', value: 'Active' },
    { label: 'Inactive', value: 'Inactive' },
  ];

  const filteredRows = useMemo(() => {
    if (!data) return [];

    let filtered = data;

    if (title === 'Resources' && activeQuickFilter !== 'All') {
      filtered = filtered.filter((row: any) => {
        return row.userStatus === activeQuickFilter;
      });
    }

    // Apply search filter
    if (search) {
      filtered = filtered.filter((row: any) => {
        return (
          (row.Name &&
            String(row.Name).toLowerCase().includes(search.toLowerCase())) ||
          (row.email &&
            String(row.email).toLowerCase().includes(search.toLowerCase()))
        );
      });
    }

    return filtered;
  }, [data, search, activeQuickFilter, title]);

  const handleQuickFilterChange = (filterValue: string) => {
    setActiveQuickFilter(filterValue);
  };

  const handleSelectionChange = (newSelection: GridRowSelectionModel) => {
    const hasSelection = newSelection.length > 0;
    setShowToolbar(hasSelection);

    const selectedIds = new Set(newSelection.map(id => String(id)));

    onSelectionChange?.(hasSelection, selectedIds);

    setSelectionModel(newSelection);
    const ids = new Set(newSelection.map(id => String(id)));
    const selected = (filteredRows || []).filter(row =>
      ids.has(String(row.id ?? row.Name ?? JSON.stringify(row)))
    );
    setSelectedRows(selected);
  };

  const getAvailableActions = () => {
    if (!selectedRows.length) return {};

    const getStatus = (row: any) => {
      return title === 'Resources' ? row.userStatus : row.status;
    };

    const canAddUser =
      title === 'Resources'
        ? selectedRows.every(row => getStatus(row) === 'Not Created')
        : false;
    const canSendInvite = selectedRows.every(
      row => getStatus(row) === 'Created'
    );
    const canResendInvite = selectedRows.every(
      row => getStatus(row) === 'Invited'
    );
    const canDeactivate = selectedRows.every(row =>
      ['Created', 'Invited', 'Active'].includes(getStatus(row))
    );
    const canReactivate = selectedRows.every(
      row => getStatus(row) === 'Inactive'
    );

    return {
      showAddUser: canAddUser,
      showSendInvite: canSendInvite,
      showResendInvite: canResendInvite,
      showDeactivate: canDeactivate,
      showReactivate: canReactivate,
    };
  };

  const availableActions = getAvailableActions();

  // Check if any action is available
  const hasAnyAction = Object.values(availableActions).some(
    action => action === true
  );

  const handleFilterModelChange = (newModel: any) => {
    setFilterModel(newModel);
  };

  const handleColumnVisibilityModelChange = (newModel: any) => {
    setColumnVisibilityModel(newModel);
  };

  // Get toggleable columns - filter out action column and include all data columns
  const getTogglableColumns = (columns: any[]) => {
    return columns
      .filter(column => column.field !== 'actions')
      .map(column => column.field);
  };

  const filterColumns = ({ columns }: { columns: any[] }) => {
    return getTogglableColumns(columns);
  };

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer sx={{ display: 'none' }}>
        <GridToolbarFilterButton />
        <GridToolbarColumnsButton />
      </GridToolbarContainer>
    );
  };

  const AccessToolbar = () => (
    <SettingsToolbar
      title={title}
      buttonLabel={buttonLabel}
      onButtonClick={onAdd}
    />
  );

  return (
    <Box
      sx={{ mt: 2, mb: 2, background: '#fff', borderRadius: 2, boxShadow: 1 }}
    >
      {checkboxSelection ? (
        showToolbar ? (
          // Selection action toolbar when rows are selected
          <Box
            px={2}
            py={2}
            display="flex"
            alignItems="center"
            gap={2}
            sx={{ borderBottom: '0.667px solid #E5E7EB' }}
          >
            <Typography
              sx={{ color: '#152E75', fontWeight: 700, fontSize: 13 }}
            >
              {selectedRows.length}{' '}
              {title === 'Resources' ? 'Resources' : 'Users'} selected
            </Typography>

            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              {!hasAnyAction ? (
                <Typography
                  sx={{
                    color: '#6B7280',
                    fontSize: 13,
                    fontStyle: 'italic',
                  }}
                >
                  No bulk actions available for mixed selection
                </Typography>
              ) : title === 'Resources' ? (
                // Resource-specific toolbar buttons
                <>
                  {availableActions.showAddUser && (
                    <Button
                      variant="contained"
                      onClick={() => onBulkAddUser?.(selectedRows)}
                      sx={{
                        height: 36,
                        borderRadius: 1,
                        background: '#152E75',
                        color: '#FFF',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Invite
                    </Button>
                  )}

                  {availableActions.showSendInvite && (
                    <Button
                      variant="contained"
                      onClick={() => onBulkSendInvite?.(selectedRows)}
                      sx={{
                        height: 36,
                        borderRadius: 1,
                        background: '#152E75',
                        color: '#FFF',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Invite
                    </Button>
                  )}

                  {availableActions.showResendInvite && (
                    <Button
                      variant="contained"
                      onClick={() => onBulkResendInvite?.(selectedRows)}
                      sx={{
                        height: 36,
                        borderRadius: 1,
                        background: '#152E75',
                        color: '#FFF',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Reinvite
                    </Button>
                  )}

                  {availableActions.showDeactivate && (
                    <Button
                      variant="contained"
                      onClick={() => onBulkDeactivateUser?.(selectedRows)}
                      sx={{
                        height: 36,
                        borderRadius: 1,
                        background: '#152E75',
                        color: '#FFF',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Deactivate
                    </Button>
                  )}
                  {availableActions.showReactivate && (
                    <Button
                      variant="contained"
                      onClick={() => onBulkReactivateUser?.(selectedRows)}
                      sx={{
                        height: 36,
                        borderRadius: 1,
                        background: '#152E75',
                        color: '#FFF',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Reactivate
                    </Button>
                  )}
                </>
              ) : (
                // User-specific toolbar buttons - use same logic as Resources
                <>
                  {availableActions.showAddUser && (
                    <Button
                      variant="contained"
                      onClick={() => onBulkAddUser?.(selectedRows)}
                      sx={{
                        height: 36,
                        borderRadius: 1,
                        background: '#152E75',
                        color: '#FFF',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Add
                    </Button>
                  )}

                  {availableActions.showSendInvite && (
                    <Button
                      variant="contained"
                      onClick={() => onBulkSendInvite?.(selectedRows)}
                      sx={{
                        height: 36,
                        borderRadius: 1,
                        background: '#152E75',
                        color: '#FFF',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Invite
                    </Button>
                  )}

                  {availableActions.showResendInvite && (
                    <Button
                      variant="contained"
                      onClick={() => onBulkResendInvite?.(selectedRows)}
                      sx={{
                        height: 36,
                        borderRadius: 1,
                        background: '#152E75',
                        color: '#FFF',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Re-invite
                    </Button>
                  )}

                  {availableActions.showDeactivate && (
                    <Button
                      variant="contained"
                      onClick={() => onBulkDeactivateUser?.(selectedRows)}
                      sx={{
                        height: 36,
                        borderRadius: 1,
                        background: '#152E75',
                        color: '#FFF',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Deactivate
                    </Button>
                  )}

                  {availableActions.showReactivate && (
                    <Button
                      variant="contained"
                      onClick={() => onBulkReactivateUser?.(selectedRows)}
                      sx={{
                        height: 36,
                        borderRadius: 1,
                        background: '#152E75',
                        color: '#FFF',
                        textTransform: 'none',
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      Reactivate
                    </Button>
                  )}
                </>
              )}
            </Box>
          </Box>
        ) : (
          // Default toolbar when no rows selected
          <Box
            px={2}
            py={2}
            display="flex"
            alignItems="center"
            justifyContent={title === 'Resources' ? 'space-between' : 'unset'}
            sx={{ borderBottom: '0.667px solid #E5E7EB' }}
          >
            {/* Quick Filter Chips */}

            {title === 'Resources' ? (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: '100%',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontSize: 14,
                      color: '#6B7280',
                      mr: 1,
                    }}
                  >
                    Quick Filter
                  </Typography>
                  {quickFilterOptions.map(option => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      onClick={() => handleQuickFilterChange(option.value)}
                      variant={
                        activeQuickFilter === option.value
                          ? 'filled'
                          : 'outlined'
                      }
                      sx={{
                        height: 32,
                        borderRadius: 0,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: 'pointer',
                        border:
                          activeQuickFilter === option.value
                            ? 'none'
                            : '1px solid #E2E8F0',
                        backgroundColor:
                          activeQuickFilter === option.value
                            ? '#152E75'
                            : '#EEEEEE',
                        color:
                          activeQuickFilter === option.value
                            ? '#FFF'
                            : '#6B7280',
                      }}
                    />
                  ))}
                </Box>
                <StyledInput
                  as={TextField}
                  name="Location"
                  size="small"
                  placeholder="Search by Name /or email"
                  value={search}
                  sx={{ width: 230 }}
                  onChange={(e: any) => setSearch(e.target.value)}
                />
              </Box>
            ) : (
              <StyledInput
                as={TextField}
                name="Location"
                size="small"
                placeholder="Search by Name /or email"
                value={search}
                sx={{ width: 230 }}
                onChange={(e: any) => setSearch(e.target.value)}
              />
            )}

            <Box
              sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    height: 36,
                    width: '1px',
                    backgroundColor: '#E2E8F0',
                    mx: 1.5,
                  }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 1,
                  }}
                >
                  <Badge
                    badgeContent={filterCount > 0 ? filterCount : 0}
                    color="primary"
                    sx={{
                      '& .MuiBadge-badge': {
                        top: '2px',
                        right: '2px',
                        backgroundColor: '#1C2D5F',
                        fontSize: '10px',
                        height: '16px',
                        minWidth: '16px',
                      },
                    }}
                  >
                    <IconButton
                      ref={externalFilterButtonRef}
                      size="small"
                      onClick={event => {
                        setCurrentAnchorEl(event.currentTarget);

                        setTimeout(() => {
                          const filterButton =
                            document.querySelector(
                              'button[data-field="__toolbar__filters__"]'
                            ) ||
                            document.querySelector(
                              '.MuiDataGrid-toolbarContainer button[title="Show filters"]'
                            ) ||
                            document
                              .querySelector(
                                '.MuiDataGrid-toolbarContainer [data-testid="FilterListIcon"]'
                              )
                              ?.closest('button');

                          if (filterButton) {
                            (filterButton as HTMLElement).click();
                          } else {
                            console.error('Filter button not found!');
                          }
                        }, 10);
                      }}
                      sx={{
                        minWidth: 'unset',
                        width: '41px',
                        height: '36px',
                        padding: '20px 10px 20px 10px',
                        justifyContent: 'center',
                        alignItems: 'center',
                        gap: '6px',
                        flexShrink: 0,
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.25)',
                      }}
                    >
                      <img src="/images/icons/NewFilterIcon.svg" alt="filter" />
                    </IconButton>
                  </Badge>
                  <IconButton
                    ref={externalColumnButtonRef}
                    size="small"
                    onClick={event => {
                      setCurrentAnchorEl(event.currentTarget);

                      setTimeout(() => {
                        let columnsButton = document.querySelector(
                          'button[data-field="__toolbar__columns__"]'
                        );

                        if (!columnsButton) {
                          columnsButton = document.querySelector(
                            '.MuiDataGrid-toolbarContainer button[title="Select columns"]'
                          );
                        }

                        if (!columnsButton) {
                          const viewColumnIcon = document.querySelector(
                            '.MuiDataGrid-toolbarContainer [data-testid="ViewColumnIcon"]'
                          );
                          columnsButton =
                            viewColumnIcon?.closest('button') ?? null;
                        }

                        if (!columnsButton) {
                          columnsButton = document.querySelector(
                            '[aria-label="Select columns"]'
                          );
                        }

                        if (!columnsButton) {
                          const toolbarButtons = document.querySelectorAll(
                            '.MuiDataGrid-toolbarContainer button'
                          );

                          if (toolbarButtons.length > 1) {
                            columnsButton = toolbarButtons[1] as HTMLElement;
                          }
                        }

                        if (columnsButton) {
                          (columnsButton as HTMLElement).click();
                        } else {
                          const toolbar = document.querySelector(
                            '.MuiDataGrid-toolbarContainer'
                          );
                        }
                      }, 50);
                    }}
                    sx={{
                      minWidth: 'unset',
                      width: '41px',
                      height: '36px',
                      padding: '20px 17px 20px 17px',
                      justifyContent: 'center',
                      alignItems: 'center',
                      gap: '6px',
                      flexShrink: 0,
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.25)',
                    }}
                  >
                    <img
                      src="/images/icons/newColumnIcon.svg"
                      alt="columns"
                      style={{ width: 20, height: 20 }}
                    />
                    </IconButton>
                    <IconButton
                      onClick={() =>
                        apiRef?.current?.exportDataAsCsv({
                          fileName: `${title}_data`,
                        })
                      }
                      sx={{
                        width: 40,
                        height: 38,
                        borderRadius: '6px',
                        border: '1px solid #E2E8F0',
                        boxShadow: '0px 1px 1px rgba(0,0,0,0.25)',
                      }}
                    >
                      <img
                        src="/images/icons/ExportIcon.svg"
                        alt="export"
                        style={{ width: 40, height: 40 }}
                      />
                    </IconButton>
                </Box>
                {buttonLabel && (
                  <Box
                    sx={{
                      height: 36,
                      width: '1px',
                      backgroundColor: '#E2E8F0',
                      mx: 1.5,
                      display: title === 'Resources' ? 'none' : 'block',
                    }}
                  />
                )}
              </Box>
              {buttonLabel && (
                <Button
                  variant="contained"
                  onClick={e => {
                    if (anchorEl && menuId === 'add-dropdown') {
                      setMenuId(null);
                      setAnchorEl(null);
                      return;
                    }
                    setAnchorEl(e.currentTarget);
                    setMenuId('add-dropdown');
                  }}
                  sx={{
                    height: 40,
                    borderRadius: '6px',
                    background: '#1C2D5F',
                    color: '#FFF',
                    textTransform: 'none',
                    fontSize: 14,
                    fontWeight: 600,
                    px: 1.5,
                    display: title === 'Resources' ? 'none' : 'flex',
                    alignItems: 'center',
                    gap: 1,
                    '&:hover': {
                      background: '#1C2D5F',
                    },
                  }}
                >
                  {buttonLabel}
                  {title === 'Users' && (
                    <KeyboardArrowDownIcon sx={{ fontSize: 20, ml: 0.5 }} />
                  )}
                </Button>
              )}
              {anchorEl && menuId === 'add-dropdown' && title === 'Users' && (
                <Box
                  sx={{
                    position: 'absolute',
                    top:
                      anchorEl.getBoundingClientRect().bottom + window.scrollY,
                    left:
                      anchorEl.getBoundingClientRect().left + window.scrollX,
                    zIndex: 1300,
                    background: '#fff',
                    boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.15)',
                    // borderRadius: '4px',
                    width: 128,
                    py: 0.5,
                    border: '1px solid #E5E7EB',
                  }}
                >
                  <Button
                    sx={{
                      justifyContent: 'flex-start',
                      fontSize: '13px',
                      fontWeight: 400,
                      color: '#333333',
                      width: '100%',
                      px: 1,
                      py: 1,
                      textTransform: 'none',
                      '&:hover': {
                        background: '#142B51B2',
                        color: '#FFFFFF',
                      },
                    }}
                    onClick={() => {
                      setMenuId(null);
                      setAnchorEl(null);
                      setMode?.();
                    }}
                  >
                    From resource list
                  </Button>
                  <Button
                    sx={{
                      justifyContent: 'flex-start',
                      fontSize: '13px',
                      fontWeight: 400,
                      color: '#333333',
                      width: '100%',
                      px: 1,
                      py: 1,
                      textTransform: 'none',
                      '&:hover': {
                        background: '#142B51B2',
                        color: '#FFFFFF',
                      },
                    }}
                    onClick={() => {
                      setMenuId(null);
                      setAnchorEl(null);
                      onAdd();
                    }}
                  >
                    Invite new user
                  </Button>
                </Box>
              )}
            </Box>
          </Box>
        )
      ) : null}

      <Box sx={{ width: '100%', height: 'calc(100vh - 355px)' }}>
        <DataGridPremium
          rows={filteredRows}
          checkboxSelection={checkboxSelection}
          columns={columns}
          getRowId={row => row.id ?? row.Name ?? JSON.stringify(row)}
          disableColumnMenu
          hideFooter
          disableRowSelectionOnClick
          rowSelectionModel={selectionModel}
          onRowSelectionModelChange={handleSelectionChange}
          apiRef={apiRef}
          loading={loading}
          isRowSelectable={isRowSelectable}
          filterModel={filterModel}
          onFilterModelChange={handleFilterModelChange}
          columnVisibilityModel={columnVisibilityModel}
          onColumnVisibilityModelChange={handleColumnVisibilityModelChange}
          initialState={{
            sorting: {
              sortModel: [{ field: 'Name', sort: 'asc' }],
            },
            columns: {
              columnVisibilityModel: {
                __created: false,
                __created_by: false,
                __last_modified: false,
                __last_modified_by: false,
              },
            },
          }}
          slotProps={{
            loadingOverlay: {
              variant: 'skeleton',
              noRowsVariant: 'skeleton',
            },
            panel: {
              className: 'parent-grid-panel',
              placement: 'bottom-end',
              sx: {
                transform: 'translate3d(-50px, 250px, 0px) !important',
                top: '40px !important',
              },
            },
            filterPanel: {
              columnsSort: 'asc',
              filterFormProps: {
                filterColumns,
                columnInputProps: {
                  size: 'small',
                  sx: { mt: 'auto' },
                },
                operatorInputProps: {
                  size: 'small',
                  sx: { mt: 'auto' },
                },
                valueInputProps: {
                  InputComponentProps: { size: 'small' },
                },
                deleteIconProps: {
                  sx: { '& .MuiSvgIcon-root': { color: '#d32f2f' } },
                },
              },
              sx: FilterPanelStyles,
            },
            columnsPanel: {
              className: 'styleColumnMenu',
              sx: ColumnManagementStyles,
            },
          }}
          slots={{
            toolbar: checkboxSelection
              ? toolbarType === 'filter'
                ? AccessToolbar
                : CustomToolbar
              : toolbarType === 'filter'
                ? AccessToolbar
                : undefined,
          }}
          localeText={{
            toolbarFilters: '',
          }}
          sx={{
            border: 'none',
            height: '100%',
            '.MuiDataGrid-columnHeaders': {
              color: '#6B7280',
              fontSize: '12px',
              fontWeight: 600,
              lineHeight: '16px',
              letterSpacing: '0.6px',
              textTransform: 'uppercase',
              fontFamily: 'Open Sans',
              maxHeight: '40px',
            },
            '.MuiDataGrid-columnHeader': {
              maxHeight: '40px',
              px: checkboxSelection ? null : 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#F9FAFB',
            },
            '.MuiDataGrid-columnHeader:last-of-type': {
              borderRight: 'none',
            },
            '.MuiDataGrid-columnSeparator': {
              display: 'block',
            },
            '.MuiDataGrid-cell': {
              borderBottom: '1px solid #f0f0f0',
              fontSize: 13,
            },
          }}
        />
      </Box>
    </Box>
  );
}
