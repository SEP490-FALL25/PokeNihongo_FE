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
        responseMimeType: z.string(),
    }),
    presetId: z.number(),
    isEnabled: z.boolean(),
    ...byUser,
    ...at,
    geminiModel: GeminiModelsEntitySchema,
    preset: ConfigPresetsEntitySchema,
});

export type IGeminiConfigModelsEntity = z.infer<typeof GeminiConfigModelsEntitySchema>;
//-----------------------End--------------------//
//--------------------------------------End Gemini Config Models--------------------------------------//






//----------------------Model Configs Policy Schema Entity----------------------//
/**
 * Model Configs Policy Schema Entity Schema
 */
export const ModelConfigsPolicySchemaEntitySchema = z.object({
    name: z.string(),
    fields: z.array(z.object({
        name: z.string(),
    })),
});

export type IModelConfigsPolicySchemaEntity = z.infer<typeof ModelConfigsPolicySchemaEntitySchema>;
//-----------------------End--------------------//
//--------------------------------------End Model Configs Policy Schema--------------------------------------//