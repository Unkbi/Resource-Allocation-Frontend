'use client';

import { useEffect, useState } from 'react';
import { Formik, ErrorMessage } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from '../../Dialog/CustomDialog';
import AddProjectForm from '../../Forms/AddProjectForm';
import AddResourceForm from '../../Forms/AddResourceForm';
import AddAllocationForm from '../../Forms/AddAllocationForm';
import AssignAllocationForm from '../../Forms/AssignAllocationForm';
import SaveViewForm from '../../Forms/SaveViewForm';
import CloneResourceForm from '../../Forms/CloneResourceForm';
import TransferResourceForm from '../../Forms/TransferResourceForm';
import {
  addAllocationValidationSchema,
  addProjectValidationSchema,
  addResourceValidationSchema,
  assignAllocationValidationSchema,
  nameViewValidationSchema,
  saveViewValidationSchema,
  cloneResourceValidationSchema,
  transferResourceValidationSchema,
} from '../../Forms/ValidationSchema';
import { addProject, updateProject } from '@/app/services/projectServices';
import {
  closeDialog,
  updateDialogData,
} from '@/app/redux/reducers/dialogReducer';
import {
  generateAllMondays,
  getUserIdFromEmail,
  getWeekNumber,
  getTotalWeeklyAllocation,
} from '@/app/utils/common';
import {
  setResourceAllocation,
  updateResourceAllocation,
  removeResourceAllocation,
  updateResourceBulkAllocation,
  removeResourceBulkAllocation,
} from '@/app/redux/actions/resourceAllocationAction';
import { fetchResourcesAgainstTeams } from '@/app/redux/actions/fetchTeamsAction';
import {
  setCellSelectionData,
  setExpandRowId,
  setSplitView,
  setSplitViewCurrentProject,
} from '@/app/redux/reducers/allocationViewReducer';
import { Box, Typography } from '@mui/material';
import { fetchAllProjectAllocations } from '@/app/redux/actions/fetchProjectsAction';
import { useRouter, usePathname } from 'next/navigation';
import {
  addUsersSavedViewAction,
  updateUsersSavedViewAction,
} from '@/app/redux/actions/allocationViewAction';
import { current } from '@reduxjs/toolkit';
import { Edit, Group } from 'lucide-react';
import NameViewForm from '../../Forms/NameViewForm';
import { openDialog } from '@/app/redux/actions/dialogAction';
import { format, getWeek, parseISO } from 'date-fns';
import { showToast } from '@/app/redux/reducers/toastReducer';
import { addResource, updateResource } from '@/app/services/resourceServices';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import { showToastAction } from '@/app/redux/actions/toastAction';
import ConfirmDialog from '../../Dialog/ConfirmDialog';
import { DATE_FORMAT } from '@/app/constants/constants';

const initialValuesMap = {
  add_project: {
    StartDate: '',
    EndDate: '',
    Name: '',
    Owner: '',
    AllowOvertime: '',
    Location: '',
    ProjectManager: '',
    Status: '',
    Type: '',
  },
  add_resource: {
    FirstName: '',
    LastName: '',
    FullName: '',
    Email: '',
    PhoneNumber: '',
    Department: '',
    Role: '',
    HRLevel: '',
    Type: 'Contractor',
    ContractorHourlyRate: null,
    AverageWeeklyHours: null,
    Manager: '',
    StartDate: '',
    EndDate: '',
    WorkLocation: '',
    Status: '',
  },
  add_allocation: {
    Resource: [],
    Project: [],
    StartDate: '',
    EndDate: '',
    AllocationEntered: '',
  },
  assign_allocation: {
    Resource: '',
    Project: '',
    StartDate: '',
    EndDate: '',
    Hours: '',
  },
  save_view: {
    groupBy: 'project',
    showBy: 'AllProject',
    dateRangeType: 'fixed',
    startDate: '',
    endDate: '',
    showColumns: ['teams', 'resource', 'project', 'resourceType'],
    filters: [{ filed: 'teams', operator: 'contains', value: '' }],
    calendarBy: 'week',
  },
  new_view: {
    groupBy: 'project',
    showBy: 'AllProject',
    dateRangeType: 'fixed',
    startDate: '',
    endDate: '',
    showColumns: ['teams', 'resource', 'project', 'resourceType'],
    filters: [{ filed: 'teams', operator: 'contains', value: '' }],
    calendarBy: 'week',
  },
  name_view: {
    groupBy: '',
    showBy: '',
    dateRangeType: '',
    startDate: '',
    endDate: '',
    showColumns: [],
    filters: [],
    calendarBy: '',
    name: '',
    description: '',
    isDefault: false,
  },
  clone_resource: {
    Project: [],
    Resource: [],
    allocations: [],
    StartDate: '',
    EndDate: '',
  },
  transfer_resource: {
    Project: [],
    Resource: [],
    allocations: [],
    StartDate: '',
    EndDate: '',
  },
};

const AllocationForm = () => {
  const { formType } = useSelector(state => state.globalDialog.formState);
  const [formValue, setFormValue] = useState(
    initialValuesMap[formType] || initialValuesMap.add_project
  );
  const dispatch = useDispatch();
  const { initialData } = useSelector(state => state.globalDialog.formState);
  const { projects } = useSelector(state => state.projects);
  const { currentView } = useSelector(state => state.allocationView);
  const { teams, teamsResources, calendarDate } = useSelector(
    state => state.teams
  );
  const { user } = useSelector(state => state.user);
  const { resources } = useSelector(state => state.resources);
  const { savedViews } = useSelector(state => state.allocationView);
  const { startDate, endDate } = calendarDate || {};
  const { allocations } = useSelector(state => state.dataGrid);
  const { rowState } = useSelector(state => state.dataGrid);
  const { view } = useSelector(state => state.allocationView);
  const router = useRouter();
  const pathname = usePathname();
  const [showTransferConfirm, setShowTransferConfirm] = useState(false);
  const [pendingTransferData, setPendingTransferData] = useState(null);
  const { allAllocations, calendarDate: _calendarDate } = useSelector(
    state => state.allAllocations
  );
  const { startDate: _startDate, endDate: _endDate } = _calendarDate || {};

  const getValidationSchema = formType => {
    switch (formType) {
      case 'add_project':
        return addProjectValidationSchema(projects);
      case 'add_resource':
        return addResourceValidationSchema;
      case 'add_allocation':
        return addAllocationValidationSchema;
      case 'assign_allocation':
        return assignAllocationValidationSchema;
      case 'new_view':
        return saveViewValidationSchema;
      case 'save_view':
        return saveViewValidationSchema;
      case 'name_view':
        return nameViewValidationSchema(savedViews);
      case 'clone_resource':
        return cloneResourceValidationSchema;
      case 'transfer_resource':
        return transferResourceValidationSchema;
      default:
        return null;
    }
  };

  const handleScrollAndFocus = (resources, period, projects) => {
    const selectedWeeks = period?.flatMap(monday => getWeekNumber(monday));
    const weeksObject = {};

    selectedWeeks.forEach(week => {
      weeksObject[`${week}`] = true;
    });

    const cellData = {};

    resources?.forEach(resource => {
      projects?.forEach(project => {
        const [{ Id }] = Array.isArray(project) ? project : [project];
        const key =
          view === 'Teams'
            ? `${resource.Id}-${resource.teamId}-${Id}`
            : `${resource.Id}-${Id}`;

        cellData[key] = weeksObject;
      });
    });
    dispatch(
      setCellSelectionData({
        ...cellData,
        restoreFocus: true,
      })
    );
  };

  const handleOnAdd = resources => {
    const rowIds = resources?.map(
      resource =>
        `auto-generated-row-teams/${resource.team?.Name}-resource/${resource.FullName}`
    );
    dispatch(setExpandRowId(rowIds));
  };

  const getTeamByResourceId = resourceId => {
    let new_user = null;
    Object.keys(teamsResources)?.forEach(team => {
      teamsResources?.[team]?.forEach(resource => {
        if (resource?.Id == resourceId) {
          new_user = { ...resource, teamId: team };
        }
      });
    });

    teams?.result?.forEach(team => {
      if (team?.Id == new_user?.teamId) {
        new_user = { team: team, ...new_user };
      }
    });
    return new_user;
  };

  const getAllocationPresent = (project, resource, period) => {
    for (let i = 0; i < rowState?.length; i++) {
      if (
        rowState[i]?.projectId === project &&
        rowState[i]?.resourceId === resource
      ) {
        return rowState[i][getWeekNumber(new Date(period))];
      }
    }
    return false;
  };

  const handleSubmit = async (
    values,
    { setSubmitting, setErrors, validateForm }
  ) => {
    const errors = await validateForm(values);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      setSubmitting(false);
      return;
    }

    let postData = {};
    const { submitType, ...cleanedValues } = values;

    switch (formType) {
      case 'add_project':
        if (!cleanedValues.StartDate) {
          const today = new Date().toISOString().split('T')[0]; // default to today
          cleanedValues.StartDate = today;
        }
        postData = {
          'ResourceAllocation.Core/Project': {
            ...cleanedValues,
            Description: 'string',
          },
        };
        try {
          dispatch(addProject(postData))
            .then(response => {
              if (response.meta.requestStatus === 'rejected') {
                dispatch(
                  showToast({
                    open: true,
                    message: `Failed to add project`,
                    type: 'error',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                  })
                );
                return;
              }
              if (submitType === 'secondary') {
                dispatch(setSplitView(true));
                dispatch(setSplitViewCurrentProject(response.payload.result));
                router.replace('/allocation');
                return;
              }

              // After successfully adding the project, route to Projects page
              if (pathname !== '/project') {
                router.replace('/project');
              }
            })
            .catch(error => {
              // Show Toast message for error
              dispatch(
                showToast({
                  open: true,
                  message: `Failed to add project`,
                  type: 'error',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
              console.error('Failed to add project:', error);
            });
          if (pathname !== '/project') {
            router.replace('/project');
          }
        } catch (e) {
          console.log(e);
        }
        break;

      case 'edit_project':
        postData = {
          'ResourceAllocation.Core/Project': {
            ...cleanedValues,
            Description: 'string',
          },
        };
        try {
          dispatch(updateProject({ postData, projectId: initialData.Id }));
        } catch (e) {
          console.log(e);
        }
        break;

      case 'add_resource':
        if (!cleanedValues.StartDate) {
          const today = new Date().toISOString().split('T')[0]; // default to today
          cleanedValues.StartDate = today;
        }
        postData = {
          'ResourceAllocation.Core/Resource': cleanedValues,
        };

        try {
          await dispatch(addResource(postData));
          await dispatch(fetchAllResources());
          if (pathname !== '/people') {
            router.replace('/people');
          }
        } catch (e) {
          console.error('Failed to add resource:', e);
        }
        dispatch(closeDialog());
        break;

      case 'edit_resource':
        postData = {
          'ResourceAllocation.Core/Resource': cleanedValues,
        };

        try {
          await dispatch(
            updateResource({
              postData,
              resourceId: initialData.Id,
            })
          );
          await dispatch(fetchAllResources());
          dispatch(closeDialog());
        } catch (e) {
          console.error('Failed to update resource:', e);
        }
        break;

      case 'add_allocation':
        try {
          const allMondays = generateAllMondays(
            values.StartDate || values.startDate,
            values.EndDate || values.endDate
          );
          const filteredProjects =
            projects?.result?.filter(project =>
              values.Project.includes(project.Id)
            ) || [];

          const warningMessages = [];
          const errorMessages = [];
          const allocationPromises = allMondays.flatMap(monday => {
            return values.Resource.flatMap(resource => {
              return filteredProjects.map(project => {
                const allocation = getAllocationPresent(
                  project.Id,
                  resource,
                  monday
                );

                const weekKey = getWeekNumber(new Date(monday)); // Convert Monday to WXX key
                const existingTotal = getTotalWeeklyAllocation(
                  rowState,
                  resource,
                  weekKey
                );
                const finalTotal =
                  existingTotal -
                  (allocation?.value || 0) +
                  values.AllocationEntered;

                if (finalTotal > 2.0) {
                  errorMessages.push(
                    `Total allocation for week ${weekKey} exceeds 2.0 (${finalTotal.toFixed(2)}). Update skipped.`
                  );
                  return null;
                }

                if (finalTotal > 1.5 && finalTotal <= 2.0) {
                  warningMessages.push(
                    `Total allocation for week ${weekKey} exceeds 1.5 (${finalTotal.toFixed(2)}).`
                  );
                }

                if (
                  allocation &&
                  allocation?.allocationId &&
                  allocation?.value
                ) {
                  if (allocation?.value !== values.AllocationEntered) {
                    const putPayload = {
                      resourceId: resource,
                      allocationId: allocation?.allocationId,
                      putData: {
                        'ResourceAllocation.Core/Allocation': {
                          AllocationEntered: values.AllocationEntered,
                        },
                      },
                    };
                    return dispatch(updateResourceAllocation(putPayload));
                  }
                } else {
                  const postPayload = {
                    resourceId: resource,
                    postData: {
                      'ResourceAllocation.Core/Allocation': {
                        Resource: resource,
                        Project: project.Id,
                        ProjectName: project.Name,
                        Period: format(monday, DATE_FORMAT),
                        AllocationEntered: values.AllocationEntered,
                        Notes: values.Comment || '',
                      },
                    },
                  };
                  return dispatch(setResourceAllocation(postPayload));
                }
              });
            });
          });

          if (!allocationPromises?.length) {
            return;
          }
          await Promise.all(allocationPromises).then(async () => {
            if (errorMessages.length > 1) {
              dispatch(
                showToastAction(
                  true,
                  'Total allocation for the multiple selected weeks exceeds 2.0. Please check and try again.',
                  'error',
                  4000
                )
              );
            } else {
              errorMessages.forEach(msg => {
                dispatch(showToastAction(true, msg, 'error', 4000));
              });
            }
            if (warningMessages.length > 0) {
              dispatch(
                showToastAction(
                  true,
                  'Warning: Total allocation for the multiple selected weeks exceeds 1.5',
                  'warning',
                  4000
                )
              );
            } else {
              warningMessages.forEach(msg => {
                dispatch(showToastAction(true, msg, 'warning', 4000));
              });
            }

            let new_resources = values.Resource.map(resource =>
              getTeamByResourceId(resource)
            );
            const updated_teams = [
              ...new Set(new_resources.map(resource => resource?.team)),
            ];
            dispatch(closeDialog());
            new Promise((resolve, reject) => {
              if (currentView?.GroupBy === 'Teams') {
                dispatch({
                  type: 'UPDATE_TEAM_ALLOCATIONS',
                  payload: {
                    teamIds: updated_teams.map(team => team?.Id),
                    teams: teams?.result,
                    projects: projects?.result,
                    resources: resources?.result,
                    teamsResources: teamsResources,
                    startDate: _startDate,
                    endDate: _endDate,
                    resolve,
                    reject,
                  },
                });
              } else if (currentView?.GroupBy === 'Project') {
                dispatch({
                  type: 'UPDATE_PROJECT_ALLOCATIONS',
                  payload: {
                    projectIds: filteredProjects.map(project => project?.Id),
                    teams: teams?.result,
                    projects: projects?.result,
                    resources: resources?.result,
                    teamsResources: teamsResources,
                    startDate: _startDate,
                    endDate: _endDate,
                    resolve,
                    reject,
                  },
                });
              }
            }).then(() => {
              handleOnAdd(new_resources);
              handleScrollAndFocus(new_resources, allMondays, filteredProjects);
            });
          });
        } catch (e) {
          console.error('Error creating allocations:', e);
        }
        break;

      case 'new_view':
        try {
          // Open Dialog for name View.
          dispatch(
            updateDialogData({
              title: 'Edit View',
              submitButtonText: 'Apply',
              cancelButtonText: 'Cancel',
              formType: 'name_view',
              initialData: {
                ...cleanedValues,
                name: '',
                description: '',
                isDefault: false,
              },
            })
          );
        } catch (e) {
          console.error('Error saving view:', e);
        }
        break;

      case 'name_view':
        try {
          if (values.id) {
            // Update the view.
            const updatedView = {
              Name: values.name,
              Description: values.description,
              isDefault: values.isDefault,
              ...(values?.dateRangeType !== undefined && {
                // Conditionally add properties
                isDynamicRange: values.dateRangeType === 'dynamic',
              }),
              ...(values?.dateRangeType !== undefined && {
                isFixedRange: values.dateRangeType === 'fixed',
              }),
              ...(values?.startDate !== undefined && {
                StartDate: values.startDate,
              }),
              ...(values?.endDate !== undefined && {
                EndDate: values.endDate,
              }),
              ...(values?.dynamicDateRangeAdd !== undefined && {
                WeekPlus: values.dynamicDateRangeAdd,
              }),
              ...(values?.dynamicDateRangeSubtract !== undefined && {
                WeekMinus: values.dynamicDateRangeSubtract,
              }),
              ...(values?.groupBy !== undefined && {
                GroupBy: values.groupBy,
              }),
              ...(values?.showColumns !== undefined && {
                Columns: values.showColumns,
              }),
              ...(values?.showBy !== undefined && {
                ShowBy: values.showBy,
              }),
              ...(values?.filters !== undefined && {
                Filters: values.filters,
              }),
            };

            // PUT request.
            dispatch(updateUsersSavedViewAction(values.id, updatedView));
            dispatch(closeDialog());
          } else {
            const userId = getUserIdFromEmail(
              resources?.result || [],
              user?.Email
            );
            // Create a new view.
            const newView = {
              isDefault: values.isDefault,
              isDynamicRange:
                values.dateRangeType === undefined
                  ? undefined
                  : values.dateRangeType === 'dynamic',
              isFixedRange:
                values.dateRangeType === undefined
                  ? undefined
                  : values.dateRangeType === 'fixed',
              StartDate: values.startDate !== '' ? values.startDate : null,
              EndDate: values.endDate !== '' ? values.endDate : null,
              WeekPlus: values.dynamicDateRangeAdd,
              WeekMinus: values.dynamicDateRangeSubtract,
              GroupBy: values.groupBy,
              Columns: values.showColumns,
              ShowBy: values.showBy,
              Name: values.name,
              Description: values.description,
              Filters: values.filters,
              UserId: userId,
            };

            // POST request to save the view.
            dispatch(addUsersSavedViewAction(newView));
            dispatch(closeDialog());
          }
        } catch (e) {
          console.error('Error saving view:', e);
        }
        break;

      case 'save_view':
        try {
          if (submitType === 'secondary') {
            // Call Save As Default View API, open Edit View dialog.
            dispatch(
              updateDialogData({
                title: 'Edit View',
                submitButtonText: 'Apply',
                secondaryButtonText: '',
                cancelButtonText: 'Cancel',
                formType: 'name_view',
                initialData: {
                  ...cleanedValues,
                  name: '',
                  description: '',
                  isDefault: false,
                },
              })
            );
          } else if (submitType === 'primary') {
            // Handle saving the view
            const updatedView = {
              isDynamicRange: values.dateRangeType === 'dynamic',
              isFixedRange: values.dateRangeType === 'fixed',
              StartDate: values.startDate !== '' ? values.startDate : null,
              EndDate: values.endDate !== '' ? values.endDate : null,
              WeekPlus: values.dynamicDateRangeAdd,
              WeekMinus: values.dynamicDateRangeSubtract,
              GroupBy: values.groupBy,
              Columns: values.showColumns,
              ShowBy: values.showBy,
              Filters: values.filters,
            };

            // PUT request to update the view
            dispatch(updateUsersSavedViewAction(currentView.Id, updatedView));
            dispatch(closeDialog());
          }
        } catch (e) {
          console.error('Error saving view:', e);
        }
        break;

      case 'clone_resource':
        try {
          if (initialData?.allocations?.length > 0) {
            try {
              const sourceResourceName = initialData?.Resource;
              const sourceResourceId = resources?.result?.find(
                res => res.FullName === sourceResourceName
              )?.Id;

              if (!sourceResourceId) {
                console.error('Could not find source resource ID');
                return;
              }

              const targetResourceIds = Array.isArray(values.Resource)
                ? values.Resource
                : [values.Resource];
              const projectIds = values.Project || [];
              const allMondays = generateAllMondays(
                values.StartDate,
                values.EndDate
              );
              const formattedProjects = projectIds.map(id => ({ Id: id }));

              // 🔒 BLOCK if ANY allocation exists in targetResource for ANY project during selected weeks
              const conflictDetected = targetResourceIds.some(targetId =>
                rowState.some(row => {
                  if (row.resourceId !== targetId) return false;
                  return Object.keys(row).some(key => {
                    if (!key.startsWith('W') || !row[key]?.period) return false;
                    const dateStr = new Date(row[key].period).toDateString();
                    return (
                      allMondays.some(
                        monday => new Date(monday).toDateString() === dateStr
                      ) && row[key]?.value != null
                    );
                  });
                })
              );

              if (conflictDetected) {
                dispatch(
                  showToast({
                    open: true,
                    message: `Bulk allocations can not be cloned over existing allocations`,
                    type: 'error',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                  })
                );
                return;
              }

              const clonePayloadList = [];

              targetResourceIds.forEach(targetId => {
                const allocsToClone = [];

                projectIds.forEach(projectId => {
                  const projectName =
                    projects?.result?.find(p => p.Id === projectId)?.Name || '';

                  allMondays.forEach(monday => {
                    const sourceAlloc = getAllocationPresent(
                      projectId,
                      sourceResourceId,
                      monday
                    );

                    if (sourceAlloc?.value != null) {
                      allocsToClone.push({
                        Resource: targetId,
                        Project: projectId,
                        ProjectName: projectName,
                        Period: format(monday, DATE_FORMAT),
                        AllocationEntered: sourceAlloc.value,
                        Notes: sourceAlloc?.notes || '',
                      });
                    }
                  });
                });

                if (allocsToClone.length > 0) {
                  clonePayloadList.push({
                    Resource: targetId,
                    AllocsList: allocsToClone,
                  });
                }
              });

              if (clonePayloadList.length === 0) {
                dispatch(
                  showToast({
                    open: true,
                    message: `No allocations found in source for the selected duration.`,
                    type: 'error',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                  })
                );
                return;
              }

              await dispatch(updateResourceBulkAllocation(clonePayloadList));

              const newResources = targetResourceIds.map(id =>
                getTeamByResourceId(id)
              );
              const updatedTeams = [
                ...new Set(newResources.map(res => res?.team)),
              ];

              dispatch(closeDialog());

              await new Promise((resolve, reject) => {
                dispatch({
                  type: 'UPDATE_TEAM_ALLOCATIONS',
                  payload: {
                    teamIds: updatedTeams.map(team => team?.Id),
                    teams: teams?.result,
                    projects: projects?.result,
                    resources: resources?.result,
                    teamsResources: teamsResources,
                    startDate: _startDate,
                    endDate: _endDate,
                    resolve,
                    reject,
                  },
                });
              });

              handleOnAdd(newResources);
              handleScrollAndFocus(newResources, allMondays, formattedProjects);

              dispatch(
                showToast({
                  open: true,
                  message: `${sourceResourceName} is successfully cloned.`,
                  type: 'success',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
            } catch (err) {
              dispatch(closeDialog());
              dispatch(
                showToast({
                  open: true,
                  message: `Resource cloning failed.`,
                  type: 'error',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
              console.error('Cloning failed:', err);
            }
          } else {
            const sourceResourceName = initialData?.Resource;
            const sourceResourceId = resources?.result?.find(
              res => res.FullName === sourceResourceName
            )?.Id;

            if (!sourceResourceId) {
              console.error(
                'Could not find resource ID for:',
                sourceResourceName
              );
              break;
            }

            const targetResourceIds = Array.isArray(values.Resource)
              ? values.Resource
              : [values.Resource];
            const projectIds = values.Project || [];
            const allMondays = generateAllMondays(
              values.StartDate,
              values.EndDate
            );
            const formattedProjects = projectIds.map(id => ({ Id: id }));

            const postPayloads = [];
            let errorFound = false;
            let overallocated = false;
            let warningFound = false;

            for (const monday of allMondays) {
              for (const projectId of projectIds) {
                const sourceAlloc = getAllocationPresent(
                  projectId,
                  sourceResourceId,
                  monday
                );

                // Skip cloning if source has no allocation
                if (sourceAlloc?.value == null) continue;

                for (const targetResourceId of targetResourceIds) {
                  const targetAlloc = getAllocationPresent(
                    projectId,
                    targetResourceId,
                    monday
                  );

                  // ❌ Abort if target already has allocation for the same project-week
                  if (targetAlloc?.value != null) {
                    errorFound = true;
                    continue;
                  }

                  const clonedValue = Number(sourceAlloc?.value || 0);
                  const weekKey = getWeekNumber(new Date(monday));

                  // Get total allocation for the week across all projects
                  const existingTotal = getTotalWeeklyAllocation(
                    allAllocations, // Replaces rowState
                    targetResourceId,
                    weekKey
                  );

                  const adjustedTotal = existingTotal + clonedValue;

                  if (adjustedTotal > 2.0) {
                    errorFound = true;
                    overallocated = true;
                    continue;
                  } else if (adjustedTotal > 1.5) {
                    warningFound = true;
                  }
                  if (adjustedTotal <= 2.0) {
                    postPayloads.push({
                      resourceId: targetResourceId,
                      postData: {
                        'ResourceAllocation.Core/Allocation': {
                          Resource: targetResourceId,
                          Project: projectId,
                          ProjectName: initialData.Project,
                          AllocationEntered: clonedValue,
                          Period: format(monday, DATE_FORMAT),
                        },
                      },
                    });
                  }
                }
              }
            }

            if (errorFound) {
              dispatch(closeDialog());
              dispatch(
                showToast({
                  open: true,
                  message:
                    overallocated && overallocated === true
                      ? `One or more allocations exceed 2.0 FTE`
                      : `Allocation already exist for one or more selected week.`,
                  type: 'error',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
              break;
            }

            try {
              await Promise.all(
                postPayloads.map(payload =>
                  dispatch(setResourceAllocation(payload))
                )
              ).then(async () => {
                const newResources = targetResourceIds.map(id =>
                  getTeamByResourceId(id)
                );
                const updated_teams = [
                  ...new Set(newResources.map(res => res?.team)),
                ];

                dispatch(closeDialog());

                new Promise((resolve, reject) => {
                  if (currentView?.GroupBy === 'Teams') {
                    dispatch({
                      type: 'UPDATE_TEAM_ALLOCATIONS',
                      payload: {
                        teamIds: updated_teams.map(team => team?.Id),
                        teams: teams?.result,
                        projects: projects?.result,
                        resources: resources?.result,
                        teamsResources: teamsResources,
                        startDate: _startDate,
                        endDate: _endDate,
                        resolve,
                        reject,
                      },
                    });
                  } else if (currentView?.GroupBy === 'Project') {
                    dispatch({
                      type: 'UPDATE_PROJECT_ALLOCATIONS',
                      payload: {
                        projectIds: formattedProjects.map(
                          project => project?.Id
                        ),
                        teams: teams?.result,
                        projects: projects?.result,
                        resources: resources?.result,
                        teamsResources: teamsResources,
                        startDate: _startDate,
                        endDate: _endDate,
                        resolve,
                        reject,
                      },
                    });
                  }
                }).then(() => {
                  handleOnAdd(newResources);
                  handleScrollAndFocus(
                    newResources,
                    allMondays,
                    formattedProjects
                  );
                  dispatch(
                    showToast({
                      open: true,
                      message: `${sourceResourceName} is successfully cloned.`,
                      type: 'success',
                      position: 'bottom-left',
                      autoHideTimer: 4000,
                    })
                  );

                  if (warningFound) {
                    dispatch(
                      showToast({
                        open: true,
                        message: `Some weeks have allocation > 1.5 but ≤ 2.0 FTE.`,
                        type: 'warning',
                        position: 'bottom-left',
                        autoHideTimer: 4000,
                      })
                    );
                  }
                });
              });
            } catch (err) {
              dispatch(closeDialog());
              dispatch(
                showToast({
                  open: true,
                  message: `Resource cloning failed.`,
                  type: 'error',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
              console.error('Cloning failed:', err);
            }
          }
          //   const sourceResourceName = initialData?.Resource;
          //   const sourceResourceId = resources?.result?.find(
          //     res => res.FullName === sourceResourceName
          //   )?.Id;

          //   if (!sourceResourceId) {
          //     console.error(
          //       'Could not find resource ID for:',
          //       sourceResourceName
          //     );
          //     break;
          //   }

          //   const targetResourceIds = Array.isArray(values.Resource)
          //     ? values.Resource
          //     : [values.Resource];
          //   const projectIds = values.Project || [];
          //   const allMondays = generateAllMondays(
          //     values.StartDate,
          //     values.EndDate
          //   );
          //   const formattedProjects = projectIds.map(id => ({ Id: id }));

          //   // ❌ Block if any allocation exists in target for any project-week
          //   let conflictFound = false;

          //   for (const monday of allMondays) {
          //     for (const targetResourceId of targetResourceIds) {
          //       const weekKey = getWeekNumber(monday);

          //       const rowForTarget = rowState.find(
          //         row => row.resourceId === targetResourceId
          //       );

          //       if (rowForTarget && rowForTarget[weekKey]?.value != null) {
          //         conflictFound = true;
          //         break;
          //       }
          //     }
          //     if (conflictFound) break;
          //   }

          //   if (conflictFound) {
          //     dispatch(
          //       showToast({
          //         open: true,
          //         message: `Bulk allocations can not be cloned over existing allocations`,
          //         type: 'error',
          //         position: 'bottom-left',
          //         autoHideTimer: 4000,
          //       })
          //     );
          //     break;
          //   }

          //   // ✅ Proceed to clone if no conflicts
          //   const postPayloads = [];

          //   for (const monday of allMondays) {
          //     for (const projectId of projectIds) {
          //       const sourceAlloc = getAllocationPresent(
          //         projectId,
          //         sourceResourceId,
          //         monday
          //       );

          //       for (const targetResourceId of targetResourceIds) {
          //         const targetAlloc = getAllocationPresent(
          //           projectId,
          //           targetResourceId,
          //           monday
          //         );

          //         //  Skip if source has no allocation
          //         if (sourceAlloc?.value == null) {
          //           //  Skip silently whether target has value or not
          //           continue;
          //         }

          //         //  If target already has any value, skip cloning for that week
          //         if (targetAlloc?.value != null) {
          //           continue;
          //         }

          //         // Proceed only if target has no allocation
          //         postPayloads.push({
          //           resourceId: targetResourceId,
          //           postData: {
          //             'ResourceAllocation.Core/Allocation': {
          //               Resource: targetResourceId,
          //               Project: projectId,
          //               ProjectName: initialData.Project,
          //               AllocationEntered: sourceAlloc.value,
          //               Period: format(monday, DATE_FORMAT),
          //             },
          //           },
          //         });
          //       }
          //     }
          //   }

          //   try {
          //     await Promise.all(
          //       postPayloads.map(payload =>
          //         dispatch(setResourceAllocation(payload))
          //       )
          //     ).then(async () => {
          //       const newResources = targetResourceIds.map(id =>
          //         getTeamByResourceId(id)
          //       );
          //       const updated_teams = [
          //         ...new Set(newResources.map(res => res?.team)),
          //       ];
          //       dispatch(closeDialog());
          //       new Promise((resolve, reject) => {
          //         if (currentView?.GroupBy === 'Teams') {
          //           dispatch({
          //             type: 'UPDATE_TEAM_ALLOCATIONS',
          //             payload: {
          //               teamIds: updated_teams.map(team => team?.Id),
          //               teams: teams?.result,
          //               projects: projects?.result,
          //               resources: resources?.result,
          //               teamsResources: teamsResources,
          //               startDate: _startDate,
          //               endDate: _endDate,
          //               resolve,
          //               reject,
          //             },
          //           });
          //         } else if (currentView?.GroupBy === 'Project') {
          //           dispatch({
          //             type: 'UPDATE_PROJECT_ALLOCATIONS',
          //             payload: {
          //               projectIds: formattedProjects.map(
          //                 project => project?.Id
          //               ),
          //               teams: teams?.result,
          //               projects: projects?.result,
          //               resources: resources?.result,
          //               teamsResources: teamsResources,
          //               startDate: _startDate,
          //               endDate: _endDate,
          //               resolve,
          //               reject,
          //             },
          //           });
          //         }
          //       }).then(() => {
          //         handleOnAdd(newResources);
          //         handleScrollAndFocus(
          //           newResources,
          //           allMondays,
          //           formattedProjects
          //         );
          //         dispatch(
          //           showToast({
          //             open: true,
          //             message: `${sourceResourceName} is successfully cloned.`,
          //             type: 'success',
          //             position: 'bottom-left',
          //             autoHideTimer: 4000,
          //           })
          //         );
          //       });
          //     });
          //   } catch (err) {
          //     dispatch(closeDialog());
          //     dispatch(
          //       showToast({
          //         open: true,
          //         message: `Resource cloning failed.`,
          //         type: 'error',
          //         position: 'bottom-left',
          //         autoHideTimer: 4000,
          //       })
          //     );
          //     console.error('Cloning failed:', err);
          //   }
          // }
        } catch (err) {
          dispatch(closeDialog());
          dispatch(
            showToast({
              open: true,
              message: `Resource is failed clone `,
              type: 'error',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          console.error('Cloning failed:', err);
        }
        break;

      case 'transfer_resource':
        setPendingTransferData({ values, initialData });
        setShowTransferConfirm(true);
        break;

      default:
        return;
    }
    setSubmitting(false);
    setFormValue({});
  };

  const performTransfer = async () => {
    if (!pendingTransferData) return;

    try {
      const { values, initialData } = pendingTransferData;
      const sourceResourceName = initialData?.Resource;
      const sourceResourceId = resources?.result?.find(
        res => res.FullName === sourceResourceName
      )?.Id;

      if (!sourceResourceId) {
        console.error(' Could not find resource ID for:', sourceResourceName);
        return;
      }

      if (initialData?.allocations?.length > 0) {
        const targetResourceIds = Array.isArray(values.Resource)
          ? values.Resource
          : [values.Resource];
        const originalAllocations = initialData?.allocations || [];
        const projectIds = values.Project || [];
        const allMondays = generateAllMondays(values.StartDate, values.EndDate);
        const mondaySet = new Set(
          allMondays.map(date => new Date(date).toDateString())
        );
        const formattedProjects = projectIds.map(id => ({ Id: id }));

        const clonePayloadList = [];
        const deletePayloadList = [];

        const sourceAllocMap = {}; // key = projectId|period
        originalAllocations
          .filter(row => projectIds.includes(row.projectId))
          .forEach(row => {
            Object.keys(row).forEach(key => {
              if (key.startsWith('W') && row[key]?.period) {
                const periodDate = row[key].period;
                if (mondaySet.has(new Date(periodDate).toDateString())) {
                  const uniqueKey = `${row.projectId}|${row[key].period}`;
                  sourceAllocMap[uniqueKey] = {
                    value: row[key]?.value ?? null,
                    period: row[key].period,
                    projectId: row.projectId,
                    project: row.project,
                    notes: row[key]?.notes || '',
                    allocationId: row[key]?.allocationId || null,
                  };
                }
              }
            });
          });

        // Copy to each target
        targetResourceIds.forEach(targetResourceId => {
          const postPayload = { Resource: targetResourceId, AllocsList: [] };

          for (const [key, source] of Object.entries(sourceAllocMap)) {
            const week = source.period;
            const targetHasAnyAlloc = rowState.some(row => {
              return (
                row.resourceId === targetResourceId &&
                Object.keys(row).some(k => {
                  return (
                    k.startsWith('W') &&
                    row[k]?.period &&
                    new Date(row[k].period).toDateString() ===
                      new Date(week).toDateString() &&
                    row[k]?.value != null
                  );
                })
              );
            });

            // ❌ If target has any alloc for that week, and source has no alloc — skip silently
            if (source.value == null) {
              continue;
            }

            // ❌ If target has any allocation in that week (even for other projects), skip
            if (targetHasAnyAlloc) {
              continue;
            }

            // ✅ Else, include in final transfer payload
            postPayload.AllocsList.push({
              Resource: targetResourceId,
              Project: source.projectId,
              ProjectName: source.project,
              Period: source.period,
              AllocationEntered: source.value,
              Notes: source.notes,
            });
          }

          if (postPayload.AllocsList.length > 0) {
            clonePayloadList.push(postPayload);
          }
        });
        const sourceDeleteIds = [];

        Object.entries(sourceAllocMap).forEach(([key, source]) => {
          const transferredToAll = targetResourceIds.every(targetResourceId => {
            const targetAllocRow = rowState.find(
              row =>
                row.resourceId === targetResourceId &&
                row.projectId === source.projectId
            );
            if (!targetAllocRow) return false;

            const weekKey = getWeekNumber(new Date(source.period));
            const cell = targetAllocRow[`W${weekKey}`];

            // Check if that week was successfully added to final post payload
            return clonePayloadList.some(
              payload =>
                payload.Resource === targetResourceId &&
                payload.AllocsList.some(
                  a =>
                    a.Project === source.projectId &&
                    new Date(a.Period).toDateString() ===
                      new Date(source.period).toDateString()
                )
            );
          });

          if (transferredToAll && source.allocationId) {
            sourceDeleteIds.push(source.allocationId);
          }
        });

        if (sourceDeleteIds.length > 0) {
          deletePayloadList.push({
            Resource: sourceResourceId,
            AllocsList: sourceDeleteIds,
          });
        }

        if (clonePayloadList.length === 0 && deletePayloadList.length === 0) {
          dispatch(
            showToast({
              open: true,
              message: `Bulk allocations can not be transferred over existing allocations`,
              type: 'error',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          return;
        }

        const transferPromises = [];
        if (clonePayloadList.length > 0) {
          transferPromises.push(
            ...clonePayloadList.map(payload =>
              dispatch(updateResourceBulkAllocation([payload]))
            )
          );
        }

        if (deletePayloadList.length > 0) {
          transferPromises.push(
            dispatch(removeResourceBulkAllocation(deletePayloadList))
          );
        }

        await Promise.all(transferPromises).then(async () => {
          dispatch(closeDialog());
          const allResourceIds = [...targetResourceIds, sourceResourceId];
          const newResources = allResourceIds.map(id =>
            getTeamByResourceId(id)
          );
          const updated_teams = [
            ...new Set(newResources.map(res => res?.team)),
          ];
          const focusResources = targetResourceIds.map(id =>
            getTeamByResourceId(id)
          );

          new Promise((resolve, reject) => {
            dispatch({
              type: 'UPDATE_TEAM_ALLOCATIONS',
              payload: {
                teamIds: updated_teams.map(team => team?.Id),
                teams: teams?.result,
                projects: projects?.result,
                resources: resources?.result,
                teamsResources: teamsResources,
                startDate: _startDate,
                endDate: _endDate,
                resolve,
                reject,
              },
            });
          }).then(() => {
            handleOnAdd(newResources);
            handleScrollAndFocus(focusResources, allMondays, formattedProjects);
            dispatch(
              showToast({
                open: true,
                message: `${sourceResourceName} is successfully transferred.`,
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
          });
        });
      } else {
        const targetResourceIds = Array.isArray(values.Resource)
          ? values.Resource
          : [values.Resource];
        const projectIds = values.Project || [];
        const allMondays = generateAllMondays(values.StartDate, values.EndDate);

        const formattedProjects = projectIds.map(id => ({ Id: id }));
        const finalPostPayload = [];
        const finalDeleteIds = [];
        const sourceDeleteIds = [];
        let errorFound = false;
        let overallocated = false;
        let warningFound = false;

        for (const monday of allMondays) {
          for (const projectId of projectIds) {
            const sourceAlloc = getAllocationPresent(
              projectId,
              sourceResourceId,
              monday
            );

            // Skip if source has no allocation
            if (sourceAlloc?.value == null) continue;

            for (const targetResourceId of targetResourceIds) {
              const targetAlloc = getAllocationPresent(
                projectId,
                targetResourceId,
                monday
              );

              // ❌ Abort if target already has allocation for the same project-week
              if (targetAlloc?.value != null) {
                errorFound = true;
                continue;
              }

              const sameValue =
                sourceAlloc?.value !== null &&
                targetAlloc?.value !== null &&
                Number(sourceAlloc.value) === Number(targetAlloc.value);

              if (sameValue) continue;

              const clonedValue = Number(sourceAlloc?.value || 0);
              const weekKey = getWeekNumber(new Date(monday));

              // Get total allocation for the week across all projects
              const existingTotal = getTotalWeeklyAllocation(
                allAllocations,
                targetResourceId,
                weekKey
              );

              const adjustedTotal = existingTotal + clonedValue;

              if (adjustedTotal > 2.0) {
                errorFound = true;
                overallocated = true;
                continue;
              } else if (adjustedTotal > 1.5) {
                warningFound = true;
              }

              if (sourceAlloc?.value != null && adjustedTotal <= 2.0) {
                finalPostPayload.push({
                  resourceId: targetResourceId,
                  postData: {
                    'ResourceAllocation.Core/Allocation': {
                      Resource: targetResourceId,
                      Project: projectId,
                      ProjectName: initialData.Project,
                      AllocationEntered: clonedValue,
                      Period: format(monday, DATE_FORMAT),
                      Notes: sourceAlloc?.notes || '',
                    },
                  },
                });

                if (sourceAlloc?.allocationId) {
                  sourceDeleteIds.push(sourceAlloc.allocationId);
                }
              }

              if (sourceDeleteIds.length > 0) {
                finalDeleteIds.push({
                  Resource: sourceResourceId,
                  AllocsList: sourceDeleteIds,
                });
              }
            }
          }
        }

        if (errorFound) {
          dispatch(closeDialog());
          dispatch(
            showToast({
              open: true,
              message:
                overallocated && overallocated === true
                  ? `One or more allocations exceed 2.0 FTE`
                  : `Bulk allocations can not be transferred over existing allocations`,
              type: 'error',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          return;
        }

        const transferPromises = [];
        if (finalPostPayload.length > 0) {
          transferPromises.push(
            ...finalPostPayload.map(payload =>
              dispatch(setResourceAllocation(payload))
            )
          );
        }

        if (finalDeleteIds.length > 0) {
          transferPromises.push(
            dispatch(removeResourceBulkAllocation(finalDeleteIds))
          );
        }

        try {
          await Promise.all([transferPromises]).then(async () => {
            const allResourceIds = [
              ...new Set([...targetResourceIds, sourceResourceId]),
            ];
            const newResources = allResourceIds.map(id =>
              getTeamByResourceId(id)
            );
            const updated_teams = [
              ...new Set(newResources.map(res => res?.team)),
            ];
            const focusResources = targetResourceIds.map(id =>
              getTeamByResourceId(id)
            );
            dispatch(closeDialog());

            new Promise((resolve, reject) => {
              if (currentView?.GroupBy === 'Teams') {
                dispatch({
                  type: 'UPDATE_TEAM_ALLOCATIONS',
                  payload: {
                    teamIds: updated_teams.map(team => team?.Id),
                    teams: teams?.result,
                    projects: projects?.result,
                    resources: resources?.result,
                    teamsResources: teamsResources,
                    startDate: _startDate,
                    endDate: _endDate,
                    resolve,
                    reject,
                  },
                });
              } else if (currentView?.GroupBy === 'Project') {
                dispatch({
                  type: 'UPDATE_PROJECT_ALLOCATIONS',
                  payload: {
                    projectIds: formattedProjects.map(project => project?.Id),
                    teams: teams?.result,
                    projects: projects?.result,
                    resources: resources?.result,
                    teamsResources: teamsResources,
                    startDate: _startDate,
                    endDate: _endDate,
                    resolve,
                    reject,
                  },
                });
              }
            }).then(() => {
              handleOnAdd(newResources);
              handleScrollAndFocus(newResources, allMondays, formattedProjects);
              dispatch(
                showToast({
                  open: true,
                  message: `${sourceResourceName} is successfully transferred.`,
                  type: 'success',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );

              if (warningFound) {
                dispatch(
                  showToast({
                    open: true,
                    message: `Some weeks have allocation which exceeds 1.5 FTE.`,
                    type: 'warning',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                  })
                );
              }
            });
          });
        } catch (err) {
          dispatch(closeDialog());
          dispatch(
            showToast({
              open: true,
              message: `Resource transfer failed.`,
              type: 'error',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          console.error('transfer failed:', err);
        }
      }
    } catch (err) {
      dispatch(closeDialog());
      dispatch(
        showToast({
          open: true,
          message: `Resource is failed transfer `,
          type: 'error',
          position: 'bottom-left',
          autoHideTimer: 4000,
        })
      );
      console.error('transfer failed:', err);
    }
  };

  const getFormComponent = (formType, formikProps) => {
    switch (formType) {
      case 'add_project':
        return <AddProjectForm formikProps={formikProps} />;
      case 'edit_project':
        return (
          <AddProjectForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'add_resource':
        return (
          <AddResourceForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'edit_resource':
        return (
          <AddResourceForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'add_allocation':
        return (
          <AddAllocationForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'assign_allocation':
        return <AssignAllocationForm formikProps={formikProps} />;
      case 'new_view':
        return (
          <SaveViewForm formikProps={formikProps} setFormValue={setFormValue} />
        );
      case 'save_view':
        return (
          <SaveViewForm formikProps={formikProps} setFormValue={setFormValue} />
        );
      case 'name_view':
        return (
          <NameViewForm formikProps={formikProps} setFormValue={setFormValue} />
        );
      case 'clone_resource':
        return (
          <CloneResourceForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'transfer_resource':
        return (
          <TransferResourceForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      default:
        return <div>No form selected</div>;
    }
  };

  const FormErrorMessage = ({ name }) => (
    <ErrorMessage name={name}>
      {msg => (
        <Typography
          color="error"
          sx={{
            fontSize: '12px',
            mt: 0.5,
            fontFamily: theme => theme.typography.fontFamily,
          }}
        >
          {msg}
        </Typography>
      )}
    </ErrorMessage>
  );

  const onCancel = () => {
    setFormValue(initialValuesMap[formType]);
    dispatch(
      setCellSelectionData({
        restoreFocus: true,
      })
    );
  };

  return (
    <Formik
      enableReinitialize
      initialValues={{ ...formValue, submitType: '' }}
      validationSchema={getValidationSchema(formType)}
      onSubmit={handleSubmit}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {formikProps => (
        <CustomDialog
          onSubmit={() => {
            formikProps.setFieldValue('submitType', 'primary', false); // avoid validation here
            formikProps.submitForm();
          }}
          onSecondarySubmit={() => {
            formikProps.setFieldValue('submitType', 'secondary', false); // avoid validation here
            formikProps.submitForm();
          }}
          isSubmitting={formikProps.isSubmitting}
          isValid={formikProps.isValid}
          onCancel={onCancel}
        >
          <Box>
            {getFormComponent(formType, {
              ...formikProps,
              FormErrorMessage,
            })}
            {formikProps.status && (
              <Typography
                color="error"
                sx={{
                  fontSize: '14px',
                  mt: 2,
                  textAlign: 'center',
                  fontFamily: theme => theme.typography.fontFamily,
                  fontWeight: 600,
                }}
              >
                {formikProps.status}
              </Typography>
            )}
          </Box>
          <ConfirmDialog
            open={showTransferConfirm}
            title="Alert"
            onCancel={() => {
              setShowTransferConfirm(false);
              setPendingTransferData(null);
            }}
            onConfirm={() => {
              setShowTransferConfirm(false);
              performTransfer();
            }}
          >
            Are you sure you want to transfer this allocation to &nbsp;
            {pendingTransferData?.values?.Resource?.map(resourceId => {
              const resource = resources?.result?.find(
                res => res.Id === resourceId
              );
              return resource?.FullName || 'Unknown Resource';
            }).join(', ')}
            &nbsp; - &nbsp;
            {pendingTransferData?.values?.Project?.map(projectId => {
              const project = projects?.result?.find(
                proj => proj.Id === projectId
              );
              return project?.Name || 'Unknown Project';
            }).join(', ')}
            .
          </ConfirmDialog>
        </CustomDialog>
      )}
    </Formik>
  );
};

export default AllocationForm;
