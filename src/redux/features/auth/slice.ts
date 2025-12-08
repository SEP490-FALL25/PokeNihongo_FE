// store/slices/editorSlice.ts
import { createSlice } from '@reduxjs/toolkit';
import { initialState } from './state';

const editorSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        setAuthState: (state, action) => {
            const { username, userId, userRole } = action.payload;
            state.username = username ?? state.username;
            state.userId = userId ?? state.userId;
            state.userRole = userRole ?? state.userRole;
        },
        resetAuthState: (state) => {
            state.username = null;
            state.userId = null;
            state.userRole = null;
        },
    },
});


export const {
    setAuthState,
    resetAuthState,
} = editorSlice.actions;
export default editorSlice.reducer;

