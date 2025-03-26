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
import { generateAllMondays } from '@/app/utils/common';
import { setResourceAllocation } from '@/app/redux/actions/resourceAllocationAction';
import { fetchResourcesAgainstTeams } from '@/app/redux/actions/fetchTeamsAction';
import { resetResources } from '@/app/redux/reducers/teamsReducer';
import { setExpandRowId } from '@/app/redux/reducers/allocationViewReducer';
import { Box, Typography } from '@mui/material';

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
    Resource: '',
    Project: '',
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

  useEffect(() => {
    setFormValue(initialValuesMap[formType] || initialValuesMap.add_project);
  }, [formType]);
  
  const getValidationSchema = (formType) => {
    switch (formType) {
      case 'add_project':
        return addProjectValidationSchema;
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
            Notes: "string ", 
          },
        };
        try {
          dispatch(addProject(postData));
        } catch (e) {
          console.log(e);
        }
        break;

      case 'edit_project':
        postData = {
          "ResourceAllocation.Core/Project": {
            ...values,
            Description: "string",
            Notes: "string "
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
          const allocationPromises = allMondays.map((monday) => {
            const postPayload = {
              resourceId: values.Resource,
              postData: {
                'ResourceAllocation.Core/Allocation': {
                  Resource: values.Resource,
                  Project: values.Project,
                  ProjectName: projects?.result?.filter((project) => project.Id === values.Project)?.[0]?.Name,
                  Period: monday,
                  AllocationEntered: values.AllocationEntered,
                  Notes: values.Comment || "",
                },
              },
            };

            return dispatch(setResourceAllocation(postPayload));
          });
          if (!allocationPromises?.length) {
            return;
          }
          await Promise.all(allocationPromises)
            .then(async () => {
              let new_resource = getTeamByResourceId(values.Resource);
              dispatch(closeDialog());
              return dispatch(fetchResourcesAgainstTeams([new_resource?.team], allocations, startDate, endDate))
                .then(() => {
                  handleOnAdd(new_resource?.team?.Name, new_resource?.FullName);
                });
            });
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