import { SUBSCRIPTION } from "@constants/subscription";
import { TranslationInputSchema } from "@models/common/response";
import z from "zod";

/**
 * Dashboard Subscription Plan Entity Schema
 */
export const DashboardSubscriptionPlanEntitySchema = z.object({
    totalActivePlans: z.number(),
    plans: z.array(z.object({
        planId: z.number(),
        subscriptionId: z.number(),
        subscription: z.object({
            id: z.number(),
            nameKey: z.string(),
            descriptionKey: z.string(),
            tagName: z.string(),
            nameTranslation: z.string(),
            nameTranslations: TranslationInputSchema,
            descriptionTranslation: z.string(),
            descriptionTranslations: TranslationInputSchema,
            features: z.array(z.object({
                id: z.number(),
                value: z.string().nullable(),
                feature: z.object({
                    id: z.number(),
                    nameKey: z.string(),
                    featureKey: z.string(),
                    nameTranslation: z.string(),
                    nameTranslations: TranslationInputSchema,
                }),
            })),
        }),
        durationInDays: z.number().nullable(),
        price: z.number(),
        type: z.enum(SUBSCRIPTION.SUBSCRIPTION_TYPE),
        stats: z.object({
            totalPurchases: z.number(),
            activeUsers: z.number(),
            inactiveUsers: z.number(),
        }),
    })),
})
//------------------End------------------//


/**
 * Dashboard Revenue Entity Schema
 */
const RevenueSummarySchema = z.object({
    total: z.number(),
    count: z.number(),
})

export const DashboardRevenueEntitySchema = z.object({
    period: z.object({
        month: z.number(),
        year: z.number(),
    }),
    totalRevenue: z.object({
        month: z.number(),
        year: z.number(),
    }),
    plans: z.array(z.object({
        planId: z.number(),
        subscriptionId: z.number(),
        subscription: z.object({
            id: z.number(),
            nameKey: z.string(),
            descriptionKey: z.string(),
            tagName: z.string(),
        }),
        durationInDays: z.number().nullable(),
        price: z.number(),
        type: z.enum(SUBSCRIPTION.SUBSCRIPTION_TYPE),
        revenue: z.object({
            month: RevenueSummarySchema,
            year: RevenueSummarySchema,
        }),
    })),
})
//------------------End------------------//