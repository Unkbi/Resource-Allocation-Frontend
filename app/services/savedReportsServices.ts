import apiClient from '../utils/apiClient';
import {
  SavedReport,
  CreateSavedReportPayload,
  UpdateSavedReportPayload,
  GetUserSavedReportsPayload,
  GetUserSavedReportsResponse,
} from '../types/savedReportsTypes';

/**
 * Fetch all saved reports for a specific user
 * POST /Resource/GetUserSavedReports
 */
export const fetchSavedReportsAPI = async (userId: string): Promise<SavedReport[]> => {
  const payload: GetUserSavedReportsPayload = { UserId: userId };
  const response = await apiClient.post<GetUserSavedReportsResponse[]>(
    '/Resource/GetUserReports',
    payload
  );
  // Extract SavedReport from the response array
  return response.data.map((item) => item.UserReports);
};

/**
 * Create a new saved report
 * POST /Resource/UserSavedReports
 */
export const createSavedReportAPI = async (
  reportData: CreateSavedReportPayload
): Promise<SavedReport> => {
  const response = await apiClient.post(
    '/Resource/SaveUserReport',
    reportData
  );
  return response.data.UserReports;
};

/**
 * Update an existing saved report
 * PUT /Resource/UserSavedReports/{id}
 */
export const updateSavedReportAPI = async (
  id: string,
  reportData: UpdateSavedReportPayload
): Promise<SavedReport> => {
  const response = await apiClient.post(
    `/Resource/SaveUserReport`,
    reportData
  );
  return response.data[0].UserReports;
};

/**
 * Delete a saved report
 * DELETE /Resource/UserSavedReports/{id}
 */
export const deleteSavedReportAPI = async (id: string): Promise<void> => {
  await apiClient.delete(`/Resource/UserReports/${id}`);
};
