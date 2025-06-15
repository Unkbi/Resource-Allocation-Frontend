'use client';

import styles from '../../page.module.css';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import TeamAllocation from '@/app/components/ResourceAllocation/component/TeamAllocation';
import ProjectAllocation from '@/app/components/ResourceAllocation/component/ProjectAllocation';
import { useEffect } from 'react';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import {
  fetchAllSavedViews,
  fetchUsersSavedViews,
} from '@/app/redux/actions/allocationViewAction';
import { getUserIdFromEmail } from '@/app/utils/common';
import { useSearchParams } from 'next/navigation';
import { updateCurrentView } from '@/app/redux/reducers/allocationViewReducer';
import { decompressFromEncodedURIComponent } from 'lz-string';
import { fetchAllocationTheme } from '@/app/redux/actions/settingsAction';
import ProjectCost from '@/app/components/ResourceAllocation/component/ProjectCost';
import TeamsCost from '@/app/components/ResourceAllocation/component/TeamsCost';
import dayjs from 'dayjs';

export default function Allocation({ startDate, endDate }) {
  const dispatch = useDispatch();
  const { view, savedViews, currentView } = useSelector(
    state => state.allocationView
  );
  const { user } = useSelector(state => state.user);
  const { resources } = useSelector(state => state.resources);
  const searchParams = useSearchParams();
  const settingsParam = searchParams.get('settings');
  
  const defaultStartDate = dayjs().format('YYYY-MM-DD');
  const defaultEndDate = dayjs().add(51, 'week').format('YYYY-MM-DD');

  const effectiveStartDate = currentView?.StartDate || defaultStartDate;
  const effectiveEndDate = currentView?.EndDate || defaultEndDate;

  useEffect(() => {
    dispatch(fetchAllResources());
    dispatch(fetchAllProjects());
    dispatch(fetchAllocationTheme());
  }, []);

  useEffect(() => {
    const userId = getUserIdFromEmail(resources?.result || [], user?.Email);
    if (userId) {
      dispatch(fetchUsersSavedViews(userId));
    }
  }, [resources, user]);

  useEffect(() => {
    if (settingsParam) {
      try {
        const parsedSettings = JSON.parse(
          decompressFromEncodedURIComponent(settingsParam)
        );

        setTimeout(() => {
          dispatch(updateCurrentView(parsedSettings));
        }, 2000);
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, [settingsParam]);

  const getContentByRole = view => {
    if (currentView?.GroupBy) {
      switch (currentView.GroupBy) {
        case 'Project':
          return <ProjectAllocation startDate={startDate} endDate={endDate} />;
        case 'Teams':
          return (
            <TeamAllocation
              startDate={effectiveStartDate}
              endDate={effectiveEndDate}
            />
          );
        case 'Project Cost':
          return <ProjectCost startDate={startDate} endDate={endDate} />;
        case 'Teams Cost':
          return <TeamsCost startDate={startDate} endDate={endDate} />;
        default:
          return null;
      }
    } else {
      switch (view) {
        case 'Project':
          return <ProjectAllocation startDate={startDate} endDate={endDate} />;
        case 'Teams':
          return <TeamAllocation startDate={startDate} endDate={endDate} />;
        case 'Project Cost':
          return <ProjectCost startDate={startDate} endDate={endDate} />;
        case 'Teams Cost':
          return <TeamsCost startDate={startDate} endDate={endDate} />;
        default:
          return null;
      }
    }
  };

  return (
    <>
      <Box className={styles.page}>
        <main className={styles.wrapperBox}>{getContentByRole(view)}</main>
      </Box>
    </>
  );
}
