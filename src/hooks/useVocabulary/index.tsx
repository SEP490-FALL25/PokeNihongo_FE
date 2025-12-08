import { IQueryRequest } from "@models/common/request";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import vocabularyService from "@services/vocabulary";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { IUpdateVocabularyPayload } from "@models/vocabulary/request";

/**
 * hanlde Vocabulary List
 * @param params 
 * @returns 
 */
export const useVocabularyList = (params: IQueryRequest & { enabled?: boolean; dialogKey?: number }) => {
    const { page, limit, search, levelN, sortBy, sort, enabled = true, dialogKey, lessonId } = params;

    const { data, isLoading, error } = useQuery({
        queryKey: ["vocabulary-list", page, limit, search, levelN, sortBy, sort, dialogKey, lessonId],
        queryFn: () => vocabularyService.getAllVocabularies(params),
        enabled,
    });

    return { data: data?.data?.data, isLoading, error };
};


/**
 * hanlde Vocabulary Statistics
 * @returns 
 */
export const useVocabularyStatistics = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['vocabulary-statistics'],
        queryFn: () => vocabularyService.getStatistics(),
    });
    return { data: data?.data?.data, isLoading, error };
};
//--------------------------------End--------------------------------//


/**
 * Handle Delete Vocabulary
 * @returns useMutation to delete vocabulary
 */
export const useDeleteVocabulary = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: (id: number) => vocabularyService.deleteVocabulary(id),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['vocabulary-list'] });
            toast.success(data?.message || t('vocabulary.deleteSuccess'));
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || t('vocabulary.deleteError'));
        },
    });
};
//--------------------------------End--------------------------------//

/**
 * Handle Update Vocabulary
 * @returns useMutation to update vocabulary
 */
export const useUpdateVocabulary = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: ({ wordJp, regenerateAudio = false, payload }: { wordJp: string; regenerateAudio?: boolean; payload: IUpdateVocabularyPayload }) =>
            vocabularyService.putVocabulary(wordJp, payload, regenerateAudio),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['vocabulary-list'] });
            toast.success(data?.message || t('vocabulary.updateSuccess'));
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || t('vocabulary.updateError'));
        },
    });
};
//--------------------------------End--------------------------------//
