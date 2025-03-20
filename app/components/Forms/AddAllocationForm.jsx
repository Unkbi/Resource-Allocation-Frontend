// "use client"

// import { useState } from "react"
// import { TextField, Box, Typography, Radio, RadioGroup, FormControlLabel } from "@mui/material"
// import CustomSelect from "../Select/CustomSelect"
// import StyledLabel from "../Label/StyledLabel"
// import { StyledInput } from "../Input/StyledInput"
// import CustomDatePicker from "../DatePicker/CustomDatePicker"

// const AddAllocationForm = ({ formikProps }) => {
//   const { values, handleChange, handleBlur, setFieldValue } = formikProps
//   const [capacityOption, setCapacityOption] = useState("")
//   const [customCapacity, setCustomCapacity] = useState("")

//   const projectOptions = [
//     { value: "Design 1", label: "Design 1" },
//     { value: "Design 2", label: "Design 2" },
//     { value: "Design 3", label: "Design 3" },
//   ]

//   const resourceTypeOptions = [
//     { value: "Type A", label: "Type A" },
//     { value: "Type B", label: "Type B" },
//     { value: "Type C", label: "Type C" },
//   ]

//   const handleCapacityChange = (event) => {
//     const value = event.target.value
//     setCapacityOption(value)
//     if (value === "custom") {
//       setFieldValue("allocationEntered", Number(customCapacity))
//     } else {
//       setFieldValue("AllocationEntered",  Number(value))
//     }
//   }

//   const handleCustomCapacityChange = (event) => {
//     const value = event.target.value
//     setCustomCapacity(value)
//     setCapacityOption("custom")
//     setFieldValue("AllocationEntered",  Number(value))
//   }

//   return (
//     <Box>
//       <Box sx={{ pb: 2 }}>
//         <StyledLabel>Resource</StyledLabel>
//         <CustomSelect
//           name="Resource"
//           options={resourceTypeOptions}
//           value={values.Resource}
//           onChange={handleChange}
//           onBlur={handleBlur}
//         />
//       </Box>
//       <Box sx={{ pb: 2 }}>
//         <StyledLabel>Project</StyledLabel>
//         <CustomSelect
//           name="Project"
//           options={projectOptions}
//           value={values.Project}
//           onChange={handleChange}
//           onBlur={handleBlur}
//         />
//       </Box>
//       <Box>
//         <Box
//           sx={{
//             background: "rgba(28, 45, 95, 0.05)",
//             height: "33px",
//             width: "340px",
//             p: 1,
//           }}
//         >
//           <Typography
//             sx={{
//               color: '#313F68',
//               fontFamily: 'Open Sans',
//               fontSize: '12px',
//               fontStyle: 'normal',
//               fontWeight: '700',
//             }}
//           >
//             Add Bulk Allocation
//           </Typography>
//         </Box>
//         <Box sx={{ pb: 2, pt: 2 }}>
//           <StyledLabel>Date Range</StyledLabel>
//           <Box sx={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
//             <CustomDatePicker
//               name="StartDate"
//               handleChange={handleChange}
//               value={values.StartDate}
//               placeholder={"Start Date"}
//               formikProps={formikProps}
//             />
//             <CustomDatePicker
//               name="EndDate"
//               handleChange={handleChange}
//               value={values.EndDate}
//               placeholder={"End Date"}
//               formikProps={formikProps}
//             />
//           </Box>
//         </Box>
//         <Box>
//           <RadioGroup
//             row
//             name="capacity-radio-group"
//             value={capacityOption}
//             onChange={handleCapacityChange}
//             sx={{ display: "flex", alignItems: "center", gap: "22px" }}
//           >
//             <FormControlLabel
//               value="1.0"
//               control={<Radio sx={{ display: "none" }} />}
//               label={
//                 <Box
//                   sx={{
//                     width: "60px",
//                     height: "32px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     backgroundColor: capacityOption === "1.0" ? "#e6f7e6" : "#f0f7f0",
//                     border: capacityOption === "1.0" ? "2px solid #a3d9a3" : "1px solid #d0e8d0",
//                     borderRadius: "4px",
//                     cursor: "pointer",
//                   }}
//                 >
//                   1.0
//                 </Box>
//               }
//               sx={{ margin: 0 }}
//             />
//             <FormControlLabel
//               value="0.5"
//               control={<Radio sx={{ display: "none" }} />}
//               label={
//                 <Box
//                   sx={{
//                     width: "60px",
//                     height: "32px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     backgroundColor: capacityOption === "0.5" ? "#fff8e6" : "#fffbf0",
//                     border: capacityOption === "0.5" ? "2px solid #ffd580" : "1px solid #ffe9b3",
//                     borderRadius: "4px",
//                     cursor: "pointer",
//                   }}
//                 >
//                   0.5
//                 </Box>
//               }
//               sx={{ margin: 0 }}
//             />
//             <FormControlLabel
//               value="0.2"
//               control={<Radio sx={{ display: "none" }} />}
//               label={
//                 <Box
//                   sx={{
//                     width: "60px",
//                     height: "32px",
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                     backgroundColor: capacityOption === "0.2" ? "#fde6ef" : "#fef0f5",
//                     border: capacityOption === "0.2" ? "2px solid #f8b3d9" : "1px solid #fbd9ec",
//                     borderRadius: "4px",
//                     cursor: "pointer",
//                   }}
//                 >
//                   0.2
//                 </Box>
//               }
//               sx={{ margin: 0 }}
//             />
//             <FormControlLabel
//               value="custom"
//               control={<Radio sx={{ display: "none" }} />}
//               label={
//                 <StyledInput
//                   as={TextField}
//                   name="customCapacity"
//                   type="number"
//                   width="60px"
//                   value={customCapacity}
//                   onChange={handleCustomCapacityChange}
//                   onBlur={handleBlur}
//                   onClick={() => setCapacityOption("custom")}
//                 />
//               }
//               sx={{ margin: 0 }}
//             />
//           </RadioGroup>
//         </Box>
//       </Box>
//     </Box>
//   )
// }

// export default AddAllocationForm

"use client"

import { useState } from "react"
import { TextField, Box, Typography, RadioGroup, FormControlLabel, Radio } from "@mui/material"
import CustomSelect from "../Select/CustomSelect"
import StyledLabel from "../Label/StyledLabel"
import { StyledInput } from "../Input/StyledInput"
import CustomDatePicker from "../DatePicker/CustomDatePicker"
import StyledRadioButton from "../RadioButton/StyledRadioButton"

const AddAllocationForm = ({ formikProps }) => {
  const { values, handleChange, handleBlur, setFieldValue } = formikProps
  const [capacityOption, setCapacityOption] = useState("")
  const [customCapacity, setCustomCapacity] = useState("")

  const projectOptions = [
    { value: "Design 1", label: "Design 1" },
    { value: "Design 2", label: "Design 2" },
    { value: "Design 3", label: "Design 3" },
  ]

  const resourceTypeOptions = [
    { value: "Type A", label: "Type A" },
    { value: "Type B", label: "Type B" },
    { value: "Type C", label: "Type C" },
  ]

  const handleCapacityChange = (event) => {
    const value = event.target.value
    setCapacityOption(value)
    if (value === "custom") {
      setFieldValue("allocationEntered", Number(customCapacity))
    } else {
      setFieldValue("AllocationEntered", Number(value))
    }
  }

  const handleCustomCapacityChange = (event) => {
    const value = event.target.value
    setCustomCapacity(value)
    setCapacityOption("custom")
    setFieldValue("AllocationEntered", Number(value))
  }

  return (
    <Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Resource</StyledLabel>
        <CustomSelect
          name="Resource"
          options={resourceTypeOptions}
          value={values.Resource}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </Box>
      <Box sx={{ pb: 2 }}>
        <StyledLabel>Project</StyledLabel>
        <CustomSelect
          name="Project"
          options={projectOptions}
          value={values.Project}
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
              value={values.StartDate}
              placeholder={"Start Date"}
              formikProps={formikProps}
            />
            <CustomDatePicker
              name="EndDate"
              handleChange={handleChange}
              value={values.EndDate}
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
                  name="customCapacity"
                  type="number"
                  width="60px"
                  value={customCapacity}
                  onChange={handleCustomCapacityChange}
                  onBlur={handleBlur}
                  onClick={() => setCapacityOption("custom")}
                />
              }
              sx={{ margin: 0 }}
            />
          </RadioGroup>
        </Box>
      </Box>
    </Box>
  )
}

export default AddAllocationForm

