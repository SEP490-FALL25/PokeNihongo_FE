
import { CookiesService } from '@utils/cookies';
import { COOKIES } from '@constants/common';
import axios, { AxiosError } from 'axios';

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_APP_LOCAL_API,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptors cho axiosClient
axiosClient.interceptors.request.use(
    (config) => {
        // Đọc language từ Redux store hoặc localStorage
        const language = localStorage.getItem('language') || 'vi';
        config.headers['Accept-Language'] = language;
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

const axiosPrivate = axios.create({
    baseURL: import.meta.env.VITE_APP_LOCAL_API,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});
// Interceptors cho axiosPrivate
axiosPrivate.interceptors.request.use(
    (config) => {
        const token = CookiesService.get(COOKIES.ACCESS_TOKEN);
        const language = localStorage.getItem('language') || 'vi';

        console.log('token', token);
        // const userRole = Cookies.get('userRole');

        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }

        config.headers['Accept-Language'] = language;

        // if (userRole) {
        //     config.headers['X-User-Role'] = userRole;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    },
);

axiosPrivate.interceptors.response.use(
    (response: any) => response,
    (error: AxiosError) => {
        if (error.response?.status === 401) {
            // Xử lý khi bị unauthorized
            console.error('Unauthorized! Redirecting to login...');
        }
        return Promise.reject(error);
    },
);

// Xử lý lỗi toàn cục
const handleError = (error: AxiosError) => {
    if (error.response) {
        console.error('Server Error:', error.response.data);
    } else if (error.request) {
        console.error('No Response:', error.request);
    } else {
        console.error('Error:', error.message);
    }
    return Promise.reject(error);
};

axiosClient.interceptors.response.use((response) => response, handleError);
axiosPrivate.interceptors.response.use((response) => response, handleError);

export { axiosClient, axiosPrivate };