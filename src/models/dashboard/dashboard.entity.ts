import { z } from "zod";

/**
 * Dashboard Jlpt Distribution Entity Schema
 */
const DashboardJlptDistributionEntitySchema = z.object({
    summary: z.object({
        N3: z.object({
            total: z.number(),
            percent: z.number(),
        }),
        N4: z.object({
            total: z.number(),
            percent: z.number(),
        }),
        N5: z.object({
            total: z.number(),
            percent: z.number(),
        }),
    }),
    totalUsers: z.number(),
});

export type IDashboardJlptDistributionEntity = z.infer<typeof DashboardJlptDistributionEntitySchema>;
//------------------End------------------//


/**
 * Dashboard User Activation Entity Schema
 */
const DashboardUserActivationEntitySchema = z.object({
    summary: z.object({
        total: z.number(),
    }),
    pending_test: z.object({
        count: z.number(),
        percent: z.number(),
    }),
    test_again: z.object({
        count: z.number(),
        percent: z.number(),
    }),
    pending_choose_level_jlpt: z.object({
        count: z.number(),
        percent: z.number(),
    }),
    pending_choose_pokemon: z.object({
        count: z.number(),
        percent: z.number(),
    }),
});

export type IDashboardUserActivationEntity = z.infer<typeof DashboardUserActivationEntitySchema>;
//------------------End------------------//


/**
 * Dashboard User Growth Active User Entity Schema
 */
const DashboardUserGrowthActiveUserEntitySchema = z.object({
    activeUsers: z.number(),
    period: z.string(),
});

export type IDashboardUserGrowthActiveUserEntity = z.infer<typeof DashboardUserGrowthActiveUserEntitySchema>;
//------------------End------------------//


/**
 * Dashboard User Growth New User Entity Schema
 */
const DashboardUserGrowthNewUserEntitySchema = z.object({
    count: z.number(),
    period: z.string(),
});

export type IDashboardUserGrowthNewUserEntity = z.infer<typeof DashboardUserGrowthNewUserEntitySchema>;
//------------------End------------------//


/**
 * Dashboard User Growth Total User Entity Schema
 */
const DashboardUserGrowthTotalUserEntitySchema = z.object({
    total: z.number(),
});

export type IDashboardUserGrowthTotalUserEntity = z.infer<typeof DashboardUserGrowthTotalUserEntitySchema>;