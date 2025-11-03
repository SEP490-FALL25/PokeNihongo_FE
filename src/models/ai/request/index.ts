import { z } from "zod";

/**
 * Create Gemini Config Models Request Schema
 */
export const createCreateGeminiConfigModelsSchema = (t: (key: string, opts?: any) => string) => z.object({
    name: z.string().min(1, t('validation.nameRequired')),
    geminiModelId: z.number().min(1, t('validation.geminiModelIdRequired')),
    maxTokens: z.number().min(1024, t('validation.maxTokensMin', { min: 1024 })).max(3072, t('validation.maxTokensMax', { max: 3072 })),
    jsonMode: z.boolean(),
    systemInstruction: z.string().min(1, t('validation.systemInstructionRequired')),
    safetySettings: z.object(),
    extraParams: z.object({
        responseMimeType: z.string().min(1, t('validation.responseMimeTypeRequired')),
    }),
    isEnabled: z.boolean(),
    presetId: z.number().min(1, t('validation.presetIdRequired')),
});

export type ICreateGeminiConfigModelsRequest = z.infer<ReturnType<typeof createCreateGeminiConfigModelsSchema>>;
//------------------------End------------------------//