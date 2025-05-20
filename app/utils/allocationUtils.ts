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
  Project,
  Resource,
  Team,
} from '../types';
import { generateAllWeeks, getResourceFromUid, getWeekNumber } from './common';
import { DATE_FORMAT } from '../constants/constants';

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

        totalEffort: 0,
      };

      for (const w of weeks) {
        base[w.key] = {
          allocationId: null,
          value: null,
          period: w.period,
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
    };

    entry.totalEffort += alloc.AllocationEntered;
  }

  return sortAllAllocations(Array.from(grouped.values()));
}

export function injectBlankRows(
  allocations: AllAllocations[],
  teams: Team[],
  teamsResources: Record<string, Resource[]>
) {
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

        totalEffort: 0,
      };

      for (const w of weeks) {
        base[w.key] = {
          allocationId: null,
          value: null,
          period: w.period,
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
