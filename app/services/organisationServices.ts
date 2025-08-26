import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import {
  GetOrganizationResourcesPayload,
  ResourceOrganizationPayload,
} from '../types/organisationTypes';
import axiosInstance from '../utils/apiClient';

// fetching all orgs
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

export const createOrganisation = async (newData: any) => {
  const payload = {
    'ResourceAllocation.Core/Organization': newData,
  };
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/Organization`,
    payload
  );
  return response.data;
};

export const updateOrganizationForResourceSaga = async (
  postData: ResourceOrganizationPayload
) => {
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/ChangeOrganizationResource`,
    postData
  );
  return response.data;
};

export const updateOrganisation = async (
  organisationId: string,
  updatedFields: any
) => {
  const payload = {
    'ResourceAllocation.Core/Organization': updatedFields,
  };
  const response = await axiosInstance.put(
    `${API_PROJECT_PORTFOLIO}/Organization/${organisationId}`,
    payload
  );
  return response.data;
};

export const deleteOrganisation = async (organisationId: string) => {
  const response = await axiosInstance.delete(
    `${API_PROJECT_PORTFOLIO}/Organization/${organisationId}`
  );
  return response.data;
};
