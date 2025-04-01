"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.performResetPassword = exports.performForgotPassword = exports.getUserData = exports.confirmSignUpUser = exports.signUp = exports.performLogout = exports.performLogin = void 0;
const authReducer_1 = require("../reducers/authReducer");
const authServices_1 = require("./../../services/authServices");
const performLogin = (credentials) => async (dispatch) => {
    try {
        await dispatch((0, authServices_1.loginUser)(credentials)).unwrap();
    }
    catch (error) {
        console.log('Login failed:', error);
    }
};
exports.performLogin = performLogin;
const performLogout = () => (dispatch) => {
    dispatch((0, authServices_1.logoutUser)());
};
exports.performLogout = performLogout;
const signUp = (data, email) => async (dispatch) => {
    try {
        const response = await dispatch((0, authServices_1.signupUser)(data)).unwrap();
        if (response.status === 'ok') {
            dispatch((0, authReducer_1.updateSignup)(email));
        }
    }
    catch (error) {
        console.error('Signup failed:', error);
    }
};
exports.signUp = signUp;
const confirmSignUpUser = (data) => async (dispatch) => {
    try {
        const response = await dispatch((0, authServices_1.confirmSignUp)(data)).unwrap();
        console.log('confirm signup:', response);
    }
    catch (error) {
        console.error('confirm signup failed:', error);
    }
};
exports.confirmSignUpUser = confirmSignUpUser;
const getUserData = () => async (dispatch) => {
    try {
        await dispatch((0, authServices_1.getUser)());
    }
    catch (error) {
        console.error('get user failed:', error);
    }
};
exports.getUserData = getUserData;
// Forgot Password Action
const performForgotPassword = (email) => async (dispatch) => {
    try {
        await dispatch((0, authServices_1.forgotPassword)(email)).unwrap();
    }
    catch (error) {
        console.error('Forgot password request failed:', error);
    }
};
exports.performForgotPassword = performForgotPassword;
// Confirm Forgot Password Action
const performResetPassword = (data) => async (dispatch) => {
    try {
        const response = await dispatch((0, authServices_1.confirmForgotPassword)(data)).unwrap();
        console.log('Password reset successful:', response);
    }
    catch (error) {
        console.error('Password reset failed:', error);
    }
};
exports.performResetPassword = performResetPassword;
