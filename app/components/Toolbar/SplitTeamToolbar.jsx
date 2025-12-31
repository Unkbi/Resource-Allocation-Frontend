import React, { useCallback, useEffect, useRef, useState, memo } from 'react';
import {
  Box,
  Button,
  IconButton,
  Select,
  MenuItem,
  Autocomplete,
  TextField,
  FormControl,
  Divider,
  styled,
  Menu,
  Typography,
  Popover,
  Slider,
  Popper,
  Tooltip,
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import CustomSelect from '../Select/CustomSelect';
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
import {
  generateDateWeekMath,
  generateFirstAndLastMonthYear,
  getOnlyFilterSettings,
  getProjectsIamProjectManager,
  getStartAndEndDateForView,
  getTeamsIamAllocationManager,
  getTotalWeeks,
  isObjectEqual,
  calculateWeekRanges,
} from '@/app/utils/common';
import { updateStartAndEndDate } from '@/app/redux/reducers/teamsReducer';
import { updateProjectStartAndEndDate } from '@/app/redux/reducers/projectsReducer';
import {
  DATE_FORMAT,
  DEFAULT_PROJECT_WEEK_MINUS,
  DEFAULT_PROJECT_WEEK_PLUS,
  TOTAL_FUTURE_WEEKS_ARROW,
} from '@/app/constants/constants';
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
import {
  setExpandRowId,
  setScrollPosition,
  setCurrentView,
  updateCurrentView,
} from '@/app/redux/reducers/allocationViewReducer';
import { set } from 'date-fns';
import { compressToEncodedURIComponent } from 'lz-string';
import CustomInput from '../Input/Input';
import { showToastAction } from '@/app/redux/actions/toastAction';
import { StyledInput } from '../Input/StyledInput';
import CopyLinkInput from '../Input/InputWithButton';
import ShareLinkDialog from '../Dialog/ShareLinkDialog';
import CustomDateRangePicker from '../DatePicker/CustomDateRangePicker';
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react';
import { useDataGrid } from '@/app/context/dataGridContext';

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 140,
  margin: 0,
}));

const StyledFormControlForWeek = styled(FormControl)(({ theme }) => ({
  minWidth: 80,
  margin: 0,
}));

const ToolBox2 = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '7px 0px 5px 14px',
  width: '100%',
  marginBottom: '10px',
  gap: '16px',
  '& > div:last-child': {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
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
    marginLeft: '5px',
    marginRight: '2px',
  },
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

const StyledDivider = styled(Divider)(({ theme }) => ({
  height: '37px',
  marginLeft: '6px',
  marginRight: '6px',
  color: '#BABABA',
}));

const StyledSlider = styled(Slider)(({ theme }) => ({
  width: '200px',
  marginBottom: '0px',
  '& .MuiSlider-rail': {
    backgroundColor: '#DDE1E4',
  },
  '& .MuiSlider-track': {
    backgroundColor: '#1C2D5F',
  },
  '& .MuiSlider-thumb': {
    width: 12,
    height: 12,
    backgroundColor: '#ffffff',
    border: '2px solid #1C2D5F',
    '&:hover, &.Mui-active': {
      boxShadow: '0 0 0 8px rgba(28, 45, 95, 0.16)',
    },
  },
  // Add these styles for smaller marks
  '& .MuiSlider-markLabel': {
    fontSize: '10px',
    color: '#666',
    transform: 'translate(-50%)', // Adjust vertical position
  },
  // Style for the value label
  '& .MuiSlider-valueLabel': {
    fontSize: '10px',
    padding: '2px 4px',
  },
}));

const SplitTeamToolbar = memo(
  ({
    setFilterButtonEl,
    setAllocationThreshold,
    setSelectedTeam,
    selectedTeam,
    allocationThreshold,
  }) => {
    const dispatch = useDispatch();
    const { view, savedViews, currentView } = useSelector(
      state => state.allocationView
    );
    const { calendarDate } = useSelector(state => state.allAllocations);
    const { user } = useSelector(state => state.user);
    const { resources } = useSelector(state => state.resources);
    const { teams } = useSelector(state => state.teams);
    const { getApiRef } = useDataGrid();

    const { startDate: _startDate, endDate: _endDate } = calendarDate || {};

    const startDate = currentView?.isDynamicRange
      ? generateDateWeekMath('WEEK_MINUS', currentView?.WeekMinus)
      : currentView?.isFixedRange
        ? currentView?.StartDate
        : _startDate;

    const endDate = currentView?.isDynamicRange
      ? generateDateWeekMath('WEEK_PLUS', currentView?.WeekPlus)
      : currentView?.isFixedRange
        ? currentView?.EndDate
        : _endDate;
    const splitViewCurrentProject = useSelector(
      state => state.allocationView.splitViewCurrentProject
    );
    const [shareDialogOpen, setShareDialogOpen] = useState(false);
    const [shareLink, setShareLink] = useState('');
    const [deleteView, setDeleteView] = useState(null);

    const [anchorEl, setAnchorEl] = useState(null);
    const [popOverAnchorEl, setPopOverAnchorEl] = useState(null);
    const [selectedView, setSelectedView] = useState('0');
    const myTeamsButtonRef = useRef(null);
    const myProjectsButtonRef = useRef(null);
    const { initialData } = useSelector(state => state.globalDialog.formState);
    const [isRangePickerOpen, setIsRangePickerOpen] = useState(false);

    const handleClose = () => {
      setAnchorEl(null);
    };

    const handleAllocationRangeChange = (event, newValue) => {
      setAllocationThreshold(newValue);
    };

    const [active, setActive] = useState(false);

    const first = generateFirstAndLastMonthYear(
      parseISO(startDate),
      'MMM yy',
      true
    );
    const last = generateFirstAndLastMonthYear(
      parseISO(endDate),
      'MMM yy',
      true
    );

    const getExpandedParentIds = ref => {
      if (!ref) return [];

      const prefix = 'auto-generated-row-teams/';
      let expanded = gridExpandedSortedRowIdsSelector({ current: ref });
      const regex = /^auto-generated-row-teams\/.+-resource\//;
      const filtered = expanded.filter(
        id => !id.startsWith(prefix) || regex.test(id)
      );
      const expandedNodes = filtered.map(id => ref.getRowNode(id));

      const parentNodes = expandedNodes
        .map(node => (node?.parent ? ref.getRowNode(node.parent) : null))
        .filter(Boolean);

      const uniqueParentIds = [...new Set(parentNodes.map(p => p.id))];

      return uniqueParentIds;
    };

    const preserveExpansionAndScroll = () => {
      // Handle scroll and expansion state preservation
      const currentRef = getApiRef('bottomTeam');
      if (currentRef) {
        const scrollPosition = currentRef.getScrollPosition();
        dispatch(setScrollPosition(scrollPosition));

        const expandedParentIds = getExpandedParentIds(currentRef);
        dispatch(setExpandRowId(expandedParentIds));
      }
    };

    const changeCalendarDate = (type, StartDate = '', EndDate = '') => {
      // Preserve expansion and scroll position
      preserveExpansionAndScroll();

      const isNext = type === 'next';
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
                  StartDate: generateDateWeekMath(
                    'WEEK_MINUS',
                    toNextWeekMinus
                  ),
                  EndDate: generateDateWeekMath('WEEK_PLUS', toNextWeekPlus),
                  WeekPlus: toNextWeekPlus,
                  WeekMinus: toNextWeekMinus,
                }
              : {
                  StartDate: generateDateWeekMath(
                    'WEEK_MINUS',
                    toPrevWeekMinus
                  ),
                  EndDate: generateDateWeekMath('WEEK_PLUS', toPrevWeekPlus),
                  WeekMinus: toPrevWeekMinus,
                  WeekPlus: toPrevWeekPlus,
                }),
          })
        );
      }
    };

    const open = Boolean(anchorEl);
    const openPopover = Boolean(popOverAnchorEl);

    const currentViewName =
      savedViews.find(view => view.Id === selectedView)?.Name || 'Default View';

    useEffect(() => {
      if (currentView?.Name) {
        setSelectedView(currentView?.Id);
      }
    }, [currentView?.Name]);

    const commonAutocompleteStyles = {
      minWidth: '300px',
      width: '100%',
      '& .MuiInputBase-root': {
        fontSize: '12px',
        padding: '0 8px',
        borderRadius: '6px',
        backgroundColor: '#fff',
        border: '1px solid #D9D9D9',
      },
      '& .MuiAutocomplete-tag': {
        fontSize: '10px',
        width: 'auto',
        height: '20px',
        overflow: 'hidden',
        backgroundColor: '#E9E9E9',
        borderRadius: '30px',
        border: '1px solid rgba(28, 45, 95, 0.20)',
        borderRadius: '38px',
        color: ' #1C2D5F',
        fontfamily: 'Open Sans',
        fontSize: '12px',
        fontStyle: 'normal',
        fontWeight: 600,
        lineHeight: 'normal',
        '& .MuiSvgIcon-root': {
          // Add this section for the close icon
          width: '14px',
          height: '14px',
          margin: '0px 2px',
        },
      },
      '& input': { fontSize: '12px' },
      '& .MuiAutocomplete-popper': { fontSize: '12px' },
      '& .MuiAutocomplete-option': { fontSize: '12px', padding: '4px 10px' },
    };

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

    const commonSlotProps = {
      popper: {
        modifiers: [
          {
            name: 'preventOverflow',
            options: {
              boundary: 'window',
            },
          },
        ],
      },
      paper: {
        sx: {
          fontSize: '12px',
        },
      },
    };

    const TeamOptions =
      teams
        ?.filter(t => t.Status === 'Active')
        ?.map(team => ({
        label: team.Name,
        value: team.Id,
      }))
       ?.sort((a, b) => a.label.localeCompare(b.label)) || [];

    const handleTeamChange = (event, newValue) => {
      if (!newValue) return;

      if (newValue.length === 0 && selectedTeam.length > 0) {
        setSelectedTeam([]);
        return;
      }

      if (newValue.length < selectedTeam.length) {
        const removedTeam = selectedTeam.find(
          team => !newValue.some(newItem => newItem.value === team.value)
        );
        if (removedTeam) {
          const updated = selectedTeam.filter(
            team => team.value !== removedTeam.value
          );
          setSelectedTeam(updated);
        } else {
          setSelectedTeam(newValue);
        }
        return;
      }
      const lastItem = newValue[newValue.length - 1];
      const alreadySelected = selectedTeam.some(
        team => team.value === lastItem.value
      );

      if (alreadySelected) {
        const updatedSelection = selectedTeam.filter(
          team => team.value !== lastItem.value
        );
        setSelectedTeam(updatedSelection);
      } else {
        setSelectedTeam([...selectedTeam, lastItem]);
      }
    };

    return (
      <Box
        display={'flex'}
        height={'80px'}
        boxShadow={'0 1px 0 0 #DDE1E4'}
        position={'relative'}
        zIndex={1}
      >
        <ToolBox2>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box>
              <Autocomplete
                sx={commonAutocompleteStyles}
                disablePortal
                blurOnSelect
                openOnFocus
                onClose={(event, reason) => {
                  if (
                    reason === 'blur' ||
                    reason === 'escape' ||
                    reason === 'toggleInput'
                  ) {
                    // automatically closes on outside click or scroll
                  }
                }}
                slotProps={{
                  popper: {
                    modifiers: [
                      {
                        name: 'preventOverflow',
                        options: {
                          boundary: 'viewport',
                        },
                      },
                    ],
                  },
                  paper: {
                    sx: {
                      fontSize: '12px',
                      maxHeight: 250,
                    },
                  },
                }}
                multiple
                size="medium"
                options={TeamOptions}
                getOptionLabel={option => option?.label || ''}
                value={selectedTeam}
                filterSelectedOptions
                limitTags={2}
                onChange={handleTeamChange}
                slotProps={commonSlotProps}
                renderOption={(props, option) => {
                  const isSelected = selectedTeam.some(
                    team => team.value === option.value
                  );
                  const { key, ...rest } = props;
                  return (
                    <li
                      key={key}
                      {...rest}
                      style={{
                        ...rest.style,
                        backgroundColor: isSelected
                          ? '#f0f0f0'
                          : props.style?.backgroundColor,
                      }}
                    >
                      {option.label}
                    </li>
                  );
                }}
                renderInput={params => (
                  <TextField
                    {...params}
                    placeholder="Select Teams"
                    variant="outlined"
                  />
                )}
              />
            </Box>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                paddingLeft: '9px',
                paddingRight: '10px',
              }}
            >
              <Box
                sx={{
                  width: '0.894px',
                  height: '37px',
                  background: '#CEDCE9',
                  opacity: 0.5,
                }}
              />
              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  padding: '0 16px',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: ' #212121',
                    fontFamily: 'Open Sans',
                    fontSize: '14px',
                    fontStyle: 'normal',
                    fontWeight: ' 500',
                    lineHeight: 'normal',
                  }}
                >
                  {'Select Utilization ≤'}
                </Typography>
                <Tooltip
                  title="Shows resources whose average utilization for the selected period is ≤ the chosen value."
                  arrow
                  placement="top"
                  componentsProps={{
                    tooltip: {
                      sx: {
                        whiteSpace: 'nowrap',
                        maxWidth: 'none',
                        fontSize: '12px',
                      },
                    },
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      cursor: 'pointer',
                    }}
                  >
                    <img src="/images/icons/splitInfo.svg" alt="info" />
                  </Box>
                </Tooltip>
              </Box>

              <Box
                sx={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  paddingLeft: '3px',
                }}
              >
                <StyledSlider
                  value={allocationThreshold}
                  onChange={handleAllocationRangeChange}
                  valueLabelDisplay="on"
                  size="small"
                  step={0.1}
                  min={0.0}
                  max={1.2}
                  marks={[
                    { value: 0, label: '0' },
                    { value: 0.2, label: '0.2' },
                    { value: 0.4, label: '0.4' },
                    { value: 0.6, label: '0.6' },
                    { value: 0.8, label: '0.8' },
                    { value: 1, label: '1.0' },
                    { value: 1.2, label: 'max' },
                  ]}
                  valueLabelFormat={value =>
                    value === 1.1 ? 'max' : value === 1.2 ? 'max' : `${value}`
                  }
                />
              </Box>
            </Box>
            <StyledDivider orientation="vertical" />

            <GridToolbarContainer ref={setFilterButtonEl} sx={{ padding: 0 }}>
              <GridToolbarFilterButton
                slotProps={{
                  tooltip: { title: 'Filters' },
                  button: {
                    variant: 'outlined',
                    sx: {
                      minWidth: '36px',
                      width: '36px',
                      height: '36px',
                      padding: 0,
                      justifyContent: 'center',
                      alignItems: 'center',
                      borderRadius: '6px',
                      border: '1px solid #E2E8F0',
                      background: '#FFF',
                      boxShadow: '0px 1px 1px 0px rgba(0, 0, 0, 0.25)',
                      '.MuiButton-startIcon': { marginRight: '0px' },
                      '& .MuiBadge-root span': { top: '-12px', right: '-5px' },
                      '& .MuiBadge-root svg': { display: 'none' },
                    },
                    component: props => (
                      <Button
                        sx={{
                          margin: '0',
                          padding: '0 6px',
                          minHeight: '32px',
                        }}
                        {...props}
                        startIcon={
                          <img
                            src="/images/icons/NewFilterIcon.svg"
                            alt="filter"
                          />
                        }
                      >
                        {props.children}
                      </Button>
                    ),
                  },
                }}
              />
            </GridToolbarContainer>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              height: '64px',
              pt: '14px',
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
        </ToolBox2>
      </Box>
    );
  }
);

SplitTeamToolbar.displayName = 'SplitTeamToolbar';

export default SplitTeamToolbar;
