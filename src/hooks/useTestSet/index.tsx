import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import testSetService from "@services/testSet";
import { TestSetListRequest, TestSetCreateRequest, TestSetQuestionBankLinkMultipleRequest, TestSetUpsertWithQuestionBanksRequest } from "@models/testSet/request";
import { selectCurrentLanguage } from "@redux/features/language/selector";
import { useSelector } from "react-redux";
import { AxiosError } from "axios";

interface ApiError {
  response?: {
    status?: number;
    data?: {
      message?: string | string[];
    };
  };
}

/**
 * Helper function to extract error message from axios error response
 */
const getErrorMessage = (error: unknown, defaultMessage: string): string => {
  if (error instanceof AxiosError) {
    const message = error.response?.data?.message;
    if (message) {
      return Array.isArray(message) ? message.join(", ") : message;
    }
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};



/**
 * Hook for managing TestSet list with filters and pagination
 * @param filters TestSetListRequest
 * @returns { data, isLoading, error, pagination }
 */
export const useTestSetList = (
  filters: TestSetListRequest,
  options?: { enabled?: boolean; forceKey?: number; refetchOnMount?: 'always' | boolean }
) => {
  const language = useSelector(selectCurrentLanguage);

  const { data, isLoading, error } = useQuery({
    queryKey: ["testset-list", filters, language, options?.forceKey],
    queryFn: () => testSetService.getTestSets(filters),
    enabled: options?.enabled ?? true,
    refetchOnMount: options?.refetchOnMount ?? 'always',
  });

  return {
    data: data?.data?.results || [],
    pagination: data?.data?.pagination || {
      current: 1,
      pageSize: 15,
      totalPage: 1,
      totalItem: 0,
    },
    isLoading,
    error,
  };
};

/**
 * Hook for managing TestSet state and operations
 * @returns { testSets, isLoading, error, pagination, filters, setFilters, refetch }
 */
export const useTestSet = () => {
  const [filters, setFilters] = useState<TestSetListRequest>({
    currentPage: 1,
    pageSize: 15,
  });

  const { data: testSets, pagination, isLoading, error } = useTestSetList(filters);

  const handleSetFilters = useCallback((newFilters: Partial<TestSetListRequest>) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
      currentPage: 1, // Reset to first page when filters change
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters(prev => ({
      ...prev,
      currentPage: page,
    }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setFilters(prev => ({
      ...prev,
      pageSize,
      currentPage: 1, // Reset to first page when page size changes
    }));
  }, []);

  const handleSearch = useCallback((search: string) => {
    setFilters(prev => ({
      ...prev,
      search: search || undefined,
      currentPage: 1,
    }));
  }, []);

  const handleFilterByLevel = useCallback((levelN: number | undefined) => {
    setFilters(prev => ({
      ...prev,
      levelN,
      currentPage: 1,
    }));
  }, []);

  const handleFilterByTestType = useCallback((testType: TestSetListRequest['testType']) => {
    setFilters(prev => ({
      ...prev,
      testType,
      currentPage: 1,
    }));
  }, []);

  const handleFilterByStatus = useCallback((status: TestSetListRequest['status']) => {
    setFilters(prev => ({
      ...prev,
      status,
      currentPage: 1,
    }));
  }, []);

  const handleFilterByCreator = useCallback((creatorId: number | undefined) => {
    setFilters(prev => ({
      ...prev,
      creatorId,
      currentPage: 1,
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      currentPage: 1,
      pageSize: 15,
    });
  }, []);

  return {
    testSets,
    pagination,
    isLoading,
    error,
    filters,
    setFilters: handleSetFilters,
    handlePageChange,
    handlePageSizeChange,
    handleSearch,
    handleFilterByLevel,
    handleFilterByTestType,
    handleFilterByStatus,
    handleFilterByCreator,
    clearFilters,
  };
};

/**
 * Hook for creating a new test set
 * @returns mutation object with createTestSet function
 */
export const useCreateTestSet = () => {
  const queryClient = useQueryClient();

  const createTestSetMutation = useMutation({
    mutationFn: (data: TestSetCreateRequest) =>
      testSetService.createTestSetWithMeanings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
    },
    onError: (error: unknown) => {
      console.error("Error creating test set:", error);
      const apiError = error as ApiError;
      if (apiError?.response?.status === 422) {
        const messages = apiError?.response?.data?.message;
        if (Array.isArray(messages)) {
          toast.error(`Lỗi validation: ${messages.join(", ")}`);
        } else {
          toast.error(messages || "Lỗi validation");
        }
      } else {
        toast.error(
          getErrorMessage(error, "Có lỗi xảy ra khi tạo test set")
        );
      }
    },
  });

  return createTestSetMutation;
};

/**
 * Hook for updating a test set
 * @returns mutation object with updateTestSet function
 */
export const useUpdateTestSet = () => {
  const queryClient = useQueryClient();

  const updateTestSetMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<TestSetCreateRequest>;
    }) => testSetService.updateTestSet(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
    },
    onError: (error: unknown) => {
      console.error("Error updating test set:", error);
      const apiError = error as ApiError;
      if (apiError?.response?.status === 422) {
        const messages = apiError?.response?.data?.message;
        if (Array.isArray(messages)) {
          toast.error(`Lỗi validation: ${messages.join(", ")}`);
        } else {
          toast.error(messages || "Lỗi validation");
        }
      } else {
        toast.error(
          getErrorMessage(error, "Có lỗi xảy ra khi cập nhật test set")
        );
      }
    },
  });

  return updateTestSetMutation;
};

/**
 * Hook for linking question banks to a test set
 * @returns mutation object with linkQuestionBanks function
 */
export const useLinkQuestionBanksToTestSet = () => {
  const queryClient = useQueryClient();

  const linkQuestionBanksMutation = useMutation({
    mutationFn: (data: TestSetQuestionBankLinkMultipleRequest) =>
      testSetService.linkQuestionBanksMultiple(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["question-bank-list"] });
      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
      queryClient.invalidateQueries({ queryKey: ["testset-linked-question-banks"] });
    },
    onError: (error: unknown) => {
      console.error("Error linking question banks:", error);
      toast.error(
        getErrorMessage(error, "Có lỗi xảy ra khi liên kết câu hỏi")
      );
    },
  });

  return linkQuestionBanksMutation;
};

/**
 * Hook for fetching linked question banks by test set ID
 * @param testSetId number
 * @param options { enabled?: boolean }
 * @returns { data, isLoading, error }
 */
export const useGetLinkedQuestionBanksByTestSet = (
  testSetId: number | null,
  options?: { enabled?: boolean }
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["testset-linked-question-banks", testSetId],
    queryFn: () => testSetService.getLinkedQuestionBanksByTestSet(testSetId!),
    enabled: (options?.enabled ?? true) && testSetId !== null,
  });

  return {
    data: data || [],
    isLoading,
    error,
  };
};

/**
 * Hook for deleting linked question banks from test set
 * @returns mutation object with deleteLinkedQuestionBanks function
 */
export const useDeleteLinkedQuestionBanksFromTestSet = () => {
  const queryClient = useQueryClient();

  const deleteLinkedQuestionBanksMutation = useMutation({
    mutationFn: (ids: number[]) =>
      testSetService.deleteLinkedQuestionBanksMany(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testset-linked-question-banks"] });
      queryClient.invalidateQueries({ queryKey: ["question-bank-list"] });
      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
    },
    onError: (error: unknown) => {
      console.error("Error deleting linked question banks:", error);
      toast.error(
        getErrorMessage(error, "Có lỗi xảy ra khi xóa câu hỏi")
      );
    },
  });

  return deleteLinkedQuestionBanksMutation;
};

/**
 * Hook for upserting test set with question banks (for speaking tests)
 * @returns mutation object with upsertTestSetWithQuestionBanks function
 */
export const useUpsertTestSetWithQuestionBanks = () => {
  const queryClient = useQueryClient();

  const upsertMutation = useMutation({
    mutationFn: (data: TestSetUpsertWithQuestionBanksRequest) =>
      testSetService.upsertTestSetWithQuestionBanks(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
      queryClient.invalidateQueries({ queryKey: ["testset-linked-question-banks"] });
    },
    onError: (error: unknown) => {
      console.error("Error upserting test set with question banks:", error);
      const apiError = error as ApiError;
      if (apiError?.response?.status === 422) {
        const raw = (apiError?.response?.data as unknown as { message?: unknown })?.message;
        if (Array.isArray(raw)) {
          const parts = raw.map((item) => {
            if (typeof item === 'string') return item;
            if (item && typeof item === 'object') {
              const msg = (item as { message?: string }).message || 'Dữ liệu không hợp lệ';
              const path = (item as { path?: string }).path;
              return path ? `${path}: ${msg}` : msg;
            }
            return String(item);
          });
          toast.error(`Lỗi validation:\n${parts.join("\n")}`);
        } else if (typeof raw === 'string') {
          toast.error(raw);
        } else {
          toast.error("Lỗi validation");
        }
      } else {
        toast.error(
          getErrorMessage(error, "Có lỗi xảy ra khi lưu test set")
        );
      }
    },
  });

  return upsertMutation;
};
