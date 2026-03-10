import { CreateSavedReportPayload, UpdateSavedReportPayload } from '@/app/types/savedReportsTypes';

// Action Types
export const FETCH_SAVED_REPORTS = 'FETCH_SAVED_REPORTS';
export const CREATE_SAVED_REPORT = 'CREATE_SAVED_REPORT';
export const UPDATE_SAVED_REPORT = 'UPDATE_SAVED_REPORT';
export const DELETE_SAVED_REPORT = 'DELETE_SAVED_REPORT';

// Action Interfaces
interface FetchSavedReportsAction {
  type: typeof FETCH_SAVED_REPORTS;
  payload: {
    userId: string;
  };
}

interface CreateSavedReportAction {
  type: typeof CREATE_SAVED_REPORT;
  payload: {
    reportData: CreateSavedReportPayload;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  };
}

interface UpdateSavedReportAction {
  type: typeof UPDATE_SAVED_REPORT;
  payload: {
    reportId: string;
    reportData: UpdateSavedReportPayload;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  };
}

interface DeleteSavedReportAction {
  type: typeof DELETE_SAVED_REPORT;
  payload: {
    reportId: string;
    resolve: (value: any) => void;
    reject: (error: any) => void;
  };
}

export type SavedReportsActionTypes =
  | FetchSavedReportsAction
  | CreateSavedReportAction
  | UpdateSavedReportAction
  | DeleteSavedReportAction;

// Action Creators
export const fetchSavedReports = (userId: string): FetchSavedReportsAction => ({
  type: FETCH_SAVED_REPORTS,
  payload: { userId },
});

export const createSavedReport = (
  reportData: CreateSavedReportPayload,
  resolve: (value: any) => void,
  reject: (error: any) => void
): CreateSavedReportAction => ({
  type: CREATE_SAVED_REPORT,
  payload: { reportData, resolve, reject },
});

export const updateSavedReport = (
  reportId: string,
  reportData: UpdateSavedReportPayload,
  resolve: (value: any) => void,
  reject: (error: any) => void
): UpdateSavedReportAction => ({
  type: UPDATE_SAVED_REPORT,
  payload: { reportId, reportData, resolve, reject },
});

export const deleteSavedReport = (
  reportId: string,
  resolve: (value: any) => void,
  reject: (error: any) => void
): DeleteSavedReportAction => ({
  type: DELETE_SAVED_REPORT,
  payload: { reportId, resolve, reject },
});
