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
import DashboardWidget from '../DashboardWidget';
import { Responsive, WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';
import { Global, css } from '@emotion/react';
import { formatDate } from '@/app/utils/reportDataFormatter';
import { navigateToReport } from '@/app/utils/reportNavigation';
import { useRouter } from 'next/navigation';

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
}

export default function CustomTab({ showActuals, APIFilters }: CustomTabProps) {
    const router = useRouter();
    const { currentReport, loading, error } = useSelector(
        (state: RootState) => state.customReport
    );
    const { projectTypeGroups, projectTypes } = useSelector((state: RootState) => state.allSettings);
    const { organisations } = useSelector((state: RootState) => state.organisations);
    const { teams } = useSelector((state: RootState) => state.teams);
    const {projects} = useSelector((state: RootState) => state.projects);
    const [isFullscreenGrid, setIsFullscreenGrid] = useState(false);
    const [persistedLayouts, setPersistedLayouts] = useState<any>(null);
    const suppressSaveRef = useRef(true);

    const STORAGE_KEY = 'custom_report_chart_layout';

    // Generate default layouts
    const defaultLayouts = useMemo(
        () => generateLayouts(CUSTOM_CHART_SEQUENCE),
        []
    );

    // Load persisted layouts from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                setPersistedLayouts(parsed);
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

    const handleClick = (event: React.MouseEvent, params: any) => {
        event.stopPropagation();

        const projectId = params.row?.id;
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
                reportType: 'resourceProjectPeriod',
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
    };

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
                field: 'plan',
                headerName: 'Plan',
                minWidth: 100,
                flex: 0.8,
                type: 'number',
                headerAlign: 'left',
                align: 'right',
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
    }, []);

    // Map grid data from API structure
    const rows = useMemo(() => {
        if (!currentReport?.GridData || !Array.isArray(currentReport.GridData)) {
            return [];
        }

        return currentReport.GridData.map((item: any, index: number) => ({
            id: item.Project?.Id || `row-${index}`,
            reporting_project_type: item.Metrics?.ProjectBucket || '',
            project: item.Project?.Name || '',
            project_type_group: item.ProjectTypeGroup?.Name || '',
            project_type: item.ProjectType?.Name || '',
            plan: item.Metrics?.TotalAllocation || 0,
            actuals: item.Metrics?.TotalActuals || 0,
            actuals_variance: item.Metrics?.Variance || 0,
            period: formatDate(item.Metrics?.Period) || '',
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

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {!currentReport && !loading ? (
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
            ) : loading ? (
                <LoadingScreen />
            ) : error ? (
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
                        {error}
                    </Typography>
                </Box>
            ) : currentReport ? (
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
                        rowHeight={130}
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
