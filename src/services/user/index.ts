import { axiosPrivate } from "@configs/axios";
import { IQueryRequest } from "@models/common/request";

const userService = {
    getUserList: async (params: IQueryRequest) => {
        const { page = 1, limit = 15, sortBy, sortOrder, ...rest } = params || {};
        const qsParts: string[] = [];

        if (sortBy && sortOrder) {
            const sortPrefix = sortOrder === 'desc' ? '-' : '';
            qsParts.push(`sort:${sortPrefix}${sortBy}`);
        } else if (sortBy) {
            qsParts.push(`sort:${sortBy}`);
        }

        Object.entries(rest).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (key.endsWith('Like')) {
                    const fieldName = key.replace('Like', '');
                    qsParts.push(`${fieldName}:like=${encodeURIComponent(String(value))}`);
                } else {
                    qsParts.push(`${key}=${encodeURIComponent(String(value))}`);
                }
            }
        });

        const qs = qsParts.join(",");

        return await axiosPrivate.get("/user", {
            params: {
                qs,
                currentPage: page,
                pageSize: limit,
            },
        });
    },
}

export default userService;