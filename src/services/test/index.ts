import { axiosPrivate } from "@configs/axios";
import { TestCreateRequest, TestListRequest, TestTestSetLinkMultipleRequest } from "@models/test/request";
import {
  TestCreateResponseType,
  TestListResponseType,
  TestDetailResponseType,
} from "@models/test/response";

const testService = {
  getTests: async (params?: TestListRequest): Promise<TestListResponseType> => {
    const queryParams = new URLSearchParams();

    if (params?.currentPage)
      queryParams.append("currentPage", params.currentPage.toString());
    if (params?.pageSize)
      queryParams.append("pageSize", params.pageSize.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.levelN) queryParams.append("levelN", params.levelN.toString());
    if (params?.testType) queryParams.append("testType", params.testType);
    if (params?.status) queryParams.append("status", params.status);

    const queryString = queryParams.toString();
    const url = queryString ? `/test?${queryString}` : "/test";

    const response = await axiosPrivate.get(url);
    return response.data;
  },
  createTestWithMeanings: async (
    body: TestCreateRequest
  ): Promise<TestCreateResponseType> => {
    const response = await axiosPrivate.post("/test/with-meanings", body);
    return response.data;
  },
  updateTestWithMeanings: async (
    id: number,
    body: Partial<TestCreateRequest>
  ): Promise<TestCreateResponseType> => {
    const response = await axiosPrivate.put(`/test/${id}/with-meanings`, body);
    return response.data;
  },
  linkTestSetMultiple: async (
    testId: number,
    body: TestTestSetLinkMultipleRequest
  ): Promise<{ message: string } & Record<string, unknown>> => {
    const response = await axiosPrivate.post(
      `/test/${testId}/testSets`,
      body
    );
    return response.data;
  },
  getTestById: async (testId: number): Promise<TestDetailResponseType> => {
    const response = await axiosPrivate.get(`/test/${testId}`);
    return response.data;
  },

  // Remove linked questions from a TestSet by link/question ids
  deleteLinkedTestSetsMany: async (
    testId: number,
    testSetIds: number[]
  ): Promise<{ message: string } & Record<string, unknown>> => {
    const response = await axiosPrivate.delete(
      `/test/${testId}/testSets`,
      { data: { testSetIds } }
    );
    return response.data;
  },
  
  autoAddFreeTestSets: async (): Promise<{ message: string } & Record<string, unknown>> => {
    const response = await axiosPrivate.post(
      `/test/auto-add-free-testsets`
    );
    return response.data;
  },

  linkFinalTestMultiple: async (
    lessonId: number,
    body: TestTestSetLinkMultipleRequest
  ): Promise<{ message: string } & Record<string, unknown>> => {
    const response = await axiosPrivate.post(
      `test/lesson/${lessonId}/testSets`,
      body
    );
    return response.data;
  },
};

export default testService;
