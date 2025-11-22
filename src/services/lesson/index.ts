import { axiosPrivate } from "@configs/axios";
import { IQueryRequest } from "@models/common/request";
import { ICreateLessonRequest, IUpdateLessonRequest } from "@models/lesson/request";
import { ICreateLessonContentRequest } from "@models/lessonContent/entity";

const lessonService = {
  getLessonList: async ({
    page,
    limit,
    search,
    sort,
    sortBy,
    lessonCategoryId,
    levelJlpt,
    isPublished,
    ...rest
  }: IQueryRequest & {
    lessonCategoryId?: number;
    levelJlpt?: number;
    isPublished?: boolean;
    sort?: "asc" | "desc" | string;
  } = {}) => {
    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append("currentPage", String(page));
    if (limit !== undefined) queryParams.append("pageSize", String(limit));
    if (search) queryParams.append("search", search);
    if (lessonCategoryId !== undefined)
      queryParams.append("lessonCategoryId", String(lessonCategoryId));
    if (levelJlpt !== undefined)
      queryParams.append("levelJlpt", String(levelJlpt));
    if (typeof isPublished === "boolean")
      queryParams.append("isPublished", String(isPublished));
    if (sortBy) queryParams.append("sortBy", sortBy);
    if (sort) queryParams.append("sort", sort);

    // Append any other provided filters
    Object.entries(rest).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    return axiosPrivate.get(`/lessons?${queryParams.toString()}`);
  },
  createLesson: async (data: ICreateLessonRequest) => {
    return axiosPrivate.post("/lessons", data);
  },
  getLessonById: async (id: number) => {
    return axiosPrivate.get(`/lessons/${id}`);
  },
  updateLesson: async (id: number, data: IUpdateLessonRequest) => {
    return axiosPrivate.put(`/lessons/${id}`, data);
  },

  getLessonContentList: async (
    params?: IQueryRequest & {
      lessonId?: number;
      contentType?: string;
    }
  ) => {
    const queryParams = new URLSearchParams();

    // Pagination
    if (params?.page) {
      queryParams.append("currentPage", params.page.toString());
    }

    if (params?.limit) {
      queryParams.append("pageSize", params.limit.toString());
    }

    // Filters
    if (params?.lessonId) {
      queryParams.append("lessonId", params.lessonId.toString());
    }

    if (params?.contentType) {
      queryParams.append("contentType", params.contentType);
    }

    if (params?.search) {
      queryParams.append("search", params.search);
    }

    // Sort
    if (params?.sortBy) {
      queryParams.append("sortBy", params.sortBy);
    }

    if (params?.sort) {
      queryParams.append("sort", params.sort);
    }

    const queryString = queryParams.toString();
    return axiosPrivate.get(
      `/lesson-contents${queryString ? `?${queryString}` : ""}`
    );
  },
  // Fetch grouped lesson contents by lessonId with optional language
  getLessonContentsByLessonId: async (
    lessonId: number,
    lang?: string | null
  ) => {
    const query = new URLSearchParams();
    // If lang is explicitly undefined, default to null (send empty value)
    if (lang === undefined || lang === null) {
      query.append("lang", "");
    } else {
      query.append("lang", String(lang));
    }

    const qs = query.toString();
    return axiosPrivate.get(
      `/lesson-contents/${lessonId}${qs ? `?${qs}` : ""}`
    );
  },
  createLessonContent: async (data: ICreateLessonContentRequest) => {
    return axiosPrivate.post("/lesson-contents", data);
  },
  updateContentOrder: async (  data: {
    contentType: string;
    lessonContentId: number[];
  }) => {
    return axiosPrivate.put(`/lesson-contents/order`, data);
  },
  getExercisesByLessonId: async (lessonId: number) => {
    return axiosPrivate.get(`/exercises/lesson/${lessonId}`);
  },
  deleteLessonContent: async (lessonContentId: number) => {
    return axiosPrivate.delete(`/lesson-contents/${lessonContentId}`);
  },
  // Bulk delete lesson-contents by ids
  deleteLessonContentsBulk: async (ids: number[]) => {
    // axios.delete supports a request body via the `data` config field
    return axiosPrivate.delete(`/lesson-contents/bulk`, {
      data: { ids },
    });
  },
};

export default lessonService;
