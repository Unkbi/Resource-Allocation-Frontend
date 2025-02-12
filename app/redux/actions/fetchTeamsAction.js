import {
  getAllTeams,
  getResourcesAgainstTeams,
} from '@/app/services/teamServices';

export const fetchAllTeams = () => async dispatch => {
  try {
    await dispatch(getAllTeams());
  } catch (error) {
    console.error('Error fetching teams data:', error);
  }
};

export const fetchResourcesAgainstTeams = team => async dispatch => {
  try {
    await dispatch(getResourcesAgainstTeams(team));
  } catch (error) {
    console.error('Error fetching resources against teams:', error);
  }
};
