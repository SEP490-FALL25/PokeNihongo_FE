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



//----------------------Gemini Config Models Entity----------------------//
/**
 * Gemini Config Models Entity Schema
 */
export const GeminiConfigModelsEntitySchema = z.object({
    id: z.number(),
    provider: z.enum(["GEMINI"]),
    key: z.string(),
    displayName: z.string(),
    description: z.string().nullable(),
    isEnabled: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type GeminiConfigModelsEntity = z.infer<typeof GeminiConfigModelsEntitySchema>;
//-----------------------End--------------------//
//--------------------------------------End--------------------------------------//