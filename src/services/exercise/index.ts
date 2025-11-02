import { axiosPrivate } from "@configs/axios";
import { CreateExerciseRequest, UpdateExerciseRequest } from "@models/exercise/request";
import { CreateExerciseResponseType, UpdateExerciseResponseType } from "@models/exercise/response";

const exerciseService = {
  getExercisesByLessonId: async (lessonId: number) => {
    return axiosPrivate.get(`/exercises/lesson/${lessonId}`);
  },
  
  createExercise: async (data: CreateExerciseRequest): Promise<CreateExerciseResponseType> => {
    const response = await axiosPrivate.post('/exercises', data);
    return response.data;
  },
  deleteExercise: async (id: number): Promise<{ message: string } & Record<string, unknown>> => {
    const response = await axiosPrivate.delete(`/exercises/${id}`);
    return response.data;
  },
  updateExercise: async (id: number, data: UpdateExerciseRequest): Promise<UpdateExerciseResponseType> => {
    const response = await axiosPrivate.put(`/exercises/${id}`, data);
    return response.data;
  },
};

export default exerciseService;
