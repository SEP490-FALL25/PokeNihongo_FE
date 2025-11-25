import { useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import lessonService from "@services/lesson";
import type { ICreateLessonContentRequest } from "@models/lessonContent/entity";

export type MeaningEntry = { meaningKey?: string; meaning?: unknown };

type BaseSectionItem = {
  id: number;
  contentType?: string;
  contentId?: number;
  contentOrder?: number;
  lessonId?: number;
  lessonContentId?: number;
  meaningKey?: string;
  meanings?: MeaningEntry[];
};

export type VocabularyItem = BaseSectionItem & { wordJp?: string };
export type GrammarItem = BaseSectionItem & {
  structure?: string;
  title?: string;
  description?: string;
};
export type KanjiItem = BaseSectionItem & {
  character?: string;
  meaning?: string;
};

export type SectionItem = VocabularyItem | GrammarItem | KanjiItem;

export type LessonContentsCache = {
  vocabularyList: SectionItem[];
  grammarList: SectionItem[];
  kanjiList: SectionItem[];
};

type UseLessonContentsOptions = {
  lessonId?: number;
  language?: string;
  queryEnabled?: boolean;
};

const getNormalizedLanguage = (language?: string) =>
  (language || "vi").split("-")[0];

export const useLessonContents = ({
  lessonId,
  language,
  queryEnabled = true,
}: UseLessonContentsOptions) => {
  const queryClient = useQueryClient();
  const normalizedLanguage = getNormalizedLanguage(language);

  const {
    data: lessonContentsData,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery<LessonContentsCache>({
    queryKey: ["lesson-contents", lessonId, normalizedLanguage],
    queryFn: async () => {
      const response = await lessonService.getLessonContentsByLessonId(
        lessonId as number,
        normalizedLanguage
      );
      const payload = response?.data?.data ?? response?.data ?? {};

      return {
        vocabularyList: (payload?.voca ?? []) as SectionItem[],
        grammarList: (payload?.grama ?? []) as SectionItem[],
        kanjiList: (payload?.kanji ?? []) as SectionItem[],
      };
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: Boolean(lessonId) && queryEnabled,
  });

  const removeLessonContentsFromCache = useCallback(
    (idsToDelete: number[]) => {
      if (!idsToDelete?.length || !lessonId) return;
      queryClient.setQueryData<LessonContentsCache>(
        ["lesson-contents", lessonId, normalizedLanguage],
        (prev) => {
          if (!prev) return prev;
          const filterItems = (items: SectionItem[]) =>
            items.filter(
              (item) =>
                !idsToDelete.includes(item.lessonContentId || item.id)
            );

          return {
            vocabularyList: filterItems(prev.vocabularyList),
            grammarList: filterItems(prev.grammarList),
            kanjiList: filterItems(prev.kanjiList),
          };
        }
      );
    },
    [lessonId, normalizedLanguage, queryClient]
  );

  const createMultipleContents = useCallback(
    async (contentType: string, contentIds: number[]) => {
      if (!lessonId) throw new Error("Lesson ID is required");

      const payload: ICreateLessonContentRequest = {
        lessonId,
        contentId: contentIds,
        contentType,
      };

      const response = await lessonService.createLessonContent(payload);
      await refetch();
      return response.data;
    },
    [lessonId, refetch]
  );

  const lessonContentErrorMessage = error
    ? error instanceof Error
      ? error.message
      : "Failed to fetch content"
    : null;

  return {
    lessonContentsData,
    isLessonContentsLoading: isLoading || isFetching,
    lessonContentErrorMessage,
    refetchLessonContents: refetch,
    removeLessonContentsFromCache,
    createMultipleContents,
  };
};

