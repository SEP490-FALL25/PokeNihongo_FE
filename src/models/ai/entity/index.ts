import z from "zod";

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