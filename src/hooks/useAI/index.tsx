import { ICreateGeminiConfigModelsRequest } from "@models/ai/request";
import { IQueryRequest } from "@models/common/request";
import geminiService from "@services/ai";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

/**
 * Handle Gemini Config Prompts
 * @param params 
 * @returns 
 */
export const useAIGeminiConfigPrompts = (params: IQueryRequest) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['gemini-config-prompts', params],
        queryFn: () => geminiService.getGeminiConfigPrompts(params),
    });
    return { data: data?.data?.data, isLoading, error };
}
//-----------------------End-----------------------//



/**
 * 
 */
export const useCreateAIGeminiConfigModels = () => {
    const queryClient = useQueryClient();
    const createGeminiConfigModelsMutation = useMutation({
        mutationFn: (data: ICreateGeminiConfigModelsRequest) => geminiService.createGeminiConfigModels(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gemini-config-prompts'] });
            toast.success('Tạo model thành công');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo model Gemini');
        },
    });
    return createGeminiConfigModelsMutation;
}
//-----------------------End-----------------------//