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