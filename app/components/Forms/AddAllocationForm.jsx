"use client"

import { useEffect, useState } from "react"
import { TextField, Box, Typography, RadioGroup, FormControlLabel, Radio, Input, FormHelperText } from "@mui/material"
import CustomSelect from "../Select/CustomSelect"
import StyledLabel from "../Label/StyledLabel"
import { StyledCommentInput, StyledFormHelperText, StyledInput } from "../Input/StyledInput"
import CustomDatePicker from "../DatePicker/CustomDatePicker"
import StyledRadioButton from "../RadioButton/StyledRadioButton"
import { useSelector } from "react-redux"

const AddAllocationForm = ({ formikProps , setFormValue}) => {
  const { values, handleChange, handleBlur, setFieldValue} = formikProps
  const [capacityOption, setCapacityOption] = useState("")
  const [customCapacity, setCustomCapacity] = useState("")
  const [projectOptions, setProjectOptions] = useState([]);
  const { projects } = useSelector((state) => state.projects)
  const { resources } = useSelector((state) => state.resources)
  const { resources: project_resource } = useSelector((state) => state.teams)
  const {initialData } = useSelector(state => state.globalDialog.formState);
  useEffect(() => {
    if (initialData) {
      const filteredProject = projects?.result?.find(
        project => project.Name === initialData.Project
      );
      const filteredResource = resources?.result?.find(
        resource => resource.FullName === initialData.Resource
      );
      const rowData = {
        Resource: filteredResource?.Id || '',
        Project: filteredProject?.Id || '',
        StartDate: initialData.StartDate || '',
        EndDate: initialData.EndDate || '',
        AllocationEntered: initialData.AllocationEntered || '',
      };
      setFormValue(rowData);
    }
  }, [initialData, projects]);


  useEffect(() => {
    let projectByResources = {};
    let avaiableProjects = [];
    try {
      project_resource?.forEach((resource) => {
        let projects_by_resource = projectByResources[resource?.resourceId];
        if (projects_by_resource) {
          projectByResources[resource?.resourceId]?.push(resource?.projectId);
        } else {
          projectByResources[resource?.resourceId] = [resource?.projectId];
        }
      });
      projects?.result?.forEach((project) => {
        if (values.Resource) {
          if (!projectByResources[values.Resource].includes(project.Id)) {
            avaiableProjects.push({
              value: project.Id,
              label: project.Name,
            });;
          }
        } else {
          avaiableProjects.push({
            value: project.Id,
            label: project.Name,
          });
        }
      });
    } catch (e) {
      avaiableProjects = projects?.result?.map((project) => ({
        value: project.Id,
        label: project.Name,
      }));
    }
    setProjectOptions(avaiableProjects);
  }, [values.Resource, project_resource, projects])

  const resourceTypeOptions = resources && resources.result.map((resource) => {
    return { value: resource.Id, label: resource.FullName }
  })

  const handleCapacityChange = (event) => {
    const value = event.target.value
    setCapacityOption(value)
    if (value === "custom") {
      setFieldValue("allocationEntered", Number(customCapacity))
    } else {
      setFieldValue("AllocationEntered", Number(value))
    }
  }

  const handleKeyPress = (e) => {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
    }
  };

  const handleCustomCapacityChange = (event) => {
    const value = event.target.value;
    if (/^[0-9]*\.?[0-9]*$/.test(value) || value === "") {
      setCustomCapacity(value);
      setCapacityOption("custom");
      const numValue = value === "" ? "" : Number(value);
      setFieldValue("AllocationEntered", numValue);
    }
  };

  const handleCustomCapacityBlur = (e) => {
    let formattedValue = e.target.value
    if (formattedValue && !isNaN(formattedValue)) {
      const numValue = Number(formattedValue)
      formattedValue = (Math.round(numValue * 10) / 10).toString()
      if (formattedValue.indexOf('.') === -1 && numValue <= 2) {
        formattedValue = formattedValue + '.0'
      }
      setCustomCapacity(formattedValue)
      setFieldValue("AllocationEntered", Number(formattedValue))
    }
    handleBlur(e)
  }

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Resource</StyledLabel>
        <CustomSelect
          name="Resource"
          options={resourceTypeOptions}
          value={values.Resource ||""}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Project</StyledLabel>
        <CustomSelect
          name="Project"
          options={projectOptions}
          value={values.Project ||""}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box>
        <Box
          sx={{
            background: "rgba(28, 45, 95, 0.05)",
            height: "33px",
            width: "340px",
            p: 1,
          }}
        >
          <Typography
            sx={{
              color: '#313F68',
              fontFamily: 'Open Sans',
              fontSize: '12px',
              fontStyle: 'normal',
              fontWeight: '700',
            }}
          >
            Add Bulk Allocation
          </Typography>
        </Box>
        <Box sx={{ pb: 2, pt: 2 }}>
          <StyledLabel>Date Range</StyledLabel>
          <Box sx={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
            <CustomDatePicker
              name="StartDate"
              handleChange={handleChange}
              value={values.StartDate ||""}
              placeholder={"Start Date"}
              formikProps={formikProps}
            />
            <CustomDatePicker
              name="EndDate"
              handleChange={handleChange}
              value={values.EndDate ||""}
              placeholder={"End Date"}
              formikProps={formikProps}
            />
          </Box>
        </Box>
        <Box>
          <RadioGroup
            row
            name="capacity-radio-group"
            value={capacityOption}
            onChange={handleCapacityChange}
            sx={{ display: "flex", alignItems: "center", gap: "22px" }}
          >
            <StyledRadioButton
              value="1.0"
              label="1.0"
              selectedValue={capacityOption}
              onChange={handleCapacityChange}
              backgroundColor="#e6f7e6"
              borderColor="#a3d9a3"
            />
            <StyledRadioButton
              value="0.5"
              label="0.5"
              selectedValue={capacityOption}
              onChange={handleCapacityChange}
              backgroundColor="#fff8e6"
              borderColor="#ffd580"
            />
            <StyledRadioButton
              value="0.2"
              label="0.2"
              selectedValue={capacityOption}
              onChange={handleCapacityChange}
              backgroundColor="#fde6ef"
              borderColor="#f8b3d9"
            />
            <FormControlLabel
            value="custom"
            control={<Radio sx={{ display: "none" }} />}
            label={
              <StyledInput
                as={TextField}
                name="AllocationEntered"
                type="number"
                width="60px"
                height= "32px"
                value={customCapacity}
                onChange={handleCustomCapacityChange}
                onKeyPress={handleKeyPress}
                onBlur={handleCustomCapacityBlur}
                onClick={() => setCapacityOption("custom")}
                error={formikProps.touched.AllocationEntered && Boolean(formikProps.errors.AllocationEntered)}
              />
            }
            sx={{ margin: 0 }}
          />
          </RadioGroup>
          {formikProps.touched.AllocationEntered && Boolean(formikProps.errors.AllocationEntered)&& (
          <StyledFormHelperText>
            {formikProps.errors.AllocationEntered}
          </StyledFormHelperText>
        )}
        </Box>
      </Box>

  <Box sx={{ pb: 2  ,pt :2 }}>
  <StyledLabel>Comment</StyledLabel>
   <StyledCommentInput
    name="Comment"
    value={values.Comment || ""}
    onChange={handleChange}
    onBlur={handleBlur}
    multiline
    rows={4} 
    />
  </Box>

    </Box>
  )
}

export default AddAllocationForm

