import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import exerciseService from "@services/exercise";
import { CreateExerciseRequest, UpdateExerciseRequest } from "@models/exercise/request";

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
    };
  };
}

/**
 * Hook for creating a new exercise
 * @returns { createExercise, isLoading, error }
 */
export const useCreateExercise = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (data: CreateExerciseRequest) => exerciseService.createExercise(data),
    onSuccess: (response) => {
      toast.success(response.message || "Tạo bài tập thành công");
      // Invalidate and refetch exercises list
      queryClient.invalidateQueries({ queryKey: ["exercises"] });
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.message;
      if (Array.isArray(errorMessage)) {
        toast.error(errorMessage.join(", "));
      } else if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Có lỗi xảy ra khi tạo bài tập");
      }
    },
  });

  return {
    createExercise: mutation.mutate,
    isLoading: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook for fetching exercises by lesson id
 */
export const useExercisesByLessonId = (lessonId: number) => {
  const query = useQuery({
    queryKey: ["exercises", { lessonId }],
    queryFn: () => exerciseService.getExercisesByLessonId(lessonId),
    enabled: Boolean(lessonId),
  });

  return {
    ...query,
  };
};

/**
 * Hook for deleting an exercise by id
 */
export const useDeleteExercise = (lessonId: number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: (id: number) => exerciseService.deleteExercise(id),
    onSuccess: (response) => {
      toast.success((response as any)?.message || 'Xóa bài tập thành công');
      queryClient.invalidateQueries({ queryKey: ["exercises", { lessonId }] });
    },
    onError: (error: ApiError) => {
      const msg = error?.response?.data?.message;
      if (Array.isArray(msg)) toast.error(msg.join(', '));
      else toast.error(msg || 'Không thể xóa bài tập');
    },
  });

  return {
    deleteExercise: mutation.mutate,
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
};

/**
 * Hook for updating an exercise by id
 */
export const useUpdateExercise = (lessonId: number) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateExerciseRequest }) => 
      exerciseService.updateExercise(id, data),
    onSuccess: (response) => {
      toast.success(response.message || "Cập nhật bài tập thành công");
      queryClient.invalidateQueries({ queryKey: ["exercises", { lessonId }] });
    },
    onError: (error: ApiError) => {
      const errorMessage = error.response?.data?.message;
      if (Array.isArray(errorMessage)) {
        toast.error(errorMessage.join(", "));
      } else if (errorMessage) {
        toast.error(errorMessage);
      } else {
        toast.error("Có lỗi xảy ra khi cập nhật bài tập");
      }
    },
  });

  return {
    updateExercise: mutation.mutate,
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
};