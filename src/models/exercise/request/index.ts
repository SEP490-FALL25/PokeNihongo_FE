import z from "zod";

export const CreateExerciseRequestSchema = z.object({
  exerciseType: z.enum(['QUIZ', 'multiple_choice', 'matching', 'listening', 'speaking', 'VOCABULARY', 'GRAMMAR', 'KANJI']),
  isBlocked: z.boolean(),
  lessonId: z.number(),
  testSetId: z.number(),
});

export type CreateExerciseRequest = z.infer<typeof CreateExerciseRequestSchema>;

export const UpdateExerciseRequestSchema = z.object({
  exerciseType: z.enum(['QUIZ', 'multiple_choice', 'matching', 'listening', 'speaking', 'VOCABULARY', 'GRAMMAR', 'KANJI']).optional(),
  isBlocked: z.boolean().optional(),
  lessonId: z.number().optional(),
  testSetId: z.number().optional(),
});

export type UpdateExerciseRequest = z.infer<typeof UpdateExerciseRequestSchema>;
