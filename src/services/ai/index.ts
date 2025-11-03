import { axiosPrivate } from "@configs/axios";
import { IQueryRequest } from "@models/common/request";

const geminiService = {
    getGeminiConfigPrompts: async (params: IQueryRequest) => {
        const queryParams = new URLSearchParams();

        if (params.page) queryParams.append('currentPage', params.page.toString());
        if (params.limit) queryParams.append('pageSize', params.limit.toString());

        const queryString = queryParams.toString();
        return await axiosPrivate.get(`/gemini-config/prompts?${queryString}`);
    },

    getGeminiConfigModels: async () => {
        return await axiosPrivate.get('/gemini-config/models');
    }
}

export default geminiService;