import { z } from "zod";

/**
 * Dashboard Jlpt Distribution Entity Schema
 */
export const DashboardJlptDistributionEntitySchema = z.object({
    summary: z.object({
        N3: z.object({
            total: z.number(),
            percent: z.coerce.number(),
        }),
        N4: z.object({
            total: z.number(),
            percent: z.coerce.number(),
        }),
        N5: z.object({
            total: z.number(),
            percent: z.coerce.number(),
        }),
    }),
    totalUsers: z.number(),
});

export type IDashboardJlptDistributionEntity = z.infer<typeof DashboardJlptDistributionEntitySchema>;
//------------------End------------------//


/**
 * Dashboard User Activation Entity Schema
 */
export const DashboardUserActivationEntitySchema = z.object({
    summary: z.object({
        total: z.number(),
    }),
    pending_test: z.object({
        count: z.number(),
        percent: z.coerce.number(),
    }),
    test_again: z.object({
        count: z.number(),
        percent: z.coerce.number(),
    }),
    pending_choose_level_jlpt: z.object({
        count: z.number(),
        percent: z.coerce.number(),
    }),
    pending_choose_pokemon: z.object({
        count: z.number(),
        percent: z.coerce.number(),
    }),
});

export type IDashboardUserActivationEntity = z.infer<typeof DashboardUserActivationEntitySchema>;
//------------------End------------------//


/**
 * Dashboard User Growth Active User Entity Schema
 */
export const DashboardUserGrowthActiveUserEntitySchema = z.object({
    activeUsers: z.number(),
    period: z.string(),
});

export type IDashboardUserGrowthActiveUserEntity = z.infer<typeof DashboardUserGrowthActiveUserEntitySchema>;
//------------------End------------------//


/**
 * Dashboard User Growth New User Entity Schema
 */
export const DashboardUserGrowthNewUserEntitySchema = z.object({
    count: z.number(),
    period: z.string(),
});

export type IDashboardUserGrowthNewUserEntity = z.infer<typeof DashboardUserGrowthNewUserEntitySchema>;
//------------------End------------------//


/**
 * Dashboard User Growth Total User Entity Schema
 */
export const DashboardUserGrowthTotalUserEntitySchema = z.object({
    total: z.number(),
});

export type IDashboardUserGrowthTotalUserEntity = z.infer<typeof DashboardUserGrowthTotalUserEntitySchema>;
//------------------End------------------//


/**
 * Dashboard Engagement Popular Content Entity Schema
 */
export const DashboardEngagementPopularContentEntitySchema = z.object({
    topContent: z.array(z.object({
        lessonId: z.number(),
        titleKey: z.string(),
        titleJp: z.string(),
        titleTranslation: z.string(),
        completedCount: z.number(),
    })),
});
export type IDashboardEngagementPopularContentEntity = z.infer<typeof DashboardEngagementPopularContentEntitySchema>;
//------------------End------------------//


/**
 * Dashboard Engagement Sparkles Accumulation Entity Schema
 */
export const DashboardEngagementSparklesAccumulationEntitySchema = z.object({
    distribution: z.object({
        "0-100": z.object({
            count: z.number(),
            percent: z.coerce.number(),
        }),
        "101-500": z.object({
            count: z.number(),
            percent: z.coerce.number(),
        }),
        "501-1000": z.object({
            count: z.number(),
            percent: z.coerce.number(),
        }),
        "1001-5000": z.object({
            count: z.number(),
            percent: z.coerce.number(),
        }),
        "5000+": z.object({
            count: z.number(),
            percent: z.coerce.number(),
        }),
    }),
    totalUsers: z.number(),
    averageSparkles: z.number()
});
export type IDashboardEngagementSparklesAccumulationEntity = z.infer<typeof DashboardEngagementSparklesAccumulationEntitySchema>;
//------------------End------------------//


//TODO: Dashboard Engagement Battle Activity Entity Schema

/**
 * Dashboard Engagement Starter Pokemon Distribution Entity Schema
 */
export const DashboardEngagementStarterPokemonDistributionEntitySchema = z.object({
    starters: z.array(z.object({
        pokemonId: z.number(),
        nameJp: z.string(),
        imageUrl: z.string().url(),
        count: z.number(),
        percent: z.coerce.number(),
    })),
    totalCount: z.number(),
});
export type IDashboardEngagementStarterPokemonDistributionEntity = z.infer<typeof DashboardEngagementStarterPokemonDistributionEntitySchema>;
//------------------End------------------//