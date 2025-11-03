import { AI_POLICY_SCOPE, PURPOSE_POLICY_AI } from "@constants/ai";
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
    safetySettings: z.record(z.string(), z.string()),
    extraParams: z.object({
        responseMimeType: z.string().min(1, t('validation.responseMimeTypeRequired')),
    }),
    isEnabled: z.boolean(),
    presetId: z.number().min(1, t('validation.presetIdRequired')),
});

export type ICreateGeminiConfigModelsRequest = z.infer<ReturnType<typeof createCreateGeminiConfigModelsSchema>>;
//------------------------End------------------------//


/**
 * Update Model Configs Policy Schema Request Schema
 * @param t 
 * @returns 
 */
export const updateModelConfigsPolicySchemaSchema = () => z.object({
    policy: z.object({
        purpose: z.enum(PURPOSE_POLICY_AI),
        entities: z.array(z.object({
            entity: z.string(),
            scope: z.enum(AI_POLICY_SCOPE),
            fields: z.array(z.string()),
        })),
        maskingRules: z.record(z.string(), z.string()),
    }),
});

export type IUpdateModelConfigsPolicySchemaRequest = z.infer<ReturnType<typeof updateModelConfigsPolicySchemaSchema>>;
//------------------------End------------------------//