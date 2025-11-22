import lessonService from "@services/lesson";
import { IQueryRequest } from "@models/common/request";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ICreateLessonRequest, IUpdateLessonRequest } from "@models/lesson/request";
import { useSelector } from "react-redux";
import { selectCurrentLanguage } from "@redux/features/language/selector";

/**
 * hanlde Lesson List
 * @param params IQueryRequest
 * @returns { data: data?.data?.data, isLoading, error }
 */
export const useLessonList = (params: IQueryRequest) => {
    const currentLanguage = useSelector(selectCurrentLanguage);


    const { data, isLoading, error } = useQuery({
        queryKey: ["lesson-list", params, currentLanguage],
        queryFn: () => lessonService.getLessonList({ ...params, language: currentLanguage }),
    })
    return { data: data?.data?.data, isLoading, error }
}

/**
 * hanlde Create Lesson
 * @param data ICreateLessonRequest
 * @returns { data: data?.data, isLoading, error }
 */
export const useCreateLesson = () => {
    const queryClient = useQueryClient();
    const createLessonMutation = useMutation({
        mutationFn: (data: ICreateLessonRequest) => lessonService.createLesson(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lesson-list'] });
        },
    })
    return createLessonMutation
}

/**
 * Handle Get Lesson By Id
 * @param id number
 * @returns { data: data?.data?.data, isLoading, error }
 */
export const useGetLessonById = (id: number | null) => {
    const { data, isLoading, error } = useQuery({
        queryKey: ["lesson-detail", id],
        queryFn: () => lessonService.getLessonById(id!),
        enabled: !!id,
    })
    return { data: data?.data?.data, isLoading, error }
}

/**
 * Handle Update Lesson
 * @param data IUpdateLessonRequest
 * @returns { data: data?.data, isLoading, error }
 */
export const useUpdateLesson = () => {
    const queryClient = useQueryClient();
    const updateLessonMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: IUpdateLessonRequest }) => lessonService.updateLesson(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['lesson-list'] });
            queryClient.invalidateQueries({ queryKey: ['lesson-detail'] });
        },
    })
    return updateLessonMutation
}