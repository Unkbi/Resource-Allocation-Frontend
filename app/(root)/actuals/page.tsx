'use client';

import { Box, Typography, Button, IconButton } from '@mui/material';
import ActualTable from '@/app/components/Actuals/ActualTable';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { GET_ACTUAL_ALLOCATIONS } from '@/app/redux/actions/actualAllocationsActions';
import { AppDispatch, RootState } from '@/app/redux/store';
import { useSelector } from 'react-redux';
import { ActualAllocations, ActualAllocationTableRow } from '@/app/types';
import {
  generateDateWeekMath,
  getSundayOfISO,
  getUserIdFromEmail,
  isCurrentWeek,
} from '@/app/utils/common';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import { setCalendarDate } from '@/app/redux/reducers/actualAllocationsReducer';
// @ts-ignore
import { parseISO } from 'date-fns';

export default function ActualsPage() {
  const dispatch: AppDispatch = useDispatch();
  const { actualAllocations, calendarDate, dataProcessing } = useSelector(
    (state: RootState) => state.actualAllocations
  );
  const { startDate, endDate } = calendarDate || {};
  const { user } = useSelector((state: RootState) => state.user);
  const { resources } = useSelector((state: RootState) => state.resources);
  const [formattedActualAllocations, setFormattedActualAllocations] = useState<
    ActualAllocationTableRow[]
  >([]);
  const handleConfirmed = () => {
    alert('Confirmed!');
  };

  const handleNext = () => {
    dispatch(
      setCalendarDate({
        startDate: generateDateWeekMath('WEEK_PLUS', 1, parseISO(startDate)),
        endDate: getSundayOfISO(
          generateDateWeekMath('WEEK_PLUS', 1, parseISO(endDate))
        ),
      })
    );
  };

  const handlePrev = () => {
    dispatch(
      setCalendarDate({
        startDate: generateDateWeekMath('WEEK_MINUS', 1, parseISO(startDate)),
        endDate: getSundayOfISO(
          generateDateWeekMath('WEEK_MINUS', 1, parseISO(endDate))
        ),
      })
    );
  };

  useEffect(() => {
    if (resources.length === 0) {
    }
    if (resources && 'result' in resources && user && 'Email' in user) {
      const userId = getUserIdFromEmail(
        ('result' in resources && resources?.result) || [],
        // @ts-ignore
        ('Email' in user && user?.Email) || ''
      );
      dispatch({
        type: GET_ACTUAL_ALLOCATIONS,
        payload: {
          resource: userId,
          startDate: startDate,
          endDate: endDate,
        },
      });
    }
  }, [resources, user, startDate, endDate]);

  useEffect(() => {
    if (actualAllocations) {
      const formattedData: ActualAllocationTableRow[] = actualAllocations.map(
        (allocation: ActualAllocations, index: number) => ({
          id:
            allocation.Id ||
            `${allocation.Resource}${allocation.Project}${index}`,
          project: allocation.ProjectName,
          planned: allocation.AllocationEntered,
          actuals: allocation.ActualsEntered,
          comments: allocation.Notes,
        })
      );
      setFormattedActualAllocations(formattedData);
    }
  }, [actualAllocations]);

  useEffect(() => {
    // @ts-ignore
    if (!resources?.result?.length) {
      dispatch(fetchAllResources());
    }
  }, []);

  return (
    <Box
      px={{ xs: 2, sm: 2 }}
      py={2}
      height="100%"
      sx={{
        maxWidth: '100vw',
        boxSizing: 'border-box',
      }}
    >
      <Typography
        variant="body1"
        mb={2}
        sx={{ textAlign: 'left', fontSize: '14px' }}
      >
        It’s time to wrap up this week! Did you stick to your planned
        allocation?
      </Typography>

      <Box
        className="tableWithArrow"
        display="flex"
        alignItems="center"
        justifyContent="center"
      >
        <IconButton sx={{ borderRadius: '4px' }} onClick={handlePrev}>
          <img
            src="images/icons/leftArrow.svg"
            alt="Left Arrow"
            width={46}
            height={46}
          />
        </IconButton>
        <Box mx={2} maxWidth={580} minHeight={350} width={530}>
          <ActualTable
            data={formattedActualAllocations || []}
            dataProcessing={
              (dataProcessing && actualAllocations?.length === 0) || false
            }
            startDate={startDate}
            endDate={endDate}
          />
          <Box display="flex" justifyContent="flex-end">
            <Button
              variant="contained"
              sx={{
                bgcolor: '#1C2D5F',
                px: 2,
                width: '192px',
                height: '36px',
                borderRadius: '5px',
              }}
              onClick={handleConfirmed}
            >
              <Typography
                sx={{
                  color: '#FFF',
                  textAlign: 'center',
                  fontFamily: 'Open Sans',
                  fontSize: 14,
                  fontWeight: 600,
                  textTransform: 'none',
                }}
              >
                Confirm
              </Typography>
            </Button>
          </Box>
        </Box>
        <IconButton
          sx={{ borderRadius: '4px' }}
          onClick={handleNext}
          disabled={isCurrentWeek(parseISO(startDate))}
        >
          <img
            src="images/icons/rightArrow.svg"
            alt="Left Arrow"
            width={48}
            height={48}
          />
        </IconButton>
      </Box>
    </Box>
  );
}
