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
//--------------------------------------End--------------------------------------//



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
//--------------------------------------End--------------------------------------//


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
//--------------------------------------End--------------------------------------//