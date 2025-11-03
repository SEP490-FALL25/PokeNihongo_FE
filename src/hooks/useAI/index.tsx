import { ICreateGeminiConfigModelsRequest } from "@models/ai/request";
import { IQueryRequest } from "@models/common/request";
import geminiService from "@services/ai";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";

//--------------------------------------Config Prompts--------------------------------------//
/**
 * Handle Gemini Config Prompts
 * @param params 
 * @returns 
 */
export const useConfigPromptsCustom = (params: IQueryRequest) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['gemini-config-prompts', params],
        queryFn: () => geminiService.getGeminiConfigPrompts(params),
    });
    return { data: data?.data?.data, isLoading, error };
}
//-----------------------End-----------------------//
//---------------------------------------------End Config Prompts---------------------------------------------//







//--------------------------------------Custom AI--------------------------------------//
/**
 * Handle Get Config Models
 * @returns 
 */
export const useGetAIConfigModels = (params: IQueryRequest) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['gemini-config-models', params],
        queryFn: () => geminiService.getConfigModels(params),
    });
    return { data: data?.data?.data, isLoading, error };
}
//-----------------------End-----------------------//


/**
 * Handle Create Gemini Config Models
 */
export const useCreateAIGeminiConfigModels = () => {
    const queryClient = useQueryClient();
    const createGeminiConfigModelsMutation = useMutation({
        mutationFn: (data: ICreateGeminiConfigModelsRequest) => geminiService.createGeminiConfigModels(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['gemini-config-models'] });
            toast.success('Tạo model thành công');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi tạo model Gemini');
        },
    });
    return createGeminiConfigModelsMutation;
}
//-----------------------End-----------------------//
//---------------------------------------------End Custom AI---------------------------------------------//









//--------------------------------------Gemini Models--------------------------------------//
/**
 * Handle Get Gemini Models
 * @returns 
 */
export const useGetAIGeminiModels = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['gemini-models'],
        queryFn: () => geminiService.getGeminiModels(),
    });
    return { data: data?.data?.data, isLoading, error };
}
//-----------------------End-----------------------//
//---------------------------------------------End Gemini Models---------------------------------------------//








//--------------------------------------Config Presets--------------------------------------//
/**
 * Handle Get Config Presets
 * @returns 
 */
export const useGetAIGeminiConfigPresets = () => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['gemini-config-presets'],
        queryFn: () => geminiService.getConfigPresets(),
    });
    return { data: data?.data?.data, isLoading, error };
}
//-----------------------End-----------------------//
//---------------------------------------------End Config Presets---------------------------------------------//