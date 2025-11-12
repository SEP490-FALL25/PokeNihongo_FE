import battleService from "@services/battle";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectCurrentLanguage } from "@redux/features/language/selector";
import { IBattleListLeaderBoardSeasonResponse } from "@models/battle/response/inde";

/**
 * Handle Get Battle List Leader Board Season
 * @param params 
 * @returns 
 */
export const useBattleListLeaderBoardSeason = (params?: any) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const { data, isLoading, error } = useQuery<IBattleListLeaderBoardSeasonResponse>({
        queryKey: ['battle-list-leader-board-season', params, currentLanguage],
        queryFn: () => battleService.getBattleListLeaderBoardSeason(params),
    });

    const tournaments = Array.isArray(data?.data?.results)
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