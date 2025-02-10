import { updateSignup } from '../reducers/authReducer';
import { confirmForgotPassword, confirmSignUp, forgotPassword, loginUser, logoutUser, signupUser } from './../../services/authServices';

// Example of wrapping an async action for added logic
export const performLogin = (credentials) => async (dispatch) => {
  try {
    await dispatch(loginUser(credentials)).unwrap(); 
  } catch (error) {
    console.error('Login failed:', error);
  }
};

export const performLogout = () => (dispatch) => {
  dispatch(logoutUser());
  console.log('User logged out successfully');
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

// Forgot Password Action
export const performForgotPassword = (email) => async (dispatch) => {
  try {
    console.log('Forgot Password:', email);
    const response = await dispatch(forgotPassword(email)).unwrap();
    console.log('Reset link sent:', response);
  } catch (error) {
    console.error('Forgot password request failed:', error);
  }
};

// Confirm Forgot Password Action
export const performConfirmForgotPassword = (data) => async (dispatch) => {
  try {
    const response = await dispatch(confirmForgotPassword(data)).unwrap();
    console.log('Password reset successful:', response);
  } catch (error) {
    console.error('Password reset failed:', error);
  }
};