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
