import z from "zod";
import { GeminiConfigModelsEntitySchema } from "../entity";
import { BackendResponseModel } from "@models/common/response";

export const GeminiConfigModelsResponseSchema = BackendResponseModel(GeminiConfigModelsEntitySchema);

export type GeminiConfigModelsResponse = z.infer<typeof GeminiConfigModelsResponseSchema>;
//-----------------------End--------------------//