import { getAllResources } from '@/app/services/resourceServices';
import { setDataProcessing } from '../reducers/allAllocationsReducer';
import { AppDispatch } from '../store';

export const fetchAllResources = () => async (dispatch: AppDispatch) => {
  try {
    const response = await dispatch(getAllResources());

    // If no Resources load then set AllAllocations data processing to false
    if (
      response &&
      response?.meta?.requestStatus === 'fulfilled' &&
      //@ts-ignore
      response?.payload?.result?.length === 0
    ) {
      dispatch(setDataProcessing(false));
    }
  } catch (error) {
    console.error('Error fetching resources data:', error);
  }
};
