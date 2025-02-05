import {
  getAllProjects,
  getProjectAllocations,
} from '@/app/services/projectServices';
import { updateAllocations } from '../reducers/projectsReducer';

export const fetchAllProjects = () => async dispatch => {
  try {
    await dispatch(getAllProjects());
  } catch (error) {
    console.error('Error fetching projects data:', error);
  }
};

const getWeekNumber = date => {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date - firstDayOfYear + 86400000) / 86400000;
  return `W${Math.ceil((pastDaysOfYear + firstDayOfYear.getDay()) / 7)}`;
};

const formatAllocations = allocationsData => {
  const formattedAllocations = allocationsData.result.reduce(
    (acc, allocation) => {
      if (!allocation.Period || allocation.AllocationEntered === 0) return acc;

      const periodDate = new Date(allocation.Period);
      const weekNumber = `${getWeekNumber(periodDate)}`;

      const existingAllocation = acc.find(
        item => item.id === allocation.Allocation
      );

      if (existingAllocation) {
        existingAllocation[weekNumber] =
          (existingAllocation[weekNumber] || 0) + allocation.AllocationEntered;
      } else {
        const newAllocation = {
          id: allocation.Allocation, //Unique ID
          project: allocation.ProjectName,
          resource: allocation.ResourceName,
          totalEffort: allocation.AllocationEntered,
          role: 'Trader',
          teams: 'Developer',
          resourceType: 'FTE',
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

        // Add effort to the corresponding week number
        newAllocation[weekNumber] = allocation.AllocationEntered;

        acc.push(newAllocation);
      }

      return acc;
    },
    []
  );

  return formattedAllocations;
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
