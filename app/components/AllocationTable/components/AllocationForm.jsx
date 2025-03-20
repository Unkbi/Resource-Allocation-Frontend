import React, { useEffect, useState } from 'react';
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

const initialValues = {
  StartDate: '',
  EndDate: '',
  Name: '',
  Owner: '',
  AllowOvertime: '',
  Location: '',
  Manager: '',
  Status:"",
  Type:""
};
const AllocationForm = () => {
  const { formType, initialData } = useSelector(state => state.globalDialog.formState);
  const [formValue, setFormValue] = useState(initialValues)

  useEffect(() => {
    if (initialData) {
      const rowData = {
        StartDate: initialData.StartDate || '',
        EndDate: initialData.EndDate || '',
        ProjectName: initialData.Name || '',
        Owner: initialData.Owner?.name || '',
        AllowOvertime: initialData.AllowOvertime || '',
        Location: initialData.Location || '',
        Manager: initialData.Manager || '',
        Name: initialData.Name || '',
        Type: initialData.Type || '',
        Status: initialData.Status || '',
      };
      setFormValue(rowData);
    }
  }, [initialData]);

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
      case 'edit_project':
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
      enableReinitialize
      initialValues={formValue}
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
