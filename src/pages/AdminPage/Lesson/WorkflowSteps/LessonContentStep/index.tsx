import { useState, useEffect, useCallback } from "react";
import type { LessonContent } from "@models/lessonContent/entity";
import { Card, CardContent } from "@ui/Card";
import { Button } from "@ui/Button";
import { Dialog } from "@ui/Dialog";
import { Checkbox } from "@ui/Checkbox";
import {
  Plus,
  ArrowRight,
  Loader2,
  BookOpen,
  FileText,
  BookMarked,
  GripVertical,
} from "lucide-react";
import CreateContentDialog from "../../Dialogs/CreateContentDialog";
import ViewContentDialog from "../../Dialogs/ViewContentDialog";
import { useTranslation } from "react-i18next";
import lessonService from "@services/lesson";
import { QUESTION_TYPE } from "@constants/questionBank";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  useLessonContents,
  type SectionItem,
  type VocabularyItem,
  type GrammarItem,
  type KanjiItem,
  type MeaningEntry,
} from "@hooks/useLessonContents";

interface LessonItem {
  id: number;
  titleKey: string;
  levelJlpt: number;
  isPublished: boolean;
}

interface ContentSection {
  type:
    | typeof QUESTION_TYPE.VOCABULARY
    | typeof QUESTION_TYPE.GRAMMAR
    | typeof QUESTION_TYPE.KANJI;
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  contents: SectionItem[];
  isLoading: boolean;
  error: string | null;
  isDragMode: boolean;
  sortOrder: "contentOrder" | "alphabetical" | "level";
}

interface LessonContentStepProps {
  lesson: LessonItem;
  onNext: () => void;
}

// Sortable Item Component
// Type guards and helpers for safe extraction
const isRecord = (v: unknown): v is Record<string, unknown> =>
  !!v && typeof v === "object" && !Array.isArray(v);

const getStringFromRecord = (
  obj: Record<string, unknown>,
  key: string
): string | null => {
  const candidate = obj[key];
  if (typeof candidate === "string") return candidate;
  if (isRecord(candidate)) {
    const inner = candidate["value"];
    if (typeof inner === "string") return inner;
  }
  return null;
};

// Safely extract a human-readable meaning string from various backend shapes
const extractMeaningText = (entry: MeaningEntry, lang: string): string => {
  const value = entry?.meaning as unknown;

  if (typeof value === "string") return value;

  if (isRecord(value)) {
    // { value: "nước ép" }
    const directValue = value["value"];
    if (typeof directValue === "string") return directValue;

    // { translations: { vi: "..." } } or { translations: { vi: { value: "..." } } }
    if (isRecord(value.translations)) {
      const byLangFromObj =
        getStringFromRecord(
          value.translations as Record<string, unknown>,
          lang
        ) ??
        getStringFromRecord(
          value.translations as Record<string, unknown>,
          "vi"
        );
      if (byLangFromObj) return byLangFromObj;
    }

    // { translations: [ { language_code, value } ] }
    const translationsArr = value["translations"];
    if (Array.isArray(translationsArr)) {
      type TranslationItem = { language_code?: string; value?: unknown };
      const found = (translationsArr as TranslationItem[]).find(
        (it) =>
          it &&
          typeof it === "object" &&
          it.language_code === lang &&
          typeof it.value === "string"
      );
      if (found) return String(found.value);
      const viItem = (translationsArr as TranslationItem[]).find(
        (it) =>
          it &&
          typeof it === "object" &&
          it.language_code === "vi" &&
          typeof it.value === "string"
      );
      if (viItem) return String(viItem.value);
    }

    // { vi: "..." } or { vi: { value: "..." } }
    const byLang =
      getStringFromRecord(value, lang) ?? getStringFromRecord(value, "vi");
    if (byLang) return byLang;

    // Fallback: first string or { value: string }
    for (const v of Object.values(value)) {
      if (typeof v === "string") return v;
      if (isRecord(v)) {
        const maybe = v["value"];
        if (typeof maybe === "string") return maybe;
      }
    }
  }

  return entry?.meaningKey || "";
};

interface SortableItemProps {
  content: SectionItem;
  index: number;
  isDragMode: boolean;
  onView: (content: SectionItem) => void;
  onEdit: (content: SectionItem) => void;
  onDelete: (contentId: number) => void;
  onToggleSelect: (lessonContentId: number) => void;
  isSelected: boolean;
  sectionType:
    | typeof QUESTION_TYPE.VOCABULARY
    | typeof QUESTION_TYPE.GRAMMAR
    | typeof QUESTION_TYPE.KANJI;
  currentLanguage: string;
}

const SortableItem = ({
  content,
  index,
  isDragMode,
  onView,
  onEdit,
  onDelete,
  onToggleSelect,
  isSelected,
  sectionType,
  currentLanguage,
}: SortableItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: content.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-gradient-to-br from-blue-50 via-white to-indigo-100 border border-gray-200 p-4 rounded-lg flex items-center ${
        isDragging ? "shadow-lg" : ""
      }`}
    >
      <div className="flex items-center gap-4 flex-1">
        {isDragMode && (
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab hover:cursor-grabbing p-1 text-gray-400 hover:text-gray-600"
          >
            <GripVertical className="h-4 w-4" />
          </div>
        )}
        {!isDragMode && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={() =>
              onToggleSelect((content.lessonContentId as number) || content.id)
            }
          />
        )}
        <div className="text-sm font-medium text-gray-600">{index + 1}.</div>
        <div className="flex-1">
          <div className="text-gray-900 font-medium">
            {sectionType === QUESTION_TYPE.VOCABULARY
              ? (content as VocabularyItem)?.wordJp ??
                `${content?.contentType} #${content?.contentId}`
              : sectionType === QUESTION_TYPE.GRAMMAR
              ? (content as GrammarItem)?.title ??
                (content as GrammarItem)?.structure ??
                `${content?.contentType} #${content?.contentId}`
              : sectionType === QUESTION_TYPE.KANJI
              ? (content as KanjiItem)?.character ??
                `${content?.contentType} #${content?.contentId}`
              : `${content?.contentType} #${content?.contentId}`}
          </div>
          <div className="text-sm text-gray-600">
            {sectionType === QUESTION_TYPE.GRAMMAR
              ? (content as GrammarItem)?.description ?? ""
              : sectionType === QUESTION_TYPE.KANJI &&
                (content as KanjiItem)?.meaning
              ? extractMeaningText(
                  { meaning: (content as KanjiItem).meaning },
                  currentLanguage
                )
              : Array.isArray(content?.meanings)
              ? (content.meanings as MeaningEntry[])
                  .map((m) => extractMeaningText(m, currentLanguage))
                  .filter((s) => s)
                  .join(", ")
              : content?.meaningKey ?? ""}
          </div>
        </div>
      </div>
      {!isDragMode && (
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onView(content)}
            className="h-8 w-8 p-0"
          >
            <BookOpen className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(content)}
            className="h-8 w-8 p-0"
          >
            <FileText className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete(content.id)}
            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

const LessonContentStep = ({ lesson, onNext }: LessonContentStepProps) => {
  const { t, i18n } = useTranslation();
  const currentLanguage = (i18n?.language || "vi").split("-")[0];
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState<boolean>(false);
  const [selectedContent, setSelectedContent] = useState<SectionItem | null>(
    null
  );
  const [selectedSectionType, setSelectedSectionType] = useState<string>(
    QUESTION_TYPE.VOCABULARY
  );
  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // State for pending changes
  const [pendingChanges, setPendingChanges] = useState<
    Record<
      string,
      {
        contentType: string;
        lessonContentId: number[];
      }
    >
  >({});

  // Selected lesson-content ids for bulk actions
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  const toggleSelect = (lessonContentId: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(lessonContentId)) next.delete(lessonContentId);
      else next.add(lessonContentId);
      return next;
    });
  };

  const getSectionSelectedCount = (sectionType: string) => {
    const section = contentSections.find((s) => s.type === sectionType);
    if (!section) return 0;
    return section.contents.reduce((acc, c) => {
      const id = (c.lessonContentId as number) || c.id;
      return acc + (selectedIds.has(id) ? 1 : 0);
    }, 0);
  };

  const toggleSelectAllInSection = (sectionType: string) => {
    const section = contentSections.find((s) => s.type === sectionType);
    if (!section) return;
    const allIds = section.contents.map((c) => (c.lessonContentId as number) || c.id);
    const allSelected = allIds.every((id) => selectedIds.has(id));
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (allSelected) {
        allIds.forEach((id) => next.delete(id));
      } else {
        allIds.forEach((id) => next.add(id));
      }
      return next;
    });
  };

  // State for the three content sections
  const [contentSections, setContentSections] = useState<ContentSection[]>([
    {
      type: QUESTION_TYPE.VOCABULARY,
      title: "Part 1: Vocabulary",
      icon: BookOpen,
      color: "bg-blue-600",
      contents: [],
      isLoading: false,
      error: null,
      isDragMode: false,
      sortOrder: "contentOrder",
    },
    {
      type: QUESTION_TYPE.GRAMMAR,
      title: "Part 2: Grammar",
      icon: FileText,
      color: "bg-green-600",
      contents: [],
      isLoading: false,
      error: null,
      isDragMode: false,
      sortOrder: "contentOrder",
    },
    {
      type: QUESTION_TYPE.KANJI,
      title: "Part 3: Kanji",
      icon: BookMarked,
      color: "bg-purple-600",
      contents: [],
      isLoading: false,
      error: null,
      isDragMode: false,
      sortOrder: "contentOrder",
    },
  ]);

  const {
    lessonContentsData,
    isLessonContentsLoading,
    lessonContentErrorMessage,
    refetchLessonContents,
    removeLessonContentsFromCache,
  } = useLessonContents({
    lessonId: lesson.id,
    language: currentLanguage,
  });

  useEffect(() => {
    setContentSections((prev) =>
      prev.map((section) => {
        const baseSection = {
          ...section,
          isLoading: isLessonContentsLoading,
          error: lessonContentErrorMessage,
        };

        if (!lessonContentsData) return baseSection;

        if (section.type === QUESTION_TYPE.VOCABULARY) {
          return {
            ...baseSection,
            contents: lessonContentsData.vocabularyList,
          };
        }
        if (section.type === QUESTION_TYPE.GRAMMAR) {
          return {
            ...baseSection,
            contents: lessonContentsData.grammarList,
          };
        }
        if (section.type === QUESTION_TYPE.KANJI) {
          return {
            ...baseSection,
            contents: lessonContentsData.kanjiList,
          };
        }
        return baseSection;
      })
    );
  }, [
    lessonContentsData,
    isLessonContentsLoading,
    lessonContentErrorMessage,
  ]);

  // Fetch all sections in one grouped call using TanStack cache
  const fetchAllSections = useCallback(async () => {
    await refetchLessonContents();
  }, [refetchLessonContents]);

  const handleViewContent = (content: SectionItem) => {
    setSelectedContent(content);
    setIsViewDialogOpen(true);
  };

  const handleEditContent = (content: SectionItem) => {
    // TODO: Implement edit functionality
    console.log("Edit content:", content);
  };

  const handleDeleteContent = async (
    contentId: number,
    sectionType:
      | typeof QUESTION_TYPE.VOCABULARY
      | typeof QUESTION_TYPE.GRAMMAR
      | typeof QUESTION_TYPE.KANJI
  ) => {
    try {
      // Find the content to get lessonContentId
      const section = contentSections.find((s) => s.type === sectionType);
      const content = section?.contents.find((c) => c.id === contentId);

      if (!content) {
        toast.error("Không tìm thấy content để xóa");
        return;
      }

      const lessonContentId = content.lessonContentId || content.id;
      console.log("Deleting content:", {
        contentId,
        lessonContentId,
        sectionType,
      });

      // Call API to delete content
      await lessonService.deleteLessonContent(lessonContentId);

      // Update local state
      setContentSections((prev) =>
        prev.map((section) =>
          section.type === sectionType
            ? {
                ...section,
                contents: section.contents.filter((c) => c.id !== contentId),
              }
            : section
        )
      );

      // Unselect if present
      setSelectedIds((prev) => {
        const next = new Set(prev);
        next.delete(lessonContentId);
        return next;
      });

      removeLessonContentsFromCache([lessonContentId]);

      // silent success
    } catch (error) {
      console.error("Failed to delete content:", error);

      // Show error toast
      const errorMessage =
        error instanceof Error ? error.message : "Không thể xóa content";
      toast.error(errorMessage);
    }
  };

  const handleBulkDelete = async (sectionType?: string) => {
    // If a section is provided, only delete selected in that section; otherwise, delete all selected
    let idsToDelete: number[] = [];
    if (sectionType) {
      const section = contentSections.find((s) => s.type === sectionType);
      if (section) {
        idsToDelete = section.contents
          .map((c) => (c.lessonContentId as number) || c.id)
          .filter((id) => selectedIds.has(id));
      }
    } else {
      idsToDelete = Array.from(selectedIds);
    }

    if (idsToDelete.length === 0) {
      toast.error("Hãy chọn ít nhất một content để xóa");
      return;
    }

    try {
      await lessonService.deleteLessonContentsBulk(idsToDelete);

      // Remove from UI
      setContentSections((prev) =>
        prev.map((section) => ({
          ...section,
          contents: section.contents.filter(
            (c) => !idsToDelete.includes((c.lessonContentId as number) || c.id)
          ),
        }))
      );

      // Clear selection of deleted ids
      setSelectedIds((prev) => {
        const next = new Set(prev);
        idsToDelete.forEach((id) => next.delete(id));
        return next;
      });

      removeLessonContentsFromCache(idsToDelete);

      // silent success
    } catch (error) {
      console.error("Failed to bulk delete lesson contents:", error);
      toast.error("Không thể xóa các content đã chọn");
    }
  };

  const handleAddContent = (
    sectionType:
      | typeof QUESTION_TYPE.VOCABULARY
      | typeof QUESTION_TYPE.GRAMMAR
      | typeof QUESTION_TYPE.KANJI
  ) => {
    setSelectedSectionType(sectionType);
    setIsAddDialogOpen(true);
  };

  const handleContentAdded = async () => {
    // Refresh all sections after successful addition to keep counts in sync
    await fetchAllSections();
  };

  // Save all pending changes to BE
  const saveAllChanges = async () => {
    const changes = Object.values(pendingChanges);
    if (changes.length === 0) {
      console.log("No pending changes to save");
      return;
    }

    try {
      console.log(
        `📤 Saving ${changes.length} pending changes to BE:`,
        changes
      );

      // Send each change to BE
      for (const payload of changes) {
        const response = await lessonService.updateContentOrder(payload);
        console.log(
          `✅ Order updated for ${payload.contentType}:`,
          response.data
        );
      }

      // Clear pending changes
      setPendingChanges({});
      console.log("✅ All changes saved successfully");

      // Show success toast
      toast.success("Đã lưu thay đổi vị trí thành công!");
      await fetchAllSections();
    } catch (error) {
      console.error(`❌ Failed to save changes:`, error);

      // Show error toast
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Không thể lưu thay đổi vị trí";
      toast.error(errorMessage);
    }
  };

  // Handle drag end for reordering
  const handleDragEnd = (event: DragEndEvent, sectionType: string) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setContentSections((prev) =>
        prev.map((section) => {
          if (section.type === sectionType) {
            const oldIndex = section.contents.findIndex(
              (item) => item.id === active.id
            );
            const newIndex = section.contents.findIndex(
              (item) => item.id === over?.id
            );

            const newContents = arrayMove(section.contents, oldIndex, newIndex);

            // Update contentOrder for each item
            const updatedContents = newContents.map((content, index) => ({
              ...content,
              contentOrder: index + 1,
            }));

            // Create payload for BE update using lessonContentId
            const updatePayload = {
              contentType: sectionType,
              lessonContentId: updatedContents.map(
                (content) => content.lessonContentId || content.id
              ),
            };

            // Save to pending changes (will be sent when Save button is clicked)
            setPendingChanges((prev) => ({
              ...prev,
              [sectionType]: updatePayload,
            }));

            return {
              ...section,
              contents: updatedContents,
            };
          }
          return section;
        })
      );
    }
  };

  // Toggle drag mode for a section
  const toggleDragMode = (sectionType: string) => {
    setContentSections((prev) =>
      prev.map((section) =>
        section.type === sectionType
          ? { ...section, isDragMode: !section.isDragMode }
          : section
      )
    );
  };

  // Change sort order for a section
  // const changeSortOrder = (
  //   sectionType: string,
  //   newOrder: "contentOrder" | "alphabetical" | "level"
  // ) => {
  //   setContentSections((prev) =>
  //     prev.map((section) => {
  //       if (section.type === sectionType) {
  //         const sortedContents = [...section.contents];

  //         switch (newOrder) {
  //           case "alphabetical":
  //             sortedContents.sort((a, b) =>
  //               `${a.contentType}#${a.contentId}`.localeCompare(
  //                 `${b.contentType}#${b.contentId}`
  //               )
  //             );
  //             break;
  //           case "level":
  //             sortedContents.sort(
  //               (a, b) => (a.contentId || 0) - (b.contentId || 0)
  //             );
  //             break;
  //           case "contentOrder":
  //           default:
  //             sortedContents.sort(
  //               (a, b) => (a.contentOrder || 0) - (b.contentOrder || 0)
  //             );
  //             break;
  //         }

  //         return {
  //           ...section,
  //           contents: sortedContents,
  //           sortOrder: newOrder,
  //         };
  //       }
  //       return section;
  //     })
  //   );
  // };

  return (
    <div className="space-y-6 min-h-screen p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            {t("workflow.content.title")}
          </h3>
          <p className="text-muted-foreground">
            {t("workflow.content.description")}: {lesson.titleKey}
          </p>
        </div>
        <div className="flex gap-2">
          {Object.keys(pendingChanges).length > 0 && (
            <Button
              onClick={saveAllChanges}
              className="bg-green-600 text-white hover:bg-green-700 cursor-pointer"
            >
              💾 Lưu thay đổi ({Object.keys(pendingChanges).length})
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onNext}
            className="border-border text-foreground hover:bg-muted cursor-pointer"
          >
            {t("workflow.content.skipContent")}
          </Button>
          <Button onClick={onNext} className="bg-primary text-white">
            {t("workflow.content.nextExercises")}{" "}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>

      {/* Three Fixed Content Sections */}
      <div className="space-y-8">
        {contentSections.map((section) => {
          const SectionIcon = section.icon;

          return (
            <Card
              key={section.type}
              className="bg-white border-border shadow-lg"
            >
              <CardContent className="p-6">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-lg ${section.color}`}>
                      <SectionIcon className="h-6 w-6 text-white" />
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-foreground">
                        {section.title}
                        {pendingChanges[section.type] && (
                          <span className="ml-2 text-orange-500 text-sm">
                            ● Có thay đổi
                          </span>
                        )}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {section.contents.length} items
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {/* Sort Controls */}
                    {section.contents.length > 0 && (
                      <div className="flex items-center gap-1">
                        {/* <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            changeSortOrder(section.type, "contentOrder")
                          }
                          className={
                            section.sortOrder === "contentOrder"
                              ? "bg-primary text-white"
                              : ""
                          }
                        >
                          <ArrowUpDown className="h-4 w-4 mr-1" />
                          Order
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            changeSortOrder(section.type, "alphabetical")
                          }
                          className={
                            section.sortOrder === "alphabetical"
                              ? "bg-primary text-white"
                              : ""
                          }
                        >
                          A-Z
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => changeSortOrder(section.type, "level")}
                          className={
                            section.sortOrder === "level"
                              ? "bg-primary text-white"
                              : ""
                          }
                        >
                          Level
                        </Button> */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleDragMode(section.type)}
                          className={
                            section.isDragMode ? "bg-orange-500 text-white" : ""
                          }
                        >
                          <GripVertical className="h-4 w-4 mr-1" />
                          {section.isDragMode ? "Done" : "Reorder"}
                        </Button>
                        {/* Select all / delete selected for this section */}
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => toggleSelectAllInSection(section.type)}
                        >
                          {getSectionSelectedCount(section.type) ===
                          section.contents.length
                            ? "Bỏ chọn"
                            : "Chọn tất cả"}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={getSectionSelectedCount(section.type) === 0}
                          className={
                            getSectionSelectedCount(section.type) > 0
                              ? "text-red-600 border-red-200 hover:bg-red-50"
                              : ""
                          }
                          onClick={() => handleBulkDelete(section.type)}
                        >
                          Xóa đã chọn ({getSectionSelectedCount(section.type)})
                        </Button>
                      </div>
                    )}
                    <Button
                      onClick={() => handleAddContent(section.type)}
                      className="bg-primary text-white hover:bg-primary/90 cursor-pointer"
                      size="sm"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Content
                    </Button>
                  </div>
                </div>

                {/* Loading State */}
                {section.isLoading && (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    <span className="ml-2 text-muted-foreground">
                      Loading {section.type.toLowerCase()} content...
                    </span>
                  </div>
                )}

                {/* Error State */}
                {section.error && (
                  <div className="text-center py-8">
                    <div className="text-red-500 mb-4">{section.error}</div>
                    <Button
                      onClick={() => fetchAllSections()}
                      variant="outline"
                      size="sm"
                    >
                      Retry
                    </Button>
                  </div>
                )}

                {/* Content Display with Drag & Drop */}
                {!section.isLoading && !section.error && (
                  <div className="space-y-3">
                    {section.contents.length === 0 ? (
                      <div className="text-center py-8">
                        <div className="text-muted-foreground mb-4">
                          No {section.type.toLowerCase()} content yet
                        </div>
                        <Button
                          onClick={() => handleAddContent(section.type)}
                          variant="outline"
                          size="sm"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Item
                        </Button>
                      </div>
                    ) : (
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={(event) =>
                          handleDragEnd(event, section.type)
                        }
                      >
                        <SortableContext
                          items={section.contents.map((item) => item.id)}
                          strategy={verticalListSortingStrategy}
                        >
                          {/* Scrollable container with fixed height */}
                          <div
                            className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                            style={{
                              scrollBehavior: "smooth",
                            }}
                          >
                            {section.contents.map((content, index) => (
                              <SortableItem
                                key={content.id}
                                content={content}
                                index={index}
                                isDragMode={section.isDragMode}
                                sectionType={section.type}
                                currentLanguage={currentLanguage}
                                onView={handleViewContent}
                                onEdit={handleEditContent}
                                onDelete={(contentId) =>
                                  handleDeleteContent(contentId, section.type)
                                }
                                isSelected={selectedIds.has(
                                  (content.lessonContentId as number) || content.id
                                )}
                                onToggleSelect={toggleSelect}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialogs */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <CreateContentDialog
          setIsAddDialogOpen={setIsAddDialogOpen}
          lessonId={lesson.id}
          lessonTitle={lesson.titleKey}
          contentType={selectedSectionType}
          isOpen={isAddDialogOpen}
          onContentAdded={handleContentAdded}
        />
      </Dialog>

      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <ViewContentDialog
          content={selectedContent as unknown as LessonContent}
          onClose={() => setIsViewDialogOpen(false)}
          onEdit={handleEditContent}
          onDelete={(contentId) => {
            // Find which section this content belongs to
            const section = contentSections.find((s) =>
              s.contents.some((c) => c.id === contentId)
            );
            if (section) {
              handleDeleteContent(contentId, section.type);
            }
          }}
        />
      </Dialog>
    </div>
  );
};

export default LessonContentStep;
