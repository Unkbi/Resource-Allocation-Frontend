import React, { useEffect, useState } from 'react';
import { Formik } from 'formik';
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
import { generateAllMondays, getMondayOfWeek } from '@/app/utils/common';
import { setResourceAllocation } from '@/app/redux/actions/resourceAllocationAction';

const initialValuesMap = {
  add_project: {
    StartDate: '',
    EndDate: '',
    Name: '',
    Owner: '',
    AllowOvertime: '',
    Location: '',
    Manager: '',
    Status:"",
    Type:""
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

  const handleSubmit = async (values) => {
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
                  ProjectName: projects?.result?.filter((project) => project.Id === values.Project)[0].Name,
                  Period: monday,
                  AllocationEntered: values.AllocationEntered,
                },
              },
            };
            return dispatch(setResourceAllocation(postPayload));
          });
  
          await Promise.all(allocationPromises);
        } catch (e) {
          console.error('Error creating allocations:', e);
        }
        break;
  
      default:
        return;
    }
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
        return <AddAllocationForm formikProps={formikProps} />;
      case 'assign_allocation':
        return <AssignAllocationForm formikProps={formikProps} />;
      default:
        return <div>No form selected</div>;
    }
  };

  return (
    <Formik
      enableReinitialize
      initialValues={formValue}
      validationSchema={getValidationSchema(formType)}
      onSubmit={handleSubmit}
    >
      {(formikProps) => (
        <CustomDialog onSubmit={formikProps.handleSubmit}>
          {getFormComponent(formType, formikProps)}
        </CustomDialog>
      )}
    </Formik>
  );
};

export default AllocationForm;