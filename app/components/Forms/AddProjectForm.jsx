import React, { useEffect } from 'react';
import { TextField, Box, Typography } from '@mui/material';
import CustomSelect from '../Select/CustomSelect';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomDatePicker from '../DatePicker/CustomDatePicker';
import { useSelector } from 'react-redux';
import { Formik } from 'formik';
import { addProjectValidationSchema } from './ValidationSchema';
import CustomDialog from '../Dialog/CustomDialog';

const AddProjectForm = ({ formikProps, setFormValue =()=>{}}) => {
  const { values, handleChange, handleBlur } = formikProps;
  const {initialData } = useSelector(state => state.globalDialog.formState);

  useEffect(() => {
    if (initialData) {
      const rowData = {
        StartDate: initialData.StartDate || '',
        EndDate: initialData.EndDate || '',
        Owner: initialData.Owner?.name || '',
        AllowOvertime: initialData.AllowOvertime,
        Location: initialData.Location || '',
        Manager: initialData.Manager || '',
        Name: initialData.Name || '',
        Type: initialData.Type || '',
        Status: initialData.Status || '',
      };
      setFormValue(rowData);
    }
  }, [initialData]);

  const handleSubmit = () =>{
   console.log("ok")
  }

  const projectTypeOptions = [
    { value: 'Key Initiative', label: 'Key Initiative' },
    { value: 'RTB', label: 'RTB (Run-th-business)' },
    { value: 'CTB', label: 'CTB' },
    { value: 'STB', label: 'STB' },
    { value: 'Ongoing', label: 'Ongoing' },
  ];
  const allowOverTimeOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  
  ];
  const errorTextStyle = {
    '& .MuiFormHelperText-root': {
      fontSize: '0.75rem', 
      marginLeft: '0px', 
    },
  };
  const statusOptions = [
    { value: 'Active', label: 'Active' },
    { value: 'Proposed', label: 'Proposed' },
    { value: 'Completed', label: 'Completed' },
    { value: 'Paused', label: 'Paused' },
    { value: 'Terminated', label: 'Terminated' },
  ];

  const initialValues = {
    Name: '',
    Owner: '',
    Manager: '',
    Location: '',
    Type: '',
    AllowOvertime: true,
    StartDate: '',
    EndDate: '',
    Status: '',
  }

  return (
    <Formik
    initialValues={initialValues}
    validationSchema={addProjectValidationSchema} 
    onSubmit={handleSubmit}
  >
     {({ values, handleChange, handleBlur, handleSubmit, touched, errors }) => (
    <form onSubmit={handleSubmit} autoComplete="off">
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Project Name</StyledLabel>
        <StyledInput
          as={TextField}
          name="Name"
          value={values.Name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Name && Boolean(errors.Name)} 
          helperText={touched.Name && errors.Name} 
          sx={errorTextStyle}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Sponsor</StyledLabel>
        <StyledInput
          as={TextField}
          name="Owner"
          value={values.Owner}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Owner && Boolean(errors.Owner)}
          helperText={touched.Owner && errors.Owner}
          sx={errorTextStyle}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Manager</StyledLabel>
        <StyledInput
          as={TextField}
          name="Manager"
          value={values.Manager}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Manager && Boolean(errors.Manager)}
          helperText={touched.Manager && errors.Manager}
          sx={errorTextStyle}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Location</StyledLabel>
        <StyledInput
          as={TextField}
          name="Location"
          value={values.Location}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Location && Boolean(errors.Location)}
          helperText={touched.Location && errors.Location}
          sx={errorTextStyle}
        />
      </Box>
      <Box
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <StyledLabel>Project Type</StyledLabel>
          <CustomSelect
            name="Type"
            options={projectTypeOptions}
            value={values.Type}
            onChange={handleChange}
            onBlur={handleBlur}
            width={'160px'}
            error={touched.Type && Boolean(errors.Type)}  
            helperText={touched.Type && errors.Type}  
            sx={errorTextStyle}
          />
        </Box>
        <Box>
          <StyledLabel>Allow Overtime</StyledLabel>
          <CustomSelect
            name="AllowOvertime"
            options={allowOverTimeOptions}
            value={values.AllowOvertime}
            onChange={handleChange}
            onBlur={handleBlur}
            width={'160px'}
            formikProps={formikProps}
            error={touched.AllowOvertime && Boolean(errors.AllowOvertime)} 
            helperText={touched.AllowOvertime && errors.AllowOvertime} 
            sx={errorTextStyle}
          />
        </Box>
      </Box>
      <Box
        sx={{
          pb: 2,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <StyledLabel>Start Date</StyledLabel>
          <CustomDatePicker
            name="StartDate"
            handleChange={handleChange}
            value={values.StartDate}
            placeholder={'Start Date'}
            formikProps={formikProps}
            error={touched.StartDate && Boolean(errors.StartDate)} 
            helperText={touched.StartDate && errors.StartDate} 
            sx={errorTextStyle}
          />
        </Box>
        <Box>
          <StyledLabel>End Date</StyledLabel>
          <CustomDatePicker
            name="EndDate"
            handleChange={handleChange}
            value={values.EndDate}
            placeholder={'End Date'}
            formikProps={formikProps}
            error={touched.EndDate && Boolean(errors.EndDate)}
            helperText={touched.EndDate && errors.EndDate} 
            sx={errorTextStyle}
          />
        </Box>
      </Box>
      <StyledLabel>Status</StyledLabel>
          <CustomSelect
            name="Status"
            options={statusOptions}
            value={values.Status}
            onChange={handleChange}
            onBlur={handleBlur}
            formikProps={formikProps}
          />
    </Box>
    </form>
     )}
    
    
    
    </Formik>
    

    
    
  );
};

export default AddProjectForm;
