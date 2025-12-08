import { RootState } from "@redux/store/store";


// Selector to get the counter value from the state
export const selectAuthState = (state: RootState) => state.auth;
export const selectAuthStateUsername = (state: RootState) => state.auth.username;
export const selectAuthUserId = (state: RootState) => state.auth.userId;
export const selectAuthUserRole = (state: RootState) => state.auth.userRole;
