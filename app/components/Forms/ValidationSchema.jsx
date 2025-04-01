import * as Yup from 'yup';


export const addProjectValidationSchema = (projects = [])=> {
  const projectNames = Array.isArray(projects?.result)? projects?.result?.map((project) => project.Name?.toLowerCase().trim()): [];

  return  Yup.object({
  Name: Yup.string().max(90,'Reached Max Characters').required('Project Name is required').test(
    'unique-name',
    'Project Name already exists. Please choose another name.',
    (value) => {
      if (!value) return true;
      return !projectNames.includes(value.toLowerCase().trim());
    } ,
  ),
  Type: Yup.string().required("Project type is required"),
  AllowOvertime: Yup.boolean().required("Allow overtime selection is required"),
  StartDate: Yup.date()
    .nullable()
    .typeError('Invalid date format')
    .test(
      'required-if-end-date',
      'Start date is required if end date is provided',
      function (value) {
        const { EndDate } = this.parent;
        return !EndDate || value !== null;
      }
    ),

  EndDate: Yup.date()
    .nullable()
    .typeError('Invalid date format')
    .test(
      'required-if-start-date',
      'End date is required if start date is provided',
      function (value) {
        const { StartDate } = this.parent;
        return !StartDate || value !== null;
      })
    .min(Yup.ref('StartDate'), 'End date must be after or equal to start date'),
  Status: Yup.string().default('Active').required('Status is required'),
})
}

export const addResourceValidationSchema = Yup.object({
  Resource: Yup.string().required("Resource is required"),
  Type: Yup.string().required("Type is required"),
  Skills: Yup.string().required("Skills are required"),
})

export const addAllocationValidationSchema = Yup.object({
    Resource: Yup.array()
      .of(Yup.string())
      .min(1, 'You must select at least one Resource')
      .required('Resource is required'),
    Project: Yup.array()
      .of(Yup.string())
      .min(1, 'You must select at least one Project')
      .required('Project is required'),
    StartDate: Yup.date().required("Start date is required"),
    // EndDate: Yup.date().required("End date is required").min(Yup.ref("StartDate"), "End date must be after or equal to start date"),
    AllocationEntered: Yup.number()
      .required("Allocation is required")
      .min(0, "Allocation must be a positive number")
      .max(1, "Allocation cannot exceed 1.0"),
  })

export const assignAllocationValidationSchema = Yup.object({
  Resource: Yup.string().required("Resource is required"),
  Project: Yup.string().required("Project is required"),
  StartDate: Yup.date().required("Start date is required"),
  EndDate: Yup.date()
    .required("End date is required")
    .min(Yup.ref("StartDate"), "End date must be after or equal to start date"),
  Hours: Yup.number().required("Hours are required").positive("Hours must be positive"),
})