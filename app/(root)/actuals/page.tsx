'use client';

import { Box, Typography, Button, IconButton, Skeleton } from '@mui/material';
import ActualTable from '@/app/components/Actuals/ActualTable';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import {
  CONFIRM_ACTUAL_ALLOCATIONS,
  GET_ACTUAL_ALLOCATIONS,
} from '@/app/redux/actions/actualAllocationsActions';
import { AppDispatch, RootState } from '@/app/redux/store';
import { useSelector } from 'react-redux';
import { ActualAllocations, ActualAllocationTableRow } from '@/app/types';
import {
  formateToFloat,
  generateDateWeekMath,
  getSundayOfISO,
  getUserIdFromEmail,
  isCurrentWeek,
} from '@/app/utils/common';
import {
  setActualAllocationsStatus,
  setCalendarDate,
} from '@/app/redux/reducers/actualAllocationsReducer';
// @ts-ignore
import { parseISO } from 'date-fns';
import { useGridApiRef } from '@mui/x-data-grid-premium';
import { fetchAllProjects } from '@/app/redux/actions/fetchProjectsAction';
import { showToast } from '@/app/redux/reducers/toastReducer';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ConfirmDialog from '@/app/components/Dialog/ConfirmDialog';
import { getUserAttributes } from '@/app/utils/authUtils';
import { FETCH_ALL_RESOURCES_DETAIL } from '@/app/redux/actions/allResourcesDetailAction';
import { CrudPermissions, withRBAC } from '@/app/components/HOC/withRBAC';
import { useRouter } from 'next/navigation';

interface ActualsPageProps {
  permissions: Record<string, CrudPermissions>;
  loadingPermissions: boolean;
}

function ActualsPage({ permissions, loadingPermissions }: ActualsPageProps) {
  return <></>;
}

export default withRBAC(ActualsPage, ['ActualsStatus']);
