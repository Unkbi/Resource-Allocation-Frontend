import {
  getAllAllocationsForPeriod,
  getAllTeams,
  getResourcesAgainstTeams,
  getTeamAllocations,
  /*
   * Not being used currently in application
   * Uncomment the following code if you want to handle postTeamResource API call
   */
  // postTeamResource,
} from '@/app/services/teamServices';
import {
  setAllTeamsResources,
  setTeamsDataProcessing,
  updateResources,
} from '../reducers/teamsReducer';
import {
  getMonday,
  getMondaysInRange,
  getWeekNumber,
  removeDuplicateResources,
} from '@/app/utils/common';
import { setAllocations } from '../reducers/dataGridReducer';
import { format } from 'date-fns';
import parseISO from 'date-fns/parseISO';
import { DATE_FORMAT } from '@/app/constants/constants';
import { AppDispatch } from '../store';

export const fetchAllTeams = () => async (dispatch: AppDispatch) => {
  try {
    await dispatch(getAllTeams());
  } catch (error) {
    console.error('Error fetching teams data:', error);
  }
};

const formatAllocations = (
  data,
  resources,
  teamId,
  teamName,
  teamStatus,
  teamAllocationManager,
  startDate,
  endDate
) => {
  const allocationsData = data.result;
  const allocationMap = new Map();

  if (Array.isArray(allocationsData) && allocationsData.length === 0) {
    let obj = [];
    if (resources?.result.length === 0) {
      obj = [
        {
          id: teamId,
          resourceId: '',
          project: '',
          projectId: '',
          resource: '',
          totalEffort: '',
          role: '',
          teamStatus: teamStatus ?? '',
          teamAllocationManager: teamAllocationManager ?? '',
          teams: teamName,
          teamsId: teamId,
          resourceType: '',
          W1: null,
        },
      ];
    } else {
      if (Array.isArray(resources.result) && resources?.result.length !== 0) {
        const uniqueRecords = removeDuplicateResources(resources?.result);

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
            teamStatus: teamStatus ?? '',
            teamAllocationManager: teamAllocationManager ?? '',
            resourceType: resource.Type,
            hasProject: true,
            W1: null,
          }));
        }
      }
    }
    return obj;
  }
  Array.isArray(allocationsData) &&
    allocationsData.forEach(allocation => {
      if (!allocation.Period || allocation.AllocationEntered === 0) return;

      const periodDate = parseISO(allocation.Period);
      const weekNumber = getWeekNumber(periodDate);
      const formattedDate = format(periodDate, DATE_FORMAT);

      const matchingTeamResource =
        Array.isArray(resources?.result) &&
        resources?.result.find(
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
        existingAllocation[weekNumber] = {
          allocationId: allocation.Id,
          value: allocation.AllocationEntered,
          period: formattedDate,
        };
        existingAllocation.totalEffort += allocation.AllocationEntered;
        existingAllocation.teamStatus = teamStatus ?? '';
        existingAllocation.teamAllocationManager = teamAllocationManager ?? '';
      } else {
        const newAllocation = {
          id: uniqueId,
          resourceId: allocation.Resource || '',
          project: allocation.ProjectName || '',
          projectId: allocation.Project || '',
          resource: allocation.ResourceName || '',
          totalEffort: allocation.AllocationEntered || '',
          teamStatus: teamStatus ?? '',
          teamAllocationManager: teamAllocationManager ?? '',
          role,
          teams: teamName,
          resourceType,
        };

        newAllocation[weekNumber] = {
          allocationId: allocation.Id,
          value: allocation.AllocationEntered,
          period: formattedDate,
        };

        allocationMap.set(uniqueId, newAllocation);
      }
    });
  // add empty allocations with period within date range
  const allWeeks = getMondaysInRange(startDate, endDate);
  const updatedAllocationMap = Array.from(allocationMap.values());
  updatedAllocationMap.forEach(allocation => {
    const filteredWeeksArr = Object.values(allocation).filter(
      item => typeof item === 'object'
    );

    const allFilteredDates = filteredWeeksArr
      .map(obj => obj?.period && format(getMonday(obj.period), DATE_FORMAT))
      .filter(Boolean);
    allWeeks
      .filter(week => !allFilteredDates.includes(week))
      .forEach(week => {
        allocation[getWeekNumber(week)] ??= {
          allocationId: null,
          value: null,
          period: week,
        };
      });
  });
  return updatedAllocationMap;
};

export const fetchResourcesAgainstTeams =
  (teams, allocations = null, StartDate, EndDate) =>
  async dispatch => {
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
          'ResourceAllocation.Core/GetTeamAllocationsForPeriod': {
            TeamId: team.Id,
            StartDate,
            EndDate,
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

        return {
          resourcesResult,
          allocationsResult,
          team,
        };
      });

      const results = await Promise.allSettled(teamPromises);

      const allResourceResults = [];
      results.forEach(result => {
        const resrouceResults = result?.value?.resourcesResult;
        if (resrouceResults) {
          const resource = resrouceResults?.result?.payload?.result;
          allResourceResults.push({
            id: resrouceResults?.team?.Id,
            teamStatus: resrouceResults?.status,
            teamAllocationManager: resrouceResults?.team?.AllocationManager,
            resource: resource,
          });
        }
      });
      dispatch(setAllTeamsResources(allResourceResults));

      const preload_result = [];
      if (allocations && results?.length === 1) {
        Object.keys(allocations)?.forEach(key => {
          if (key === teams[0].Id) {
            preload_result.push(results[0]);
          } else {
            preload_result.push({
              status: 'fulfilled',
              value: allocations[key],
            });
          }
        });
      }

      const iterator =
        allocations && preload_result?.length ? preload_result : results;
      Array.isArray(iterator) &&
        iterator.forEach(({ status, value }) => {
          if (status === 'fulfilled') {
            const { resourcesResult, allocationsResult, team } = value;
            dispatch(
              setAllocations({
                team_id: team.Id,
                value: { resourcesResult, allocationsResult, team },
              })
            );
            if (
              resourcesResult.status === 'fulfilled' &&
              allocationsResult.status === 'fulfilled'
            ) {
              const formattedAllocations = formatAllocations(
                allocationsResult.result.payload,
                resourcesResult.result.payload,
                team.Id,
                team.Name,
                team.Status,
                team.AllocationManager,
                StartDate,
                EndDate
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

      Array.isArray(allResources) &&
        allResources.sort((a, b) => {
          const resourceA = a.resource?.toLowerCase() || '';
          const resourceB = b.resource?.toLowerCase() || '';
          return resourceA.localeCompare(resourceB);
        });
      if (allResources.length > 0) {
        dispatch(updateResources(allResources));
      }
    } catch (error) {
      console.error(
        'Error fetching resources and allocations for teams:',
        error
      );
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

/*
 * Not being used currently in application
 * Uncomment the following code if you want to handle postTeamResource API call
 */
// export const addResourceToTeam = (teamId, resourceId) => async dispatch => {
//   try {
//     const postData = {
//       'ResourceAllocation.Core/TeamResource': {
//         Team: teamId,
//         Resource: resourceId,
//       },
//     };
//     await dispatch(postTeamResource(postData));
//   } catch (error) {
//     console.error('Error adding resource to team:', error);
//   }
// };
