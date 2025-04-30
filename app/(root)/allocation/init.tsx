'use client';
import { useSelector } from 'react-redux';
import Allocation from './allocation';
import HorizontalSplitView from '@/app/components/Shared/SplitView';
import { AppDispatch, RootState } from '@/app/redux/store';
import TopProjectsView from '@/app/components/ResourceAllocation/component/TopProjectsView';
import BottomTeamsView from '@/app/components/ResourceAllocation/component/BottomTeamsView';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAllTeams } from '@/app/redux/actions/fetchTeamsAction';
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import { resetAllocations } from '@/app/redux/reducers/allAllocationsReducer';
import { ApiResponse, Resource, Team } from '@/app/types';
import { generateDateWeekMath } from '@/app/utils/common';

interface TopContentProps {
  startDate: string | null;
  endDate: string | null;
}

interface BottomContentProps {
  startDate: string | null;
  endDate: string | null;
}
const TopContent = ({ startDate, endDate }: TopContentProps) => (
  <TopProjectsView startDate={startDate} endDate={endDate} />
);

const BottomContent = ({ startDate, endDate }: BottomContentProps) => (
  <BottomTeamsView startDate={startDate} endDate={endDate} />
);

export default function AllocationInit() {
  const { splitView, currentView } = useSelector(
    (state: RootState) => state.allocationView
  );
  const { teams } = useSelector((state: RootState) => state.teams);
  const { projects } = useSelector((state: RootState) => state.projects);
  // @ts-ignore
  const { resources }: { resources: ApiResponse<Resource[]> } = useSelector(
    (state: RootState) => state.resources
  );

  const { calendarDate, dataProcessing } = useSelector(
    (state: RootState) => state.allAllocations
  );
  const { startDate, endDate } = calendarDate || {};
  const dispatch: AppDispatch = useDispatch();

  const currentViewStartDate = currentView?.isDynamicRange
    ? generateDateWeekMath('WEEK_MINUS', currentView?.WeekMinus)
    : currentView?.isFixedRange
      ? currentView?.StartDate
      : startDate;

  const currentViewEndDate = currentView?.isDynamicRange
    ? generateDateWeekMath('WEEK_PLUS', currentView?.WeekPlus)
    : currentView?.isFixedRange
      ? currentView?.EndDate
      : endDate;

  useEffect(() => {
    if (!teams?.result?.length) {
      dispatch(fetchAllTeams());
    }
    if (!projects?.result?.length) {
      dispatch(fetchAllProjects());
    }
    if (!resources?.result?.length) {
      dispatch(fetchAllResources());
    }
  }, []);

  useEffect(() => {
    if (
      (teams?.result?.length ?? 0) > 0 &&
      (projects?.result?.length ?? 0) > 0 &&
      (resources?.result?.length ?? 0) > 0
    ) {
      dispatch(resetAllocations());
      dispatch({
        type: 'FETCH_ALL_ALLOCATIONS',
        payload: {
          teams: teams?.result,
          projects: projects?.result,
          resources: resources?.result,
          startDate: currentViewStartDate,
          endDate: currentViewEndDate,
        },
      });
    }
  }, [
    teams,
    projects,
    resources,
    currentView?.isDynamicRange,
    currentView?.isFixedRange,
    currentView?.WeekPlus,
    currentView?.WeekMinus,
    currentView?.StartDate,
    currentView?.EndDate,
  ]);

  return splitView ? (
    <HorizontalSplitView
      top={
        <TopContent
          startDate={currentViewStartDate}
          endDate={currentViewEndDate}
        />
      }
      bottom={
        <BottomContent
          startDate={currentViewStartDate}
          endDate={currentViewEndDate}
        />
      }
      initialTopHeight={300}
      syncHorizontalScroll={true}
      // {...(dataProcessing ? { topCSSHeight: 'var(--height)' } : {})}
    />
  ) : (
    <Allocation startDate={currentViewStartDate} endDate={currentViewEndDate} />
  );
}
