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
  GridToolbarFilterButton,
} from '@mui/x-data-grid';
import MyProjectIcon from '../TableIcons/MyProjectIcon';
import AllProjectIcon from '../TableIcons/AllProjectIcon';
import MyTeamsIcon from '../TableIcons/MyTeamsIcon';
import AllTeamsIcon from '../TableIcons/AllTeamsIcon';
import TooltipButton from '../Button/TooltipButton';
import CustomExport from './CustomExport';
import { generateFirstAndLastMonthYear } from '@/app/utils/common';
import { updateStartAndEndDate } from '@/app/redux/reducers/teamsReducer';
import { updateProjectStartAndEndDate } from '@/app/redux/reducers/projectsReducer';

const ToolBox1 = styled(Box)(({ theme }) => ({
  display: 'flex',
  width: '140px',
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
    //   padding: '3px 5px',
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
      width :'24px',
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
  }, '&.saveView' :{
    backgroundColor: 'rgba(242, 245, 250, 0.3)',
    // border: '1px solid #D6DCE1',
    borderRadius: '4px',
    height: '32px',
    width : '94px',
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
  '& defaultView-btn ' :{
    backgroundColor: 'rgba(242, 245, 250, 0.3)',
    // border: '1px solid #D6DCE1',
    borderRadius: '4px',
    height: '32px',
    width:'132px',
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
//   '& .test-class' :{
// display : 'flex',
//   },
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
  '& .startIcon' :{
    margin : '0px',
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
  },'&.viewOptionsMenu':{
    display: "flex",
    width: "116px",
    height: "32px",
    padding: "4px 10px",
    justifyContent:" center",
    alignItems:" center",
    gap: "6px",
    flexShrink: "0",
},
}));

const ToolbarMod = React.memo(({ setFilterButtonEl }) => {
  const dispatch = useDispatch();
  const view = useSelector(state => state.allocationView.view);
  const { calendarDate: teamsCalendar } = useSelector(state => state.teams);
  const { calendarDate: projectsCalendar } = useSelector(state => state.projects);
  let startDate, endDate;
  if (view === 'Teams') {
    startDate = teamsCalendar.startDate;
    endDate = teamsCalendar.endDate;
  } else {
    startDate = projectsCalendar.startDate;
    endDate = projectsCalendar.endDate;
  }

  const viewOptions = [
    'Teams',
    'Projects',
    // 'Organizations'
  ];
  const [active, setActive] = useState(false);

  const first = generateFirstAndLastMonthYear(startDate, 'MMM yy', true);
  const last = generateFirstAndLastMonthYear(endDate, 'MMM yy', true);

  const handleViewChange = useCallback(
    event => {
      dispatch(performChangeView(event.target.value));
    },
    [dispatch]
  );
  const handleClick = () => {
    setActive(prev => !prev);
  };

  const changeCalendarDate = (type) => {
    const isTeams = view === 'Teams';
    const isNext = type === 'next';

    const action = isTeams ? updateStartAndEndDate : updateProjectStartAndEndDate;

    const startKey = generateFirstAndLastMonthYear(isNext ? endDate : startDate, 'yyyy-MM-dd', isNext, !isNext);
    const endKey = generateFirstAndLastMonthYear(isNext ? endDate : startDate, 'yyyy-MM-dd', !isNext);

    dispatch(action({startDate: startKey, endDate: endKey}));
  };

  return (
    <Box
      display={'flex'}
      height={'60px'}
      boxShadow={'0 1px 0 0 #DDE1E4'}
      position={'relative'}
      zIndex={1}
    >
      <ToolBox1  >
        <Button className='viewOptionsMenu' sx={{ textTransform: 'none',fontWeight:'100' }}>
        <FormControl
          size="small"
          sx={{ minWidth: 100, border: 'none', boxShadow: 'none' }}
          
        >
            <Box className= "test-class" 
            sx={{
                borderRadius: "var(--borderRadius, 4px)",
                border: "1px solid rgba(28, 45, 95, 0.10)",
                background: "rgba(28, 45, 95, 0.02)",
                display :"flex",
                gap : 1,
                padding :"2px",
                height : '32px' ,
                
              '& .MuiOutlinedInput-notchedOutline': {
                border: 'none',
              },
            }}> 
            {/* <Box className = "img-class"> */}
         <img src="/images/icons/TeamsIcon.svg" alt="columns" />
         {/* </Box> */}
          <Select
            value={view || 'Teams'}
            onChange={handleViewChange}
            className="projectDropdown"
            // sx={{
            //     bordeeRadius: "var(--borderRadius, 4px)",
            //     border: "1px solid rgba(28, 45, 95, 0.10)",
            //     background: "rgba(28, 45, 95, 0.02)",
            //   '& .MuiOutlinedInput-notchedOutline': {
            //     border: 'none',
            //   },
            // }}
            defaultValue="Teams"
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
          </Box>
        </FormControl>
        </Button>
      </ToolBox1>

     
          

     <Box className = "toolbox2-parent"  sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center'}}>

      <ToolBox2  className="filterTopRow" sx={{gap: 2}}>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2}}>
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
          </Box>
         
          
         
         
        </Box>

  <Box className="filterColBlock">
        <GridToolbarFilterButton ref={setFilterButtonEl}
                      slotProps={{
                        tooltip: { title: 'Filter' },
                        button: {
                          variant: 'outlined',
                          sx: {
                            color: '#555',
                            borderColor: '#ddd',
                            padding: 0,  // Remove padding to make button width fit the icon size
                            minWidth: 'auto',  // Set min-width to auto so it adjusts to the icon
                            width: '33px',  // Make the button width auto-adjust to content
                            height: '32px',  // Ensure the height is consistent with your icons
                            display: 'flex',  // Flexbox ensures the icon and button align correctly
                            justifyContent: 'center',  // Center the icon in the button
                            alignItems: 'center',  // Vertically center the icon
                          },
                          
                          startIcon: (
                            // <Box className = "startIcon" sx={{}}>
                            <img src="/images/icons/FilterNewIcon.svg" alt="filter" height={32} width={34} />
                            // </Box>
                          ),
                        },
                      }}
                    />
                    
        <GridToolbarColumnsButton
                                  slotProps={{
                                    tooltip: { title: 'Columns' },

                                    button: {
                                      variant: 'outlined',
                                      sx: {
                                        width: '55px',  // Set width to 55px
                                        height: '32px', // Set height to 32px
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                      },
                                      startIcon: (
                                        // <img src="/images/icons/columnDown.svg" alt="columns" />
                                        <Box className = "Column-Toolbar" sx={{display:'flex',marginLeft:"12px",justifyContent:'space-evenly'}}>
                                        <img src="/images/icons/columns.svg" alt="columns" />
                                        <img src="/images/icons/downIcon.svg" alt="columns" />

                                        </Box>
                                      ),
                                    },
                                  }}
                                  
                                />
                                
                                </Box>
                                 <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                             <IconButton onClick={() => changeCalendarDate('prev')} size="medium" className="nextPrevIcon">
              <img src={'/images/icons/left-arrow.svg'} alt="left-arrow" />
            </IconButton>
            <Button className="selectedDate">{`${first} - ${last}`}</Button>

            <IconButton onClick={() => changeCalendarDate('next')} size="medium" className="nextPrevIcon">
              <img src={'/images/icons/right-arrow.svg'} alt="right-arrow" />
            </IconButton>

          <Box className="dayWeekBlock">
              <Button className="selected">Week
              <img src ={'/images/icons/downIcon.svg'} alt='down-arrow'/>
              </Button>
              
              </Box>


              {/* <Box className="dayWeekBlock"> */}
              {/* <Button className="selected">Week</Button> */}
              {/* <img src ={'/images/icons/_Button_.svg'} alt='down-arrow'/> */}
              {/* </Box> */}
          </Box>
          

          <Box className="defaultView-btn">
              <Button className="selected"><img src={'/images/icons/Frame8.svg'} alt="default view"  height={28} width={120}/></Button>
              
             
          </Box>

          <Box className="saveView" sx={{marginLeft:'0px',paddingLeft:"0px",}}>
              <Button className="selected"><img src={'/images/icons/Frame9.svg'} alt="save-view-Button" height={28} width={120} /></Button>
             
          </Box>
                    
      </ToolBox2>

      <Box className="viewFilterBlock" sx={{padding:"0px"}}>
         
            <IconButton size="medium" className="exportIcon">
                          <img src={'/images/icons/Historyicon.svg'} alt="left-arrow"  />
                        </IconButton>
          
     {/* <CustomExport /> */}
     <IconButton size="medium" className="exportIcon">
                          <img src={'/images/icons/exporticonnew.svg'} alt="left-arrow" />
                        </IconButton>
                       
          </Box>
          </Box>  
    </Box>
  );
});

ToolbarMod.displayName = 'ToolbarMod';

export default ToolbarMod;
