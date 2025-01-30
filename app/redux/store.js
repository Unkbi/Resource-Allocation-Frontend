import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/reducers/authReducer';
import allocationViewReducer from '../redux/reducers/allocationViewReducer';

export const makeStore=()=>{
    return configureStore({
        reducer:{
            user:userReducer,
            allocationView:allocationViewReducer
        }
    })
}