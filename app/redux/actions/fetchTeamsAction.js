import { getAllTeams } from '@/app/services/teamServices';

export const fetchAllTeams = () => async dispatch => {
  try {
    await dispatch(getAllTeams());
  } catch (error) {
    console.error('Error fetching teams data:', error);
  }
};
