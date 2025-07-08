import {
  addWeeks,
  format,
  isBefore,
  //@ts-ignore
  parseISO,
  startOfWeek,
} from 'date-fns';
import {
  AllAllocations,
  Allocation,
  AllocationGridCell,
  AllocationGridCellData,
  ApiResponse,
  CostAllocation,
  Portfolio,
  Project,
  ProjectsTableRow,
  Resource,
  ResourceAllocation,
  Team,
} from '../types';
import {
  generateAllWeeks,
  getMondayOfWeek,
  getResourceFromUid,
  getTeamForResource,
  getWeekNumber,
} from './common';
import { DATE_FORMAT } from '../constants/constants';
import { GridApi, GridCellParams } from '@mui/x-data-grid-premium';
import dayjs from 'dayjs';
import {
  fetchResourceAllocationsForSaga,
  fetchTeamAllocationsForSaga,
} from '../services/teamServices';

export const formatAllocations = (
  allocationsData: ApiResponse<Allocation[]>,
  projects: Project[]
) => {
  const allocationMap = new Map();
  const allWeeks = generateAllWeeks();

  allocationsData?.result?.forEach((allocation: Allocation) => {
    if (!allocation.Period || allocation.AllocationEntered === 0) return;

    const periodDate = parseISO(allocation.Period);
    const weekNumber = getWeekNumber(periodDate);
    const key = `${allocation.Resource}-${allocation.Project}`;
    const existingAllocation = allocationMap.get(key);
    const formattedDate = format(periodDate, DATE_FORMAT);
    const project = projects.find(p => p.Id === allocation.Project);

    if (existingAllocation) {
      if (allWeeks.includes(weekNumber)) {
        existingAllocation[weekNumber] = {
          allocationId: allocation.Id,
          value: allocation.AllocationEntered || null,
          projectStatus: project?.Status ?? 'Status',
          projectSponsor: project?.ProjectSponsor,
          projectManager: project?.ProjectManager,
          projectLocation: project?.Location,
          projectType: project?.Type,
          projectOvertimeAllowed: project?.AllowOvertime,
          projectCost: project?.Budget,
          projectCurrency: project?.BudgetCurrency,
          projectStartDate: project?.StartDate,
          projectEndDate: project?.EndDate,
          period: formattedDate,
        };
        existingAllocation.totalEffort += allocation.AllocationEntered || null;
      }
    } else {
      const newAllocation: AllocationGridCell = {
        id: key,
        resourceId: allocation.Resource,
        project: allocation.ProjectName,
        projectId: allocation.Project,
        projectSponsor: project?.ProjectSponsor,
        projectManager: project?.ProjectManager,
        projectStatus: project?.Status ?? 'Status',
        projectLocation: project?.Location,
        projectType: project?.Type,
        projectOvertimeAllowed: project?.AllowOvertime,
        projectCost: project?.Budget,
        projectCurrency: project?.BudgetCurrency,
        projectStartDate: project?.StartDate,
        projectEndDate: project?.EndDate,
        resource: allocation.ResourceName,
        totalEffort: allocation.AllocationEntered,
        role: 'Trader',
        teams: 'Developer',
        resourceType: 'FTE',
      };
      allWeeks.forEach(week => {
        newAllocation[week] = {
          allocationId: null,
          value: null,
          period: formattedDate,
          actuals: null,
          notes: null,
        };
      });

      if (allWeeks.includes(weekNumber)) {
        newAllocation[weekNumber] = {
          allocationId: allocation.Id,
          value: allocation.AllocationEntered || null,
          period: formattedDate,
        };
      }

      newAllocation.totalEffort = allWeeks.reduce(
        (sum, week) =>
          sum + ((newAllocation[week] as AllocationGridCellData).value ?? 0),
        0
      );

      allocationMap.set(key, newAllocation);
    }
  });
  // Converting Map back to an array
  return Array.from(allocationMap.values());
};

function getWeeksInRange(start: string, end: string) {
  const weeks: { key: string; period: string }[] = [];
  let current = startOfWeek(parseISO(start), { weekStartsOn: 1 });
  const endDate = parseISO(end);

  while (isBefore(current, endDate) || format(current, 'yyyy-MM-dd') === end) {
    weeks.push({
      key: `W${format(current, 'I')}`,
      period: format(current, 'yyyy-MM-dd'),
    });
    current = addWeeks(current, 1);
  }

  return weeks;
}

export function sortAllAllocations(allocations: AllAllocations[], by = 'team') {
  if (by === 'team') {
    return allocations.sort((a, b) => {
      if (!a.teams) return 1;
      if (!b.teams) return -1;
      return a.teams.localeCompare(b.teams);
    });
  } else if (by === 'project') {
    return allocations.sort((a, b) => {
      if (!a.project) return 1;
      if (!b.project) return -1;
      return a.project.localeCompare(b.project);
    });
  } else if (by === 'resource') {
    return allocations.sort((a, b) => {
      if (!a.resource) return 1;
      if (!b.resource) return -1;
      return a.resource.localeCompare(b.resource);
    });
  }
  return allocations;
}

export function formatAllAllocations(
  allocations: Allocation[],
  teams: Team[],
  projects: Project[],
  resources: Resource[],
  portfolios: Portfolio[],
  teamResources: Record<string, Resource[]>, // UPDATED TYPE
  startDate: string,
  endDate: string
) {
  if (!allocations || allocations.length === 0) {
    return [];
  }
  const weeks = getWeeksInRange(startDate, endDate);

  // Build a lookup map from resource ID to team
  const resourceIdToTeam = new Map<string, Team>();

  for (const [teamId, teamResourceList] of Object.entries(teamResources)) {
    const team = teams.find(t => t.Id === teamId); // find the team based on teamId
    if (!team) continue; // skip if team not found

    for (const res of teamResourceList) {
      resourceIdToTeam.set(res.Id, team);
    }
  }

  const grouped = new Map<string, any>();

  for (const alloc of allocations) {
    const project = projects.find(p => p.Id === alloc.Project);
    const resource = resources.find(r => r.Id === alloc.Resource);
    const team = resourceIdToTeam.get(alloc.Resource);
    const portfolio = portfolios?.find(p => p.Id === project?.PortfolioId);

    const key = `${alloc.Resource}-${team?.Id}-${alloc.Project}`;

    if (!grouped.has(key)) {
      const base: any = {
        id: key,
        resourceId: resource?.Id || null,
        resource: resource?.FullName || alloc.ResourceName || null,
        role: resource?.Role || null,
        resourceType: resource?.Type || null,
        teams: team?.Name || null,
        teamStatus: team?.Status || null,
        teamAllocationManager: team?.AllocationManager || null,
        project: project?.Name || alloc.ProjectName || null,
        projectId: project?.Id || alloc.Project || null,
        projectSponsor:
          getResourceFromUid(project?.ProjectSponsor, resources)?.FullName ||
          null,
        projectManager:
          getResourceFromUid(project?.ProjectManager, resources)?.FullName ||
          null,
        projectStatus: project?.Status || null,
        projectLocation: project?.Location || null,
        projectType: project?.Type || null,
        projectOvertimeAllowed: project?.AllowOvertime ?? null,
        projectCost: project?.Budget ?? null,
        projectCurrency: project?.BudgetCurrency || null,
        projectStartDate: project?.StartDate || null,
        projectEndDate: project?.EndDate || null,
        projectDescription: project?.Description || null,
        portfolioId: portfolio ? portfolio?.Id : null,
        portfolioName: portfolio ? portfolio?.Name : 'default',
        portfolioSidebarColor: portfolio ? portfolio?.SidebarColor : null,
        portfolioDescription: portfolio ? portfolio?.Description || null : null,
        portfolioStatus: portfolio ? portfolio?.Status || null : null,
        email: resource?.Email || null,
        phoneNumber: resource?.PhoneNumber || null,
        resourceStartDate: resource?.StartDate || null,
        resourceEndDate: resource?.EndDate || null,
        resourceLocationCategory: resource?.LocationCategory || null,
        workLocation: resource?.WorkLocation || null,
        department: resource?.Department || null,
        hrLevel: resource?.HRLevel || null,
        manager: resource?.Manager || null,
        contractorHourlyRate: resource?.ContractorHourlyRate || null,
        contractorHourlyRateCurrency:
          resource?.ContractorHourlyRateCurrency || null,
        averageWeeklyHours: resource?.AverageWeeklyHours || null,
        resourceStatus: resource?.Status || null,
        totalEffort: 0,
      };

      for (const w of weeks) {
        base[w.key] = {
          allocationId: null,
          value: null,
          period: w.period,
          actuals: null,
          notes: null,
        };
      }

      grouped.set(key, base);
    }

    const weekKey = getWeekNumber(parseISO(alloc.Period));
    const entry = grouped.get(key);
    entry[weekKey] = {
      allocationId: alloc.Id,
      value: alloc.AllocationEntered,
      period: alloc.Period,
      actuals: alloc.ActualsEntered || null,
      notes: alloc.Notes || null,
    };

    entry.totalEffort += alloc.AllocationEntered;
  }

  return sortAllAllocations(
    Array.from(grouped.values()).filter(allocation =>
      hasAllocations(allocation)
    )
  );
}

export function injectBlankRows(
  allocations: AllAllocations[],
  teams: Team[],
  teamsResources: Record<string, Resource[]>,
  StartDate?: string,
  EndDate?: string
) {
  let weeks = null;
  if (StartDate && EndDate) {
    weeks = getWeeksInRange(StartDate, EndDate);
  }
  const existingKeys = new Set(
    allocations.map(a => `${a.teams}___${a.resourceId}`)
  );

  const extraRows: AllAllocations[] = [];

  teams.forEach(team => {
    const teamRes = teamsResources?.[team.Id] || [];
    teamRes.forEach(resource => {
      const key = `${team.Name}___${resource.Id}`;
      if (!existingKeys.has(key)) {
        extraRows.push({
          id: `team/${team.Name}-resource/${resource.FullName}`,
          resourceId: resource.Id,
          project: '',
          projectId: '',
          projectSponsor: '',
          projectManager: '',
          projectStatus: '',
          projectLocation: '',
          projectType: '',
          projectOvertimeAllowed: null,
          projectCost: null,
          projectCurrency: '',
          projectStartDate: '',
          projectEndDate: '',
          projectDescription: '',
          portfolioId: '',
          portfolioName: '',
          portfolioSidebarColor: '',
          portfolioDescription: '',
          portfolioStatus: '',
          email: resource?.Email || null,
          phoneNumber: resource?.PhoneNumber || null,
          resourceStartDate: resource?.StartDate || null,
          resourceEndDate: resource?.EndDate || null,
          resourceLocationCategory: resource?.LocationCategory || null,
          workLocation: resource?.WorkLocation || null,
          department: resource?.Department || null,
          hrLevel: resource?.HRLevel || null,
          manager: resource?.Manager || null,
          contractorHourlyRate: resource?.ContractorHourlyRate || null,
          contractorHourlyRateCurrency:
            resource?.ContractorHourlyRateCurrency || null,
          averageWeeklyHours: resource?.AverageWeeklyHours || null,
          resourceStatus: resource?.Status || null,
          resource: resource.FullName,
          totalEffort: 0,
          role: resource.Role || '',
          teams: team.Name,
          resourceType: resource.Type,
          teamStatus: team.Status || '',
          teamAllocationManager: team.AllocationManager || '',
          teamId: team.Id,
          hasAllocation: false,
        });
        if (weeks) {
          weeks.forEach(week => {
            extraRows[extraRows.length - 1][week.key] = {
              allocationId: null,
              value: null,
              period: week.period,
            };
          });
        }
      }
    });
  });

  return [...allocations, ...extraRows];
}

export function formatCostAllocations(
  allocations: CostAllocation[],
  teams: Team[],
  projects: Project[],
  resources: Resource[],
  teamResources: Record<string, Resource[]>, // UPDATED TYPE
  startDate: string,
  endDate: string
) {
  if (!allocations || allocations.length === 0) {
    return [];
  }
  const weeks = getWeeksInRange(startDate, endDate);

  // Divide all allocationCosts by 1000
  allocations = allocations?.map(alloc => ({
    ...alloc,
    Cost: alloc.Cost / 1000,
  }));

  // Build a lookup map from resource ID to team
  const resourceIdToTeam = new Map<string, Team>();

  for (const [teamId, teamResourceList] of Object.entries(teamResources)) {
    const team = teams.find(t => t.Id === teamId); // find the team based on teamId
    if (!team) continue; // skip if team not found

    for (const res of teamResourceList) {
      resourceIdToTeam.set(res.Id, team);
    }
  }

  const grouped = new Map<string, any>();

  for (const alloc of allocations) {
    const project = projects.find(p => p.Id === alloc.Project);
    const resource = resources.find(r => r.Id === alloc.Resource);
    const team = resourceIdToTeam.get(alloc.Resource);

    const key = `${alloc.Resource}-${team?.Id}-${alloc.Project}`;

    if (!grouped.has(key)) {
      const base: any = {
        id: key,
        resourceId: resource?.Id || null,
        resource: resource?.FullName || alloc.ResourceName || null,
        role: resource?.Role || null,
        resourceType: resource?.Type || null,
        teams: team?.Name || null,
        teamStatus: team?.Status || null,
        teamAllocationManager: team?.AllocationManager || null,

        project: project?.Name || alloc.ProjectName || null,
        projectId: project?.Id || alloc.Project || null,
        projectSponsor:
          getResourceFromUid(project?.ProjectSponsor, resources)?.FullName ||
          null,
        projectManager:
          getResourceFromUid(project?.ProjectManager, resources)?.FullName ||
          null,
        projectStatus: project?.Status || null,
        projectLocation: project?.Location || null,
        projectType: project?.Type || null,
        projectOvertimeAllowed: project?.AllowOvertime ?? null,
        projectCost: project?.Budget ?? null,
        projectCurrency: project?.BudgetCurrency || null,
        projectStartDate: project?.StartDate || null,
        projectEndDate: project?.EndDate || null,
        projectDescription: project?.Description || null,
        email: resource?.Email || null,
        phoneNumber: resource?.PhoneNumber || null,
        resourceStartDate: resource?.StartDate || null,
        resourceEndDate: resource?.EndDate || null,
        resourceLocationCategory: resource?.LocationCategory || null,
        workLocation: resource?.WorkLocation || null,
        department: resource?.Department || null,
        hrLevel: resource?.HRLevel || null,
        manager: resource?.Manager || null,
        contractorHourlyRate: resource?.ContractorHourlyRate || null,
        contractorHourlyRateCurrency:
          resource?.ContractorHourlyRateCurrency || null,
        averageWeeklyHours: resource?.AverageWeeklyHours || null,
        resourceStatus: resource?.Status || null,
        totalEffort: 0,
      };

      for (const w of weeks) {
        base[w.key] = {
          allocationId: null,
          value: null,
          period: w.period,
          actuals: null,
          notes: null,
        };
      }

      grouped.set(key, base);
    }

    const weekKey = getWeekNumber(parseISO(alloc.Period));
    const entry = grouped.get(key);
    entry[weekKey] = {
      allocationId: alloc.Id,
      value: alloc.Cost,
      period: alloc.Period,
    };
    entry.totalCost += alloc.Cost;
  }

  return Array.from(grouped.values());
}

export const hasAllocations = (allocation: AllAllocations) => {
  // No Projects, only when the empty row, which is needed. So even though it has no allocation, we need to show it.
  if (allocation.project === '') {
    return true;
  }
  for (const key in allocation) {
    if (
      /^W\d+/.test(key) &&
      allocation[key] &&
      (allocation[key] as AllocationGridCellData).value &&
      // @ts-ignore
      (allocation[key] as AllocationGridCellData).value > 0
    ) {
      return true;
    }
  }
  return false;
};

export const generateEmptyRow = (
  startDate: string,
  endDate: string,
  teams: Team[],
  teamResources: Record<string, Resource[]>,
  projects: Project[] | null,
  resources: Resource[],
  allocation: Allocation
): AllocationGridCell => {
  const weeks = getWeeksInRange(startDate, endDate);
  // Build a lookup map from resource ID to team
  const resourceIdToTeam = new Map<string, Team>();

  for (const [teamId, teamResourceList] of Object.entries(teamResources)) {
    const team = teams.find(t => t.Id === teamId); // find the team based on teamId
    if (!team) continue; // skip if team not found

    for (const res of teamResourceList) {
      resourceIdToTeam.set(res.Id, team);
    }
  }

  const team = resourceIdToTeam.get(allocation.Resource);
  const project = projects?.find(p => p.Id === allocation.Project);
  const resource = resources.find(r => r.Id === allocation.Resource);
  let key;
  if (project) {
    key = `${allocation.Resource}-${team?.Id}-${allocation.Project}`;
  } else {
    key = `team/${team?.Name}-resource/${resource?.FullName}`;
  }

  const emptyRow: AllocationGridCell = {
    id: key,
    resourceId: resource?.Id || null,
    resource: resource?.FullName || allocation.ResourceName || null,
    role: resource?.Role || null,
    resourceType: resource?.Type || null,
    teams: team?.Name || null,
    teamStatus: team?.Status || null,
    teamAllocationManager: team?.AllocationManager || null,
    project: project?.Name || allocation.ProjectName || null,
    projectId: project?.Id || allocation.Project || null,
    projectSponsor: project?.ProjectSponsor || null,
    projectManager: project?.ProjectManager || null,
    projectStatus: project?.Status || null,
    projectLocation: project?.Location || null,
    projectType: project?.Type || null,
    projectOvertimeAllowed: project?.AllowOvertime ?? null,
    projectCost: project?.Budget ?? null,
    projectCurrency: project?.BudgetCurrency || null,
    projectStartDate: project?.StartDate || null,
    projectEndDate: project?.EndDate || null,
    projectDescription: project?.Description || null,
    email: resource?.Email || null,
    phoneNumber: resource?.PhoneNumber || null,
    resourceStartDate: resource?.StartDate || null,
    resourceEndDate: resource?.EndDate || null,
    resourceLocationCategory: resource?.LocationCategory || null,
    workLocation: resource?.WorkLocation || null,
    department: resource?.Department || null,
    hrLevel: resource?.HRLevel || null,
    manager: resource?.Manager || null,
    contractorHourlyRate: resource?.ContractorHourlyRate || null,
    contractorHourlyRateCurrency:
      resource?.ContractorHourlyRateCurrency || null,
    averageWeeklyHours: resource?.AverageWeeklyHours || null,
    resourceStatus: resource?.Status || null,
    totalEffort: 0,
  };

  weeks.forEach(week => {
    emptyRow[week.key] = {
      allocationId: null,
      value: null,
      period: week.period,
    };
  });

  return emptyRow;
};

export const getCombinedAllocation = (
  allocationsA: AllAllocations[],
  allocationsB: AllAllocations[]
): AllAllocations[] => {
  const combined: Record<string, AllAllocations> = {};

  allocationsA.forEach(allocation => {
    combined[allocation.id] = { ...allocation };
  });

  allocationsB.forEach(allocation => {
    if (!combined[allocation.id]) {
      combined[allocation.id] = { ...allocation };
    }
  });
  return Object.values(combined);
};

export const getFormattedAllocationsForUpdate = (
  allocationsUpdated: Allocation[],
  teams: ApiResponse<Team[]>,
  teamsResources: Record<string, Resource[]>,
  projects: ApiResponse<Project[]>,
  resources: ApiResponse<Resource[]>,
  splitView: boolean,
  bottomTeamAllocationGrid: GridApi,
  teamAllocationGrid: GridApi,
  startDate: string,
  endDate: string
) => {
  return allocationsUpdated?.reduce((acc: Record<string, any>, allocation) => {
    const team = getTeamForResource(
      allocation?.Resource,
      teams?.result,
      teamsResources
    );
    const weekKey = getWeekNumber(parseISO(allocation?.Period));
    const id = `${allocation?.Resource}-${team?.Id}-${allocation?.Project}`;
    const currentRow = splitView
      ? bottomTeamAllocationGrid.getRow(id)
      : teamAllocationGrid.getRow(id);

    if (acc[id]) {
      if (allocation?.AllocationEntered > 0) {
        acc[id] = {
          ...acc[id],
          [weekKey]: {
            ...acc[id][weekKey],
            value: allocation?.AllocationEntered,
            allocationId: allocation?.Id,
          },
        };
      } else {
        acc[id] = {
          ...acc[id],
          [weekKey]: {
            ...acc[id][weekKey],
            value: null,
            allocationId: null,
          },
        };
      }
    } else if (currentRow) {
      if (allocation?.AllocationEntered > 0) {
        acc = {
          ...acc,
          [id]: {
            ...currentRow,
            [weekKey]: {
              ...currentRow[weekKey],
              value: allocation?.AllocationEntered,
              allocationId: allocation?.Id,
            },
          },
        };
      } else {
        acc = {
          ...acc,
          [id]: {
            ...currentRow,
            [weekKey]: {
              ...currentRow[weekKey],
              value: null,
              allocationId: null,
            },
          },
        };
      }
    } else {
      const emptyRow = generateEmptyRow(
        startDate,
        endDate,
        teams?.result || [],
        teamsResources,
        projects?.result || [],
        resources?.result || [],
        allocation
      );
      acc = {
        ...acc,
        [id]: {
          ...emptyRow,
          [weekKey]: {
            ...(typeof emptyRow[weekKey] === 'object' ? emptyRow[weekKey] : {}),
            value: allocation?.AllocationEntered,
            allocationId: allocation?.Id,
          },
        },
      };
    }
    return acc;
  }, {});
};

export const normalizeRow = (row: AllocationGridCell) => {
  const allWeeks = generateAllWeeks();
  const normalized = { ...row };

  allWeeks.forEach(weekKey => {
    const period = getMondayOfWeek(weekKey, new Date());
    const value = row[weekKey];

    if (value && typeof value === 'object' && 'value' in value) {
      normalized[weekKey] = {
        allocationId: value.allocationId || null,
        value: value.value,
        period: period,
      };
    } else if (value !== undefined) {
      normalized[weekKey] = {
        allocationId: null,
        value: value as number | null,
        period,
      };
    } else {
      normalized[weekKey] = {
        allocationId: null,
        value: null,
        period,
      };
    }
  });

  return normalized;
};

export const generateEmptyAllocation = (
  id: string,
  template: AllocationGridCell,
  project: ProjectsTableRow | null
) => {
  const empty: AllocationGridCell = {
    id: id,
    resourceId: null,
    project: project?.Name || null,
    projectId: project?.Id || null,
    projectSponsor: project?.ProjectSponsor,
    projectManager: project?.ProjectManager,
    projectStatus: project?.Status,
    projectLocation: project?.Location,
    projectType: project?.Type,
    projectOvertimeAllowed: project?.AllowOvertime,
    projectCost: project?.Cost,
    projectCurrency: project?.CostCurrency,
    projectStartDate: project?.StartDate,
    projectEndDate: project?.EndDate,
    resource: null,
    totalEffort: null,
    role: null,
    teams: null,
    resourceType: null,
  };

  // Extract Wxx weeks and set them to empty values with preserved "period"
  Object.entries(template).forEach(([key, value]) => {
    if (/^W\d+$/.test(key)) {
      empty[key] = {
        allocationId: null,
        value: null,
        period: (value as AllocationGridCellData)?.period ?? null,
      };
    }
  });

  return empty;
};

export const filterAllocationsForSelectedProject = (
  allocations: AllAllocations[],
  splitViewCurrentProject: ProjectsTableRow | null
) => {
  if (allocations && allocations.length > 0 && splitViewCurrentProject) {
    const selectedProjectAllocations = allocations.filter(
      allocation => allocation.projectId === splitViewCurrentProject.Id
    );

    const filledAllocations = [
      ...selectedProjectAllocations,
      ...Array.from(
        { length: 10 - selectedProjectAllocations.length },
        (_, index) =>
          generateEmptyAllocation(
            `${splitViewCurrentProject.Id}_${index}`,
            allocations[0],
            splitViewCurrentProject
          )
      ),
    ];

    return filledAllocations;
  }
  return allocations;
};

export const getMaxAllocationDate = (
  allocations: Allocation[],
  resourceId: string
): string | null => {
  if (!allocations || allocations.length === 0) return null;
  const resourceAllocations = allocations.filter(
    alloc => alloc.Resource === resourceId
  );
  if (resourceAllocations.length === 0) return null;
  const period = resourceAllocations.map(d => d.Period);
  if (period.length === 0) return null;
  const maxPeriod = period.reduce((latest, current) =>
    dayjs(current).isAfter(dayjs(latest)) ? current : latest
  );
  return maxPeriod;
};

export const fetchResourceAllocations = async (
  teamId: string,
  endDate: string,
  email: string,
  resources: Resource[]
) => {
  const postData = {
    'ResourceAllocation.Core/GetTeamAllocationsForPeriod': {
      TeamId: teamId,
      StartDate: endDate,
      EndDate: '2099-08-31',
    },
  };

  const result = await fetchTeamAllocationsForSaga(postData);
  const allocations = (result?.result ?? []) as Allocation[];
  const matchedResource = resources.find(resource => resource.Email === email);
  const resourceId = matchedResource?.Id;
  if (!resourceId) {
    console.error('Resource ID not found for email:', email);
    return { resourceAllocations: [], resourceId: null };
  }
  const resourceAllocations = allocations.filter(
    alloc => alloc.Resource === resourceId
  );

  return { resourceAllocations, resourceId };
};

export const getResourceAllocationsForPeriod = async (
  resourceId: string,
  startDate: string
): Promise<ResourceAllocation[]> => {
  if (!resourceId || !startDate) {
    return [];
  }

  const postData = {
    'ResourceAllocation.Core/GetResourceAllocationsForPeriod': {
      Resource: resourceId,
      StartDate: startDate,
      EndDate: '2099-08-31',
    },
  };

  try {
    const result = await fetchResourceAllocationsForSaga(postData);
    return result?.result ?? [];
  } catch (error) {
    console.error('Error fetching resource allocations:', error);
    return [];
  }
};

export const getResourceIdByEmail = (
  allResources: { Id: string; Email: string }[],
  email: string
): string | null => {
  if (!Array.isArray(allResources) || !email) return null;

  const matched = allResources.find(resource => resource.Email === email);
  return matched?.Id ?? null;
};

export const getFirstChild = (params: GridCellParams) => {
  const { rowNode, api } = params;
  const isGridTreeNode = 'children' in rowNode; // Required for Typescript
  if (isGridTreeNode && rowNode.children && rowNode.children.length > 0) {
    const firstChildId = rowNode.children[0];
    const firstChildRow = api.getRow(firstChildId);
    return firstChildRow;
  }
  return null;
};
