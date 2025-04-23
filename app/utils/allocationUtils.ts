//@ts-ignore
import { format, parseISO } from 'date-fns';
import {
  Allocation,
  AllocationGridCell,
  AllocationGridCellData,
  ApiResponse,
  Project,
} from '../types';
import { generateAllWeeks, getWeekNumber } from './common';
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
          projectSponsor: project?.Owner,
          projectManager: project?.ProjectManager,
          projectLocation: project?.Location,
          projectType: project?.Type,
          projectOvertimeAllowed: project?.AllowOvertime,
          projectCost: project?.Cost,
          projectCurrency: project?.CostCurrency,
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
        projectSponsor: project?.Owner,
        projectManager: project?.ProjectManager,
        projectStatus: project?.Status ?? 'Status',
        projectLocation: project?.Location,
        projectType: project?.Type,
        projectOvertimeAllowed: project?.AllowOvertime,
        projectCost: project?.Cost,
        projectCurrency: project?.CostCurrency,
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
