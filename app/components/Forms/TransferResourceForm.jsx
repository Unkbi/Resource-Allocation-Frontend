"use client";

import { useEffect, useState } from "react";
import { TextField, Box, Autocomplete } from "@mui/material";
import CustomSelect from "../Select/CustomSelect";
import StyledLabel from "../Label/StyledLabel";
import { StyledCommentInput, StyledFormInfoText, StyledInput } from "../Input/StyledInput";
import { useSelector, useDispatch } from "react-redux";
import CustomDateRangePicker from "../DatePicker/CustomDateRangePicker";
import { showToast } from "@/app/redux/reducers/toastReducer";

const TransferResourceForm = ({ formikProps, setFormValue }) => {
  const { values, handleChange, handleBlur, setFieldValue } = formikProps;
  const { projects } = useSelector((state) => state.projects);
  const { resources } = useSelector((state) => state.resources);
  const { initialData } = useSelector((state) => state.globalDialog.formState);
  const dispatch = useDispatch();

  const commonAutocompleteStyles = {
    "& .MuiInputBase-root": { fontSize: "12px" },
    "& .MuiAutocomplete-tag": { fontSize: "10px", padding: "2px 5px" },
    "& input": { fontSize: "12px" },
    "& .MuiAutocomplete-popper": { fontSize: "12px" },
    "& .MuiAutocomplete-option": { fontSize: "12px", padding: "4px 10px" },
  };

  const commonSlotProps = {
    popper: {
      modifiers: [
        {
          name: "preventOverflow",
          options: {
            boundary: "window",
          },
        },
      ],
    },
    paper: {
      sx: {
        fontSize: "12px",
      },
    },
  };

  const currentResourceName = initialData?.Resource;

  const resourceTypeOptions = resources?.result
    ?.filter((resource) => resource.FullName !== currentResourceName)
    ?.map((resource) => ({
      label: resource.FullName,
      value: resource.Id,
    })) || [];

  const selectedResourceOption =
    Array.isArray(values?.Resource) && values.Resource.length > 0
      ? resourceTypeOptions.filter((opt) => values.Resource.includes(opt.value))
      : [];

  const selectedProjects = Array.isArray(values?.Project)
  ? projects?.filter((proj) => values?.Project?.includes(proj.Id))
  : [initialData?.Project];
  const projectNames = selectedProjects?.map((proj) => proj.Name) || [];

  useEffect(() => {
    if (initialData) {
      const filteredProjectIds =
        projects
          ?.filter((project) => initialData.Project?.includes(project.Name))
          ?.map((project) => project.Id) || [];

      const rowData = {
        Resource: [],
        Project: filteredProjectIds,
        StartDate: initialData.StartDate || "",
        EndDate: initialData.EndDate || "",
      };
      setFormValue(rowData);
    }
  }, [initialData, projects]);

  const handleResourceChange = (event, newValue) => {
    if(newValue){
    const selectedIds = newValue.map((item) => item.value);
    setFieldValue("Resource", selectedIds);
  }
};

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Project</StyledLabel>
        <StyledInput
          as={TextField}
          name="project"
          fullWidth
          value={projectNames.join(", ")} 
          disabled
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <StyledLabel>Resource</StyledLabel>
        <Autocomplete
          sx={commonAutocompleteStyles}
          multiple
          size="small"
          options={resourceTypeOptions}
          getOptionLabel={(option) => option?.label || ""}
          value={selectedResourceOption}
          onChange={handleResourceChange}
          slotProps={commonSlotProps}
          renderInput={(params) => (
            <TextField
              {...params}
              placeholder="Select Resource"
              variant="outlined"
              error={
                formikProps.touched.Resource &&
                Boolean(formikProps.errors.Resource)
              }
              helperText={
                formikProps.touched.Resource && formikProps.errors.Resource
              }
              FormHelperTextProps={{
                sx: {
                  fontSize: "12px",
                  textAlign: "left",
                  marginLeft: "0px",
                },
              }}
            />
          )}
        />
      </Box>

      <Box sx={{ pb: 2 }}>
        <Box sx={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
          <CustomDateRangePicker
            name="StartDate"
            value={{
              StartDate: formikProps.values.StartDate,
              EndDate: formikProps.values.EndDate,
            }}
            placeholder="Select Date"
            formikProps={formikProps}
            error={
              formikProps.touched.StartDate &&
              Boolean(formikProps.errors.StartDate)
            }
            helperText={
              formikProps.touched.StartDate &&
              formikProps.errors.StartDate
            }
            customStyles
          />
        </Box>
      </Box>

      <StyledFormInfoText>
        Allocation values will be transfered to [{initialData?.Resource}]'s in [{projectNames.join(", ")}].
      </StyledFormInfoText>
    </Box>
  );
};

export default TransferResourceForm;
