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
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteUsersSavedViewAction,
  performChangeView,
} from '@/app/redux/actions/allocationViewAction';
import {
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
import MyTeamsIcon from '../TableIcons/MyTeamsIcon';
import AllTeamsIcon from '../TableIcons/AllTeamsIcon';
import MyProjectIcon from '../TableIcons/MyProjectIcon';
import AllProjectIcon from '../TableIcons/AllProjectIcon';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import {
  setCurrentView,
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

const ToolBox1 = styled(Box)(({ theme }) => ({
  display: 'flex',
  padding: '7px 5px 7px 7px',
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
  borderRight: '#DDE1E4 solid 1px',
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
  maxWidth: '160px',
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
  <img src="/images/icons/preferences.svg" alt="preferences" />
);

const ShareIcon = () => (
  <img src="/images/icons/ShareRounded.svg" alt="share" />
);

const HistoryIcon = () => (
  <img src="/images/icons/HistoryButton.svg" alt="share" />
);

const PortfolioIcon = () => (
  <img src="/images/icons/portfolio.svg" alt="portfolio" />
);

const CustomToolbar = memo(({ setFilterButtonEl }) => {
  const dispatch = useDispatch();
  const [value, setValue] = React.useState([null, null]);
  const { view, savedViews, currentView } = useSelector(
    state => state.allocationView
  );
  const { calendarDate: teamsCalendar } = useSelector(state => state.teams);
  const { projects, calendarDate: projectsCalendar } = useSelector(
    state => state.projects
  );
  const { user } = useSelector(state => state.user);
  const { resources } = useSelector(state => state.resources);
  const { teams } = useSelector(state => state.teams);
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
      icon: <PeopleIcon sx={{ fontSize: 20, color: '#344665' }} />,
    },
    {
      name: 'Project',
      icon: <FolderIcon sx={{ fontSize: 20, color: '#344665' }} />,
    },
    {
      name: 'Portfolio',
      icon: <PortfolioIcon sx={{ fontSize: 20, color: '#344665' }} />,
    },
    {
      name: 'Project Cost',
      icon: <MonetizationOnIcon sx={{ fontSize: 20, color: '#344665' }} />,
    },
    {
      name: 'Teams Cost',
      icon: <MonetizationOnIcon sx={{ fontSize: 20, color: '#344665' }} />,
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

  const changeCalendarDate = (type, StartDate = '', EndDate = '') => {
    // const isTeams = view === 'Teams';
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
            ? `Save View - ${currentView?.Name}`
            : 'Save View',
          submitButtonText: 'Save',
          secondaryButtonText: 'Save As',
          cancelButtonText: 'Cancel',
          formType: 'save_view',
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
    if (isMine) {
      const teamsIAmAllocationManager = getTeamsIamAllocationManager(
        user?.Email,
        resources || [],
        teams || []
      );

      if (view.includes('Teams') && teamsIAmAllocationManager.length === 0) {
        setPopOverAnchorEl(myTeamsButtonRef.current);
        setTimeout(() => setPopOverAnchorEl(null), 2000);
        return;
      }

      // Check if the user is a project manager in any of the projects
      const currentResource = resources?.find(r => r.Email === user?.Email);
      const projectsIAmProjectManager = getProjectsIamProjectManager(
        currentResource?.Id,
        projects || []
      );

      if (view.includes('Project') && projectsIAmProjectManager.length === 0) {
        setPopOverAnchorEl(myProjectsButtonRef.current);
        setTimeout(() => setPopOverAnchorEl(null), 2000);
        return;
      }
    }

    if (view.includes('Teams')) {
      dispatch(updateCurrentView({ MyTeam: isMine }));
    } else if (view.includes('Project')) {
      dispatch(updateCurrentView({ MyProjects: isMine }));
    }
  };

  const handleAllocationCostSwitch = () => {
    const isCost = currentView?.GroupBy.includes('Cost');
    const newGroupBy = isCost
      ? currentView?.GroupBy.replace(' Cost', '')
      : `${currentView?.GroupBy} Cost`;
    dispatch(performChangeView(newGroupBy));
  };

  const open = Boolean(anchorEl);
  const openPopover = Boolean(popOverAnchorEl);

  const currentViewName =
    savedViews.find(view => view.Id === selectedView)?.Name || 'Default View';

  const handleDateField = (StartDate, EndDate) => {
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

  return (
    <Box
      display={'flex'}
      boxShadow={'0 1px 0 0 #DDE1E4'}
      position={'relative'}
      zIndex={1}
    >
      <ToolBox1>
        <StyledFormControl size="small">
          <StyledSelect
            value={
              currentView?.GroupBy === 'Project'
                ? 'Projects'
                : currentView?.GroupBy === 'Project Cost'
                  ? 'Projects Cost'
                  : currentView?.GroupBy || 'Teams'
            }
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
                ) : selected === 'Teams' ? (
                  <PeopleIcon sx={{ fontSize: 20, color: '#344665' }} />
                ) : selected === 'Portfolio' ? (
                  <PortfolioIcon sx={{ fontSize: 20, color: '#344665' }} />
                ) : (
                  <MonetizationOnIcon sx={{ fontSize: 20, color: '#344665' }} />
                )}
                {selected}
              </MenuItemContent>
            )}
          >
            {viewOptions.map(option => (
              <StyledMenuItem value={option.name}>
                {option.icon}
                {option.name === 'Project'
                  ? 'Projects'
                  : option.name === 'Project Cost'
                    ? 'Projects Cost'
                    : option.name === 'Portfolio'
                      ? PORTFOLIO_DISPLAY_NAME
                      : option.name}
              </StyledMenuItem>
            ))}
          </StyledSelect>
        </StyledFormControl>
      </ToolBox1>
      <ToolBox2 flex={1} className="filterTopRow">
        <Box className="filterColBlock">
          <Box className="projectIcon">
            {view.includes('Project') ? (
              <>
                <TooltipButton
                  msg="My Project"
                  placement="bottom"
                  onClick={() => handleToggle(true)}
                >
                  <span ref={myProjectsButtonRef}>
                    <MyProjectIcon
                      color={currentView?.MyProjects ? '#344665' : '#99A2B2'}
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
                      color={currentView?.MyProjects ? '#99A2B2' : '#344665'}
                    />
                  </span>
                </TooltipButton>

                <Popover
                  open={openPopover}
                  anchorEl={popOverAnchorEl}
                  onClose={handlePopoverClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'center' }}
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
                  <Typography variant="body2">No projects found.</Typography>
                </Popover>
              </>
            ) : view.includes('Teams') ? (
              <>
                <TooltipButton
                  msg="My Teams"
                  placement="bottom"
                  onClick={() => handleToggle(true)}
                >
                  <span ref={myTeamsButtonRef}>
                    <MyTeamsIcon
                      sx={{ width: 18, height: 18 }}
                      color={currentView?.MyTeam ? '#344665' : '#99A2B2'}
                    />
                  </span>
                </TooltipButton>

                <TooltipButton
                  msg="All Teams"
                  placement="bottom"
                  onClick={() => handleToggle(false)}
                >
                  <span ref={myTeamsButtonRef}>
                    <AllTeamsIcon
                      color={currentView?.MyTeam ? '#99A2B2' : '#344665'}
                    />
                  </span>
                </TooltipButton>

                <Popover
                  open={openPopover}
                  anchorEl={popOverAnchorEl}
                  onClose={handleClose}
                  anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                  transformOrigin={{ vertical: 'top', horizontal: 'center' }}
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
            <CustomDateRangePicker
              open={isRangePickerOpen}
              placeholder={`${first} - ${last}`}
              isButton={true}
              value={{
                StartDate: startDate,
                EndDate: endDate,
              }}
              onOpen={() => setIsRangePickerOpen(true)}
              onClose={() => setIsRangePickerOpen(false)}
              showLabel={false}
              format="MMM YY"
              maxWeeks={51}
              handleDateField={handleDateField}
            />
            <IconButton
              onClick={() => changeCalendarDate('next')}
              size="medium"
              className="nextPrevIcon"
            >
              <img src={'/images/icons/right-arrow.svg'} alt="right-arrow" />
            </IconButton>
          </Box>
          <Box className="view-btn" sx={{ display: 'flex', gap: 0 }}>
            <Box>
              <ViewButton
                startIcon={<PreferencesIcon />}
                endIcon={<KeyboardArrowDownIcon />}
                onClick={handleViewClick}
                aria-controls={open ? 'view-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
              >
                <EllipsisNameCell value={currentViewName}></EllipsisNameCell>
              </ViewButton>

              <StyledMenu
                id="group-menu"
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
                      <Box
                        sx={{ display: 'flex', alignItems: 'center', gap: 1 }}
                      >
                        {getIcon(option.Id)}

                        <Box sx={{ flexGrow: 1 }}>{option.Name}</Box>
                      </Box>

                      {option.isDefault && option.Id !== '0' && (
                        <Typography className="tag">default</Typography>
                      )}
                      {option.Id !== '0' && (
                        <Box className="action-buttons">
                          <ActionIconButton
                            size="small"
                            onClick={e => handleEditView(e, option)}
                          >
                            <EditActionIcon />
                          </ActionIconButton>
                          <ActionIconButton
                            size="small"
                            onClick={e => handleDeleteView(e, option)}
                          >
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
              disabled={
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
                backgroundColor: '#ffffff !important',
                '&.Mui-disabled': {
                  color: '#9F9F9F !important', // Change disabled text color
                },
              }}
            >
              <EllipsisNameCell value={'Save View'} />
            </Button>
          </Box>
        </Box>
      </ToolBox2>
      <ToolBox2 sx={{ gap: 1 }}>
        <Box>
          <Stack direction="row" sx={{ alignItems: 'center' }}>
            <Typography
              sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#344665' }}
            >
              Allocations
            </Typography>
            <Switch
              size="small"
              checked={currentView?.GroupBy.includes('Cost')}
              onChange={handleAllocationCostSwitch}
            />
            <Typography
              sx={{ fontSize: '0.875rem', fontWeight: 600, color: '#344665' }}
            >
              Costs
            </Typography>
          </Stack>
        </Box>
      </ToolBox2>
      <ToolBox2 sx={{ gap: 1 }}>
        <Box>
          <IconButton
            variant="outlined"
            onClick={handleShareDeepLink}
            size="small"
            className="nextPrevIcon"
          >
            <ShareIcon />
          </IconButton>
        </Box>
        {/* History button on the toolbar */}
        {/* <Box>
          <IconButton
            variant="outlined"
            size="small"
            disabled={true}
            sx={{ width: '32px', height: '32px' }}
          >
            <HistoryIcon />
          </IconButton>
        </Box> */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <CustomExport />
        </Box>
      </ToolBox2>
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
