import { hideToast, showToast } from '../reducers/toastReducer';
import { AppDispatch } from '../store'; // adjust import path based on your project

type ToastType = string;

interface ToastPosition {
  vertical: 'top' | 'bottom';
  horizontal: 'left' | 'center' | 'right';
}

export const showToastAction =
  (
    open: boolean,
    message: string,
    type: ToastType,
    autoHideTimer?: number,
    position?: ToastPosition
  ) =>
  (dispatch: AppDispatch) => {
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

export const hideToastAction =
  (id: number) =>
  (dispatch: AppDispatch) => {
    dispatch(hideToast({ id }));
  };

