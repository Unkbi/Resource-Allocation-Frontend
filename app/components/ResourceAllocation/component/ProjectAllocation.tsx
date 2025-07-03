'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { Box } from '@mui/material';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { getCellClassName } from '../../AllocationTable/AllocationGridUtils';
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams } from '@mui/x-data-grid';
import EllipsisNameCell from './EllipsisNameCell';
import CustomToolbar from '../../Toolbar/CustomToolbarUpdated';
import NoRowsOverlay from './NoRowsOverlay';
import { AllAllocations } from '@/app/types';
import {
  calculateTotalEffort,
  getAllocationManagerFromPath,
  getProjectTypeColorLine,
  getResourceFromUid,
  getTotalWeeks,
  generateDateWeekMath,
  calculateWeekRanges,
} from '@/app/utils/common';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';
import {
  getCombinedAllocation,
  normalizeRow,
} from '@/app/utils/allocationUtils';
import { setLoading } from '@/app/redux/reducers/allAllocationsReducer';
import Typography from '@mui/material/Typography';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import EditIcon from '@mui/icons-material/Edit';
import HistoryIcon from '@mui/icons-material/History';
import { styled } from '@mui/material/styles';
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  COMPANY_DEFAULT_VIEW,
  setSplitView,
  setSplitViewCurrentProject,
  updateCurrentView,
} from '@/app/redux/reducers/allocationViewReducer';
import { useRouter } from 'next/navigation';

interface ProjectAllocationProps {
  startDate: string | null;
  endDate: string | null;
}
interface Resource {
  Id: string;
  Email: string;
  PhoneNumber: string;
  Department: string;
  [key: string]: any;
}

const StyledMenu = styled(Menu)(({ theme }) => ({
  '& .MuiPaper-root': {
    borderRadius: 4,
    boxShadow: '0px 4px 20px rgba(0,0,0,0.08)',
    // width: '150px',
  },
}));

const StyledMenuItem = styled(MenuItem)(({ theme }) => ({
  '&:hover': {
    backgroundColor: 'rgba(20, 43, 81, 0.70)',
    '& .MuiTypography-root': {
      color: '#FFFFFF',
    },
    '& .MuiListItemIcon-root': {
      color: '#FFFFFF',
    },
  },
  '& .MuiTypography-root': {
    color: '#1C2D5F',
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: ' 18px',
  },
  '& .MuiListItemIcon-root': {
    minWidth: 32,
    color: '#1C2D5F',
  },
}));

interface SplitViewParams {
  value: string;
}

interface DateRange {
  start?: any;
  end?: any;
}

export default function ProjectAllocation({
  startDate,
  endDate,
}: ProjectAllocationProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const router = useRouter();
  const { allAllocations, loading, dataProcessing } = useSelector(
    (state: RootState) => state.allAllocations
  );
  const _resources = useSelector(
    (state: RootState) => state.resources.resources
  ) as {
    result?: Resource[];
    loading?: boolean;
    error?: string;
  };
  const dispatch: AppDispatch = useDispatch();
  const { projects } = useSelector((state: RootState) => state.projects);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuProjectName, setMenuProjectName] = useState<string>('');
  const allResources = _resources.result || [];
  const {
    setRows,
    ready,
    getAllRows: getAllProjectViewRows,
  } = useAllocationGrid('projectAllocation');
  const { getAllRows: getAllTeamViewRows } =
    useAllocationGrid('teamAllocation');

  useEffect(() => {
    if (ready) {
      let filteredResources;
      if (!loading && getAllTeamViewRows().length > 0) {
        filteredResources = removeResourcesWithNoProjects(
          (getAllTeamViewRows() as AllAllocations[]) || []
        );
        setRows(
          removeResourcesWithNoProjects(
            getAllTeamViewRows() as AllAllocations[]
          )
        );
      } else if (loading && allAllocations) {
        filteredResources = removeResourcesWithNoProjects(allAllocations || []);
        dispatch(setLoading(false));
      }

      const formattedResources = filteredResources?.map(allocation => ({
        ...allocation,
        totalEffort: calculateTotalEffort(normalizeRow(allocation)),
        hasAllocation: calculateTotalEffort(normalizeRow(allocation)) > 0,
        teamAllocationManager: getAllocationManagerFromPath(
          allocation?.teamAllocationManager,
          _resources?.result || []
        )?.FullName,
      }));

      setRows(formattedResources || []);
    }
  }, [ready && allAllocations]);

  const handleAddClick = (params: GridCellParams) => {
    dispatch(
      openDialog({
        title: 'Update Allocation',
        submitButtonText: 'Update',
        cancelButtonText: 'Cancel',
        formType: 'add_allocation',
        initialData: {
          Project: params.value,
        },
      })
    );
  };

  const handleEditProject = (params: SplitViewParams) => {
    const data = modifyData(
      (projects?.result ?? []).filter(project => project.Name === params.value)
    );
    dispatch(
      openDialog({
        title: 'Edit Project',
        submitButtonText: 'Update',
        cancelButtonText: 'Cancel',
        formType: 'edit_project',
        initialData: data?.[0] || {},
      })
    );
  };

  const handleOpenSplitView = (params: SplitViewParams) => {
    const data = modifyData(
      (projects?.result ?? []).filter(project => project.Name === params.value)
    );
    dispatch(setSplitView(true));
    dispatch(setSplitViewCurrentProject(data?.[0] || {}));
    const { StartDate, EndDate } = data?.[0] || {};
    const currentDate = new Date();

    const getDateRange = (start?: any, end?: any): [any, any] => {
      if (start && end) {
        const weeks = getTotalWeeks(start, end);
        return weeks > 52
          ? [start, generateDateWeekMath('WEEK_PLUS', 51, new Date(start))]
          : [start, end];
      }

      if (!start && end)
        return [generateDateWeekMath('WEEK_MINUS', 20, new Date(end)), end];
      if (start && !end)
        return [start, generateDateWeekMath('WEEK_PLUS', 20, new Date(start))];

      return [
        generateDateWeekMath('WEEK_MINUS', 1, currentDate),
        generateDateWeekMath('WEEK_PLUS', 19, currentDate),
      ];
    };

    const [startRange, endRange] = getDateRange(StartDate, EndDate);

    if (startRange && endRange) {
      const { weekMinus, weekPlus } = calculateWeekRanges(
        startRange,
        endRange,
        currentDate
      );
      dispatch(
        updateCurrentView({
          ...COMPANY_DEFAULT_VIEW,
          isDynamicRange: false,
          isFixedRange: true,
          StartDate: startDate,
          EndDate: endDate,
          WeekPlus: weekPlus,
          WeekMinus: weekMinus,
        })
      );
    }
    router.replace('/allocation');
  };

  const handleOpenHistory = (params: SplitViewParams) => {
    const data = modifyData(
      (projects?.result ?? []).filter(project => project.Name === params.value)
    );

      dispatch(
        openDialog({
          title: 'Allocation History',
          cancelButtonText: 'View All History',
          formType: 'open_history',
          initialData:{
            Resource: null,
            Project: data[0].Id,
            StartDate: startDate,
            EndDate: endDate,
          },
        })
      );
    };


  const getFirstChild = (params: GridCellParams) => {
    const { rowNode, api } = params;
    const isGridTreeNode = 'children' in rowNode; // Required for Typescript
    if (isGridTreeNode && rowNode.children && rowNode.children.length > 0) {
      const firstChildId = rowNode.children[0];
      const firstChildRow = api.getRow(firstChildId);
      return firstChildRow;
    }
    return null;
  };

  const getResource = (params: GridCellParams): Resource | null => {
    const { rowNode } = params;
    const isGridTreeNode = 'children' in rowNode;
    if (isGridTreeNode && rowNode.children) return null;
    const resourceId = params.row.resourceId;
    if (_resources.result && resourceId) {
      return _resources.result.find(res => res.Id === resourceId) || null;
    }
    return null;
  };

  const modifyData = (data: any[]) => {
    if (data) {
      return data.map(item => {
        return {
          ...item,
          id: item.Id,
          ProjectSponsor: getResourceFromUid(item.ProjectSponsor, allResources)
            ?.FullName,
          ProjectManager: getResourceFromUid(item.ProjectManager, allResources)
            ?.FullName,
        };
      });
    }
    return [];
  };

  const projectColumnConfig = [
    {
      field: 'project',
      headerName: 'Project Name',
      width: 200,
      headerClassName: 'prime-header',
      // cellClassName: getCellClassName,
      cellClassName: () => 'project-view-projectName',
      primaryColumn: true,
      filterable: true,
      isEditable: false,
      renderCell: (params: GridCellParams) => {
        const { rowNode, api, value = '' } = params;
        const isGridTreeNode = 'children' in rowNode; // Required for Typescript
        const row = api.getRow(rowNode.id);
        const projectType = projects?.result?.find(
          project => project.Name === value
        )?.Type;

        const open = Boolean(anchorEl);

        const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
          event.stopPropagation();
          setAnchorEl(event.currentTarget);
        };

        const handleMenuClose = () => {
          setAnchorEl(null);
        };

        if (isGridTreeNode && rowNode.children) {
          const resource_count = rowNode?.children?.length || null;
          return (
            <>
              <EllipsisNameCell
                value={value as string}
                resourceCount={resource_count}
                onAddClick={() => handleAddClick(params)}
                showAddIcon={true}
                leftBorderColor={getProjectTypeColorLine(projectType || '')}
              />
              <IconButton
                size="small"
                disableRipple
                disableFocusRipple
                onClick={e => {
                  e.stopPropagation();
                  setMenuProjectName(params.value as string);
                  setAnchorEl(e.currentTarget);
                }}
                sx={{
                  mr: -1.5,
                  padding: '0px',
                  backgroundColor: 'transparent',
                  '&:hover': {
                    backgroundColor: 'transparent',
                  },
                }}
              >
                <MoreVertIcon sx={{ fontSize: 22 }} />
              </IconButton>
            </>
          );
        }
      },
    },
    {
      field: 'projectSponsor',
      headerName: 'Project Sponsor',
      width: 148,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectSponsor ?? 'N/A'} />
        ) : null;
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 190,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const email = resource?.Email || '';
        return <EllipsisNameCell value={email} />;
      },
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      width: 170,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const PhoneNumber = resource?.PhoneNumber || '';
        return <EllipsisNameCell value={PhoneNumber} />;
      },
    },
    {
      field: 'department',
      headerName: 'Organization',
      width: 170,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const Department = resource?.Department || '';
        return <EllipsisNameCell value={Department} />;
      },
    },
    {
      field: 'workLocation',
      headerName: 'Resource Work Location',
      width: 200,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const WorkLocation = resource?.WorkLocation || '';
        return <EllipsisNameCell value={WorkLocation} />;
      },
    },
    {
      field: 'resourceLocationCategory',
      headerName: 'Resource Location Category',
      width: 230,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const LocationCategory = resource?.LocationCategory || '';
        return <EllipsisNameCell value={LocationCategory} />;
      },
    },
    {
      field: 'resourceType',
      headerName: 'Resource Type',
      width: 170,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const Type = resource?.Type || '';
        return <EllipsisNameCell value={Type} />;
      },
    },
    {
      field: 'resourceStatus',
      headerName: 'Resource Status',
      width: 170,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const Status = resource?.Status || '';
        return <EllipsisNameCell value={Status} />;
      },
    },
    {
      field: 'hrLevel',
      headerName: 'HRLevel',
      width: 170,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const HRLevel = resource?.HRLevel || '';
        return <EllipsisNameCell value={HRLevel} />;
      },
    },
    {
      field: 'role',
      headerName: 'Resource Role',
      width: 170,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const Role = resource?.Role || '';
        return <EllipsisNameCell value={Role} />;
      },
    },
    {
      field: 'resourceStartDate',
      headerName: 'Resource Start Date',
      width: 170,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const StartDate = resource?.StartDate || '';
        return <EllipsisNameCell value={StartDate} />;
      },
    },
    {
      field: 'resourceEndDate',
      headerName: 'Resource End Date',
      width: 170,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const EndDate = resource?.EndDate || '';
        return <EllipsisNameCell value={EndDate} />;
      },
    },
    {
      field: 'averageWeeklyHours',
      headerName: 'Average Weekly Hours',
      width: 190,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const AverageWeeklyHours = resource?.AverageWeeklyHours || '';
        return <EllipsisNameCell value={AverageWeeklyHours} />;
      },
    },
    {
      field: 'contractorHourlyRate',
      headerName: 'Contractor Hourly Rate',
      width: 200,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const ContractorHourlyRate = resource?.ContractorHourlyRate || '';
        return <EllipsisNameCell value={ContractorHourlyRate} />;
      },
    },
    {
      field: 'contractorHourlyRateCurrency',
      headerName: 'Contractor Hourly Rate Currency',
      width: 260,
      isEditable: 'false',
      sortable: 'false',
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const ContractorHourlyRateCurrency =
          resource?.ContractorHourlyRateCurrency || '';
        return <EllipsisNameCell value={ContractorHourlyRateCurrency} />;
      },
    },
    {
      field: 'projectManager',
      headerName: 'Project Manager',
      width: 148,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectManager ?? 'N/A'} />
        ) : null;
      },
    },
    {
      field: 'projectStatus',
      headerName: 'Project Status',
      width: 130,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectStatus ?? 'N/A'} />
        ) : null;
      },
    },
    {
      field: 'projectLocation',
      headerName: 'Project Location',
      width: 150,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectLocation ?? 'N/A'} />
        ) : null;
      },
    },
    {
      field: 'projectType',
      headerName: 'Project Type',
      width: 130,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectType ?? 'N/A'} />
        ) : null;
      },
    },
    {
      field: 'projectOvertimeAllowed',
      headerName: 'Overtime?',
      width: 110, // min-width without eliding.
      type: 'boolean',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell
            value={firstChild?.projectOvertimeAllowed ? 'Yes' : 'No'}
          />
        ) : null;
      },
    },
    {
      field: 'projectCost',
      headerName: 'Project Budget',
      width: 150,
      type: 'string ',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        const cost = firstChild?.projectCost;
        return firstChild ? (
          <EllipsisNameCell value={cost ? `$ ${cost}` : ''} />
        ) : null;
      },
    },
    {
      field: 'projectCurrency',
      headerName: 'Project Currency',
      width: 160,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectCurrency ?? 'N/A'} />
        ) : null;
      },
    },
    {
      field: 'projectStartDate',
      headerName: 'Project Start Date',
      width: 160,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectStartDate ?? 'N/A'} />
        ) : null;
      },
    },
    {
      field: 'projectEndDate',
      headerName: 'Project End Date',
      width: 150,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectEndDate ?? 'N/A'} />
        ) : null;
      },
    },
    {
      field: 'totalEffort',
      headerName: 'Total Effort',
      width: 106,
      type: 'number',
      sortable: false,
      cellClassName: getCellClassName,
      headerClassName: 'secondary-header',
      // cellClassName: 'secondary-cell',
      headerAlign: 'left',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const value = Number(params.value);
        const formattedValue =
          !isNaN(value) && value !== null
            ? (Math.round(value * 10) / 10).toFixed(1) // Ensures 0 → "0.0" and 1 → "1.0"
            : null;
        return <EllipsisNameCell value={formattedValue} />;
      },
    },
  ];

  const removeResourcesWithNoProjects = (allocations: AllAllocations[]) => {
    return allocations.filter(allocation => allocation.project);
  };

  return (
    <>
      <Box sx={{ height: 'calc(100vh - 54px)', width: '100%' }}>
        <AllocationGrid
          groupBy="project"
          columns={projectColumnConfig}
          startDate={startDate}
          mode="project"
          endDate={endDate}
          selectedTeam={selectedTeam}
          toolbarComponent={CustomToolbar}
          setSelectedTeam={setSelectedTeam}
          initialState={{
            columns: {
              columnVisibilityModel: {
                project: false,
                projectCost: false,
                projectCurrency: false,
                projectEndDate: false,
                projectLocation: false,
                projectManager: false,
                projectOvertimeAllowed: false,
                projectSponsor: false,
                projectStartDate: false,
                projectStatus: false,
                projectType: false,
                totalEffort: true,
                resource: true, // Always be true
                __row_group_by_columns_group__: true, // Always be true
                email: false,
                phoneNumber: false,
                department: false,
                workLocation: false,
                resourceLocationCategory: false,
                resourceType: false,
                resourceStatus: false,
                hrLevel: false,
                role: false,
                resourceStartDate: false,
                resourceEndDate: false,
                averageWeeklyHours: false,
                contractorHourlyRate: false,
                contractorHourlyRateCurrency: false,
              },
            },
          }}
          NoRowsOverlay={NoRowsOverlay}
          loading={dataProcessing}
          viewId="projectAllocation"
        />
      </Box>
      <StyledMenu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <StyledMenuItem
          onClick={() => {
            handleOpenSplitView({ value: menuProjectName });
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <PersonAddIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="body2">Find and Add Resource</Typography>}
          />
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => {
            handleEditProject({ value: menuProjectName });
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="body2">Edit Project</Typography>}
          />
        </StyledMenuItem>
        <StyledMenuItem
          onClick={() => {
            handleOpenHistory({ value: menuProjectName });
            setAnchorEl(null);
          }}
        >
          <ListItemIcon>
            <HistoryIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography variant="body2">History</Typography>}
          />
        </StyledMenuItem>
      </StyledMenu>
    </>
  );
}
