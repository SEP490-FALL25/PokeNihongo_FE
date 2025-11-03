import { axiosPrivate } from "@configs/axios";
import { IQueryRequest } from "@models/common/request";

const permissionService = {
    getRoleList: async (params: IQueryRequest) => {
        const { page, limit, sortBy, sortOrder, ...rest } = params || {};
        const qsParts: string[] = [];

        if (sortBy) {
            const isDesc = typeof sortOrder === 'string' && sortOrder.toLowerCase() === 'desc';
            qsParts.push(`sort:${isDesc ? '-' : ''}${sortBy}`);
        }

        Object.entries(rest).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;
            qsParts.push(`${key}=${encodeURIComponent(String(value))}`);
        });

        const queryParams = new URLSearchParams();
        if (page !== undefined) queryParams.set('currentPage', String(page));
        if (limit !== undefined) queryParams.set('pageSize', String(limit));
        if (qsParts.length) queryParams.set('qs', qsParts.join(','));

        return axiosPrivate.get('/roles', { params: queryParams });
    },
    getPermissionByRoleId: async (roleId: number, params: IQueryRequest) => {
        const { page, limit, sortBy, sortOrder, ...rest } = params || {};
        const qsParts: string[] = [];

        if (typeof sortBy === 'string' && sortBy.trim()) {
            if (sortBy.includes(',') || sortBy.startsWith('-')) {
                qsParts.push(`sort:${sortBy}`);
            } else {
                const isDesc = typeof sortOrder === 'string' && sortOrder.toLowerCase() === 'desc';
                qsParts.push(`sort:${isDesc ? '-' : ''}${sortBy}`);
            }
        }

        Object.entries(rest).forEach(([key, value]) => {
            if (value === undefined || value === null || value === '') return;
            if (key.endsWith('Like')) {
                const field = key.slice(0, -4);
                qsParts.push(`${field}:like=${encodeURIComponent(String(value))}`);
            } else {
                qsParts.push(`${key}=${encodeURIComponent(String(value))}`);
            }
        });

        const queryParams = new URLSearchParams();
        if (page !== undefined) queryParams.set('currentPage', String(page));
        if (limit !== undefined) queryParams.set('pageSize', String(limit));
        if (qsParts.length) queryParams.set('qs', qsParts.join(','));

        return axiosPrivate.get(`/roles/${roleId}`, { params: queryParams });
    },
};

export default permissionService;