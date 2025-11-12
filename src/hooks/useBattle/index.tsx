import battleService from "@services/battle";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectCurrentLanguage } from "@redux/features/language/selector";
import { IBattleListLeaderBoardSeasonResponse } from "@models/battle/response/inde";
import { z } from "zod";
import { BattleListLeaderBoardSeasonEntitySchema } from "@models/battle/entity";

interface IQueryBattleLeaderBoardSeasonParams {
    nameTranslation?: string;
    startDate?: string;
    endDate?: string;
    hasOpened?: boolean;
    status?: string;
    currentPage?: number;
    pageSize?: number;
}

type BattleListLeaderBoardSeasonEntity = z.infer<typeof BattleListLeaderBoardSeasonEntitySchema>;

/**
 * Handle Get Battle List Leader Board Season
 * @param params 
 * @returns 
 */
export const useBattleListLeaderBoardSeason = (params?: IQueryBattleLeaderBoardSeasonParams) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const { data, isLoading, error } = useQuery<IBattleListLeaderBoardSeasonResponse>({
        queryKey: ['battle-list-leader-board-season', params, currentLanguage],
        queryFn: () => battleService.getBattleListLeaderBoardSeason(params),
    });

    const tournaments: BattleListLeaderBoardSeasonEntity[] = Array.isArray(data?.data?.results)
        ? data.data.results
        : [];

    return {
        data: tournaments,
        pagination: data?.data?.pagination || {
            current: 1,
            pageSize: 15,
            totalPage: 1,
            totalItem: 0,
        },
        isLoading,
        error,
    };
}
//----------------------End----------------------//