import { axiosPrivate } from "@configs/axios";
import { QuestionType } from "@constants/questionBank";
import { TestSetListRequest, TestSetCreateRequest, TestSetQuestionBankLinkMultipleRequest, TestSetUpsertWithQuestionBanksRequest } from "@models/testSet/request";
import { TestSetListResponseType, TestSetCreateResponseType } from "@models/testSet/response";

const testSetService = {
  getTestSets: async (params?: TestSetListRequest): Promise<TestSetListResponseType> => {
    const queryParams = new URLSearchParams();
    
    if (params?.currentPage) queryParams.append('currentPage', params.currentPage.toString());
    if (params?.pageSize) queryParams.append('pageSize', params.pageSize.toString());
    if (params?.search) queryParams.append('search', params.search);
    if (params?.levelN) queryParams.append('levelN', params.levelN.toString());
    if (params?.testType) queryParams.append('testType', params.testType);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.creatorId) queryParams.append('creatorId', params.creatorId.toString());
    if (params?.language) queryParams.append('language', params.language);
    if (params?.noExercies) queryParams.append('noExercies', params.noExercies.toString());
    if (params?.noPrice !== undefined) queryParams.append('noPrice', params.noPrice.toString());
    
    const queryString = queryParams.toString();
    const url = queryString ? `/testset?${queryString}` : '/testset';
    
    const response = await axiosPrivate.get(url);
    return response.data;
  },
  // Get a single test set including all question banks and full translations
  getTestSetWithQuestionBanksFull: async (
    id: number
  ): Promise<Record<string, unknown>> => {
    const response = await axiosPrivate.get(`/testset/${id}/with-question-banks-full`);
    return response.data;
  },
  createTestSetWithMeanings: async (
    body: TestSetCreateRequest
  ): Promise<TestSetCreateResponseType> => {
    const response = await axiosPrivate.post('/testset/with-meanings', body);
    return response.data;
  },
  updateTestSet: async (
    id: number,
    body: Partial<TestSetCreateRequest>
  ): Promise<TestSetCreateResponseType> => {
    const response = await axiosPrivate.put(`/testset/${id}/with-meanings`, body);
    return response.data;
  },
  linkQuestionBanksMultiple: async (
    body: TestSetQuestionBankLinkMultipleRequest
  ): Promise<{ message: string } & Record<string, unknown>> => {
    const response = await axiosPrivate.post('/testset-questionbank/multiple', body);
    return response.data;
  },
  // Fetch questions already linked to a TestSet
  getLinkedQuestionBanksByTestSet: async (
    testSetId: number
  ): Promise<Array<{ id: number; questionJp: string; questionType: QuestionType }>> => {
    const response = await axiosPrivate.get(
      `/testset-questionbank/testset/${testSetId}/full`
    );
    // API returns { statusCode, data, message }
    return response.data?.data ?? [];
  },
  // Remove linked questions from a TestSet by link/question ids
  deleteLinkedQuestionBanksMany: async (
    ids: number[]
  ): Promise<{ message: string } & Record<string, unknown>> => {
    const response = await axiosPrivate.delete(
      '/testset-questionbank/delete-many',
      { data: { ids } }
    );
    return response.data;
  },
  // Upsert test set with question banks (for speaking tests)
  upsertTestSetWithQuestionBanks: async (
    body: TestSetUpsertWithQuestionBanksRequest
  ): Promise<TestSetCreateResponseType> => {
    const response = await axiosPrivate.post('/testset/upsert-with-question-banks', body);
    return response.data;
  },
};

export default testSetService;
