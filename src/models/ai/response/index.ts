import z from "zod";
import { GeminiConfigModelsEntitySchema, GeminiConfigPromptsEntitySchema } from "../entity";
import { BackendPaginationResponseModel, BackendResponseModel } from "@models/common/response";


//----------------------Gemini Config Prompts Response----------------------//
/**
 * Gemini Config Prompts Response Schema
 */
export const GeminiConfigPromptsResponseSchema = BackendPaginationResponseModel(GeminiConfigPromptsEntitySchema);
export type GeminiConfigPromptsResponse = z.infer<typeof GeminiConfigPromptsResponseSchema>;
//-----------------------End--------------------//
//--------------------------------------End--------------------------------------//





//----------------------Gemini Config Models Response----------------------//
/**
 * Gemini Config Models Response Schema
 */
export const GeminiConfigModelsResponseSchema = BackendResponseModel(GeminiConfigModelsEntitySchema);

export type GeminiConfigModelsResponse = z.infer<typeof GeminiConfigModelsResponseSchema>;
//-----------------------End--------------------//
//--------------------------------------End--------------------------------------//