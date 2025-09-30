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

export const addProjectValidationSchema = (
  projects: ProjectsPayload = {},
  initialName = ''
) => {
  const projectNames = Array.isArray(projects)
    ? projects?.map(project => project.Name?.toLowerCase().trim())
    : [];

  return Yup.object({
    Name: Yup.string()
      .max(90, 'Reached Max Characters')
      .required('Project Name is required')
      .test(
        'unique-name',
        'Project Name already exists. Please choose another name.',
        value => {
          if (!value) return true;
          if (initialName && value === initialName) return true; // Allow the same name if it's the initial value
          return !projectNames.includes(value.toLowerCase().trim());
        }
      ),
    Type: Yup.string().required('Project type is required'),
    AllowOvertime: Yup.string().required('Allow overtime is required'),
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
      // .test(
      //   'required-if-start-date',
      //   'End date is required if start date is provided',
      //   function (value) {
      //     const { StartDate } = this.parent;
      //     return !StartDate || value !== null;
      //   }
      // )
      .min(
        Yup.ref('StartDate'),
        'End date must be after or equal to start date'
      ),
    Status: Yup.string().default('Active').required('Status is required'),
    Budget: Yup.number().nullable().typeError('Must be a number'),
  });
};

export const addTeamValidationSchema = Yup.object().shape({
  Name: Yup.string().trim().required('Team Name is required'),
  AllocationManager: Yup.string(),
  Status: Yup.string()
    .oneOf(['Active', 'Inactive'], 'Invalid status')
    .required('Status is required'),
});

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const addResourceValidationSchema = Yup.object({
  FirstName: Yup.string().required('First Name is required'),
  LastName: Yup.string().required('Last Name is required'),
  Email: Yup.string()
    .required('Email is required')
    .matches(emailRegex, 'Enter a valid email address'),
  Role: Yup.string().required('Role is required'),
  Type: Yup.string().required('Resource type is required'),
  Manager: Yup.string(),
  Team: Yup.string().required('Team is required'),
  ContractorHourlyRate: Yup.number().nullable().typeError('Must be a number'),
  AverageWeeklyHours: Yup.number().nullable().typeError('Must be a number'),
  Organisation: Yup.string().required('Organization is required'),
  EndDate: Yup.string()
    .nullable()
    .when(['Status', 'StartDate'], {
      is: (status: String) => status === 'Inactive',
      then: schema =>
        schema
          .required('End Date is required')
          .test(
            'end-after-start',
            'End Date cannot be before Start Date',
            function (endDate) {
              const { StartDate } = this.parent;
              if (!endDate || !StartDate) return true;
              return new Date(endDate) >= new Date(StartDate);
            }
          ),
      otherwise: schema =>
        schema.test(
          'end-after-start',
          'End Date cannot be before Start Date',
          function (endDate) {
            const { StartDate } = this.parent;
            if (!endDate || !StartDate) return true;
            return new Date(endDate) >= new Date(StartDate);
          }
        ),
    }),
});

// Temporary fix till we have the new API for Resource Creation and Update. This will be removed.
export const editResourceValidationSchema = Yup.object({
  FirstName: Yup.string().required('First Name is required'),
  LastName: Yup.string().required('Last Name is required'),
  Email: Yup.string()
    .required('Email is required')
    .matches(emailRegex, 'Enter a valid email address'),
  Role: Yup.string().required('Role is required'),
  Type: Yup.string().required('Resource type is required'),
  Manager: Yup.string(),
  Team: Yup.string().required('Team is required'),
  Organisation: Yup.string().required('Organization is required'),
  ContractorHourlyRate: Yup.number().nullable().typeError('Must be a number'),
  AverageWeeklyHours: Yup.number().nullable().typeError('Must be a number'),
  EndDate: Yup.string()
    .nullable()
    .when(['Status', 'StartDate'], {
      is: (status: String) => status === 'Inactive',
      then: schema =>
        schema.test(
          'end-after-start',
          'End Date cannot be before Start Date',
          function (endDate) {
            const { StartDate } = this.parent;
            if (!endDate || !StartDate) return true;
            return new Date(endDate) >= new Date(StartDate);
          }
        ),
      otherwise: schema =>
        schema.test(
          'end-after-start',
          'End Date cannot be before Start Date',
          function (endDate) {
            const { StartDate } = this.parent;
            if (!endDate || !StartDate) return true;
            return new Date(endDate) >= new Date(StartDate);
          }
        ),
    }),
  ConfirmTransfer: Yup.boolean()
    .oneOf([true], 'You must confirm before continuing.')
    .required('You must confirm before continuing.'),
});

export const addAllocationValidationSchema = (scalarSettings: any) =>
  Yup.object({
    Resource: Yup.array()
      .of(Yup.string())
      .min(1, 'You must select at least one Resource')
      .required('Resource is required'),
    Project: Yup.array()
      .of(Yup.string())
      .min(1, 'You must select at least one Project')
      .required('Project is required'),
    StartDate: Yup.date().required('Start date is required'),
    EndDate: Yup.date()
      .required('End date is required')
      .min(
        Yup.ref('StartDate'),
        'End date must be after or equal to start date'
      ),
    AllocationEntered: Yup.number()
      .required('Allocation is required')
      .min(0, 'Allocation must be a positive number')
      .max(
        scalarSettings?.Max_Allocation_Error || '2.0',
        `Allocation cannot exceed ${scalarSettings?.Max_Allocation_Error || '2.0'}.`
      ),
  });

const stripTime = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export function getProjectRangeWarnings(
  values: Values,
  projects: ProjectsPayload
): string[] {
  const warnings: string[] = [];
  const { Project: selectedIds, StartDate, EndDate } = values;

  if (Array.isArray(projects) && selectedIds?.length && StartDate && EndDate) {
    const allocationStart = stripTime(new Date(StartDate));
    const allocationEnd = stripTime(new Date(EndDate));

    const selectedProjects = projects.filter(p => selectedIds.includes(p.Id));

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
  Hours: Yup.number()
    .required('Hours are required')
    .positive('Hours must be positive'),
});

export const saveViewValidationSchema = Yup.object({
  groupBy: Yup.string().required('Group By is required'),
  showBy: Yup.string().required('Show By is required'),
  dateRangeType: Yup.string().required('Date Range Type is required'),
  dynamicDateRangeAdd: Yup.number().test(
    'max-weeks',
    'Date range cannot exceed 1 year (51 weeks)',
    function (value) {
      const subtract = this.parent.dynamicDateRangeSubtract;
      return value + subtract < 52;
    }
  ),
  dynamicDateRangeSubtract: Yup.number().test(
    'max-weeks',
    'Date range cannot exceed 1 year (51 weeks)',
    function (value) {
      const add = this.parent.dynamicDateRangeAdd;
      return value + add < 52;
    }
  ),
  startDate: Yup.date().when('dateRangeType', {
    is: 'fixed',
    then: schema => schema.required('Start Date is required'),
    otherwise: schema => schema.nullable(),
  }),
  endDate: Yup.date().when('dateRangeType', {
    is: 'fixed',
    then: schema =>
      schema
        .required('End Date is required')
        .min(
          Yup.ref('startDate'),
          'End date must be after or equal to start date'
        ),
    otherwise: schema => schema.nullable(),
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
      .test(
        'unique-name',
        'This name already exists in saved views.',
        function (value) {
          if (!value) return true;

          const currentId = this.parent?.id;
          const trimmedValue = value.toLowerCase().trim();

          return !savedViews.some(view => {
            const viewName = view?.Name?.toLowerCase()?.trim();
            return viewName === trimmedValue && view?.Id !== currentId;
          });
        }
      ),
    description: Yup.string(),
    isDefault: Yup.boolean(),
  });

export const cloneResourceValidationSchema = Yup.object({
  Resource: Yup.array()
    .of(Yup.string())
    .min(1, 'You must select at least one Resource')
    .required('Resource is required'),
  Project: Yup.array()
    .of(Yup.string())
    .min(1, 'You must select at least one Project')
    .required('Project is required'),
  StartDate: Yup.date().required('Start date is required'),
  EndDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('StartDate'), 'End date must be after or equal to start date'),
});

export const transferResourceValidationSchema = Yup.object({
  Resource: Yup.array()
    .of(Yup.string())
    .min(1, 'You must select at least one Resource')
    .required('Resource is required'),
  Project: Yup.array()
    .of(Yup.string())
    .min(1, 'You must select at least one Project')
    .required('Project is required'),
  StartDate: Yup.date().required('Start date is required'),
  EndDate: Yup.date()
    .required('End date is required')
    .min(Yup.ref('StartDate'), 'End date must be after or equal to start date'),
});

export const addRatesValidationSchema = Yup.object({
  WorkLocation: Yup.string().required('Location is required'),
  HRLevel: Yup.string().required('HRLevel is required'),
  HourlyRate: Yup.number().required('HourlyRate is required'),
  HourlyRateCurrency: Yup.string().required('Currency is required'),
  ValidityStartDate: Yup.date()
    .required('Start Date is required')
    .typeError('Start Date must be a valid date'),
  ValidityEndDate: Yup.date()
    .required('End Date is required')
    .typeError('End Date must be a valid date')
    .min(
      Yup.ref('ValidityStartDate'),
      'End Date must be after or the same as Start Date'
    ),
  Status: Yup.string().required('Status is required'),
});

export const openHistoryValidationSchema = Yup.object({
  StartDate: Yup.date().required('Start Date is required'),
  EndDate: Yup.date()
    .required('End Date is required')
    .min(Yup.ref('StartDate'), 'End Date must be after or equal to Start Date'),
  Resource: Yup.string().required('Resource is required'),
  Project: Yup.string().optional(),
});
export const addPortfolioValidationSchema = (
  portfolios: any,
  initialName = ''
) => {
  const portfolioNames = Array.isArray(portfolios)
    ? portfolios.map(p => p.Name?.toLowerCase().trim())
    : [];
  return Yup.object({
    Name: Yup.string()
      .required('Name is required')
      .test(
        'unique-name',
        'A portfolio with this name already exists.',
        function (value) {
          if (!value) return true;
          const currentName = value.toLowerCase().trim();
          const originalName = initialName.toLowerCase().trim();
          return (
            currentName === originalName ||
            !portfolioNames.includes(currentName)
          );
        }
      ),
    Status: Yup.string().required('Status is required'),
    Description: Yup.string().nullable(),
  });
};

// org schema
export const addOrganizationValidationSchema = (
  organizations: any[] = [],
  initialName = ''
) => {
  const organizationNames = Array.isArray(organizations)
    ? organizations.map(org => org.Name?.toLowerCase().trim())
    : [];

  return Yup.object({
    Name: Yup.string()
      .required('Organization name is required')
      .max(90, 'Reached Max Characters')
      .test(
        'unique-name',
        'Organization name already exists. Please choose another name.',
        value => {
          if (!value) return true;
          if (
            initialName &&
            value.toLowerCase().trim() === initialName.toLowerCase().trim()
          )
            return true;
          return !organizationNames.includes(value.toLowerCase().trim());
        }
      ),
    Status: Yup.string()
      .oneOf(['Active', 'Inactive'], 'Status must be Active or Inactive')
      .required('Status is required'),
  });
};

export const addRoleValidationSchema = Yup.object({
  name: Yup.string()
    .required('Role Name is required')
    .max(90, 'Reached Max Characters')
    .matches(/^[^\s]+$/, 'Name must be a single word without spaces') // <- added check for single word
    .test(
      'unique-name',
      'Role Name already exists. Please choose another name.',
      function (value) {
        if (!value) return true;
        const roleNames = this.options.context?.roleNames || [];
        return !roleNames.includes(value.toLowerCase().trim());
      }
    ),
});

export const assignRoleValidationSchema = Yup.object({
  Assignee: Yup.string().required('Assignee is required'),
  Role: Yup.string().required('Role is required'),
  Status: Yup.string().required('Status is required'),
});

export const addPrivilegeValidationSchema = Yup.object({
  Name: Yup.string()
    .required('Privilege Name is required')
    .max(90, 'Reached Max Characters')
    .test(
      'unique-name',
      'Privilege Name already exists. Please choose another name.',
      function (value) {
        if (!value) return true;
        const privilegeNames = this.options.context?.privilegeNames || [];
        return !privilegeNames.includes(value.toLowerCase().trim());
      }
    ),
  Resource: Yup.string().required('Entity is required'),
  Actions: Yup.object().test(
    'at-least-one-action',
    'At least one action must be selected',
    value => !!value && Object.values(value).some(v => v)
  ),
});

export const assignPrivilegeValidationSchema = Yup.object({
  Role: Yup.string().required('Role is required'),
  Permission: Yup.string().required('Privilege is required'),
});

export const addProjectTypeGroupValidationSchema = (
  projectTypeGroups: any[] = [],
  initialName = ''
) => {
  const projectTypeGroupNames = Array.isArray(projectTypeGroups)
    ? projectTypeGroups.map(ptg => ptg.Name?.toLowerCase().trim())
    : [];

  return Yup.object({
    Name: Yup.string()
      .required('Project Type Group name is required')
      .max(90, 'Reached Max Characters')
      .test(
        'unique-name',
        'Project Type Group name already exists. Please choose another name.',
        value => {
          if (!value) return true;
          if (
            initialName &&
            value.toLowerCase().trim() === initialName.toLowerCase().trim()
          )
            return true;
          return !projectTypeGroupNames.includes(value.toLowerCase().trim());
        }
      ),
  });
};

export const addProjectTypeValidationSchema = (
  projectTypes: any[] = [],
  initialName = ''
) => {
  const projectTypeNames = Array.isArray(projectTypes)
    ? projectTypes.map(pt => pt.Name?.toLowerCase().trim())
    : [];

  return Yup.object({
    Name: Yup.string()
      .required('Project Type Name is required')
      .max(90, 'Reached Max Characters')
      .test(
        'unique-name',
        'Project Type Name already exists. Please choose another name.',
        value => {
          if (!value) return true;
          const trimmedValue = value.toLowerCase().trim();
          const trimmedInitial = initialName.toLowerCase().trim();
          if (initialName && trimmedValue === trimmedInitial) {
            return true; // Allow same name when editing
          }
          return !projectTypeNames.includes(trimmedValue);
        }
      ),
    Status: Yup.string()
      .oneOf(['Active', 'Inactive'], 'Status must be Active or Inactive')
      .required('Status is required'),
    ProjectTypeGroup: Yup.string().required('Project Type Group is required'),
    Description: Yup.string().nullable(),
    Color: Yup.string().required('Color is required'),
  });
};

export const addLocationValidationSchema = (
  locations: any[] = [],
  initialName = ''
) => {
  const locationNames = Array.isArray(locations)
    ? locations.map(loc => loc.Name?.toLowerCase().trim())
    : [];

  return Yup.object({
    Name: Yup.string()
      .required('Location Name is required')
      .max(90, 'Reached Max Characters')
      .test(
        'unique-name',
        'Location Name already exists. Please choose another name.',
        value => {
          if (!value) return true;
          const trimmedValue = value.toLowerCase().trim();
          const trimmedInitial = initialName.toLowerCase().trim();
          if (initialName && trimmedValue === trimmedInitial) {
            return true; // Allow same name when editing
          }
          return !locationNames.includes(trimmedValue);
        }
      ),
    LocationGroup: Yup.string().required('Location Group is required'),
    Status: Yup.string()
      .oneOf(['Active', 'Inactive'], 'Status must be Active or Inactive')
      .required('Status is required'),
  });
};

export const addLocationGroupValidationSchema = (
  locationGroups: any[] = [],
  initialName = ''
) => {
  const locationGroupNames = Array.isArray(locationGroups)
    ? locationGroups.map(lg => lg.Name?.toLowerCase().trim())
    : [];
  return Yup.object({
    Name: Yup.string()
      .required('Location Group Name is required')
      .max(90, 'Reached Max Characters')
      .test(
        'unique-name',
        'Location Group Name already exists. Please choose another name.',
        value => {
          if (!value) return true;
          if (
            initialName &&
            value.toLowerCase().trim() === initialName.toLowerCase().trim()
          )
            return true;
          return !locationGroupNames.includes(value.toLowerCase().trim());
        }
      ),
  });
};
