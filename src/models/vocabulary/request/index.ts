import { TranslationsSchema, TranslationsType } from "@models/translation/request";
import { z } from "zod";

export const CreateVocabularyFullMultipartSchema = z.object({
    word_jp: z.string().min(1, 'validation.wordJapaneseRequired'),
    reading: z.string().min(1, 'validation.readingRequired'),
    level_n: z.string().transform((val) => parseInt(val, 10)).optional(),
    word_type_id: z.string().transform((val) => parseInt(val, 10)).optional(),
    translations: z.union([
        z.string().transform((val) => JSON.parse(val)),
        TranslationsSchema
    ]),
    // Optional media files for multipart submission
    imageFile: z.any().optional(),
    audioFile: z.any().optional(),
})

export type ICreateVocabularyFullMultipartType = z.infer<typeof CreateVocabularyFullMultipartSchema>

export interface IUpdateVocabularyPayload {
    reading?: string;
    level_n?: number | string;
    word_type_id?: number | string;
    translations?: string | TranslationsType;
    imageUrl?: File | null;
    audioUrl?: File | null;
}
