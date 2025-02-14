import {
  getAllProjects,
  getProjectAllocations,
} from '@/app/services/projectServices';
import { updateAllocations } from '../reducers/projectsReducer';
import { getWeekNumber, isWithin20WeeksRange, getMondayOfWeek } from '@/app/utils/common';

export const fetchAllProjects = () => async dispatch => {
  try {
    await dispatch(getAllProjects());
  } catch (error) {
    console.error('Error fetching projects data:', error);
  }
};

const generateAllWeeks = () => {
  const weeks = [];
  const today = new Date();
  const currentDay = today.getDay();

  // Find current week Monday
  const startDate = new Date(today);
  startDate.setDate(today.getDate() - ((currentDay + 6) % 7));
  startDate.setHours(0, 0, 0, 0);

  // Generate 22 weeks total: previous week + current week + next 20 weeks
  for (let i = -1; i <= 20; i++) {
    const weekDate = new Date(startDate);
    weekDate.setDate(startDate.getDate() + (i * 7));
    weeks.push(getWeekNumber(weekDate));
  }

  return weeks;
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
        existingAllocation[weekNumber] =
        {
          allocationId: allocation.Allocation,
          value: allocation.AllocationEntered || null
        }
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
          value: allocation.AllocationEntered || null
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
    let allAllocations = [];
    for (const project of projects) {
      const postData = {
        'ProjectPortfolio.Core/GetProjectAllocationsForPeriod': {
          Project: project.Id,
          StartDate: '2025-01-01',
          EndDate: '2025-12-31',
        },
      };

      const result = await dispatch(getProjectAllocations(postData));

      if (result.meta.requestStatus === 'fulfilled') {
        const allocationsData = result.payload[0];
        const formattedAllocations = formatAllocations(
          allocationsData,
          project.Id
        );

        allAllocations = [...allAllocations, ...formattedAllocations];
      }
    }
    if (allAllocations.length > 0) {
      dispatch(updateAllocations(allAllocations));
    }
  } catch (error) {
    console.error('Error fetching project allocations:', error);
  }
};
