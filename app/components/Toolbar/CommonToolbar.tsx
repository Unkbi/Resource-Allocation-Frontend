import React, { memo, useEffect, useRef, useState } from 'react';
import {
  Box,
  IconButton,
  MenuItem,
  Grow,
  Paper,
  Popper,
  ClickAwayListener,
  MenuList,
  TextField,
  InputAdornment,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useDispatch } from 'react-redux';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { useSelector } from 'react-redux';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { CrudPermissions, withRBAC } from '../HOC/withRBAC';

interface CommonToolbarProps {
  children?: React.ReactNode;
  permissions?: Record<string, CrudPermissions>;
}

const CommonToolbar: React.FC<CommonToolbarProps> = memo(
  ({ children, permissions }) => {
    const dispatch = useDispatch();
    const [openAddMenu, setOpenAddMenu] = useState(false);
    const [allApiSuccess, setAllApiSuccess] = useState(false);
    const anchorRefAdd = useRef<HTMLButtonElement>(null);
    const { resources } = useSelector((state: any) => state.resources);
    const { projects } = useSelector((state: any) => state.projects);
    const { teams } = useSelector((state: any) => state.teams);
    const { portfolios } = useSelector((state: any) => state.portfolios);
    const projectsLoaded = Array.isArray(projects);
    const resourcesLoaded = Array.isArray(resources);
    const teamsLoaded = Array.isArray(teams);
    const portfoliosLoaded = Array.isArray(portfolios);

    const allDataLoaded =
      projectsLoaded && resourcesLoaded && teamsLoaded && portfoliosLoaded;

    useEffect(() => {
      setAllApiSuccess(allDataLoaded);
    }, [projects, resources, teams, portfolios]);

    const handleAddMenuToggle = () => {
      setOpenAddMenu(prev => !prev);
    };

    const handleAddMenuClose = (event: MouseEvent | TouchEvent) => {
      if (anchorRefAdd.current?.contains(event.target as Node)) return;
      setOpenAddMenu(false);
    };

    const handleListKeyDown = (event: React.KeyboardEvent) => {
      if (event.key === 'Tab' || event.key === 'Escape') {
        event.preventDefault();
        setOpenAddMenu(false);
      }
    };

    const handleOpenDialog = (
      title: string,
      formType: string,
      primarySecondButtonText = '',
      initialData: Record<string, unknown> | null = null
    ) => {
      setOpenAddMenu(false);
      dispatch(
        openDialog({
          title,
          submitButtonText: formType === 'add_allocation' ? 'Update' : 'Add',
          cancelButtonText: 'Cancel',
          primarySecondButtonText,
          formType,
          initialData,
        })
      );
    };

    const menuItems = [
      {
        icon: '/images/icons/AllocationIcon.svg',
        alt: 'Allocation Icon',
        title: 'Update Allocation',
        type: 'add_allocation',
        entity: 'Allocation',
      },
      {
        icon: '/images/icons/ProjectIcon.svg',
        alt: 'Project Icon',
        title: 'Add Project',
        type: 'add_project',
        primarySecondButtonText:
          permissions && permissions['Allocation'].c
            ? 'Add & Allocate Resources'
            : '',
        initialData: {
          Status: 'Active',
        },
        entity: 'Project',
      },
      {
        icon: '/images/icons/TeamIcon.svg',
        alt: 'Team Icon',
        title: 'Add Team',
        type: 'add_team',
        entity: 'Team',
      },
      {
        icon: '/images/icons/ResourceIcon.svg',
        alt: 'Resource Icon',
        title: 'Add Resource',
        type: 'add_resource',
        entity: 'Resource',
      },
      {
        icon: '/images/icons/corporate_fare.svg',
        alt: 'Organization Icon',
        title: 'Add Organization',
        type: 'add_organization',
        entity: 'Organization',
      },
    ];

    return (
      <Box
        className="Toolbar"
        sx={{ display: 'flex', flexDirection: 'column' }}
      >
        <Box display="flex" position="relative" zIndex={1}>
          {menuItems.some(m =>
            permissions
              ? m.entity in permissions && permissions[m.entity].c
              : false
          ) && (
            <Box
              sx={{
                width: '64px',
                borderRight: 'rgba(171, 183, 194, 0.5) solid 1px',
                height: '64px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconButton
                className="AddIcon"
                onClick={handleAddMenuToggle}
                ref={anchorRefAdd}
                // Temporary disabled state for testing
                // disabled={!allApiSuccess}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '24px',
                  backgroundColor: '#20232D',
                  marginTop: '3px',
                  padding: '2px',
                  borderRadius: '8px',
                  '&:hover': {
                    backgroundColor: allApiSuccess ? '#20232D' : '#A0A0A0',
                  },
                }}
              >
                {openAddMenu ? (
                  <CloseIcon
                    sx={{
                      color: '#fff',
                      width: '40px',
                      height: '40px',
                      backgroundColor: '#20232D',
                      borderRadius: '8px',
                    }}
                  />
                ) : (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '44px',
                      height: '44px',
                    }}
                  >
                    <img
                      src="/images/icons/AddIconNew.svg"
                      alt=""
                      style={{ width: '44px', height: '44px' }}
                    />
                  </Box>
                )}
              </IconButton>

              <Popper
                open={openAddMenu}
                anchorEl={anchorRefAdd.current}
                role={undefined}
                placement="bottom-start"
                transition
                disablePortal
                modifiers={[{ name: 'offset', options: { offset: [0, 4] } }]}
                sx={{ zIndex: 9999999999 }}
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin:
                        placement === 'bottom-start'
                          ? 'left top'
                          : 'left bottom',
                    }}
                  >
                    <Paper
                      className="AddMenu"
                      sx={{
                        boxShadow: '0px 4px 20px rgba(0,0,0,0.06)',
                      }}
                    >
                      <ClickAwayListener onClickAway={handleAddMenuClose}>
                        <MenuList
                          autoFocusItem={openAddMenu}
                          id="add-menu"
                          onKeyDown={handleListKeyDown}
                          sx={{
                            gap: '8px',
                            m: 1,
                            pt: 2,
                            pb: 1.5,
                          }}
                        >
                          {menuItems
                            .filter(m =>
                              permissions
                                ? m.entity in permissions &&
                                  permissions[m.entity].c
                                : true
                            )
                            .map((item, idx) => (
                              <MenuItem
                                key={idx}
                                onClick={() =>
                                  handleOpenDialog(
                                    item.title,
                                    item.type,
                                    item?.primarySecondButtonText ?? '',
                                    item.initialData
                                  )
                                }
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1.5,
                                  px: 2,
                                  py: 1,
                                }}
                              >
                                <img
                                  src={item.icon}
                                  alt={item.alt}
                                  width={20}
                                  style={{ marginRight: 8 }}
                                />
                                {item.title}
                              </MenuItem>
                            ))}
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>
          )}
          <Box
            sx={{
              flexGrow: 1,
              height: '64px',
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
              borderBottom: '1px solid rgba(206, 220, 233, 0.50)',
            }}
          >
            {children ?? null}
          </Box>

          {/* Sahadev : Search bar temporarily removed as per UX decision */}
          {/* <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
              height: '64px',
              borderLeft: '1px solid #D6DCE1',
              borderBottom: '1px solid rgba(206, 220, 233, 0.50)',
              ml: 'auto',
              p: 2,
            }}
          >
            <Box
              className="searchBar"
              sx={{
                display: 'flex',
                alignItems: 'center',
                width: '165px',
                height: '34px',
                px: 1,
                gap: 1,
                flexShrink: 0,
                borderRadius: '8px',
                backgroundColor: '#fff',
                boxShadow: '0px 2px 1px rgba(0, 0, 0, 0.07)',
              }}
            >
              <TextField
                placeholder="Search..."
                variant="standard"
                fullWidth
                InputProps={{
                  disableUnderline: true,
                  endAdornment: (
                    <InputAdornment position="end">
                      <img
                        src="/images/icons/SearchFilled.svg"
                        alt="search"
                        style={{ width: '16px', height: '16px' }}
                      />
                    </InputAdornment>
                  ),
                  sx: {
                    fontSize: '14px',
                    height: '36px',
                    p: 0,
                  },
                }}
                inputProps={{ style: { fontSize: '14px' } }}
              />
            </Box>
          </Box> */}
        </Box>
      </Box>
    );
  }
);

CommonToolbar.displayName = 'CommonToolbar';
export default withRBAC(CommonToolbar, [
  'Team',
  'Project',
  'Resource',
  'Allocation',
  'Organization',
]);
