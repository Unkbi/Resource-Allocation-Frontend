import React, { useEffect } from 'react';
import { TextField, Box, Typography } from '@mui/material';
import CustomSelect from '../Select/CustomSelect';
import StyledLabel from '../Label/StyledLabel';
import { StyledInput } from '../Input/StyledInput';
import CustomDatePicker from '../DatePicker/CustomDatePicker';
import { useSelector } from 'react-redux';

const AddProjectForm = ({ formikProps, setFormValue = () => {} }) => {
  const { values, handleChange, handleBlur, errors, touched ,resetForm,setTouched } = formikProps
  const { initialData } = useSelector((state) => state.globalDialog.formState)

  useEffect(() => {
    if (initialData) {
      const rowData = {
        StartDate: initialData.StartDate || null,
        EndDate: initialData.EndDate || null,
        Owner: initialData.Owner?.name || '',
        AllowOvertime: initialData.AllowOvertime ?? '', // Use nullish coalescing
        Location: initialData.Location || '',
        Manager: initialData.Manager || '',
        Name: initialData.Name || '',
        Type: initialData.Type || '',
        Status: initialData.Status || 'Active',
      }
      setFormValue(rowData)
      formikProps.resetForm({ values: rowData })
      formikProps.setTouched({})
    }
  }, [initialData])
  

  const projectTypeOptions = [
    { value: "Key Initiative", label: "Key Initiative" },
    { value: "RTB", label: "RTB (Run-th-business)" },
    { value: "CTB", label: "CTB" },
    { value: "STB", label: "STB" },
    { value: "Ongoing", label: "Ongoing" },
  ]
  const allowOverTimeOptions = [
    { value: true, label: "Yes" },
    { value: false, label: "No" },
  ]

  const statusOptions = [
    { value: "Active", label: "Active" },
    { value: "Proposed", label: "Proposed" },
    { value: "Completed", label: "Completed" },
    { value: "Paused", label: "Paused" },
    { value: "Approved", label: "Approved" },
  ]

  // Error display helper
  const showError = (fieldName) => {
    return touched[fieldName] && errors[fieldName] ? (
      <Typography
        color="error"
        sx={{
          fontSize: "12px",
          mt: 0.5,
          fontFamily: "Open Sans",
        }}
      >
        {errors[fieldName]}
      </Typography>
    ) : null
  }

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Project Name <span style={{ color: "red" }}>*</span>
        </StyledLabel>
        <StyledInput
          as={TextField}
          name="Name"
          value={values.Name}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Name && Boolean(errors.Name)}
        />
        {showError("Name")}
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Sponsor 
        </StyledLabel>
        <StyledInput
          as={TextField}
          name="Owner"
          value={values.Owner}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Owner && Boolean(errors.Owner)}
        />
        {showError("Owner")}
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Project Manager 
        </StyledLabel>
        <StyledInput
          as={TextField}
          name="Manager"
          value={values.Manager}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Manager && Boolean(errors.Manager)}
        />
        {showError("Manager")}
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Location 
        </StyledLabel>
        <StyledInput
          as={TextField}
          name="Location"
          value={values.Location}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Location && Boolean(errors.Location)}
        />
        {showError("Location")}
      </Box>
      <Box
        sx={{
          pb: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ width: "48%" }}>
          <StyledLabel>
            Project Type <span style={{ color: "red" }}>*</span>
          </StyledLabel>
          <CustomSelect
            name="Type"
            options={projectTypeOptions}
            value={values.Type}
            onChange={handleChange}
            onBlur={handleBlur}
            width={"100%"}
            error={touched.Type && Boolean(errors.Type)}
          />
          {showError("Type")}
        </Box>
        <Box sx={{ width: "48%" }}>
          <StyledLabel>
            Allow Overtime <span style={{ color: "red" }}>*</span>
          </StyledLabel>
          <CustomSelect
            name="AllowOvertime"
            options={allowOverTimeOptions}
            value={values.AllowOvertime}
            onChange={handleChange}
            onBlur={handleBlur}
            width={"100%"}
            error={touched.AllowOvertime && Boolean(errors.AllowOvertime)}
          />
          {showError("AllowOvertime")}
        </Box>
      </Box>
      <Box
        sx={{
          pb: 2,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
        }}
      >
        <Box sx={{ width: "48%" }}>
          <StyledLabel>
            Start Date 
          </StyledLabel>
          <CustomDatePicker
            name="StartDate"
            handleChange={handleChange}
            value={values.StartDate  || null}
            placeholder={"Start Date"}
            formikProps={formikProps}
            error={touched.StartDate && Boolean(errors.StartDate)}
          />
          {showError("StartDate")}
        </Box>
        <Box sx={{ width: "48%" }}>
          <StyledLabel>
            End Date 
          </StyledLabel>
          <CustomDatePicker
            name="EndDate"
            handleChange={handleChange}
            value={values.EndDate || null}
            placeholder={"End Date"}
            formikProps={formikProps}
            error={touched.EndDate && Boolean(errors.EndDate)}
          />
          {showError("EndDate")}
        </Box>
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>
          Status <span style={{ color: "red" }}>*</span>
        </StyledLabel>
        <CustomSelect
          name="Status"
          options={statusOptions}
          value={values.Status}
          onChange={handleChange}
          onBlur={handleBlur}
          error={touched.Status && Boolean(errors.Status)}
        />
        {showError("Status")}
      </Box>
    </Box>
  )
}

export default AddProjectForm
