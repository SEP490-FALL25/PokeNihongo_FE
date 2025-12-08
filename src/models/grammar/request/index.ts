import { TranslationLearnSchema } from "@models/common/request";
import z from "zod";

/**
 * Create Grammar Request Schema
 */
export const CreateGrammarRequest = z.object({
    structure: z.string(),
    level: z.string(),
    usage: z.object({
        exampleSentenceJp: z.string(),
    }),
    translations: TranslationLearnSchema,
});

export type ICreateGrammarRequest = z.infer<typeof CreateGrammarRequest>;

export const UpdateGrammarRequest = CreateGrammarRequest.pick({
    structure: true,
    level: true,
});

export type IUpdateGrammarRequest = z.infer<typeof UpdateGrammarRequest>;
//------------------End------------------//