import { AppDispatch } from '../store';
import { updateSignup } from '../reducers/authReducer';
import { confirmForgotPassword, confirmSignUp, forgotPassword, getUser, loginUser, logoutUser, signupUser } from '../../services/authServices';

// not sure if this fits the inteface for it but I looked here CIOptimize/Resource-Allocation-Frontend/app/(root)/login/page.tsx
interface Credentials {
  email: string;
  password: string;
}

interface SignupData {
  email: string;
  password: string;
}

interface ConfirmForgotPasswordData {
  email: string;
  code: string;
  newPassword: string;
}

export const performLogin = (credentials: Credentials) => async (dispatch: AppDispatch) => {
  try {
    await dispatch(loginUser(credentials)).unwrap(); 
  } catch (error) {
    console.log('Login failed:', error);
  }
};

export const performLogout = () => (dispatch: AppDispatch) => {
  dispatch(logoutUser());
};


export const signUp = (data: SignupData, email: string) => async (dispatch: AppDispatch) => {
  try {
    const response = await dispatch(signupUser(data)).unwrap();
    if (response.status === 'ok') {
      dispatch(updateSignup(email));
    }
  } catch (error) {
    console.error('Signup failed:', error);
  }
};

export const confirmSignUpUser = (data: {email: string; code: string}) => async (dispatch: AppDispatch) => {
  try {
    const response = await dispatch(confirmSignUp(data)).unwrap();
    console.log('confirm signup:', response);
  } catch (error) {
    console.error('confirm signup failed:', error);
  }
};

export const getUserData = () => async (dispatch: AppDispatch) => {
  try {
    await dispatch(getUser());
  } catch (error) {
    console.error('get user failed:', error);
  }
};

// Forgot Password Action
export const performForgotPassword = (email: string) => async (dispatch: AppDispatch) => {
  try {
   await dispatch(forgotPassword({email})).unwrap();
  } catch (error) {
    console.error('Forgot password request failed:', error);
  }
};

// Confirm Forgot Password Action
export const performResetPassword = (data: ConfirmForgotPasswordData) => async (dispatch: AppDispatch) => {
  try {
    const response = await dispatch(confirmForgotPassword(data)).unwrap();
    console.log('Password reset successful:', response);
  } catch (error) {
    console.error('Password reset failed:', error);
  }
};