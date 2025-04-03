import React, { useEffect, useState } from 'react';
import { Formik, ErrorMessage } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import CustomDialog from '../../Dialog/CustomDialog';
import AddProjectForm from '../../Forms/AddProjectForm';
import AddResourceForm from '../../Forms/AddResourceForm';
import AddAllocationForm from '../../Forms/AddAllocationForm';
import AssignAllocationForm from '../../Forms/AssignAllocationForm';
import {
  addAllocationValidationSchema,
  addProjectValidationSchema,
  addResourceValidationSchema,
  assignAllocationValidationSchema,
} from '../../Forms/ValidationSchema';
import { addProject, updateProject } from '@/app/services/projectServices';
import { closeDialog } from '@/app/redux/reducers/dialogReducer';
import { generateAllMondays, getWeekNumber } from '@/app/utils/common';
import { setResourceAllocation, updateResourceAllocation } from '@/app/redux/actions/resourceAllocationAction';
import { fetchResourcesAgainstTeams } from '@/app/redux/actions/fetchTeamsAction';
import { setCellSelectionData, setExpandRowId } from '@/app/redux/reducers/allocationViewReducer';
import { Box, Typography } from '@mui/material';
import { fetchAllProjectAllocations } from '@/app/redux/actions/fetchProjectsAction';
import { useRouter, usePathname } from 'next/navigation';

const initialValuesMap = {
  add_project: {
    StartDate: '',
    EndDate: '',
    Name: '',
    Owner: '',
    AllowOvertime: '',
    Location: '',
    Manager: '',
    Status: "",
    Type: ""
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
};

const AllocationForm = () => {
  const { formType } = useSelector((state) => state.globalDialog.formState);
  const [formValue, setFormValue] = useState(initialValuesMap[formType] || initialValuesMap.add_project);
  const dispatch = useDispatch();
  const { initialData } = useSelector((state) => state.globalDialog.formState);
  const { projects } = useSelector((state) => state.projects);

  const { teams, teamsResources, calendarDate } = useSelector(state => state.teams);
  const { startDate, endDate } = calendarDate || {};
  const { allocations } = useSelector(state => state.dataGrid);
  const { rowState } = useSelector(state => state.dataGrid);
  const { view } = useSelector(state => state.allocationView);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    setFormValue(initialValuesMap[formType] || initialValuesMap.add_project);
  }, [formType]);
  
  const getValidationSchema = (formType) => {
    switch (formType) {
      case 'add_project':
        return addProjectValidationSchema(projects);
      case 'add_resource':
        return addResourceValidationSchema;
      case 'add_allocation':
        return addAllocationValidationSchema;
      case 'assign_allocation':
        return assignAllocationValidationSchema;
      default:
        return null;
    }
  };

  const handleScrollAndFocus =(resourceId, teamId, period, project)=>{
    const [{ Id }] = project;
    const selectedWeeks = period.flatMap((monday)=>getWeekNumber(monday))
    const weeksObject = {};
    selectedWeeks.forEach(week => {
        weeksObject[`${week}`] = true;
    });
    let cellData;
    if (view ==="teams"){
      cellData = {
        [`${resourceId}-${teamId}-${Id}`]: weeksObject
      };
    }else{
      cellData = {
        [`${resourceId}-${Id}`]: weeksObject
      };
    }
    dispatch(setCellSelectionData(cellData))
  }
  const handleOnAdd = (team, resource) => {
    let row_id = `auto-generated-row-teams/${team}-resource/${resource}`;
    dispatch(setExpandRowId(row_id));
  }

  const getTeamByResourceId = (resourceId) => {
    let new_user = null;
    Object.keys(teamsResources)?.forEach((team) => {
      teamsResources?.[team]?.forEach((resource) => {
        if (resource?.Id == resourceId) {
          new_user = { ...resource, teamId: team };
        }
      })
    });

    teams?.result?.forEach((team) => {
      if (team?.Id == new_user?.teamId) {
        new_user = { team: team, ...new_user };
      }
    });
    return new_user;
  };

  const getAllocationPresent = (project, resource, period) => {
    for( let i = 0; i < rowState?.length; i++) {
      if(rowState[i]?.projectId === project && rowState[i]?.resourceId === resource) {
        return rowState[i][getWeekNumber(new Date(period))];
      }
    }
    return false
  }

  const handleSubmit = async (values, { setSubmitting, setErrors, validateForm }) => {
    const errors = await validateForm(values);
    if (Object.keys(errors).length > 0) {
      setErrors(errors);
      setSubmitting(false);
      return;
    }
    
    const allMondays = generateAllMondays(values.StartDate, values.EndDate);
    let postData = {};
    switch (formType) {
      case 'add_project':
        postData = {
          "ResourceAllocation.Core/Project": {
            ...values,
            Description: "string",
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
          .catch((error) => {
            console.error("Failed to add project:", error);
          });
          if(pathname !== '/project') {
            router.replace('/project');
          }
        } catch (e) {
          console.log(e);
        }
        break;

      case 'edit_project':
        postData = {
          "ResourceAllocation.Core/Project": {
            ...values,
            Description: "string",
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
          const filteredProjects = projects?.result?.filter((project) => 
            values.Project.includes(project.Id)
          ) || [];

          const allocationPromises = allMondays.flatMap((monday) => {
            return values.Resource.flatMap(resource => {
              return filteredProjects.map(project => {
                const allocation = getAllocationPresent(project.Id, resource, monday)

                if (allocation && allocation?.allocationId && allocation?.value) {
                  if(allocation?.value !== values.AllocationEntered) {
                    const putPayload = {
                      resourceId: resource,
                      allocationId: allocation?.allocationId,
                      putData: {
                        'ResourceAllocation.Core/Allocation': {
                          AllocationEntered: values.AllocationEntered,
                        },
                      },
                    };
                    return dispatch(updateResourceAllocation(putPayload))
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
                        Notes: values.Comment || "",
                },
                    },
                  };
                  return dispatch(setResourceAllocation(postPayload));
                }
              })
            })
          });
          if (!allocationPromises?.length) {
            return;
          }
          await Promise.all(allocationPromises)
            .then(async () => {
              let new_resources = values.Resource.map(resource => getTeamByResourceId(resource));
              const teams = [...new Set(new_resources.map(resource => resource?.team))];
              dispatch(closeDialog());

              if(view === 'Teams')
                {
                  return dispatch(fetchResourcesAgainstTeams(teams, allocations, startDate, endDate))
                  .then(() => {
                    new_resources.forEach((resource) => {
                      handleOnAdd(resource?.team?.Name, resource?.FullName);
                      handleScrollAndFocus(resource.Id, resource?.teamId, allMondays, filteredProjects)
                    })
                  });
                }
              else if(view === 'Projects')
                {
                return dispatch(fetchAllProjectAllocations(filteredProjects, startDate, endDate))
                  .then(() => {
                    new_resources.forEach((resource) => {
                      handleScrollAndFocus(resource.Id, resource?.teamId, allMondays, filteredProjects)
                    })
                  });
                }
            })
        } catch (e) {
          console.error('Error creating allocations:', e);
        }
        break;

      default:
        return;
    }
     setSubmitting(false);
  };

  const getFormComponent = (formType, formikProps) => {
    switch (formType) {
      case 'add_project':
        return <AddProjectForm formikProps={formikProps} />;
      case 'edit_project':
        return <AddProjectForm formikProps={formikProps} setFormValue={setFormValue} />;
      case 'add_resource':
        return <AddResourceForm formikProps={formikProps} />;
      case 'add_allocation':
        return <AddAllocationForm formikProps={formikProps} setFormValue={setFormValue} />;
      case 'assign_allocation':
        return <AssignAllocationForm formikProps={formikProps} />;
      default:
        return <div>No form selected</div>;
    }
  };
  const FormErrorMessage = ({ name }) => (
    <ErrorMessage name={name}>
      {(msg) => (
        <Typography 
          color="error" 
          sx={{ 
            fontSize: '12px', 
            mt: 0.5, 
            fontFamily: 'Open Sans'
          }}
        >
          {msg}
        </Typography>
      )}
    </ErrorMessage>
  );

  return (
    <Formik
      enableReinitialize
      initialValues={formValue}
      validationSchema={getValidationSchema(formType)}
      onSubmit={handleSubmit}
      validateOnChange={true}
      validateOnBlur={true}
    >
      {(formikProps) => (
        <CustomDialog 
          onSubmit={formikProps.handleSubmit}
          isSubmitting={formikProps.isSubmitting}
          isValid={formikProps.isValid}
        >
          <Box>
            {getFormComponent(formType, {
              ...formikProps,
              FormErrorMessage 
            })}
            {formikProps.status && (
              <Typography 
                color="error" 
                sx={{ 
                  fontSize: '14px', 
                  mt: 2, 
                  textAlign: 'center',
                  fontFamily: 'Open Sans',
                  fontWeight: 600
                }}
              >
                {formikProps.status}
              </Typography>
            )}
          </Box>
        </CustomDialog>
      )}
    </Formik>
  );
};

export default AllocationForm;