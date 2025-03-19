import React from 'react';
import { Formik } from 'formik';
import { useSelector } from 'react-redux';
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
import dayjs from 'dayjs';

const AllocationForm = () => {
  const { formType } = useSelector(state => state.globalDialog.formState);
  const initialValues = {
    team: '',
    design: '',
    resource: '',
    resourceType: '',
    project: '',
    allocate: '',
    week: '',
    capacity: '',
    startDate: '',
    endDate: '',
    projectName: '',
    sponser: '',
    allowOvertime: '',
    location: '',
    manager: '',
  };

  const getValidationSchema = formType => {
    switch (formType) {
      case 'Add Project':
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

  const handleSubmit = values => {
    console.log('Form Data:', values);
    // Handle form submission
  };

  const getFormComponent = (formType, formikProps) => {
    switch (formType) {
      case 'add_project':
        return <AddProjectForm formikProps={formikProps} />;
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
      initialValues={initialValues}
      validationSchema={getValidationSchema(formType)}
      onSubmit={handleSubmit}
    >
      {formikProps => (
        <CustomDialog onSubmit={formikProps.handleSubmit}>
          {getFormComponent(formType, formikProps)}
        </CustomDialog>
      )}
    </Formik>
  );
};

export default AllocationForm;
