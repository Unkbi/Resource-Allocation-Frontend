'use client';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import AllocationGrid from '@/app/components/AllocationTable/AllocationGrid';
import { Box } from '@mui/material';
import { openDialog } from '@/app/redux/reducers/dialogReducer';
import { getCellClassName } from '../../AllocationTable/AllocationGridUtils';
import { AppDispatch, RootState } from '@/app/redux/store';
import { GridCellParams, GridSortCellParams } from '@mui/x-data-grid';
import EllipsisNameCell from './EllipsisNameCell';
import CustomToolbar from '../../Toolbar/CustomAllocationToolbar';
import NoRowsOverlay from './NoRowsOverlay';
import { AllAllocations, Location } from '@/app/types';
import {
  getAllocationManagerFromPath,
  getResourceFromUid,
  getTotalWeeks,
  generateDateWeekMath,
  calculateWeekRanges,
  formatDateMMDDYYYY,
} from '@/app/utils/common';
import { useAllocationGrid } from '@/app/hooks/useAllocationGrid';
import {
  getFirstChild,
  injectBlankProjectRows,
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
import { PORTFOLIO_DISPLAY_NAME } from '@/app/constants/constants';
import { useAllGridRowsByView } from '@/app/hooks/useAllGridRowsByView';
import { CrudPermissions, withRBAC } from '../../HOC/withRBAC';
import { FETCH_PROJECT_TYPES } from '@/app/redux/actions/allSettingsActions';

interface ProjectAllocationProps {
  startDate: string | null;
  endDate: string | null;
  permissions: Record<string, CrudPermissions>;
  loadingPermissions: boolean;
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

function ProjectAllocation({
  startDate,
  endDate,
  permissions,
  loadingPermissions,
}: ProjectAllocationProps) {
  const [selectedTeam, setSelectedTeam] = useState('');
  const router = useRouter();
  const { allAllocations, loading, dataProcessing } = useSelector(
    (state: RootState) => state.allAllocations
  );
  const _resources = useSelector(
    (state: RootState) => state.resources.resources
  );
  const { location } = useSelector((state: RootState) => state.allSettings);
  const { projectTypes } = useSelector((state: RootState) => state.allSettings);
  const dispatch: AppDispatch = useDispatch();
  const { projects } = useSelector((state: RootState) => state.projects);
  const { portfolios } = useSelector((state: RootState) => state.portfolios);
  const { scalarSettings } = useSelector(
    (state: RootState) => state.allSettings
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [menuProjectName, setMenuProjectName] = useState<string>('');
  const allResources = _resources || [];
  const {
    setRows,
    ready,
    getAllRows: getAllProjectViewRows,
  } = useAllocationGrid('projectAllocation');
  const { getAllRows: getAllTeamViewRows } =
    useAllocationGrid('teamAllocation');
  const { showActuals } = useSelector(
    (state: RootState) => state.allocationView
  );
  const { getAllRowsForView, setRowsForView } = useAllGridRowsByView();
  const { allResourcesDetail } = useSelector(
    (state: RootState) => state.allResourcesDetail
  );

  useEffect(() => {
    if (projectTypes.length === 0) {
      dispatch({ type: FETCH_PROJECT_TYPES });
    }
  }, []);

  useEffect(() => {
    if (loadingPermissions) return;
    if (permissions['Allocation'].r && ready) {
      let filteredResources;
      const allTempRows = getAllRowsForView('projectAllocationtemp');
      if (!loading && allTempRows?.length > 0) {
        setRows(
          injectBlankProjectRows(
            allTempRows as AllAllocations[],
            projects || [],
            portfolios || [],
            startDate || '',
            endDate || ''
          ) || []
        );
        setRowsForView('projectAllocationtemp', []);
      } else {
        const teamsViewRows = getAllTeamViewRows();
        if (!loading && teamsViewRows.length > 0) {
          filteredResources = removeResourcesWithNoProjects(
            (teamsViewRows as AllAllocations[]) || []
          );
          setRows(
            removeResourcesWithNoProjects(
              getAllTeamViewRows() as AllAllocations[]
            )
          );
        } else if (allAllocations) {
          filteredResources = removeResourcesWithNoProjects(
            allAllocations || []
          );
          dispatch(setLoading(false));
        }

        const formattedResources = injectBlankProjectRows(
          filteredResources as AllAllocations[],
          projects || [],
          portfolios || [],
          startDate || '',
          endDate || ''
        )?.map(allocation => ({
          ...allocation,
          hasAllocation: (allocation?.totalEffort ?? 0) > 0,
          teamAllocationManager: getAllocationManagerFromPath(
            allocation?.teamAllocationManager,
            _resources || []
          )?.FullName,
        }));
        setRows(formattedResources || []);
      }
      // Sahadev : Reset temp View for Teams Related Views, Currently Team, Organisation, Resource and Flat Views.
      setRowsForView('teamAllocationtemp', []);
    }
  }, [ready && allAllocations, loadingPermissions]);

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
      (projects ?? []).filter(project => project.Name === params.value)
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
      (projects ?? []).filter(project => project.Name === params.value)
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
      (projects ?? []).filter(project => project.Name === params.value)
    );

    dispatch(
      openDialog({
        title: 'Allocation History',
        cancelButtonText: 'View All History',
        formType: 'open_history',
        initialData: {
          Resource: null,
          Project: data[0].Id,
          StartDate: startDate,
          EndDate: endDate,
        },
      })
    );
  };

  const getResource = (params: GridCellParams): Resource | null => {
    const { rowNode } = params;
    const isGridTreeNode = 'children' in rowNode;
    if (isGridTreeNode && rowNode.children) return null;
    const resourceId = params.row.resourceId;
    if (_resources && resourceId) {
      return (
        (_resources as Resource[]).find(res => res.Id === resourceId) || null
      );
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
          Type: projectTypes.find(pt => pt.Id === item.Type)?.Name || '',
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
      cellClassName: () => 'project-view-projectName',
      primaryColumn: true,
      filterable: true,
      isEditable: false,
      renderCell: (params: GridCellParams) => {
        const { rowNode, api, value = '' } = params;
        const isGridTreeNode = 'children' in rowNode; // Required for Typescript
        if (isGridTreeNode) {
          const row = api.getRow(rowNode?.children[0]);

          const open = Boolean(anchorEl);

          const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
            event.stopPropagation();
            setAnchorEl(event.currentTarget);
          };

          const handleMenuClose = () => {
            setAnchorEl(null);
          };

          if (isGridTreeNode && rowNode.children) {
            // Filter Empty Rows.
            const resource_count = rowNode?.children.filter(
              (child: any) => !child.includes('project/')
            )?.length;
            return (
              <>
                <EllipsisNameCell
                  value={value as string}
                  resourceCount={resource_count}
                  onAddClick={() => handleAddClick(params)}
                  showAddIcon={true}
                  leftBorderColor={row?.projectTypeColor}
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
        }
      },
    },
    {
      field: 'portfolioName',
      headerName: scalarSettings?.Portfolio_Name || PORTFOLIO_DISPLAY_NAME,
      width: 148,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any
      ) => {
        const raw1 = getFirstChild(p1)?.portfolioName;
        const raw2 = getFirstChild(p2)?.portfolioName;
        const s1 = raw1 && raw1 !== 'zzzzz' ? raw1.toLowerCase().trim() : '';
        const s2 = raw2 && raw2 !== 'zzzzz' ? raw2.toLowerCase().trim() : '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell
            value={
              firstChild.portfolioName === 'zzzzz'
                ? ''
                : (firstChild.portfolioName ?? '')
            }
          />
        ) : null;
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
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any
      ) => {
        const s1 =
          getFirstChild(p1)?.projectSponsor?.toLowerCase().trim() || '';
        const s2 =
          getFirstChild(p2)?.projectSponsor?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectSponsor || ''} />
        ) : null;
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      width: 190,
      isEditable: 'false',
      sortable: true,
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
      sortable: true,
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
      field: 'organisationName',
      headerName: 'Organization Name',
      width: 170,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const resourceDetails = allResourcesDetail?.find(
          (item: any) => item.Resource?.Id === resource?.Id
        );
        const organizationName = resourceDetails?.Organization?.Name || '';

        return <EllipsisNameCell value={organizationName || ''} />;
      },
    },
    {
      field: 'workLocation',
      headerName: 'Resource Work Location',
      width: 200,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const locationDetails = location?.find(
          (l: Location) => l.Id === resource?.WorkLocation
        );
        return <EllipsisNameCell value={locationDetails?.Name || ''} />;
      },
    },
    {
      field: 'resourceLocationCategory',
      headerName: 'Resource Location Category',
      width: 230,
      isEditable: 'false',
      sortable: true,
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
      sortable: true,
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
      sortable: true,
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
      sortable: true,
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
      headerName: 'Title',
      width: 170,
      isEditable: 'false',
      sortable: true,
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
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const StartDate = resource?.StartDate || '';
        return <EllipsisNameCell value={formatDateMMDDYYYY(StartDate)} />;
      },
    },
    {
      field: 'resourceEndDate',
      headerName: 'Resource End Date',
      width: 170,
      isEditable: 'false',
      sortable: true,
      type: 'string',
      primaryColumn: true,
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const EndDate = resource?.EndDate || '';
        return <EllipsisNameCell value={formatDateMMDDYYYY(EndDate)} />;
      },
    },
    {
      field: 'averageWeeklyHours',
      headerName: 'Average Weekly Hours',
      width: 190,
      isEditable: 'false',
      sortable: true,
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
      sortable: true,
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
      sortable: true,
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
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any
      ) => {
        const s1 =
          getFirstChild(p1)?.projectManager?.toLowerCase().trim() || '';
        const s2 =
          getFirstChild(p2)?.projectManager?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectManager || ''} />
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
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any
      ) => {
        const s1 = getFirstChild(p1)?.projectStatus?.toLowerCase().trim() || '';
        const s2 = getFirstChild(p2)?.projectStatus?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectStatus || ''} />
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
      sortable: true,
      isEditable: false,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any
      ) => {
        const s1 =
          getFirstChild(p1)?.projectLocation?.toLowerCase().trim() || '';
        const s2 =
          getFirstChild(p2)?.projectLocation?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectLocation || ''} />
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
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any
      ) => {
        const s1 = getFirstChild(p1)?.projectType?.toLowerCase().trim() || '';
        const s2 = getFirstChild(p2)?.projectType?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectType || ''} />
        ) : null;
      },
    },
    {
      field: 'projectTypeGroup',
      headerName: 'Project Type Group',
      width: 150,
      type: 'string',
      headerClassName: 'secondary-header',
      cellClassName: 'common-NonEditableCells',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any
      ) => {
        const s1 =
          getFirstChild(p1)?.projectTypeGroup?.toLowerCase().trim() || '';
        const s2 =
          getFirstChild(p2)?.projectTypeGroup?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectTypeGroup || ''} />
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
      sortable: true,
      isEditable: false,
      primaryColumn: true,
      sortComparator: (
        _v1: boolean | null,
        _v2: boolean | null,
        p1: any,
        p2: any
      ) => {
        const v1 = getFirstChild(p1)?.projectOvertimeAllowed;
        const v2 = getFirstChild(p2)?.projectOvertimeAllowed;
        if (v1 == null && v2 == null) return 0;
        if (v1 == null) return 1;
        if (v2 == null) return -1;
        return Number(v1) - Number(v2);
      },
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
      sortable: true,
      isEditable: false,
      primaryColumn: true,
      sortComparator: (
        _v1: number | null,
        _v2: number | null,
        p1: any,
        p2: any
      ) => {
        const n1 = Number(getFirstChild(p1)?.projectCost);
        const n2 = Number(getFirstChild(p2)?.projectCost);
        const isEmpty1 = Number.isNaN(n1);
        const isEmpty2 = Number.isNaN(n2);
        if (isEmpty1 && isEmpty2) return 0;
        if (isEmpty1) return 1;
        if (isEmpty2) return -1;
        return n1 - n2;
      },
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
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any
      ) => {
        const s1 =
          getFirstChild(p1)?.projectCurrency?.toLowerCase().trim() || '';
        const s2 =
          getFirstChild(p2)?.projectCurrency?.toLowerCase().trim() || '';
        if (!s1 && !s2) return 0;
        if (!s1) return 1;
        if (!s2) return -1;
        return s1.localeCompare(s2);
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell value={firstChild.projectCurrency || ''} />
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
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any
      ) => {
        const d1 = getFirstChild(p1)?.projectStartDate;
        const d2 = getFirstChild(p2)?.projectStartDate;
        const t1 = d1 ? new Date(d1).getTime() : NaN;
        const t2 = d2 ? new Date(d2).getTime() : NaN;
        if (Number.isNaN(t1) && Number.isNaN(t2)) return 0;
        if (Number.isNaN(t1)) return 1;
        if (Number.isNaN(t2)) return -1;
        return t1 - t2;
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell
            value={formatDateMMDDYYYY(firstChild.projectStartDate) || ''}
          />
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
      sortable: true,
      primaryColumn: true,
      sortComparator: (
        _v1: string | null,
        _v2: string | null,
        p1: any,
        p2: any
      ) => {
        const d1 = getFirstChild(p1)?.projectEndDate;
        const d2 = getFirstChild(p2)?.projectEndDate;
        const t1 = d1 ? new Date(d1).getTime() : NaN;
        const t2 = d2 ? new Date(d2).getTime() : NaN;
        if (Number.isNaN(t1) && Number.isNaN(t2)) return 0;
        if (Number.isNaN(t1)) return 1;
        if (Number.isNaN(t2)) return -1;
        return t1 - t2;
      },
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return firstChild ? (
          <EllipsisNameCell
            value={formatDateMMDDYYYY(firstChild.projectEndDate) || ''}
          />
        ) : null;
      },
    },
    {
      field: 'totalEffort',
      headerName: 'Total Effort',
      width: 122,
      type: 'number',
      sortable: true,
      cellClassName: getCellClassName,
      headerClassName: 'totals-header',
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
    {
      field: 'totalAllocationsTillDate',
      headerName: 'Effort Till Date',
      width: 122,
      type: 'number',
      sortable: true,
      cellClassName: getCellClassName,
      headerClassName: 'totals-header',
      headerAlign: 'left',
      primaryColumn: true,
      valueGetter: (params: any) => {
        const allocations = params.row.allocations as any[];
        const total = allocations.reduce((sum, allocation) => {
          const effort = Number(allocation.Effort);
          return sum + (isNaN(effort) ? 0 : effort);
        }, 0);
        return total;
      },
      renderCell: (params: GridCellParams) => {
        const value = Number(params.value);
        const formattedValue =
          !isNaN(value) && value !== null
            ? (Math.round(value * 10) / 10).toFixed(1) // Ensures 0 → "0.0" and 1 → "1.0"
            : null;
        return <EllipsisNameCell value={formattedValue} />;
      },
    }, 
    {
      field: 'department',
      headerName: 'Department',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        return <EllipsisNameCell value={resource?.Department || ''} />;
      },
    },
    {
      field: 'manager',
      headerName: 'Manager', // Resource page manager detail
      width: 130,
      type: 'string',
      isEditable: false,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const resourceDetails = allResourcesDetail?.find(
          (item: any) => item.Resource?.Id === resource?.Manager
        );
        const Manager = resourceDetails?.Resource?.FullName || '';
        return resource ? <EllipsisNameCell value={Manager || ''} /> : null;
      },
    },
    {
      field: 'organisationStatus',
      headerName: 'Organisation Status',
      width: 160,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const resource = getResource(params);
        const resourceDetails = allResourcesDetail?.find(
          (item: any) => item.Resource?.Id === resource?.Id
        );
        const organizationStatus = resourceDetails?.Organization?.Status || '';
        return resource ? (
          <EllipsisNameCell value={organizationStatus || ''} />
        ) : null;
      },
    },
    {
      field: 'portfolioDescription',
      headerName: 'Portfolio Description',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return (
          <EllipsisNameCell value={firstChild?.portfolioDescription || ''} />
        );
      },
    },
    {
      field: 'portfolioStatus',
      headerName: 'Portfolio Status',
      width: 180,
      type: 'string',
      isEditable: 'false',
      sortable: true,
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const firstChild = getFirstChild(params);
        return <EllipsisNameCell value={firstChild?.portfolioStatus || ''} />;
      },
    },
    {
      field: 'teamAllocationManager',
      headerName: 'Allocation Manager',
      width: 170,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
    },
    {
      field: 'teamStatus',
      headerName: 'Team Status',
      width: 130,
      type: 'string',
      isEditable: false,
      sortable: true,
      primaryColumn: true,
    },
    {
      field: 'teams',
      headerName: 'Team Name',
      width: 201,
      headerClassName: 'prime-header',
      cellClassName: 'prime-cell',
      primaryColumn: true,
      renderCell: (params: GridCellParams) => {
        const { rowNode, api, value = '' } = params;
        return <EllipsisNameCell value={value as string} />;
      },
    },
  ];

  const removeResourcesWithNoProjects = (allocations: AllAllocations[]) => {
    return allocations.filter(allocation => allocation.project);
  };

  return (
    <>
      <Box sx={{ height: 'calc(100vh - 31px)', width: '100%' }}>
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
                portfolioName: false,
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
                projectTypeGroup: false,
                totalEffort: true,
                totalAllocationsTillDate:true,
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
                organisationName: false,
                manager: false,
                organisationStatus: false,
                portfolioDescription: false,
                portfolioStatus: false,
                teamAllocationManager: false,
                teamStatus: false,
                teams: false,
              },
            },
          }}
          NoRowsOverlay={NoRowsOverlay}
          loading={dataProcessing}
          viewId="projectAllocation"
          showActuals={showActuals}
          rowGroupingColumnMode={'single'}
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
            primary={
              <Typography variant="body2">Find and Add Resource</Typography>
            }
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

export default withRBAC(ProjectAllocation, ['Allocation']);
