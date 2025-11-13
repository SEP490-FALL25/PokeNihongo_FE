import { BATTLE } from "@constants/battle";
import { TranslationRequest } from "@models/common/request";
import { z } from "zod";

/**
 * Create Battle Leader Board Season Request Schema
 */
export const CreateBattleLeaderBoardSeasonRequestSchema = z.object({
    status: z.enum(BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS),
    enablePrecreate: z.boolean(),
    precreateBeforeEndDays: z.number(),
    isRandomItemAgain: z.boolean(),
    nameTranslations: z.array(TranslationRequest),
});

export type ICreateBattleLeaderBoardSeasonRequest = z.infer<typeof CreateBattleLeaderBoardSeasonRequestSchema>;
//---------------------End------------------------//