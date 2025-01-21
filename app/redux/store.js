import { configureStore } from '@reduxjs/toolkit';
import userReducer from '../redux/reducers/authReducer';

export const makeStore=()=>{
    return configureStore({
        reducer:{
            user:userReducer
        }
    })
}