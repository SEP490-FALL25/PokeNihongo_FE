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