import { updateSignup } from '../reducers/authReducer';
import {
  confirmForgotPassword,
  confirmSignUp,
  forgotPassword,
  getUser,
  loginUser,
  logoutUser,
  resendConfirmationCode,
  signupUser,
} from '../../services/authServices';

export const performLogin = credentials => async dispatch => {
  try {
    await dispatch(loginUser(credentials)).unwrap();
  } catch (error) {
    console.log('Login failed:', error);
  }
};

export const performLogout = () => dispatch => {
  dispatch(logoutUser());
};

export const signUp = (data) => async dispatch => {
  try {
    const response = await dispatch(signupUser(data)).unwrap();
    if (response.username) {
      dispatch(updateSignup({
        username: response.username,
        systemUserInfo: response.systemUserInfo,
        email: data.email,
        firstName: data.firstName,
        lastName: data.lastName,
      }));
    }
  } catch (error) {
    console.error('Signup failed:', error);
  }
};

export const confirmSignUpUser = data => async dispatch => {
  try {
    const response = await dispatch(confirmSignUp(data)).unwrap();
  } catch (error) {
    console.error('confirm signup failed:', error);
  }
};

export const getUserData = userId => async dispatch => {
  try {
    await dispatch(getUser(userId));
  } catch (error) {
    console.error('get user failed:', error);
  }
};

// Forgot Password Action
export const performForgotPassword = email => async dispatch => {
  try {
    await dispatch(forgotPassword(email)).unwrap();
  } catch (error) {
    console.error('Forgot password request failed:', error);
  }
};

// Confirm Forgot Password Action
export const performResetPassword = data => async dispatch => {
  try {
    const response = await dispatch(confirmForgotPassword(data)).unwrap();
    return response;
  } catch (error) {
    console.error('Password reset failed:', error);
  }
};

export const resendOtp = signupData => async dispatch => {
  try {
    const response = await dispatch(resendConfirmationCode(signupData.email)).unwrap();
    return response; 
  } catch (error) {
    console.error('OTP resend failed:', error);
    throw error;
  }
};