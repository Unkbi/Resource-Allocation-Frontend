import { API_PROJECT_PORTFOLIO } from "../constants/constants";
import axiosInstance from "../utils/apiClient";


export const fetchBusinessImpact = async () => {
    const response = await axiosInstance.get(
      `${API_PROJECT_PORTFOLIO}/BusinessImpact`
  );
    return response.data ;
} 

export const fetchBusinessImpactType = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/BusinessImpactType`
);
  return response.data ;
}

export const createBusinessImpact = async (newData: any) => {
  const payload = {
    ProjectUUID: newData.Project,
    BusinessImpactType: newData.BusinessImpactType,
    AnnualizedAmount: Number(newData.Amount),
    Description: newData.Description,
    Status: newData.Status,
    Currency :newData.Currency
    
  };
  const response = await axiosInstance.post(  
    `${API_PROJECT_PORTFOLIO}/BusinessImpact`,
    payload
  );
  return response.data;
};

export const updateBusinessImpact = async (
  businessImpactId: string,
  updatedFields: any
) => {
  const payload = {
    ProjectUUID: updatedFields.Project,
    BusinessImpactType: updatedFields.BusinessImpactType,
    AnnualizedAmount: Number(updatedFields.Amount),
    Currency: updatedFields.Currency || "USD",
    Description: updatedFields.Description?.trim() || "",
    Status: updatedFields.Status,
  };

  const response = await axiosInstance.put(
    `${API_PROJECT_PORTFOLIO}/BusinessImpact/${businessImpactId}`,
    payload
  );

  return response.data;
};


export const deleteBusinessImpact = async (businessImpactId: string, hardDelete: boolean = true) => {
  const response = await axiosInstance.delete(
    `${API_PROJECT_PORTFOLIO}/BusinessImpact/${businessImpactId}`,
    {
      params: { purge: hardDelete },
    } 
  );
  return response.data;
};




