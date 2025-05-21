import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import { GetOrganizationResourcesPayload } from '../types/organisationTypes';
import axiosInstance from '../utils/apiClient';

export const fetchAllOrganisations = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/Organization`
  );
  return response.data;
};

export const fetchResourcesAgainstOrganisationsForSaga = async (
  postData: GetOrganizationResourcesPayload
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/GetOrganizationResources`,
    postData
  );
  return response.data;
};
