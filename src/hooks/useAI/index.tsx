import { IQueryRequest } from "@models/common/request";
import geminiService from "@services/ai";
import { useQuery } from "@tanstack/react-query";

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
    return { data, isLoading, error };
}
//-----------------------End-----------------------//