import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
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
  Popover,
  TextField,
  Stack,
  Switch,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  Popper,
  Grow,
  ClickAwayListener,
  MenuList,
  Paper,
  Tooltip,
  Skeleton,
} from '@mui/material';
import { ChevronRight, KeyboardArrowDown } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteUsersSavedViewAction,
  performChangeView,
} from '@/app/redux/actions/allocationViewAction';
import {
  gridExpandedSortedRowIdsSelector,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import CustomExport from './CustomExport';
import {
  calculateWeekRanges,
  generateDateWeekMath,
  generateFirstAndLastMonthYear,
  getOnlyFilterSettings,
  getProjectsIamProjectManager,
  getStartAndEndDateForView,
  getTeamsIamAllocationManager,
  getTotalWeeks,
  isObjectEqual,
} from '@/app/utils/common';
import { updateStartAndEndDate } from '@/app/redux/reducers/teamsReducer';
import { updateProjectStartAndEndDate } from '@/app/redux/reducers/projectsReducer';
import {
  DATE_FORMAT,
  DEFAULT_PROJECT_WEEK_MINUS,
  DEFAULT_PROJECT_WEEK_PLUS,
  PORTFOLIO_DISPLAY_NAME,
  TOTAL_FUTURE_WEEKS_ARROW,
} from '@/app/constants/constants';
import { parseISO } from 'date-fns';
import FolderIcon from '@mui/icons-material/Folder';
import PeopleIcon from '@mui/icons-material/People';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckIcon from '@mui/icons-material/Check';
import DashboardIcon from '@mui/icons-material/Dashboard';
import ViewListIcon from '@mui/icons-material/ViewList';
import TableChartIcon from '@mui/icons-material/TableChart';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import TooltipButton from '../Button/TooltipButton';
import MyProjectIcon from '../TableIcons/MyProjectIcon';
import AllProjectIcon from '../TableIcons/AllProjectIcon';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import {
  setCurrentView,
  setExpandRowId,
  setScrollPosition,
  setShowActuals,
  updateCurrentView,
} from '@/app/redux/reducers/allocationViewReducer';
import { set } from 'date-fns';
import ConfirmDialog from '../Dialog/ConfirmDialog';
import { compressToEncodedURIComponent } from 'lz-string';
import CustomInput from '../Input/Input';
import { showToastAction } from '@/app/redux/actions/toastAction';
import { StyledInput } from '../Input/StyledInput';
import CopyLinkInput from '../Input/InputWithButton';
import ShareLinkDialog from '../Dialog/ShareLinkDialog';
import CustomDateRangePicker from '../DatePicker/CustomDateRangePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import {
  DateRangePicker,
  StaticDateRangePicker,
} from '@mui/x-date-pickers-pro';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import EllipsisNameCell from '../ResourceAllocation/component/EllipsisNameCell';
import CloseIcon from '@mui/icons-material/Close';
import { ChevronLeftIcon, ChevronRightIcon, SearchIcon } from 'lucide-react';
import MyTeamsIcon from '../TableIcons/MyNewTeamsIcon';
import MyAllTeamsIcon from '../TableIcons/MyAllTeamsIcon';
import { getLoginUserDetails } from '@/app/utils/authUtils';
import { withRBAC } from '../HOC/withRBAC';
import { useDataGrid } from '@/app/context/dataGridContext';

const ToolBox1 = styled(Box)(({ theme }) => ({
  display: 'flex',
  height: '64px',
  justifyContent: 'space-between',
  alignItems: 'center',
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
    color: '#5D6979',
    fontFamily: theme.typography.fontFamily,
    fontWeight: '700',
    fontSize: '14px',
    borderRadius: '10px',
    height: '40px',
    marginTop: '11px',
    width: 'auto',
    '& .MuiSelect-select': {
      paddingLeft: '0',
    },
  },
}));

const ToolBox2 = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingLeft: '10px',
  '& .searchBar': {
    backgroundColor: '#FFFFFF',
    border: '1px solid #D6DCE1',
    borderRadius: '4px',
    width: '161px',
    height: '33px',
    transition: 'width 0.3s ease-in-out',
    '& input': {
      padding: '2px 10px',
      fontSize: '12px',
      color: '#757575',
      height: '30px',
      boxSizing: 'border-box',
      color: '#212121',
    },
    '& .MuiInputBase-adornedStart': {
      display: 'flex',
      flexDirection: 'row-reverse',
    },
    '& svg': {
      width: '20px',
      marginRight: '5px',
    },
  },
  '& .filterColBlock': {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  '& .filterTopRow': {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: '80px',
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
    display: 'flex',
    width: '90px',
    height: '40px',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    borderRadius: '8px',
    border: '1px solid #CBD0DB',
    background: '#FFF',
    flexShrink: 0,
    '& button': {
      color: '#757575',
      fontFamily: theme.typography.fontFamily,
      fontWeight: '500',
      fontSize: '14px',
      lineHeight: '16px',
      textAlign: 'center',
      textTransform: 'none',
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
    marginLeft: '12px',
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 140,
  margin: 0,
}));

const StyledFormControlForWeek = styled(FormControl)(({ theme }) => ({
  minWidth: 80,
  margin: 0,
}));

const StyledSelect = styled(Select)(({ theme }) => ({
  display: 'flex',
  width: ' 128px',
  height: '44px',
  marginLeft: '6px',
  justifyContent: 'center',
  alignitems: 'center',
  gap: '6px',
  flexShrink: 0,
  borderradius: '8px',
  border: '1px solid #CBD0DB',
  background: '#FFF',
  '& .MuiSelect-select': {
    marginLeft: '12px',
    padding: '6px 12px',
    display: 'flex',
    alignItems: 'center',
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
  borderRadius: '8px',
  display: 'flex',
  width: '168px',
  height: '40px',
  marginLeft: '6px',
  justifyContent: 'center',
  alignitems: 'center',
  gap: '6px',
  flexShrink: 0,
  borderradius: '8px',
  border: '1px solid #CBD0DB',
  background: '#FFF',
  textTransform: 'none',
  color: '#5D6979',
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

const StyledShareButton = styled(Button)(({ theme }) => ({
  color: '#344665 !important',
  padding: '6px 12px',
  textTransform: 'none',
  height: '32px',
  fontWeight: 500,
  borderRadius: 'var(--borderRadius, 4px)',
  border: '1px solid rgba(28, 45, 95, 0.10)',
  background: 'rgba(28, 45, 95, 0.02)',
  fontSize: '14px',
  '&:hover': {
    backgroundColor: '#f9fcff',
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
  <img
    src="/images/icons/newPreferences.svg"
    style={{ width: '20px', height: '20px' }}
    alt="preferences"
  />
);

const ShareIcon = () => (
  <img src="/images/icons/ShareRounded.svg" alt="share" />
);

const HistoryIcon = () => (
  <img src="/images/icons/HistoryButton.svg" alt="history" />
);

const TeamsCostIcon = () => (
  <img src="images/icons/teamsCostIcon.svg" alt="teams cost" />
);

const OrganisationIcon = () => (
  <img src="images/icons/organisationView.svg" alt="organisation" />
);

const PortfolioIcon = () => (
  <img src="/images/icons/portfolio.svg" alt="portfolio" />
);

const FlatIcon = () => <img src="/images/icons/FlatView.svg" alt="flat view" />;

const CustomToolbar = memo(({ setFilterButtonEl }) => {
  const dispatch = useDispatch();
  const [value, setValue] = React.useState([null, null]);
  const { view, savedViews, currentView, showActuals } = useSelector(
    state => state.allocationView
  );
  const { calendarDate: teamsCalendar } = useSelector(state => state.teams);
  const { projects, calendarDate: projectsCalendar } = useSelector(
    state => state.projects
  );
  const { user } = useSelector(state => state.user);
  const { email = '' } = getLoginUserDetails(user) || {};

  const { resources } = useSelector(state => state.resources);
  const { teams } = useSelector(state => state.teams);
  const { loginUserPrivileges: permissions, loadingLoginUserPrivileges } =
    useSelector(state => state.rbac);
  const { startDate, endDate } = getStartAndEndDateForView(
    view,
    projectsCalendar,
    teamsCalendar
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [shareDialogOpen, setShareDialogOpen] = useState(false);
  const [shareLink, setShareLink] = useState('');
  const [deleteView, setDeleteView] = useState(null);
  const [isRangePickerOpen, setIsRangePickerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const [popOverAnchorEl, setPopOverAnchorEl] = useState(null);
  const [selectedView, setSelectedView] = useState('0');
  const myTeamsButtonRef = useRef(null);
  const myProjectsButtonRef = useRef(null);
  const [openAddMenu, setOpenAddMenu] = React.useState(false);
  const anchorRefAdd = React.useRef(null);
  const anchorRef = React.useRef(null);
  const [allApiSuccess, setAllApiSuccess] = useState(false);
  const { portfolios } = useSelector(state => state.portfolios);
  const { scalarSettings } = useSelector(state => state.allSettings);
  const { getApiRef } = useDataGrid();

  const projectsLoaded = Array.isArray(projects);
  const resourcesLoaded = Array.isArray(resources);
  const teamsLoaded = Array.isArray(teams);
  const portfoliosLoaded = Array.isArray(portfolios);

  const allDataLoaded =
    projectsLoaded && resourcesLoaded && teamsLoaded && portfoliosLoaded;

  useEffect(() => {
    setAllApiSuccess(allDataLoaded);
  }, [projects, resources, teams, portfolios]);

  const handleViewClick = event => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handlePopoverClose = () => {
    setPopOverAnchorEl(null);
  };

  const handleMenuItemClick = viewId => {
    setSelectedView(viewId);
    // Set Current View
    const newView = savedViews?.find(view => view.Id === viewId);
    if (newView) {
      dispatch(setCurrentView(newView));
    }
    handleClose();
  };

  const viewOptions = [
    {
      name: 'Teams',
      icon: <PeopleIcon sx={{ fontSize: 20, color: '#5D6979' }} />,
    },
    {
      name: 'Organisations',
      icon: <OrganisationIcon sx={{ fontSize: 20, color: '#5D6979' }} />,
    },
    {
      name: 'Resources',
      icon: <PeopleIcon sx={{ fontSize: 20, color: '#5D6979' }} />,
    },
    {
      name: 'Flat',
      icon: <FlatIcon sx={{ fontSize: 20, color: '#5D6979' }} />,
    },
    {
      name: 'Project',
      icon: <FolderIcon sx={{ fontSize: 20, color: '#5D6979' }} />,
    },
    {
      name: 'Portfolio',
      icon: <PortfolioIcon sx={{ fontSize: 20, color: '#344665' }} />,
    },
    //Commenting two dropdown views , Project and Teams Cost
    // {
    //   name: 'Project Cost',
    //   icon: <MonetizationOnIcon sx={{ fontSize: 20, color: '#5D6979' }} />,
    // },
    // {
    //   name: 'Teams Cost',
    //   icon: <TeamsCostIcon sx={{ fontSize: 20, color: '#344665' }} />,
    // },
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

  const changeCalendarDate = (type, StartDate = '', EndDate = '') => {
    // const isTeams = view === 'Teams';
    const currentGroupBy = currentView?.GroupBy;
    const currentRef = getRefForGroup(currentGroupBy);
    if (currentRef) {
      const scrollPosition = currentRef.getScrollPosition();
      dispatch(setScrollPosition(scrollPosition));

      const expandedParentIds = getExpandedParentIds(currentGroupBy);
      dispatch(setExpandRowId(expandedParentIds));
    }
    const isNext = type === 'next';
    // const action = isTeams
    //   ? updateStartAndEndDate
    //   : updateProjectStartAndEndDate;

    // Handle the saveView changes

    if (type === 'isFixedRange') {
      const currentDate = new Date();
      const { weekMinus, weekPlus } = calculateWeekRanges(
        StartDate,
        EndDate,
        currentDate
      );
      dispatch(
        updateCurrentView({
          isDynamicRange: false,
          isFixedRange: true,
          StartDate: StartDate,
          EndDate: EndDate,
          WeekPlus: weekPlus,
          WeekMinus: weekMinus,
        })
      );
    } else {
      const totalWeeks = getTotalWeeks(
        currentView?.StartDate,
        currentView?.EndDate
      );

      const toShift = currentView.isFixedRange
        ? totalWeeks >= TOTAL_FUTURE_WEEKS_ARROW
          ? TOTAL_FUTURE_WEEKS_ARROW
          : totalWeeks
        : TOTAL_FUTURE_WEEKS_ARROW;

      const toNextWeekPlus =
        currentView.WeekPlus != null
          ? currentView.WeekPlus + toShift
          : DEFAULT_PROJECT_WEEK_PLUS + 4;

      const toNextWeekMinus =
        currentView.WeekMinus != null
          ? currentView.WeekMinus - toShift
          : DEFAULT_PROJECT_WEEK_MINUS - TOTAL_FUTURE_WEEKS_ARROW;

      const toPrevWeekPlus =
        currentView.WeekPlus != null
          ? currentView.WeekPlus - toShift
          : DEFAULT_PROJECT_WEEK_MINUS - 4;

      const toPrevWeekMinus =
        currentView.WeekMinus != null
          ? currentView.WeekMinus + toShift
          : DEFAULT_PROJECT_WEEK_PLUS + TOTAL_FUTURE_WEEKS_ARROW;

      dispatch(
        updateCurrentView({
          ...(!currentView.isFixedRange && { isDynamicRange: true }),
          ...(isNext
            ? {
                StartDate: generateDateWeekMath('WEEK_MINUS', toNextWeekMinus),
                EndDate: generateDateWeekMath('WEEK_PLUS', toNextWeekPlus),
                WeekPlus: toNextWeekPlus,
                WeekMinus: toNextWeekMinus,
              }
            : {
                StartDate: generateDateWeekMath('WEEK_MINUS', toPrevWeekMinus),
                EndDate: generateDateWeekMath('WEEK_PLUS', toPrevWeekPlus),
                WeekMinus: toPrevWeekMinus,
                WeekPlus: toPrevWeekPlus,
              }),
        })
      );
    }

    // dispatch(action({ startDate: startKey, endDate: endKey }));
  };

  const handleSaveView = () => {
    if (selectedView === '0') {
      // Default View is selected, open New View dialog
      dispatch(
        openDialog({
          title: 'Save View',
          submitButtonText: 'Next',
          cancelButtonText: 'Cancel',
          formType: 'new_view',
          initialData: null,
        })
      );
    } else {
      dispatch(
        openDialog({
          title: currentView?.Name
            ? `Save View: ${currentView?.Name}`
            : 'Save View',
          submitButtonText:
            permissions && permissions['UserAllocationView']?.u
              ? 'Save'
              : permissions && permissions['UserAllocationView']?.c
                ? 'Next'
                : '',
          secondaryButtonText:
            permissions &&
            permissions['UserAllocationView']?.c &&
            permissions &&
            permissions['UserAllocationView']?.u
              ? 'Save As'
              : '',
          cancelButtonText: 'Cancel',
          formType:
            permissions &&
            permissions['UserAllocationView']?.c &&
            permissions &&
            permissions['UserAllocationView']?.u
              ? 'save_view'
              : 'new_view',
          initialData: null,
        })
      );
    }
  };

  const handleEditView = (e, savedViewData) => {
    e.stopPropagation();
    dispatch(
      openDialog({
        title: 'Edit View',
        submitButtonText: 'Apply',
        cancelButtonText: 'Cancel',
        formType: 'name_view',
        initialData: {
          id: savedViewData?.Id,
          name: savedViewData?.Name || '',
          description: savedViewData?.Description || '',
          isDefault: savedViewData?.isDefault || false,
        },
      })
    );
  };

  const handleDeleteView = (e, view) => {
    e.stopPropagation();
    setDeleteView(view);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    setDeleteDialogOpen(false);
    if (deleteView?.Id) {
      dispatch(deleteUsersSavedViewAction(deleteView.Id));
    }
  };

  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
  };

  const handleCancelShare = () => {
    setShareDialogOpen(false);
  };

  const handleShareDeepLink = () => {
    const settingsStr = compressToEncodedURIComponent(
      JSON.stringify(getOnlyFilterSettings(currentView))
    );

    const link = `${window.location.origin}/allocation?settings=${settingsStr}`;
    setShareLink(link);
    setShareDialogOpen(true);
  };

  const copyLinkToClipboard = () => {
    navigator.clipboard
      .writeText(shareLink)
      .then(() => {
        dispatch(showToastAction(true, 'Link copied to clipboard!', 'success'));
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
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
  };

  const handleToggle = isMine => {
    if (isMine && email) {
      const teamsIAmAllocationManager = getTeamsIamAllocationManager(
        email,
        resources || [],
        teams || []
      );

      if (
        (view.includes('Teams') ||
          view.includes('Organisations') ||
          view.includes('Resources') ||
          view.includes('Flat')) &&
        teamsIAmAllocationManager.length === 0
      ) {
        setPopOverAnchorEl(myTeamsButtonRef.current);
        setTimeout(() => setPopOverAnchorEl(null), 2000);
        return;
      }

      // Check if the user is a project manager in any of the projects
      const currentResource = resources?.find(r => r.Email === email);
      const projectsIAmProjectManager = getProjectsIamProjectManager(
        currentResource?.Id,
        projects || []
      );

      if (
        (view.includes('Project') || view.includes('Portfolio')) &&
        projectsIAmProjectManager.length === 0
      ) {
        setPopOverAnchorEl(myProjectsButtonRef.current);
        setTimeout(() => setPopOverAnchorEl(null), 2000);
        return;
      }
    }

    if (
      view.includes('Teams') ||
      view.includes('Organisations') ||
      view.includes('Resources')
    ) {
      dispatch(updateCurrentView({ MyTeam: isMine }));
    } else if (view.includes('Project') || view.includes('Portfolio')) {
      dispatch(updateCurrentView({ MyProjects: isMine }));
    }
  };
  const { allResourcesDetail } = useSelector(state => state.allResourcesDetail);

  const viewRefMap = {
    Teams: 'teamAllocation',
    'Teams Cost': 'main',
    Organisations: 'teamAllocation',
    Resources: 'teamAllocation',
    Project: 'projectAllocation',
    'Project Cost': 'main',
    Portfolio: 'projectAllocation',
  };

  const getRefForGroup = groupName => {
    const refKey = viewRefMap[groupName];
    if (!refKey) {
      return null;
    }
    return getApiRef(refKey);
  };

  const setScrollPositionOfAssociatedView = (currentGroupBy, newGroupBy) => {
    const currentRef = getRefForGroup(currentGroupBy);
    const scrollPosition = currentRef.getScrollPosition();
    dispatch(setScrollPosition(scrollPosition));
  };

  const getAutoGeneratedPrefix = groupName => {
    if (groupName.includes('Team')) return 'auto-generated-row-teams/';
    if (groupName.includes('Organisation')) return 'auto-generated-row-teams/';
    if (groupName.includes('Resources')) return 'auto-generated-row-teams/';
    if (groupName.includes('Project')) return 'auto-generated-row-project/';
    if (groupName.includes('Portfolio')) return 'auto-generated-row-project/';
    return '';
  };

  const filteredRows = (rows, groupName, prefix) => {
    let regex = '';
    if (
      groupName.includes('Team') ||
      groupName.includes('Organisation') ||
      groupName.includes('Resources')
    ) {
      regex = /^auto-generated-row-teams\/.+-resource\//;
      return rows.filter(id => !id.startsWith(prefix) || regex.test(id));
    } else if (
      groupName.includes('Project') ||
      groupName.includes('Portfolio')
    ) {
      return rows.filter(id => !id.startsWith(prefix));
    }
    return rows;
  };

  const getExpandedParentIds = groupName => {
    const ref = getRefForGroup(groupName);
    if (!ref) return [];

    const prefix = getAutoGeneratedPrefix(groupName);
    let expanded = gridExpandedSortedRowIdsSelector({ current: ref });
    const filtered = filteredRows(expanded, groupName, prefix);
    const expandedNodes = filtered.map(id => ref.getRowNode(id));

    const parentNodes = expandedNodes
      .map(node => (node?.parent ? ref.getRowNode(node.parent) : null))
      .filter(Boolean);

    const uniqueParentIds = [...new Set(parentNodes.map(p => p.id))];

    return uniqueParentIds;
  };

  const handleAllocationCostSwitch = () => {
    const currentGroupBy = currentView?.GroupBy;
    const isCost = currentView?.GroupBy.includes('Cost');
    const newGroupBy = isCost
      ? currentView?.GroupBy.replace(' Cost', '')
      : `${currentView?.GroupBy} Cost`;
    setScrollPositionOfAssociatedView(currentGroupBy, newGroupBy);
    dispatch(performChangeView(newGroupBy));

    const expandedParentIds = getExpandedParentIds(currentGroupBy);
    dispatch(setExpandRowId(expandedParentIds));
  };

  const open = Boolean(anchorEl);
  const openPopover = Boolean(popOverAnchorEl);

  const currentViewName =
    savedViews.find(view => view.Id === selectedView)?.Name || 'Default View';

  const handleDateField = (StartDate, EndDate) => {
    const currentGroupBy = currentView?.GroupBy;
    const currentRef = getRefForGroup(currentGroupBy);
    if (currentRef) {
      const scrollPosition = currentRef.getScrollPosition();
      dispatch(setScrollPosition(scrollPosition));
      const expandedParentIds = getExpandedParentIds(currentGroupBy);
      dispatch(setExpandRowId(expandedParentIds));
    }

    const weeks = getTotalWeeks(StartDate, EndDate);
    if (weeks > 51) {
      dispatch(
        showToastAction(true, 'Date range limited to 51 weeks', 'warning')
      );
      const adjustedEndDate = generateDateWeekMath(
        'WEEK_PLUS',
        51,
        new Date(StartDate)
      );
      changeCalendarDate('isFixedRange', StartDate, adjustedEndDate);

      const isTeams = view === 'Teams';
      const action = isTeams
        ? updateStartAndEndDate
        : updateProjectStartAndEndDate;
      dispatch(
        action({
          startDate: StartDate,
          endDate: adjustedEndDate,
        })
      );
      return;
    }
    changeCalendarDate('isFixedRange', StartDate, EndDate);
    const isTeams = view === 'Teams';
    const action = isTeams
      ? updateStartAndEndDate
      : updateProjectStartAndEndDate;
    if (
      currentView?.isFixedRange &&
      currentView?.StartDate &&
      currentView?.EndDate
    ) {
      dispatch(
        action({
          startDate: StartDate,
          endDate: EndDate,
        })
      );
    }
  };

  useEffect(() => {
    if (currentView?.Name) {
      setSelectedView(currentView?.Id);
    }
  }, [currentView?.Name]);

  const handleAddMenuToggle = () => {
    setOpenAddMenu(prevOpen => !prevOpen);
  };

  const handleAddMenuClose = event => {
    if (
      anchorRef.current?.contains(event.target) ||
      anchorRefAdd.current?.contains(event.target)
    ) {
      return;
    }
    setOpenAddMenu(false);
  };

  function handleListKeyDown(event) {
    if (event.key === 'Tab' || event.key === 'Escape') {
      event.preventDefault();
      setOpenAddMenu(false);
    }
  }

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
      primarySecondButtonText: 'Add & Allocate Resources',
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

  const handleOpenDialog = (
    title,
    formType,
    primarySecondButtonText,
    initialData = null
  ) => {
    setOpenAddMenu(false);
    dispatch(
      openDialog({
        title: title,
        submitButtonText: formType === 'add_allocation' ? 'Update' : 'Add',
        cancelButtonText: 'Cancel',
        primarySecondButtonText: primarySecondButtonText ?? '',
        formType: formType,
        initialData: initialData,
      })
    );
  };

  const handleShowActualsToggle = () => {
    dispatch(setShowActuals(!showActuals));
  };

  return (
    <Box className="Toolbar" sx={{ display: 'flex', flexDirection: 'column' }}>
      {/*Top Toolbar*/}
      <Box display="flex" position="relative" zIndex={1}>
        {/* Left Section (Add + View Selector + Toggle Buttons + Date Picker + Views) */}
        <ToolBox1 sx={{ display: 'flex' }}>
          {/* Add Button */}
          {menuItems.some(m =>
            permissions
              ? m.entity in permissions && permissions[m.entity]?.c
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
                disabled={!allApiSuccess}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '30px',
                  height: '24px',
                  backgroundColor: '#20232D',
                  marginTop: '3px',
                  padding: '2px',
                  borderRadius: '8px',
                  '&:hover, &:focus': { backgroundColor: '#20232D' },
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
                modifiers={[
                  {
                    name: 'offset',
                    options: {
                      offset: [0, 4],
                    },
                  },
                ]}
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
                        boxShadow: '0px 4px 20px 0px rgba(0, 0, 0, 0.06)',
                      }}
                    >
                      <ClickAwayListener onClickAway={handleAddMenuClose}>
                        <MenuList
                          autoFocusItem={openAddMenu}
                          id="Add-menu"
                          aria-labelledby="Add-button"
                          onKeyDown={handleListKeyDown}
                          sx={{
                            gap: '8px',
                            margin: ' 5px',
                            paddingTop: '18px',
                            paddingBottom: '12px',
                          }}
                        >
                          {menuItems
                            .filter(m =>
                              permissions
                                ? m.entity in permissions &&
                                  permissions[m.entity]?.c
                                : true
                            )
                            .map((item, index) => (
                              <MenuItem
                                key={index}
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
                                  paddingLeft: 2,
                                  paddingBottom: 2,
                                  gap: 1,
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

          {/* View Grouping Dropdown */}
          <Box
            sx={{
              width: 'auto',
              height: '64px',
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
              borderBottom: ' rgba(206, 220, 233, 0.50) 1px solid',
            }}
          >
            <StyledFormControl size="small">
              <StyledSelect
                value={
                  currentView?.GroupBy === 'Project'
                    ? 'Projects'
                    : currentView?.GroupBy === 'Portfolio'
                      ? `${scalarSettings?.Portfolio_Name || PORTFOLIO_DISPLAY_NAME}s`
                      : currentView?.GroupBy === 'Project Cost'
                        ? 'Projects'
                        : currentView?.GroupBy === 'Teams Cost'
                          ? 'Teams'
                          : currentView?.GroupBy === 'Organisations'
                            ? 'Organizations'
                            : currentView?.GroupBy || 'Teams'
                }
                onChange={handleViewChange}
                className="projectDropdown"
                IconComponent={KeyboardArrowDown}
                MenuProps={{
                  PaperProps: {
                    sx: {
                      backgroundColor: '#FFFFFF',
                      ml: '2px',
                    },
                  },
                }}
                renderValue={selected => (
                  <MenuItemContent>
                    {viewOptions.find(
                      option => option.name === currentView?.GroupBy
                    )?.icon ||
                      (currentView?.GroupBy === 'Teams Cost' ? (
                        <PeopleIcon sx={{ fontSize: 20, color: '#5D6979' }} />
                      ) : (
                        <FolderIcon sx={{ fontSize: 20, color: '#5D6979' }} />
                      ))}
                    <Typography
                      sx={{
                        color: '#5D6979',
                        fontFamily: 'Open Sans',
                        fontSize: '14px',
                        fontStyle: 'normal',
                        fontWeight: 700,
                        lineHeight: '21.98px',
                      }}
                    >
                      {selected}
                    </Typography>
                  </MenuItemContent>
                )}
              >
                {viewOptions.map(option => (
                  <StyledMenuItem key={option.name} value={option.name}>
                    {option.icon}
                    {option.name === 'Project'
                      ? 'Projects'
                      : option.name === 'Project Cost'
                        ? 'Projects Cost'
                        : option.name === 'Organisations'
                          ? 'Organizations'
                          : option.name === 'Portfolio'
                            ? `${scalarSettings?.Portfolio_Name || PORTFOLIO_DISPLAY_NAME}s`
                            : option.name}
                  </StyledMenuItem>
                ))}
              </StyledSelect>
            </StyledFormControl>
          </Box>

          {/* My Projects/Teams Toggle */}
          <ToolBox2
            className="filterTopRow"
            sx={{
              backgroundColor: 'rgba(15, 23, 42, 0.04)',
              height: '64px',
              borderBottom: ' rgba(206, 220, 233, 0.50) 1px solid',
            }}
          >
            <Box
              className="filterColBlock"
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 2,
              }}
            >
              {/* Toggle Icons */}
              <Box
                className="projectIcon"
                sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
              >
                {view.includes('Project') || view.includes('Portfolio') ? (
                  <>
                    <TooltipButton
                      msg="My Projects"
                      placement="bottom"
                      onClick={() => handleToggle(true)}
                    >
                      <span ref={myProjectsButtonRef}>
                        <MyProjectIcon
                          customColor={
                            currentView?.MyProjects
                              ? '#5C6777'
                              : 'rgba(75, 85, 99, 0.30)'
                          }
                        />
                      </span>
                    </TooltipButton>
                    <TooltipButton
                      msg="All Projects"
                      placement="bottom"
                      onClick={() => handleToggle(false)}
                    >
                      <span ref={myProjectsButtonRef}>
                        <AllProjectIcon
                          customColor={
                            currentView?.MyProjects
                              ? 'rgba(75, 85, 99, 0.30)'
                              : '#5C6777'
                          }
                        />
                      </span>
                    </TooltipButton>
                    <Popover
                      open={openPopover}
                      anchorEl={popOverAnchorEl}
                      onClose={handlePopoverClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                      disableAutoFocus
                      disableEnforceFocus
                      slotProps={{
                        paper: {
                          sx: {
                            padding: '8px 16px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                          },
                        },
                      }}
                    >
                      <Typography variant="body2">
                        No projects found.
                      </Typography>
                    </Popover>
                  </>
                ) : view.includes('Teams') ||
                  view.includes('Organisations') ||
                  view.includes('Resources') ||
                  view.includes('Flat') ? (
                  <>
                    <TooltipButton
                      msg="My Teams"
                      placement="bottom"
                      onClick={() => handleToggle(true)}
                    >
                      <span ref={myTeamsButtonRef}>
                        <MyTeamsIcon
                          sx={{ width: 15, height: 15 }}
                          color={
                            currentView?.MyTeam
                              ? '#5C6777'
                              : 'rgba(75, 85, 99, 0.30)'
                          }
                        />
                      </span>
                    </TooltipButton>
                    <TooltipButton
                      msg="All Teams"
                      placement="bottom"
                      onClick={() => handleToggle(false)}
                    >
                      <span ref={myTeamsButtonRef}>
                        <MyAllTeamsIcon
                          sx={{ width: 22, height: 22 }}
                          color={
                            currentView?.MyTeam
                              ? 'rgba(75, 85, 99, 0.30)'
                              : '#5C6777'
                          }
                        />
                      </span>
                    </TooltipButton>
                    <Popover
                      open={openPopover}
                      anchorEl={popOverAnchorEl}
                      onClose={handleClose}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'center',
                      }}
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'center',
                      }}
                      disableAutoFocus
                      disableEnforceFocus
                      slotProps={{
                        paper: {
                          sx: {
                            padding: '8px 16px',
                            backgroundColor: '#f5f5f5',
                            borderRadius: 1,
                          },
                        },
                      }}
                    >
                      <Typography variant="body2">No teams found.</Typography>
                    </Popover>
                  </>
                ) : null}
              </Box>

              {/* Calendar Date Range Picker */}
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  borderLeft: '1px solid rgba(206, 220, 233, 0.5)',
                  borderRight: '1px solid rgba(206, 220, 233, 0.5)',
                  height: '64px',
                  pt: '6px',
                  px: 1,
                }}
              >
                <IconButton
                  sx={{ marginBottom: '8px' }}
                  onClick={() => changeCalendarDate('prev')}
                >
                  <ChevronLeftIcon />
                </IconButton>
                <Box className="rangePicker" sx={{ display: 'flex' }}>
                  <CustomDateRangePicker
                    open={isRangePickerOpen}
                    placeholder={`${first} - ${last}`}
                    isButton={true}
                    value={{ StartDate: startDate, EndDate: endDate }}
                    showCalendarIconOnlyHere
                    onOpen={() => setIsRangePickerOpen(true)}
                    onClose={() => setIsRangePickerOpen(false)}
                    showLabel={false}
                    format="MMM YY"
                    maxWeeks={51}
                    handleDateField={handleDateField}
                  />
                </Box>

                <IconButton
                  sx={{ marginLeft: '15px', marginBottom: '8px' }}
                  onClick={() => changeCalendarDate('next')}
                >
                  <ChevronRightIcon />
                </IconButton>
              </Box>

              {/* View Selector + Save View Button */}
              <Box className="view-btn" sx={{ display: 'flex', gap: 2 }}>
                <Box>
                  <ViewButton
                    startIcon={<PreferencesIcon />}
                    endIcon={<KeyboardArrowDownIcon />}
                    onClick={handleViewClick}
                    aria-controls={open ? 'view-menu' : undefined}
                    aria-haspopup="true"
                    aria-expanded={open ? 'true' : undefined}
                  >
                    <EllipsisNameCell value={currentViewName} />
                  </ViewButton>

                  <StyledMenu
                    id="group-menu"
                    anchorEl={anchorEl}
                    open={open}
                    onClose={handleClose}
                    MenuListProps={{ 'aria-labelledby': 'view-button' }}
                    PaperProps={{
                      style: {
                        minWidth: 'auto',
                        width: 'auto',
                        position: 'absolute',
                        left: 0,
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
                            ? { borderTop: '1px solid #DDE1E4' }
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
                          <Box
                            sx={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 1,
                            }}
                          >
                            {getIcon(option.Id)}
                            <Box sx={{ flexGrow: 1 }}>{option.Name}</Box>
                          </Box>
                          {option.isDefault && option.Id !== '0' && (
                            <Typography className="tag">default</Typography>
                          )}
                          {option.Id !== '0' && (
                            <Box className="action-buttons">
                              {permissions &&
                                permissions['UserAllocationView']?.u && (
                                  <ActionIconButton
                                    size="small"
                                    onClick={e => handleEditView(e, option)}
                                  >
                                    <EditActionIcon />
                                  </ActionIconButton>
                                )}
                              {permissions &&
                                permissions['UserAllocationView']?.d && (
                                  <ActionIconButton
                                    size="small"
                                    onClick={e => handleDeleteView(e, option)}
                                  >
                                    <DeleteActionIcon />
                                  </ActionIconButton>
                                )}
                            </Box>
                          )}
                        </Box>
                      </StyledViewMenuItem>
                    ))}
                  </StyledMenu>
                </Box>

                {((selectedView !== '0' &&
                  ((permissions && permissions['UserAllocationView']?.c) ||
                    (permissions && permissions['UserAllocationView']?.u))) ||
                  (selectedView === '0' &&
                    permissions &&
                    permissions['UserAllocationView']?.c)) && (
                  <Button
                    disabled={
                      (permissions &&
                        !permissions['UserAllocationView']?.c &&
                        permissions &&
                        !permissions['UserAllocationView']?.u) ||
                      currentView.GroupBy.includes('Cost') ||
                      isObjectEqual(
                        savedViews.find(view => view.Id === selectedView),
                        currentView
                      )
                    }
                    onClick={handleSaveView}
                    sx={{
                      border: 'none !important',
                      color: '#344665 !important',
                      textTransform: 'none',
                      marginTop: '2px',
                      '&.Mui-disabled': { color: '#9F9F9F !important' },
                    }}
                  >
                    <EllipsisNameCell value="Save View" />
                  </Button>
                )}
              </Box>
            </Box>
          </ToolBox2>
        </ToolBox1>
        <Box
          sx={{
            flexGrow: 1,
            height: '64px',
            backgroundColor: 'rgba(15, 23, 42, 0.04)',
            borderBottom: ' rgba(206, 220, 233, 0.50) 1px solid',
          }}
        />

        {/* Right Section: Search Bar */}
        {/* Sahadev : Search bar temporarily removed as per UX decision */}
        {/* <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            backgroundColor: 'rgba(15, 23, 42, 0.04)',
            height: '64px',
            borderLeft: '1px solid #D6DCE1',
            borderBottom: 'rgba(206, 220, 233, 0.50) 1px solid',
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
              padding: '0px 8px',
              gap: '8px',
              flexShrink: 0,
              borderRadius: '8px',
              backgroundColor: '#FFFFFF',
              boxShadow: '0px 2px 1px 0px rgba(0, 0, 0, 0.07)',
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
                    <img src="/images/icons/SearchFilled.svg" alt="search" />
                  </InputAdornment>
                ),
                sx: {
                  fontSize: '14px',
                  height: '36px',
                  padding: 0,
                },
              }}
              inputProps={{
                style: { padding: '0', fontSize: '14px' },
              }}
            />
          </Box>
        </Box> */}
      </Box>

      {/* Bottom Toolbar  */}
      <Box
        className="lowerToolbar"
        sx={{
          height: '54px',
          flexShrink: 0,
          display: 'flex',
          justifyContent: 'space-between',
          // borderBottom: '3px solid rgba(171, 183, 194, 0.50)',
          borderBottom: '2px solid rgba(206, 220, 233, 0.50)',
          background:
            'linear-gradient(185deg, #FFF 3.99%, rgba(239, 244, 254, 0.10) 251.06%)',
        }}
      >
        <Box className="lowerToolbarSub" sx={{ display: 'flex' }}>
          {loadingLoginUserPrivileges ? (
            // Show skeleton placeholders while loading
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Skeleton
                variant="rounded"
                width={149}
                height={24}
                sx={{ mx: 1 }}
              />
              <Box
                sx={{
                  borderLeft: 'rgba(206, 220, 233, 0.5) solid 1px',
                  ml: '5px',
                  my: '5px',
                  height: '34px',
                }}
              ></Box>
              <Skeleton
                variant="rounded"
                width={120}
                height={24}
                sx={{ mx: 2 }}
              />
            </Box>
          ) : (
            <>
              {permissions && permissions['AllocationCost']?.r && (
                <ToolBox2>
                  <Stack direction="row" sx={{ alignItems: 'center' }}>
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#344665',
                      }}
                    >
                      Allocations
                    </Typography>
                    <Switch
                      size="small"
                      checked={currentView?.GroupBy.includes('Cost')}
                      onChange={handleAllocationCostSwitch}
                      disabled={
                        (showActuals &&
                          !currentView?.GroupBy.includes('Cost')) ||
                        currentView?.GroupBy === 'Portfolio' ||
                        currentView?.GroupBy === 'Organisations' ||
                        currentView?.GroupBy === 'Resources' ||
                        currentView?.GroupBy === 'Flat'
                      }
                    />
                    <Typography
                      sx={{
                        fontSize: '0.875rem',
                        fontWeight: 600,
                        color: '#344665',
                      }}
                    >
                      Costs
                    </Typography>
                  </Stack>
                </ToolBox2>
              )}
              {permissions &&
                permissions['AllocationCost']?.r &&
                permissions &&
                permissions['ActualsStatus']?.r && (
                  <Box
                    sx={{
                      borderLeft: 'rgba(206, 220, 233, 0.5) solid 1px',
                      ml: '20px',
                      height: '34px',
                      position: 'relative',
                      top: '10px',
                    }}
                  ></Box>
                )}
              {permissions && permissions['ActualsStatus']?.r && (
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    marginLeft: '22px',
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={showActuals}
                        disabled={currentView?.GroupBy.includes('Cost')}
                        onChange={handleShowActualsToggle}
                        size="small"
                        sx={{ padding: 0, gap: '12px', marginRight: '4px' }}
                      />
                    }
                    label={
                      <Typography
                        sx={{
                          color: '#374151',
                          fontFamily: 'Open Sans',
                          fontSize: '14px',
                          fontStyle: 'normal',
                          fontWeight: 500,
                          lineHeight: '20px',
                          marginRight: '-12px',
                        }}
                      >
                        Show Actuals
                      </Typography>
                    }
                  />
                  <Tooltip
                    placement="right"
                    title={
                      <Box>
                        <Typography variant="body2">
                          Displays actuals beneath planned allocations for all
                          weeks with actuals.
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" mt={1}>
                          Color indicators:
                        </Typography>
                        <Typography variant="body2">
                          <span>● Green</span> = match
                          <br />
                          <span>● Yellow</span> = actuals are lower
                          <br />
                          <span>● Red</span> = actuals are higher than planned.
                        </Typography>
                      </Box>
                    }
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <img src="/images/icons/InfoRounded.svg" alt="info" />
                    </Box>
                  </Tooltip>
                </Box>
              )}
            </>
          )}
        </Box>

        <Box
          className="lowerToolbarRight"
          sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
        >
          <GridToolbarContainer
            ref={setFilterButtonEl}
            sx={{ padding: 0, flexWrap: 'nowrap' }}
          >
            <GridToolbarFilterButton
              slotProps={{
                tooltip: { title: 'Filters' },
                button: {
                  variant: 'outlined',
                  sx: {
                    minWidth: 'unset',
                    width: '41px',
                    height: '36px',
                    padding: '20px 10px 20px 17px',
                    justifyContent: 'center',
                    alignItems: 'center',
                    gap: '6px',
                    flexShrink: 0,
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.25)',
                    '.MuiButton-startIcon': { marginRight: '0px' },
                    '& .MuiBadge-root span': { top: '-12px', right: '-5px' },
                    '& .MuiBadge-root svg': { display: 'none' },
                  },
                  component: props => (
                    <Button
                      {...props}
                      startIcon={
                        <img
                          src="/images/icons/NewFilterIcon.svg"
                          alt="filter"
                        />
                      }
                    >
                      {/* No text label for icon-only button */}
                    </Button>
                  ),
                },
              }}
            />
          </GridToolbarContainer>

          <Tooltip title={'Share View'}>
            <IconButton
              size="small"
              onClick={handleShareDeepLink}
              sx={{
                width: '41px',
                height: '36px',
                padding: '20px 10px 20px 12px',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                flexshrink: 0,
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                background: '#FFF',
                boxShadow: ' 0px 1px 1px 0px rgba(0, 0, 0, 0.25)',
              }}
            >
              <img src="/images/icons/newShareIcon.svg" alt="share" />
            </IconButton>
          </Tooltip>

          <GridToolbarContainer
            ref={setFilterButtonEl}
            sx={{ padding: 0, flexWrap: 'nowrap' }}
          >
            <GridToolbarColumnsButton
              slotProps={{
                tooltip: { title: 'Columns' },
                button: {
                  variant: 'outlined',
                  startIcon: (
                    <img
                      src="/images/icons/newColumnIcon.svg"
                      alt="columns"
                      style={{ width: 20, height: 20 }}
                    />
                  ),
                  sx: {
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
                    '& .MuiButton-startIcon': {
                      marginRight: '0px',
                    },
                    '& .MuiButton-endIcon': {
                      marginLeft: '0px',
                    },
                  },
                },
              }}
            />
          </GridToolbarContainer>
          <Tooltip title={'History'}>
            <IconButton
              size="small"
              onClick={() =>
                handleOpenDialog('View History', 'open_history', '', {
                  Resource: null,
                  Project: null,
                  StartDate: startDate,
                  EndDate: endDate,
                })
              }
              sx={{
                width: '41px',
                height: '1px',
                padding: '21px 12px 19px 12px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '6px',
                flexShrink: 0,
                borderRadius: '6px',
                border: '1px solid #E2E8F0',
                background: '#FFF',
                boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.25)',
              }}
            >
              <img
                src="/images/icons/newHistoryIcon(2).svg"
                alt="History"
                height="21px"
                width="21px"
              />
            </IconButton>
          </Tooltip>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <CustomExport />
          </Box>
        </Box>
      </Box>
      <ConfirmDialog
        open={deleteDialogOpen}
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        title="Are you sure you want to delete this View?"
      >
        {`This will permanently delete the view : ${deleteView?.Name}`}
      </ConfirmDialog>
      <ShareLinkDialog
        open={shareDialogOpen}
        title="Share this Allocation View"
        onClose={handleCancelShare}
      >
        <CopyLinkInput
          value={shareLink}
          onButtonClick={copyLinkToClipboard}
          buttonText="Copy link"
          label=""
        />
      </ShareLinkDialog>
    </Box>
  );
});

CustomToolbar.displayName = 'CustomToolbar';

export default CustomToolbar;
