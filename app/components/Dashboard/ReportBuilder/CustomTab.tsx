'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';
import { parseISO } from 'date-fns/parseISO';
import { RootState } from '@/app/redux/store';
import LoadingScreen from '@/app/components/Loading/loadingScreen';
import { GridColDef } from '@mui/x-data-grid-premium';
import { StyledDataGrid, ColumnManagementStyles } from '../../AllocationTable/styles/StyledDataGrid';
import ReportBuilderDataGridToolbar from './ReportBuilderDataGridToolbar';
import { BarChart } from '@mui/x-charts/BarChart';
import { ChartContainer } from '@mui/x-charts/ChartContainer';
import { BarPlot } from '@mui/x-charts/BarChart';
import { LinePlot, MarkPlot } from '@mui/x-charts/LineChart';
import { ChartsXAxis } from '@mui/x-charts/ChartsXAxis';
import { ChartsYAxis } from '@mui/x-charts/ChartsYAxis';
import { ChartsTooltip, ChartsTooltipContainer, useAxisTooltip } from '@mui/x-charts/ChartsTooltip';
import DashboardWidget from '../DashboardWidget';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Global, css } from '@emotion/react';
import { formatDate } from '@/app/utils/reportDataFormatter';
import { navigateToReport } from '@/app/utils/reportNavigation';
import { useRouter } from 'next/navigation';

// Module-level tooltip for allocation capacity chart (must be outside component)
const AllocCapTooltip = () => {
    const tooltipData = useAxisTooltip();
    if (!tooltipData) return null;
    const { axisValue, seriesItems } = tooltipData;
    const capacityItem = seriesItems?.find((s: any) => s.label === 'Capacity');
    const cap = capacityItem ? Number(capacityItem.value ?? 0) : 0;
    const alloc = seriesItems
        ?.filter((s: any) => s.label !== 'Capacity')
        .reduce((sum: number, s: any) => sum + Number(s.value ?? 0), 0) ?? 0;
    const avail = Math.round(cap - alloc);
    return (
        <ChartsTooltipContainer>
            <Box sx={{ bgcolor: 'rgba(255,255,255,0.97)', border: '1px solid #e2e8f0', borderRadius: 1.5, boxShadow: 4, p: 1.5, minWidth: 160, pointerEvents: 'none' }}>
                <Typography sx={{ fontWeight: 700, fontSize: 14, mb: 0.5, color: '#0f172a' }}>{String(axisValue || '')}</Typography>
                {avail >= 0 && (
                    <Typography sx={{ color: '#16a34a', fontWeight: 600, fontSize: 12, mb: 0.75, bgcolor: '#dcfce7', px: 1, py: 0.25, borderRadius: 1, display: 'inline-block' }}>
                        {avail} avail
                    </Typography>
                )}
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4, mt: 0.5 }}>
                    <Typography sx={{ fontSize: 12, color: '#64748b' }}>Alloc</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{alloc}</Typography>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 4 }}>
                    <Typography sx={{ fontSize: 12, color: '#64748b' }}>Cap</Typography>
                    <Typography sx={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{cap}</Typography>
                </Box>
            </Box>
        </ChartsTooltipContainer>
    );
};

// Utility function to calculate responsive chart dimensions
const getResponsiveChartConfig = (dimensions: any, chartType = 'bar') => {
    const { width, height } = dimensions;

    const configs = {
        bar: {
            width: Math.max(width - 40, 400),
            height: Math.max(height - 80, 300),
            isSmallScreen: width < 400,
            legend: {
                direction: width < 400 ? "column" : "row",
                position: {
                    vertical: "bottom",
                    horizontal: width < 400 ? "left" : "middle",
                },
                itemmarkwidth: width < 400 ? 16 : 20,
                itemmarkheight: width < 400 ? 12 : 16,
                labelstyle: { fontSize: width < 400 ? 11 : 13 },
                padding: width < 400 ? 4 : 8,
            },
            margin: {
                left: width < 400 ? 40 : 60,
                right: width < 400 ? 10 : 20,
                top: 20,
                bottom: width < 400 ? 60 : 80,
            },
        },
    };

    return configs[chartType as keyof typeof configs] || configs.bar;
};

const ResponsiveGridLayout = WidthProvider(Responsive);

// Chart sequence for custom report
const CUSTOM_CHART_SEQUENCE = ['customAllocationChart'];

// Chart sequence for allocation capacity report
const ALLOCATION_CAPACITY_CHART_SEQUENCE = ['allocationCapacityChart'];

// Utility function to get ordinal suffix for day
const getOrdinalSuffix = (day: number): string => {
    if (day > 3 && day < 21) return 'th';
    switch (day % 10) {
        case 1: return 'st';
        case 2: return 'nd';
        case 3: return 'rd';
        default: return 'th';
    }
};

// Utility function to format date with ordinal suffix
const formatDateWithOrdinal = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const year = date.getFullYear();
    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
};

// Utility function to format filters for display

// Generate layout configuration
const generateLayouts = (chartKeys: string[]) => {
    return {
        lg: chartKeys.map((key, idx) => ({
            i: key,
            x: 0,
            y: idx * 3,
            w: 12,
            h: 3,
            minW: 5,
            minH: 3,
        })),
        md: chartKeys.map((key, idx) => ({
            i: key,
            x: 0,
            y: idx * 3,
            w: 12,
            h: 3,
            minW: 6,
            minH: 3,
        })),
        sm: chartKeys.map((key, idx) => ({
            i: key,
            x: 0,
            y: idx * 3,
            w: 12,
            h: 3,
            minW: 12,
            minH: 3,
        })),
    };
};

interface CustomTabProps {
    showActuals: boolean;
    APIFilters: any;
    customReportType?: 'percentageAllocation' | 'allocationCapacity';
}

export default function CustomTab({ showActuals, APIFilters, customReportType = 'percentageAllocation' }: CustomTabProps) {
    const router = useRouter();
    const { currentReport, loading, error, allocationCapacityReport, allocationCapacityLoading, allocationCapacityError } = useSelector(
        (state: RootState) => state.customReport as any
    );
    const { projectTypeGroups, projectTypes } = useSelector((state: RootState) => state.allSettings);
    const { organisations } = useSelector((state: RootState) => state.organisations);
    const { teams } = useSelector((state: RootState) => state.teams);
    const {projects} = useSelector((state: RootState) => state.projects);
    const [isFullscreenGrid, setIsFullscreenGrid] = useState(false);
    const [persistedLayouts, setPersistedLayouts] = useState<any>(null);
    const suppressSaveRef = useRef(true);

    const STORAGE_KEY = 'custom_report_chart_layout';
    const ALLOC_CAP_STORAGE_KEY = 'alloc_cap_chart_layout';

    // Generate default layouts
    const defaultLayouts = useMemo(
        () => generateLayouts(CUSTOM_CHART_SEQUENCE),
        []
    );

    const defaultAllocCapLayouts = useMemo(
        () => generateLayouts(ALLOCATION_CAPACITY_CHART_SEQUENCE),
        []
    );

    const [persistedAllocCapLayouts, setPersistedAllocCapLayouts] = useState<any>(null);

    // Load persisted layouts from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setPersistedLayouts(parsed);
            }
            const savedAllocCap = localStorage.getItem(ALLOC_CAP_STORAGE_KEY);
            if (savedAllocCap) {
                setPersistedAllocCapLayouts(JSON.parse(savedAllocCap));
            }
            // Allow saving after initial load
            setTimeout(() => {
                suppressSaveRef.current = false;
            }, 100);
        } catch (error) {
            console.error('Failed to load chart layout:', error);
        }
    }, []);

    const formatFiltersForDisplay = (filters: any): string => {
    if (!filters) return '';
    
    const parts: string[] = [];
    
    // Date range
    if (filters.StartDate && filters.EndDate) {
        const startDate = parseISO(filters.StartDate);
        const endDate = parseISO(filters.EndDate);
        const startDay = startDate.getDate();
        const endDay = endDate.getDate();
        const startMonth = startDate.toLocaleDateString('en-US', { month: 'short' });
        const endMonth = endDate.toLocaleDateString('en-US', { month: 'short' });
        const startYear = startDate.getFullYear();
        const endYear = endDate.getFullYear();
        
        let dateRange = '';
        if (startYear === endYear) {
            if (startMonth === endMonth) {
                dateRange = `${startDay}${getOrdinalSuffix(startDay)} - ${endDay}${getOrdinalSuffix(endDay)} ${endMonth} ${startYear}`;
            } else {
                dateRange = `${startDay}${getOrdinalSuffix(startDay)} ${startMonth} - ${endDay}${getOrdinalSuffix(endDay)} ${endMonth} ${startYear}`;
            }
        } else {
            dateRange = `${startDay}${getOrdinalSuffix(startDay)} ${startMonth} ${startYear} - ${endDay}${getOrdinalSuffix(endDay)} ${endMonth} ${endYear}`;
        }
        parts.push(dateRange);
    }
    
    // Organizations
    if (filters.Organizations && filters.Organizations.length > 0) {
        const orgNames = filters.Organizations.map((org: string) => {
            // Attempt to find organization name from ID if possible

            const orgName = organisations?.find((o: any) => o.Id === org)?.Name || org;
            return orgName;
        });
        parts.push(`Org: ${orgNames.join(', ')}`);
    }
    
    // Projects
    if (filters.Projects && filters.Projects.length > 0) {
        const projectNames = filters.Projects.map((project: string) => {
            const projectName = projects?.find((p: any) => p.Id === project)?.Name || project;
            return projectName;
        });
        parts.push(`Projects: ${projectNames.join(', ')}`);
    }

    // Teams
    if (filters.Teams && filters.Teams.length > 0) {
        const teamNames = filters.Teams.map((team: string) => {
            const teamName = teams?.find((t: any) => t.Id === team)?.Name || team;
            return teamName;
        });
        parts.push(`Teams: ${teamNames.join(', ')}`);
    }

    // Project Types
    if (filters.ProjectTypes && filters.ProjectTypes.length > 0) {
        const typeNames = filters.ProjectTypes.map((type: string) => {
            const typeName = projectTypes?.find((t: any) => t.Id === type)?.Name || type;
            return typeName;
        });
        parts.push(`Project Types: ${typeNames.join(', ')}`);
    }
    
    // Project Type Groups
    if (filters.ProjectTypeGroups && filters.ProjectTypeGroups.length > 0) {
        const groupNames = filters.ProjectTypeGroups.map((group: string) => {
            const groupName = projectTypeGroups?.find((g: any) => g.Id === group)?.Name || group;
            return groupName;
        });
        parts.push(`Project Type Groups: ${groupNames.join(', ')}`);
    }
    
    return parts.join(' | ');
};


    // Handle layout changes
    const handleLayoutChange = useCallback(
        (_layout: any, layouts: any) => {
            if (suppressSaveRef.current) return;

            try {
                localStorage.setItem(STORAGE_KEY, JSON.stringify(layouts));
                setPersistedLayouts(layouts);
            } catch (error) {
                console.error('Failed to save chart layout:', error);
            }
        },
        []
    );

    const handleAllocCapLayoutChange = useCallback(
        (_layout: any, layouts: any) => {
            if (suppressSaveRef.current) return;
            try {
                localStorage.setItem(ALLOC_CAP_STORAGE_KEY, JSON.stringify(layouts));
                setPersistedAllocCapLayouts(layouts);
            } catch (error) {
                console.error('Failed to save alloc cap layout:', error);
            }
        },
        []
    );

    // Format data for the bar chart - MUI X Charts format
    const chartData = useMemo(() => {
        if (!currentReport?.ChartData || !Array.isArray(currentReport.ChartData)) {
            return { categories: [], allocation: [], actuals: [] };
        }

        const categories = currentReport.ChartData.map((item: any) => item.ProjectBucket || 'Unknown');
        const allocation = currentReport.ChartData.map((item: any) => item.AllocationPercentage || 0);
        const actuals = currentReport.ChartData.map((item: any) => item.ActualsPercentage || 0);

        return { categories, allocation, actuals };
    }, [currentReport]);

    const handleClick = useCallback((event: React.MouseEvent, params: any) => {
        event.stopPropagation();

        const projectId = params.row?.projectId;
        const period = params.row?.period || ''; // Format: "MM/DD/YYYY"
        const groupId = projectTypeGroups.find(p => p.Name === params.row?.project_type_group)?.Id;
        const projectTypeId = projectTypes.find(p => p.Name === params.row?.project_type)?.Id;

        if (!projectId || !period) {
            console.warn('Missing project_id or period for navigation');
            return;
        }

        // Convert period from MM/DD/YYYY to YYYY-MM-DD format
        let customStartDate: string | undefined;
        let customEndDate: string | undefined;

        try {
            const parts = period.split('/');
            if (parts.length === 3) {
                const [month, day, year] = parts;
                const periodDate = `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;

                const startDate = parseISO(periodDate);
                const endDate = new Date(startDate);
                endDate.setDate(endDate.getDate() + 6); // Add 6 days to get to Sunday

                const formatDate = (date: Date) => {
                    const y = date.getFullYear();
                    const m = String(date.getMonth() + 1).padStart(2, '0');
                    const d = String(date.getDate()).padStart(2, '0');
                    return `${y}-${m}-${d}`;
                };

                customStartDate = formatDate(startDate);
                customEndDate = formatDate(endDate);
            }
        } catch (error) {
            console.error('Error parsing period date:', period, error);
            return;
        }

        if (!customStartDate || !customEndDate) {
            console.warn('Failed to parse period for navigation');
            return;
        }

        // Navigate to resourceProjectPeriod report with filters
        navigateToReport(
            {}, // No advanced filters from current context
            {
                reportType: params.field === 'total_allocation' ? 'projectPeriod': 'resourceProjectPeriod',
                period: 'custom',
                customStartDate,
                customEndDate,
                additionalFilters: {
                    project: [projectId],
                    ...(groupId && { projectTypeGroup: groupId }),
                    ...(projectTypeId && { projectType: projectTypeId })
                },
            },
            false, // Navigate in the same tab (not a new tab)
            router
        );
    }, [projectTypeGroups, projectTypes, router]);

    // Define columns for the data grid
    const columns: GridColDef[] = useMemo(() => {
        return [
            {
                field: 'project',
                headerName: 'Project',
                minWidth: 160,
                flex: 1.5,
                renderCell: (params: any) => (
                    <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>
                        {params.value}
                    </Typography>
                ),
            },
            {
                field: 'reporting_project_type',
                headerName: 'Reporting Project Type',
                minWidth: 140,
                flex: 1,
                renderCell: (params: any) => (
                    <Typography sx={{ fontSize: '14px' }}>
                        {params.value}
                    </Typography>
                ),
            },
            {
                field: 'project_type',
                headerName: 'Project Type',
                minWidth: 140,
                flex: 1,
                renderCell: (params: any) => (
                    <Typography sx={{ fontSize: '14px' }}>
                        {params.value}
                    </Typography>
                ),
            },
            {
                field: 'project_type_group',
                headerName: 'Project Type Group',
                minWidth: 160,
                flex: 1,
                renderCell: (params: any) => (
                    <Typography sx={{ fontSize: '14px' }}>
                        {params.value}
                    </Typography>
                ),
            },
            {
                field: 'period',
                headerName: 'Period',
                minWidth: 160,
                flex: 1.2,
                renderCell: (params: any) => (
                    <Typography sx={{ fontSize: '14px' }}>
                        {params.value}
                    </Typography>
                ),
            },
            {
                field: 'yearweek',
                headerName: 'Year-Week',
                minWidth: 160,
                flex: 1.2,
                renderCell: (params: any) => (
                    <Typography sx={{ fontSize: '14px' }}>
                        {params.value}
                    </Typography>
                ),
            },
            {
                field: 'plan',
                headerName: 'Plan',
                minWidth: 100,
                flex: 0.8,
                type: 'number',
                headerAlign: 'left',
                align: 'right',
                valueFormatter: (value: any) => {
                    return Number(value).toFixed(2);
                },
                renderCell: (params: any) => {
                    return (
                        <Box
                            onClick={(event) => handleClick(event, params)}
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.8,
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            {params.value}
                        </Box>
                    );
                },
            },
            {
                field: 'actuals',
                headerName: 'Actuals',
                minWidth: 100,
                flex: 0.8,
                type: 'number',
                headerAlign: 'left',
                align: 'right',
                valueFormatter: (value: any) => {
                    return Number(value).toFixed(2);
                },
                renderCell: (params: any) => {
                    return (
                        <Box
                            onClick={(event) => handleClick(event, params)}
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.8,
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            {params.value}
                        </Box>
                    );
                },
            },
            {
                field: 'actuals_variance',
                headerName: 'Variance',
                minWidth: 140,
                flex: 1,
                type: 'number',
                headerAlign: 'left',
                align: 'right',
                valueFormatter: (value: any) => {
                    return Number(value).toFixed(2);
                },
                renderCell: (params: any) => {
                    const value = params.value;
                    return (
                        <Typography sx={{ fontSize: '14px', fontWeight: 500, textAlign: 'right' }}>
                            {value}
                        </Typography>
                    );
                },
            },

            // {
            //     field: 'team',
            //     headerName: 'Team',
            //     minWidth: 130,
            //     flex: 1,
            //     renderCell: (params: any) => (
            //         <Typography sx={{ fontSize: '14px' }}>
            //             {params.value}
            //         </Typography>
            //     ),
            // },
        ];
    }, [handleClick]);

    // Map grid data from API structure
    const rows = useMemo(() => {
        if (!currentReport?.GridData || !Array.isArray(currentReport.GridData)) {
            return [];
        }

        return currentReport.GridData.map((item: any, index: number) => ({
            id: item.Project?.Id && item.Metrics?.Period
                ? `${item.Project.Id}_${item.Metrics.Period}_${index}`
                : `row-${index}`,
            projectId: item.Project?.Id || '',
            reporting_project_type: item.Metrics?.ProjectBucket || '',
            project: item.Project?.Name || '',
            project_type_group: item.ProjectTypeGroup?.Name || '',
            project_type: item.ProjectType?.Name || '',
            plan: item.Metrics?.TotalAllocation || 0,
            actuals: item.Metrics?.TotalActuals || 0,
            actuals_variance: item.Metrics?.Variance || 0,
            period: formatDate(item.Metrics?.Period) || '',
            yearweek: item.Metrics?.Year && item.Metrics?.Week
                ? `${item.Metrics.Year}-${item.Metrics.Week}`
                : '',
            team: item.Team && item.Team.length > 0
                ? item.Team.map((t: any) => t.Name || '').join(', ')
                : '',
        }));
    }, [currentReport]);

    // Define charts object similar to dashboard
    const customCharts: Record<string, React.ReactElement> = {
        customAllocationChart: (
            <DashboardWidget
                onClick={() => { }}
                minWidth={280}
                minHeight={420}
                showNoData={
                    !currentReport?.ChartData ||
                    !Array.isArray(currentReport.ChartData) ||
                    currentReport.ChartData.length === 0 ||
                    currentReport.ChartData.every((item: any) =>
                        (item.AllocationPercentage === 0 || !item.AllocationPercentage) &&
                        (item.ActualsPercentage === 0 || !item.ActualsPercentage)
                    )
                }
                noDataMessage="No allocation data available"
            >
                {(dimensions: any) => {
                    const config = getResponsiveChartConfig(dimensions, 'bar');

                    const filtersDisplay = formatFiltersForDisplay(APIFilters);                    
                    return (
                        <Box sx={{ pt: 1, px: 1}}>
                           
                            <Typography
                                sx={{
                                    fontSize: '18px',
                                    fontWeight: 600,
                                    color: '#000000DE',
                                    mb: 1,
                                    display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1
                                }}
                            >
                                Percentage Allocation{''}
                                {filtersDisplay && (
                                <Typography
                                    sx={{
                                        fontSize: '14px',
                                        fontWeight: 400,
                                        color: '#64748B',
                                        // mb: 1,
                                    }}
                                >
                                    - {filtersDisplay}
                                </Typography>
                            )}
                            </Typography>
                            
                            <BarChart
                                width={config.width}
                                height={config.height}
                                series={[
                                    {
                                        data: chartData.allocation,
                                        label: 'Allocation',
                                        id: 'allocationId',
                                        color: '#116086',
                                    },
                                    ...(showActuals
                                        ? [
                                            {
                                                data: chartData.actuals,
                                                label: 'Actuals',
                                                id: 'actualsId',
                                                color: '#3790BB',
                                            },
                                        ]
                                        : []),
                                ]}
                                xAxis={[
                                    {
                                        data: chartData.categories,
                                        scaleType: 'band' as const,
                                        categoryGapRatio: 0.3,
                                        tickLabelStyle: { color: '#475569' }
                                    },
                                ]}
                                yAxis={[
                                    {
                                        label: 'Percentage Allocation (%)',
                                        max: 100,
                                        tickLabelStyle: { color: '#475569' }
                                    },
                                ]}
                                slotProps={{
                                    legend: {
                                        position: {
                                            vertical: "bottom",
                                            horizontal: config.width < 400 ? "start" : "center",
                                        },
                                    },
                                }}
                                margin={{
                                    left: config.isSmallScreen ? 40 : 60,
                                    right: config.isSmallScreen ? 10 : 20,
                                    top: 10,
                                    bottom: config.isSmallScreen ? 40 : 20,
                                }}
                                grid={{ vertical: true, horizontal: true }}
                            />
                        </Box>
                    );
                }}
            </DashboardWidget>
        ),
    };

    // Build allocation capacity chart
    const weeklyData: any[] = useMemo(() => {
        return allocationCapacityReport?.WeeklyData || [];
    }, [allocationCapacityReport]);

    const allProjectTypes: string[] = useMemo(() => [
        ...new Set(
            weeklyData.flatMap((period: any) =>
                (period.ProjectTypeAllocations || []).map((d: any) => d.ProjectType?.Name).filter(Boolean)
            )
        ),
    ] as string[], [weeklyData]);

    const allocCapDataset = useMemo(() => weeklyData.map((period: any) => {
        const entry: any = { week: period.Week || period.Period, capacity: Number(period.TotalCapacity || 0) };
        allProjectTypes.forEach(pt => {
            const match = (period.ProjectTypeAllocations || []).find((d: any) => d.ProjectType?.Name === pt);
            entry[pt] = Number(match?.TotalAllocation || 0);
        });
        return entry;
    }), [weeklyData, allProjectTypes]);

    const allocCapBarColors = [
        '#4D79FF', '#7BBCB1', '#8B5CF694', '#F6C260',
        '#E97E7E', '#A9D18E', '#FFD700', ,
      ];

    const allocCapAllZero = weeklyData.length === 0 ||
        weeklyData.every((p: any) =>
            Number(p.TotalCapacity || 0) === 0 &&
            (p.ProjectTypeAllocations || []).every((d: any) => Number(d.TotalAllocation || 0) === 0)
        );

    // Allocation capacity DataGrid rows - using GridData from API
    const allocCapRows = useMemo(() => {
        const gridData = allocationCapacityReport?.GridData || [];
        return gridData.map((item: any, index: number) => ({
            id: `${item.Project?.Id}- ${item.Metrics?.Period || ''}-${index}`,
            projectId: item.Project?.Id || '',
            project: item.Project?.Name || '',
            portfolio: item.Portfolio?.Name || '',
            project_type: item.ProjectType?.Name || '',
            project_type_group: item.ProjectTypeGroup?.Name || '',
            project_manager: item.ProjectManager?.FullName || '',
            project_sponsor: item.ProjectSponsor?.FullName || '',
            yearweek: `${item.Metrics?.Year || ''} - ${item.Metrics?.Week || ''}`,
            period: formatDate(item.Metrics?.Period) || item.Metrics?.Period || '',
            year: item.Metrics?.Year || '',
            total_allocation: Number(item.Metrics?.TotalAllocation || 0),
            // total_actuals: Number(item.Metrics?.TotalActuals || 0),
            // variance: Number(item.Metrics?.Variance || 0),
            // allocation_percentage: Number(item.Metrics?.AllocationPercentage || 0),
            // actuals_percentage: Number(item.Metrics?.ActualsPercentage || 0),
        }));
    }, [allocationCapacityReport]);

    // Allocation capacity DataGrid columns - matching GridData structure
    const allocCapColumns: GridColDef[] = useMemo(() => [
        { field: 'project', headerName: 'Project', minWidth: 180, flex: 1.5, renderCell: (params: any) => <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>{params.value}</Typography> },
        { field: 'project_type', headerName: 'Project Type', minWidth: 140, flex: 1, renderCell: (params: any) => <Typography sx={{ fontSize: '14px' }}>{params.value}</Typography> },
        { field: 'project_type_group', headerName: 'Project Type Group', minWidth: 160, flex: 1.2, renderCell: (params: any) => <Typography sx={{ fontSize: '14px' }}>{params.value}</Typography> },
        { field: 'period', headerName: 'Period', minWidth: 120, flex: 1, renderCell: (params: any) => <Typography sx={{ fontSize: '14px' }}>{params.value}</Typography> },
        { field: 'yearweek', headerName: 'Year - Week', minWidth: 80, flex: 0.6, renderCell: (params: any) => <Typography sx={{ fontSize: '14px' }}>{params.value}</Typography> },
        { field: 'total_allocation', headerName: 'Total Allocation', minWidth: 100, flex: 1, type: 'number', headerAlign: 'left', align: 'right', valueFormatter: (value: any) => {
                return Number(value).toFixed(2);
            }, renderCell: (params: any) => {
                    return (
                        <Box
                            onClick={(event) => handleClick(event, params)}
                            sx={{
                                display: 'flex',
                                justifyContent: 'flex-end',
                                alignItems: 'center',
                                width: '100%',
                                height: '100%',
                                cursor: 'pointer',
                                '&:hover': {
                                    opacity: 0.8,
                                    textDecoration: 'underline',
                                },
                            }}
                        >
                            {params.value}
                        </Box>
                    );
                }, },
        // { field: 'total_actuals', headerName: 'Total Actuals', minWidth: 120, flex: 1, type: 'number', headerAlign: 'left', align: 'right', renderCell: (params: any) => <Typography sx={{ fontSize: '14px', textAlign: 'right', width: '100%' }}>{Number(params.value).toFixed(2)}</Typography> },
        // { field: 'variance', headerName: 'Variance', minWidth: 110, flex: 0.9, type: 'number', headerAlign: 'left', align: 'right', renderCell: (params: any) => <Typography sx={{ fontSize: '14px', textAlign: 'right', width: '100%', color: params.value < 0 ? '#ef4444' : params.value > 0 ? '#10b981' : 'inherit' }}>{Number(params.value).toFixed(2)}</Typography> },
        // { field: 'allocation_percentage', headerName: 'Allocation %', minWidth: 120, flex: 1, type: 'number', headerAlign: 'left', align: 'right', renderCell: (params: any) => <Typography sx={{ fontSize: '14px', textAlign: 'right', width: '100%' }}>{Number(params.value).toFixed(2)}%</Typography> },
        // { field: 'actuals_percentage', headerName: 'Actuals %', minWidth: 110, flex: 1, type: 'number', headerAlign: 'left', align: 'right', renderCell: (params: any) => <Typography sx={{ fontSize: '14px', textAlign: 'right', width: '100%' }}>{Number(params.value).toFixed(2)}%</Typography> },
        // { field: 'portfolio', headerName: 'Portfolio', minWidth: 140, flex: 1, renderCell: (params: any) => <Typography sx={{ fontSize: '14px' }}>{params.value || '-'}</Typography> },
        // { field: 'project_manager', headerName: 'Project Manager', minWidth: 150, flex: 1.2, renderCell: (params: any) => <Typography sx={{ fontSize: '14px' }}>{params.value || '-'}</Typography> },
        // { field: 'project_sponsor', headerName: 'Project Sponsor', minWidth: 150, flex: 1.2, renderCell: (params: any) => <Typography sx={{ fontSize: '14px' }}>{params.value || '-'}</Typography> },
    ], []);

    const allocCapacityCharts: Record<string, React.ReactElement> = {
        allocationCapacityChart: (
            <DashboardWidget
                onClick={() => {}}
                minWidth={320}
                minHeight={380}
                showNoData={allocCapAllZero}
                noDataMessage="No allocation capacity data available"
            >
                {(dimensions: any) => {
                    const chartWidth = Math.max(dimensions.width - 40, 400);
                    const chartHeight = Math.max(dimensions.height - 100, 300);
                    const filtersDisplay = formatFiltersForDisplay(APIFilters);
                    const series = [
                        ...allProjectTypes.map((pt: string, idx: number) => ({
                            type: 'bar' as const,
                            dataKey: pt,
                            label: pt,
                            stack: 'allocation',
                            color: allocCapBarColors[idx % allocCapBarColors.length],
                        })),
                        {
                            type: 'line' as const,
                            dataKey: 'capacity',
                            label: 'Capacity',
                            color: '#F97316',
                            curve: 'linear' as const,
                            showMark: true,
                        },
                    ];
                    return (
                        <Box sx={{ pt: 1, px: 1 }}>
                            <Typography sx={{ fontSize: '18px', fontWeight: 600, color: '#000000DE', mb: 1, display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
                                Weekly Allocation vs Capacity{''}
                                {filtersDisplay && (
                                    <Typography sx={{ fontSize: '14px', fontWeight: 400, color: '#64748B' }}>- {filtersDisplay}</Typography>
                                )}
                            </Typography>
                            <ChartContainer
                                width={chartWidth}
                                height={chartHeight}
                                dataset={allocCapDataset}
                                series={series}
                                xAxis={[{ scaleType: 'band', dataKey: 'week', categoryGapRatio: 0.3, tickLabelStyle: { color: '#475569', fontSize: 12 } }]}
                                yAxis={[{ tickLabelStyle: { color: '#475569' } }]}
                                margin={{ bottom: 70, left: 55, right: 20, top: 20 }}
                            >
                                <BarPlot />
                                <LinePlot />
                                <MarkPlot />
                                <ChartsXAxis />
                                <ChartsYAxis />
                                <ChartsTooltip />
                            </ChartContainer>
                            {/* Custom legend so it's always visible */}
                            <Box
                                sx={{
                                    mt: 1.5,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: 1.5,
                                    alignItems: 'center',
                                    justifyContent: chartWidth < 400 ? 'flex-start' : 'center',
                                }}
                            >
                                {allProjectTypes.map((pt: string, idx: number) => (
                                    <Box
                                        key={pt}
                                        sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                                    >
                                        <Box
                                            sx={{
                                                width: 12,
                                                height: 12,
                                                borderRadius: 0.5,
                                                bgcolor: allocCapBarColors[idx % allocCapBarColors.length],
                                            }}
                                        />
                                        <Typography sx={{ fontSize: 12, color: '#475569' }}>
                                            {pt}
                                        </Typography>
                                    </Box>
                                ))}
                                <Box
                                    sx={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 0.75,
                                    }}
                                >
                                    <Box
                                        sx={{
                                            position: 'relative',
                                            width: 22,
                                            height: 2,
                                            bgcolor: '#F97316',
                                            borderRadius: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                position: 'absolute',
                                                right: -3,
                                                top: -3,
                                                width: 8,
                                                height: 8,
                                                borderRadius: '50%',
                                                bgcolor: '#F97316',
                                            }}
                                        />
                                    </Box>
                                    <Typography sx={{ fontSize: 12, color: '#475569' }}>
                                        Capacity
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    );
                }}
            </DashboardWidget>
        ),
    };

    // Determine which report is active based on type
    const isAllocCap = customReportType === 'allocationCapacity';
    const activeLoading = isAllocCap ? allocationCapacityLoading : loading;
    const activeError = isAllocCap ? allocationCapacityError : error;
    const hasReport = isAllocCap ? weeklyData.length > 0 : !!currentReport;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!hasReport && !activeLoading ? (
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        textAlign: 'center',
                    }}
                >
                    <Typography
                        sx={{
                            fontSize: '15px',
                            fontWeight: 500,
                            color: '#6B7280',
                            mb: 2,
                        }}
                    >
                        Select filters and generate a custom report
                    </Typography>
                    <Typography
                        sx={{
                            fontSize: '13px',
                            color: '#9CA3AF',
                        }}
                    >
                        Configure your filters and click Generate Report to see custom analytics
                    </Typography>
                </Box>
            ) : activeLoading ? (
                <LoadingScreen />
            ) : activeError ? (
                <Box
                    sx={{
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <Typography sx={{ color: '#EF4444', fontSize: '14px' }}>
                        {activeError}
                    </Typography>
                </Box>
            ) : isAllocCap ? (
                /* Allocation Capacity Report */
                <>
                    <Global styles={css`
                        .MuiChartsAxisHighlight-root { fill: none !important; opacity: 0 !important; }
                        .MuiChartsLegend-root { max-width: 100% !important; overflow: hidden !important; font-size: 10px !important; margin: 0 !important; }
                    `} />
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={persistedAllocCapLayouts || defaultAllocCapLayouts}
                        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
                        cols={{ lg: 12, md: 12, sm: 12 }}
                        rowHeight={135}
                        onLayoutChange={handleAllocCapLayoutChange}
                        isDraggable
                        isResizable
                        draggableHandle=".drag-handle"
                        compactType="vertical"
                        style={{ padding: 0 }}
                    >
                        {ALLOCATION_CAPACITY_CHART_SEQUENCE.map(key => (
                            <div key={key}>
                                {allocCapacityCharts[key]}
                            </div>
                        ))}
                    </ResponsiveGridLayout>

                    {/* Allocation Capacity DataGrid */}
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 400,
                            backgroundColor: '#ffffff',
                            borderRadius: isFullscreenGrid ? 0 : '8px',
                            overflow: 'hidden',
                            position: isFullscreenGrid ? 'fixed' : 'relative',
                            top: isFullscreenGrid ? 0 : 'auto',
                            left: isFullscreenGrid ? 0 : 'auto',
                            right: isFullscreenGrid ? 0 : 'auto',
                            bottom: isFullscreenGrid ? 0 : 'auto',
                            zIndex: isFullscreenGrid ? 1300 : 'auto',
                            height: isFullscreenGrid ? '100vh' : 'auto',
                        }}
                    >
                        <StyledDataGrid
                            rows={allocCapRows}
                            columns={allocCapColumns}
                            hideFooter
                            loading={allocationCapacityLoading}
                            pageSizeOptions={[10, 25, 50, 100]}
                            disableRowSelectionOnClick
                            localeText={{ noRowsLabel: 'No data found' }}
                            slots={{ toolbar: ReportBuilderDataGridToolbar }}
                            slotProps={{
                                toolbar: {
                                    isFullscreen: isFullscreenGrid,
                                    onToggleFullscreen: () => setIsFullscreenGrid((prev) => !prev),
                                    GridRowCount: allocCapRows.length,
                                    tab: 'custom',
                                } as any,
                                columnsPanel: { className: 'styleColumnMenu', sx: ColumnManagementStyles },
                                loadingOverlay: { variant: 'skeleton', noRowsVariant: 'skeleton' },
                            }}
                            sx={{
                                height: '100%',
                                '& .MuiDataGrid-virtualScrollerContent': { backgroundColor: '#F7FBFF' },
                                '& .MuiDataGrid-row:hover': { backgroundColor: '#F7FBFF' },
                                '& .MuiDataGrid-cell': { border: '0.5px solid #E5E7EB !important', padding: '8px 16px' },
                                '& .MuiDataGrid-columnHeaders': { position: 'sticky', top: 0, zIndex: 3, backgroundColor: '#F1F6FF' },
                            }}
                        />
                    </Box>
                </>
            ) : currentReport ? (
                /* Percentage Allocation Report */
                <>
                    <Global styles={css`
                        .MuiChartsAxisHighlight-root {
                            fill: none !important;
                            opacity: 0 !important;
                        }
                         .MuiChartsLegend-root {
                            max-width: 100% !important;
                            overflow: hidden !important;
                            font-size: 10px !important;
                            margin: 0 !important;
                        }
                        `} />
                    {/* Bar Chart Section with ResponsiveGridLayout */}
                    <ResponsiveGridLayout
                        className="layout"
                        layouts={persistedLayouts || defaultLayouts}
                        breakpoints={{ lg: 1200, md: 996, sm: 768 }}
                        cols={{ lg: 12, md: 12, sm: 12 }}
                        rowHeight={135}
                        onLayoutChange={handleLayoutChange}
                        isDraggable
                        isResizable
                        draggableHandle=".drag-handle"
                        compactType="vertical"
                        style={{ padding: 0 }}
                    >
                        {CUSTOM_CHART_SEQUENCE.map(key => (
                            <div key={key}>
                                {customCharts[key]}
                            </div>
                        ))}
                    </ResponsiveGridLayout>

                    {/* Data Grid Section */}
                    <Box
                        sx={{
                            flex: 1,
                            minHeight: 400,
                            backgroundColor: '#ffffff',
                            borderRadius: isFullscreenGrid ? 0 : '8px',
                            overflow: 'hidden',
                            position: isFullscreenGrid ? 'fixed' : 'relative',
                            top: isFullscreenGrid ? 0 : 'auto',
                            left: isFullscreenGrid ? 0 : 'auto',
                            right: isFullscreenGrid ? 0 : 'auto',
                            bottom: isFullscreenGrid ? 0 : 'auto',
                            zIndex: isFullscreenGrid ? 1300 : 'auto',
                            height: isFullscreenGrid ? '100vh' : 'auto',
                        }}
                    >
                        <StyledDataGrid
                            rows={rows}
                            columns={columns}
                            hideFooter
                            loading={loading}
                            initialState={{
                                pagination: {
                                    paginationModel: { pageSize: 25, page: 0 },
                                },
                                sorting: {
                                    sortModel: [
                                        {
                                            field: 'resource',
                                            sort: 'asc',
                                        },
                                    ],
                                },
                            }}
                            pageSizeOptions={[10, 25, 50, 100]}
                            disableRowSelectionOnClick
                            localeText={{
                                noRowsLabel: 'No data found',
                            }}
                            slots={{
                                toolbar: ReportBuilderDataGridToolbar,
                            }}
                            slotProps={{
                                toolbar: {
                                    isFullscreen: isFullscreenGrid,
                                    onToggleFullscreen: () => setIsFullscreenGrid((prev) => !prev),
                                    GridRowCount: rows.length,
                                    tab: 'custom',
                                } as any,
                                columnsPanel: {
                                    className: 'styleColumnMenu',
                                    sx: ColumnManagementStyles,
                                },
                                loadingOverlay: {
                                    variant: 'skeleton',
                                    noRowsVariant: 'skeleton',
                                },
                            }}
                            sx={{
                                height: '100%',
                                '& .MuiDataGrid-virtualScrollerContent': {
                                    backgroundColor: '#F7FBFF',
                                },
                                '& .MuiDataGrid-row:hover': {
                                    backgroundColor: '#F7FBFF',
                                },
                                '& .MuiDataGrid-cell': {
                                    border: '0.5px solid #E5E7EB !important',
                                    padding: '8px 16px',
                                },
                                '& .MuiDataGrid-columnHeaders': {
                                    position: 'sticky',
                                    top: 0,
                                    zIndex: 3,
                                    backgroundColor: '#F1F6FF',
                                },
                            }}
                        />
                    </Box>
                </>
            ) : null}
        </Box>
    );
}
