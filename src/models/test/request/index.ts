import z from "zod";

export const TestListRequestSchema = z.object({
  currentPage: z.number().optional(),
  pageSize: z.number().optional(),
  search: z.string().optional(),
  levelN: z.number().optional(),
  testType: z.enum(['PLACEMENT_TEST_DONE', 'MATCH_TEST', 'QUIZ_TEST', 'REVIEW_TEST', 'PRACTICE_TEST','READING_TEST', 'LISTENING_TEST', 'SPEAKING_TEST']).optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE']).optional(),
});

export type TestListRequest = z.infer<typeof TestListRequestSchema>;

export const TestCreateRequestSchema = z.object({
  price: z.number().optional(),
  limit: z.number().optional(),
  testType: z.enum(['PLACEMENT_TEST_DONE', 'MATCH_TEST', 'QUIZ_TEST', 'REVIEW_TEST', 'PRACTICE_TEST','READING_TEST', 'LISTENING_TEST', 'SPEAKING_TEST']),
  status: z.enum(['DRAFT', 'ACTIVE', 'INACTIVE'])
});

export type TestCreateRequest = z.infer<typeof TestCreateRequestSchema>;

// Link multiple QuestionBanks to a Test
export const TestTestSetLinkMultipleSchema = z.object({
  testSetIds: z.array(z.number()).min(1),
});

export type TestTestSetLinkMultipleRequest = z.infer<typeof TestTestSetLinkMultipleSchema>;
