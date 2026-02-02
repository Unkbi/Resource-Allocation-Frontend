import apiClient from '../utils/apiClient';
import { SavedReport } from '../types/savedReportsTypes';

export const fetchSavedReportsAPI = async (): Promise<SavedReport[]> => {
  const response = await apiClient.get('/api/reports/saved');
  return response.data;
};

export const saveReportAPI = async (reportData: {
  Name: string;
  Description?: string;
  Filters: any;
  ReportType: string;
}): Promise<SavedReport> => {
  const response = await apiClient.post('/api/reports/saved', reportData);
  return response.data;
};

export const updateSavedReportAPI = async (
  id: string,
  reportData: Partial<SavedReport>
): Promise<SavedReport> => {
  const response = await apiClient.put(`/api/reports/saved/${id}`, reportData);
  return response.data;
};

export const deleteSavedReportAPI = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/reports/saved/${id}`);
};
