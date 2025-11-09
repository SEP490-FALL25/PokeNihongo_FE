import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import answerService from "@services/answer";
import { ICreateAnswerRequest } from "@models/answer/request";

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
    };
  };
}

/**
 * Hook for updating a single answer
 * @returns mutation object with updateAnswer function
 */
export const useUpdateAnswer = () => {
  const queryClient = useQueryClient();

  const updateAnswerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<ICreateAnswerRequest> }) =>
      answerService.updateAnswer(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-bank-list"] });
      queryClient.invalidateQueries({ queryKey: ["answer-list"] });
      toast.success("Cập nhật đáp án thành công!");
    },
    onError: (error: unknown) => {
      console.error("Error updating answer:", error);
      const apiError = error as ApiError;
      if (apiError?.response?.status === 422) {
        const messages = apiError?.response?.data?.message;
        if (Array.isArray(messages)) {
          toast.error(`Lỗi validation: ${messages.join(', ')}`);
        } else {
          toast.error(messages || "Lỗi validation");
        }
      } else {
        toast.error(apiError?.response?.data?.message || "Có lỗi xảy ra khi cập nhật đáp án");
      }
    },
  });

  return updateAnswerMutation;
};

/**
 * Hook for creating a single answer
 * @returns mutation object with createAnswer function
 */
export const useCreateAnswer = () => {
  const queryClient = useQueryClient();

  const createAnswerMutation = useMutation({
    mutationFn: ({ questionBankId, answer }: { questionBankId: number; answer: ICreateAnswerRequest }) =>
      answerService.createMultipleAnswers({ questionBankId, answers: [answer] }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-bank-list"] });
      queryClient.invalidateQueries({ queryKey: ["answer-list"] });
      toast.success("Tạo đáp án thành công!");
    },
    onError: (error: unknown) => {
      console.error("Error creating answer:", error);
      const apiError = error as ApiError;
      if (apiError?.response?.status === 422) {
        const messages = apiError?.response?.data?.message;
        if (Array.isArray(messages)) {
          toast.error(`Lỗi validation: ${messages.join(', ')}`);
        } else {
          toast.error(messages || "Lỗi validation");
        }
      } else {
        toast.error(apiError?.response?.data?.message || "Có lỗi xảy ra khi tạo đáp án");
      }
    },
  });

  return createAnswerMutation;
};

/**
 * Hook for deleting a single answer
 * @returns mutation object with deleteAnswer function
 */
export const useDeleteAnswer = () => {
  const queryClient = useQueryClient();

  const deleteAnswerMutation = useMutation({
    mutationFn: (id: number) => answerService.deleteAnswer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-bank-list"] });
      queryClient.invalidateQueries({ queryKey: ["answer-list"] });
      toast.success("Xóa đáp án thành công!");
    },
    onError: (error: unknown) => {
      console.error("Error deleting answer:", error);
      const apiError = error as ApiError;
      toast.error(apiError?.response?.data?.message || "Có lỗi xảy ra khi xóa đáp án");
    },
  });

  return deleteAnswerMutation;
};
