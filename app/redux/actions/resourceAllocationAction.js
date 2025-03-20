import {
  deleteResourceAllocations,
  postResourceAllocations,
  putResourceAllocations,
} from '@/app/services/allocationServices';

export const setResourceAllocation = allocationData => async dispatch => {
  try {
    await dispatch(postResourceAllocations(allocationData));
  } catch (error) {
    console.error('Error setting resource allocation:', error);
  }
};

export const updateResourceAllocation = allocationData => async dispatch => {
  try {
    await dispatch(putResourceAllocations(allocationData));
  } catch (error) {
    console.error('Error updating resource allocation:', error);
  }
};

export const removeResourceAllocation = allocationData => async dispatch => {
  try {
    await dispatch(deleteResourceAllocations(allocationData));
  } catch (error) {
    console.error('Error deleting resource allocation:', error);
  }
};
