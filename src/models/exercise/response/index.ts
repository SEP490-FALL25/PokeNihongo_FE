import { ExerciseEntitySchema } from "@models/exercise/entity";
import z from "zod";

export const ExerciseResponseSchema = ExerciseEntitySchema;

export type ExerciseResponseType = z.infer<typeof ExerciseResponseSchema>;

export const CreateExerciseResponseSchema = z.object({
  statusCode: z.number(),
  data: ExerciseResponseSchema,
  message: z.string(),
});

export type CreateExerciseResponseType = z.infer<typeof CreateExerciseResponseSchema>;

export const UpdateExerciseResponseSchema = z.object({
  statusCode: z.number(),
  data: ExerciseResponseSchema,
  message: z.string(),
});

export type UpdateExerciseResponseType = z.infer<typeof UpdateExerciseResponseSchema>;