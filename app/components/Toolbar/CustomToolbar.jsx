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
} from '@mui/material';
import { KeyboardArrowDown } from '@mui/icons-material';
import { useDispatch, useSelector } from 'react-redux';
import { performChangeView } from '@/app/redux/actions/allocationViewAction';
import {
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import MyProjectIcon from '../TableIcons/MyProjectIcon';
import AllProjectIcon from '../TableIcons/AllProjectIcon';
import MyTeamsIcon from '../TableIcons/MyTeamsIcon';
import AllTeamsIcon from '../TableIcons/AllTeamsIcon';
import TooltipButton from '../Button/TooltipButton';

const ToolBox1 = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '240px',
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
    fontFamily: "'Manrope', serif",
    fontWeight: '800',
    fontSize: '15px',
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
      fontSize: '13px',
      color: '#212121',
      fontFamily: "'Manrope', serif",
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
      fontFamily: "'Manrope', serif",
      fontWeight: '500',
      fontSize: '13px',
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
      fontFamily: "'Manrope', serif",
      fontWeight: '500',
      fontSize: '13px',
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
    fontFamily: "'Manrope', serif",
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

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  padding: '10px 12px',
  color: '#212121',
  fontFamily: "'Manrope', serif",
  fontWeight: '400',
  fontSize: '13px',
  '&:hover': {
    backgroundColor: 'rgb(52 70 101 / 2%) !important',
  },
  '&.Mui-selected': {
    backgroundColor: 'rgb(52 70 101 / 2%) !important',
    fontWeight: '600',
  },
}));

const CustomToolbar = React.memo(({ setFilterButtonEl }) => {
  const dispatch = useDispatch();
  const view = useSelector(state => state.allocationView.view);
  const viewOptions = [
    'Teams',
    'Projects',
    // 'Organizations'
  ];
  const [active, setActive] = useState(false);

  const handleViewChange = useCallback(
    event => {
      dispatch(performChangeView(event.target.value));
    },
    [dispatch]
  );
  const handleClick = () => {
    setActive((prev) => !prev);
  };
  return (
    <Box
      display={'flex'}
      height={'60px'}
      boxShadow={'0 1px 0 0 #DDE1E4'}
      position={'relative'}
      zIndex={1}
    >
      <ToolBox1>
        <FormControl
          size="small"
          sx={{ minWidth: 100, border: 'none', boxShadow: 'none' }}
        >
          <Select
            value={view || 'Projects'}
            onChange={handleViewChange}
            className="projectDropdown"
            sx={{
              padding: 0,
              border: 'none',
              boxShadow: 'none',
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}
            defaultValue="Projects"
            IconComponent={KeyboardArrowDown}
            MenuProps={{
              PaperProps: {
                sx: {
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 4px 20px 0 rgba(0, 0, 0, 0.06)',
                  padding: '0',
                },
              },
            }}
          >
            {viewOptions.map((option, index) => (
              <StyledMenuItem key={index} value={option}>
                {option}
              </StyledMenuItem>
            ))}
          </Select>
        </FormControl>
        {/* <Box className="viewFilterBlock">
          <Button size="small" className="selected">
            <img src={'/images/icons/capacity.svg'} alt="capacity" />
          </Button>

          <Button size="small">
            <img src={'/images/icons/time.svg'} alt="time" />
          </Button>
          <Button size="small">
            <img src={'/images/icons/currency.svg'} alt="currency" />
          </Button>
        </Box> */}
      </ToolBox1>

      <ToolBox2 flex={1} className="filterTopRow">
        <Box className="filterColBlock">
          <GridToolbarContainer ref={setFilterButtonEl}>
            <GridToolbarColumnsButton
              slotProps={{
                tooltip: { title: 'Columns' },
                button: {
                  variant: 'outlined',
                  startIcon: (
                    <img src="/images/icons/columns.svg" alt="columns" />
                  ),
                },
              }}
            />
            <GridToolbarExport
              slotProps={{
                tooltip: { title: 'Export data' },
                button: {
                  variant: 'outlined',
                  sx: { color: '#555', borderColor: '#ddd' },
                  startIcon: (
                    <img src="/images/icons/export.svg" alt="export" />
                  ),
                },
              }}
            />
            <GridToolbarFilterButton
              slotProps={{
                tooltip: { title: 'Filter' },
                button: {
                  variant: 'outlined',
                  sx: { color: '#555', borderColor: '#ddd' },
                  startIcon: (
                    <img src="/images/icons/filter.svg" alt="filter" />
                  ),
                },
              }}
            />
          </GridToolbarContainer>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box className="projectIcon">
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
                  <MyTeamsIcon color={active ? '#344665' : '#99A2B2'} fontSize={'18'} />
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
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box className="dayWeekBlock">
            <Button>Day</Button>
            <Button className="selected">Week</Button>
            <Button>Month</Button>
          </Box>
          <Divider orientation="vertical" flexItem />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton size="medium" className="nextPrevIcon">
              <img src={'/images/icons/left-arrow.svg'} alt="left-arrow" />
            </IconButton>
            <Button className="selectedDate">Default</Button>

            <IconButton size="medium" className="nextPrevIcon">
              <img src={'/images/icons/right-arrow.svg'} alt="right-arrow" />
            </IconButton>
          </Box>
        </Box>
      </ToolBox2>
    </Box>
  );
});

CustomToolbar.displayName = 'CustomToolbar';

export default CustomToolbar;
