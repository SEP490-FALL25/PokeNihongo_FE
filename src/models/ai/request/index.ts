import { AI_POLICY_SCOPE, PURPOSE_POLICY_AI, SERVICE_TYPE } from "@constants/ai";
import { z } from "zod";

/**
 * Update Gemini Config Prompts Request Schema
 * @param t 
 * @returns 
 */
export const updateGeminiConfigPromptsSchema = (t: (key: string, opts?: any) => string) => z.object({
    geminiConfigModelId: z.number().min(1, t('validation.geminiConfigModelIdRequired')),
    prompt: z.string().min(1, t('validation.promptRequired')),
    isActive: z.boolean(),
});
export type IUpdateGeminiConfigPromptsRequest = z.infer<ReturnType<typeof updateGeminiConfigPromptsSchema>>;
//------------------------End------------------------//


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
            limit: z.number().optional(),
        })),
        maskingRules: z.record(z.string(), z.string()),
    }),
});

export type IUpdateModelConfigsPolicySchemaRequest = z.infer<ReturnType<typeof updateModelConfigsPolicySchemaSchema>>;
//------------------------End------------------------//



/**
 * Create Service Config Request Schema
 */
export const createServiceConfigSchema = (t: (key: string, opts?: any) => string) => z.object({
    serviceType: z.enum(SERVICE_TYPE),
    geminiConfigId: z.number().min(1, t('validation.geminiConfigIdRequired')),
    isDefault: z.boolean().default(false),
    isActive: z.boolean().default(true),
});

export type ICreateServiceConfigRequest = z.infer<ReturnType<typeof createServiceConfigSchema>>;
//------------------------End------------------------//
