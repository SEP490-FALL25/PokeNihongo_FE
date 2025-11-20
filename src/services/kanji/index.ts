import { axiosPrivate } from "@configs/axios";
import { IKanjiWithMeaningRequest } from "@models/kanji/request";
import { IQueryRequest } from "@models/common/request";

const kanjiService = {
    getKanjiList: async ({ page, limit, search, sortOrder, sortBy, ...rest }: IQueryRequest = {}) => {
        return await axiosPrivate.get('/kanji', {
            params: {
                page,
                limit,
                search,
                sortOrder,
                sortBy,
                ...rest,
            },
        });
    },
    getKanjiListManagement: async ({ page, limit, search, sortOrder, sortBy, ...rest }: IQueryRequest = {}) => {
        return await axiosPrivate.get('/kanji/management', {
            params: {
                page,
                limit,
                search,
                sortOrder,
                sortBy,
                ...rest,
            },
        });
    },
    createKanjiWithMeaning: async (data: IKanjiWithMeaningRequest) => {
        return axiosPrivate.post('/kanji/with-meanings', data);
    },

    deleteKanji: async (id: number) => {
        return axiosPrivate.delete(`/kanji/${id}`);
    },
};

export default kanjiService;