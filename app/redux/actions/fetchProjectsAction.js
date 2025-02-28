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
  isWithin20WeeksRange,
  getMondayOfWeek,
  generateAllWeeks,
} from '@/app/utils/common';

export const fetchAllProjects = () => async dispatch => {
  try {
    await dispatch(getAllProjects());
  } catch (error) {
    console.error('Error fetching projects data:', error);
  }
};

const formatAllocations = (allocationsData, projectId) => {
  const allocationMap = new Map();
  const allWeeks = generateAllWeeks();

  allocationsData.result.forEach(allocation => {
    if (!allocation.Period || allocation.AllocationEntered === 0) return;

    const periodDate = new Date(allocation.Period);
    const weekNumber = getWeekNumber(periodDate);
    const key = `${allocation.Resource}-${projectId}`;
    const existingAllocation = allocationMap.get(key);

    if (existingAllocation) {
      if (allWeeks.includes(weekNumber)) {
        existingAllocation[weekNumber] = {
          allocationId: allocation.Allocation,
          value: allocation.AllocationEntered || null,
        };
        existingAllocation.totalEffort += allocation.AllocationEntered || null;
      }
    } else {
      const newAllocation = {
        id: key,
        resourceId: allocation.Resource,
        project: allocation.ProjectName,
        projectId: projectId,
        resource: allocation.ResourceName,
        totalEffort: allocation.AllocationEntered,
        role: 'Trader',
        teams: 'Developer',
        resourceType: 'FTE',
      };
      allWeeks.forEach(week => {
        newAllocation[week] = null;
      });

      if (allWeeks.includes(weekNumber)) {
        newAllocation[weekNumber] = {
          allocationId: allocation.Allocation,
          value: allocation.AllocationEntered || null,
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

export const fetchAllProjectAllocations = projects => async dispatch => {
  try {
    dispatch(setDataProcessing(true));
    const allocationPromises = projects.map(async project => {
      const postData = {
        'ResourceAllocation.Core/GetProjectAllocationsForPeriod': {
          Project: project.Id,
          StartDate: '2025-02-20',
          EndDate: '2032-01-01',
        },
      };
      try {
        const result = await dispatch(getProjectAllocations(postData));
        if (result.meta.requestStatus === 'fulfilled') {
          const allocationsData = result.payload;
          const formattedAllocations = formatAllocations(
            allocationsData,
            project.Id
          );
          return formattedAllocations;
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

    const results = await Promise.allSettled(allocationPromises);

    let allAllocations = [];
    results.forEach(result => {
      if (result.status === 'fulfilled' && result.value) {
        allAllocations = [...allAllocations, ...result.value];
      } else if (result.status === 'rejected') {
        console.error('A project allocation request failed:', result.reason);
      }
    });

    if (allAllocations.length > 0) {
      dispatch(updateAllocations(allAllocations));
    }
  } catch (error) {
    console.error('Error in fetchAllProjectAllocations:', error);
  } finally {
    dispatch(setDataProcessing(false));
  }
};
