import {
  addAllocationView,
  deleteAllocationView,
  getAllSavedViews,
  getUsersSavedViews,
  updateAllocationView,
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
    } catch (error) {
      console.error('Failed to change view:', error);
    }
  };

export const fetchAllSavedViews = () => async (dispatch: AppDispatch) => {
  try {
    await dispatch(getAllSavedViews());
  } catch (error) {
    console.error('Error fetching all saved views:', error);
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
      console.error('Error fetching resources saved views:', error);
    }
  };

export const updateUsersSavedViewAction =
  (id: string, updatedView: any) => async (dispatch: AppDispatch) => {
    try {
      const payload = {
        id: id,
        body: {
          'ResourceAllocation.Core/UserAllocationView': updatedView,
        },
      };
      //@ts-ignore
      await dispatch(updateAllocationView(payload));
    } catch (error) {
      console.error('Error updating Allocation view:', error);
    }
  };

export const addUsersSavedViewAction =
  (newView: any) => async (dispatch: AppDispatch) => {
    try {
      const payload = {
        body: {
          'ResourceAllocation.Core/UserAllocationView': newView,
        },
      };
      //@ts-ignore
      await dispatch(addAllocationView(payload));
    } catch (error) {
      console.error('Error updating Allocation view:', error);
    }
  };

export const deleteUsersSavedViewAction =
  (id: string) => async (dispatch: AppDispatch) => {
    try {
      const payload = {
        id: id,
      };
      //@ts-ignore
      await dispatch(deleteAllocationView(payload));
    } catch (error) {
      console.error('Error deleting Allocation view:', error);
    }
  };
