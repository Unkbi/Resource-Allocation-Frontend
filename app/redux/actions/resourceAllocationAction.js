import {
  deleteResourceAllocations,
  postResourceAllocations,
  putResourceAllocations,
  putResourceBulkAllocations,
  deleteResourceBulkAllocations
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

export const updateResourceBulkAllocation = allocationData => async dispatch => {
  try {
    const payload = {
      body: {
        'ResourceAllocation.Core/RangeAllocationUpsert': allocationData[0],
      },
    };
    await dispatch(putResourceBulkAllocations(payload));
  } catch (error) {
    console.error('Error updating resource bulk allocation:', error);
  }
};

export const removeResourceBulkAllocation = allocationData => async dispatch => {
  try {
    const payload = {
      body: {
        'ResourceAllocation.Core/RangeAllocationDelete': allocationData[0],
      },
    };
    await dispatch(deleteResourceBulkAllocations(payload));
  } catch (error) {
    console.error('Error deleting resource bulk allocation:', error);
  }
};