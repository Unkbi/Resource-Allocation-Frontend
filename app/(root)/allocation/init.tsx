'use client';
import { useSelector } from 'react-redux';
import Allocation from './allocation';
import HorizontalSplitView from '@/app/components/Shared/SplitView';
import { AppDispatch, RootState } from '@/app/redux/store';
import TopProjectsView from '@/app/components/ResourceAllocation/component/TopProjectsView';
import BottomTeamsView from '@/app/components/ResourceAllocation/component/BottomTeamsView';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { fetchAllTeams } from '@/app/redux/actions/fetchTeamsAction';
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import { resetAllocations } from '@/app/redux/reducers/allAllocationsReducer';
import { Resource } from '@/app/types';
import { generateDateWeekMath } from '@/app/utils/common';
import { fetchAllocationTheme } from '@/app/redux/actions/settingsAction';
import { FETCH_PORTFOLIOS } from '@/app/redux/actions/portfolioActions';
import { FETCH_ALL_RESOURCES_DETAIL } from '@/app/redux/actions/allResourcesDetailAction';
import { FETCH_ORGANISATIONS } from '@/app/redux/actions/organizationsAction';

interface TopContentProps {
  startDate: string;
  endDate: string;
}

interface BottomContentProps {
  startDate: string;
  endDate: string;
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
  const { organisations } = useSelector(
    (state: RootState) => state.organisations
  );
  const { projects } = useSelector((state: RootState) => state.projects);
  // @ts-ignore
  const { resources }: { resources: Resource[] } = useSelector(
    (state: RootState) => state.resources
  );
  const { portfolios } = useSelector((state: RootState) => state.portfolios);
  const { allResourcesDetail } = useSelector(
    (state: RootState) => state.allResourcesDetail
  );
  const allocationTheme = useSelector(
    (state: RootState) => state.settings.allocationTheme
  );

  const { allAllocations, calendarDate } = useSelector(
    (state: RootState) => state.allAllocations
  );
  const { startDate, endDate } = calendarDate || {};
  const dispatch: AppDispatch = useDispatch();
  const [currentViewStartDate, setCurrentViewStartDate] = useState(
    currentView?.isDynamicRange
      ? generateDateWeekMath('WEEK_MINUS', currentView?.WeekMinus)
      : currentView?.isFixedRange
        ? currentView?.StartDate
        : startDate
  );

  const [currentViewEndDate, setCurrentViewEndDate] = useState(
    currentView?.isDynamicRange
      ? generateDateWeekMath('WEEK_PLUS', currentView?.WeekPlus)
      : currentView?.isFixedRange
        ? currentView?.EndDate
        : endDate
  );
  useEffect(() => {
    if (!teams?.length) {
      dispatch(fetchAllTeams());
    }
    if (!projects?.length) {
      dispatch(fetchAllProjects());
    }
    if (!resources?.length) {
      dispatch({ type: FETCH_ALL_RESOURCES_DETAIL, payload: {} });
    }
    if (!portfolios?.length) {
      dispatch({
        type: FETCH_PORTFOLIOS,
        payload: {},
      });
    }
    if (!organisations?.length) {
      dispatch({
        type: FETCH_ORGANISATIONS,
        payload: {},
      });
    }
    if (!allResourcesDetail?.length) {
      dispatch({
        type: FETCH_ALL_RESOURCES_DETAIL,
        payload: {},
      });
    }
    if (allocationTheme.length === 1 && allocationTheme[0].__Id__ === '') {
      dispatch(fetchAllocationTheme());
    }
  }, []);

  useEffect(() => {
    if (
      (teams?.length ?? 0) > 0 &&
      (projects?.length ?? 0) > 0 &&
      (resources?.length ?? 0) > 0 &&
      (allResourcesDetail?.length ?? 0) > 0 &&
      allAllocations?.length === 0
    ) {
      dispatch(resetAllocations());
      dispatch({
        type: 'FETCH_ALL_ALLOCATIONS_INIT',
        payload: {
          teams: teams,
          projects: projects,
          resources: resources,
          portfolios: portfolios,
          allResourcesDetail: allResourcesDetail,
          startDate: currentViewStartDate,
          endDate: currentViewEndDate,
        },
      });
    }
  }, [teams, projects, resources, allResourcesDetail]);

  useEffect(() => {
    if (
      (teams?.length ?? 0) > 0 &&
      (projects?.length ?? 0) > 0 &&
      (resources?.length ?? 0) > 0 &&
      (allResourcesDetail?.length ?? 0) > 0
    ) {
      dispatch(resetAllocations());
      dispatch({
        type: 'FETCH_ALL_ALLOCATIONS',
        payload: {
          teams: teams,
          projects: projects,
          resources: resources,
          portfolios: portfolios,
          allResourcesDetail: allResourcesDetail,
          startDate: currentView?.isDynamicRange
            ? generateDateWeekMath('WEEK_MINUS', currentView?.WeekMinus)
            : currentView?.isFixedRange
              ? currentView?.StartDate
              : startDate,
          endDate: currentView?.isDynamicRange
            ? generateDateWeekMath('WEEK_PLUS', currentView?.WeekPlus)
            : currentView?.isFixedRange
              ? currentView?.EndDate
              : endDate,
        },
      });

      setCurrentViewStartDate(
        currentView?.isDynamicRange
          ? generateDateWeekMath('WEEK_MINUS', currentView?.WeekMinus)
          : currentView?.isFixedRange
            ? currentView?.StartDate
            : startDate
      );
      setCurrentViewEndDate(
        currentView?.isDynamicRange
          ? generateDateWeekMath('WEEK_PLUS', currentView?.WeekPlus)
          : currentView?.isFixedRange
            ? currentView?.EndDate
            : endDate
      );
    }
  }, [
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
          startDate={currentViewStartDate || ''}
          endDate={currentViewEndDate || ''}
        />
      }
      bottom={
        <BottomContent
          startDate={currentViewStartDate || ''}
          endDate={currentViewEndDate || ''}
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
