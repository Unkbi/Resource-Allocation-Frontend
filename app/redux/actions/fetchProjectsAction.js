import {
  getAllProjects,
  getProjectAllocations,
} from '@/app/services/projectServices';
import {
  setDataProcessing,
  updateAllocations,
} from '../reducers/projectsReducer';
import {
  getWeekNumber,
  generateAllWeeks,
} from '@/app/utils/common';
import { format } from 'date-fns';
import { DATE_FORMAT } from '@/app/constants/constants';

export const fetchAllProjects = () => async dispatch => {
  try {
    await dispatch(getAllProjects());
  } catch (error) {
    console.error('Error fetching projects data:', error);
  }
};

const formatAllocations = (allocationsData, project) => {
  const allocationMap = new Map();
  const allWeeks = generateAllWeeks();

  allocationsData?.result?.forEach(allocation => {
    if (!allocation.Period || allocation.AllocationEntered === 0) return;

    const periodDate = new Date(allocation.Period);
    const weekNumber = getWeekNumber(periodDate);
    const key = `${allocation.Resource}-${project.Id}`;
    const existingAllocation = allocationMap.get(key);
    const formattedDate = format(periodDate, DATE_FORMAT);    

    if (existingAllocation) {
      if (allWeeks.includes(weekNumber)) {
        existingAllocation[weekNumber] = {
          allocationId: allocation.Id,
          value: allocation.AllocationEntered || null,
          projectStatus: project.Status ?? 'Status',
          projectSponsor: project.Owner,
          projectManager: project.Manager,
          projectLocation: project.Location,
          projectType: project.Type,
          projectOvertimeAllowed: project.AllowOvertime,
          projectCost: project.Cost,
          projectCurrency: project.CostCurrency,
          projectStartDate: project.StartDate,
          projectEndDate: project.EndDate,
          period: formattedDate
        };
        existingAllocation.totalEffort += allocation.AllocationEntered || null;
      }
    } else {
      const newAllocation = {
        id: key,
        resourceId: allocation.Resource,
        project: allocation.ProjectName,
        projectId: project.Id,
        projectSponsor: project.Owner,
        projectManager: project.Manager,
        projectStatus: project.Status ?? 'Status',
        projectLocation: project.Location,
        projectType: project.Type,
        projectOvertimeAllowed: project.AllowOvertime,
        projectCost: project.Cost,
        projectCurrency: project.CostCurrency,
        projectStartDate: project.StartDate,
        projectEndDate: project.EndDate,
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
          period: formattedDate
        };
      });

      if (allWeeks.includes(weekNumber)) {
        newAllocation[weekNumber] = {
          allocationId: allocation.Id,
          value: allocation.AllocationEntered || null,
          period: formattedDate
        };
      }
      newAllocation.totalEffort = allWeeks.reduce(
        (sum, week) => sum + newAllocation[week],
        0
      );

      allocationMap.set(key, newAllocation);
    }
  });
  // Converting Map back to an array
  return Array.from(allocationMap.values());
};

export const fetchAllProjectAllocations = (projects, StartDate, EndDate) => async dispatch => {
  try {
    dispatch(setDataProcessing(true));
    const allocationPromises = projects.map(async project => {
      const postData = {
        'ResourceAllocation.Core/GetProjectAllocationsForPeriod': {
          Project: project.Id,
          StartDate: StartDate,
          EndDate: EndDate,
        },
      };
      try {
        const result = await dispatch(getProjectAllocations(postData));
        if (result.meta.requestStatus === 'fulfilled') {
          return {
            result, project
          };
        } else {
          throw new Error(
            `Request for project ${project.Id} was not fulfilled`
          );
        }
      } catch (error) {
        console.error(
          `Error fetching allocations for project ${project.Id}:`,
          error
        );
        return null;
      }
    });

    const apiResponse = await Promise.allSettled(allocationPromises);

    const allAllocations = apiResponse
      .filter(result => result.status === 'fulfilled' && result?.value?.result?.payload)
      .flatMap(result => 
        formatAllocations(result.value.result.payload, result.value.project)
      );

    if (allAllocations.length > 0) {
      dispatch(updateAllocations(allAllocations));
    }
  } catch (error) {
    console.error('Error in fetchAllProjectAllocations:', error);
  } finally {
    dispatch(setDataProcessing(false));
  }
};
