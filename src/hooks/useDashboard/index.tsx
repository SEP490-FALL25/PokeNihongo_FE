import { useQuery } from "@tanstack/react-query";
import dashboardService from "@services/dashboard";
import { DashboardSubscriptionPlanEntitySchema } from "@models/subscription/entity";
import { useSelector } from "react-redux";
import { selectCurrentLanguage } from "@redux/features/language/selector";

/**
 * Handle Get Dashboard Subscription Plan
 * @returns 
 */
export const useGetDashboardSubscriptionPlan = () => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const getDashboardSubscriptionPlanQuery = useQuery({
        queryKey: ['dashboard-subscription-plan', currentLanguage],
        queryFn: async () => {
            const response = await dashboardService.getDashboardSubscriptionPlan();
            return DashboardSubscriptionPlanEntitySchema.parse(response.data?.data);
        },
    });
    return { data: getDashboardSubscriptionPlanQuery.data, isLoading: getDashboardSubscriptionPlanQuery.isLoading, error: getDashboardSubscriptionPlanQuery.error };
}
//------------------End------------------//