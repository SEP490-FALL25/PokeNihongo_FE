import { useQuery } from "@tanstack/react-query";
import dashboardService from "@services/dashboard";
import { DashboardRevenueEntitySchema, DashboardSubscriptionPlanEntitySchema } from "@models/subscription/entity";
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


/**
 * Handle Get Dashboard Revenue
 * @returns 
 */
export const useGetDashboardRevenue = (month: number, year: number) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const getDashboardRevenueQuery = useQuery({
        queryKey: ['dashboard-revenue', month, year, currentLanguage],
        queryFn: async () => {
            const response = await dashboardService.getDashboardRevenue(month, year);
            return DashboardRevenueEntitySchema.parse(response.data?.data);
        },
    });
    return { data: getDashboardRevenueQuery.data, isLoading: getDashboardRevenueQuery.isLoading, error: getDashboardRevenueQuery.error };
}
//------------------End------------------//


/**
 * Handle Get Dashboard Jlpt Distribution
 * @returns 
 */
export const useGetDashboardJlptDistribution = () => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const getDashboardJlptDistributionQuery = useQuery({
        queryKey: ['dashboard-jlpt-distribution', currentLanguage],
    });
    return { data: getDashboardJlptDistributionQuery.data, isLoading: getDashboardJlptDistributionQuery.isLoading, error: getDashboardJlptDistributionQuery.error };
}
//------------------End------------------//


/**
 * Handle Get Dashboard User Activation
 * @returns 
 */
export const useGetDashboardUserActivation = () => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const getDashboardUserActivationQuery = useQuery({
        queryKey: ['dashboard-user-activation', currentLanguage],
    });
    return { data: getDashboardUserActivationQuery.data, isLoading: getDashboardUserActivationQuery.isLoading, error: getDashboardUserActivationQuery.error };
}
//------------------End------------------//


/**
 * Handle Get Dashboard User Growth Active User
 * @returns 
 */
export const useGetDashboardUserGrowthActiveUser = (period: string) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const getDashboardUserGrowthActiveUserQuery = useQuery({
        queryKey: ['dashboard-user-growth-active-user', period, currentLanguage],
    });
    return { data: getDashboardUserGrowthActiveUserQuery.data, isLoading: getDashboardUserGrowthActiveUserQuery.isLoading, error: getDashboardUserGrowthActiveUserQuery.error };
}
//------------------End------------------//


/**
 * Handle Get Dashboard User Growth New User
 * @returns 
 */
export const useGetDashboardUserGrowthNewUser = (period: string) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const getDashboardUserGrowthNewUserQuery = useQuery({
        queryKey: ['dashboard-user-growth-new-user', period, currentLanguage],
    });
    return { data: getDashboardUserGrowthNewUserQuery.data, isLoading: getDashboardUserGrowthNewUserQuery.isLoading, error: getDashboardUserGrowthNewUserQuery.error };
}
//------------------End------------------//


/**
 * Handle Get Dashboard User Growth Total User
 * @returns 
 */
export const useGetDashboardUserGrowthTotalUser = () => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const getDashboardUserGrowthTotalUserQuery = useQuery({
        queryKey: ['dashboard-user-growth-total-user', currentLanguage],
    });
    return { data: getDashboardUserGrowthTotalUserQuery.data, isLoading: getDashboardUserGrowthTotalUserQuery.isLoading, error: getDashboardUserGrowthTotalUserQuery.error };
}
//------------------End------------------//