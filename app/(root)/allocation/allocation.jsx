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
import SplitView from '@/app/components/ResourceAllocation/component/SplitView';

export default function Allocation() {
  const dispatch = useDispatch();
  const { view, savedViews, currentView } = useSelector(
    state => state.allocationView
  );
  const { user } = useSelector(state => state.user);
  const { resources } = useSelector(state => state.resources);
  const searchParams = useSearchParams();
  const settingsParam = searchParams.get('settings');

  useEffect(() => {
    dispatch(fetchAllResources());
    dispatch(fetchAllProjects());
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

        dispatch(updateCurrentView(parsedSettings));
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, [settingsParam]);

  const getContentByRole = view => {
    if (currentView?.GroupBy) {
      switch (currentView.GroupBy) {
        case 'Project':
          return <ProjectAllocation />;
        case 'Teams':
          // return <TeamAllocation />;
          return <SplitView />
        default:
          return null;
      }
    } else {
      switch (view) {
        case 'Project':
          return <ProjectAllocation />;
        // case 'Organizations':
        //   return <OrganizationAllocation />;
        case 'Teams':
          return <TeamAllocation />;
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
