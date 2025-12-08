import { IQueryRequest } from "@models/common/request";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import grammarService from "@services/grammar";
import { useSelector } from "react-redux";
import { selectCurrentLanguage } from "@redux/features/language/selector";
import { ICreateGrammarRequest, IUpdateGrammarRequest } from "@models/grammar/request";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

/**
 * Handle Grammar List
 * @param params
 * @returns
 */
export const useGrammarList = (params: IQueryRequest & { level?: string; levelN?: number; enabled?: boolean; dialogKey?: number }) => {
  const language = useSelector(selectCurrentLanguage);
  const { page, limit, search, level, levelN, sortBy, sort, enabled = true, dialogKey, lessonId } = params;

  const resolvedLevel = level ?? (typeof levelN === "number" ? `N${levelN}` : undefined);

  const queryResult = useQuery({
    queryKey: [
      "grammar-list",
      page,
      limit,
      search,
      resolvedLevel,
      sortBy,
      sort,
      language,
      dialogKey,
      lessonId,
    ],
    queryFn: () => grammarService.getAllGrammars({ ...params, level: resolvedLevel }),
    enabled,
  });

  return {
    data: queryResult.data?.data?.data,
    isLoading: queryResult.isLoading,
    isFetching: queryResult.isFetching,
    error: queryResult.error,
    refetch: queryResult.refetch,
  };
};
//------------------End------------------//


/**
 * Handle Create Grammar
 * @returns createGrammarMutation
 */
export const useCreateGrammar = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const createGrammarMutation = useMutation({
    mutationFn: (data: ICreateGrammarRequest) => grammarService.createGrammar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammar-list"] });
      toast.success(t("createGrammar.success", { defaultValue: "Tạo ngữ pháp thành công" }));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("createGrammar.error.general", { defaultValue: "Có lỗi xảy ra khi tạo ngữ pháp" }));
    },
  });
  return createGrammarMutation;
};
//------------------End------------------//

/**
 * Handle Update Grammar
 * @returns updateGrammarMutation
 */
export const useUpdateGrammar = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const updateGrammarMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: IUpdateGrammarRequest }) =>
      grammarService.updateGrammar(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammar-list"] });
      toast.success(t("updateGrammar.success", { defaultValue: "Cập nhật ngữ pháp thành công" }));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("updateGrammar.error.general", { defaultValue: "Có lỗi xảy ra khi cập nhật ngữ pháp" }));
    },
  });

  return updateGrammarMutation;
};
//------------------End------------------//

/**
 * Handle Delete Grammar
 * @returns deleteGrammarMutation
 */
export const useDeleteGrammar = () => {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const deleteGrammarMutation = useMutation({
    mutationFn: (id: number) => grammarService.deleteGrammar(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammar-list"] });
      toast.success(t("deleteGrammar.success", { defaultValue: "Xóa ngữ pháp thành công" }));
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || t("deleteGrammar.error.general", { defaultValue: "Có lỗi xảy ra khi xóa ngữ pháp" }));
    },
  });

  return deleteGrammarMutation;
};
//------------------End------------------//