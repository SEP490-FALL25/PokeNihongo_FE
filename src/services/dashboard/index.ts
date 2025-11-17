import { axiosPrivate } from "@configs/axios";

const dashboardService = {
    getDashboardSubscriptionPlan: async () => {
        return axiosPrivate.get('/dashboard/subscription-stats');
    },
    getDashboardRevenue: async (month: number, year: number) => {
        return axiosPrivate.get(`dashboard/subscription-stats/revennue?month=${month}&year=${year}`);
    },
}

export default dashboardService;