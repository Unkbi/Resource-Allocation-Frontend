// validationSchemas.js
import * as Yup from 'yup';

export const addProjectValidationSchema = Yup.object({
  projectName: Yup.string().required('Project Name is required'),
  projectDescription: Yup.string().required('Project Description is required'),
});

export const addResourceValidationSchema = Yup.object({
  resourceName: Yup.string().required('Resource Name is required'),
  resourceType: Yup.string().required('Resource Type is required'),
});

export const addAllocationValidationSchema = Yup.object({
  team: Yup.string().required('Team is required'),
  project: Yup.string().required('Project is required'),
  resource: Yup.string().required('Resource is required'),
  week: Yup.string().required('Week is required'),
  capacity: Yup.number()
    .required('Capacity is required')
    .min(0, 'Capacity must be at least 0')
    .max(1, 'Capacity must be at most 1'),
});

export const assignAllocationValidationSchema = Yup.object({
  team: Yup.string().required('Team is required'),
  project: Yup.string().required('Project is required'),
  resource: Yup.string().required('Resource is required'),
  week: Yup.string().required('Week is required'),
  capacity: Yup.number()
    .required('Capacity is required')
    .min(0, 'Capacity must be at least 0')
    .max(1, 'Capacity must be at most 1'),
});
