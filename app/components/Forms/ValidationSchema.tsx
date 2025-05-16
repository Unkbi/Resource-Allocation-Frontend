import * as Yup from 'yup';

interface Project {
  Id: string;
  Name?: string;
  StartDate?: string;
  EndDate?: string;
  [key: string]: any;
}

interface ProjectsPayload {
  result?: Project[];
}

interface Values {
  Project: string[];
  StartDate: string;
  EndDate: string;
  [key: string]: any;
}

export const addProjectValidationSchema = (projects: ProjectsPayload = {}) => {
  const projectNames = Array.isArray(projects?.result)
    ? projects.result.map((project) => project.Name?.toLowerCase().trim())
    : [];

  return Yup.object({
    Name: Yup.string()
      .max(90, 'Reached Max Characters')
      .required('Project Name is required')
      .test(
        'unique-name',
        'Project Name already exists. Please choose another name.',
        (value) => {
          if (!value) return true;
          return !projectNames.includes(value.toLowerCase().trim());
        }
      ),
    Type: Yup.string().required('Project type is required'),
    AllowOvertime: Yup.boolean().required('Allow overtime selection is required'),
    StartDate: Yup.date()
      .nullable()
      .typeError('Invalid date format')
      .test('required-if-end-date', 'Start date is required if end date is provided', function (value) {
        const { EndDate } = this.parent;
        return !EndDate || value !== null;
      }),
    EndDate: Yup.date()
      .nullable()
      .typeError('Invalid date format')
      .test('required-if-start-date', 'End date is required if start date is provided', function (value) {
        const { StartDate } = this.parent;
        return !StartDate || value !== null;
      })
      .min(Yup.ref('StartDate'), 'End date must be after or equal to start date'),
    Status: Yup.string().default('Active').required('Status is required'),
  });
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const addResourceValidationSchema = Yup.object({
  FirstName: Yup.string().required('First Name is required'),
  LastName: Yup.string().required('Last Name is required'),
  Email: Yup.string()
    .required('Email is required')
    .matches(emailRegex, 'Enter a valid email address'),  
  Department: Yup.string().required('Department is required'),
  Role: Yup.string().required('Role is required'),
  HRLevel: Yup.string().required('HR Level is required'),
  Type: Yup.string().required('Resource type is required'),
  Manager: Yup.string().required('Manager is required'),
  ContractorHourlyRate: Yup.number().nullable().typeError('Must be a number'),
  AverageWeeklyHours: Yup.number().nullable().typeError('Must be a number'),
  EndDate: Yup.string()
  .nullable()
  .when(['Status', 'StartDate'], {
    is: (status: String) => status === 'Inactive',
    then: (schema) =>
      schema
        .required('End Date is required')
        .test('end-after-start', 'End Date cannot be before Start Date', function (endDate) {
          const { StartDate } = this.parent;
          if (!endDate || !StartDate) return true;
          return new Date(endDate) >= new Date(StartDate);
        }),
    otherwise: (schema) =>
      schema.test('end-after-start', 'End Date cannot be before Start Date', function (endDate) {
        const { StartDate } = this.parent;
        if (!endDate || !StartDate) return true;
        return new Date(endDate) >= new Date(StartDate);
      }),
  }),
});

export const addAllocationValidationSchema = Yup.object({
  Resource: Yup.array().of(Yup.string()).min(1, 'You must select at least one Resource').required('Resource is required'),
  Project: Yup.array().of(Yup.string()).min(1, 'You must select at least one Project').required('Project is required'),
  StartDate: Yup.date().required('Start date is required'),
  EndDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('StartDate'), 'End date must be after or equal to start date'),
  AllocationEntered: Yup.number()
    .required('Allocation is required')
    .min(0, 'Allocation must be a positive number')
    .max(2, 'Allocation cannot exceed 2.0'),
});

const stripTime = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function getProjectRangeWarnings(values: Values, projects: ProjectsPayload): string[] {
  const warnings: string[] = [];
  const { Project: selectedIds, StartDate, EndDate } = values;

  if (Array.isArray(projects.result) && selectedIds?.length && StartDate && EndDate) {
    const allocationStart = stripTime(new Date(StartDate));
    const allocationEnd = stripTime(new Date(EndDate));

    const selectedProjects = projects.result.filter((p) => selectedIds.includes(p.Id));

    selectedProjects.forEach(({ Name, StartDate: pSD, EndDate: pED }) => {
      if (!pSD || !pED) return;

      const projectStart = stripTime(new Date(pSD));
      const projectEnd = stripTime(new Date(pED));

      if (allocationStart < projectStart || allocationEnd > projectEnd) {
        const fmtStart = projectStart.toLocaleDateString();
        const fmtEnd = projectEnd.toLocaleDateString();
        warnings.push(`“${Name}” should be between ${fmtStart} and ${fmtEnd}.`);
      }
    });
  }

  return warnings;
}

export const assignAllocationValidationSchema = Yup.object({
  Resource: Yup.string().required('Resource is required'),
  Project: Yup.string().required('Project is required'),
  StartDate: Yup.date().required('Start date is required'),
  EndDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('StartDate'), 'End date must be after or equal to start date'),
  Hours: Yup.number().required('Hours are required').positive('Hours must be positive'),
});

export const saveViewValidationSchema = Yup.object({
  groupBy: Yup.string().required('Group By is required'),
  showBy: Yup.string().required('Show By is required'),
  dateRangeType: Yup.string().required('Date Range Type is required'),
  dynamicDateRangeAdd: Yup.number().test('max-weeks', 'Date range cannot exceed 1 year (51 weeks)', function (value) {
    const subtract = this.parent.dynamicDateRangeSubtract;
    return value + subtract < 52;
  }),
  dynamicDateRangeSubtract: Yup.number().test('max-weeks', 'Date range cannot exceed 1 year (51 weeks)', function (value) {
    const add = this.parent.dynamicDateRangeAdd;
    return value + add < 52;
  }),
  startDate: Yup.date().when('dateRangeType', {
    is: 'fixed',
    then: (schema) => schema.required('Start Date is required'),
    otherwise: (schema) => schema.nullable(),
  }),
  endDate: Yup.date().when('dateRangeType', {
    is: 'fixed',
    then: (schema) =>
      schema.required('End Date is required').min(Yup.ref('startDate'), 'End date must be after or equal to start date'),
    otherwise: (schema) => schema.nullable(),
  }),
  showColumns: Yup.array().min(1, 'At least one column must be selected'),
  filters: Yup.array().of(
    Yup.object({
      field: Yup.string().required('Column is required'),
      operator: Yup.string().required('Operator is required'),
    })
  ),
  calendarBy: Yup.string().required('Calendar By is required'),
});

interface SavedView {
  Id?: string;
  Name?: string;
  [key: string]: any;
}

export const nameViewValidationSchema = (savedViews: SavedView[] = []) =>
  Yup.object({
    name: Yup.string()
      .required('Name is required')
      .test('unique-name', 'This name already exists in saved views.', function (value) {
        if (!value) return true;

        const currentId = this.parent?.id;
        const trimmedValue = value.toLowerCase().trim();

        return !savedViews.some((view) => {
          const viewName = view?.Name?.toLowerCase()?.trim();
          return viewName === trimmedValue && view?.Id !== currentId;
        });
      }),
    description: Yup.string(),
    isDefault: Yup.boolean(),
  });

export const cloneResourceValidationSchema = Yup.object({
  Resource: Yup.array().of(Yup.string()).min(1, 'You must select at least one Resource').required('Resource is required'),
  Project: Yup.array().of(Yup.string()).min(1, 'You must select at least one Project').required('Project is required'),
  StartDate: Yup.date().required('Start date is required'),
  EndDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('StartDate'), 'End date must be after or equal to start date'),
});

export const transferResourceValidationSchema = Yup.object({
  Resource: Yup.array().of(Yup.string()).min(1, 'You must select at least one Resource').required('Resource is required'),
  Project: Yup.array().of(Yup.string()).min(1, 'You must select at least one Project').required('Project is required'),
  StartDate: Yup.date().required('Start date is required'),
  EndDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('StartDate'), 'End date must be after or equal to start date'),
});
