'use client';
import { useEffect, useState, useRef } from 'react';
import { Box, List, MenuItem, styled, Typography } from '@mui/material';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import MenuList from '@mui/material/MenuList';
import { performLogout } from '@/app/redux/actions/authActions';
import { Button } from '@mui/material';
import EllipsisNameCell from '../../ResourceAllocation/component/EllipsisNameCell';
import CustomAvatar from '../../Avatar/CustomAvatar';

const MainBox = styled(Box, {
  shouldForwardProp: prop => prop !== 'sidebarExpanded',
})(({ theme, sidebarExpanded }) => ({
  width: sidebarExpanded ? '276px' : '74px',
  position: 'fixed',
  left: '0',
  top: '0',
  zIndex: '1000',
  backgroundColor: theme.palette.sideBarColor.main,
  height: '100vh',
  color: theme.custom.secondryColor,
  paddingTop: '10px',
  textAlign: 'center',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'space-between',
  transition: 'width 0.3s ease',
  '& .menuList': {
    display: 'flex',
    flexDirection: 'column',
    padding: '0',
    alignItems: 'center',
    opacity: '0.6',
    padding: '8px 2px',
    cursor: 'pointer',
    '&.active': {
      opacity: '1',
      backgroundColor: theme.custom.ternaryColor,
      margin: '7px',
      borderRadius: '4px',
    },
    flexDirection: sidebarExpanded ? 'row' : 'column',
    justifyContent: sidebarExpanded ? 'flex-start' : 'center',
    paddingLeft: sidebarExpanded ? '10px' : '0',
  },
  '& .logo': {
    paddingTop: '4px',
  },
  '& .profle-img': {
    width: '40px',
    height: '40px',
    marginLeft: sidebarExpanded ? '4px' : '',
  },
  '& .down-img': {
    padding: '6px',
  },
  '& .items-parent': {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
  },
  '& .menuList img': {
    width: '24px',
    height: '24px',
  },
  '& .profileMenu': {
    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
    marginTop: '12px',
    minWidth: '160px',
    marginLeft: sidebarExpanded ? '0px' : '-7px',
    marginBottom: sidebarExpanded ? '' : '4px',
    '& li': {
      color: ' #95979E',
      backgroundColor: '#0D1F52',
      fontFamily: theme.typography.fontFamily,
      fontsize: '14px',
      fontStyle: ' normal',
      fontweight: '400',
      lineheight: 'normal',
      marginLeft: '0px',
      '& .MuiTouchRipple-root': {
        display: 'none',
      },
      '&.Mui-focusVisible': {
        backgroundColor: '#FFFFFF',
      },
    },
  },
}));

const Sidebar = ({ toggleSidebar, sidebarExpanded }) => {
  const [selectedMenu, setSelectedMenu] = useState('allocation');
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useDispatch();
  const anchorRef = useRef(null);
  const { user } = useSelector(state => state.user);

  const handleToggle = () => {
    setOpen(prevOpen => !prevOpen);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab') {
      event.preventDefault();
      setOpen(false);
    } else if (event.key === 'Escape') {
      setOpen(false);
    }
  }

  const handleClose = event => {
    if (anchorRef.current?.contains(event.target)) {
      return;
    }
    setOpen(false);
  };

  const prevOpen = useRef(open);

  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  const handleLogout = () => {
    dispatch(performLogout());
    router.push('/login');
  };

  const menuItems = [
    {
      icon: '/images/icons/DashboardRounded.svg',
      text: 'Dashboard',
      url: '/dashboard',
      disabled: false,
    },
    {
      icon: '/images/icons/WatchLaterRoundedd.svg',
      text: 'Allocation',
      url: '/allocation',
      disabled: false,
    },
    {
      icon: '/images/icons/FolderFileOpen.svg',
      text: 'Projects',
      url: '/project',
      disabled: false,
    },
    {
      icon: '/images/icons/SupervisedUserCircleRounded.svg',
      text: 'People',
      url: '/people',
      disabled: false,
    },
    // {icon: "/images/icons/PollRounded.svg", url: "/report",text :"Reports", disabled: true },
    {
      icon: '/images/icons/actual_icon.svg',
      url: '/actuals',
      text: 'Actuals',
      disabled: false,
    },
  ];

  const extraMenuItems = [
    {
      icon: '/images/icons/Notifications.svg',
      text: 'Notification',
      url: '/notifications',
      disabled: true,
    },
    {
      icon: '/images/icons/SettingsIcon.svg',
      text: 'Settings',
      url: '/settings',
      disabled: false,
    },
    {
      icon: '/images/icons/Vectorr.svg',
      text: 'User Profile',
      url: '/profile',
      disabled: true,
    },
    {
      icon: '/images/icons/helpIcon.svg',
      text: 'Help Center',
      url: '/help',
      disabled: true,
    },
  ];

  useEffect(() => {
    const currentMenuItem = [...menuItems, ...extraMenuItems].find(
      item => item.url === pathname
    );
    if (currentMenuItem) {
      setSelectedMenu(currentMenuItem.url);
    }
  }, [pathname]);

  const handleMenuClick = (url, disabled) => {
    if (disabled) return;
    setSelectedMenu(url);
    router.push(url);
  };

  // const {FirstName ,LastName} = user | {} ; might need in future
  return (
    <MainBox className="main-parent" sidebarExpanded={sidebarExpanded}>
      <Box
        className="logo"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '1px 17px',
          height: '76px',
        }}
      >
        <Box
          className="logo-parent"
          sx={{
            display: 'flex',
            flexDirection: sidebarExpanded ? 'row' : 'column',
            alignItems: 'center',
            height: '90px',
            width: sidebarExpanded ? '200px' : '',
            justifyContent: 'space-between',
            gap: sidebarExpanded ? '20px' : '0',
            marginRight: sidebarExpanded ? '40px' : '',
          }}
        >
          <Link href={''}>
            <img alt="cio-logo" src="/images/icons/cio-logo.svg" />
          </Link>

          <img
            alt="CIO-Image"
            src="/images/icons/CIOptimize.svg"
            style={{
              display: sidebarExpanded ? 'flex' : 'none',
            }}
          />

          <Button
            onClick={toggleSidebar}
            disableRipple
            sx={{
              display: 'flex',
              alignItems: 'center',
              transition: 'all 0.3s ease-in-out, gap 0.3s ease-in-out',
              transform: `translateY(${sidebarExpanded ? '0' : '4px'})`,
              justifyContent: sidebarExpanded ? 'flex-start' : 'center',
              width: '100%',
              marginBottom: '10px',
              marginLeft: sidebarExpanded ? '3px' : '',
              padding: '0px',
              background: 'transparent',
              boxShadow: 'none',
              minWidth: '0px',
            }}
          >
            <img
              src={'/images/icons/sidebar-left.svg'}
              className="expand-img"
              alt=""
              style={{
                marginRight: sidebarExpanded ? '10px' : '0',
                // transition: 'margin 0.7s ease-in-out',
                padding: '0px',
              }}
            />
          </Button>
        </Box>
        <img src="/images/icons/line1-expand.svg" />
      </Box>

      <Box className="items-parent">
        <Box className="items-parent-wrapper">
          <Box className="menu-items-parent" sx={{ marginTop: '15px' }}>
            <List>
              {menuItems.map((item, index) => (
                <MenuItem
                  className={`menuList ${selectedMenu === item.url ? 'active' : ''}`}
                  key={index}
                  onClick={() => handleMenuClick(item.url, item.disabled)}
                  sx={{
                    opacity: item.disabled ? 0.5 : 1,
                    cursor: item.disabled ? 'not-allowed' : 'pointer',
                    margin: '8px',
                    color: '#95979E',
                  }}
                >
                  <img
                    src={item.icon}
                    alt={item.text}
                    sx={{ width: '16px', height: '16px' }}
                  />
                  {sidebarExpanded && (
                    <Typography sx={{ marginLeft: '10px' }}>
                      {item.text}
                    </Typography>
                  )}
                </MenuItem>
              ))}
            </List>
          </Box>
          {sidebarExpanded && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginBottom: ' 100px',
              }}
            >
              <img src="/images/icons/line2-expand.svg" alt="Divider" />
            </Box>
          )}
        </Box>

        <Box
          className="extra-menuitems-parent"
          sx={{ marginTop: '0px', paddingTop: '20px' }}
        >
          <Box
            sx={{
              paddingTop: '0px',
              marginTop: '0px',
            }}
          ></Box>
          <Box
            sx={{
              marginTop: '15px',
            }}
          >
            <Box className="profile-section">
              <Box
                onClick={handleToggle}
                ref={anchorRef}
                id="composition-button"
                aria-controls={open ? 'composition-menu' : undefined}
                sx={{
                  cursor: 'pointer',
                  marginBottom: '9px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: sidebarExpanded ? '15px' : '0',
                  marginLeft: sidebarExpanded ? '10px' : '17px',
                  width: sidebarExpanded ? '250px' : '',
                  height: sidebarExpanded ? '52px' : '',
                  borderRadius: '8px',
                  '&:hover': {
                    background: '#0D1F52',
                  },
                  '&.active': {
                    background: '#0D1F52',
                  },
                }}
                className={selectedMenu === '/profile' ? 'active' : ''}
              >
                {/* <img src={"/images/icons/profile.svg"} className="profle-img" alt='' /> */}
                <CustomAvatar
                  value={
                    user && user.FirstName && user.LastName
                      ? `${user.FirstName.charAt(0).toUpperCase() + user.FirstName.slice(1).toLowerCase()} ${user.LastName.charAt(0).toUpperCase() + user.LastName.slice(1).toLowerCase()}`
                      : ''
                  }
                  showFullName={false}
                  avatarSx={{
                    width: '40px',
                    height: '40px',
                    fontSize: '16px',
                    fontWeight: 500,
                  }}
                />
                {sidebarExpanded && (
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '30px',
                    }}
                  >
                    {sidebarExpanded && (
                      <>
                        <Box
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            width: '100%',
                            overflow: 'hidden',
                          }}
                        >
                          <Box
                            sx={{
                              display: 'flex',
                              flexDirection: 'column',
                              overflow: 'hidden',
                              width: '160px',
                            }}
                          >
                            <Box
                              sx={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#95979E',
                                padding: '2px 0',
                                textAlign: 'left',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%',
                              }}
                            >
                              <EllipsisNameCell
                                value={
                                  user && user.FirstName && user.LastName
                                    ? `${user.FirstName.charAt(0).toUpperCase() + user.FirstName.slice(1).toLowerCase()} ${user.LastName.charAt(0).toUpperCase() + user.LastName.slice(1).toLowerCase()}`
                                    : ''
                                }
                              />
                            </Box>
                            <Box
                              sx={{
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#95979E',
                                padding: '2px 0',
                                textAlign: 'left',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                width: '100%',
                              }}
                            >
                              <EllipsisNameCell value={user?.Email || ''} />
                            </Box>
                          </Box>

                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <img
                              src={
                                open
                                  ? '/images/icons/iconUp.svg'
                                  : '/images/icons/icon.svg'
                              }
                              className="down-img"
                              alt="Toggle"
                            />
                          </Box>
                        </Box>
                      </>
                    )}
                  </Box>
                )}
              </Box>
              <Popper
                open={open}
                anchorEl={anchorRef.current}
                role={undefined}
                placement={'top-start'}
                transition
                disablePortal
                modifiers={[
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 2],
                    },
                  },
                ]}
              >
                {({ TransitionProps, placement }) => (
                  <Grow
                    {...TransitionProps}
                    style={{
                      transformOrigin: sidebarExpanded
                        ? 'left bottom'
                        : 'left top',
                      marginTop: sidebarExpanded ? '-12px' : '-4px',
                    }}
                  >
                    <Paper
                      className="profileMenu"
                      sx={{
                        display: 'flex',
                        width: sidebarExpanded ? '250px' : '230px',
                        padding: '16px',
                        flexDirection: 'column',
                        marginLeft: '-9px',
                        borderRadius: '8px',
                        boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
                        background: '#0D1F52',
                      }}
                    >
                      <ClickAwayListener onClickAway={handleClose}>
                        <MenuList
                          autoFocusItem={open}
                          id="composition-menu"
                          aria-labelledby="composition-button"
                          onKeyDown={handleListKeyDown}
                        >
                          {extraMenuItems.map((item, index) => (
                            <MenuItem
                              key={index}
                              onClick={() =>
                                handleMenuClick(item.url, item.disabled)
                              }
                              disabled={item.disabled}
                              sx={{
                                cursor: item.disabled
                                  ? 'not-allowed'
                                  : 'pointer',
                                opacity: item.disabled ? 0.5 : 1,
                                background: '#0D1F52',
                                marginBottom: '6px',
                                marginLeft: '0px',
                              }}
                            >
                              <img
                                src={item.icon}
                                alt={item.text}
                                style={{
                                  width: '16px',
                                  height: '16px',
                                  marginRight: '10px',
                                }}
                              />
                              {item.text}
                            </MenuItem>
                          ))}
                          <div></div>
                          {/* Logout Option */}
                          <MenuItem onClick={handleLogout}>
                            <img
                              src="/images/icons/exiticon.svg"
                              alt="Logout"
                              style={{
                                width: '16px',
                                height: '16px',
                                marginRight: '10px',
                                color: ' #95979E',
                                fontFamily: theme =>
                                  theme.typography.fontFamily,
                                fontsize: '14px',
                                fontStyle: ' normal',
                                fontweight: '400',
                                lineheight: 'normal',
                              }}
                            />
                            Logout
                          </MenuItem>
                        </MenuList>
                      </ClickAwayListener>
                    </Paper>
                  </Grow>
                )}
              </Popper>
            </Box>

            <Box
              className="logout"
              sx={{
                display: 'flex',
                justifyContent: sidebarExpanded ? 'start' : 'center',
                alignItems: 'center',
                width: '100%',
              }}
            ></Box>
          </Box>
        </Box>
      </Box>
    </MainBox>
  );
};

export default Sidebar;
