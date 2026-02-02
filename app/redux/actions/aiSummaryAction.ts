import { createAction } from '@reduxjs/toolkit';
import {
  GetProjectSummaryRequest,
  GetProjectSummaryHistoryRequest,
} from '@/app/types/aiSummaryTypes';

/**
 * Action to fetch current project summary
 * Triggers saga to call GetProjectSummary API
 * Accepts UI filters which will be transformed in saga
 */
export const fetchProjectSummary = createAction<any>(
  'aiSummary/fetchProjectSummary'
);

/**
 * Action to fetch project summary history
 * Triggers saga to call GetProjectSummaryHistory API
 */
export const fetchProjectSummaryHistory = createAction<GetProjectSummaryHistoryRequest>(
  'aiSummary/fetchProjectSummaryHistory'
);
