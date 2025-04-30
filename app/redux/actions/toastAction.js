import { hideToast, showToast } from '../reducers/toastReducer';

export const showToastAction = (open, message, type, autoHideTimer, position) => dispatch => {
  dispatch(
    showToast({
      open,
      message,
      type,
      autoHideTimer,
      position,
    })
  );
};

export const hideToastAction = (id) => dispatch => {
  dispatch(hideToast({id}));
};