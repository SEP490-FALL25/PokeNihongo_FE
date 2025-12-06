import { useQuery } from "@tanstack/react-query";
import dashboardService from "@services/dashboard";
import { DashboardRevenueEntitySchema, DashboardSubscriptionPlanEntitySchema } from "@models/subscription/entity";
import { useSelector } from "react-redux";
import { selectCurrentLanguage } from "@redux/features/language/selector";
import {
    DashboardJlptDistributionEntitySchema,
    DashboardUserActivationEntitySchema,
    DashboardUserGrowthActiveUserEntitySchema,
    DashboardUserGrowthNewUserEntitySchema,
    DashboardUserGrowthTotalUserEntitySchema,
} from "@models/dashboard/dashboard.entity";

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
        queryFn: async () => {
            const response = await dashboardService.getDashboardJlptDistribution();
            // Try response.data?.data first, fallback to response.data
            const dataToParse = response.data?.data ?? response.data;
            const result = DashboardJlptDistributionEntitySchema.safeParse(dataToParse);
            if (!result.success) {
                console.error('JLPT Distribution validation error:', result.error);
                throw result.error;
            }
            return result.data;
        },
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
        queryFn: async () => {
            const response = await dashboardService.getDashboardUserActivation();
            return DashboardUserActivationEntitySchema.parse(response.data?.data);
        },
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
        queryFn: async () => {
            const response = await dashboardService.getDashboardUserGrowthActiveUser(period);
            return DashboardUserGrowthActiveUserEntitySchema.parse(response.data?.data);
        },
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
        queryFn: async () => {
            const response = await dashboardService.getDashboardUserGrowthNewUser(period);
            return DashboardUserGrowthNewUserEntitySchema.parse(response.data?.data);
        },
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
        queryFn: async () => {
            const response = await dashboardService.getDashboardUserGrowthTotalUser();
            return DashboardUserGrowthTotalUserEntitySchema.parse(response.data?.data);
        },
    });
    return { data: getDashboardUserGrowthTotalUserQuery.data, isLoading: getDashboardUserGrowthTotalUserQuery.isLoading, error: getDashboardUserGrowthTotalUserQuery.error };
}
//------------------End------------------//