import { axiosPrivate } from "@configs/axios";
import { IQueryRequest } from "@models/common/request";
import { ICreateGrammarRequest, IUpdateGrammarRequest } from "@models/grammar/request";

const grammarService = {
  getAllGrammars: async (data: IQueryRequest & { level?: string }) => {
    const queryParams = new URLSearchParams();

    if (data.page) queryParams.append("currentPage", data.page.toString());
    if (data.limit) queryParams.append("pageSize", data.limit.toString());
    if (data.search) queryParams.append("search", data.search);
    if (data.level) queryParams.append("level", data.level);
    if (data.sortBy) queryParams.append("sortBy", data.sortBy);
    if (data.sort) queryParams.append("sort", data.sort);
    if (data.lessonId) queryParams.append("lessonId", data.lessonId.toString());

    return await axiosPrivate.get(`/grammars?${queryParams.toString()}`);
  },

  createGrammar: async (data: ICreateGrammarRequest) => {
    return await axiosPrivate.post("/grammars", data);
  },

  updateGrammar: async (id: number, data: IUpdateGrammarRequest) => {
    return await axiosPrivate.put(`/grammars/${id}`, data);
  },

  deleteGrammar: async (id: number) => {
    return await axiosPrivate.delete(`/grammars/${id}`);
  },
};

export default grammarService;
