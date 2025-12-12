'use client';

import { Box, Typography, Button, Skeleton, Link } from '@mui/material';
import ActualTable from '@/app/components/Actuals/ActualTable';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  CONFIRM_ACTUAL_ALLOCATIONS,
  GET_ACTUAL_ALLOCATIONS,
  GET_ACTUAL_STATUS,
} from '@/app/redux/actions/actualAllocationsActions';
import { AppDispatch, RootState } from '@/app/redux/store';
import { useSelector } from 'react-redux';
import {
  ActualAllocations,
  ActualAllocationTableRow,
  ActualStatus,
  Resource,
} from '@/app/types';
import {
  formateToFloat,
  generateDateWeekMath,
  getFridayOfISO,
  getMondayOfISO,
  getSundayOfISO,
  getUserIdFromEmail,
  getWeekNumber,
  isCurrentWeek,
} from '@/app/utils/common';
import {
  setActualAllocationsStatus,
  setCalendarDate,
} from '@/app/redux/reducers/actualAllocationsReducer';
// @ts-ignore
import { isBefore, parseISO, startOfWeek } from 'date-fns';
import { GridValidRowModel, useGridApiRef } from '@mui/x-data-grid-premium';
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import { showToast } from '@/app/redux/reducers/toastReducer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ConfirmDialog from '@/app/components/Dialog/ConfirmDialog';
import { getLoginUserDetails } from '@/app/utils/authUtils';
import { FETCH_ALL_RESOURCES_DETAIL } from '@/app/redux/actions/allResourcesDetailAction';
import { CrudPermissions, withRBAC } from '@/app/components/HOC/withRBAC';
import { useRouter, useSearchParams } from 'next/navigation';
import LoadingScreen from '@/app/components/Loading/loadingScreen';
import ErrorPage from '@/app/components/ErrorPage/ErrorPage';
import { showToastAction } from '@/app/redux/actions/toastAction';

interface ActualsPageProps {
  permissions: Record<string, CrudPermissions>;
  loadingPermissions: boolean;
}

function ActualsPage({ permissions, loadingPermissions }: ActualsPageProps) {
  const dispatch: AppDispatch = useDispatch();
  const {
    actualAllocations,
    actualsStatus,
    status,
    calendarDate,
    dataProcessing,
    actualsStatusLoading,
  } = useSelector((state: RootState) => state.actualAllocations);
  const { startDate, endDate } = calendarDate || {};
  const { user } = useSelector((state: RootState) => state.user);
  // @ts-ignore
  const { email = '' } = getLoginUserDetails(user) || {};
  const { resources } = useSelector((state: RootState) => state.resources);
  const { projects } = useSelector((state: RootState) => state.projects);
  const { scalarSettings } = useSelector(
    (state: RootState) => state.allSettings
  );
  const [formattedActualAllocations, setFormattedActualAllocations] = useState<
    ActualAllocationTableRow[]
  >([]);
  const [formattingActualAllocations, setFormattingActualAllocations] =
    useState<boolean>(true);
  const [rows, setRows] = useState<ActualAllocationTableRow[]>([]);
  const [rowValidationErrors, setRowValidationErrors] = useState<
    Record<string, { actuals: boolean; comments: boolean }>
  >({});
  const apiRef = useGridApiRef();
  const [hasInvalidRows, setHasInvalidRows] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogSource, setDialogSource] = useState<'prev' | 'next' | null>(
    null
  );
  const [show, setShow] = useState(true);
  const [isModified, setIsModified] = useState(false);
  const [confirmSignal, setConfirmSignal] = useState(0);
  const [disableView, setDisableView] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const paramsStartDate = params.get('startDate');
  const paramsEndDate = params.get('endDate');

  let max_allocation_error = scalarSettings?.Max_Allocation_Error || '2.0';
  let max_allocation_warning = scalarSettings?.Max_Allocation_Warning || '1.5';

  const handleModificationChange = (modified: boolean) => {
    setShow(false);
    setIsModified(modified);
  };

  const userId = getUserIdFromEmail(resources || [], email);
  const currentResource: Resource[] = resources?.filter(
    (r: Resource) => r?.Id === userId
  );
  const ValidPrevDate = currentResource[0]?.StartDate;

  const resourceValidPrevDate = ValidPrevDate ? parseISO(ValidPrevDate) : null;

  const resourceStartMonday = resourceValidPrevDate
    ? startOfWeek(resourceValidPrevDate, { weekStartsOn: 1 })
    : null;

  const currentViewMonday = startDate
    ? startOfWeek(parseISO(startDate), { weekStartsOn: 1 })
    : null;

  const disablePrev =
    currentViewMonday && resourceStartMonday
      ? currentViewMonday <= resourceStartMonday
      : false;

  const handleValidationChange = (hasInvalid: boolean) => {
    setHasInvalidRows(hasInvalid);
  };

  const handleSetShow = (val: boolean) => {
    setShow(val);
  };

  const handleConfirmed = () => {
    if (projects && resources && user && email) {
      const userId = getUserIdFromEmail(resources || [], email);

      const allData = apiRef.current
        .getAllRowIds()
        .map(id => apiRef.current.getRow(id))
        .filter(row => row.id !== 'total' && row.project);

      // Set deleted rows, actualAllocations to 0.
      const modifiedData = actualAllocations?.map(
        (allocations: ActualAllocations) => {
          const row = allData.find(
            tabData => tabData.project === allocations.ProjectName
          ) as ActualAllocationTableRow;
          if (row) {
            return {
              ...allocations,
              ActualsEntered: row.actuals ?? 0,
              Notes: row.comments || '',
              ProjectActualsStatus:
                row.projectActualsStatus === 'No Data'
                  ? null
                  : row.projectActualsStatus,
            };
          }
          return {
            ...allocations,
            ActualsEntered: 0,
            Notes: '',
            ProjectActualsStatus: null,
          };
        }
      );

      const newData = allData
        .filter(
          tabData =>
            !modifiedData?.find(
              allocations => tabData.project === allocations.ProjectName
            )
        )
        .map(tabData => ({
          Project: projects?.find(
            (project: any) => project.Name === tabData.project
          )?.Id,
          ActualsEntered: formateToFloat(tabData.actuals),
          Notes: tabData.comments || '',
          ProjectActualsStatus:
            tabData.projectActualsStatus === 'No Data'
              ? null
              : tabData.projectActualsStatus,
        }));

      const payload = {
        resource: userId,
        period:
          actualAllocations?.length &&
          actualAllocations.every(
            actualAllocation =>
              actualAllocation.Period === actualAllocations[0].Period
          ) // If Every Row has the same period.
            ? actualAllocations[0].Period
            : startDate,
        status: isFridayOrAfterFriday ? 'Confirmed' : 'In-Progress',
        actuals: [
          ...newData,
          ...(modifiedData?.map((row: ActualAllocations) => ({
            Project: row.Project,
            ActualsEntered: formateToFloat(row.ActualsEntered),
            Notes: row.Notes || '',
            ProjectActualsStatus: row.ProjectActualsStatus,
          })) || []),
        ],
      };

      if ((!isFridayOrAfterFriday || isModified) && !hasInvalidRows) {
        new Promise((resolve, reject) => {
          dispatch({
            type: CONFIRM_ACTUAL_ALLOCATIONS,
            payload: { ...payload, resolve, reject },
          });
        })
          .then(() => {
            dispatch(
              setActualAllocationsStatus(
                isFridayOrAfterFriday ? 'Confirmed' : 'In-Progress'
              )
            );
            setIsModified(false);
            setHasInvalidRows(false);
            setConfirmSignal(c => c + 1);
            dispatch(
              showToast({
                open: true,
                message: 'Success. Thank you! Successfully Saved Actuals!',
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
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
    if (startDate) {
      setHasInvalidRows(false);
      setShow(true);
      setFormattedActualAllocations([]);
      setFormattingActualAllocations(true);
      router.replace(
        `/actuals?startDate=${generateDateWeekMath(
          'WEEK_PLUS',
          1,
          parseISO(startDate)
        )}`
      );
    }
  };

  const handlePrev = () => {
    if (startDate && endDate) {
      setHasInvalidRows(false);
      setShow(true);
      setFormattedActualAllocations([]);
      setFormattingActualAllocations(true);
      router.replace(
        `/actuals?startDate=${generateDateWeekMath(
          'WEEK_MINUS',
          1,
          parseISO(startDate)
        )}`
      );
    }
  };

  const handlePeriodChange = (date: string) => {
    if (!date) return;
    setHasInvalidRows(false);
    setShow(true);
    setFormattedActualAllocations([]);
    setFormattingActualAllocations(true);
    router.replace(`/actuals?startDate=${date}`);
  };

  useEffect(() => {
    if (loadingPermissions) return;
    if (permissions['ActualsStatus'].r) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      // If no Params, set to Monday of current Week.
      if (!paramsStartDate) {
        if (startDate) {
          router.replace(`/actuals?startDate=${startDate}`);
        }
        return;
      }

      // Validate paramsStartDate and paramsEndDate are in "YYYY-MM-DD" format
      if (paramsStartDate && !dateRegex.test(paramsStartDate)) {
        router.replace(
          `/actuals?startDate=${getMondayOfISO(new Date().toISOString())}`
        );
        return;
      }

      // If paramsStartDate for any day greater than today, set to Monday of current Week.
      if (
        parseISO(paramsStartDate) >
        parseISO(getMondayOfISO(new Date().toISOString()))
      ) {
        router.replace(
          `/actuals?startDate=${getMondayOfISO(new Date().toISOString())}`
        );
        return;
      }

      // If paramsStartDate is not the Monday of the week, set to Monday of that Week.
      if (
        parseISO(paramsStartDate) > parseISO(getMondayOfISO(paramsStartDate))
      ) {
        router.replace(`/actuals?startDate=${getMondayOfISO(paramsStartDate)}`);
        return;
      }

      dispatch(
        setCalendarDate({
          startDate: getMondayOfISO(paramsStartDate),
          endDate: getSundayOfISO(paramsStartDate || startDate),
        })
      );
    }
  }, [paramsStartDate, paramsEndDate, loadingPermissions]);

  useEffect(() => {
    if (loadingPermissions) return;
    if (permissions['ActualsStatus'].r) {
      if (resources && user && email) {
        const userId = getUserIdFromEmail(resources || [], email);
        dispatch({
          type: GET_ACTUAL_ALLOCATIONS,
          payload: {
            resource: userId,
            startDate: startDate,
            endDate: endDate,
          },
        });
        dispatch({
          type: GET_ACTUAL_STATUS,
          payload: {
            resource: userId,
            status: userId ? ['In-Progress', 'Not Started'] : [''],
            startDate:
              generateDateWeekMath(
                'WEEK_MINUS',
                7,
                parseISO(startDate ?? '')
              ) || '',
            endDate:
              generateDateWeekMath('WEEK_MINUS', 2, parseISO(endDate ?? '')) ||
              '',
          },
        });
      }
    }
  }, [resources, user, email, startDate, endDate, loadingPermissions]);

  useEffect(() => {
    if (loadingPermissions || dataProcessing) return;
    if (actualAllocations) {
      setFormattingActualAllocations(true);
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
          projectActualsStatus: allocation.ProjectActualsStatus ?? 'No Data',
        }));
      setFormattedActualAllocations(formattedData);
    }
  }, [loadingPermissions, dataProcessing, actualAllocations]);

  useEffect(() => {
    if (loadingPermissions || dataProcessing) return;
    if (formattedActualAllocations.length) {
      setFormattingActualAllocations(false);
    } else {
      const timeout = setTimeout(() => {
        setFormattingActualAllocations(false);
      }, 4000);
      return () => clearTimeout(timeout);
    }
  }, [loadingPermissions, dataProcessing, formattedActualAllocations]);

  useEffect(() => {
    if (loadingPermissions) return;
    setDisableView(
      (!permissions['ActualsStatus'].c && !permissions['ActualsStatus'].u) ||
        (status === 'Confirmed' &&
          startDate !== null &&
          !isCurrentWeek(parseISO(startDate)))
    );
  }, [loadingPermissions, status]);

  useEffect(() => {
    if (loadingPermissions) return;
    if (permissions['ActualsStatus'].r) {
      setFormattingActualAllocations(true);
      // @ts-ignore
      if (!resources?.length) {
        dispatch({ type: FETCH_ALL_RESOURCES_DETAIL, payload: {} });
      }
      if (!projects?.length) {
        dispatch(fetchAllProjects());
      }
    }
  }, [loadingPermissions]);

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

  const handleProcessRowUpdate = (
    newRow: GridValidRowModel,
    oldRow: GridValidRowModel
  ) => {
    if (newRow.id === 'total' || newRow.id === 'second-total') {
      return oldRow;
    }
    const actualsChanged = newRow.actuals !== oldRow.actuals;
    let newActual = parseFloat(newRow.actuals) || 0;
    if (actualsChanged) {
      newActual = Math.round(newActual * 10) / 10;
      const updatedTotal = rows.reduce((sum, row) => {
        if (row.id === newRow.id) {
          return sum + newActual;
        }
        if (row.id !== 'total' && row.id !== 'second-total') {
          return (
            Math.round(
              (sum +
                (row?.actuals ? parseFloat(row?.actuals?.toFixed(1)) : 0)) *
                10
            ) / 10
          );
        }
        return sum;
      }, 0);

      if (updatedTotal > Number(max_allocation_error)) {
        dispatch(
          showToastAction(
            true,
            `Total of Actuals cannot exceed ${max_allocation_error} (Current sum: ${updatedTotal.toFixed(1)})`,
            'error'
          )
        );
        return oldRow;
      } else if (updatedTotal >= Number(max_allocation_warning)) {
        dispatch(
          showToastAction(
            true,
            `Warning: Total actuals is approaching the maximum of ${max_allocation_warning}. Current sum: ${updatedTotal.toFixed(1)}`,
            'warning'
          )
        );
      }
    }

    setRows(prev => {
      const existingRow = prev.find(r => r.id === newRow.id);
      if (JSON.stringify(existingRow) === JSON.stringify(newRow)) return prev;
      return prev.map(row =>
        row.id === newRow.id
          ? {
              ...row,
              ...newRow,
              actuals: actualsChanged ? newActual : row.actuals,
            }
          : row
      );
    });

    // Validation logic for comments
    const isUnplannedProject =
      newRow.planned === 0 &&
      newRow.project !== 'Other Work' &&
      newRow.project !== 'Personal Time';

    const actualsInvalid =
      (isUnplannedProject ||
        newRow.project === 'Other Work' ||
        newRow.project === 'Personal Time') &&
      (!newRow.actuals || newRow.actuals === 0);
    const commentsInvalid =
      ((isUnplannedProject ||
        newRow.project === 'Other Work' ||
        newRow.project === 'Personal Time') &&
        (!newRow.comments || !newRow.comments.trim())) ||
      ((newRow.projectActualsStatus === 'At Risk' ||
        newRow.projectActualsStatus === 'Off Track') &&
        (!newRow.comments || !newRow.comments.trim()));

    setRowValidationErrors(prev => {
      const updated = { ...prev };

      if (actualsInvalid || commentsInvalid) {
        // Only update if there are errors
        updated[newRow.id] = {
          actuals: actualsInvalid,
          comments: commentsInvalid,
        };
      } else {
        // Remove the row from validation errors if both fields are valid
        delete updated[newRow.id];
      }

      return updated;
    });

    return { ...newRow, actuals: actualsChanged ? newActual : newRow.actuals };
  };

  const handleCopyToActuals = () => {
    apiRef.current
      .getAllRowIds()
      .map(id => apiRef.current.getRow(id))
      .filter(row => row.id !== 'total' && row.project)
      .forEach(row =>
        handleProcessRowUpdate(
          {
            ...row,
            actuals: row.planned,
            projectActualsStatus:
              !row.projectActualsStatus ||
              row.projectActualsStatus === 'No Data'
                ? 'On Track'
                : row.projectActualsStatus,
          },
          row
        )
      );
  };

  const validEndDate: string = endDate ?? '';
  const isFridayOrAfterFriday = validEndDate
    ? new Date() >= parseISO(getFridayOfISO(validEndDate))
    : false;

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

  return loadingPermissions ? (
    <LoadingScreen />
  ) : permissions['ActualsStatus'].r ? (
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

        {permissions['ActualsStatus'].r ? (
          <Box
            className="tableWithArrow"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <Box mx={2} maxWidth={780} minHeight={350}>
              {actualsStatus?.length ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    alignItems: 'center',
                    fontSize: '14px',
                  }}
                >
                  <Typography
                    variant="h5"
                    sx={{ fontWeight: 700, fontSize: '14px', color: '#B91C1C' }}
                  >
                    {' '}
                    IMPORTANT!{' '}
                  </Typography>
                  <Typography sx={{ fontSize: '14px' }}>
                    You still have pending actuals for,
                  </Typography>
                  <Box
                    sx={{
                      textWrap: 'wrap',
                      display: 'flex',
                      width: '200px',
                      ml: 1,
                      gap: 0.5,
                    }}
                  >
                    {actualsStatus && actualsStatus.length > 0 ? (
                      actualsStatus.map((statusItem: ActualStatus) => (
                        <Link
                          key={statusItem.Period}
                          onClick={() => handlePeriodChange(statusItem.Period)}
                          sx={{
                            fontFamily: 'Inter',
                            fontWeight: 600,
                            fontStyle: 'Medium',
                            fontSize: '13.6px',
                            lineHeight: '24px',
                            textAlign: 'center',
                            textDecoration: 'underline',
                            textDecorationStyle: 'solid',
                            color: '#2563EB',
                            cursor: 'pointer',
                          }}
                        >
                          {getWeekNumber(parseISO(statusItem.Period))}
                        </Link>
                      ))
                    ) : (
                      <></>
                    )}
                  </Box>
                </Box>
              ) : (
                <></>
              )}
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <Typography
                  style={{
                    fontWeight: 700,
                    fontSize: '14px',
                  }}
                >
                  Current Status :{' '}
                  {actualsStatusLoading ||
                  dataProcessing ||
                  formattingActualAllocations ? (
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
                      {status ?? 'Not Started'}
                    </span>
                  )}
                </Typography>
                <Link
                  onClick={() => !disableView && handleCopyToActuals()}
                  sx={{ cursor: disableView ? 'not-allowed' : 'pointer' }}
                >
                  <Typography
                    sx={{
                      fontWeight: 500,
                      fontStyle: 'Medium',
                      fontSize: '13.6px',
                      lineHeight: '24px',
                      letterSpacing: '0%',
                      textAlign: 'center',
                      verticalAlign: 'middle',
                      textDecoration: 'underline',
                      textDecorationStyle: 'solid',
                      textDecorationOffset: '0%',
                      textDecorationThickness: '0%',
                      color: disableView ? 'rgba(37, 99, 235, 0.5)' : '#2563EB',
                    }}
                  >
                    Copy Plan to Actuals
                  </Typography>
                </Link>
              </Box>
              <ActualTable
                data={formattedActualAllocations || []}
                dataProcessing={
                  dataProcessing ||
                  actualsStatusLoading ||
                  formattingActualAllocations ||
                  false
                }
                rows={rows}
                setRows={setRows}
                rowValidationErrors={rowValidationErrors}
                setRowValidationErrors={setRowValidationErrors}
                disableView={disableView}
                startDate={startDate}
                endDate={endDate}
                apiRef={apiRef}
                onValidationChange={handleValidationChange}
                setShow={handleSetShow}
                onModificationChange={handleModificationChange}
                confirmSignal={confirmSignal}
                handleProcessRowUpdate={handleProcessRowUpdate}
              />
              <Box display="flex" justifyContent="space-between" mt={1}>
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
                  disabled={disablePrev}
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
                    (!permissions['ActualsStatus'].c &&
                      !permissions['ActualsStatus'].u) ||
                    loadingPermissions ||
                    dataProcessing ||
                    formattingActualAllocations ||
                    (status !== null &&
                      startDate !== null &&
                      status !== 'In-Progress' &&
                      status !== 'Not Started' &&
                      // Enable button if it's the current week even if status is 'Confirmed'
                      !isCurrentWeek(parseISO(startDate)) &&
                      (!isModified || show || hasInvalidRows))
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
                    {isFridayOrAfterFriday ? 'Save and Confirm' : 'Save'}
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
        ) : (
          <></>
        )}
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
  ) : (
    <ErrorPage type="accessDenied" redirectPath="/dashboard" />
  );
}

export default withRBAC(ActualsPage, ['ActualsStatus']);
