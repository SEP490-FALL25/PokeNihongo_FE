import { axiosPrivate } from "@configs/axios";
import { IQueryRequest } from "@models/common/request";

interface IQueryBattleLeaderBoardSeasonRequest extends IQueryRequest {
    nameTranslation?: string;
    startDate?: string;
    endDate?: string;
    hasOpened?: boolean;
    status?: string;
    currentPage?: number;
    pageSize?: number;
}

const battleService = {
    getBattleListLeaderBoardSeason: async (params?: IQueryBattleLeaderBoardSeasonRequest) => {
        const queryParams = new URLSearchParams();
        const qsParts: string[] = [];

        // Filters
        if (params?.nameTranslation) {
            qsParts.push(`nameTranslation:like=${params.nameTranslation}`);
        }

        if (params?.startDate) {
            qsParts.push(`startDate:lte=${params.startDate}`);
        }

        if (params?.endDate) {
            qsParts.push(`endDate:gte=${params.endDate}`);
        }

        if (params?.hasOpened !== undefined) {
            qsParts.push(`hasOpened=${params.hasOpened}`);
        }

        if (params?.status) {
            qsParts.push(`status=${params.status}`);
        }

        // Add qs parameter if we have any filters
        if (qsParts.length > 0) {
            queryParams.append('qs', qsParts.join(','));
        }

        // Pagination
        if (params?.currentPage) {
            queryParams.append('currentPage', params.currentPage.toString());
        }

        if (params?.pageSize) {
            queryParams.append('pageSize', params.pageSize.toString());
        }

        const queryString = queryParams.toString();
        const response = await axiosPrivate.get(`/leaderboard-season${queryString ? `?${queryString}` : ''}`);
        return response.data;
    },
}

export default battleService;