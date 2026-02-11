import { ReportType } from '@/app/types/dashboardTypes';
import { formatAPIResponse } from './authUtils';

/**
 * Formats nested API response data into flat structure for DataGrid
 * Handles all report types with their specific data structures
 */

const safeGet = (obj: any, path: string, defaultValue: any = null) => {
    if (!obj) return defaultValue;
    
    const keys = path.split('.');
    if (keys.length === 1) {
        const value = obj[keys[0]];
        return value !== undefined && value !== null ? value : defaultValue;
    }
    const [entityKey, propertyKey] = keys;
    let nestedEntity = obj[entityKey];

    if (!nestedEntity) return defaultValue;
    // if (nestedEntity[entityKey] !== undefined && nestedEntity[entityKey] !== null) {
    //     nestedEntity = nestedEntity[entityKey];
    // }
    const propertyValue = nestedEntity[propertyKey];

    return propertyValue !== undefined && propertyValue !== null 
        ? propertyValue 
        : defaultValue;
};

// Format date to MM/DD/YYYY or return null
// Handles date strings without timezone conversion to avoid shifting dates
const formatDate = (dateValue: any): string | null => {
    if (!dateValue) return null;
    try {
        const dateStr = String(dateValue);
        
        // Handle ISO datetime format (e.g., "1970-01-01T12:00:00.000Z")
        if (dateStr.includes('T')) {
            const datePart = dateStr.split('T')[0];
            const [year, month, day] = datePart.split('-');
            return `${month}/${day}/${year}`;
        }
        // Handle simple date format (e.g., "2024-12-26")
        if (dateStr.includes('-')) {
            const [year, month, day] = dateStr.split('-');
            return `${month}/${day}/${year}`;
        }
        
        return null;
    } catch {
        return null;
    }
};

const formatProjectsOnly = (data: any[]): any[] => {
    // First, format the entire response to flatten the double-nested structure
    const formattedData = formatAPIResponse('ProjectWithDetails', data);
    return formattedData.map((item: any, index: any) => ({
        id: index,
        project_id: safeGet(item, 'Project.Id', ''),
        project_name: safeGet(item, 'Project.Name', ''),
        description: safeGet(item, 'Project.Description', ''),
        status: safeGet(item, 'Project.Status', ''),
        location: safeGet(item, 'Project.Location', ''),
        start_date: formatDate(safeGet(item, 'Project.StartDate')),
        end_date: formatDate(safeGet(item, 'Project.EndDate')),
        budget: safeGet(item, 'Project.Budget', 0),
        budget_currency: safeGet(item, 'Project.BudgetCurrency', ''),
        allow_overtime: safeGet(item, 'Project.AllowOvertime', false),

        // ProjectType
        project_type: safeGet(item, 'ProjectType.Name', ''),
        project_type_group: safeGet(item, 'ProjectTypeGroup.Name', ''),
        project_type_color: safeGet(item, 'ProjectType.Color', ''),

        // Portfolio
        portfolio_id: safeGet(item, 'Portfolio.Id', ''),
        portfolio_name: safeGet(item, 'Portfolio.Name', ''),
        portfolio_description: safeGet(item, 'Portfolio.Description', ''),
        portfolio_status: safeGet(item, 'Portfolio.Status', ''),
        portfolio_sidebar_color: safeGet(item, 'Portfolio.SidebarColor', ''),

        // ProjectManager
        project_manager: safeGet(item, 'ProjectManager.FullName', ''),
        project_manager_email: safeGet(item, 'ProjectManager.Email', ''),

        // ProjectSponsor
        project_sponsor: safeGet(item, 'ProjectSponsor.FullName', ''),
        project_sponsor_email: safeGet(item, 'ProjectSponsor.Email', ''),

        // Audit fields
        created: formatDate(safeGet(item, 'Project.__created')),
        created_by: safeGet(item, 'Project.__created_by', ''),
        last_modified: formatDate(safeGet(item, 'Project.__last_modified')),
        last_modified_by: safeGet(item, 'Project.__last_modified_by', ''),
    }));
};

const formatResourceOnly = (data: any[]): any[] => {
    const formattedData = formatAPIResponse('ResourceWithDetails', data);
    
    return formattedData.map((item: any, index: any) => ({
        id: index,
        resource_id: safeGet(item, 'Resource.Id', ''),
        resource_name: safeGet(item, 'Resource.FullName', ''),
        first_name: safeGet(item, 'Resource.FirstName', ''),
        preferred_first_name: safeGet(item, 'Resource.PreferredFirstName', ''),
        last_name: safeGet(item, 'Resource.LastName', ''),
         user_id: safeGet(item, 'Resource.UserId', ''),
        email: safeGet(item, 'Resource.Email', ''),
        department: safeGet(item, 'Resource.Department', ''),
        role: safeGet(item, 'Resource.Role', ''),
        hr_level: safeGet(item, 'Resource.HRLevel', ''),
        resource_type: safeGet(item, 'Resource.Type', ''),
        contractor_hourly_rate: safeGet(item, 'Resource.ContractorHourlyRate', 0),
        contractor_hourly_rate_currency: safeGet(item, 'Resource.ContractorHourlyRateCurrency', ''),
        manager_name: safeGet(item, 'Manager.FullName', ''),
        team_name: safeGet(item, 'Team.Name', ''),
        allocation_manager: safeGet(item, 'Team.AllocationManager', ''),
        organization: safeGet(item, 'Organization.Name', ''),
        work_location: safeGet(item, 'WorkLocation.Name', ''),
        work_location_group: safeGet(item, 'WorkLocationGroup.Name', ''),
        location_category: safeGet(item, 'Resource.LocationCategory', ''),
        start_date: formatDate(safeGet(item, 'Resource.StartDate')),
        end_date: formatDate(safeGet(item, 'Resource.EndDate')),
        status: safeGet(item, 'Resource.Status', ''),
        created: formatDate(safeGet(item, 'Resource.__created')),
        created_by: safeGet(item, 'Resource.__created_by', ''),
        last_modified: formatDate(safeGet(item, 'Resource.__last_modified')),
        last_modified_by: safeGet(item, 'Resource.__last_modified_by', ''),
    }));
};

const formatProjectPeriod = (data: any[]): any[] => {
    const formattedData = formatAPIResponse('ProjectPeriodDetail', data);

    return formattedData.map((item: any, index: any) => ({
        id: index,
        project_id: safeGet(item, 'Project.Id', ''),
        project_name: safeGet(item, 'Project.Name', ''),
        project_type_group: safeGet(item, 'ProjectTypeGroup.Name', ''),
        project_type: safeGet(item, 'ProjectType.Name', ''),
        status: safeGet(item, 'Project.Status', ''),
        portfolio_name: safeGet(item, 'Portfolio.Name', ''),
        project_manager: safeGet(item, 'ProjectManager.FullName', ''),
        project_manager_email: safeGet(item, 'ProjectManager.Email', ''),
        period: formatDate(safeGet(item, 'Allocation.Period')),
        planned_allocation: safeGet(item, 'Allocation.AllocationEntered', 0),
        actual_allocation: safeGet(item, 'Allocation.ActualsEntered', 0),
        variance: safeGet(item, 'Allocation.Variance', 0),
        health_score: safeGet(item, 'Projectperiod.ProjectHealthScore', 0),
        alignment_score: safeGet(item, 'Projectperiod.AlignmentScore', 0),
        project_score: safeGet(item, 'Projectperiod.ProjectScore', 0),
        created: formatDate(safeGet(item, 'Project.__created')),
        created_by: safeGet(item, 'Project.__created_by', ''),
        last_modified: formatDate(safeGet(item, 'Project.__last_modified')),
        last_modified_by: safeGet(item, 'Project.__last_modified_by', ''),
    }));
};

const formatResourcePeriod = (data: any[]): any[] => {
    const formattedData = formatAPIResponse('ResourcePeriodActualsDetail', data);
    
    return formattedData.map((item: any, index: any) => ({
        id: index,
        resource_id: safeGet(item, 'Resource.Id', ''),
        resource_name: safeGet(item, 'Resource.FullName', ''),
        resource_type: safeGet(item, 'Resource.Type', ''),
        status: safeGet(item, 'Resource.Status', ''),
        resource_location: safeGet(item, 'WorkLocation.Name', ''),
        resource_location_group: safeGet(item, 'WorkLocationGroup.Name', ''),
        team_name: safeGet(item, 'Team.Name', ''),
        organization_name: safeGet(item, 'Organization.Name', ''),
        allocation_manager: safeGet(item, 'Team.AllocationManager', ''),
        period: formatDate(safeGet(item, 'Allocation.Period')),
        actuals_status: safeGet(item, 'ActualsStatus.Status', ''),
        confirmed_at: formatDate(safeGet(item, 'Resourceperiod.ActualsConfirmedAt')),
        planned_allocation: safeGet(item, 'Allocation.AllocationEntered', 0),
        actuals_allocation: safeGet(item, 'Allocation.ActualsEntered', 0),
        variance: safeGet(item, 'Allocation.Variance', 0),
        planning_engagement: safeGet(item, 'Resourceperiod.PlanningEngagement', 0),
        actuals_engagement: safeGet(item, 'Resourceperiod.ActualsEngagement', 0),
        alignment_score: safeGet(item, 'Resourceperiod.AlignmentScore', 0),
        project_health_score: safeGet(item, 'Resourceperiod.ProjectHealthScore', 0),
        engagement_score: safeGet(item, 'Resourceperiod.EngagementScore', 0),
        six_week_plan: safeGet(item, 'Resourceperiod.SixWeekPlan', ''),
        created: formatDate(safeGet(item, 'Resource.__created')),
        created_by: safeGet(item, 'Resource.__created_by', ''),
        last_modified: formatDate(safeGet(item, 'Resource.__last_modified')),
        last_modified_by: safeGet(item, 'Resource.__last_modified_by', ''),
    }));
};

const formatResourceProjectPeriod = (data: any[]): any[] => {
    const formattedData = formatAPIResponse('AllocationActualsDetail', data);
    
    return formattedData.map((item: any, index: any) => ({
        id: index,
        resource_id: safeGet(item, 'Resource.Id', ''),
        resource_name: safeGet(item, 'Resource.FullName', ''),
        resource_type: safeGet(item, 'Resource.Type', ''),
        resource_status: safeGet(item, 'Resource.Status', ''),
        resource_location: safeGet(item, 'WorkLocation.Name', ''),
        resource_location_group: safeGet(item, 'WorkLocationGroup.Name', ''),
        team_name: safeGet(item, 'Team.Name', ''),
        organization_name: safeGet(item, 'Organization.Name', ''),
        allocation_manager: safeGet(item, 'Team.AllocationManager', ''),
        project_name: safeGet(item, 'Project.Name', ''),
        project_status: safeGet(item, 'Project.Status',''),
        project_type_group: safeGet(item, 'ProjectTypeGroup.Name', ''),
        project_type: safeGet(item, 'ProjectType.Name', ''),
        portfolio_name: safeGet(item, 'Portfolio.Name', ''),
        project_manager: safeGet(item, 'ProjectManager.FullName', ''),
        period: formatDate(safeGet(item, 'Allocation.Period')),
        planned: safeGet(item, 'Allocation.AllocationEntered', 0),
        actual: safeGet(item, 'Allocation.ActualsEntered', 0),
        variance: safeGet(item, 'Allocation.Variance', 0),
        alignment_score: safeGet(item, 'Resourceprojectperiod.AlignmentScore', 0),
        weighted_percent_variance: safeGet(item, 'Resourceprojectperiod.WeightedPercentVariance', 0),
        project_health_score: safeGet(item, 'Resourceprojectperiod.ResourceProjectHealthScore', 0),
        percent_variance: safeGet(item, 'Resourceprojectperiod.PercentVariance', 0),
        project_actuals_status: safeGet(item, 'Allocation.ProjectActualsStatus', ''),
        comments: safeGet(item, 'Allocation.Notes', ''),
        created: formatDate(safeGet(item, 'Project.__created')),
        created_by: safeGet(item, 'Project.__created_by', ''),
        last_modified: formatDate(safeGet(item, 'Project.__last_modified')),
        last_modified_by: safeGet(item, 'Project.__last_modified_by', ''),
    }));
};

const formatResourceProjectPeriodCost = (data: any[]): any[] => {
    const formattedData = formatAPIResponse('AllocationCostReportDetail', data);
    
    return formattedData.map((item: any, index: any) => ({
        id: index,
        resource_id: safeGet(item, 'Resource.Id', ''),
        resource_name: safeGet(item, 'Resource.FullName', ''),
        resource_type: safeGet(item, 'Resource.Type', ''),
        resource_status: safeGet(item, 'Resource.Status', ''),
        resource_location: safeGet(item, 'WorkLocation.Name', ''),
        resource_location_group: safeGet(item, 'WorkLocationGroup.Name', ''),
        team_name: safeGet(item, 'Team.Name', ''),
        organization_name: safeGet(item, 'Organization.Name', ''),
        allocation_manager: safeGet(item, 'Team.AllocationManager', ''),
        project_id: safeGet(item, 'Project.Id', ''),
        project_name: safeGet(item, 'Project.Name', ''),
        project_status: safeGet(item, 'Project.Status',''),
        project_type_group: safeGet(item, 'ProjectTypeGroup.Name', ''),
        project_type: safeGet(item, 'ProjectType.Name', ''),
        portfolio_name: safeGet(item, 'Portfolio.Name', ''),
        project_manager: safeGet(item, 'ProjectManager.FullName', ''),
        hourly_rate: safeGet(item, 'AllocationCost.HourlyRate', 0),
        period: formatDate(safeGet(item, 'Allocation.Period')),
        planned: safeGet(item, 'Allocation.AllocationEntered', 0),
        actual: safeGet(item, 'Allocation.ActualsEntered', 0),
        variance: safeGet(item, 'Allocation.Variance', 0),
        alignment_score: safeGet(item, 'Resourceprojectperiod.AlignmentScore', 0),
        weighted_percent_variance: safeGet(item, 'Resourceprojectperiod.WeightedPercentVariance', 0),
        project_health_score: safeGet(item, 'Resourceprojectperiod.ResourceProjectHealthScore', 0),
        percent_variance: safeGet(item, 'Resourceprojectperiod.PercentVariance', 0),
        actual_cost: safeGet(item, 'AllocationCost.ActualsCost', 0),
        planned_cost: safeGet(item, 'AllocationCost.PlannedCost', 0),
        project_actuals_status: safeGet(item, 'Allocation.ProjectActualsStatus', ''),
        comments: safeGet(item, 'Allocation.Notes', ''),
        currency: safeGet(item, 'AllocationCost.HourlyRateCurrency', 'USD'),
        created: formatDate(safeGet(item, 'Project.__created')),
        created_by: safeGet(item, 'Project.__created_by', ''),
        last_modified: formatDate(safeGet(item, 'Project.__last_modified')),
        last_modified_by: safeGet(item, 'Project.__last_modified_by', ''),
    }));
};

export const formatReportData = (
    reportType: ReportType,
    data: any[]
): any[] => {
    if (!data || !Array.isArray(data) || data.length === 0) {
        return [];
    }

    switch (reportType) {
        case 'projectsOnly':
            return formatProjectsOnly(data);
        case 'resourceOnly':
            return formatResourceOnly(data);
        case 'projectPeriod':
            return formatProjectPeriod(data);
        case 'resourcePeriod':
            return formatResourcePeriod(data);
        case 'resourceProjectPeriod':
            return formatResourceProjectPeriod(data);
        case 'resourceProjectPeriodCost':
            return formatResourceProjectPeriodCost(data);
        default:
            console.warn(`Unknown report type: ${reportType}`);
            return [];
    }
};

/**
 * Alternative: Format data with custom field mapping
 * Useful when API structure varies or for edge cases
 */
export const formatReportDataCustom = (
    data: any[],
    fieldMapping: Record<string, string>
): any[] => {
    return data.map((item, index) => {
        const formatted: any = { id: index };

        Object.entries(fieldMapping).forEach(([targetField, sourcePath]) => {
            formatted[targetField] = safeGet(item, sourcePath, '');
        });

        return formatted;
    });
};
