"use client"

import { useState } from "react"
import { Box, Typography, RadioGroup, FormControlLabel, Radio, Button, IconButton } from "@mui/material"
import { X, Plus, ChevronDown } from "lucide-react"
import StyledLabel from "../Label/StyledLabel"
import CustomSelect from "../Select/CustomSelect"
import CustomDatePicker from "../DatePicker/CustomDatePicker"

const SaveViewForm = ({ formikProps }) => {
  const { values, handleChange, handleBlur, setFieldValue, errors, touched } = formikProps
  const [selectedColumns, setSelectedColumns] = useState(["Team", "Client"])

  const handleRemoveColumn = (column) => {
    const updatedColumns = selectedColumns.filter((col) => col !== column)
    setSelectedColumns(updatedColumns)
    setFieldValue("showColumns", updatedColumns)
  }

  const columnOptions = [
    { value: "resource", label: "Resource" },
    { value: "project", label: "Project" },
    { value: "team", label: "Team" },
    { value: "client", label: "Client" },
  ]

  const operatorOptions = [
    { value: "contains", label: "Contains" },
    { value: "equals", label: "Equals" },
    { value: "startsWith", label: "Starts With" },
    { value: "endsWith", label: "Ends With" },
  ]

  const filterValueOptions = [{ value: "filterValue", label: "Filter Value" }]

  const addFilter = () => {
    const newFilters = [...values.filters, { column: "resource", operator: "contains", value: "" }]
    setFieldValue("filters", newFilters)
  }

  const removeAllFilters = () => {
    setFieldValue("filters", [])
  }

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
      {/* Group By */}
      <Box sx={{ mb: 3 }}>
        <StyledLabel>Group By</StyledLabel>
        <RadioGroup
          name="groupBy"
          value={values.groupBy}
          onChange={handleChange}
          onBlur={handleBlur}
          row
          sx={{ gap: 2 }}
        >
          <FormControlLabel
            value="teams"
            control={<Radio size="small" />}
            label={<Typography sx={{ fontFamily: "Open Sans", fontSize: "14px" }}>Teams</Typography>}
          />
          <FormControlLabel
            value="project"
            control={<Radio size="small" />}
            label={<Typography sx={{ fontFamily: "Open Sans", fontSize: "14px" }}>Project</Typography>}
          />
          <FormControlLabel
            value="organisation"
            control={<Radio size="small" />}
            label={<Typography sx={{ fontFamily: "Open Sans", fontSize: "14px" }}>Organisation</Typography>}
          />
        </RadioGroup>
        {showError("groupBy")}
      </Box>

      {/* Show by */}
      <Box sx={{ mb: 3 }}>
        <StyledLabel>Show by</StyledLabel>
        <RadioGroup name="showBy" value={values.showBy} onChange={handleChange} onBlur={handleBlur} row sx={{ gap: 2 }}>
          <FormControlLabel
            value="myProjects"
            control={<Radio size="small" />}
            label={<Typography sx={{ fontFamily: "Open Sans", fontSize: "14px" }}>My Projects</Typography>}
          />
          <FormControlLabel
            value="allProjects"
            control={<Radio size="small" />}
            label={<Typography sx={{ fontFamily: "Open Sans", fontSize: "14px" }}>All Projects</Typography>}
          />
        </RadioGroup>
        {showError("showBy")}
      </Box>

      <Box sx={{ borderTop: "1px solid #E5E7EB", my: 2 }} />

      {/* Date Range */}
      <Box sx={{ mb: 3 }}>
        <StyledLabel>Date Range</StyledLabel>

        {/* Dynamic Range */}
        <Box sx={{ mb: 2 }}>
          <FormControlLabel
            value="dynamic"
            control={
              <Radio
                size="small"
                checked={values.dateRangeType === "dynamic"}
                onChange={() => setFieldValue("dateRangeType", "dynamic")}
                onBlur={handleBlur}
              />
            }
            label={<Typography sx={{ fontFamily: "Open Sans", fontSize: "14px" }}>Dynamic Range</Typography>}
          />

          {values.dateRangeType === "dynamic" && (
            <Box sx={{ mt: 1 }}>
              <Box sx={{ display: "flex", gap: 1 }}>
                <Box
                  sx={{
                    flex: 1,
                    p: 1.5,
                    border: "1px solid #E5E7EB",
                    borderRadius: "4px",
                    fontSize: "14px",
                    fontFamily: "Open Sans",
                  }}
                >
                  Current Week
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: 1.5,
                    border: "1px solid #E5E7EB",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <IconButton size="small" sx={{ p: 0 }}>
                    <Plus size={16} />
                  </IconButton>
                  <Typography sx={{ fontFamily: "Open Sans", fontSize: "14px" }}>Week</Typography>
                </Box>
                <Box
                  sx={{
                    flex: 1,
                    p: 1.5,
                    border: "1px solid #E5E7EB",
                    borderRadius: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 1,
                  }}
                >
                  <IconButton size="small" sx={{ p: 0 }}>
                    <X size={16} />
                  </IconButton>
                  <Typography sx={{ fontFamily: "Open Sans", fontSize: "14px" }}>Week</Typography>
                </Box>
              </Box>
              <Box sx={{ display: "flex", justifyContent: "space-between", mt: 1 }}>
                <Typography sx={{ fontFamily: "Open Sans", fontSize: "12px", color: "#6B7280" }}>06 Jan 25</Typography>
                <Typography sx={{ fontFamily: "Open Sans", fontSize: "12px", color: "#6B7280" }}>30 Dec 24</Typography>
                <Typography sx={{ fontFamily: "Open Sans", fontSize: "12px", color: "#6B7280" }}>30 Jun 25</Typography>
              </Box>
            </Box>
          )}
        </Box>

        {/* Fixed Range */}
        <Box>
          <FormControlLabel
            value="fixed"
            control={
              <Radio
                size="small"
                checked={values.dateRangeType === "fixed"}
                onChange={() => setFieldValue("dateRangeType", "fixed")}
                onBlur={handleBlur}
              />
            }
            label={<Typography sx={{ fontFamily: "Open Sans", fontSize: "14px" }}>Fixed Range</Typography>}
          />

          {values.dateRangeType === "fixed" && (
            <Box sx={{ mt: 1, display: "flex", gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <CustomDatePicker
                  name="startDate"
                  handleChange={handleChange}
                  value={values.startDate || ""}
                  placeholder="Start Date"
                  formikProps={formikProps}
                  error={touched.startDate && Boolean(errors.startDate)}
                />
                {showError("startDate")}
              </Box>
              <Box sx={{ flex: 1 }}>
                <CustomDatePicker
                  name="endDate"
                  handleChange={handleChange}
                  value={values.endDate || ""}
                  placeholder="End Date"
                  formikProps={formikProps}
                  error={touched.endDate && Boolean(errors.endDate)}
                />
                {showError("endDate")}
              </Box>
            </Box>
          )}
        </Box>
        {showError("dateRangeType")}
      </Box>

      <Box sx={{ borderTop: "1px solid #E5E7EB", my: 2 }} />

      {/* Show Columns */}
      <Box sx={{ mb: 3 }}>
        <StyledLabel>Show Columns</StyledLabel>
        <Box
          sx={{
            p: 1.5,
            border: "1px solid #E5E7EB",
            borderRadius: "4px",
            display: "flex",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          {selectedColumns.map((column) => (
            <Box
              key={column}
              sx={{
                display: "flex",
                alignItems: "center",
                bgcolor: "#F3F4F6",
                borderRadius: "4px",
                px: 1,
                py: 0.5,
                fontSize: "12px",
                fontFamily: "Open Sans",
              }}
            >
              {column}
              <IconButton size="small" onClick={() => handleRemoveColumn(column)} sx={{ ml: 0.5, p: 0 }}>
                <X size={12} />
              </IconButton>
            </Box>
          ))}
          <IconButton size="small" sx={{ ml: "auto" }}>
            <ChevronDown size={16} />
          </IconButton>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <StyledLabel>Filters</StyledLabel>
        <Box sx={{ mb: 1 }}>
          <Box sx={{ display: "flex", gap: 1, mb: 1 }}>
            <Typography sx={{ flex: 1, fontFamily: "Open Sans", fontSize: "14px", color: "#6B7280" }}>
              Columns
            </Typography>
            <Typography sx={{ flex: 1, fontFamily: "Open Sans", fontSize: "14px", color: "#6B7280" }}>
              Operator
            </Typography>
            <Typography sx={{ flex: 1, fontFamily: "Open Sans", fontSize: "14px", color: "#6B7280" }}>Value</Typography>
          </Box>

          {values.filters &&
            values.filters.map((filter, index) => (
              <Box key={index} sx={{ display: "flex", gap: 1, mb: 1 }}>
                <Box sx={{ flex: 1 }}>
                  <CustomSelect
                    name={`filters[${index}].column`}
                    options={columnOptions}
                    value={filter.column}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    width="100%"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <CustomSelect
                    name={`filters[${index}].operator`}
                    options={operatorOptions}
                    value={filter.operator}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    width="100%"
                  />
                </Box>
                <Box sx={{ flex: 1 }}>
                  <CustomSelect
                    name={`filters[${index}].value`}
                    options={filterValueOptions}
                    value={filter.value}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    width="100%"
                  />
                </Box>
              </Box>
            ))}
        </Box>

        <Box sx={{ display: "flex", justifyContent: "space-between" }}>
          <Button
            startIcon={<Plus size={16} />}
            onClick={addFilter}
            sx={{
              color: "#1C2D5F",
              fontFamily: "Open Sans",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Add Filter
          </Button>

          <Button
            onClick={removeAllFilters}
            sx={{
              color: "#1C2D5F",
              fontFamily: "Open Sans",
              fontSize: "14px",
              fontWeight: 600,
              textTransform: "none",
            }}
          >
            Remove All
          </Button>
        </Box>
      </Box>

      <Box sx={{ borderTop: "1px solid #E5E7EB", my: 2 }} />

      {/* Calendar by */}
      <Box sx={{ mb: 3 }}>
        <StyledLabel>Calendar by</StyledLabel>
        <RadioGroup
          name="calendarBy"
          value={values.calendarBy}
          onChange={handleChange}
          onBlur={handleBlur}
          row
          sx={{ gap: 2 }}
        >
          <FormControlLabel
            value="day"
            control={<Radio size="small" />}
            label={<Typography sx={{ fontFamily: "Open Sans", fontSize: "14px" }}>Day</Typography>}
          />
          <FormControlLabel
            value="week"
            control={<Radio size="small" />}
            label={<Typography sx={{ fontFamily: "Open Sans", fontSize: "14px" }}>Week</Typography>}
          />
          <FormControlLabel
            value="month"
            control={<Radio size="small" />}
            label={<Typography sx={{ fontFamily: "Open Sans", fontSize: "14px" }}>Month</Typography>}
          />
        </RadioGroup>
        {showError("calendarBy")}
      </Box>
    </Box>
  )
}

export default SaveViewForm