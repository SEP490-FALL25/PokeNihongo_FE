import { BackendPaginationResponseModel } from "@models/common/response";
import { BattleListLeaderBoardSeasonEntitySchema } from "../entity";
import z from "zod";

/**
 * Battle List Leader Board Season Response Schema
 */
const BattleListLeaderBoardSeasonResponseSchema = BackendPaginationResponseModel(BattleListLeaderBoardSeasonEntitySchema);

export type IBattleListLeaderBoardSeasonResponse = z.infer<typeof BattleListLeaderBoardSeasonResponseSchema>;
//----------------------End----------------------//