import { TestSetEntitySchema } from "@models/testSet/entity";
import z from "zod";

export const TestEntitySchema = z.object({
  id: z.number(),
  name: z.array(
    z.object({
      language_code: z.string(),
      value: z.string(),
    })
  ),
  description: z.array(
    z.object({
      language_code: z.string(),
      value: z.string(),
    })
  ),
  price: z.number().nullable(),
  limit: z.number().nullable(),
  levelN: z.number().nullable(),
  testType: z.enum([
    "PLACEMENT_TEST_DONE",
    "MATCH_TEST",
    "QUIZ_TEST",
    "REVIEW_TEST",
    "PRACTICE_TEST",
  ]),
  status: z.enum(["DRAFT", "ACTIVE", "INACTIVE"]),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type TestEntity = z.infer<typeof TestEntitySchema>;

// Test detail response with testSets
export const TestDetailDataSchema = z.object({
  test: TestEntitySchema,
  testSets: z.array(TestSetEntitySchema),
});
