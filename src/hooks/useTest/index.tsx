import { useState, useCallback } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import testService from "@services/test";
import { TestListRequest, TestCreateRequest, TestTestSetLinkMultipleRequest } from "@models/test/request";
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
 * Hook for managing Test list with filters and pagination
 * @param filters TestListRequest
 * @returns { data, isLoading, error, pagination }
 */
export const useTestList = (
  filters: TestListRequest,
  options?: { enabled?: boolean; forceKey?: number }
) => {
  const language = useSelector(selectCurrentLanguage);

  const { data, isLoading, error } = useQuery({
    queryKey: ["test-list", filters, language, options?.forceKey],
    queryFn: () => testService.getTests(filters),
    enabled: options?.enabled ?? true,
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
 * Hook for creating a new test
 * @returns mutation object with createTest function
 */
export const useCreateTest = () => {
  const queryClient = useQueryClient();

  const createTestMutation = useMutation({
    mutationFn: (data: TestCreateRequest) =>
      testService.createTestWithMeanings(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-list"] });
      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
      toast.success("Tạo test thành công");
    },
    onError: (error: unknown) => {
      console.error("Error creating test:", error);
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
          getErrorMessage(error, "Có lỗi xảy ra khi tạo test")
        );
      }
    },
  });

  return createTestMutation;
};

/**
 * Hook for updating a test
 * @returns mutation object with updateTest function
 */
export const useUpdateTest = () => {
  const queryClient = useQueryClient();

  const updateTestMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: number;
      data: Partial<TestCreateRequest>;
    }) => testService.updateTestWithMeanings(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-list"] });
      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
      toast.success("Cập nhật thành công");
    },
    onError: (error: unknown) => {
      console.error("Error updating test:", error);
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
          getErrorMessage(error, "Có lỗi xảy ra khi cập nhật test")
        );
      }
    },
  });

  return updateTestMutation;
};


/**
 * Hook for fetching linked test sets by test ID
 * @param testId number
 * @param options { enabled?: boolean }
 * @returns { data, isLoading, error }
 */
export const useGetLinkedTestSets = (
  testId: number | null,
  options?: { enabled?: boolean }
) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["test-detail", testId],
    queryFn: () => testService.getTestById(testId!),
    enabled: (options?.enabled ?? true) && testId !== null,
  });

  return {
    data: data?.data?.testSets || [],
    isLoading,
    error,
  };
};

/**
 * Hook for linking test sets to a test
 * @returns mutation object with linkTestSets function
 */
export const useLinkTestSets = () => {
  const queryClient = useQueryClient();

  const linkTestSetsMutation = useMutation({
    mutationFn: ({
      testId,
      data,
    }: {
      testId: number;
      data: TestTestSetLinkMultipleRequest;
    }) => testService.linkTestSetMultiple(testId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-detail"] });
      queryClient.invalidateQueries({ queryKey: ["test-list"] });
      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
      toast.success("Đã thêm bộ đề vào Test");
    },
    onError: (error: unknown) => {
      console.error("Error linking test sets:", error);
      toast.error(
        getErrorMessage(error, "Có lỗi xảy ra khi liên kết bộ đề")
      );
    },
  });

  return linkTestSetsMutation;
};
export const useLinkFinalTestSets = () => {
  const queryClient = useQueryClient();

  const linkFinalTestSetsMutation = useMutation({
    mutationFn: ({
      lessonId,
      data,
    }: {
      lessonId: number;
      data: TestTestSetLinkMultipleRequest;
    }) => testService.linkFinalTestMultiple(lessonId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-detail"] });
      queryClient.invalidateQueries({ queryKey: ["test-list"] });
      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
      toast.success("Đã thêm bộ đề vào Final Test");
    },
    onError: (error: unknown) => {
      console.error("Error linking final test sets:", error);
      toast.error(
        getErrorMessage(error, "Có lỗi xảy ra khi liên kết bộ đề vào Final Test")
      );
    },
  });

  return linkFinalTestSetsMutation;
};

/**
 * Hook for deleting linked test sets
 * @returns mutation object with deleteLinkedTestSets function
 */
export const useDeleteLinkedTestSets = () => {
  const queryClient = useQueryClient();

  const deleteLinkedTestSetsMutation = useMutation({
    mutationFn: ({
      testId,
      testSetIds,
    }: {
      testId: number;
      testSetIds: number[];
    }) => testService.deleteLinkedTestSetsMany(testId, testSetIds),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["test-detail"] });
      queryClient.invalidateQueries({ queryKey: ["test-list"] });
      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
      const count = variables.testSetIds.length;
      toast.success(
        count > 1
          ? `Đã xóa ${count} bộ đề khỏi test`
          : "Đã xóa bộ đề khỏi test"
      );
    },
    onError: (error: unknown) => {
      console.error("Error deleting linked test sets:", error);
      toast.error(
        getErrorMessage(error, "Có lỗi xảy ra khi xóa bộ đề")
      );
    },
  });

  return deleteLinkedTestSetsMutation;
};

/**
 * Hook for auto adding free test sets to PLACEMENT_TEST_DONE test
 * @returns mutation object with autoAddFreeTestSets function
 */
export const useAutoAddFreeTestSets = () => {
  const queryClient = useQueryClient();

  const autoAddFreeTestSetsMutation = useMutation({
    mutationFn: () => testService.autoAddFreeTestSets(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["test-detail"] });
      queryClient.invalidateQueries({ queryKey: ["test-list"] });
      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
      toast.success("Đã tự động thêm tất cả TestSet miễn phí vào Test PLACEMENT_TEST_DONE");
    },
    onError: (error: unknown) => {
      console.error("Error auto adding free test sets:", error);
      toast.error(
        getErrorMessage(error, "Có lỗi xảy ra khi tự động thêm TestSet miễn phí")
      );
    },
  });

  return autoAddFreeTestSetsMutation;
};

/**
 * Main hook for Test management with all CRUD operations and state management
 * @returns Complete Test management interface
 */
export const useTest = () => {
  const [filters, setFilters] = useState<TestListRequest>({
    currentPage: 1,
    pageSize: 15,
  });

  const { data: tests, pagination, isLoading, error } = useTestList(filters);

  const handleSetFilters = useCallback((newFilters: Partial<TestListRequest>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      currentPage: 1, // Reset to first page when filters change
    }));
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setFilters((prev) => ({
      ...prev,
      currentPage: page,
    }));
  }, []);

  const handlePageSizeChange = useCallback((pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      pageSize,
      currentPage: 1, // Reset to first page when page size changes
    }));
  }, []);

  const handleSearch = useCallback((search: string) => {
    setFilters((prev) => ({
      ...prev,
      search: search || undefined,
      currentPage: 1,
    }));
  }, []);

  const handleFilterByLevel = useCallback((levelN: number | undefined) => {
    setFilters((prev) => ({
      ...prev,
      levelN,
      currentPage: 1,
    }));
  }, []);

  const handleFilterByTestType = useCallback(
    (testType: TestListRequest["testType"]) => {
      setFilters((prev) => ({
        ...prev,
        testType,
        currentPage: 1,
      }));
    },
    []
  );

  const handleFilterByStatus = useCallback(
    (status: TestListRequest["status"]) => {
      setFilters((prev) => ({
        ...prev,
        status,
        currentPage: 1,
      }));
    },
    []
  );

  const clearFilters = useCallback(() => {
    setFilters({
      currentPage: 1,
      pageSize: 15,
    });
  }, []);

  return {
    tests,
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
    clearFilters,
  };
};

