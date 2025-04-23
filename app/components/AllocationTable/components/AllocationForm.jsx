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
} from '@/app/utils/common';
import {
  setResourceAllocation,
  updateResourceAllocation,
  removeResourceAllocation,
} from '@/app/redux/actions/resourceAllocationAction';
import { fetchResourcesAgainstTeams } from '@/app/redux/actions/fetchTeamsAction';
import {
  setCellSelectionData,
  setExpandRowId,
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
import { getWeek, parseISO } from 'date-fns';
import { showToast } from '@/app/redux/reducers/toastReducer';
import DeleteDialog from '../../Dialog/DeleteDialog';

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
    Resource: '',
    Type: '',
    Skills: '',
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
    StartDate: '',
    EndDate: '',
  },
  transfer_resource: {
    Project: [],
    Resource: [],
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
    const selectedWeeks = period?.flatMap(monday =>
      getWeekNumber(parseISO(monday))
    );
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
    const { submitType } = values;

    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      setSubmitting(false);
      return;
    }

    let postData = {};
    switch (formType) {
      case 'add_project':
        postData = {
          'ResourceAllocation.Core/Project': {
            ...values,
            Description: 'string',
          },
        };
        try {
          dispatch(addProject(postData))
            .then(() => {
              // After successfully adding the project, route to Projects page
              if (pathname !== '/project') {
                router.replace('/project');
              }
            })
            .catch(error => {
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
            ...values,
            Description: 'string',
          },
        };
        try {
          dispatch(updateProject({ postData, projectId: initialData.Id }));
        } catch (e) {
          console.log(e);
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

          const allocationPromises = allMondays.flatMap(monday => {
            return values.Resource.flatMap(resource => {
              return filteredProjects.map(project => {
                const allocation = getAllocationPresent(
                  project.Id,
                  resource,
                  monday
                );

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
                        Period: monday,
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
            let new_resources = values.Resource.map(resource =>
              getTeamByResourceId(resource)
            );
            const teams = [
              ...new Set(new_resources.map(resource => resource?.team)),
            ];
            dispatch(closeDialog());

            if (view === 'Teams') {
              return dispatch(
                fetchResourcesAgainstTeams(
                  teams,
                  allocations,
                  startDate,
                  endDate
                )
              ).then(() => {
                handleOnAdd(new_resources);
                handleScrollAndFocus(
                  new_resources,
                  allMondays,
                  filteredProjects
                );
              });
            } else if (view === 'Project') {
              return dispatch(
                fetchAllProjectAllocations(filteredProjects, startDate, endDate)
              ).then(() => {
                handleScrollAndFocus(
                  new_resources,
                  allMondays,
                  filteredProjects
                );
              });
            }
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
                ...values,
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
                  ...values,
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
          const sourceResourceName = initialData?.Resource;
          const sourceResourceId = resources?.result?.find(
            res => res.FullName === sourceResourceName
          )?.Id;

          if (!sourceResourceId) {
            console.error(
              ' Could not find resource ID for:',
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

          const actionGroups = {
            PUT: [],
            POST: [],
            DELETE: [],
          };

          for (const monday of allMondays) {
            for (const projectId of projectIds) {
              const sourceAlloc = getAllocationPresent(
                projectId,
                sourceResourceId,
                monday
              );

              for (const targetResourceId of targetResourceIds) {
                const targetAlloc = getAllocationPresent(
                  projectId,
                  targetResourceId,
                  monday
                );

                const sameValue =
                  sourceAlloc?.value !== null &&
                  targetAlloc?.value !== null &&
                  Number(sourceAlloc.value) === Number(targetAlloc.value);

                if (sameValue) continue;

                if (sourceAlloc?.value != null && targetAlloc?.allocationId) {
                  actionGroups.PUT.push({
                    resourceId: targetResourceId,
                    allocationId: targetAlloc.allocationId,
                    putData: {
                      'ResourceAllocation.Core/Allocation': {
                        AllocationEntered: sourceAlloc.value,
                      },
                    },
                  });
                } else if (
                  sourceAlloc?.value != null &&
                  !targetAlloc?.allocationId
                ) {
                  actionGroups.POST.push({
                    resourceId: targetResourceId,
                    postData: {
                      'ResourceAllocation.Core/Allocation': {
                        Resource: targetResourceId,
                        Project: projectId,
                        ProjectName: initialData.Project,
                        AllocationEntered: sourceAlloc.value,
                        Period: monday,
                      },
                    },
                  });
                } else if (
                  sourceAlloc?.value == null &&
                  targetAlloc?.allocationId
                ) {
                  actionGroups.DELETE.push({
                    resourceId: targetResourceId,
                    allocationId: targetAlloc.allocationId,
                  });
                }
              }
            }
          }

          try {
            // Run in parallel per group type
            await Promise.all([
              ...actionGroups.PUT.map(payload =>
                dispatch(updateResourceAllocation(payload))
              ),
              ...actionGroups.POST.map(payload =>
                dispatch(setResourceAllocation(payload))
              ),
              ...actionGroups.DELETE.map(payload =>
                dispatch(removeResourceAllocation(payload))
              ),
            ]).then(async () => {
              const newResources = targetResourceIds.map(id =>
                getTeamByResourceId(id)
              );
              const teams = [...new Set(newResources.map(res => res?.team))];
              dispatch(closeDialog());
              if (view === 'Teams') {
                await dispatch(
                  fetchResourcesAgainstTeams(
                    teams,
                    allocations,
                    startDate,
                    endDate
                  )
                ).then(() => {
                  handleOnAdd(newResources);
                  handleScrollAndFocus(
                    newResources,
                    allMondays,
                    formattedProjects
                  );
                });
              } else if (view === 'Project') {
                await dispatch(
                  fetchAllProjectAllocations(
                    formattedProjects,
                    startDate,
                    endDate
                  )
                ).then(() => {
                  handleScrollAndFocus(
                    newResources,
                    allMondays,
                    formattedProjects
                  );
                });
              }

              dispatch(
                showToast({
                  open: true,
                  message: `${sourceResourceName} is successfully cloned. `,
                  type: 'success',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
            });
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
        } catch (err) {
          dispatch(closeDialog());
          dispatch(
            showToast({
              open: true,
              message: `Resource is failed clone `,
              type: 'warning',
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

      const targetResourceIds = Array.isArray(values.Resource)
        ? values.Resource
        : [values.Resource];
      const projectIds = values.Project || [];
      const allMondays = generateAllMondays(values.StartDate, values.EndDate);

      const formattedProjects = projectIds.map(id => ({ Id: id }));

      const actionGroups = {
        PUT: [],
        POST: [],
        DELETE: [],
      };

      for (const monday of allMondays) {
        for (const projectId of projectIds) {
          const sourceAlloc = getAllocationPresent(
            projectId,
            sourceResourceId,
            monday
          );

          for (const targetResourceId of targetResourceIds) {
            const targetAlloc = getAllocationPresent(
              projectId,
              targetResourceId,
              monday
            );

            const sameValue =
              sourceAlloc?.value !== null &&
              targetAlloc?.value !== null &&
              Number(sourceAlloc.value) === Number(targetAlloc.value);

            if (sameValue) continue;

            if (sourceAlloc?.value != null && targetAlloc?.allocationId) {
              actionGroups.PUT.push({
                resourceId: targetResourceId,
                allocationId: targetAlloc.allocationId,
                putData: {
                  'ResourceAllocation.Core/Allocation': {
                    AllocationEntered: sourceAlloc.value,
                  },
                },
              });
            } else if (
              sourceAlloc?.value != null &&
              !targetAlloc?.allocationId
            ) {
              actionGroups.POST.push({
                resourceId: targetResourceId,
                postData: {
                  'ResourceAllocation.Core/Allocation': {
                    Resource: targetResourceId,
                    Project: projectId,
                    ProjectName: initialData.Project,
                    AllocationEntered: sourceAlloc.value,
                    Period: monday,
                  },
                },
              });
            } else if (
              sourceAlloc?.value == null &&
              targetAlloc?.allocationId
            ) {
              actionGroups.DELETE.push({
                resourceId: targetResourceId,
                allocationId: targetAlloc.allocationId,
              });
            }
          }

          if (sourceAlloc?.allocationId) {
            actionGroups.DELETE.push({
              resourceId: sourceResourceId,
              allocationId: sourceAlloc.allocationId,
            });
          }
        }
      }

      try {
        // Run in parallel per group type
        await Promise.all([
          ...actionGroups.PUT.map(payload =>
            dispatch(updateResourceAllocation(payload))
          ),
          ...actionGroups.POST.map(payload =>
            dispatch(setResourceAllocation(payload))
          ),
          ...actionGroups.DELETE.map(payload =>
            dispatch(removeResourceAllocation(payload))
          ),
        ]).then(async () => {
          const newResources = targetResourceIds.map(id =>
            getTeamByResourceId(id)
          );
          const teams = [...new Set(newResources.map(res => res?.team))];
          dispatch(closeDialog());
          if (view === 'Teams') {
            await dispatch(
              fetchResourcesAgainstTeams(teams, allocations, startDate, endDate)
            ).then(() => {
              handleOnAdd(newResources);
              handleScrollAndFocus(newResources, allMondays, formattedProjects);
            });
          } else if (view === 'Project') {
            await dispatch(
              fetchAllProjectAllocations(formattedProjects, startDate, endDate)
            ).then(() => {
              handleScrollAndFocus(newResources, allMondays, formattedProjects);
            });
          }

          dispatch(
            showToast({
              open: true,
              message: `${sourceResourceName} is successfully transfered. `,
              type: 'success',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
        });
      } catch (err) {
        // dispatch(closeDialog());
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
    } catch (err) {
      // dispatch(closeDialog());
      dispatch(
        showToast({
          open: true,
          message: `Resource is failed transfer `,
          type: 'warning',
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
        return <AddResourceForm formikProps={formikProps} />;
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
          <DeleteDialog
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
          </DeleteDialog>
        </CustomDialog>
      )}
    </Formik>
  );
};

export default AllocationForm;
