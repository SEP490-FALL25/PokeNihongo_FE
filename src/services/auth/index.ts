import { axiosClient, axiosPrivate } from "@configs/axios";
import { ILoginFormDataRequest } from "@models/user/request";

const authService = {
    login: async (data: ILoginFormDataRequest) => {
        return axiosClient.post('/auth/login', data)
    },
    getMe: async () => {
        return axiosPrivate.get('/auth/me');
    }
}

export default authService;