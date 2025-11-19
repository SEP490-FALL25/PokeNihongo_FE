import { IQueryRequest } from "@models/common/request";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import grammarService from "@services/grammar";
import { useSelector } from "react-redux";
import { selectCurrentLanguage } from "@redux/features/language/selector";
import { ICreateGrammarRequest } from "@models/grammar/request";
import { toast } from "react-toastify";

/**
 * Handle Grammar List
 * @param params
 * @returns
 */
export const useGrammarList = (params: IQueryRequest & { enabled?: boolean; dialogKey?: number }) => {
  const language = useSelector(selectCurrentLanguage);
  const { page, limit, search, levelN, sortBy, sort, enabled = true, dialogKey, lessonId } = params;

  const { data, isLoading, error } = useQuery({
    queryKey: [
      "grammar-list",
      page,
      limit,
      search,
      levelN,
      sortBy,
      sort,
      language,
      dialogKey,
      lessonId,
    ],
    queryFn: () => grammarService.getAllGrammars(params),
    enabled,
  });

  return { data: data?.data?.data, isLoading, error };
};
//------------------End------------------//


/**
 * Handle Create Grammar
 * @returns createGrammarMutation
 */
export const useCreateGrammar = () => {
  const queryClient = useQueryClient();

  const createGrammarMutation = useMutation({
    mutationFn: (data: ICreateGrammarRequest) => grammarService.createGrammar(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grammar-list"] });
      // toast.success();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra khi tạo ngữ pháp");
    },
  });
  return createGrammarMutation;
};
//------------------End------------------//