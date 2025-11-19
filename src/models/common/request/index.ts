import z from "zod";

/**
 * Master data list query (flexible)
 */
export const QueryRequest = z
    .object({
        page: z.number().optional(),
        limit: z.number().optional(),
        search: z.string().optional(),
        sortOrder: z.string().optional(),
        sortBy: z.string().optional(),
    })
    .catchall(z.any());

export type IQueryRequest = z.infer<typeof QueryRequest>;
//------------------End------------------//


/**
 * Translation Request Schema
 * Pilu
 */
export const TranslationRequest = z.object({
    key: z.enum(['en', 'ja', 'vi']),
    value: z.string(),
});

export type ITranslationRequest = z.infer<typeof TranslationRequest>;
//------------------End------------------//


/**
 * Translation Learn Request Schema
 * Kumo
 */
export const TranslationLearnSchema = z.object({
    usage: z.array(z.object({
        language_code: z.enum(['vi', 'en', 'ja']),
        explanation: z.string(),
        example: z.string(),
    })),
});

export type ITranslationLearnRequest = z.infer<typeof TranslationLearnSchema>;
//------------------End------------------//