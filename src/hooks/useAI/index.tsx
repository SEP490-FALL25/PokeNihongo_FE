import { ICreateGeminiConfigModelsRequest, IUpdateModelConfigsPolicySchemaRequest } from "@models/ai/request";
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
 * Handle Get Config Model By Id
 * @param id 
 * @returns 
 */
export const useGetAIConfigModelById = (id: number) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['gemini-config-model-by-id', id],
        queryFn: () => geminiService.getConfigModelById(id),
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







//--------------------------------------Model Configs Policy Schema--------------------------------------//
/**
 * Handle Get Model Configs Policy Schema
 * @returns 
 */
export const useGetAIModelConfigPolicySchema = (q?: string) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['gemini-model-configs-policy-schema', q],
        queryFn: () => geminiService.getModelConfigsPolicySchema(q),
    });
    return { data: data?.data?.data, isLoading, error };
}
//-----------------------End-----------------------//


/**
 * Handle Get Model Configs Policy Schema Fields
 * @param entities 
 * @returns 
 */
export const useGetAIModelConfigPolicySchemaFields = (entities: string[]) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ['gemini-model-configs-policy-schema-fields', entities],
        queryFn: async () => {
            const response = await geminiService.getModelConfigsPolicySchemaFields(entities)
            return response
        },
        enabled: entities.length > 0,
    });
    return { data: data?.data?.data, isLoading, error };
}
//-----------------------End-----------------------//


/**
 * Handle Update Model Configs Policy Schema
 */
export const useUpdateModelConfigsPolicySchema = () => {
    const queryClient = useQueryClient();
    const mutation = useMutation({
        mutationFn: ({ modelId, data }: { modelId: number; data: IUpdateModelConfigsPolicySchemaRequest }) =>
            geminiService.updateModelConfigsPolicySchema(modelId, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['gemini-config-model-by-id', variables.modelId] });
            toast.success('Cập nhật policy schema thành công');
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || 'Có lỗi xảy ra khi cập nhật policy schema');
        },
    });
    return mutation;
}
//-----------------------End-----------------------//
//---------------------------------------------End Model Configs Policy Schema---------------------------------------------//