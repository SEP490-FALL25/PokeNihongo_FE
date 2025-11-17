import { at, byUser, TranslationInputSchema } from "@models/common/response";
import z from "zod";

/**
 * Reward Entity Schema
 */
export const RewardEntitySchema = z.object({
    id: z.number(),
    nameKey: z.string(),
    rewardType: z.string(),
    rewardItem: z.number(),
    rewardTarget: z.string(),
    nameTranslation: z.string().optional(),
    ...byUser,
    ...at,
})

export type IRewardEntityType = z.infer<typeof RewardEntitySchema>;
//------------------End------------------//


/**
 * Reward By Id Entity Schema
 */
export const RewardByIdEntitySchema = z.object({
    id: z.number(),
    nameKey: z.string(),
    rewardType: z.string(),
    rewardItem: z.number(),
    rewardTarget: z.string(),
    nameTranslations: TranslationInputSchema,
    ...byUser,
    ...at,
})
//------------------End------------------//