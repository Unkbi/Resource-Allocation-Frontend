import { getAllResources } from '@/app/services/resourceServices';

export const fetchAllResources = () => async dispatch => {
  try {
    await dispatch(getAllResources());
  } catch (error) {
    console.error('Error fetching resources data:', error);
  }
};
