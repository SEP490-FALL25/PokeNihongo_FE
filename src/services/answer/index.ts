import { axiosPrivate } from "@configs/axios";
import {
  ICreateAnswerRequest,
  IQueryAnswerRequest,
} from "@models/answer/request";
import { AnswerListResponseType } from "@models/answer/response";
import { AnswerEntityType } from "@models/answer/entity";

const answerService = {
  getAnswerList: async (
    params?: IQueryAnswerRequest
  ): Promise<AnswerListResponseType> => {
    const queryParams = new URLSearchParams();

    // Pagination
    if (params?.page) {
      queryParams.append("currentPage", params.page.toString());
    }

    if (params?.limit) {
      queryParams.append("pageSize", params.limit.toString());
    }

    // Filters
    if (params?.questionBankId) {
      queryParams.append("questionBankId", params.questionBankId.toString());
    }

    if (params?.isCorrect !== undefined) {
      queryParams.append("isCorrect", params.isCorrect.toString());
    }

    if (params?.search) {
      queryParams.append("search", params.search);
    }

    const queryString = queryParams.toString();
    return axiosPrivate.get(
      `/answers${queryString ? `?${queryString}` : ""}`
    );
  },

  getAnswerById: async (
    id: number
  ): Promise<{ data: AnswerEntityType }> => {
    return axiosPrivate.get(`/answers/${id}`);
  },

  createMultipleAnswers: async (
    data: { questionBankId: number; answers: ICreateAnswerRequest[] }
  ): Promise<{ data: AnswerEntityType[] }> => {
    return axiosPrivate.post("/answers/multiple", data);
  },

  updateAnswer: async (
    id: number,
    data: Partial<ICreateAnswerRequest>
  ): Promise<{ data: AnswerEntityType }> => {
    return axiosPrivate.put(`/answers/${id}`, data);
  },

  deleteAnswer: async (id: number): Promise<{ message: string }> => {
    return axiosPrivate.delete(`/answers/${id}`);
  },
};

export default answerService;

