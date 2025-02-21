import { hideToast, showToast } from '../reducers/toastReducer';

export const showToastAction = (open, message, type, position) => dispatch => {
  dispatch(
    showToast({
      open,
      message,
      type,
      position,
    })
  );
};

export const hideToastAction = () => dispatch => {
  dispatch(hideToast());
};
