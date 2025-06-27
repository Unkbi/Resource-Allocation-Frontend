import { updateSignup } from '../reducers/authReducer';
import { confirmForgotPassword, confirmSignUp, forgotPassword, getUser, loginUser, logoutUser, signupUser } from './../../services/authServices';

export const performLogin = (credentials) => async (dispatch) => {
  try {
    await dispatch(loginUser(credentials)).unwrap(); 
  } catch (error) {
    console.log('Login failed:', error);
  }
};

export const performLogout = () => (dispatch) => {
  dispatch(logoutUser());
};


export const signUp = (data, email) => async (dispatch) => {
  try {
    const response = await dispatch(signupUser(data)).unwrap();
    if (response.status === 'ok') {
      dispatch(updateSignup(email));
    }
  } catch (error) {
    console.error('Signup failed:', error);
  }
};

export const confirmSignUpUser = (data) => async (dispatch) => {
  try {
    const response = await dispatch(confirmSignUp(data)).unwrap();
    console.log('confirm signup:', response);
  } catch (error) {
    console.error('confirm signup failed:', error);
  }
};

export const getUserData = () => async (dispatch) => {
  try {
    await dispatch(getUser());
  } catch (error) {
    console.error('get user failed:', error);
  }
};

// Forgot Password Action
export const performForgotPassword = (email) => async (dispatch) => {
  try {
   await dispatch(forgotPassword(email)).unwrap();
  } catch (error) {
    console.error('Forgot password request failed:', error);
  }
};

// Confirm Forgot Password Action
export const performResetPassword = (data) => async (dispatch) => {
  try {
    const response = await dispatch(confirmForgotPassword(data)).unwrap();
    console.log('Password reset successful:', response);
  } catch (error) {
    console.error('Password reset failed:', error);
  }
};