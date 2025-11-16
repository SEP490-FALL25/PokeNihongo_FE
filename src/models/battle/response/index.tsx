import { BackendPaginationResponseModel, BackendResponseModel } from "@models/common/response";
import { BattleLeaderBoardSeasonDetailEntitySchema, BattleListLeaderBoardSeasonEntitySchema } from "../entity";
import z from "zod";

/**
 * Battle List Leader Board Season Response Schema
 */
const BattleListLeaderBoardSeasonResponseSchema = BackendPaginationResponseModel(BattleListLeaderBoardSeasonEntitySchema);

export type IBattleListLeaderBoardSeasonResponse = z.infer<typeof BattleListLeaderBoardSeasonResponseSchema>;
//----------------------End----------------------//


/**
 * Battle Leader Board Season Detail Response Schema
 */
const BattleLeaderBoardSeasonDetailResponseSchema = BackendResponseModel(BattleLeaderBoardSeasonDetailEntitySchema);

export type IBattleLeaderBoardSeasonDetailResponse = z.infer<typeof BattleLeaderBoardSeasonDetailResponseSchema>;
//----------------------End----------------------//