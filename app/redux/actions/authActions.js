import { loginUser, logoutUser } from '../services/authService';

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
