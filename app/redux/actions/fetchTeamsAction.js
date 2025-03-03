import {
  getAllAllocationsForPeriod,
  getAllTeams,
  getResourcesAgainstTeams,
  getTeamAllocations,
  postTeamResource,
} from '@/app/services/teamServices';
import {
  setTeamsDataProcessing,
  setTeamsResources,
  updateResources,
} from '../reducers/teamsReducer';
import {
  getWeekNumber,
  isWithin20WeeksRange,
  removeDuplicateResources,
} from '@/app/utils/common';

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
  const allocationsData = data.result;
  const allocationMap = new Map();

  if (
    allocationsData.length === 0 ||
    Object.keys(allocationsData?.[0]).length === 0
  ) {
    let obj = [];
    if (resources.length === 0) {
      obj = [
        {
          id: teamId,
          resourceId: '',
          project: '',
          projectId: '',
          resource: '',
          totalEffort: '',
          role: '',
          teams: teamName,
          teamsId: teamId,
          resourceType: '',
          W1: null,
        },
      ];
    } else {
      if (Array.isArray(resources) && resources.length !== 0) {
        const uniqueRecords = removeDuplicateResources(resources);

        if (uniqueRecords.length > 0) {
          obj = uniqueRecords.map(resource => ({
            id: resource.Id + teamId,
            resourceId: resource.Id,
            project: '',
            projectId: '',
            resource: resource.FullName,
            totalEffort: '',
            role: resource.Role,
            teams: teamName,
            teamsId: teamId,
            resourceType: resource.Type,
            hasProject: true, 
            W1: null,
          }));
        }
      }
    }
    return obj;
  }

  allocationsData.forEach(allocation => {
    if (!allocation.Period || allocation.AllocationEntered === 0) return;

    const periodDate = new Date(allocation.Period);
    const weekNumber = getWeekNumber(periodDate);

    const matchingTeamResource = resources.find(
      team =>
        team.FullName === allocation.ResourceName ||
        team.Id === allocation.Resource
    );

    const role = matchingTeamResource ? matchingTeamResource.Role : 'N/A';
    const resourceType = matchingTeamResource
      ? matchingTeamResource.Type
      : 'N/A';

    // Using Resource + Team ID + Project ID as the unique identifier
    const uniqueId = `${allocation.Resource}-${teamId}-${allocation.Project}`;
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
        resourceId: allocation.Resource || '',
        project: allocation.ProjectName || '',
        projectId: allocation.Project || '',
        resource: allocation.ResourceName || '',
        totalEffort: allocation.AllocationEntered || '',
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

export const fetchResourcesAgainstTeams = teams => async dispatch => {
  try {
    dispatch(setTeamsDataProcessing(true));
    let allResources = [];

    const teamPromises = teams.map(async team => {
      const teamResourcesPostData = {
        'ResourceAllocation.Core/GetTeamResources': {
          TeamId: team.Id,
        },
      };

      const teamAllocationPostData = {
        'ResourceAllocation.Core/GetTeamAllocations': {
          TeamId: team.Id,
        },
      };

      const resourcesPromise = dispatch(
        getResourcesAgainstTeams(teamResourcesPostData)
      )
        .then(result => ({ status: 'fulfilled', result, team }))
        .catch(error => ({ status: 'rejected', error, team }));

      const allocationsPromise = dispatch(
        getTeamAllocations(teamAllocationPostData)
      )
        .then(result => ({ status: 'fulfilled', result, team }))
        .catch(error => ({ status: 'rejected', error, team }));

      const [resourcesResult, allocationsResult] = await Promise.all([
        resourcesPromise,
        allocationsPromise,
      ]);

      // Update the resources for the team
      let teamsResources = resourcesResult?.result?.payload?.[0]?.result || [];
      dispatch(setTeamsResources({ id: resourcesResult?.team?.Id, resource: teamsResources }));

      return {
        resourcesResult,
        allocationsResult,
        team,
      };
    });

    const results = await Promise.allSettled(teamPromises);

    results.forEach(({ status, value }) => {
      if (status === 'fulfilled') {
        const { resourcesResult, allocationsResult, team } = value;
        if (
          resourcesResult.status === 'fulfilled' &&
          allocationsResult.status === 'fulfilled'
        ) {
          const updatedResource = formatResources(
            resourcesResult.result.payload[0],
            team.Name
          );

          const formattedAllocations = formatAllocations(
            allocationsResult.result.payload[0],
            updatedResource,
            team.Id,
            team.Name
          );

          const final = formattedAllocations.filter(
            data => data.teams === team.Name
          );
          allResources = [...allResources, ...final];
        }
      } else {
        console.error('Failed to fetch data for team:', value.team.Name);
      }
    });

  Array.isArray(allResources) && allResources.sort((a, b) => {
  const resourceA = a.resource?.toLowerCase() || '';
  const resourceB = b.resource?.toLowerCase() || '';
  return resourceA.localeCompare(resourceB);
});
    if (allResources.length > 0) {
      dispatch(updateResources(allResources));
    }
  } catch (error) {
    console.error('Error fetching resources and allocations for teams:', error);
  } finally {
    dispatch(setTeamsDataProcessing(false));
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

export const addResourceToTeam = (teamId, resourceId) => async dispatch => {
  try {
    const postData = {
      'ResourceAllocation.Core/TeamResource': {
        Team: teamId,
        Resource: resourceId,
      },
    };
    await dispatch(postTeamResource(postData));
  } catch (error) {
    console.error('Error adding resource to team:', error);
  }
};
