import { AI_POLICY_SCOPE, SERVICE_TYPE } from "@constants/ai";
import { at, byUser } from "@models/common/response";
import z from "zod";

//----------------------Gemini Config Prompts Entity----------------------//
/**
 * Gemini Config Prompts Entity Schema
 */
export const GeminiConfigPromptsEntitySchema = z.object({
    id: z.number(),
    geminiConfigModelId: z.number(),
    prompt: z.string(),
    isActive: z.boolean(),
    ...byUser,
    ...at,
});

export type GeminiConfigPromptsEntity = z.infer<typeof GeminiConfigPromptsEntitySchema>;
//-----------------------End--------------------//
//--------------------------------------End Gemini Config Prompts--------------------------------------//






//----------------------Gemini Models Entity----------------------//
/**
 * Gemini Models Entity Schema
 */
export const GeminiModelsEntitySchema = z.object({
    id: z.number(),
    provider: z.enum(["GEMINI"]),
    key: z.string(),
    displayName: z.string(),
    description: z.string().nullable(),
    isEnabled: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type IGeminiModelsEntity = z.infer<typeof GeminiModelsEntitySchema>;
//-----------------------End--------------------//
//--------------------------------------End Gemini Models--------------------------------------//





//----------------------Config Presets Entity----------------------//
/**
 * Config Presets Entity Schema
 */
export const ConfigPresetsEntitySchema = z.object({
    id: z.number(),
    key: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    temperature: z.number(),
    topP: z.number(),
    topK: z.number().nullable(),
    isEnabled: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type IConfigPresetsEntity = z.infer<typeof ConfigPresetsEntitySchema>;
//-----------------------End--------------------//
//--------------------------------------End Config Presets--------------------------------------//





//----------------------Gemini Config Models Entity----------------------//
/**
 * Gemini Config Models Entity Schema
 */
export const GeminiConfigModelsEntitySchema = z.object({
    id: z.number(),
    name: z.string(),
    geminiModelId: z.number(),
    maxTokens: z.number(),
    jsonMode: z.boolean(),
    systemInstruction: z.string(),
    safetySettings: z.record(z.string(), z.string()),
    extraParams: z.object({
        policy: z.object({
            purpose: z.string(),
            entities: z.array(z.object({
                scope: z.enum(AI_POLICY_SCOPE),
                entity: z.string(),
                fields: z.array(z.string()),
                limit: z.number().optional(),
            })),
            maskingRules: z.record(z.string(), z.string()).optional(),
        }).optional(),
        responseMimeType: z.string(),
    }),
    presetId: z.number(),
    isEnabled: z.boolean(),
    ...byUser,
    ...at,
    geminiModel: GeminiModelsEntitySchema,
    preset: ConfigPresetsEntitySchema.optional(),
});

export type IGeminiConfigModelsEntity = z.infer<typeof GeminiConfigModelsEntitySchema>;

/**
 * Gemini Config Prompts Entity Schema with nested geminiConfigModel
 * This is used when the response includes the full geminiConfigModel object
 */
export const GeminiConfigPromptsWithModelEntitySchema = GeminiConfigPromptsEntitySchema.extend({
    geminiConfigModel: GeminiConfigModelsEntitySchema,
});

export type GeminiConfigPromptsWithModelEntity = z.infer<typeof GeminiConfigPromptsWithModelEntitySchema>;
//-----------------------End--------------------//
//--------------------------------------End Gemini Config Models--------------------------------------//






//----------------------Model Configs Policy Schema Entity----------------------//
/**
 * Model Configs Policy Schema Entity Schema
 */
export const ModelConfigsPolicySchemaEntitySchema = z.array(z.string());

export type IModelConfigsPolicySchemaEntity = z.infer<typeof ModelConfigsPolicySchemaEntitySchema>;


/**
 * Model Configs Policy Schema Fields Entity Schema
 */
export const ModelConfigsPolicySchemaFieldsEntitySchema = z.record(z.string(), z.array(z.string()));
export type IModelConfigsPolicySchemaFieldsEntity = z.infer<typeof ModelConfigsPolicySchemaFieldsEntitySchema>;
//-----------------------End--------------------//
//--------------------------------------End Model Configs Policy Schema Fields--------------------------------------//







//----------------------Service Configs Entity----------------------//
/**
 */
export const ServiceConfigsEntitySchema = z.object({
    id: z.number(),
    serviceType: z.enum(SERVICE_TYPE),
    geminiConfigId: z.number(),
    isDefault: z.boolean(),
    isActive: z.boolean(),
    ...byUser,
    ...at,
    geminiConfig: GeminiConfigPromptsWithModelEntitySchema,
});

export type IServiceConfigsEntity = z.infer<typeof ServiceConfigsEntitySchema>;
//-----------------------End--------------------//
//--------------------------------------End Service Configs--------------------------------------//