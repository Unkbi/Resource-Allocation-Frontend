'use client';

import { Box, Typography, Button, IconButton, Skeleton } from '@mui/material';
import ActualTable from '@/app/components/Actuals/ActualTable';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  CONFIRM_ACTUAL_ALLOCATIONS,
  GET_ACTUAL_ALLOCATIONS,
} from '@/app/redux/actions/actualAllocationsActions';
import { AppDispatch, RootState } from '@/app/redux/store';
import { useSelector } from 'react-redux';
import { ActualAllocations, ActualAllocationTableRow } from '@/app/types';
import {
  formateToFloat,
  generateDateWeekMath,
  getSundayOfISO,
  getUserIdFromEmail,
  isCurrentWeek,
} from '@/app/utils/common';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import {
  setActualAllocationsStatus,
  setCalendarDate,
} from '@/app/redux/reducers/actualAllocationsReducer';
// @ts-ignore
import { parseISO } from 'date-fns';
import { useGridApiRef } from '@mui/x-data-grid-premium';
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import { showToast } from '@/app/redux/reducers/toastReducer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ConfirmDialog from '@/app/components/Dialog/ConfirmDialog';
import { getUserAttributes } from '@/app/utils/authUtils';

export default function ActualsPage() {
  const dispatch: AppDispatch = useDispatch();
  const { actualAllocations, status, calendarDate, dataProcessing } =
    useSelector((state: RootState) => state.actualAllocations);
  const { startDate, endDate } = calendarDate || {};
  const { user } = useSelector((state: RootState) => state.user);
  // @ts-ignore
  const { email = '' } = getUserAttributes(user, []) || {};
  const { resources } = useSelector((state: RootState) => state.resources);
  const { projects } = useSelector((state: RootState) => state.projects);
  const [formattedActualAllocations, setFormattedActualAllocations] = useState<
    ActualAllocationTableRow[]
  >([]);
  const apiRef = useGridApiRef();
  const [hasInvalidRows, setHasInvalidRows] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogSource, setDialogSource] = useState<'prev' | 'next' | null>(
    null
  );
  const [show, setShow] = useState(true);
  const [isModified, setIsModified] = useState(false);
  const [confirmSignal, setConfirmSignal] = useState(0);

  const handleModificationChange = (modified: boolean) => {
    setShow(false);
    setIsModified(modified);
  };

  const handleValidationChange = (hasInvalid: boolean) => {
    setHasInvalidRows(hasInvalid);
  };

  const handleSetShow = (val: boolean) => {
    setShow(val);
  };

  const handleConfirmed = () => {
    if (
      projects &&
      'result' in projects &&
      resources &&
      'result' in resources &&
      user &&
      email
    ) {
      const userId = getUserIdFromEmail(
        ('result' in resources && resources?.result) || [],
        email
      );

      const allData = apiRef.current
        .getAllRowIds()
        .map(id => apiRef.current.getRow(id))
        .filter(row => row.id !== 'total' && row.project);

      // Set deleted rows, actualAllocations to 0.
      const modifiedDate = actualAllocations?.map(
        (allocations: ActualAllocations) => {
          const row = allData.find(
            tabData => tabData.project === allocations.ProjectName
          );
          if (row) {
            return {
              ...allocations,
              ActualsEntered: row.actuals,
              Notes: row.comments || '',
            };
          }
          return {
            ...allocations,
            ActualsEntered: 0,
            Notes: '',
          };
        }
      );

      const newData = allData
        .filter(
          tabData =>
            !modifiedDate?.find(
              allocations => tabData.project === allocations.ProjectName
            )
        )
        .map(tabData => ({
          Project: projects?.result?.find(
            (project: any) => project.Name === tabData.project
          )?.Id,
          ActualsEntered: formateToFloat(tabData.actuals),
          Notes: tabData.comments || '',
        }));

      const payload = {
        resource: userId,
        period: startDate,
        status: 'Confirmed',
        actuals: [
          ...newData,
          ...(modifiedDate?.map((row: ActualAllocations) => ({
            Project: row.Project,
            ActualsEntered: formateToFloat(row.ActualsEntered),
            Notes: row.Notes || '',
          })) || []),
        ],
      };

      if (isModified && !hasInvalidRows) {
        new Promise((resolve, reject) => {
          dispatch({
            type: CONFIRM_ACTUAL_ALLOCATIONS,
            payload: { ...payload, resolve, reject },
          });
        })
          .then((response: any) => {
            if (status !== 'Confirmed') {
              dispatch(setActualAllocationsStatus('Confirmed'));
            }
            if (response?.status === 'ok') {
              setIsModified(false);
              setHasInvalidRows(false);
              setConfirmSignal(c => c + 1);
              dispatch(
                showToast({
                  open: true,
                  message: 'Success. Thank you! Successfully updated Actuals!',
                  type: 'success',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
            }
          })
          .catch((error: any) => {
            console.error('Error confirming actual allocations:', error);
            dispatch(
              showToast({
                open: true,
                message: `Failed to confirm Actual alloctions.`,
                type: 'error',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
          });
      } else {
        dispatch(
          showToast({
            open: true,
            message: hasInvalidRows
              ? 'Must fill required fields.'
              : 'No changes present to confirm.',
            type: hasInvalidRows ? 'error' : 'info',
            position: 'bottom-left',
            autoHideTimer: 4000,
          })
        );
      }
    } else {
      dispatch(
        showToast({
          open: true,
          message: `Failed to confirm Actual alloctions.`,
          type: 'error',
          position: 'bottom-left',
          autoHideTimer: 4000,
        })
      );
    }
  };

  const handleNext = () => {
    if (startDate && endDate) {
      setHasInvalidRows(false);
      setShow(true);
      dispatch(
        setCalendarDate({
          startDate: generateDateWeekMath('WEEK_PLUS', 1, parseISO(startDate)),
          endDate: getSundayOfISO(
            generateDateWeekMath('WEEK_PLUS', 1, parseISO(endDate))
          ),
        })
      );
    }
  };

  const handlePrev = () => {
    if (startDate && endDate) {
      setHasInvalidRows(false);
      setShow(true);
      dispatch(
        setCalendarDate({
          startDate: generateDateWeekMath('WEEK_MINUS', 1, parseISO(startDate)),
          endDate: getSundayOfISO(
            generateDateWeekMath('WEEK_MINUS', 1, parseISO(endDate))
          ),
        })
      );
    }
  };

  useEffect(() => {
    if (resources && 'result' in resources && user && email) {
      const userId = getUserIdFromEmail(
        ('result' in resources && resources?.result) || [],
        email
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
  }, [resources, user, email, startDate, endDate]);

  useEffect(() => {
    if (actualAllocations) {
      const formattedData: ActualAllocationTableRow[] = actualAllocations
        .filter(
          (alloc: ActualAllocations) =>
            (alloc.AllocationEntered && alloc.AllocationEntered > 0) ||
            (alloc.ActualsEntered && alloc.ActualsEntered > 0)
        )
        .map((allocation: ActualAllocations, index: number) => ({
          id:
            allocation.Id ||
            `${allocation.Resource}${allocation.Project}${index}`,
          project: allocation.ProjectName,
          planned: allocation.AllocationEntered,
          actuals: allocation.ActualsEntered,
          comments: allocation.Notes,
        }));
      setFormattedActualAllocations(formattedData);
    }
  }, [actualAllocations]);

  useEffect(() => {
    // @ts-ignore
    if (!resources?.result?.length) {
      dispatch(fetchAllResources());
    }
    if (!projects?.result?.length) {
      dispatch(fetchAllProjects());
    }
  }, []);

  const handleConfirm = () => {
    setDeleteDialogOpen(false);
    if (dialogSource === 'prev') {
      handlePrev();
    } else if (dialogSource === 'next') {
      handleNext();
    }
    setDialogSource(null);
  };

  const handleCancel = () => {
    setDeleteDialogOpen(false);
    setDialogSource(null);
  };

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (isModified) {
        e.preventDefault();
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isModified]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
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
          Confirm your actual effort against the pre-filled planned allocation
          values.
        </Typography>

        <Box
          className="tableWithArrow"
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <Box mx={2} maxWidth={580} minHeight={350} width={530}>
            <Typography
              style={{ fontWeight: 700, fontSize: '14px', marginBottom: '8px' }}
            >
              Current Status :{' '}
              {dataProcessing ? (
                <Skeleton
                  variant="text"
                  sx={{
                    display: 'inline-block',
                    width: '80px',
                    height: '21px',
                    marginLeft: '4px',
                    verticalAlign: 'middle',
                  }}
                />
              ) : (
                <span
                  style={{
                    color: status === 'Confirmed' ? '#198F35' : '#FF7912',
                  }}
                >
                  {status === 'Confirmed' ? status : 'Proposed'}
                </span>
              )}
            </Typography>
            <ActualTable
              data={formattedActualAllocations || []}
              dataProcessing={dataProcessing || false}
              disableView={
                status === 'Confirmed' &&
                startDate !== null &&
                !isCurrentWeek(parseISO(startDate))
              }
              startDate={startDate}
              endDate={endDate}
              apiRef={apiRef}
              onValidationChange={handleValidationChange}
              setShow={handleSetShow}
              onModificationChange={handleModificationChange}
              confirmSignal={confirmSignal}
            />
            <Box mt={4} width="100%">
              <Box
                sx={{
                  borderBottom: '1px solid #E0E0E0',
                }}
              />
            </Box>
            <Box display="flex" justifyContent="space-between" mt={4}>
              <Button
                startIcon={<ChevronLeftIcon />}
                onClick={() => {
                  if (isModified) {
                    setDialogSource('prev');
                    setDeleteDialogOpen(true);
                  } else {
                    handlePrev();
                  }
                }}
                sx={{
                  fontSize: '14px',
                  color: '#152e75',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '& .MuiButton-startIcon': {
                    marginRight: '0px',
                  },
                }}
                variant="text"
              >
                Prev Week
              </Button>

              <Button
                variant="contained"
                sx={{
                  // @ts-ignore
                  bgcolor: theme => theme.palette.sideBarColor.main,
                  px: 2,
                  width: '192px',
                  height: '36px',
                  borderRadius: '5px',
                }}
                disabled={
                  status !== null &&
                  startDate !== null &&
                  status !== 'Proposed' &&
                  // Enable button if it's the current week even if status is 'Confirmed'
                  !isCurrentWeek(parseISO(startDate)) &&
                  (!isModified || show || hasInvalidRows)
                }
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
                  {status === 'Confirmed' ? 'Modify' : 'Confirm'}
                </Typography>
              </Button>

              <Button
                endIcon={<ChevronRightIcon />}
                onClick={() => {
                  if (isModified) {
                    setDialogSource('next');
                    setDeleteDialogOpen(true);
                  } else {
                    handleNext();
                  }
                }}
                disabled={
                  startDate ? isCurrentWeek(parseISO(startDate)) : false
                }
                sx={{
                  color: '#152e75',
                  fontSize: '14px',
                  textTransform: 'none',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                  '& .MuiButton-endIcon': {
                    marginLeft: '0px',
                  },
                }}
                variant="text"
              >
                Next Week
              </Button>
            </Box>
          </Box>
        </Box>
        <ConfirmDialog
          open={deleteDialogOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          title="Alert"
        >
          {'Are you sure you want to leave? Your actuals will not be saved.'}
        </ConfirmDialog>
      </Box>
    </Box>
  );
}
