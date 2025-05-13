
import { AppDispatch } from '../store';
import { updateProjectCosts, setDataProcessing } from '../reducers/projectCostReducer';
import { ProjectCostAllocation } from '../reducers/projectCostReducer';
import { mockAllocationData } from '@/app/constants/mockAllocations';

export const fetchProjectCosts = () => async (dispatch: AppDispatch) => {
  try {
    dispatch(setDataProcessing(true));

    // Mock data (replace with real API call)
    // const mockData: ProjectCostAllocation[] = mockAllocationData;

    // dispatch(updateProjectCosts(mockData));
  } catch (error) {
    console.error('Failed to fetch project costs:', error);
  } finally {
    dispatch(setDataProcessing(false));
  }
};
