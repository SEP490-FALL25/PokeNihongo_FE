import { axiosPrivate } from "@configs/axios";
import { ICreateGeminiConfigModelsRequest, IUpdateModelConfigsPolicySchemaRequest } from "@models/ai/request";
import { IQueryRequest } from "@models/common/request";

const geminiService = {
    getGeminiConfigPrompts: async (params: IQueryRequest) => {
        const { page = 1, limit = 10, sortBy, sortOrder, ...rest } = params || {};
        const qsParts: string[] = [];

        if (sortBy && sortOrder) {
            const sortPrefix = sortOrder === 'desc' ? '-' : '';
            qsParts.push(`sort:${sortPrefix}${sortBy}`);
        } else if (sortBy) {
            qsParts.push(`sort:${sortBy}`);
        }

        Object.entries(rest).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (key.endsWith('Like')) {
                    const fieldName = key.replace('Like', '');
                    qsParts.push(`${fieldName}:like=${encodeURIComponent(String(value))}`);
                } else {
                    qsParts.push(`${key}=${encodeURIComponent(String(value))}`);
                }
            }
        });

        const qs = qsParts.join(",");

        return await axiosPrivate.get("/gemini-config/promt", {
            params: {
                qs,
                currentPage: page,
                pageSize: limit,
            },
        });
    },

    getConfigPresets: async () => {
        return await axiosPrivate.get('/gemini-config/presets');
    },

    getGeminiModels: async () => {
        return await axiosPrivate.get('/gemini-config/models');
    },

    getConfigModels: async (params?: IQueryRequest) => {
        const { page = 1, limit = 10, sortBy, sortOrder, ...rest } = params || {};
        const qsParts: string[] = [];

        if (sortBy && sortOrder) {
            const sortPrefix = sortOrder === 'desc' ? '-' : '';
            qsParts.push(`sort:${sortPrefix}${sortBy}`);
        } else if (sortBy) {
            qsParts.push(`sort:${sortBy}`);
        }

        Object.entries(rest).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== '') {
                if (key.endsWith('Like')) {
                    const fieldName = key.replace('Like', '');
                    qsParts.push(`${fieldName}:like=${encodeURIComponent(String(value))}`);
                } else {
                    qsParts.push(`${key}=${encodeURIComponent(String(value))}`);
                }
            }
        });

        const qs = qsParts.join(",");

        return await axiosPrivate.get('/gemini-config/config-models', {
            params: {
                qs,
                currentPage: page,
                pageSize: limit,
            },
        });
    },

    getConfigModelById: async (id: number) => {
        return await axiosPrivate.get(`/gemini-config/config-models/${id}`);
    },

    getModelConfigsPolicySchema: async (q?: string) => {
        return await axiosPrivate.get('/gemini-config/admin/schema', {
            params: q ? { q } : undefined,
        });
    },

    getModelConfigsPolicySchemaFields: async (entities: string[]) => {
        return await axiosPrivate.get('/gemini-config/admin/schema/fields', {
            params: {
                entities,
            },
        });
    },

    updateModelConfigsPolicySchema: async (modelId: number, data: IUpdateModelConfigsPolicySchemaRequest) => {
        return await axiosPrivate.put(`/gemini-config/admin/schema/${modelId}`, data);
    },

    createGeminiConfigModels: async (data: ICreateGeminiConfigModelsRequest) => {
        return await axiosPrivate.post('/gemini-config/config-models', data);
    },
}

export default geminiService;