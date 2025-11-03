import { DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog";
import { Input } from "@ui/Input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/Select";
import { Button } from "@ui/Button";
import { Card, CardContent } from "@ui/Card";
import { Badge } from "@ui/Badge";
import { Separator } from "@ui/Separator";
import { Checkbox } from "@ui/Checkbox";
import { useState, useEffect, useRef, useCallback } from "react";
import { toast } from "react-toastify";
import { useVocabularyList } from "@hooks/useVocabulary";
import { useGrammarList } from "@hooks/useGrammar";
import { useKanjiList } from "@hooks/useKanji";
import { useLessonContent } from "@hooks/useLessonContent";
import { QUESTION_TYPE } from "@constants/questionBank";
import {
  validateCreateContent,
  useFormValidation,
  commonValidationRules,
} from "@utils/validation";
import {
  X,
  BookOpen,
  Search,
  Volume2,
  Check,
  Loader2,
  FileText,
  Square,
} from "lucide-react";

// Base interface for all content types
interface BaseContent {
  id: number;
  levelN?: number;
  audioUrl?: string;
  imageUrl?: string;
  translations?: Record<string, unknown>;
}

interface Vocabulary extends BaseContent {
  wordJp: string;
  reading: string;
  wordType: {
    name: string;
  };
}

interface Grammar {
  id: number;
  structure: string;
  level: string;
  createdAt: string;
  updatedAt: string;
}

interface KanjiMeaning {
  meaningKey: string;
  translations: Record<string, unknown>;
}

interface KanjiReading {
  id: number;
  kanjiId: number;
  readingType: "onyomi" | "kunyomi";
  reading: string;
  createdAt: string;
  updatedAt: string;
}

interface Kanji {
  id: number;
  character: string; // kanji character
  meaningKey: string; // i18n translation key for meaning
  strokeCount?: number | null;
  jlptLevel?: number | null;
  meanings?: KanjiMeaning[];
  readings?: KanjiReading[];
  createdAt: string;
  updatedAt: string;
}

// Union type for all content types
type ContentItem = Vocabulary | Grammar | Kanji;

interface CreateContentDialogProps {
  setIsAddDialogOpen: (value: boolean) => void;
  lessonId?: number;
  lessonTitle?: string;
  contentType?: string;
  onContentAdded?: () => void;
  isOpen?: boolean;
}

const CreateContentDialog = ({
  setIsAddDialogOpen,
  lessonId,
  lessonTitle,
  contentType,
  onContentAdded,
  isOpen = true,
}: CreateContentDialogProps) => {
  // Content selection state
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [selectedItems, setSelectedItems] = useState<number[]>([]);
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage] = useState<number>(20);
  const [allItems, setAllItems] = useState<ContentItem[]>([]);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // State to control when to fetch data
  const [shouldFetch, setShouldFetch] = useState<boolean>(false);
  const [dialogKey, setDialogKey] = useState<number>(0);

  // Fetch data based on content type - only when shouldFetch is true
  const { data: vocabularies, isLoading: vocabLoading } = useVocabularyList({
    currentPage: page,
    pageSize: itemsPerPage,
    search: searchQuery || undefined,
    levelN: selectedLevel === "all" ? undefined : parseInt(selectedLevel),
    sortBy: "createdAt",
    sort: "desc",
    enabled: shouldFetch && contentType === QUESTION_TYPE.VOCABULARY,
    dialogKey: dialogKey,
    lessonId: lessonId,
  });

  const { data: grammars, isLoading: grammarLoading } = useGrammarList({
    currentPage: page,
    pageSize: itemsPerPage,
    search: searchQuery || undefined,
    level: selectedLevel === "all" ? undefined : parseInt(selectedLevel),
    sortBy: "createdAt",
    sort: "desc",
    enabled: shouldFetch && contentType === QUESTION_TYPE.GRAMMAR,
    dialogKey: dialogKey,
    lessonId: lessonId,
  });

  const { data: kanjis, isLoading: kanjiLoading } = useKanjiList({
    currentPage: page,
    pageSize: itemsPerPage,
    search: searchQuery || undefined,
    jlptLevel: selectedLevel === "all" ? undefined : parseInt(selectedLevel),
    sortBy: "character",
    sort: "asc",
    enabled: shouldFetch && contentType === QUESTION_TYPE.KANJI,
    dialogKey: dialogKey,
    lessonId: lessonId,
  });
  console.log(kanjis);
  // Determine which data to use based on content type
  const getCurrentData = () => {
    switch (contentType) {
      case QUESTION_TYPE.VOCABULARY:
        return { data: vocabularies, isLoading: vocabLoading };
      case QUESTION_TYPE.GRAMMAR:
        return { data: grammars, isLoading: grammarLoading };
      case QUESTION_TYPE.KANJI:
        return { data: kanjis, isLoading: kanjiLoading };
      default:
        return { data: vocabularies, isLoading: vocabLoading };
    }
  };

  const { data: currentData, isLoading } = getCurrentData();

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize validation rules
  const validationRules = {
    items: commonValidationRules.items,
  };

  const { validateField } = useFormValidation(validationRules);

  // Use lesson content hook for creating multiple contents
  const { createMultipleContents } = useLessonContent(lessonId || null);

  // Trigger fetch when dialog opens
  useEffect(() => {
    if (contentType && isOpen) {
      console.log("Setting shouldFetch to true for contentType:", contentType);
      // Reset all state first
      setAllItems([]);
      setSelectedItems([]);
      setPage(1);
      setSearchQuery("");
      setSelectedLevel("all");
      setHasMore(true);
      setIsLoadingMore(false);
      // Reset scroll position
      if (scrollContainerRef.current) {
        scrollContainerRef.current.scrollTop = 0;
      }
      // Then enable fetching
      setShouldFetch(true);
      setDialogKey((prev) => prev + 1); // Increment key to force fresh data
    }
  }, [contentType, isOpen]);

  // Reset state when dialog closes
  useEffect(() => {
    if (!isOpen) {
      console.log("Resetting state - dialog closed");
      setShouldFetch(false);
    }
  }, [isOpen]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
    setSelectedItems([]);
    // Don't reset allItems here - let the API call handle it
  }, [searchQuery, selectedLevel]);

  // Update all items when new data comes in
  useEffect(() => {
    const results = currentData?.results;
    const pagination = currentData?.pagination;

    if (results) {
      if (page === 1) {
        // Reset for new search/filter
        setAllItems(results);
      } else {
        // Append for pagination
        setAllItems((prev) => [...prev, ...results]);
      }

      // Check if there are more pages
      const totalPages = pagination?.totalPage || 1;
      setHasMore(page < totalPages);
      setIsLoadingMore(false);
    }
  }, [currentData, page]);

  // Reset page when search or filter changes
  useEffect(() => {
    setPage(1);
    setSelectedItems([]);
    // Don't reset allItems here - let the API call handle it
  }, [searchQuery, selectedLevel]);

  // Load more items (for infinite scroll)
  const loadMore = useCallback(() => {
    if (!isLoadingMore && hasMore && !isLoading) {
      setIsLoadingMore(true);
      setPage((prev) => prev + 1);
    }
  }, [isLoadingMore, hasMore, isLoading]);

  // Infinite scroll handler
  const handleScroll = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollTop, scrollHeight, clientHeight } = container;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100; // 100px threshold

    if (isNearBottom && hasMore && !isLoadingMore) {
      loadMore();
    }
  }, [hasMore, isLoadingMore, loadMore]);

  // Add scroll listener
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener("scroll", handleScroll);
      return () => container.removeEventListener("scroll", handleScroll);
    }
  }, [handleScroll]);

  // Handle item selection
  const handleItemToggle = (itemId: number) => {
    setSelectedItems((prev) => {
      const newItems = prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId];

      // Validate items

      const error = validateField("items", newItems);
      if (error) {
        setErrors((prev) => ({ ...prev, items: error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.items;
          return newErrors;
        });
      }

      return newItems;
    });
  };

  const handleSelectAll = () => {
    if (allItems.length > 0) {
      const allIds = allItems.map((item: ContentItem) => item.id);
      setSelectedItems(allIds);

      // Validate items

      const error = validateField("items", allIds);
      if (error) {
        setErrors((prev) => ({ ...prev, items: error }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.items;
          return newErrors;
        });
      }
    }
  };

  const handleDeselectAll = () => {
    setSelectedItems([]);

    // Validate items

    const error = validateField("items", []);
    if (error) {
      setErrors((prev) => ({ ...prev, items: error }));
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.items;
        return newErrors;
      });
    }
  };

  const handlePlayAudio = (audioUrl: string) => {
    const audio = new Audio(audioUrl);
    audio.play().catch((error) => {
      console.error("Error playing audio:", error);
    });
  };

  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "noun":
        return "bg-blue-500 text-white";
      case "verb":
        return "bg-green-500 text-white";
      case "adjective":
        return "bg-yellow-500 text-white";
      case "adverb":
        return "bg-indigo-500 text-white";
      case "particle":
        return "bg-pink-500 text-white";
      default:
        return "bg-gray-400 text-white";
    }
  };

  // Helper functions to render different content types
  const getContentIcon = () => {
    switch (contentType) {
      case QUESTION_TYPE.VOCABULARY:
        return <BookOpen className="h-6 w-6 text-primary" />;
      case QUESTION_TYPE.GRAMMAR:
        return <FileText className="h-6 w-6 text-primary" />;
      case QUESTION_TYPE.KANJI:
        return <Square className="h-6 w-6 text-primary" />;
      default:
        return <BookOpen className="h-6 w-6 text-primary" />;
    }
  };

  const getContentTitle = () => {
    switch (contentType) {
      case QUESTION_TYPE.VOCABULARY:
        return "Add Vocabulary to Lesson";
      case QUESTION_TYPE.GRAMMAR:
        return "Add Grammar to Lesson";
      case QUESTION_TYPE.KANJI:
        return "Add Kanji to Lesson";
      default:
        return "Add Content to Lesson";
    }
  };

  const getSearchPlaceholder = () => {
    switch (contentType) {
      case QUESTION_TYPE.VOCABULARY:
        return "Search vocabulary...";
      case QUESTION_TYPE.GRAMMAR:
        return "Search grammar...";
      case QUESTION_TYPE.KANJI:
        return "Search kanji...";
      default:
        return "Search content...";
    }
  };

  const renderContentItem = (item: ContentItem) => {
    const isSelected = selectedItems.includes(item.id);
    switch (contentType) {
      case QUESTION_TYPE.VOCABULARY: {
        const vocab = item as Vocabulary;
        return (
          <div
            key={vocab.id}
            className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
              isSelected
                ? "bg-primary/10 border-primary/20"
                : "bg-background border-border hover:bg-muted/50"
            }`}
            role="button"
            onClick={() => handleItemToggle(vocab.id)}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleItemToggle(vocab.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="font-semibold text-lg text-foreground">
                  {vocab.wordJp}
                </div>
                <div className="text-muted-foreground">{vocab.reading}</div>
                {vocab.wordType && (
                  <Badge className={getTypeBadgeColor(vocab.wordType.name)}>
                    {vocab.wordType.name.charAt(0).toUpperCase() +
                      vocab.wordType.name.slice(1)}
                  </Badge>
                )}
                <Badge className="text-white font-semibold">
                  N{vocab.levelN || "?"}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {vocab.audioUrl && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-blue-500 hover:bg-blue-100"
                  onClick={() => handlePlayAudio(vocab.audioUrl!)}
                >
                  <Volume2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        );
      }

      case QUESTION_TYPE.GRAMMAR: {
        const grammar = item as Grammar;
        return (
          <div
            key={grammar.id}
            className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
              isSelected
                ? "bg-primary/10 border-primary/20"
                : "bg-background border-border hover:bg-muted/50"
            }`}
            role="button"
            onClick={() => handleItemToggle(grammar.id)}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleItemToggle(grammar.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="font-semibold text-lg text-foreground">
                  {grammar.structure}
                </div>
                <Badge className="text-white font-semibold">
                  {grammar.level}
                </Badge>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Grammar doesn't have audio */}
            </div>
          </div>
        );
      }
      case QUESTION_TYPE.KANJI: {
        const kanji = item as Kanji;
        return (
          <div
            key={kanji.id}
            className={`flex items-center gap-4 p-3 rounded-lg border transition-colors ${
              isSelected
                ? "bg-primary/10 border-primary/20"
                : "bg-background border-border hover:bg-muted/50"
            }`}
            role="button"
            onClick={() => handleItemToggle(kanji.id)}
          >
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => handleItemToggle(kanji.id)}
              onClick={(e) => e.stopPropagation()}
            />
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="font-semibold text-2xl text-foreground">
                  {kanji.character}
                </div>
                <div className="text-muted-foreground">{kanji.meaningKey}</div>
                {kanji.strokeCount && (
                  <Badge variant="outline">{kanji.strokeCount} strokes</Badge>
                )}
                <Badge className="text-white font-semibold">
                  N{kanji.jlptLevel || "?"}
                </Badge>
              </div>
              {kanji.readings && kanji.readings.length > 0 && (
                <div className="text-sm text-muted-foreground mt-1">
                  {(() => {
                    const onyomi = kanji.readings
                      ?.filter((reading) => reading.readingType === "onyomi")
                      .map((reading) => reading.reading)
                      .join(", ");
                    const kunyomi = kanji.readings
                      ?.filter((reading) => reading.readingType === "kunyomi")
                      .map((reading) => reading.reading)
                      .join(", ");

                    const parts = [];
                    if (onyomi) parts.push(`音読み: ${onyomi}`);
                    if (kunyomi) parts.push(`訓読み: ${kunyomi}`);

                    return parts.join(" • ");
                  })()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {/* Kanji doesn't have audio */}
            </div>
          </div>
        );
      }

      default:
        return null;
    }
  };

  const validateForm = () => {
    const newErrors = validateCreateContent({ items: selectedItems });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      const contentTypeLabel =
        contentType === QUESTION_TYPE.VOCABULARY
          ? "vocabulary"
          : contentType === QUESTION_TYPE.GRAMMAR
          ? "grammar"
          : contentType === QUESTION_TYPE.KANJI
          ? "kanji"
          : "content";
      toast.error(`Please select at least one ${contentTypeLabel}`);
      return;
    }

    if (!lessonId) {
      toast.error("Lesson ID is required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Use the hook to create multiple contents
      await createMultipleContents(
        contentType || QUESTION_TYPE.VOCABULARY,
        selectedItems
      );

      const contentTypeLabel =
        contentType === QUESTION_TYPE.VOCABULARY
          ? "vocabulary"
          : contentType === QUESTION_TYPE.GRAMMAR
          ? "grammar"
          : contentType === QUESTION_TYPE.KANJI
          ? "kanji"
          : "content";
      console.log(`Adding ${contentTypeLabel} to lesson:`, selectedItems);

      // Call the callback to refresh parent component
      if (onContentAdded) {
        onContentAdded();
      }

      toast.success(
        `Successfully added ${selectedItems.length} ${contentTypeLabel} items to the lesson!`
      );
      setIsAddDialogOpen(false);
    } catch (error) {
      const contentTypeLabel =
        contentType === QUESTION_TYPE.VOCABULARY
          ? "vocabulary"
          : contentType === QUESTION_TYPE.GRAMMAR
          ? "grammar"
          : contentType === QUESTION_TYPE.KANJI
          ? "kanji"
          : "content";
      console.error(`Error adding ${contentTypeLabel}:`, error);
      toast.error(`Failed to add ${contentTypeLabel} to lesson`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <DialogContent className="bg-gradient-to-br from-white to-gray-50 border-border max-w-6xl max-h-[95vh] overflow-hidden">
        <DialogHeader className="pb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              {getContentIcon()}
            </div>
            <div>
              <DialogTitle className="text-2xl font-bold text-foreground">
                {getContentTitle()}
              </DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">
                {lessonTitle && `For lesson: ${lessonTitle}`} - {contentType}{" "}
                Section
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(95vh-200px)] pr-2">
          <div className="space-y-6">
            {/* Search and Filters */}
            <Card className="border-0 shadow-sm bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                      <Input
                        placeholder={getSearchPlaceholder()}
                        className="pl-10 bg-background border-border text-foreground"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Select
                      value={selectedLevel}
                      onValueChange={setSelectedLevel}
                    >
                      <SelectTrigger className="w-32 bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Levels</SelectItem>
                        <SelectItem value="5">N5</SelectItem>
                        <SelectItem value="4">N4</SelectItem>
                        <SelectItem value="3">N3</SelectItem>
                        <SelectItem value="2">N2</SelectItem>
                        <SelectItem value="1">N1</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selection Controls */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      className="text-xs"
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                      className="text-xs"
                    >
                      Deselect All
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {selectedItems.length} selected of {allItems.length} loaded
                  </div>
                </div>

                {/* Content List */}
                <div
                  ref={scrollContainerRef}
                  className="space-y-2 max-h-96 overflow-y-auto"
                >
                  {isLoading && page === 1 ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                      <span className="ml-2 text-muted-foreground">
                        Loading {contentType?.toLowerCase()}...
                      </span>
                    </div>
                  ) : allItems.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="text-muted-foreground">
                        No {contentType?.toLowerCase()} found
                      </div>
                    </div>
                  ) : (
                    allItems.map((item: ContentItem) => renderContentItem(item))
                  )}

                  {/* Auto Load More Indicator */}
                  {isLoadingMore && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      <span className="ml-2 text-sm text-muted-foreground">
                        Auto-loading more {contentType?.toLowerCase()}...
                      </span>
                    </div>
                  )}

                  {/* End of List Indicator */}
                  {!hasMore && allItems.length > 0 && (
                    <div className="text-center py-4 text-sm text-muted-foreground">
                      All {contentType?.toLowerCase()} loaded
                    </div>
                  )}
                </div>

                {/* Error Message */}
                {errors.items && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-2">
                    <X className="h-3 w-3" />
                    {errors.items}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        <Separator className="my-4" />

        <div className="flex justify-between items-center pt-4">
          <div className="text-xs text-muted-foreground">
            Select {contentType?.toLowerCase()} to add to the lesson • Scroll
            down to load more automatically
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setIsAddDialogOpen(false)}
              className="border-border text-foreground hover:bg-gray-50 h-10 px-6"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 h-10 px-6 shadow-lg"
              onClick={handleSubmit}
              disabled={selectedItems.length === 0 || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Check className="h-4 w-4 mr-2" />
              )}
              {isSubmitting
                ? "Adding..."
                : `Add ${selectedItems.length} ${contentType || "Content"}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </>
  );
};

export default CreateContentDialog;
