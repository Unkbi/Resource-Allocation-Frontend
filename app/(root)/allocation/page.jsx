'use client';
import styles from '../../page.module.css';
import { Box } from '@mui/material';
import { useDispatch, useSelector } from 'react-redux';
import TeamAllocation from '@/app/components/ResourceAllocation/component/TeamAllocation';
import OrganizationAllocation from '@/app/components/ResourceAllocation/component/OrganizationAllocation';
import ProjectAllocation from '@/app/components/ResourceAllocation/component/ProjectAllocation';
import { useEffect } from 'react';
import { fetchAllResources } from '@/app/redux/actions/fetchResourcesAction';

export default function Allocation() {
  const dispatch = useDispatch();
  const view = useSelector(state => state.allocationView.view);
  useEffect(() => {
    document.title = view || 'Resource Allocation';
  }, [view]);

  useEffect(() => {
    dispatch(fetchAllResources());
  }, []);

  const getContentByRole = view => {
    switch (view) {
      case 'Projects':
        return <ProjectAllocation />;
      // case 'Organizations':
      //   return <OrganizationAllocation />;
      case 'Teams':
        return <TeamAllocation />;
      default:
        return null;
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
