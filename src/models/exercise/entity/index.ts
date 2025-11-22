import z from "zod";

export const ExerciseEntitySchema = z.object({
  id: z.number(),
  exerciseType: z.enum(['QUIZ', 'multiple_choice', 'listening', 'speaking', 'VOCABULARY', 'GRAMMAR', 'KANJI']),
  isBlocked: z.boolean(),
  lessonId: z.number(),
  testSetId: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ExerciseEntity = z.infer<typeof ExerciseEntitySchema>;
