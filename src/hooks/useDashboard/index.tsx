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
    DashboardEngagementPopularContentEntitySchema,
    DashboardEngagementSparklesAccumulationEntitySchema,
    DashboardEngagementStarterPokemonDistributionEntitySchema,
    DashboardEngagementStreakRelentionEntitySchema,
    DashboardContentPerformanceCompleteRateEntitySchema,
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
            return DashboardJlptDistributionEntitySchema.parse(response.data?.data);
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


/**
 * Handle Get Dashboard Engagement Popular Content
 * @returns 
 */
export const useGetDashboardEngagementPopularContent = () => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const getDashboardEngagementPopularContentQuery = useQuery({
        queryKey: ['dashboard-engagement-popular-content', currentLanguage],
        queryFn: async () => {
            const response = await dashboardService.getEngagementPopularContent();
            return DashboardEngagementPopularContentEntitySchema.parse(response.data?.data);
        },
    });
    return { data: getDashboardEngagementPopularContentQuery.data, isLoading: getDashboardEngagementPopularContentQuery.isLoading, error: getDashboardEngagementPopularContentQuery.error };
}
//------------------End------------------//


/**
 * Handle Get Dashboard Engagement Sparkles Accumulation
 * @returns 
 */
export const useGetDashboardEngagementSparklesAccumulation = () => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const getDashboardEngagementSparklesAccumulationQuery = useQuery({
        queryKey: ['dashboard-engagement-sparkles-accumulation', currentLanguage],
        queryFn: async () => {
            const response = await dashboardService.getEngagementSparklesAccumulation();
            return DashboardEngagementSparklesAccumulationEntitySchema.parse(response.data?.data);
        },
    });
    return { data: getDashboardEngagementSparklesAccumulationQuery.data, isLoading: getDashboardEngagementSparklesAccumulationQuery.isLoading, error: getDashboardEngagementSparklesAccumulationQuery.error };
}
//------------------End------------------//


/**
 * Handle Get Dashboard Engagement Battle Activity
 * @returns 
 */
export const useGetDashboardEngagementBattleActivity = () => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    return useQuery({
        queryKey: ['dashboard-engagement-battle-activity', currentLanguage],
        queryFn: async () => {
            const response = await dashboardService.getEngagementBattleActivity();
            return response.data?.data;
        },
    });
}
//------------------End------------------//


/**
 * Handle Get Dashboard Engagement Starter Pokemon Distribution
 * @returns 
 */
export const useGetDashboardEngagementStarterPokemonDistribution = () => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const getDashboardEngagementStarterPokemonDistributionQuery = useQuery({
        queryKey: ['dashboard-engagement-starter-pokemon-distribution', currentLanguage],
        queryFn: async () => {
            const response = await dashboardService.getEngagementStarterPokemonDistribution();
            return DashboardEngagementStarterPokemonDistributionEntitySchema.parse(response.data?.data);
        },
    });
    return { data: getDashboardEngagementStarterPokemonDistributionQuery.data, isLoading: getDashboardEngagementStarterPokemonDistributionQuery.isLoading, error: getDashboardEngagementStarterPokemonDistributionQuery.error };
}
//------------------End------------------//


/**
 * Handle Get Dashboard Engagement Streak Relention
 * @returns 
 */
export const useGetDashboardEngagementStreakRelention = () => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const getDashboardEngagementStreakRelentionQuery = useQuery({
        queryKey: ['dashboard-engagement-streak-relention', currentLanguage],
        queryFn: async () => {
            const response = await dashboardService.getEngagementStreakRelention();
            return DashboardEngagementStreakRelentionEntitySchema.parse(response.data?.data);
        },
    });
    return { data: getDashboardEngagementStreakRelentionQuery.data, isLoading: getDashboardEngagementStreakRelentionQuery.isLoading, error: getDashboardEngagementStreakRelentionQuery.error };
}
//------------------End------------------//


/**
 * Handle Get Dashboard Content Performance Complete Rate
 * @returns 
 */
export const useGetDashboardContentPerformanceCompleteRate = () => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const getDashboardContentPerformanceCompleteRateQuery = useQuery({
        queryKey: ['dashboard-content-performance-complete-rate', currentLanguage],
        queryFn: async () => {
            const response = await dashboardService.getContentPerformanceCompleteRate();
            return DashboardContentPerformanceCompleteRateEntitySchema.parse(response.data?.data);
        },
    });
    return { data: getDashboardContentPerformanceCompleteRateQuery.data, isLoading: getDashboardContentPerformanceCompleteRateQuery.isLoading, error: getDashboardContentPerformanceCompleteRateQuery.error };
}
//------------------End------------------//


/**
 * Handle Get Dashboard Leaderboard Season Stats Overview
 * @returns 
 */
export const useGetDashboardLeaderboardSeasonStats = () => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    return useQuery({
        queryKey: ['dashboard-leaderboard-season-stats', currentLanguage],
        queryFn: async () => {
            const response = await dashboardService.getLeaderboardSeasonStats();
            return response.data?.data;
        },
    });
}
//------------------End------------------//


/**
 * Handle Get Dashboard Leaderboard Season Stats By Season Id
 * @param seasonId - The season ID
 * @param period - The period (day, week, month)
 * @returns 
 */
export const useGetDashboardLeaderboardSeasonStatsBySeasonId = (seasonId: number | undefined, period: string) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    return useQuery({
        queryKey: ['dashboard-leaderboard-season-stats-by-season-id', seasonId, period, currentLanguage],
        queryFn: async () => {
            if (!seasonId) return null;
            const response = await dashboardService.getLeaderboardSeasonStatsBySeasonId(seasonId, period);
            return response.data?.data;
        },
        enabled: !!seasonId,
    });
}
//------------------End------------------//