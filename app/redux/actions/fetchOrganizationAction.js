import {
  getAllOrganizations,
  getOrganizationAllocations,
} from '@/app/services/organizationServices';
import {
  setDataProcessing,
  updateAllocations,
} from '../reducers/organizationReducer';
import {
  getWeekNumber,
  isWithin20WeeksRange,
  getMondayOfWeek,
  generateAllWeeks,
} from '@/app/utils/common';

export const fetchAllOrganizations = () => async dispatch => {
  try {
    await dispatch(getAllOrganizations());
  } catch (error) {
    console.error('Error fetching organizations data:', error);
  }
};

const formatAllocations = (allocationsData, organizationId, organizationName) => {
  const allocationMap = new Map();
  const allWeeks = generateAllWeeks();

  allocationsData.result?.forEach(allocation => {
    if (!allocation.Period || allocation.AllocationEntered === 0) return;

    const periodDate = new Date(allocation.Period);
    const weekNumber = getWeekNumber(periodDate);
    const key = `${allocation.Resource}-${organizationId}`;
    const existingAllocation = allocationMap.get(key);

    if (existingAllocation) {
      if (allWeeks.includes(weekNumber)) {
        existingAllocation[weekNumber] = {
          allocationId: allocation.Id,
          value: allocation.AllocationEntered || null,
        };
        existingAllocation.totalEffort += allocation.AllocationEntered || null;
      }
    } else {
      const newAllocation = {
        id: key,
        resourceId: allocation.Resource,
        organization: organizationName,
        organizationId: organizationId,
        project: allocation.ProjectName,
        projectId: allocation.Project,
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
          allocationId: allocation.Id,
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

export const fetchAllOrganizationAllocations = organization => async dispatch => {
  try {
    dispatch(setDataProcessing(true));
    const allocationPromises = organization.map(async organization => {
      const postData = {
        'ResourceAllocation.Core/GetOrganizationAllocations': {
            OrganizationId: organization.Id
          }
      };
      try {
        const result = await dispatch(getOrganizationAllocations(postData));
        if (result.meta.requestStatus === 'fulfilled') {
          const allocationsData = result.payload;
          const formattedAllocations = formatAllocations(
            allocationsData,
            organization.Id,
            organization.Name
          );
          return formattedAllocations;
        } else {
          throw new Error(
            `Request for organization ${organization.Id} was not fulfilled`
          );
        }
      } catch (error) {
        console.error(
          `Error fetching allocations for organization ${organization.Id}:`,
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
