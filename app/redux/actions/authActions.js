import { updateSignup } from '../reducers/authReducer';
import { loginUser, logoutUser, signupUser } from './../../services/authServices';

// Example of wrapping an async action for added logic
export const performLogin = (credentials) => async (dispatch) => {
  try {
    await dispatch(loginUser(credentials)).unwrap(); // Handle errors if needed
    console.log('Login successful!');
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