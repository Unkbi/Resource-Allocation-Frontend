import { BusinessImpactState } from "@/app/types/businessImpactTypes";
import { formatAPIResponse } from "@/app/utils/authUtils";
import { createSlice } from "@reduxjs/toolkit";


const initialState :BusinessImpactState = {
    businessImpact: [],
    businessImpactType:[] ,
    loading: false,
    error: null,
};

const businessImpactSlice = createSlice({
    name: "businessImpact",
    initialState,
    reducers: {
        setBusinessImpact: (state, action) => {
            state.businessImpact = formatAPIResponse('BusinessImpact', action.payload)
        },
        clearBusinessImpact: (state) => {
            state.businessImpact = [];
        },
        updateBusinessImpact: (state, action) => {
            const updatedImpact = action.payload;
            if (!state.businessImpact) return;
            const index = state.businessImpact.findIndex(
                impact => impact.Id === updatedImpact.Id
            );
            if (index !== -1) {
                state.businessImpact[index] = {
                    ...state.businessImpact[index],
                    ...updatedImpact,
                };
            }   
        },
        setLoading: (state, action) => {
            state.loading = action.payload;
        },
        setError: (state, action) => {
            state.error = action.payload;
        },
        setBusinessImpactType: (state, action) => {
           state.businessImpactType = formatAPIResponse('BusinessImpactType', action.payload)
        }
    },
});
export const {
    setBusinessImpact,
    clearBusinessImpact,
    setLoading,
    setError,
    setBusinessImpactType,
    updateBusinessImpact,
} = businessImpactSlice.actions;
export default businessImpactSlice.reducer;


