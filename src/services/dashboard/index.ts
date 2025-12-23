import { axiosPrivate } from "@configs/axios";

const dashboardService = {
    getDashboardSubscriptionPlan: async () => {
        return axiosPrivate.get('/dashboard/subscription-stats');
    },
    getDashboardRevenue: async (month: number, year: number) => {
        return axiosPrivate.get('/dashboard/subscription-stats/revennue', {
            params: { month, year },
        });
    },
    getDashboardJlptDistribution: async () => {
        return await axiosPrivate.get('/dashboard/user-growth/jlpt-distribution');
    },
    getDashboardUserActivation: async () => {
        return await axiosPrivate.get('/dashboard/user-growth/account-activation');
    },
    getDashboardUserGrowthActiveUser: async (period: string) => { // year, week, month, day
        return await axiosPrivate.get(`/dashboard/user-growth/active-users?period=${period}`);
    },
    getDashboardUserGrowthNewUser: async (period: string) => { // year, week, month, day
        return await axiosPrivate.get(`/dashboard/user-growth/new-users?period=${period}`);
    },
    getDashboardUserGrowthTotalUser: async () => {
        return await axiosPrivate.get('/dashboard/user-growth/total-users');
    },
    getEngagementPopularContent: async () => {
        return await axiosPrivate.get('/dashboard/engagement/popular-content');
    },
    getEngagementSparklesAccumulation: async () => {
        return await axiosPrivate.get('/dashboard/engagement/sparkles-accumulation');
    },
    //TODO: Đợi Pilu làm lại
    getEngagementBattleActivity: async () => {
        return await axiosPrivate.get('/dashboard/engagement/battle-activity');
    },
    getEngagementStarterPokemonDistribution: async () => {
        return await axiosPrivate.get('/dashboard/engagement/starter-pokemon-distribution');
    },
    getEngagementStreakRelention: async () => {
        return await axiosPrivate.get('/dashboard/engagement/streak-retention');
    },
    getContentPerformanceCompleteRate: async () => {
        return await axiosPrivate.get('/dashboard/content-performance/completion-rate');
    },
    getLeaderboardSeasonStats: async () => {
        return await axiosPrivate.get(`/dashboard/leaderboard-season/overview`);
    },
    getLeaderboardSeasonStatsBySeasonId: async (seasonId: number, period: string) => {
        return await axiosPrivate.get(`/dashboard/leaderboard-season/${seasonId}?period=${period}`);
    },
    getStatsGacha: async () => {
        return await axiosPrivate.get('/dashboard/gacha-stats/overview');
    },
    getGachaStatsGachaDetail: async (gachaBannerId: number) => {
        return await axiosPrivate.get(`/dashboard/gacha-stats/${gachaBannerId}`);
    },
}

export default dashboardService;