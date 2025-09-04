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
import HistoryForm from '../../Forms/HistoryForm';
import {
  addAllocationValidationSchema,
  addProjectValidationSchema,
  addResourceValidationSchema,
  assignAllocationValidationSchema,
  nameViewValidationSchema,
  saveViewValidationSchema,
  cloneResourceValidationSchema,
  transferResourceValidationSchema,
  editResourceValidationSchema,
  addTeamValidationSchema,
  addRatesValidationSchema,
  openHistoryValidationSchema,
  addPortfolioValidationSchema,
  addOrganizationValidationSchema,
  addRoleValidationSchema,
  assignRoleValidationSchema,
  addPrivilegeValidationSchema,
  assignPrivilegeValidationSchema,
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
  generateDateWeekMath,
  getUpdatedTotalWeeklyAllocation,
  isResourceWithinDate,
  getMondayOfISO,
} from '@/app/utils/common';
import {
  setResourceAllocation,
  updateResourceAllocation,
  removeResourceAllocation,
} from '@/app/redux/actions/resourceAllocationAction';
import {
  fetchAllTeams,
  fetchResourcesAgainstTeams,
} from '@/app/redux/actions/fetchTeamsAction';
import {
  setCellSelectionData,
  setExpandRowId,
  setSplitView,
  setSplitViewCurrentProject,
} from '@/app/redux/reducers/allocationViewReducer';
import { Box, Typography } from '@mui/material';
import {
  fetchAllProjectAllocations,
  fetchAllProjects,
} from '@/app/redux/actions/fetchProjectsAction';
import { useRouter, usePathname } from 'next/navigation';
import {
  addUsersSavedViewAction,
  updateUsersSavedViewAction,
} from '@/app/redux/actions/allocationViewAction';
import { Edit, Group } from 'lucide-react';
import NameViewForm from '../../Forms/NameViewForm';
import { openDialog } from '@/app/redux/actions/dialogAction';
import { addDays, format, getWeek, parseISO } from 'date-fns';
import { showToast } from '@/app/redux/reducers/toastReducer';
import {
  addResource,
  createResourceWithTeamAndOrg,
  updateResource,
} from '@/app/services/resourceServices';
import { postTeamResource } from '@/app/services/teamServices';
import { showToastAction } from '@/app/redux/actions/toastAction';
import ConfirmDialog from '../../Dialog/ConfirmDialog';
import { DATE_FORMAT } from '@/app/constants/constants';
import { setHighlightedRowId } from '@/app/redux/reducers/highlightedRowReducer';
import {
  createTeam,
  updateTeam,
  updateOrganization,
} from '@/app/services/teamServices';
import { fetchAllResourcesDetail } from '@/app/services/allResourcesDetailServices';
import { FETCH_ALL_RESOURCES_DETAIL } from '@/app/redux/actions/allResourcesDetailAction';
import AddTeamForm from '../../Forms/AddTeamForm';
import AddRatesForm from '../../Forms/AddRatesForm';
import {
  FETCH_EMPLOYEE_RATES,
  CREATE_EMPLOYEE_RATES,
  UPDATE_EMPLOYEE_RATES,
} from '@/app/redux/actions/employeeRatesActions';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';
import {
  filterAllocationsForSelectedProject,
  getFormattedAllocationsForUpdate,
} from '@/app/utils/allocationUtils';
import { useAllGridRowsByView } from '@/app/hooks/useAllGridRowsByView';
import { fetchHistory } from '@/app/services/allocationServices';
import { addResourceToTeam } from '@/app/redux/actions/fetchTeamsAction';
import { isCellEditableUtils } from '@/app/utils/common';
import { Description } from '@mui/icons-material';
import AddPortfolioForm from '../../Forms/AddPortfolioForm';
import AddOrganizationForm from '../../Forms/addOrganizationForm';
import {
  CREATE_ORGANISATION,
  DELETE_ORGANISATION,
  FETCH_ORGANISATIONS,
  UPDATE_ORGANISATION,
} from '@/app/redux/actions/organizationsAction';

import AddRoleForm from '../../Forms/AddRoleForm';
import AssignRoleForm from '../../Forms/AssignRoleForm';
import {
  CREATE_PRIVILEGE,
  CREATE_PRIVILEGEASSIGNMENT,
  CREATE_ROLE,
  CREATE_ROLESASSIGNMENT,
  UPDATE_PRIVILEGE,
  UPDATE_PRIVILEGEASSIGNMENT,
} from '@/app/redux/actions/rbacActions';
import { fetchAllOrganisations } from '@/app/services/organisationServices';
import AddPrivilegeForm from '../../Forms/AddPrivilegeForm';
import AssignPrivilegeForm from '../../Forms/AssignPrivilegeForm';
import AddProjectTypesForm from '../../Forms/AddProjectTypesForm';
import AddProjectTypesGroupForm from '../../Forms/AddProjectTypesGroupForm';
import AddLocationForm from '../../Forms/AddLocationForm';
import AddLocationGroupForm from '../../Forms/AddLocationGroupForm';
import { formatAPIResponse, getUserAttributes } from '@/app/utils/authUtils';

const initialValuesMap = {
  add_project: {
    StartDate: new Date().toISOString().split('T')[0],
    EndDate: '',
    Name: '',
    ProjectSponsor: '',
    AllowOvertime: '',
    Location: '',
    ProjectManager: '',
    Status: 'Active',
    Type: '',
    Budget: 0,
  },
  add_team: {
    Name: '',
    AllocationManager: '',
    Status: 'Active',
  },
  edit_team: {
    Name: '',
    AllocationManager: '',
    Status: 'Active',
  },
  add_resource: {
    FirstName: '',
    LastName: '',
    FullName: '',
    Email: '',
    PhoneNumber: '',
    Department: '',
    Organisation: '',
    Role: '',
    HRLevel: '',
    Type: '',
    ContractorHourlyRate: null,
    AverageWeeklyHours: null,
    Team: '',
    Manager: '',
    StartDate: new Date().toISOString().split('T')[0],
    EndDate: '',
    WorkLocation: '',
    Status: '',
  },
  edit_resource: {
    FirstName: '',
    LastName: '',
    FullName: '',
    Email: '',
    PhoneNumber: '',
    Department: '',
    Organisation: '',
    Role: '',
    HRLevel: '',
    Type: '',
    ContractorHourlyRate: null,
    AverageWeeklyHours: null,
    Team: '',
    Manager: '',
    StartDate: '',
    EndDate: '',
    WorkLocation: '',
    Status: '',
    ConfirmTransfer: false,
    shouldTransfer: false,
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
  add_rates: {
    WorkLocation: '',
    HRLevel: '',
    HourlyRate: 0,
    HourlyRateCurrency: 'USD',
    ValidityStartDate: '',
    ValidityEndDate: '',
    Status: 'Active',
  },
  open_history: {
    StartDate: '',
    EndDate: '',
    Resource: '',
    Project: '',
  },
  add_portfolio: {
    Name: '',
    Status: 'Active',
    Description: '',
    SidebarColor: '#000000',
  },
  add_project_type: {
    Name: '',
    ProjectTypeGroup: '',
    Description: '',
    Color: '',
    Status: 'Active',
  },
  edit_project_type: {
    Name: '',
    ProjectTypeGroup: '',
    Description: '',
    Color: '',
    Status: 'Active',
  },
  add_project_type_group: {
    Name: '',
  },
  edit_project_type_group: {
    Name: '',
  },
  add_role: {
    name: '',
  },
  edit_role: {
    Name: '',
    Status: 'Active',
  },
  assign_role: {
    Assignee: '',
    Name: '',
    Role: '',
  },
  edit_role_assignment: {
    Assignee: '',
    Name: '',
    Role: '',
  },
  add_privilege: {
    Name: '',
    Resource: '',
    Actions: {
      Create: false,
      Update: false,
      Read: false,
      Delete: false,
    },
  },
  edit_privilege: {
    Name: '',
    Resource: '',
    Actions: {
      Create: false,
      Update: false,
      Read: false,
      Delete: false,
    },
  },
  assign_privilege: {
    Role: '',
    Privilege: '',
  },
  edit_privilege_assignment: {
    Role: '',
    Privilege: '',
  },
  add_location: {
    Location: '',
    LocationGroup: '',
    Status: 'Active',
  },
  edit_location: {
    Location: '',
    LocationGroup: '',
    Status: '',
  },
  add_location_group: {
    LocationGroup: '',
  },
  edit_location_group: {
    LocationGroup: '',
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
  const { currentView, splitView, splitViewCurrentProject } = useSelector(
    state => state.allocationView
  );
  const { teams, teamsResources, calendarDate } = useSelector(
    state => state.teams
  );
  const { allResourcesDetail } = useSelector(state => state.allResourcesDetail);
  const { user } = useSelector(state => state.user);
  const { email = '' } = getUserAttributes(user, []) || {};
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
  const [HistoryData, setHistoryData] = useState([]);
  const [historyStatus, setHistoryStatus] = useState('loading');
  const { portfolios } = useSelector(state => state.portfolios);
  const { organizations } = useSelector(state => state.organisations);

  const _startDate = currentView?.isDynamicRange
    ? generateDateWeekMath('WEEK_MINUS', currentView?.WeekMinus)
    : currentView?.isFixedRange
      ? currentView?.StartDate
      : startDate;
  const _endDate = currentView?.isDynamicRange
    ? generateDateWeekMath('WEEK_PLUS', currentView?.WeekPlus)
    : currentView?.isFixedRange
      ? currentView?.EndDate
      : endDate;

  const mainAllocationGrid = useAllocationGrid('main');
  const teamAllocationGrid = useAllocationGrid('teamAllocation');
  const projectAllocationGrid = useAllocationGrid('projectAllocation');
  const topProjectAllocationGrid = useAllocationGrid('topProject');
  const bottomTeamAllocationGrid = useAllocationGrid('bottomTeam');

  const { getAllRowsForView, setRowsForView, updateRowsForView } =
    useAllGridRowsByView();

  const [teamOrgData, setTeamOrgData] = useState({
    teamId: null,
    organisationId: null,
    teamName: '',
    organisationName: '',
  });

  const handleResourceFormChange = data => {
    setTeamOrgData(data);
  };

  const getValidationSchema = formType => {
    switch (formType) {
      case 'add_project':
        return addProjectValidationSchema(projects);
      case 'edit_project':
        return addProjectValidationSchema(projects, initialData?.Name || '');
      case 'add_team':
        return addTeamValidationSchema;
      case 'edit_team':
        return addTeamValidationSchema;
      case 'add_resource':
        return addResourceValidationSchema;
      case 'edit_resource': // Temporary later on this will be same as add_resource
        return editResourceValidationSchema;
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
      case 'add_rates':
        return addRatesValidationSchema;
      case 'edit_rates':
        return addRatesValidationSchema;
      case 'open_history':
        return openHistoryValidationSchema;
      case 'add_portfolio':
        return addPortfolioValidationSchema(portfolios);
      case 'edit_portfolio':
        return addPortfolioValidationSchema(portfolios, initialData.Name || '');
      case 'add_role':
        return addRoleValidationSchema;
      case 'edit_role':
        return addRoleValidationSchema;
      case 'assign_role':
        return assignRoleValidationSchema;
      case 'edit_role_assignment':
        return assignRoleValidationSchema;
      case 'add_privilege':
        return addPrivilegeValidationSchema;
      case 'edit_privilege':
        return addPrivilegeValidationSchema;
      case 'assign_privilege':
        return assignPrivilegeValidationSchema;
      case 'edit_privilege_assignment':
        return assignPrivilegeValidationSchema;
      case 'add_organization':
        return addOrganizationValidationSchema(organizations);
      default:
        return null;
    }
  };
  useEffect(() => {
    if (formType && formType !== 'name_view') {
      setFormValue(initialValuesMap[formType] || initialValuesMap.add_project);
    }
  }, [formType]);

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
        const key = `${resource.Id}-${resource.teamId}-${Id}`;

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

  const handleOnAdd = (resources, projects = []) => {
    let rowIds = resources?.reduce((acc, resource) => {
      const organisation = allResourcesDetail.find(
        r => r.Resource.Id === resource.Id
      )?.Organization;
      return [
        ...acc,
        `auto-generated-row-teams/${resource.team?.Name}-resource/${resource.FullName}`,
        `auto-generated-row-organisationName/${organisation?.Name}-resource/${resource.FullName}`,
      ];
    }, []);
    rowIds = projects.reduce((acc, project) => {
      const portfolio = portfolios.find(p => p.Id === project.PortfolioId) ?? {
        Name: 'zzzzz',
      };
      return [
        ...acc,
        `auto-generated-row-portfolioName/${portfolio?.Name}-project/${project.Name}`,
      ];
    }, rowIds);
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

    teams?.forEach(team => {
      if (team?.Id == new_user?.teamId) {
        new_user = { team: team, ...new_user };
      }
    });
    return new_user;
  };

  const getAllocationPresent = (project, resource, period) => {
    const allRows = splitView
      ? bottomTeamAllocationGrid?.getAllRows()
      : getAllRowsForView(
          currentView?.GroupBy === 'Project'
            ? 'projectAllocation'
            : 'teamAllocation'
        );

    for (let i = 0; i < allRows?.length; i++) {
      if (
        allRows[i]?.projectId === project &&
        allRows[i]?.resourceId === resource
      ) {
        return allRows[i][getWeekNumber(new Date(period))];
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
    const {
      Organisation,
      submitType,
      Team,
      ConfirmTransfer,
      shouldTransfer,
      ...cleanedValues
    } = values;

    switch (formType) {
      case 'add_project':
        if (!cleanedValues.StartDate) {
          const today = new Date().toISOString().split('T')[0]; // default to today
          cleanedValues.StartDate = today;
        }
        postData = {
          Name: cleanedValues.Name,
          Description: cleanedValues.Description || '',
          Type: cleanedValues.Type || '',
          Budget: cleanedValues.Budget || 0,
          ProjectSponsor: cleanedValues.ProjectSponsor || null,
          ProjectManager: cleanedValues.ProjectManager || null,
          PortfolioId: cleanedValues.PortfolioId || null,
          Status: cleanedValues.Status || 'Active',
          Location: cleanedValues.Location || '',
          StartDate: cleanedValues.StartDate,
          EndDate: cleanedValues.EndDate || null,
          BudgetCurrency: cleanedValues.BudgetCurrency || 'USD',
          AllowOvertime: cleanedValues.AllowOvertime === 'Yes',
        };
        try {
          dispatch(addProject(postData))
            .then(async response => {
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
              const newProjectId = response.payload?.Project?.Id;
              if (newProjectId) {
                await dispatch(fetchAllProjects());
                dispatch(
                  showToast({
                    open: true,
                    message: 'Project added successfully',
                    type: 'success',
                    position: 'bottom-left',
                    autoHideTimer: 3000,
                  })
                );
                setTimeout(() => {
                  dispatch(setHighlightedRowId(newProjectId));
                }, 4000);
              }

              if (submitType === 'secondary') {
                dispatch(setSplitView(true));
                dispatch(setSplitViewCurrentProject(response.payload.Project));
                dispatch(closeDialog());
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
        } catch (e) {
          console.error('Failed to add project:', e);
        }
        break;

      case 'edit_project':
        postData = {
          Id: initialData.Id,
          Name: cleanedValues.Name,
          Description: cleanedValues.Description || '',
          Type: cleanedValues.Type || '',
          Budget: cleanedValues.Budget || 0,
          ProjectSponsor: cleanedValues.ProjectSponsor || null,
          ProjectManager: cleanedValues.ProjectManager || null,
          PortfolioId: cleanedValues.PortfolioId || null,
          Status: cleanedValues.Status || 'Active',
          Location: cleanedValues.Location || '',
          StartDate: cleanedValues.StartDate,
          EndDate: cleanedValues.EndDate || null,
          BudgetCurrency: cleanedValues.BudgetCurrency || 'USD',
          AllowOvertime:
            cleanedValues.AllowOvertime === true ||
            cleanedValues.AllowOvertime === 'Yes',
        };

        try {
          dispatch(updateProject({ postData, projectId: initialData.Id })).then(
            async response => {
              if (response.meta.requestStatus === 'fulfilled') {
                dispatch(
                  showToast({
                    open: true,
                    message: `Project updated successfully`,
                    type: 'success',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                  })
                );
                return;
              }
            }
          );
          await dispatch(fetchAllProjects());
          dispatch(closeDialog());
          dispatch(setHighlightedRowId(initialData.Id));
        } catch (e) {
          console.error('Failed to edit project:', e);
        }
        break;

      case 'add_team':
        postData = {
          Name: cleanedValues.Name?.trim(),
          AllocationManager: cleanedValues.AllocationManager,
          Status: cleanedValues.Status,
        };

        try {
          dispatch(createTeam(postData))
            .then(async response => {
              if (response.meta.requestStatus === 'rejected') {
                dispatch(
                  showToast({
                    open: true,
                    message: `Failed to add team`,
                    type: 'error',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                  })
                );
                return;
              }

              const newTeamId = response.payload?.Team?.Id;
              if (newTeamId) {
                await dispatch(fetchAllTeams());
                dispatch(setHighlightedRowId(newTeamId));
                dispatch(
                  showToast({
                    open: true,
                    message: `Team added successfully`,
                    type: 'success',
                    position: 'bottom-left',
                    autoHideTimer: 4000,
                  })
                );
              }

              if (pathname !== '/people?tab=teams') {
                router.replace('/people?tab=teams');
              } else {
                dispatch(closeDialog());
              }
            })
            .catch(error => {
              dispatch(
                showToast({
                  open: true,
                  message: `Failed to add team`,
                  type: 'error',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
              console.error('Failed to add team:', error);
            });
        } catch (e) {
          console.error('Failed to add team:', e);
        }
        dispatch(closeDialog());
        break;

      case 'edit_team':
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });

        postData = {
          Name: cleanedValues.Name?.trim(),
          AllocationManager: cleanedValues.AllocationManager,
          Status: cleanedValues.Status,
        };

        try {
          await dispatch(
            updateTeam({
              postData,
              teamId: initialData.Id,
            })
          );

          await dispatch(fetchAllTeams());
          dispatch(setHighlightedRowId(initialData.Id));
          dispatch(
            showToast({
              open: true,
              message: `Team updated successfully`,
              type: 'success',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          dispatch(closeDialog());
        } catch (e) {
          console.error('Failed to update team:', e);
        }
        break;

      case 'add_resource':
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });
        postData = {
          FirstName: cleanedValues.FirstName,
          StartDate: cleanedValues.StartDate,
          LocationCategory: cleanedValues.LocationCategory,
          Email: cleanedValues.Email,
          Manager: cleanedValues.Manager,
          LastName: cleanedValues.LastName,
          ContractorHourlyRateCurrency:
            cleanedValues.ContractorHourlyRateCurrency,
          AverageWeeklyHours: cleanedValues.AverageWeeklyHours,
          Department: cleanedValues.Department,
          Type: cleanedValues.Type,
          EndDate: cleanedValues.EndDate,
          Role: cleanedValues.Role,
          FullName:
            cleanedValues.FirstName?.trim() +
            ' ' +
            cleanedValues.LastName?.trim(),
          Status: cleanedValues.Status,
          ContractorHourlyRate: cleanedValues.ContractorHourlyRate,
          HRLevel: cleanedValues.HRLevel,
          PhoneNumber: cleanedValues.PhoneNumber,
          WorkLocation: cleanedValues.WorkLocation,
          ...(cleanedValues.PreferredFirstName
            ? { PreferredFirstName: cleanedValues.PreferredFirstName }
            : {}),
        };
        try {
          const result = await dispatch(
            createResourceWithTeamAndOrg({
              resourceData: postData,
              teamId: values.Team,
              organizationId: values.Organisation,
            })
          );
          if (result.meta.requestStatus === 'rejected') {
            dispatch(
              showToast({
                open: true,
                message: `Failed to add resource`,
                type: 'error',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
            return;
          }
          const newResource =
            result?.payload?.OrganizationResource?.Resource?.Resource;
          const newResourceId = newResource?.Id ?? null;

          if (newResourceId) {
            await dispatch({
              type: FETCH_ALL_RESOURCES_DETAIL,
              payload: {},
            });
            dispatch(setHighlightedRowId(newResourceId));
            dispatch(
              showToast({
                open: true,
                message: `Resource added successfully`,
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
          }

          if (pathname !== '/people') {
            router.replace('/people');
          }
        } catch (e) {
          console.error('Failed to add resource:', e);
        }
        dispatch(closeDialog());
        break;

      case 'edit_resource':
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });
        postData = {
          ...cleanedValues,
          EndDate:
            cleanedValues.EndDate === undefined || cleanedValues.EndDate === ''
              ? null
              : cleanedValues.EndDate,
        };

        try {
          const selectedTeam = teams?.find(team => team.Id === values.Team);
          let teamAllocationManagerId = null;
          if (selectedTeam?.AllocationManager) {
            const raw = selectedTeam.AllocationManager;
            teamAllocationManagerId = raw.includes('/')
              ? raw.split('/')[1]
              : raw;
          }
          if (!teamAllocationManagerId) {
            console.warn(
              'No Allocation Manager found for selected team:',
              values.Team
            );
          }
          if (values.shouldTransfer === true) {
            try {
              await new Promise((resolve, reject) => {
                dispatch({
                  type: 'TRANSFER_ALLOCATIONS_RESOURCES',
                  payload: {
                    ResourceFrom: initialData.Id,
                    ResourceTo: teamAllocationManagerId,
                    StartDate: format(
                      addDays(
                        parseISO(getMondayOfISO(cleanedValues.EndDate)),
                        7
                      ),
                      DATE_FORMAT
                    ),
                    EndDate: '2099-06-30',
                    resolve,
                    reject,
                  },
                });
              });
              dispatch(
                showToast({
                  open: true,
                  message: 'Allocations transferred successfully!',
                  type: 'success',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
            } catch (error) {
              dispatch(
                showToast({
                  open: true,
                  message: 'Failed to transfer allocations. Please try again.',
                  type: 'error',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
              return;
            }
          }
          await dispatch(
            updateResource({
              postData,
              resourceId: initialData.Id,
            })
          );

          // Check if team changed and update if needed
          if (teamOrgData.teamId && teamOrgData.teamName !== initialData.Team) {
            await dispatch({
              type: 'UPDATE_RESOURCE_TEAM',
              payload: {
                Resource: initialData.Id,
                Team: teamOrgData.teamId,
              },
            });
          }

          // Check if organization changed and update if needed
          if (
            teamOrgData.organisationId &&
            teamOrgData.organisationName !== initialData.Organization
          ) {
            await dispatch({
              type: 'UPDATE_RESOURCE_ORGANISATION',
              payload: {
                Resource: initialData.Id,
                Organization: teamOrgData.organisationId,
              },
            });
          }
          await dispatch({
            type: FETCH_ALL_RESOURCES_DETAIL,
            payload: {},
          });
          dispatch(setHighlightedRowId(initialData.Id));
          dispatch(
            showToast({
              open: true,
              message: `Resource updated successfully`,
              type: 'success',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
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
            projects?.filter(project => values.Project.includes(project.Id)) ||
            [];

          if (
            filteredProjects.some(p => !p.AllowOvertime) &&
            values.AllocationEntered > 1.0
          ) {
            dispatch(
              showToastAction(
                true,
                'Allocation cannot exceed 1.0 for projects that do not allow overtime.',
                'error',
                4000
              )
            );
            dispatch(closeDialog());
            return;
          }

          const warningMessages = [];
          const errorMessages = [];
          const deleteList = [];
          const updateList = [];
          let allUpdatedRows = [];

          const nonEditableWeeks = [];

          allMondays.flatMap(monday => {
            return values.Resource.flatMap(resource => {
              return filteredProjects.map(project => {
                const allocation = getAllocationPresent(
                  project.Id,
                  resource,
                  monday
                );

                // Perform Delete if AllocationEntered is 0
                if (values?.AllocationEntered === 0) {
                  if (allocation && allocation?.allocationId) {
                    deleteList.push({
                      Id: allocation?.allocationId,
                      Resource: resource,
                      Project: project.Id,
                      ProjectName: project.Name,
                      Period: allocation?.period,
                      AllocationEntered: null,
                    });
                  }
                  return;
                }

                //Check if Allocation is within the range of StartDate and EndDate of resource
                const resourceDetails = resources?.find(
                  res => res.Id === resource
                );
                const weekKey = getWeekNumber(new Date(monday)); // Convert Monday to WXX key
                if (
                  resourceDetails &&
                  !isResourceWithinDate(resourceDetails, new Date(monday))
                ) {
                  nonEditableWeeks.push(weekKey);
                  return;
                }

                // If current week is editable, but their are weeks that are non editable, then skip the update.
                if (nonEditableWeeks.length > 0) {
                  return;
                }

                const newFinalTotal = getUpdatedTotalWeeklyAllocation(
                  splitView
                    ? bottomTeamAllocationGrid?.getAllRows()
                    : getAllRowsForView(
                        currentView?.GroupBy === 'Project'
                          ? 'projectAllocation'
                          : 'teamAllocation'
                      ),
                  resource,
                  weekKey,
                  values.AllocationEntered,
                  filteredProjects
                );
                if (newFinalTotal > 2.0) {
                  errorMessages.push(
                    `Total allocation for week ${weekKey} exceeds 2.0 (${newFinalTotal.toFixed(2)}). Update skipped.`
                  );
                  return null;
                }

                if (newFinalTotal > 1.5 && newFinalTotal <= 2.0) {
                  warningMessages.push(
                    `Total allocation for week ${weekKey} exceeds 1.5 (${newFinalTotal.toFixed(2)}).`
                  );
                }

                if (
                  allocation &&
                  allocation?.allocationId &&
                  allocation?.value
                ) {
                  if (allocation?.value !== values.AllocationEntered) {
                    // This is for the Bulk Allocation API.
                    updateList.push({
                      Id: allocation?.allocationId,
                      Resource: resource,
                      Project: project.Id,
                      ProjectName: project.Name,
                      Period: allocation?.period,
                      AllocationEntered: values.AllocationEntered,
                    });
                  }
                } else {
                  // This is for the Bulk Allocation API.
                  updateList.push({
                    Resource: resource,
                    Project: project.Id,
                    ProjectName: project.Name,
                    Period: format(monday, DATE_FORMAT),
                    AllocationEntered: values.AllocationEntered,
                  });
                }
              });
            });
          });

          if (nonEditableWeeks.length > 0) {
            dispatch(
              showToastAction(
                true,
                `Update cancelled: You are editing non-editable week(s): ${[
                  ...new Set(nonEditableWeeks),
                ].join(', ')}`,
                'error',
                4000
              )
            );
            dispatch(closeDialog());
            return;
          }

          if (deleteList.length === 0 && updateList.length === 0) {
            if (errorMessages.length > 0) {
              if (errorMessages.length > 1) {
                dispatch(
                  showToastAction(
                    true,
                    'Total allocation for the multiple selected weeks and/or projects and/or resources exceeds 2.0. Please check and try again.',
                    'error',
                    4000
                  )
                );
              } else {
                errorMessages.forEach(msg => {
                  dispatch(showToastAction(true, msg, 'error', 4000));
                });
              }
            } else {
              dispatch(
                showToastAction(
                  true,
                  `Allocations upto date. No changes made.`,
                  'info'
                )
              );
            }
            return;
          }

          dispatch(
            showToastAction(
              true,
              `Updating allocation for ${
                Array.isArray(values.Resource)
                  ? values.Resource.reduce((acc, resourceId) => {
                      const resource = resources?.find(
                        r => r.Id === resourceId
                      );
                      if (!resource) return acc;
                      return (
                        acc +
                        resources?.find(resource => resource.Id === resourceId)
                          ?.FullName +
                        ', '
                      );
                    }, '').slice(0, -2)
                  : resources?.find(r => r.Id === values.Resource)?.FullName
              }...`,
              'info'
            )
          );

          const formatedDeleteList = deleteList.reduce((acc, allocation) => {
            if (acc[allocation.Resource]) {
              acc[allocation.Resource] = [
                ...acc[allocation.Resource],
                allocation.Id,
              ];
            } else {
              acc[allocation.Resource] = [allocation.Id];
            }
            return acc;
          }, {});

          const formatedUpdate = updateList.reduce((acc, allocation) => {
            if (acc[allocation.Resource]) {
              acc[allocation.Resource] = [
                ...acc[allocation.Resource],
                allocation,
              ];
            } else {
              acc[allocation.Resource] = [allocation];
            }
            return acc;
          }, {});

          const deletePromises = Object.keys(formatedDeleteList).map(
            resourceId => {
              return new Promise((resolve, reject) =>
                dispatch({
                  type: 'DELETE_BULK_ALLOCATIONS',
                  payload: {
                    resourceId,
                    allocList: formatedDeleteList[resourceId],
                    resolve,
                    reject,
                  },
                })
              );
            }
          );

          const allocationPromises = Object.keys(formatedUpdate).map(
            resourceId => {
              return new Promise((resolve, reject) =>
                dispatch({
                  type: 'UPDATE_BULK_ALLOCATIONS',
                  payload: {
                    resourceId,
                    allocList: formatedUpdate[resourceId],
                    resolve,
                    reject,
                  },
                })
              );
            }
          );

          await Promise.all([...allocationPromises, ...deletePromises]).then(
            async response => {
              if (response && response[0].length > 0) {
                response = response[0];
                response = formatAPIResponse('Allocation', response);
                let allocationsUpdated = [];
                // handle for bulk Delete different responce
                if (deleteList.length > 0) {
                  allocationsUpdated = deleteList;
                } else {
                  allocationsUpdated = response.reduce((arr, res) => {
                    // Check if result exists and is an array before spreading
                    if (res && Array.isArray(res)) {
                      return [...arr, ...res];
                    }
                    // If it's not an array but has a value you want to include
                    else if (res !== undefined) {
                      return [...arr, res];
                    }
                    // Otherwise just return the accumulator unchanged
                    return arr;
                  }, []);
                }

                const formateUpdate = getFormattedAllocationsForUpdate(
                  allocationsUpdated,
                  teams,
                  teamsResources,
                  allResourcesDetail,
                  portfolios,
                  projects,
                  resources,
                  splitView,
                  bottomTeamAllocationGrid,
                  teamAllocationGrid,
                  currentView?.isDynamicRange
                    ? generateDateWeekMath('WEEK_MINUS', currentView?.WeekMinus)
                    : currentView?.isFixedRange
                      ? currentView?.StartDate
                      : startDate,
                  currentView?.isDynamicRange
                    ? generateDateWeekMath('WEEK_PLUS', currentView?.WeekPlus)
                    : currentView?.isFixedRange
                      ? currentView?.EndDate
                      : endDate
                );

                const blankRowsToBeRemoved = Object.values(formateUpdate).map(
                  row =>
                    getAllRowsForView(
                      splitView ? 'bottomTeam' : 'teamAllocation'
                    ).find(
                      r =>
                        r.id.includes(row.teams) && r.id.includes(row.resource)
                    )
                );

                allUpdatedRows = [
                  ...Object.values(formateUpdate),
                  ...blankRowsToBeRemoved
                    .filter(r => r)
                    .map(row => ({
                      ...row,
                      _action: 'delete',
                    })),
                ];
              }
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
              if (allUpdatedRows?.length > 0) {
                if (splitView) {
                  let allRowsForTopProjectAllocationGrid =
                    topProjectAllocationGrid.getAllRows();
                  // Update Allocation for Top Project Allocation Grid
                  await updateRowsForView('topProject', [
                    ...allUpdatedRows,
                    ...allRowsForTopProjectAllocationGrid
                      .filter(row => row.id.startsWith(row.projectId))
                      .map(row => ({
                        ...row,
                        _action: 'delete',
                      })),
                  ]);
                  // After completing filter to show only current selected Project
                  allRowsForTopProjectAllocationGrid =
                    topProjectAllocationGrid.getAllRows();
                  topProjectAllocationGrid.setRows(
                    filterAllocationsForSelectedProject(
                      allRowsForTopProjectAllocationGrid,
                      splitViewCurrentProject
                    )
                  );

                  // Update Allocation for Bottom Team Allocation Grid
                  updateRowsForView('bottomTeam', allUpdatedRows);
                  updateRowsForView('projectAllocation', allUpdatedRows);
                  updateRowsForView('teamAllocation', allUpdatedRows);
                } else {
                  updateRowsForView('projectAllocation', allUpdatedRows);
                  updateRowsForView('teamAllocation', allUpdatedRows);
                }
                dispatch(
                  showToastAction(
                    true,
                    `Successfully updated allocation for ${new_resources?.map(newRes => newRes?.FullName).join(', ')}...`,
                    'success'
                  )
                );
              }
              handleOnAdd(new_resources, filteredProjects);
              handleScrollAndFocus(new_resources, allMondays, filteredProjects);
            }
          );
        } catch (e) {
          console.error('Error creating allocations:', e);
          dispatch(
            showToastAction(
              true,
              `Failed to create allocation for ${
                Array.isArray(values.Resource)
                  ? values.Resource.reduce((acc, resourceId) => {
                      const resource = resources?.find(
                        r => r.Id === resourceId
                      );
                      if (!resource) return acc;
                      return (
                        acc +
                        resources?.find(resource => resource.Id === resourceId)
                          ?.FullName +
                        ', '
                      );
                    }, '').slice(0, -2)
                  : resources?.find(r => r.Id === values.Resource)?.FullName
              }`,
              'error',
              4000
            )
          );
        } finally {
          dispatch(closeDialog());
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
            dispatch(
              showToast({
                open: true,
                message: `View "${values.name}" updated successfully`,
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
            dispatch(closeDialog());
          } else {
            const userId = getUserIdFromEmail(resources || [], email);
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
            dispatch(
              showToast({
                open: true,
                message: `New view "${values.name}" created successfully`,
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
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
            dispatch(
              showToast({
                open: true,
                message: `View saved successfully`,
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
            dispatch(closeDialog());
          }
        } catch (e) {
          console.error('Error saving view:', e);
        }
        break;

      case 'clone_resource':
        try {
          const sourceResourceName = initialData?.Resource;
          const sourceResourceId = resources?.find(
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
                        // Will take care of this wehn I fix Clone API
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
                        // Will take care of this wehn I fix Clone API
                        Resource: targetResourceId,
                        Project: projectId,
                        ProjectName: initialData.Project,
                        AllocationEntered: sourceAlloc.value,
                        Period: format(monday, DATE_FORMAT),
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

      case 'add_rates':
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });
        postData = {
          ...cleanedValues,
        };

        new Promise((resolve, reject) => {
          dispatch({
            type: 'CREATE_EMPLOYEE_RATES',
            payload: {
              postData,
              resolve,
              reject,
            },
          });
        })
          .then(response => {
            dispatch(
              showToast({
                open: true,
                message: 'Rate added successfully.',
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
            dispatch(setHighlightedRowId(response?.EmployeeRate?.Id));
          })
          .catch(error => {
            console.error('Failed to add rate:', error);
            dispatch(
              showToast({
                open: true,
                message: 'Failed to add rate.',
                type: 'error',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
          })
          .finally(() => {
            dispatch(closeDialog());
          });

        break;

      case 'edit_rates':
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });
        let updatedFields = {
          ...cleanedValues,
          WorkLocation: cleanedValues.WorkLocation,
          HRLevel: cleanedValues.HRLevel,
          ValidityStartDate: cleanedValues.ValidityStartDate,
          ValidityEndDate: cleanedValues.ValidityEndDate,
          HourlyRate: cleanedValues.HourlyRate || 0,
          HourlyRateCurrency: cleanedValues.HourlyRateCurrency,
          Status: cleanedValues.Status,
        };
        new Promise((resolve, reject) => {
          dispatch({
            type: 'UPDATE_EMPLOYEE_RATES',
            payload: {
              id: initialData.Id,
              updatedFields,
              resolve,
              reject,
            },
          });
        })
          .then(response => {
            dispatch(
              showToast({
                open: true,
                message: 'Rate updated successfully.',
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
            dispatch(closeDialog());
            dispatch(setHighlightedRowId(response?.[0]?.Id));
          })
          .catch(error => {
            console.error('Failed to update rate:', error);
            dispatch(
              showToast({
                open: true,
                message: 'Failed to update rate.',
                type: 'error',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
          });

        break;
      case 'add_portfolio':
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });

        postData = {
          ...cleanedValues,
        };
        new Promise((resolve, reject) => {
          dispatch({
            type: 'CREATE_PORTFOLIOS',
            payload: {
              postData,
              resolve,
              reject,
            },
          });
        })
          .then(response => {
            dispatch(
              showToast({
                open: true,
                message: 'Portfolio added successfully.',
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
            dispatch(setHighlightedRowId(response.Id));
          })
          .catch(error => {
            console.error('Failed to add portfolio:', error);
            dispatch(
              showToast({
                open: true,
                message: 'Failed to add portfolio.',
                type: 'error',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
          })
          .finally(() => {
            dispatch(closeDialog());
          });
        break;
      case 'add_organization':
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });

        postData = {
          ...cleanedValues,
        };
        new Promise((resolve, reject) => {
          dispatch({
            type: CREATE_ORGANISATION,
            payload: {
              postData,
              resolve,
              reject,
            },
          });
        })
          .then(response => {
            dispatch(
              showToast({
                open: true,
                message: 'Organization added successfully.',
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
            dispatch(setHighlightedRowId(response?.Organization?.Id));
          })
          .catch(error => {
            console.error('Failed to add organization:', error);
            dispatch(
              showToast({
                open: true,
                message: 'Failed to add organization.',
                type: 'error',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
          })
          .finally(() => {
            dispatch(closeDialog());
          });
        break;
      case 'edit_organization':
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });

        const postData = {
          Name: cleanedValues.Name?.trim(),
          Status: cleanedValues.Status,
        };
        try {
          const result = await dispatch(
            updateOrganization({
              postData,
              organizationId: initialData.Id,
            })
          );

          dispatch(setHighlightedRowId(initialData.Id));

          if (result.meta.requestStatus === 'rejected') {
            dispatch(
              showToast({
                open: true,
                message: `Failed to update organization.`,
                type: 'error',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
            return;
          }

          const updated = result?.payload?.result;
          dispatch(setHighlightedRowId(updated?.Id || updated?.__Id__));
          dispatch({ type: FETCH_ORGANISATIONS });
          dispatch(
            showToast({
              open: true,
              message: 'Organization updated successfully.',
              type: 'success',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          dispatch(closeDialog());
        } catch (e) {
          console.error('Failed to update organization:', e);
        }
        break;

      case 'edit_portfolio': {
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });

        const updatedFields = { ...cleanedValues };
        try {
          const response = await new Promise((resolve, reject) => {
            dispatch({
              type: 'UPDATE_PORTFOLIOS',
              payload: {
                id: initialData?.Id,
                updatedFields,
                resolve,
                reject,
              },
            });
          });

          dispatch(
            showToast({
              open: true,
              message: 'Portfolio updated successfully.',
              type: 'success',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          dispatch(setHighlightedRowId(response?.Id));
          dispatch(closeDialog());
        } catch (error) {
          console.error('Failed to update portfolio:', error);
          const message =
            error?.response?.data?.exception || 'Failed to update portfolio.';
          dispatch(
            showToast({
              open: true,
              message: message,
              type: 'error',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
        }

        return;
      }
      case 'add_role':
        {
          Object.keys(cleanedValues).forEach(key => {
            if (cleanedValues[key] === '') {
              cleanedValues[key] = null;
            }
          });
          const postData = { ...cleanedValues };
          new Promise((resolve, reject) => {
            dispatch({
              type: CREATE_ROLE,
              payload: {
                postData,
                resolve,
                reject,
              },
            });
          })
            .then(response => {
              dispatch(
                showToast({
                  open: true,
                  message: 'Role added successfully.',
                  type: 'success',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
              dispatch(setHighlightedRowId(response?.Role.name));
            })
            .catch(error => {
              console.error('Failed to add role:', error);
              dispatch(
                showToast({
                  open: true,
                  message: 'Failed to add role.',
                  type: 'error',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
            })
            .finally(() => {
              dispatch(closeDialog());
            });
        }
        break;
      case 'add_project_type': {
        //add project type
        break;
      }
      case 'edit_project_type': {
        //Edit project type
        break;
      }
      case 'add_project_type_group': {
        //add project type group
        break;
      }
      case 'edit_project_type_group': {
        //edit project type group
        break;
      }

      case 'assign_role':
        {
          Object.keys(cleanedValues).forEach(key => {
            if (cleanedValues[key] === '') {
              cleanedValues[key] = null;
            }
          });

          const postData = {
            ...cleanedValues,
            // Assignee: cleanedValues.Assignee?.id || null, //Will be changed while integrating with API
            Role: values.Role || null,
            Name: values.Role
              ? `${cleanedValues.Assignee?.id}`
              : null,
          };

          new Promise((resolve, reject) => {
            dispatch({
              type: CREATE_ROLESASSIGNMENT,
              payload: {
                postData,
                resolve,
                reject,
              },
            });
          })
            .then(response => {
              dispatch(
                showToast({
                  open: true,
                  message: 'Role assigned successfully.',
                  type: 'success',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
              dispatch(setHighlightedRowId(response.result?.Name));
            })
            .catch(error => {
              console.error('Failed to assign role:', error);
              dispatch(
                showToast({
                  open: true,
                  message: 'Failed to assign role.',
                  type: 'error',
                  position: 'bottom-left',
                  autoHideTimer: 4000,
                })
              );
            })
            .finally(() => {
              dispatch(closeDialog());
            });
        }
        break;

      case 'add_privilege': {
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });
        const { Name, Resource, Actions } = cleanedValues;

        const postData = {
          id: cleanedValues.Name,
          resourceFqName: cleanedValues.Resource,
          c: cleanedValues.Actions?.Create || false,
          r: cleanedValues.Actions?.Read || false,
          u: cleanedValues.Actions?.Update || false,
          d: cleanedValues.Actions?.Delete || false,
        };

        new Promise((resolve, reject) => {
          dispatch({
            type: CREATE_PRIVILEGE,
            payload: {
              postData,
              resolve,
              reject,
            },
          });
        })
          .then(response => {
            dispatch(
              showToast({
                open: true,
                message: 'Privilege added successfully.',
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
            dispatch(setHighlightedRowId(response.result?.id));
          })
          .catch(error => {
            console.error('Failed to add privilege:', error);
            dispatch(
              showToast({
                open: true,
                message: 'Failed to add privilege.',
                type: 'error',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
          })
          .finally(() => {
            dispatch(closeDialog());
          });
        break;
      }
      case 'edit_privilege': {
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });

        if (Array.isArray(cleanedValues.Resource)) {
          cleanedValues.Resource = cleanedValues.Resource[0] || null;
        }

        const { Name, Resource, Actions } = cleanedValues;
        const updatedFields = {
          id: cleanedValues.Name,
          resourceFqName: cleanedValues.Resource,
          c: cleanedValues.Actions?.Create || false,
          r: cleanedValues.Actions?.Read || false,
          u: cleanedValues.Actions?.Update || false,
          d: cleanedValues.Actions?.Delete || false,
        };

        try {
          const response = await new Promise((resolve, reject) => {
            dispatch({
              type: UPDATE_PRIVILEGE,
              payload: {
                id: cleanedValues.Name,
                updatedFields,
                resolve,
                reject,
              },
            });
          });

          dispatch(
            showToast({
              open: true,
              message: 'Privilege updated successfully.',
              type: 'success',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          dispatch(setHighlightedRowId(cleanedValues.Name));
          dispatch(closeDialog());
        } catch (error) {
          const message =
            error?.response?.data?.exception || 'Failed to update privilege.';
          dispatch(
            showToast({
              open: true,
              message,
              type: 'error',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
        }
        return;
      }
      case 'assign_privilege': {
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });
        const postData = {
          ...cleanedValues,
          Role: values.Role || null,
          Privilege: values.Privilege || null,
        };
        new Promise((resolve, reject) => {
          dispatch({
            type: CREATE_PRIVILEGEASSIGNMENT,
            payload: {
              postData,
              resolve,
              reject,
            },
          });
        })
          .then(response => {
            dispatch(
              showToast({
                open: true,
                message: 'Privilege assigned successfully.',
                type: 'success',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
            dispatch(setHighlightedRowId(response.result?.Name));
          })
          .catch(error => {
            console.error('Failed to assign privilege:', error);
            dispatch(
              showToast({
                open: true,
                message: 'Failed to assign privilege.',
                type: 'error',
                position: 'bottom-left',
                autoHideTimer: 4000,
              })
            );
          })
          .finally(() => {
            dispatch(closeDialog());
          });
        break;
      }
      case 'edit_privilege_assignment': {
        Object.keys(cleanedValues).forEach(key => {
          if (cleanedValues[key] === '') {
            cleanedValues[key] = null;
          }
        });

        const updatedFields = {
          Role: values.Role || null,
          Privilege: values.Privilege || null,
        };

        try {
          const response = await new Promise((resolve, reject) => {
            dispatch({
              type: UPDATE_PRIVILEGEASSIGNMENT,
              payload: {
                name: initialData?.Name,
                updatedFields,
                resolve,
                reject,
              },
            });
          });

          dispatch(
            showToast({
              open: true,
              message: 'Privilege assignment updated successfully.',
              type: 'success',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
          dispatch(setHighlightedRowId(response.result?.Name));
          dispatch(closeDialog());
        } catch (error) {
          const message =
            error?.response?.data?.exception ||
            'Failed to update privilege assignment.';
          dispatch(
            showToast({
              open: true,
              message,
              type: 'error',
              position: 'bottom-left',
              autoHideTimer: 4000,
            })
          );
        }
        return;
      }
      case 'add_location': {
        console.log('add_location');
      }
      case 'edit_location': {
        console.log('edit_location');
      }
      case 'add_location_group': {
        console.log('add_location_group');
      }
      case 'edit_location_group':
        {
          console.log('edit_location_group');
        }
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
      const sourceResourceId = resources?.find(
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
                    // Will take care of this wehn I fix Transfer API
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
                    // Will take care of this wehn I fix Transfer API
                    Resource: targetResourceId,
                    Project: projectId,
                    ProjectName: initialData.Project,
                    AllocationEntered: sourceAlloc.value,
                    Period: format(monday, DATE_FORMAT),
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

  useEffect(() => {
    if (formType === 'open_history') {
      const BATCH_SIZE = 20;
      const BATCH_DELAY = 100;

      const progressivelyLoadHistory = fullData => {
        let index = 0;
        setHistoryData([]); // Reset before appending
        setHistoryStatus('loaded');
        const loadNextBatch = () => {
          const nextBatch = fullData.slice(index, index + BATCH_SIZE);
          setHistoryData(prev => [...prev, ...nextBatch]);
          index += BATCH_SIZE;

          if (index < fullData.length) {
            setTimeout(loadNextBatch, BATCH_DELAY);
          }
        };

        loadNextBatch();
      };

      const fetchHistoryData = async () => {
        try {
          setHistoryData([]);
          setHistoryStatus('loading');
          const response = await fetchHistory(initialData);
          if (response?.error) {
            console.error('Failed to fetch history:', response.error);
            return;
          }

          // If result is empty, return immediately
          if (response?.result === null && response?.status === 'not-found') {
            setHistoryStatus('no-data');
            setHistoryData([]);
            return;
          }

          const formattedHistory = [];
          (response && response.result ? response.result : [])
            .filter(
              item =>
                Array.isArray(item.ChangesLog) && item.ChangesLog.length > 0
            )
            .forEach((item, idx) => {
              const {
                ResourceName,
                ProjectName,
                Period,
                AllocationEntered,
                ChangesLog = [],
                AllocationId,
              } = item;

              // Helper functions
              const getUserInitials = email => {
                if (!email) return '';
                const [name] = email.split('@');
                const parts = name.split(/[.\s_]/);
                return parts
                  .map(p => p[0]?.toUpperCase())
                  .join('')
                  .slice(0, 2);
              };
              const getUserName = email => {
                if (!email) return '';
                const [name] = email.split('@');
                return name
                  .split(/[.\s_]/)
                  .map(p => p.charAt(0).toUpperCase() + p.slice(1))
                  .join(' ');
              };
              const getDateString = ts => {
                if (!ts) return '';
                const date = new Date(ts);
                return date
                  .toLocaleDateString('en-US', {
                    month: 'short',
                    day: '2-digit',
                    year: 'numeric',
                  })
                  .replace(/ /g, ' ');
              };
              const getRelativeTime = ts => {
                if (!ts) return '';
                const now = Date.now();
                const diff = now - ts * 1000;
                const min = Math.floor(diff / 60000);
                if (min < 60) return `${min} minute${min === 1 ? '' : 's'} ago`;
                const hr = Math.floor(min / 60);
                if (hr < 24) return `${hr} hour${hr === 1 ? '' : 's'} ago`;
                const day = Math.floor(hr / 24);
                return `${day} day${day === 1 ? '' : 's'} ago`;
              };

              // Calculate week number from Period
              let weekNumber = '';
              if (Period) {
                const d = new Date(Period);
                if (!isNaN(d)) {
                  const temp = new Date(d.getTime());
                  temp.setHours(0, 0, 0, 0);
                  temp.setDate(temp.getDate() + 4 - (temp.getDay() || 7));
                  const yearStart = new Date(temp.getFullYear(), 0, 1);
                  weekNumber = Math.ceil(
                    ((temp - yearStart) / 86400000 + 1) / 7
                  );
                }
              }

              // For each change log, create a history entry
              ChangesLog.forEach((log, logIdx) => {
                let action = '';
                let fromVersion = '';
                let toVersion = '';

                // Find the next log entry if it exists
                const nextLog = ChangesLog[logIdx + 1];

                if (log.Action?.toLowerCase() === 'create') {
                  action = 'Created';
                  fromVersion = log.AllocationEnteredLast ?? '';
                  toVersion = nextLog
                    ? (nextLog.AllocationEnteredLast ?? '')
                    : (AllocationEntered ?? '');
                } else if (log.Action?.toLowerCase() === 'update') {
                  action = 'Updated';
                  fromVersion = log.AllocationEnteredLast ?? '';
                  toVersion = nextLog
                    ? (nextLog.AllocationEnteredLast ?? '')
                    : (AllocationEntered ?? '');
                } else if (log.Action?.toLowerCase() === 'delete') {
                  action = 'Deleted';
                  fromVersion = log.AllocationEnteredLast ?? '';
                  toVersion = '';
                } else {
                  action = log.Action;
                }

                formattedHistory.push({
                  id: `${AllocationId || idx + 1}-${logIdx + 1}`,
                  userInitials: getUserInitials(ResourceName),
                  userName: getUserName(ResourceName),
                  projectName: ProjectName,
                  weekNumber: weekNumber ? Number(weekNumber) : undefined,
                  date: getDateString(Period),
                  timestamp: getRelativeTime(log.Timestamp),
                  action,
                  fromVersion:
                    fromVersion !== undefined ? String(fromVersion) : '',
                  toVersion: toVersion !== undefined ? String(toVersion) : '',
                  byUser: getUserName(log.User),
                  _timestampRaw: log.Timestamp, // Add raw timestamp for sorting
                });
              });
            });

          // Sort by _timestampRaw descending (latest first)
          formattedHistory.sort(
            (a, b) => (b._timestampRaw || 0) - (a._timestampRaw || 0)
          );

          progressivelyLoadHistory(formattedHistory);
        } catch (error) {
          console.error('Error fetching history:', error);
        }
      };

      fetchHistoryData();
    }
  }, [formType]);

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
      case 'add_team':
        return (
          <AddTeamForm formikProps={formikProps} setFormValue={setFormValue} />
        );
      case 'edit_team':
        return (
          <AddTeamForm formikProps={formikProps} setFormValue={setFormValue} />
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
            onValuesChange={handleResourceFormChange}
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
      case 'add_rates':
        return (
          <AddRatesForm formikProps={formikProps} setFormValue={setFormValue} />
        );
      case 'edit_rates':
        return (
          <AddRatesForm formikProps={formikProps} setFormValue={setFormValue} />
        );
      case 'open_history':
        return (
          <HistoryForm
            formikProps={formikProps}
            setFormValue={setFormValue}
            historyData={HistoryData}
            historyStatus={historyStatus}
          />
        );
      case 'add_portfolio':
        return (
          <AddPortfolioForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'edit_portfolio':
        return (
          <AddPortfolioForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );

      case 'add_organization':
        return (
          <AddOrganizationForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'edit_organization':
        return (
          <AddOrganizationForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'edit_organization':
        return (
          <AddOrganizationForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );

      case 'add_role':
        return (
          <AddRoleForm formikProps={formikProps} setFormValue={setFormValue} />
        );
      case 'edit_role':
        return (
          <AddRoleForm formikProps={formikProps} setFormValue={setFormValue} />
        );
      case 'assign_role':
        return (
          <AssignRoleForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'edit_role_assignment':
        return (
          <AssignRoleForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'add_privilege':
        return (
          <AddPrivilegeForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'edit_privilege':
        return (
          <AddPrivilegeForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'assign_privilege':
        return (
          <AssignPrivilegeForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'edit_privilege_assignment':
        return (
          <AssignPrivilegeForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'add_project_type':
        return (
          <AddProjectTypesForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'add_location':
        return (
          <AddLocationForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'edit_project_type':
        return (
          <AddProjectTypesForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'edit_location':
        return (
          <AddLocationForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'add_project_type_group':
        return (
          <AddProjectTypesGroupForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'add_location_group':
        return (
          <AddLocationGroupForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'edit_project_type_group':
        return (
          <AddProjectTypesGroupForm
            formikProps={formikProps}
            setFormValue={setFormValue}
          />
        );
      case 'edit_location_group':
        return (
          <AddLocationGroupForm
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
    setFormValue({});
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
          viewOnly={formType === 'open_history'}
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
              const resource = resources?.find(res => res.Id === resourceId);
              return resource?.FullName || 'Unknown Resource';
            }).join(', ')}
            &nbsp; - &nbsp;
            {pendingTransferData?.values?.Project?.map(projectId => {
              const project = projects?.find(proj => proj.Id === projectId);
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
