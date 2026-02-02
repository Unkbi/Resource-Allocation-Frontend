import axiosInstance from '../utils/apiClient';
import {
  GetProjectSummaryRequest,
  GetProjectSummaryHistoryRequest,
  ProjectSummary,
  ProjectSummaryHistory,
} from '../types/aiSummaryTypes';
import { formatAPIResponse } from '../utils/authUtils';

/**
 * Fetch AI-generated summary for a specific project and period
 * @param request - Filters object with all applied filters
 * @returns Raw API response array of AIProjectSummaryDetail
 */
export const getProjectSummary = async (
  request: any
): Promise<any> => {
  try {
    const response = await axiosInstance.post('/Resource/GetAIProjectSummaryDetails', request);
    
    if (response.data && Array.isArray(response.data)) {

      const summaryDetailObj = response.data.map((item: any) => item.AIProjectSummaryDetail);
      if (summaryDetailObj) {
        return summaryDetailObj;
      }
    }
    
    return [];
  } catch (error: any) {
    console.error('Error fetching project summary:', error);
    throw error;
  }
};

/**
 * Fetch historical AI summaries for a project across multiple periods
 * @param request - Project ID, optional date range, and limit
 * @returns Project summary history with array of summaries
 */
export const getProjectSummaryHistory = async (
  request: GetProjectSummaryHistoryRequest
): Promise<ProjectSummaryHistory> => {
  try {
    const response = await axiosInstance.post('/Resource/GetProjectSummaryHistory', request);
    const formatted = response.data;
    
    if (formatted && formatted.length > 0) {
      return formatted[0];
    }
    
    // Return empty history if no data
    return {
      project_id: request.ProjectId,
      summaries: [],
      total_count: 0,
    };
  } catch (error: any) {
    console.error('Error fetching project summary history:', error);
    throw error;
  }
};

/**
 * Build the payload for fetching summaries based on filters
 * Similar to buildReportPayload in dashboardServices
 */
export const buildSummaryPayload = (uiFilters: any) => {
  const payload: any = {
    Projects: uiFilters.project || [],
    Portfolios: uiFilters.portfolio || [],
    ProjectTypes: uiFilters.projectType || [],
    ProjectTypeGroups: uiFilters.projectTypeGroup || [],
    ProjectManagers: uiFilters.projectManager || [],
    ProjectSponsors: [],
    Status: uiFilters.projectStatuses?.length ? uiFilters.projectStatuses : ['Active', 'Approved'],
    StartDate: uiFilters.startDate,
    EndDate: uiFilters.endDate,
  };
  
  // Add optional filters that have values
  if (uiFilters.team?.length) payload.Teams = uiFilters.team;
  if (uiFilters.organization?.length) payload.Orgs = uiFilters.organization;
  if (uiFilters.resourceType?.length) payload.ResourceTypes = uiFilters.resourceType;
  if (uiFilters.resource?.length) payload.Resources = uiFilters.resource;
  if (uiFilters.allocationManager?.length) payload.AllocationManagers = uiFilters.allocationManager;
  if (uiFilters.resourceStatuses?.length) payload.ResourceStatuses = uiFilters.resourceStatuses;
  if (uiFilters.resourceLocations?.length) payload.ResourceLocations = uiFilters.resourceLocations;
  if (uiFilters.resourceWorkLocationGroup?.length) payload.ResourceWorkLocationGroup = uiFilters.resourceWorkLocationGroup;
  
  return payload;
};
