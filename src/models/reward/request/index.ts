import { z } from "zod";
import { REWARD_TYPE, REWARD_TARGET } from "@constants/reward";
import { TranslationRequest } from "@models/common/request";

/**
 * Create Reward Request Schema
 */
export const CreateRewardSchema = z.object({
    rewardType: z.nativeEnum(REWARD_TYPE).optional(),
    rewardItem: z.number().min(1, 'validation.rewardItemRequired'),
    rewardTarget: z.nativeEnum(REWARD_TARGET).optional(),
    nameTranslations: z.array(TranslationRequest),
});
export type ICreateRewardRequest = z.infer<typeof CreateRewardSchema>;
//------------------End------------------//

export interface IQueryRewardRequest {
    page?: number;
    limit?: number;
    sortBy?: string;
    sort?: 'asc' | 'desc';
    name?: string;
    rewardType?: string;
    rewardTarget?: string;
}
