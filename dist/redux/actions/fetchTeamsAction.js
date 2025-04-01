"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addResourceToTeam = exports.fetchAllAllocations = exports.fetchResourcesAgainstTeams = exports.fetchAllTeams = void 0;
const teamServices_1 = require("@/app/services/teamServices");
const teamsReducer_1 = require("../reducers/teamsReducer");
const common_1 = require("@/app/utils/common");
const dataGridReducer_1 = require("../reducers/dataGridReducer");
const date_fns_1 = require("date-fns");
const constants_1 = require("@/app/constants/constants");
const fetchAllTeams = () => async (dispatch) => {
    try {
        await dispatch((0, teamServices_1.getAllTeams)());
    }
    catch (error) {
        console.error('Error fetching teams data:', error);
    }
};
exports.fetchAllTeams = fetchAllTeams;
const formatAllocations = (data, resources, teamId, teamName, teamStatus, teamAllocationManager, startDate, endDate) => {
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
        }
        else {
            if (Array.isArray(resources.result) && resources?.result.length !== 0) {
                const uniqueRecords = (0, common_1.removeDuplicateResources)(resources?.result);
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
            if (!allocation.Period || allocation.AllocationEntered === 0)
                return;
            const periodDate = (0, date_fns_1.parseISO)(allocation.Period);
            const weekNumber = (0, common_1.getWeekNumber)(periodDate);
            const formattedDate = (0, date_fns_1.format)(periodDate, constants_1.DATE_FORMAT);
            const matchingTeamResource = Array.isArray(resources?.result) &&
                resources?.result.find(team => team.FullName === allocation.ResourceName ||
                    team.Id === allocation.Resource);
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
                    period: formattedDate
                };
                existingAllocation.totalEffort += allocation.AllocationEntered;
                existingAllocation.teamStatus = teamStatus ?? '';
                existingAllocation.teamAllocationManager =
                    teamAllocationManager ?? '';
            }
            else {
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
                    period: formattedDate
                };
                allocationMap.set(uniqueId, newAllocation);
            }
        });
    // add empty allocations with period within date range
    const allWeeks = (0, common_1.getMondaysInRange)(startDate, endDate);
    const updatedAllocationMap = Array.from(allocationMap.values());
    updatedAllocationMap.forEach((allocation) => {
        const filteredWeeksArr = Object.values(allocation).filter((item) => typeof item === 'object');
        const allFilteredDates = filteredWeeksArr
            .map((obj) => obj?.period && (0, date_fns_1.format)((0, common_1.getMonday)(obj.period), constants_1.DATE_FORMAT))
            .filter(Boolean);
        allWeeks
            .filter((week) => !allFilteredDates.includes(week))
            .forEach((week) => {
            var _a;
            allocation[_a = (0, common_1.getWeekNumber)(week)] ?? (allocation[_a] = {
                allocationId: null,
                value: null,
                period: week,
            });
        });
    });
    return updatedAllocationMap;
};
const fetchResourcesAgainstTeams = (teams, allocations = null, StartDate, EndDate) => async (dispatch) => {
    try {
        dispatch((0, teamsReducer_1.setTeamsDataProcessing)(true));
        let allResources = [];
        const teamPromises = teams.map(async (team) => {
            const teamResourcesPostData = {
                'ResourceAllocation.Core/GetTeamResources': {
                    TeamId: team.Id
                },
            };
            const teamAllocationPostData = {
                'ResourceAllocation.Core/GetTeamAllocationsForPeriod': {
                    TeamId: team.Id,
                    StartDate,
                    EndDate
                },
            };
            const resourcesPromise = dispatch((0, teamServices_1.getResourcesAgainstTeams)(teamResourcesPostData))
                .then(result => ({ status: 'fulfilled', result, team }))
                .catch(error => ({ status: 'rejected', error, team }));
            const allocationsPromise = dispatch((0, teamServices_1.getTeamAllocations)(teamAllocationPostData))
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
        results.forEach((result) => {
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
        dispatch((0, teamsReducer_1.setAllTeamsResources)(allResourceResults));
        const preload_result = [];
        if (allocations && results?.length === 1) {
            Object.keys(allocations)?.forEach(key => {
                if (key === teams[0].Id) {
                    preload_result.push(results[0]);
                }
                else {
                    preload_result.push({
                        status: 'fulfilled',
                        value: allocations[key],
                    });
                }
            });
        }
        const iterator = allocations && preload_result?.length ? preload_result : results;
        Array.isArray(iterator) &&
            iterator.forEach(({ status, value }) => {
                if (status === 'fulfilled') {
                    const { resourcesResult, allocationsResult, team } = value;
                    dispatch((0, dataGridReducer_1.setAllocations)({
                        team_id: team.Id,
                        value: { resourcesResult, allocationsResult, team },
                    }));
                    if (resourcesResult.status === 'fulfilled' &&
                        allocationsResult.status === 'fulfilled') {
                        const formattedAllocations = formatAllocations(allocationsResult.result.payload, resourcesResult.result.payload, team.Id, team.Name, team.Status, team.AllocationManager, StartDate, EndDate);
                        const final = formattedAllocations.filter(data => data.teams === team.Name);
                        allResources = [...allResources, ...final];
                    }
                }
                else {
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
            dispatch((0, teamsReducer_1.updateResources)(allResources));
        }
    }
    catch (error) {
        console.error('Error fetching resources and allocations for teams:', error);
    }
    finally {
        dispatch((0, teamsReducer_1.setTeamsDataProcessing)(false));
    }
};
exports.fetchResourcesAgainstTeams = fetchResourcesAgainstTeams;
const fetchAllAllocations = () => async (dispatch) => {
    try {
        const postData = {
            'ResourceAllocation.Core/GetAllAllocationsForPeriod': {
                StartDate: '2025-01-01',
                EndDate: '2025-12-31',
            },
        };
        await dispatch((0, teamServices_1.getAllAllocationsForPeriod)(postData));
    }
    catch (error) {
        console.error('Error fetching all allocations:', error);
    }
};
exports.fetchAllAllocations = fetchAllAllocations;
const addResourceToTeam = (teamId, resourceId) => async (dispatch) => {
    try {
        const postData = {
            'ResourceAllocation.Core/TeamResource': {
                Team: teamId,
                Resource: resourceId,
            },
        };
        await dispatch((0, teamServices_1.postTeamResource)(postData));
    }
    catch (error) {
        console.error('Error adding resource to team:', error);
    }
};
exports.addResourceToTeam = addResourceToTeam;
