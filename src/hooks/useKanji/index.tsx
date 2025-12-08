import { IQueryRequest } from "@models/common/request";
import { IKanjiWithMeaningRequest } from "@models/kanji/request";
import kanjiService from "@services/kanji";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

/**
 * hanlde Kanji List
 * @param params 
 * @returns 
 */
export const useKanjiList = (params: IQueryRequest & { enabled?: boolean; dialogKey?: number }) => {
    const { enabled = true, dialogKey, ...queryParams } = params;
    const { data, isLoading, error } = useQuery({
        queryKey: ["kanji-list", queryParams, dialogKey],
        queryFn: () => kanjiService.getKanjiList(queryParams),
        enabled,
    });
    // Return full data object to match other hooks (includes results and pagination)
    return { data: data?.data?.data, isLoading, error };
};

/**
 * hanlde KạniList Management
 * @param params 
 * @returns 
 */
export const useKanjiListManagement = (params: IQueryRequest & { enabled?: boolean; dialogKey?: number }) => {
    const { enabled = true, dialogKey, ...queryParams } = params;
    const { data, isLoading, error } = useQuery({
        queryKey: ["kanji-list-management", queryParams, dialogKey],
        queryFn: () => kanjiService.getKanjiListManagement(queryParams),
        enabled,
    });
    return { data: data?.data, isLoading, error };
};

/**
 * hanlde Create Kanji With Meaning
 * @returns 
 */
export const useCreateKanjiWithMeaning = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: IKanjiWithMeaningRequest) => kanjiService.createKanjiWithMeaning(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['kanji-list-management'] });
        },
    });
};

/**
 * Handle Update Kanji with meanings
 * @returns useMutation to update kanji
 */
export const useUpdateKanjiWithMeaning = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: ({ identifier, data }: { identifier: string | number; data: Partial<IKanjiWithMeaningRequest> }) =>
            kanjiService.updateKanjiWithMeaning(identifier, data),
        onSuccess: (response: any) => {
            queryClient.invalidateQueries({ queryKey: ['kanji-list'] });
            queryClient.invalidateQueries({ queryKey: ['kanji-list-management'] });
            toast.success(response?.data?.message || t('vocabulary.kanji.updateSuccess'));
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || t('vocabulary.kanji.updateError'));
        },
    });
};
//-------------------------------End-------------------------------//

/**
 * Handle Delete Kanji
 * @returns useMutation to delete kanji
 */
export const useDeleteKanji = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: (id: number) => kanjiService.deleteKanji(id),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['kanji-list'] });
            queryClient.invalidateQueries({ queryKey: ['kanji-list-management'] });
            toast.success(data?.message || t('vocabulary.kanji.deleteSuccess'));
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || t('vocabulary.kanji.deleteError'));
        },
    });
};