import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import { GetOrganizationResourcesPayload,ResourceOrganizationPayload } from '../types/organisationTypes';
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

export const updateOrganizationForResourceSaga = async (
  postData: ResourceOrganizationPayload
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/ChangeTeamOrganization`,
    postData
  );
  return response.data;
};

 