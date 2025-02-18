import {
  getAllAllocationsForPeriod,
  getAllTeams,
  getResourcesAgainstTeams,
} from '@/app/services/teamServices';
import { updateResources } from '../reducers/teamsReducer';
import { getWeekNumber, isWithin20WeeksRange } from '@/app/utils/common';

export const fetchAllTeams = () => async dispatch => {
  try {
    await dispatch(getAllTeams());
  } catch (error) {
    console.error('Error fetching teams data:', error);
  }
};

const formatResources = (resourcesData, teamName) => {
  const updatedArray = resourcesData.result.map(obj => ({
    ...obj,
    teams: teamName,
  }));

  return updatedArray;
};

const formatAllocations = (data, resources, teamId, teamName) => {
  const allocationsData = data[0].result.filter(resource =>
    resources.some(
      team =>
        resource.ResourceName === team.FullName && resource.Resource === team.Id
    )
  );

  const allocationMap = new Map();

  allocationsData.forEach(allocation => {
    if (!allocation.Period || allocation.AllocationEntered === 0) return;

    const periodDate = new Date(allocation.Period);
    const weekNumber = getWeekNumber(periodDate);

    const matchingTeamResource = resources.find(
      team =>
        team.FullName === allocation.ResourceName ||
        team.Id === allocation.Resource
    );

    const role = matchingTeamResource
      ? matchingTeamResource.Role
      : 'Unknown Role';
    const resourceType = matchingTeamResource
      ? matchingTeamResource.Type
      : 'Unknown Type';

    // Using Resource + Team ID as the unique identifier
    const uniqueId = `${allocation.Resource}-${teamId}`;
    const existingAllocation = allocationMap.get(uniqueId);

    if (existingAllocation) {
      if (isWithin20WeeksRange(allocation.Period)) {
        existingAllocation[weekNumber] = {
          allocationId: allocation.Allocation,
          value: allocation.AllocationEntered,
        };
        existingAllocation.totalEffort += allocation.AllocationEntered;
      }
    } else {
      const newAllocation = {
        id: uniqueId,
        resourceId: allocation.Resource,
        project: allocation.ProjectName,
        projectId: allocation.Project,
        resource: allocation.ResourceName,
        totalEffort: allocation.AllocationEntered,
        role,
        teams: teamName,
        resourceType,
      };

      if (isWithin20WeeksRange(allocation.Period)) {
        newAllocation[weekNumber] = {
          allocationId: allocation.Allocation,
          value: allocation.AllocationEntered,
        };
      }

      allocationMap.set(uniqueId, newAllocation);
    }
  });
  // Converting Map back to an array
  return Array.from(allocationMap.values());
};

export const fetchResourcesAgainstTeams =
  teams => async (dispatch, getState) => {
    try {
      let allResources = [];
      const state = getState();
      const allAllocations = state.teams.allAllocations;

      const teamPromises = teams.map(team =>
        dispatch(getResourcesAgainstTeams(team.Id))
          .then(result => ({ status: 'fulfilled', result, team }))
          .catch(error => ({ status: 'rejected', error, team }))
      );

      const results = await Promise.allSettled(teamPromises);

      results.forEach(({ status, value, reason }) => {
        if (status === 'fulfilled') {
          const { result, team } = value;
          if (result.meta.requestStatus === 'fulfilled') {
            const resourcesData = result.payload[0];
            const updatedResource = formatResources(resourcesData, team.Name);

            const formattedAllocations = formatAllocations(
              allAllocations,
              updatedResource,
              team.Id,
              team.Name
            );

            allResources = [...allResources, formattedAllocations];
          }
        } else if (status === 'rejected') {
          console.error(
            'Failed to fetch resources for team:',
            reason.team.Name,
            reason.error
          );
        }
      });

      if (allResources.length > 0) {
        dispatch(updateResources(allResources));
      }
    } catch (error) {
      console.error('Error fetching resources against teams:', error);
    }
  };

export const fetchAllAllocations = () => async dispatch => {
  try {
    const postData = {
      'ResourceAllocation.Core/GetAllAllocationsForPeriod': {
        StartDate: '2025-01-01',
        EndDate: '2025-12-31',
      },
    };
    await dispatch(getAllAllocationsForPeriod(postData));
  } catch (error) {
    console.error('Error fetching all allocations:', error);
  }
};
