import battleService from "@services/battle";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectCurrentLanguage } from "@redux/features/language/selector";
import { IBattleLeaderBoardSeasonDetailResponse, IBattleListLeaderBoardSeasonResponse } from "@models/battle/response";
import { ICreateBattleLeaderBoardSeasonRequest } from "@models/battle/request";
import { toast } from "react-toastify";

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


/**
 * Handle Get Battle Leader Board Season Detail
 * @param leaderboardSeasonId 
 * @returns 
 */
export const useGetBattleLeaderBoardSeasonDetail = (leaderboardSeasonId: number) => {
    const { data, isLoading, error } = useQuery<IBattleLeaderBoardSeasonDetailResponse>({
        queryKey: ['battle-leader-board-season-detail', leaderboardSeasonId],
        queryFn: () => battleService.getBattleLeaderBoardSeasonDetail(leaderboardSeasonId),
    });
    return { data: data?.data, isLoading, error };
}
//----------------------End----------------------//


/**
 * Handle Create Battle Leader Board Season
 * @param data 
 * @returns 
 */
export const useCreateBattleLeaderBoardSeason = () => {
    const queryClient = useQueryClient();
    const createBattleLeaderBoardSeasonMutation = useMutation({
        mutationFn: (data: ICreateBattleLeaderBoardSeasonRequest) => battleService.createBattleLeaderBoardSeason(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['battle-list-leader-board-season'] });
            toast.success("Tạo mùa giải thành công");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo mùa giải");
        },
    })
    return createBattleLeaderBoardSeasonMutation
}
//----------------------End----------------------//


/**
 * Handle Delete Battle Leader Board Season
 * @returns useMutation to delete battle leader board season
 */
export const useDeleteBattleLeaderBoardSeason = () => {
    const queryClient = useQueryClient();
    const deleteBattleLeaderBoardSeasonMutation = useMutation({
        mutationFn: (id: number) => battleService.deleteBattleLeaderBoardSeason(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['battle-list-leader-board-season'] });
            toast.success("Xóa mùa giải thành công");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa mùa giải");
        },
    })
    return deleteBattleLeaderBoardSeasonMutation
}
//----------------------End----------------------//