import z from "zod";

export const TestSetListRequestSchema = z.object({
  currentPage: z.number().optional(),
  pageSize: z.number().optional(),
  search: z.string().optional(),
  levelN: z.number().optional(),
  testType: z.enum(['VOCABULARY', 'GRAMMAR', 'KANJI', 'LISTENING', 'READING', 'SPEAKING', 'GENERAL']).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).optional(),
  creatorId: z.number().optional(),
  language: z.enum(['vi', 'en', 'ja']).optional(),
  noExercies: z.boolean().optional(),
  noPrice: z.boolean().optional(),
});

export type TestSetListRequest = z.infer<typeof TestSetListRequestSchema>;

export const TestSetCreateRequestSchema = z.object({
  content: z.string(),
  meanings: z.array(
    z.object({
      field: z.enum(['name', 'description']),
      translations: z.record(z.string(), z.string())
    })
  ),
  audioUrl: z.string().optional(),
  price: z.number().optional(),
  levelN: z.number(),
  testType: z.enum(['VOCABULARY', 'GRAMMAR', 'KANJI', 'LISTENING', 'READING', 'SPEAKING', 'GENERAL']),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE'])
});

export type TestSetCreateRequest = z.infer<typeof TestSetCreateRequestSchema>;

// Link multiple QuestionBanks to a TestSet
export const TestSetQuestionBankLinkMultipleSchema = z.object({
  testSetId: z.number(),
  questionBankIds: z.array(z.number()).min(1),
});

export type TestSetQuestionBankLinkMultipleRequest = z.infer<typeof TestSetQuestionBankLinkMultipleSchema>;

// QuestionBank for speaking test
export const QuestionBankForSpeakingSchema = z.object({
  id: z.number().optional(),
  questionJp: z.string(),
  questionType: z.enum(['VOCABULARY', 'GRAMMAR', 'KANJI', 'LISTENING', 'READING', 'SPEAKING', 'GENERAL']),
  audioUrl: z.string().optional().nullable(),
  role: z.enum(['A', 'B']),
  pronunciation: z.string().optional().nullable(),
  levelN: z.number(),
  meanings: z.array(
    z.object({
      translations: z.object({
        vi: z.string(),
        en: z.string().optional(),
        ja: z.string().optional(),
      }),
    })
  ).optional(),
});

export type QuestionBankForSpeaking = z.infer<typeof QuestionBankForSpeakingSchema>;

// Upsert TestSet with QuestionBanks
export const TestSetUpsertWithQuestionBanksSchema = z.object({
  id: z.number().optional(),
  meanings: z.array(
    z.object({
      field: z.enum(['name', 'description']),
      translations: z.object({
        vi: z.string(),
        en: z.string().optional(),
        ja: z.string().optional(),
      }),
    })
  ),
  audioUrl: z.string().optional().nullable(),
  price: z.number().nullable().optional(),
  levelN: z.number(),
  testType: z.enum(['VOCABULARY', 'GRAMMAR', 'KANJI', 'LISTENING', 'READING', 'SPEAKING', 'GENERAL']),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']),
  questionBanks: z.array(QuestionBankForSpeakingSchema).optional(),
});

export type TestSetUpsertWithQuestionBanksRequest = z.infer<typeof TestSetUpsertWithQuestionBanksSchema>;
