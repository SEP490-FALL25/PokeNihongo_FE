declare namespace REDUX {
    export interface IAuthState {
        username: string | null;
        userId: number | null;
        userRole: string | null;
    }
}