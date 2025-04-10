import React, { useCallback, useState } from 'react';
import {
  Box,
  Button,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  Divider,
  styled,
  Menu,
  Typography,
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { performChangeView } from '@/app/redux/actions/allocationViewAction';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import CustomExport from './CustomExport';
import {
  generateFirstAndLastMonthYear,
  getStartAndEndDateForView,
} from '@/app/utils/common';
import { updateStartAndEndDate } from '@/app/redux/reducers/teamsReducer';
import { updateProjectStartAndEndDate } from '@/app/redux/reducers/projectsReducer';
import { DATE_FORMAT } from '@/app/constants/constants';
import { parseISO } from 'date-fns';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewListIcon from '@mui/icons-material/ViewList';
import TableChartIcon from '@mui/icons-material/TableChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { openDialog } from '@/app/redux/reducers/dialogReducer';

const ToolBox1 = styled(Box)(({ theme }) => ({
  display: 'flex',
  // width: '150px',
  padding: '7px 14px 5px 14px',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderRight: '#DDE1E4 solid 1px',
  '& .viewFilterBlock': {
    backgroundColor: '#FFFFFF',
    border: '1px solid #D6DCE1',
    borderRadius: '4px',
    boxShadow: '0 0 2px 0 rgba(0, 0, 0, 0.02)',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    '& button': {
      padding: '3px 5px',
      borderLeft: '1px solid #D6DCE1',
      height: '100%',
      borderRadius: '0',
      minWidth: '34px',
      '&.selected': {
        backgroundColor: '#344665',
        borderRadius: '4px',
        margin: '-1px',
        position: 'relative',
        zIndex: '1',
        height: '32px',
        color: '#fff',
      },
      '&:first-child': {
        border: 'none',
      },
      '& span': {
        margin: '0',
      },
    },
  },
  '& .projectDropdown': {
    color: '#313F68',
    fontFamily: theme.typography.fontFamily,
    fontWeight: '800',
    fontSize: '14px',
    '& .MuiSelect-select': {
      paddingLeft: '0',
    },
  },
}));

const ToolBox2 = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '7px 14px 5px 14px',
  '& .filterColBlock': {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    '& button': {
      backgroundColor: 'rgba(242, 245, 250, 0.3)',
      border: '1px solid #D6DCE1',
      borderRadius: '4px',
      height: '32px',
      padding: '5px 12px',
      fontSize: '14px',
      color: '#212121',
      fontFamily: theme.typography.fontFamily,
      fontWeight: '600',
      textTransform: 'none',
    },
  },
  '& .dayWeekBlock': {
    backgroundColor: 'rgba(242, 245, 250, 0.3)',
    border: '1px solid #D6DCE1',
    borderRadius: '4px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    '& button': {
      color: '#757575',
      fontFamily: theme.typography.fontFamily,
      fontWeight: '500',
      fontSize: '14px',
      lineHeight: '16px',
      textAlign: 'center',
      textTransform: 'none',
      height: '100%',
      '&.selected': {
        color: '#212121',
        fontWeight: '600',
        backgroundColor: '#fff',
        borderLeft: '1px solid #D6DCE1',
        borderRight: '1px solid #D6DCE1',
        borderRadius: '4px',
      },
    },
  },
  '& .projectIcon': {
    backgroundColor: 'rgba(242, 245, 250, 0.3)',
    border: '1px solid #D6DCE1',
    borderRadius: '4px',
    height: '32px',
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    '& button': {
      color: '#757575',
      fontFamily: theme.typography.fontFamily,
      fontWeight: '500',
      fontSize: '14px',
      lineHeight: '16px',
      textAlign: 'center',
      textTransform: 'none',
      borderLeft: '1px solid #D6DCE1',
      width: '36px',
      minWidth: '36px',
      height: '100%',
      borderRadius: '0',
      '& .MuiSvgIcon-fontSize18': {
        fontSize: '18px',
      },
      '& svg': {
        fontSize: '24px',
      },
      '&.selected': {
        color: '#212121',
        fontWeight: '600',
        backgroundColor: '#fff',
        borderRadius: '0',
      },
    },
  },
  '& .selectedDate': {
    backgroundColor: '#FFFFFF',
    border: '1px solid #D6DCE1',
    borderRadius: '4px',
    height: '32px',
    color: '#212121',
    fontFamily: theme.typography.fontFamily,
    fontWeight: '600',
    fontSize: '12px',
    lineHeight: '14px',
    textAlign: 'center',
    textTransform: 'none',
  },
  '& .nextPrevIcon': {
    backgroundColor: 'rgba(242, 245, 250, 0.3)',
    border: '1px solid #D6DCE1',
    borderRadius: '4px',
    height: '32px',
  },
}));

// const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
//   padding: '10px 12px',
//   color: '#212121',
//   fontFamily: theme.typography.fontFamily,
//   fontWeight: '400',
//   fontSize: '13px',
//   '&:hover': {
//     backgroundColor: 'rgb(52 70 101 / 2%) !important',
//   },
//   '&.Mui-selected': {
//     backgroundColor: 'rgb(52 70 101 / 2%) !important',
//     fontWeight: '600',
//   },
// }));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 140,
  margin: 0,
}));

const StyledFormControlForWeek = styled(FormControl)(({ theme }) => ({
  minWidth: 80,
  margin: 0,
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  backgroundColor: 'rgba(28, 45, 95, 0.02)',
  border: '1px solid #dde1e4',
  borderRadius: '4px',
  height: '32px',
  '& .MuiSelect-select': {
    marginLeft: '12px',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const StyledSelectForWeek = styled(Select)(({ theme }) => ({
  backgroundColor: 'rgba(28, 45, 95, 0.02)',
  border: '1px solid #dde1e4',
  borderRadius: '4px',
  height: '32px',
  fontSize: '14px',
  '& .MuiSelect-select': {
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  '& .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&:hover .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
  '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
    border: 'none',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: '10px 12px',
  color: '#212121',
  fontWeight: 400,
  fontSize: '14px',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&:hover': {
    backgroundColor: 'rgba(52, 70, 101, 0.04)',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgba(52, 70, 101, 0.08)',
    fontWeight: 600,
  },
  '&.Mui-selected:hover': {
    backgroundColor: 'rgba(52, 70, 101, 0.12)',
  },
}));

const MenuItemContent = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
});

const ViewButton = styled(Button)(({ theme }) => ({
  backgroundColor: '#ffffff !important',
  color: '#344665 !important',
  border: 'none !important',
  borderRadius: '4px',
  padding: '6px 12px',
  textTransform: 'none',
  fontWeight: 500,
  fontSize: '14px',
  '&:hover': {
    backgroundColor: '#f9fcff',
  },
  '& .MuiButton-endIcon': {
    marginLeft: 8,
  },
}));

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: '4px',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    width: 220,
  },
}));

const StyledViewMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: '8px 16px',
  fontSize: '14px',
  color: '#344665',
  position: 'relative',
  '&:hover': {
    backgroundColor: '#e9eff8',
    '& .action-buttons': {
      display: 'flex',
    },
  },
  '&.selected': {
    backgroundColor: '#ebeffc',
  },
  '& .icon': {
    marginRight: '12px',
    color: '#7881a5',
    width: '20px',
    height: '20px',
  },
  '& .checkIcon': {
    marginLeft: 'auto',
    color: '#298aff',
  },
  '& .tag': {
    marginLeft: 'auto',
    fontSize: '12px',
    color: '#7881a5',
    backgroundColor: '#f0f2f5',
    padding: '2px 6px',
    borderRadius: '4px',
  },
  '& .action-buttons': {
    display: 'none',
    position: 'absolute',
    right: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    backgroundColor: '#e9eff8',
    borderRadius: '4px',
  },
}));

// View options data
const saveViewOptions = [
  {
    Id: 'chet-new',
    Name: 'Chet New View',
    isDefault: false,
    icon: 'dashboard',
  },
  {
    Id: 'chets',
    Name: 'Chets View',
    isDefault: false,
    icon: 'list',
  },
  {
    Id: 'chets-allocation',
    Name: 'Chets Allocation View',
    isDefault: true,
    icon: 'table',
  },
  {
    Id: '0',
    Name: 'Default View',
    isDefault: true,
    icon: 'list',
  },
];

const ActionIconButton = styled(IconButton)({
  padding: '4px',
  color: '#7881a5',
  '&:hover': {
    backgroundColor: '#d1ddf0',
    color: '#344665',
  },
});

const DefaultViewStartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
  >
    <path
      d="M17.0217 0.978256C16.7174 0.673915 16.219 0.673915 15.9147 0.978256L13.8765 3.01651C12.5472 1.93152 10.8489 1.28178 9 1.28178C4.73774 1.28178 1.28178 4.73774 1.28178 9C1.28178 10.8489 1.93152 12.5472 3.01651 13.8765L0.978256 15.9147C0.673915 16.219 0.673915 16.7174 0.978256 17.0217C1.2826 17.3261 1.78096 17.3261 2.0853 17.0217L4.12355 14.9835C5.45283 16.0685 7.15105 16.7182 9 16.7182C13.2623 16.7182 16.7182 13.2623 16.7182 9C16.7182 7.15105 16.0685 5.45283 14.9835 4.12355L17.0217 2.0853C17.3261 1.78096 17.3261 1.2826 17.0217 0.978256ZM12.7609 4.13204L4.13204 12.7609C3.32779 11.7198 2.84867 10.4176 2.84867 9C2.84867 5.604 5.604 2.84867 9 2.84867C10.4176 2.84867 11.7198 3.32779 12.7609 4.13204ZM9 15.1513C7.58244 15.1513 6.28018 14.6722 5.23908 13.868L13.868 5.23908C14.6722 6.28018 15.1513 7.58244 15.1513 9C15.1513 12.396 12.396 15.1513 9 15.1513Z"
      fill="#344665"
      stroke="#344665"
      strokeWidth="0.5"
    />
  </svg>
);

const ViewOptionStartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="18"
    viewBox="0 0 20 18"
    fill="none"
  >
    <path
      d="M3.19416 12.8736C2.36409 12.3494 2.39242 11.1295 3.24593 10.6443L9.35758 7.17035C9.75593 6.94392 10.2441 6.94392 10.6424 7.17035L16.7541 10.6443C17.6076 11.1295 17.6359 12.3494 16.8058 12.8737L10.6942 16.7336C10.2701 17.0015 9.72986 17.0015 9.30581 16.7336L3.19416 12.8736Z"
      stroke="#344665"
      strokeWidth="1.4"
    />
    <path
      d="M3.19416 7.94396C2.36409 7.41971 2.39242 6.19981 3.24593 5.71465L9.35758 2.24066C9.75593 2.01423 10.2441 2.01423 10.6424 2.24066L16.7541 5.71465C17.6076 6.19981 17.6359 7.41971 16.8058 7.94396L10.6942 11.804C10.2701 12.0718 9.72986 12.0718 9.30581 11.804L3.19416 7.94396Z"
      fill="white"
      stroke="#344665"
      strokeWidth="1.4"
    />
  </svg>
);

const ViewOptionCheckedStartIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="18"
    viewBox="0 0 20 18"
    fill="none"
  >
    <path
      d="M3.19416 12.8736C2.36409 12.3494 2.39242 11.1295 3.24593 10.6443L9.35758 7.17035C9.75593 6.94392 10.2441 6.94392 10.6424 7.17035L16.7541 10.6443C17.6076 11.1295 17.6359 12.3494 16.8058 12.8737L10.6942 16.7336C10.2701 17.0015 9.72986 17.0015 9.30581 16.7336L3.19416 12.8736Z"
      stroke="#344665"
      strokeWidth="1.4"
    />
    <path
      d="M3.19416 7.94396C2.36409 7.41971 2.39242 6.19981 3.24593 5.71465L9.35758 2.24066C9.75593 2.01423 10.2441 2.01423 10.6424 2.24066L16.7541 5.71465C17.6076 6.19981 17.6359 7.41971 16.8058 7.94396L10.6942 11.804C10.2701 12.0718 9.72986 12.0718 9.30581 11.804L3.19416 7.94396Z"
      fill="#C4C8D0"
      stroke="#344665"
      strokeWidth="1.4"
    />
  </svg>
);

const EditActionIcon = () => (
  <img src="/images/icons/pencil_underline.svg" alt="edit" />
);

const DeleteActionIcon = () => (
  <img src="/images/icons/delete.svg" alt="delete" />
);

const PreferencesIcon = () => (
  <img src="/images/icons/preferences.svg" alt="preferences" />
);

const CustomToolbar = React.memo(({ setFilterButtonEl }) => {
  const dispatch = useDispatch();
  const { view, savedViews } = useSelector(state => state.allocationView);
  const { calendarDate: teamsCalendar } = useSelector(state => state.teams);
  const { calendarDate: projectsCalendar } = useSelector(
    state => state.projects
  );
  const { startDate, endDate } = getStartAndEndDateForView(
    view,
    projectsCalendar,
    teamsCalendar
  );

  const [anchorEl, setAnchorEl] = React.useState(null);
  const [selectedView, setSelectedView] = React.useState('0');

  const handleViewClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuItemClick = viewId => {
    setSelectedView(viewId);
    handleClose();
  };

  const viewOptions = [
    {
      name: 'Teams',
      icon: <PeopleIcon sx={{ fontSize: 20, color: '#344665' }} />,
    },
    {
      name: 'Projects',
      icon: <FolderIcon sx={{ fontSize: 20, color: '#344665' }} />,
    },
    // 'Organizations'
  ];
  const [active, setActive] = useState(false);

  const first = generateFirstAndLastMonthYear(
    parseISO(startDate),
    'MMM yy',
    true
  );
  const last = generateFirstAndLastMonthYear(parseISO(endDate), 'MMM yy', true);

  const handleViewChange = useCallback(
    event => {
      dispatch(performChangeView(event.target.value));
    },
    [dispatch]
  );
  const handleClick = () => {
    setActive(prev => !prev);
  };

  const changeCalendarDate = type => {
    const isTeams = view === 'Teams';
    const isNext = type === 'next';

    const action = isTeams
      ? updateStartAndEndDate
      : updateProjectStartAndEndDate;

    const startKey = generateFirstAndLastMonthYear(
      parseISO(startDate),
      DATE_FORMAT,
      false,
      !isNext,
      true
    );
    const endKey = generateFirstAndLastMonthYear(
      parseISO(endDate),
      DATE_FORMAT,
      false,
      !isNext,
      true
    );

    dispatch(action({ startDate: startKey, endDate: endKey }));
  };

  const handleSaveView = () => {
    dispatch(
      openDialog({
        title: 'Save View',
        submitButtonText: 'Save',
        cancelButtonText: 'Cancel',
        formType: 'save_view',
        initialData: null,
      })
    );
  };

  const getIcon = viewId => {
    // Default View icon
    if (viewId === '0') {
      return <DefaultViewStartIcon />;
    }

    // Selected View icon
    if (viewId === selectedView) {
      return <ViewOptionCheckedStartIcon />;
    }

    return <ViewOptionStartIcon />;

    // Other views based on their icon type
    switch (iconType) {
      case 'dashboard':
        return <DashboardIcon className="icon" />;
      case 'table':
        return <TableChartIcon className="icon" />;
      default:
        return <ViewListIcon className="icon" />;
    }
  };

  const open = Boolean(anchorEl);

  const currentViewName =
    savedViews.find(view => view.Id === selectedView)?.Name || 'Default View';

  return (
    <Box
      display={'flex'}
      height={'60px'}
      boxShadow={'0 1px 0 0 #DDE1E4'}
      position={'relative'}
      zIndex={1}
    >
      <ToolBox1>
        <StyledFormControl size="small">
          <StyledSelect
            value={view || 'Teams'}
            onChange={handleViewChange}
            className="projectDropdown"
            IconComponent={KeyboardArrowDown}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
                  marginTop: '4px',
                },
              },
            }}
            renderValue={selected => (
              <MenuItemContent>
                {selected === 'Projects' ? (
                  <FolderIcon sx={{ fontSize: 20, color: '#344665' }} />
                ) : (
                  <PeopleIcon sx={{ fontSize: 20, color: '#344665' }} />
                )}
                {selected}
              </MenuItemContent>
            )}
          >
            {viewOptions.map(option => (
              <StyledMenuItem value={option.name}>
                {option.icon}
                {option.name}
              </StyledMenuItem>
            ))}
          </StyledSelect>
        </StyledFormControl>
      </ToolBox1>
      <ToolBox2 flex={1} className="filterTopRow">
        <Box className="filterColBlock">
          <GridToolbarContainer ref={setFilterButtonEl} sx={{ padding: 0 }}>
            <GridToolbarFilterButton
              slotProps={{
                tooltip: { title: 'Filters' },
                button: {
                  variant: 'outlined',
                  sx: {
                    color: '#555',
                    borderColor: '#ddd',
                    '.MuiButton-startIcon': { marginRight: '0px' },
                    '& .MuiBadge-root span': { top: '-12px', right: '-5px' },
                    '& .MuiBadge-root svg': { display: 'none' },
                  },
                  component: props => (
                    <Button
                      sx={{
                        margin: '0',
                        padding: '0',
                      }}
                      {...props}
                      startIcon={
                        <img src="/images/icons/filter.svg" alt="filter" />
                      }
                    >
                      {props.children}
                    </Button>
                  ),
                },
              }}
            />
            <GridToolbarColumnsButton
              slotProps={{
                tooltip: { title: 'Columns' },
                button: {
                  variant: 'outlined',
                  startIcon: (
                    <img src="/images/icons/columns.svg" alt="columns" />
                  ),
                  endIcon: <KeyboardArrowDown />,
                  sx: {
                    '.MuiButton-endIcon': {
                      marginLeft: '0px',
                    },
                  },
                },
              }}
            />
          </GridToolbarContainer>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton
              onClick={() => changeCalendarDate('prev')}
              size="medium"
              className="nextPrevIcon"
            >
              <img src={'/images/icons/left-arrow.svg'} alt="left-arrow" />
            </IconButton>
            <Button className="selectedDate">{`${first} - ${last}`}</Button>

            <IconButton
              onClick={() => changeCalendarDate('next')}
              size="medium"
              className="nextPrevIcon"
            >
              <img src={'/images/icons/right-arrow.svg'} alt="right-arrow" />
            </IconButton>
          </Box>
          <StyledFormControlForWeek size="small">
            <StyledSelectForWeek
              disabled
              size="small"
              value={'Week'}
              IconComponent={KeyboardArrowDown}
              MenuProps={{
                PaperProps: {
                  sx: {
                    backgroundColor: '#FFFFFF',
                    boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.1)',
                    marginTop: '4px',
                  },
                },
              }}
              renderValue={selected => (
                <MenuItemContent>{selected}</MenuItemContent>
              )}
            >
              <StyledMenuItem value="Week">
                <Typography>Week</Typography>
              </StyledMenuItem>
            </StyledSelectForWeek>
          </StyledFormControlForWeek>
          {/* <Box>
            <ViewButton
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleViewClick}
              aria-controls={open ? 'view-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              {currentViewName}
            </ViewButton>

            <StyledMenu
              id="view-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'view-button',
              }}
            >
              {saveViewOptions.map(option => (
                <StyledViewMenuItem
                  key={option.id}
                  onClick={() => handleMenuItemClick(option.id)}
                  className={selectedView === option.id ? 'selected' : ''}
                >
                  {option.icon}
                  {option.name}
                  {selectedView === option.id && (
                    <CheckIcon className="checkIcon" />
                  )}
                </StyledViewMenuItem>
              ))}
            </StyledMenu>
          </Box> */}
          <Box>
            <ViewButton
              startIcon={<PreferencesIcon />}
              endIcon={<KeyboardArrowDownIcon />}
              onClick={handleViewClick}
              aria-controls={open ? 'view-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              {currentViewName}
            </ViewButton>

            <StyledMenu
              id="view-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'view-button',
              }}
              PaperProps={{
                style: {
                  minWidth: 'auto',
                  width: 'auto',
                  left: 0,
                  right: 'auto',
                  position: 'absolute',
                },
              }}
            >
              {savedViews.map(option => (
                <StyledViewMenuItem
                  key={option.Id}
                  onClick={() => handleMenuItemClick(option.Id)}
                  className={selectedView === option.Id ? 'selected' : ''}
                  sx={
                    option.Id === '0'
                      ? {
                          borderTop: '1px solid #DDE1E4',
                        }
                      : {}
                  }
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 3,
                      minWidth: '180px',
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getIcon(option.Id)}

                      <Box sx={{ flexGrow: 1 }}>{option.Name}</Box>
                    </Box>

                    {option.isDefault && option.Id !== '0' && (
                      <Typography className="tag">default</Typography>
                    )}
                    {option.Id !== '0' && (
                      <Box className="action-buttons">
                        <ActionIconButton size="small">
                          {/* <EditIcon fontSize="small" /> */}
                          <EditActionIcon />
                        </ActionIconButton>
                        <ActionIconButton size="small">
                          {/* <DeleteIcon fontSize="small" /> */}
                          <DeleteActionIcon />
                        </ActionIconButton>
                      </Box>
                    )}
                  </Box>
                </StyledViewMenuItem>
              ))}
            </StyledMenu>
          </Box>
          <Button
            startIcon={<AddIcon />}
            // disabled={true}
            onClick={handleSaveView}
            sx={{
              border: 'none !important',
              color: '#344665 !important',
              backgroundColor: '#ffffff !important',
              '&.Mui-disabled': {
                color: '#9F9F9F !important', // Change disabled text color
              },
            }}
          >
            Save View
          </Button>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CustomExport />
          {/* <Box className="projectIcon">
            {view === 'Projects' ? (
              <>
                <TooltipButton
                  msg="My Project"
                  placement="bottom"
                  onClick={handleClick}
                >
                  <MyProjectIcon color={active ? '#344665' : '#99A2B2'} />
                </TooltipButton>
                <TooltipButton
                  msg="All Projects"
                  placement="bottom"
                  onClick={handleClick}
                >
                  <AllProjectIcon color={!active ? '#344665' : '#99A2B2'} />
                </TooltipButton>
              </>
            ) : view === 'Teams' ? (
              <>
                <TooltipButton
                  msg="My Teams"
                  placement="bottom"
                  onClick={handleClick}
                >
                  <MyTeamsIcon
                    color={active ? '#344665' : '#99A2B2'}
                    fontSize={'18'}
                  />
                </TooltipButton>
                <TooltipButton
                  msg="All Teams"
                  placement="bottom"
                  onClick={handleClick}
                >
                  <AllTeamsIcon color={!active ? '#344665' : '#99A2B2'} />
                </TooltipButton>
              </>
            ) : (
              <>
                <TooltipButton
                  msg="My Teams"
                  placement="bottom"
                  onClick={handleClick}
                >
                  <MyTeamsIcon color={active ? '#344665' : '#99A2B2'} />
                </TooltipButton>
                <TooltipButton
                  msg="All Teams"
                  placement="bottom"
                  onClick={handleClick}
                >
                  <AllTeamsIcon color={active ? '#344665' : '#99A2B2'} />
                </TooltipButton>
              </>
            )}
          </Box> */}
          {/* <Divider orientation="vertical" flexItem /> */}
          {/* <Box className="dayWeekBlock">
            <Button>Day</Button>
            <Button className="selected">Week</Button>
            <Button>Month</Button>
          </Box> */}
          {/* <Divider orientation="vertical" flexItem /> */}
        </Box>
      </ToolBox2>
    </Box>
  );
});

CustomToolbar.displayName = 'CustomToolbar';

export default CustomToolbar;
