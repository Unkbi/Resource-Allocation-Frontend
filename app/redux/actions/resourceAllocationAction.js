import {
  deleteResourceAllocations,
  postResourceAllocations,
  putResourceAllocations,
} from '@/app/services/allocationServices';

export const setResourceAllocation = allocationData => async dispatch => {
  try {
    const response = await dispatch(postResourceAllocations(allocationData));
    return response;
  } catch (error) {
    console.error('Error setting resource allocation:', error);
  }
};

export const updateResourceAllocation = allocationData => async dispatch => {
  try {
    const response = await dispatch(putResourceAllocations(allocationData));
    return response;
  } catch (error) {
    console.error('Error updating resource allocation:', error);
  }
};

export const removeResourceAllocation = allocationData => async dispatch => {
  try {
    const response = await dispatch(deleteResourceAllocations(allocationData));
    return response;
  } catch (error) {
    console.error('Error deleting resource allocation:', error);
  }
};
