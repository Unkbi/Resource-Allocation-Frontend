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
import {
  changeView,
  updateCurrentView,
} from '@/app/redux/reducers/allocationViewReducer';
import { decompressFromEncodedURIComponent } from 'lz-string';
import { fetchAllocationTheme } from '@/app/redux/actions/settingsAction';
import ProjectCost from '@/app/components/ResourceAllocation/component/ProjectCost';
import TeamsCost from '@/app/components/ResourceAllocation/component/TeamsCost';
import PortfolioAllocation from '@/app/components/ResourceAllocation/component/PorfolioAllocation';
import OrganisationAllocation from '@/app/components/ResourceAllocation/component/OrganizationAllocation';
import ResourceAllocation from '@/app/components/ResourceAllocation/component/ResourceAllocation';
import FlatAllocation from '@/app/components/ResourceAllocation/component/FlatAllocation';
import { getUserAttributes } from '@/app/utils/authUtils';

export default function Allocation({ startDate, endDate }) {
  const dispatch = useDispatch();
  const { view, savedViews, currentView } = useSelector(
    state => state.allocationView
  );
  const { user } = useSelector(state => state.user);
  const { email = '' } = getUserAttributes(user, []) || {};
  const { teams } = useSelector(state => state.teams);
  const { projects } = useSelector(state => state.projects);
  const { resources } = useSelector(state => state.resources);
  const searchParams = useSearchParams();
  const settingsParam = searchParams.get('settings');

  useEffect(() => {
    dispatch(fetchAllResources());
    dispatch(fetchAllProjects());
    dispatch(fetchAllocationTheme());
  }, []);

  useEffect(() => {
    if (user && email) {
      const userId = getUserIdFromEmail(resources?.result || [], email);
      if (userId) {
        dispatch(fetchUsersSavedViews(userId));
      }
    }
  }, [resources, user, email]);

  useEffect(() => {
    // Only after fetching resources, projects, and teams should the deeplinked settings be processed.
    if (
      settingsParam &&
      (teams?.length ?? 0) > 0 &&
      (projects?.result?.length ?? 0) > 0 &&
      (resources?.result?.length ?? 0) > 0
    ) {
      try {
        const parsedSettings = JSON.parse(
          decompressFromEncodedURIComponent(settingsParam)
        );

        if (parsedSettings?.GroupBy) {
          dispatch(changeView(parsedSettings?.GroupBy));
        }
        dispatch(updateCurrentView(parsedSettings));
      } catch (e) {
        console.error('Failed to parse settings:', e);
      }
    }
  }, [settingsParam, teams, projects, resources]);

  const getContentByRole = view => {
    if (currentView?.GroupBy) {
      switch (currentView.GroupBy) {
        case 'Project':
          return <ProjectAllocation startDate={startDate} endDate={endDate} />;
        case 'Portfolio':
          return (
            <PortfolioAllocation startDate={startDate} endDate={endDate} />
          );
        case 'Teams':
          return <TeamAllocation startDate={startDate} endDate={endDate} />;
        case 'Organisations':
          return (
            <OrganisationAllocation startDate={startDate} endDate={endDate} />
          );
        case 'Resources':
          return <ResourceAllocation startDate={startDate} endDate={endDate} />;
        case 'Flat':
          return <FlatAllocation startDate={startDate} endDate={endDate} />;
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
