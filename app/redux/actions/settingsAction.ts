//@ts-ignore
import { AllocationRangePayload } from '@/app/types';
import { AppDispatch } from '../store';
import {
  addAllocationTheme,
  getAllocationTheme,
  updateAllocationThemes,
} from '@/app/services/settingServices';

export const fetchAllocationTheme = () => async (dispatch: AppDispatch) => {
  try {
    await dispatch(getAllocationTheme());
  } catch (error) {
    console.error('Error fetching projects data:', error);
  }
};

export const addAllocationThemeAction =
  (payload: AllocationRangePayload[]) => async (dispatch: AppDispatch) => {
    try {
      await dispatch(addAllocationTheme(payload));
    } catch (error) {
      console.error('Error adding allocation themes:', error);
    }
  };

export const updateAllocationThemeAction =
  (payload: { postData: AllocationRangePayload[]; __id__: string }) =>
  async (dispatch: AppDispatch) => {
    try {
      const response = await dispatch(updateAllocationThemes(payload));
      return response;
    } catch (error) {
      console.error('Error updating allocation theme:', error);
    }
  };

export const deleteAllocationThemeAction =
  () => async (dispatch: AppDispatch) => {
    try {
    } catch (error) {
      console.error('Error fetching projects data:', error);
    }
  };
