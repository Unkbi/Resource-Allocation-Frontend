import {
  getAllSavedViews,
  getUsersSavedViews,
} from '@/app/services/allocationServices';
import {
  changeView,
  setInitialCurrentView,
} from '../reducers/allocationViewReducer';
import { AppDispatch } from '../store';

export const performChangeView =
  (newView: string) => async (dispatch: AppDispatch) => {
    try {
      dispatch(changeView(newView));
      console.log(`View changed to ${newView}!`);
    } catch (error) {
      console.error('Failed to change view:', error);
    }
  };

export const fetchAllSavedViews = () => async (dispatch: AppDispatch) => {
  try {
    await dispatch(getAllSavedViews());
  } catch (error) {
    console.error('Error fetching resources data:', error);
  }
};

export const fetchUsersSavedViews =
  (userId: string) => async (dispatch: AppDispatch) => {
    try {
      const payload = {
        'ResourceAllocation.Core/UserAllocationView': {
          UserId: userId,
        },
      };
      //@ts-ignore
      await dispatch(getUsersSavedViews(payload));
      dispatch(setInitialCurrentView());
    } catch (error) {
      console.error('Error fetching resources data:', error);
    }
  };
