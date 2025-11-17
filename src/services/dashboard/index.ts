import { axiosPrivate } from "@configs/axios";

const dashboardService = {
    getDashboardSubscriptionPlan: async () => {
        return axiosPrivate.get('/dashboard/subscription-stats');
    },
}

export default dashboardService;