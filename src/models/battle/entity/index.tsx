import { BATTLE } from "@constants/battle";
import { at, byUser, TranslationInputSchema } from "@models/common/response";
import { z } from "zod";

/**
 * Battle List Leader Board Season Entity Schema
 */
export const BattleListLeaderBoardSeasonEntitySchema = z.object({
    id: z.number(),
    nameKey: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    hasOpened: z.boolean(),
    status: z.enum(BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS),
    enablePrecreate: z.boolean(),
    precreateBeforeEndDays: z.number(),
    isRandomItemAgain: z.boolean(),
    ...byUser,
    ...at,
    nameTranslations: z.array(TranslationInputSchema),
    nameTranslation: z.string(),
});
//----------------------End----------------------//


/**
 * Battle Leader Board Season Detail Entity Schema
 */
export const BattleLeaderBoardSeasonDetailEntitySchema = z.object({
    id: z.number(),
    nameKey: z.string(),
    startDate: z.string(),
    endDate: z.string(),
    hasOpened: z.boolean(),
    status: z.enum(BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS),
    enablePrecreate: z.boolean(),
    precreateBeforeEndDays: z.number(),
    isRandomItemAgain: z.boolean(),
    ...byUser,
    ...at,
    nameTranslation: z.string().nullable(),
    nameTranslations: TranslationInputSchema,
    seasonRankRewards: z.array(z.object({
        id: z.number(),
        rankName: z.string(),
        order: z.number(),
        rewards: z.array(z.object({
            id: z.number(),
            rewardType: z.union([z.string(), z.number()]),
            rewardItem: z.union([z.string(), z.number()]),
            rewardTarget: z.string().nullable(),
            nameTranslation: z.string().nullable(),
        })),
    })),
})
//----------------------End----------------------//