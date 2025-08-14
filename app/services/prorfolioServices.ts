import { API_PROJECT_PORTFOLIO } from '../constants/constants';
import axiosInstance from '../utils/apiClient';

// getting all portfolios
export const fetchPortfolios = async () => {
  const response = await axiosInstance.get(
    `${API_PROJECT_PORTFOLIO}/Portfolio`
  );
  return response.data;
};

// creating a portfolio
export const createPortfolio = async (newData: any) => {
  const payload = {
    'ResourceAllocation.Core/Portfolio': newData,
  };
  const response = await axiosInstance.post(
    `${API_PROJECT_PORTFOLIO}/Portfolio`,
    payload
  );
  return response.data;
};

// updates a portfolio 
export const updatePortfolio = async (
  portfolioId: string,
  updatedFields: any
) => {
  const payload = {
    'ResourceAllocation.Core/Portfolio': updatedFields,
  };
  const response = await axiosInstance.put(
    `${API_PROJECT_PORTFOLIO}/Portfolio/${portfolioId}`,
    payload
  );
  return response.data;
};

// delete a protfolio
export const deletePortfolio = async (portfolioId: string) => {
  const response = await axiosInstance.delete(
    `${API_PROJECT_PORTFOLIO}/Portfolio/${portfolioId}`
  );
  return response.data;
};
