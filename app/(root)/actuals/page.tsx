'use client';

import { Box, Typography, Button, Skeleton, Link } from '@mui/material';
import ActualTable from '@/app/components/Actuals/ActualTable';
import { useEffect, useMemo, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  CONFIRM_ACTUAL_ALLOCATIONS,
  GET_ACTUAL_ALLOCATIONS,
  GET_ACTUAL_ALLOCATIONS_STATUSES,
  GET_ACTUAL_STATUS,
} from '@/app/redux/actions/actualAllocationsActions';
import { AppDispatch, RootState } from '@/app/redux/store';
import { useSelector } from 'react-redux';
import {
  ActualAllocations,
  ActualAllocationTableRow,
  Resource,
  Team,
} from '@/app/types';
import {
  formateToFloat,
  generateDateWeekMath,
  getFridayOfISO,
  getMondayOfISO,
  getSundayOfISO,
  getTeamForResource,
  getUserIdFromEmail,
  isCurrentWeek,
  isFutureWeek,
} from '@/app/utils/common';
import {
  setActualAllocationsStatus,
  setCalendarDate,
} from '@/app/redux/reducers/actualAllocationsReducer';
// @ts-ignore
import { format, parseISO, startOfWeek } from 'date-fns';
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
import {
  DATE_FORMAT,
  MISSING_PROJECT_ACTUALS_STATUS,
  TOTAL_ACTUALS_LESS_THAN_ONE,
} from '@/app/constants/constants';
import ActualsCard from '@/app/components/Actuals/ActualsCard';

interface ActualsPageProps {
  permissions: Record<string, CrudPermissions>;
  loadingPermissions: boolean;
}

function ActualsPage({ permissions, loadingPermissions }: ActualsPageProps) {
  const dispatch: AppDispatch = useDispatch();
  const {
    actualAllocations,
    actualAllocationsStatuses,
    status,
    calendarDate,
    dataProcessing,
    actualAllocationsStatusesLoading,
    actualsStatusLoading,
  } = useSelector((state: RootState) => state.actualAllocations);
  const { startDate, endDate } = calendarDate || {};
  const { user } = useSelector((state: RootState) => state.user);
  // @ts-ignore
  const {
    email = '',
    firstName = '',
    lastName = '',
  } = getLoginUserDetails(user) || {};
  const { resources } = useSelector((state: RootState) => state.resources);
  const { teams, teamsResources } = useSelector(
    (state: RootState) => state.teams
  );
  const { loading: resourcesLoading } = useSelector(
    (state: RootState) => state.allResourcesDetail
  );
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
    Record<string, { planned: boolean; actuals: boolean; comments: boolean }>
  >({});
  const apiRef = useGridApiRef();
  const [hasInvalidRows, setHasInvalidRows] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [dialogSource, setDialogSource] = useState<'prev' | 'next' | null>(
    null
  );
  const [showAlertDialog, setShowAlertDialog] = useState<string[] | null>(null);
  const [show, setShow] = useState(true);
  const [isModified, setIsModified] = useState(false);
  const [confirmSignal, setConfirmSignal] = useState(0);
  const [disableView, setDisableView] = useState(false);
  const router = useRouter();
  const params = useSearchParams();
  const paramsStartDate = params.get('startDate');
  const paramsEndDate = params.get('endDate');
  const [showNoActualsAvailable, setShowNoActualsAvailable] = useState(false);
  const [showNoActualsTracked, setShowNoActualsTracked] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [loadingName, setLoadingName] = useState(true);

  let max_allocation_error = scalarSettings?.Max_Allocation_Error || '2.0';
  let max_allocation_warning = scalarSettings?.Max_Allocation_Warning || '1.5';

  const handleModificationChange = (modified: boolean) => {
    setShow(false);
    setIsModified(modified);
  };

  const actualsErrorType = showNoActualsAvailable
    ? 'noActualsAvailable'
    : showNoActualsTracked
      ? 'noActualsTracked'
      : null;

  const userId = getUserIdFromEmail(resources || [], email);
  const currentResource: Resource | undefined = resources?.find(
    (r: Resource) => r?.Id === userId
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      if (firstName || lastName) {
        setDisplayName(`${firstName ?? ''} ${lastName ?? ''}`.trim());
      } else {
        setDisplayName('User');
      }
      setLoadingName(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, [user]);

  const userTitle = currentResource
    ? ((currentResource as Resource)?.Role ?? '--')
    : '--';
  const userTeam = currentResource
    ? (
        getTeamForResource(
          (currentResource as Resource)?.Id,
          teams,
          teamsResources
        ) as Team
      )?.Name
    : '--';

  const ValidResourceStartDate = currentResource
    ? (currentResource as Resource)?.StartDate
    : null;

  const ValidResourceEndDate = currentResource
    ? (currentResource as Resource)?.EndDate
    : null;

  const resourceValidStartDate = ValidResourceStartDate
    ? parseISO(ValidResourceStartDate)
    : null;

  const resourceValidEndDate = ValidResourceEndDate
    ? parseISO(ValidResourceEndDate)
    : null;

  const resourceStartMonday = resourceValidStartDate
    ? startOfWeek(resourceValidStartDate, { weekStartsOn: 1 })
    : null;

  const resourceEndMonday = resourceValidEndDate
    ? startOfWeek(resourceValidEndDate, { weekStartsOn: 1 })
    : null;

  const currentViewMonday = startDate
    ? startOfWeek(parseISO(startDate), { weekStartsOn: 1 })
    : null;

  const disablePrev =
    currentViewMonday && resourceStartMonday
      ? currentViewMonday <= resourceStartMonday
      : false;

  const disableNext =
    currentViewMonday && resourceEndMonday
      ? currentViewMonday >= resourceEndMonday
      : false;

  const handleValidationChange = (hasInvalid: boolean) => {
    setHasInvalidRows(hasInvalid);
  };

  const handleSetShow = (val: boolean) => {
    setShow(val);
  };

  const updatePlannedAllocationsIfNeeded = () => {
    const allRows = apiRef.current
      .getAllRowIds()
      .map(id => apiRef.current.getRow(id));

    // If there are validation errors, block the update
    if (Object.keys(rowValidationErrors || {}).length > 0) {
      dispatch(showToastAction(true, 'Must fill required fields.', 'error'));
      return;
    }

    const modifiedPlannedAllocations = actualAllocations?.[startDate || '']
      ?.map((allocation: ActualAllocations) => {
        const row = allRows.find(
          r => r.id === allocation.Id
        ) as ActualAllocationTableRow;
        if (
          row &&
          (allocation.AllocationEntered !== row.planned ||
            allocation.Notes !== row.comments)
        ) {
          return {
            ...allocation,
            AllocationEntered: row.planned ?? 0,
            Notes: row.comments,
          };
        }
      })
      .filter(allocation => allocation !== undefined);

    // Include new rows (upsert) - rows that don't have a matching allocation Id
    const existingIds = new Set(
      (actualAllocations?.[startDate || ''] || []).map(a => a.Id)
    );
    const newRows = allRows
      .filter(r => r && r.project && !existingIds.has(r.id))
      .map(r => {
        const projectId = projects?.find((p: any) => p.Name === r.project)?.Id;
        return {
          AllocationEntered: r.planned ?? 0,
          Period: startDate,
          Project: projectId || null,
          ProjectName: r.project,
          Resource: userId,
          Notes: r.comments || '',
        } as any;
      });

    const allocList = [
      ...(modifiedPlannedAllocations?.map(allocation => ({
        AllocationEntered: allocation.AllocationEntered,
        Id: allocation.Id,
        Period: allocation.Period,
        Project: allocation.Project,
        ProjectName: allocation.ProjectName,
        Resource: allocation.Resource,
        Notes: allocation.Notes,
      })) || []),
      ...newRows,
    ];
    if (allocList && allocList.length > 0 && allocList[0].Resource) {
      if (
        allocList.some(
          alloc =>
            actualAllocations?.[startDate || ''].find(
              actualAlloc => actualAlloc.Id === alloc.Id
            )?.AllocationEntered !== alloc?.AllocationEntered &&
            (alloc.Notes === null ||
              alloc.Notes === undefined ||
              alloc.Notes === '')
        )
      ) {
        dispatch(
          showToastAction(
            true,
            `Please enter a comment(s) to Update Allocation(s).`,
            'error'
          )
        );
        return;
      }
      try {
        new Promise((resolve, reject) => {
          dispatch({
            type: 'UPDATE_BULK_ALLOCATIONS',
            payload: {
              resourceId: allocList[0].Resource,
              allocList: allocList,
              resolve,
              reject,
            },
          });
        })
          .then(res => {
            dispatch(
              showToastAction(
                true,
                `Successfully updated allocations.`,
                'success'
              )
            );

            dispatch({
              type: GET_ACTUAL_ALLOCATIONS,
              payload: {
                resource: userId,
                startDate: generateDateWeekMath(
                  'WEEK_MINUS',
                  1,
                  parseISO(startDate ?? '')
                ),
                endDate: generateDateWeekMath(
                  'WEEK_PLUS',
                  1,
                  parseISO(endDate ?? '')
                ),
              },
            });
          })
          .catch((error: any) => {
            console.error('Error updating planned allocations:', error);
            dispatch(
              showToastAction(
                true,
                error?.response?.data
                  ? error?.response?.data
                  : `Error updating planned allocation.`,
                'error'
              )
            );
          });
      } catch (error: any) {
        console.error('Error updating planned allocations:', error);
        dispatch(
          showToastAction(
            true,
            error?.response?.data
              ? error?.response?.data
              : `Error updating planned allocation.`,
            'error'
          )
        );
      }
    }
  };

  const validateDataBeforeConfirm = () => {
    if (isFutureWeek(parseISO(startDate))) {
      updatePlannedAllocationsIfNeeded();
      return;
    }
    if (isFridayOrAfterFriday) {
      const allRows = apiRef.current
        .getAllRowIds()
        .map(id => apiRef.current.getRow(id));
      const totalActuals =
        allRows.find(row => row.id === 'total')?.actuals ||
        allRows.reduce((sum, row) => sum + (row?.actuals || 0), 0);

      const rowsWithMissingStatus = allRows
        .filter(row => row.id !== 'total' && row.project)
        .filter(
          row =>
            !row.projectActualsStatus || row.projectActualsStatus === 'No Data'
        );
      if (rowsWithMissingStatus.length === 0 && totalActuals >= 1.0) {
        // No Errors
        handleConfirmed();
      }
      if (rowsWithMissingStatus.length > 0) {
        setShowAlertDialog(prev => [
          ...(prev || []),
          MISSING_PROJECT_ACTUALS_STATUS,
        ]);
      }
      if (totalActuals < 1.0) {
        setShowAlertDialog(prev => [
          ...(prev || []),
          TOTAL_ACTUALS_LESS_THAN_ONE,
        ]);
      }
    } else {
      handleConfirmed();
    }
  };

  const handleConfirmed = () => {
    if (projects && resources && user && email) {
      const userId = getUserIdFromEmail(resources || [], email);

      const allData = apiRef.current
        .getAllRowIds()
        .map(id => apiRef.current.getRow(id))
        .filter(row => row.id !== 'total' && row.project);

      if (!startDate || !actualAllocations || !actualAllocations[startDate])
        return;
      // Set deleted rows, actualAllocations to 0.
      const modifiedData = actualAllocations[startDate]?.map(
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
          actualAllocations[startDate]?.length &&
          actualAllocations[startDate]?.every(
            actualAllocation =>
              actualAllocation.Period === actualAllocations[startDate][0].Period
          ) // If Every Row has the same period.
            ? actualAllocations[startDate][0].Period
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

      if (
        (actualAllocationsStatuses?.[startDate] !== null ||
          actualAllocationsStatuses?.[startDate] !== 'In-Progress' ||
          actualAllocationsStatuses?.[startDate] !== 'Not Started' ||
          isCurrentWeek(parseISO(startDate)) ||
          isModified) &&
        !hasInvalidRows
      ) {
        new Promise((resolve, reject) => {
          dispatch({
            type: CONFIRM_ACTUAL_ALLOCATIONS,
            payload: { ...payload, resolve, reject },
          });
        })
          .then(() => {
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
            dispatch({
              type: GET_ACTUAL_ALLOCATIONS_STATUSES,
              payload: {
                resource: userId,
                startDate: generateDateWeekMath(
                  'WEEK_MINUS',
                  1,
                  parseISO(startDate ?? '')
                ),
                endDate: generateDateWeekMath(
                  'WEEK_PLUS',
                  1,
                  parseISO(endDate ?? '')
                ),
              },
            });
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

  const loading = useMemo(
    () =>
      dataProcessing ||
      actualsStatusLoading ||
      formattingActualAllocations ||
      false,
    [dataProcessing, actualsStatusLoading, formattingActualAllocations]
  );

  useEffect(() => {
    if (loadingPermissions || resourcesLoading) return;
    setShowNoActualsAvailable(false);
    setShowNoActualsTracked(false);
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
        // Redirect to current Week.
        router.replace(
          `/actuals?startDate=${getMondayOfISO(new Date().toISOString())}`
        );
        return;
      }

      // If Week from params is not accessable week for Resource, show No Actuals Available Page.
      if (resourceStartMonday && resourceEndMonday) {
        if (
          (paramsStartDate &&
            parseISO(getMondayOfISO(paramsStartDate)) < resourceStartMonday) ||
          parseISO(getMondayOfISO(paramsStartDate)) > resourceEndMonday
        ) {
          setShowNoActualsTracked(true);
          dispatch(
            setCalendarDate({
              startDate: getMondayOfISO(paramsStartDate),
              endDate: getSundayOfISO(paramsStartDate || startDate),
            })
          );
          return;
        }
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
  }, [paramsStartDate, paramsEndDate, loadingPermissions, resourcesLoading]);

  useEffect(() => {
    if (loadingPermissions || resourcesLoading) return;
    if (permissions['ActualsStatus'].r) {
      if (resources && user && email) {
        const userId = getUserIdFromEmail(resources || [], email);
        dispatch({
          type: GET_ACTUAL_ALLOCATIONS,
          payload: {
            resource: userId,
            startDate: generateDateWeekMath(
              'WEEK_MINUS',
              1,
              parseISO(startDate ?? '')
            ),
            endDate: generateDateWeekMath(
              'WEEK_PLUS',
              1,
              parseISO(endDate ?? '')
            ),
          },
        });

        let getActualsStatusStartDate =
          generateDateWeekMath('WEEK_MINUS', 7, parseISO(startDate ?? '')) ||
          '';
        if (
          resourceStartMonday &&
          resourceStartMonday > parseISO(getActualsStatusStartDate)
        ) {
          getActualsStatusStartDate = format(resourceStartMonday, DATE_FORMAT);
        }

        dispatch({
          type: GET_ACTUAL_STATUS,
          payload: {
            resource: userId,
            status: userId ? ['In-Progress', 'Not Started'] : [''],
            startDate: getActualsStatusStartDate || '',
            endDate:
              generateDateWeekMath('WEEK_MINUS', 1, parseISO(endDate ?? '')) ||
              '',
          },
        });

        dispatch({
          type: GET_ACTUAL_ALLOCATIONS_STATUSES,
          payload: {
            resource: userId,
            startDate: generateDateWeekMath(
              'WEEK_MINUS',
              1,
              parseISO(startDate ?? '')
            ),
            endDate: generateDateWeekMath(
              'WEEK_PLUS',
              1,
              parseISO(endDate ?? '')
            ),
          },
        });
      }
    }
  }, [
    resources,
    user,
    email,
    startDate,
    endDate,
    loadingPermissions,
    resourcesLoading,
  ]);

  useEffect(() => {
    if (loadingPermissions || dataProcessing) return;
    if (actualAllocations && startDate && actualAllocations[startDate]) {
      setFormattingActualAllocations(true);
      const formattedData: ActualAllocationTableRow[] = actualAllocations[
        startDate
      ]
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
    if (loadingPermissions || dataProcessing) return;
    setDisableView(
      (!permissions['ActualsStatus'].c && !permissions['ActualsStatus'].u) ||
        isFutureWeek(parseISO(startDate)) ||
        (status === 'Confirmed' &&
          startDate !== null &&
          !isCurrentWeek(parseISO(startDate)))
    );
  }, [loadingPermissions, dataProcessing, status]);

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
    // Handle future Weeks
    // 1) New rows can be added — for those rows Planned and Comments are mandatory.
    // 2) Existing rows: if planned changed then Comments are mandatory.
    if (isFutureWeek(parseISO(startDate || ''))) {
      const existingAlloc = actualAllocations?.[startDate || '']?.find(
        (alloc: ActualAllocations) => alloc.Id === newRow.id
      );
      const isNewRow = !existingAlloc;

      const plannedChanged =
        !isNewRow && newRow.planned !== existingAlloc?.AllocationEntered;

      const plannedInvalidForNew =
        isNewRow &&
        (newRow.planned === null ||
          newRow.planned === undefined ||
          newRow.planned === 0);
      const commentsInvalidForNew =
        isNewRow && (!newRow.comments || !newRow.comments.trim());
      const commentsInvalidForPlannedChange =
        plannedChanged && (!newRow.comments || !newRow.comments.trim());

      const plannedInvalid = plannedInvalidForNew;
      const commentsInvalid =
        commentsInvalidForNew || commentsInvalidForPlannedChange;

      // Planned total validation (same logic as Actuals)
      const plannedChangedOrNew = isNewRow || plannedChanged;
      if (plannedChangedOrNew) {
        const newPlanned =
          Math.round((parseFloat(newRow.planned) || 0) * 10) / 10;
        const updatedPlannedTotal = rows.reduce((sum, row) => {
          if (row.id === newRow.id) {
            return sum + newPlanned;
          }
          if (row.id !== 'total' && row.id !== 'second-total') {
            return (
              Math.round(
                (sum +
                  (row?.planned ? parseFloat(row?.planned?.toFixed(1)) : 0)) *
                  10
              ) / 10
            );
          }
          return sum;
        }, 0);

        if (updatedPlannedTotal > Number(max_allocation_error)) {
          dispatch(
            showToastAction(
              true,
              `Total of Planned cannot exceed ${max_allocation_error} (Current sum: ${updatedPlannedTotal.toFixed(1)})`,
              'error'
            )
          );
          return oldRow;
        } else if (updatedPlannedTotal >= Number(max_allocation_warning)) {
          dispatch(
            showToastAction(
              true,
              `Warning: Total planned is >= ${max_allocation_warning}, and is approaching the maximum of ${max_allocation_error}. Current sum: ${updatedPlannedTotal.toFixed(1)}`,
              'warning'
            )
          );
        }
      }

      setRowValidationErrors(prev => {
        const updated = { ...prev };
        if (plannedInvalid || commentsInvalid) {
          updated[newRow.id] = {
            planned: Boolean(plannedInvalid),
            actuals: false,
            comments: Boolean(commentsInvalid),
          };
        } else {
          delete updated[newRow.id];
        }
        return updated;
      });

      setRows(prev => {
        const existingRow = prev.find(r => r.id === newRow.id);
        if (JSON.stringify(existingRow) === JSON.stringify(newRow)) return prev;
        return prev.map(row =>
          row.id === newRow.id
            ? {
                ...row,
                ...newRow,
              }
            : row
        );
      });

      return newRow;
    }

    // Handle Past and Current Weeks, comments is required, if new row actuals row is added or if status is "At-Risk" and "Off-Track"
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
            `Warning: Total actuals >= ${max_allocation_warning}, and is approaching the maximum of ${max_allocation_error}. Current sum: ${updatedTotal.toFixed(1)}`,
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
          planned: false,
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

  // Show specific Actuals error pages when flagged
  // compute current week monday for redirect buttons

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
        {permissions['ActualsStatus'].r ? (
          <Box
            className="tableWithArrow"
            display="flex"
            alignItems="center"
            justifyContent="center"
            marginTop={5}
          >
            <Box mx={2} maxWidth={780} minHeight={350}>
              <Box>
                <Box
                  mb={0.2}
                  sx={{
                    fontFamily: 'Open Sans',
                    fontWeight: 600,
                    fontStyle: 'SemiBold',
                    fontSize: '18px',
                  }}
                >
                  {loadingName ? (
                    <Skeleton width={100} height={20} />
                  ) : (
                    `${displayName}`
                  )}
                </Box>
                <Box display="flex" gap={4} mb={2}>
                  <Typography
                    sx={{ fontFamily: 'Open Sans', fontSize: '14px' }}
                  >
                    Title:{' '}
                    {resourcesLoading ? (
                      <Skeleton
                        component="span"
                        width={120}
                        sx={{ display: 'inline-block' }}
                      />
                    ) : (
                      <Typography component="span" sx={{ fontWeight: 600 }}>
                        {userTitle}
                      </Typography>
                    )}
                  </Typography>
                  <Typography
                    sx={{ fontFamily: 'Open Sans', fontSize: '14px' }}
                  >
                    Team:{' '}
                    {resourcesLoading ? (
                      <Skeleton
                        component="span"
                        width={100}
                        sx={{ display: 'inline-block' }}
                      />
                    ) : (
                      <Typography component="span" sx={{ fontWeight: 600 }}>
                        {userTeam}
                      </Typography>
                    )}
                  </Typography>
                </Box>
              </Box>

              {/* Commenting out the older header and Important message displaying week number  */}

              {/* {actualsStatus?.length ? (
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
                )} */}
              {actualAllocations && startDate && actualAllocationsStatuses && (
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  gap={2}
                  width={'100%'}
                >
                  <ActualsCard
                    onClick={handlePrev}
                    period={
                      generateDateWeekMath(
                        'WEEK_MINUS',
                        1,
                        parseISO(startDate ?? '')
                      ) || ''
                    }
                    actualAllocationData={
                      actualAllocations[
                        generateDateWeekMath(
                          'WEEK_MINUS',
                          1,
                          parseISO(startDate ?? '')
                        ) || ''
                      ]
                    }
                    actualAllocationStatus={
                      actualAllocationsStatuses[
                        generateDateWeekMath(
                          'WEEK_MINUS',
                          1,
                          parseISO(startDate ?? '')
                        ) || ''
                      ]
                    }
                    loading={loading}
                    actualAllocationsStatusesLoading={
                      actualAllocationsStatusesLoading
                    }
                    backgroundColor="rgba(202, 213, 226, 0.2)"
                    periodPillBackgroundColor="rgba(30, 58, 139, 1)"
                    resourceStartMonday={resourceStartMonday}
                    resourceEndMonday={resourceEndMonday}
                  />
                  <ActualsCard
                    period={startDate}
                    actualAllocationData={actualAllocations[startDate]}
                    actualAllocationStatus={
                      actualAllocationsStatuses[startDate]
                    }
                    showStatus={false}
                    loading={loading}
                    actualAllocationsStatusesLoading={
                      actualAllocationsStatusesLoading
                    }
                    borderStyle={{ borderWidth: '2px', borderBottom: 'none' }}
                    resourceStartMonday={resourceStartMonday}
                    resourceEndMonday={resourceEndMonday}
                  />
                  <ActualsCard
                    onClick={handleNext}
                    period={
                      generateDateWeekMath(
                        'WEEK_PLUS',
                        1,
                        parseISO(startDate ?? '')
                      ) || ''
                    }
                    actualAllocationData={
                      actualAllocations[
                        generateDateWeekMath(
                          'WEEK_PLUS',
                          1,
                          parseISO(startDate ?? '')
                        ) || ''
                      ]
                    }
                    actualAllocationStatus={
                      actualAllocationsStatuses[
                        generateDateWeekMath(
                          'WEEK_PLUS',
                          1,
                          parseISO(startDate ?? '')
                        ) || ''
                      ]
                    }
                    loading={loading}
                    actualAllocationsStatusesLoading={
                      actualAllocationsStatusesLoading
                    }
                    backgroundColor="rgba(251, 251, 251, 1)"
                    periodPillBackgroundColor="rgba(30, 58, 139, 1)"
                    resourceStartMonday={resourceStartMonday}
                    resourceEndMonday={resourceEndMonday}
                  />
                </Box>
              )}
              <ActualTable
                data={formattedActualAllocations || []}
                currentResource={currentResource}
                dataProcessing={loading}
                rows={rows}
                setRows={setRows}
                rowValidationErrors={rowValidationErrors}
                setRowValidationErrors={setRowValidationErrors}
                disableView={disableView}
                enablePlannedColumn={isFutureWeek(parseISO(startDate || ''))}
                startDate={startDate}
                endDate={endDate}
                apiRef={apiRef}
                onValidationChange={handleValidationChange}
                setShow={handleSetShow}
                onModificationChange={handleModificationChange}
                confirmSignal={confirmSignal}
                handleProcessRowUpdate={handleProcessRowUpdate}
                formattingActualAllocations={formattingActualAllocations}
                handlePrev={handlePrev}
                handleNext={handleNext}
                isModified={isModified}
                setDialogSource={setDialogSource}
                setDeleteDialogOpen={setDeleteDialogOpen}
                actualsErrorType={actualsErrorType}
                disablePrev={disablePrev}
                disableNext={disableNext}
              />
              {!actualsErrorType && (
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
                      (startDate !== null &&
                        actualAllocationsStatuses?.[startDate] !== null &&
                        actualAllocationsStatuses?.[startDate] !==
                          'In-Progress' &&
                        actualAllocationsStatuses?.[startDate] !==
                          'Not Started' &&
                        // Enable button if it's the current week even if status is 'Confirmed'
                        !isCurrentWeek(parseISO(startDate)) &&
                        (!isModified || show || hasInvalidRows))
                    }
                    onClick={validateDataBeforeConfirm}
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
                    disabled={disableNext}
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
              )}
              {isFridayOrAfterFriday && (
                <Box display="flex" justifyContent="center" mt={1}>
                  <Typography
                    sx={{
                      color: theme => theme.palette.info.main,
                      fontWeight: '500',
                      fontStyle: 'italic',
                      fontSize: '14px',
                      leadingTrim: 'NONE',
                      lineHeight: '100%',
                      letterSpacing: '0%',
                    }}
                  >
                    <span style={{ fontWeight: '600' }}>Note</span>: Confirmed
                    Actuals from previous period cannot be modified!
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <></>
        )}
        <ConfirmDialog
          open={showAlertDialog}
          onCancel={() => setShowAlertDialog(null)}
          onConfirm={() => {
            setShowAlertDialog(null);
            handleConfirmed();
          }}
          title="Alert"
        >
          {showAlertDialog?.includes(TOTAL_ACTUALS_LESS_THAN_ONE) && (
            <>
              <span>
                {
                  'Total actuals for this week are < 1.0 FTWE (Full time weekly equivalent). Please confirm all work has been accounted for before submitting.'
                }
              </span>
              <br />
            </>
          )}
          {showAlertDialog?.includes(MISSING_PROJECT_ACTUALS_STATUS) && (
            <>
              <span>
                {
                  'One or more projects are missing a status selection. Company policy requires a status (✓, !, or ✗) selection for each row before confirming.'
                }
              </span>
              <br />
            </>
          )}
          <br />
          <span style={{ fontWeight: 'bold' }}>
            {'Do you still want to proceed with confirming your actuals?'}
          </span>
        </ConfirmDialog>
        <ConfirmDialog
          open={deleteDialogOpen}
          onConfirm={handleConfirm}
          onCancel={handleCancel}
          title="Alert"
        >
          {'Are you sure you wan\t to leave? Your actuals will not be saved.'}
        </ConfirmDialog>
      </Box>
    </Box>
  ) : (
    <ErrorPage type="accessDenied" redirectPath="/dashboard" />
  );
}

export default withRBAC(ActualsPage, ['ActualsStatus']);
