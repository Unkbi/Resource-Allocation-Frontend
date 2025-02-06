import {
  getAllProjects,
  getProjectAllocations,
} from '@/app/services/projectServices';
import { updateAllocations } from '../reducers/projectsReducer';
import { getWeekNumber } from '@/app/utils/common';

export const fetchAllProjects = () => async dispatch => {
  try {
    await dispatch(getAllProjects());
  } catch (error) {
    console.error('Error fetching projects data:', error);
  }
};

const formatAllocations = allocationsData => {
  const allocationMap = new Map();

  allocationsData.result.forEach(allocation => {
    if (!allocation.Period || allocation.AllocationEntered === 0) return;

    const periodDate = new Date(allocation.Period);
    const weekNumber = getWeekNumber(periodDate);

    // Using Resource as the unique identifier
    const existingAllocation = allocationMap.get(allocation.Resource);

    if (existingAllocation) {
      existingAllocation[weekNumber] =
        (existingAllocation[weekNumber] || 0) + allocation.AllocationEntered;
      existingAllocation.totalEffort += allocation.AllocationEntered;
    } else {
      const newAllocation = {
        id: allocation.Resource,
        project: allocation.ProjectName,
        resource: allocation.ResourceName,
        totalEffort: allocation.AllocationEntered,
        role: 'Trader', //Mock data, needs to be replaced later with API data.
        teams: 'Developer', //Mock data, needs to be replaced later with API data.
        resourceType: 'FTE', //Mock data, needs to be replaced later with API data.
        W1: '',
        W2: '',
        W3: '',
        W4: '',
        W5: '',
        W6: '',
        W7: '',
        W8: '',
        W9: '',
        W10: '',
        W11: '',
        W12: '',
        W13: '',
        W14: '',
        W15: '',
      };

      newAllocation[weekNumber] = allocation.AllocationEntered;

      allocationMap.set(allocation.Resource, newAllocation);
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
          EndDate: '2025-02-19',
        },
      };

      const result = await dispatch(getProjectAllocations(postData));

      if (result.meta.requestStatus === 'fulfilled') {
        const allocationsData = result.payload[0];
        const formattedAllocations = formatAllocations(allocationsData);

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
