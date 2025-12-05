import { axiosPrivate } from "@configs/axios";
import { ICreateVocabularyFullMultipartType } from "@models/vocabulary/request";
import { IQueryRequest } from "@models/common/request";

const vocabularyService = {
    createVocabulary: (payload: ICreateVocabularyFullMultipartType) => {
        // Build FormData for multipart submission, including optional files
        const formData = new FormData();
        formData.append("word_jp", String(payload.word_jp));
        formData.append("reading", String(payload.reading));
        if (payload.level_n !== undefined && payload.level_n !== null) {
            formData.append("level_n", String(payload.level_n));
        }
        if (payload.word_type_id !== undefined && payload.word_type_id !== null) {
            formData.append("word_type_id", String(payload.word_type_id));
        }
        // Translations: ensure JSON string
        const translationsValue = typeof payload.translations === 'string'
            ? payload.translations
            : JSON.stringify(payload.translations);
        formData.append("translations", translationsValue);

        // Optional media files
        if ((payload as any).imageFile) {
            formData.append("imageFile", (payload as any).imageFile as File);
        }
        if ((payload as any).audioFile) {
            formData.append("audioFile", (payload as any).audioFile as File);
        }

        return axiosPrivate.post("/vocabulary/full", formData, {
            headers: { "Content-Type": "multipart/form-data" },
        });
    },
    getAllVocabularies: async (data: IQueryRequest) => {
        const queryParams = new URLSearchParams();
        if (data.page) queryParams.append('currentPage', data.page.toString());
        if (data.limit) queryParams.append('pageSize', data.limit.toString());
        if (data.search) queryParams.append('search', data.search);
        if (data.levelN) queryParams.append('levelN', data.levelN);
        if (data.sortBy) queryParams.append('sortBy', data.sortBy);
        if (data.sort) queryParams.append('sort', data.sort);
        if (data.lessonId) queryParams.append('lessonId', data.lessonId.toString());

        return axiosPrivate.get(`/vocabulary?${queryParams.toString()}`);
    },
    getStatistics: async () => {
        return axiosPrivate.get('/vocabulary/statistics');
    },
    putVocabulary: async (wordJp: number, regenerateAudio: boolean, data: any) => {
        return axiosPrivate.put(`/vocabulary/by-word/${wordJp}?regenerateAudio=${regenerateAudio}`, data);
    },
    deleteVocabulary: async (id: number) => {
        return axiosPrivate.delete(`/vocabulary/${id}`);
    }
};

export default vocabularyService;


