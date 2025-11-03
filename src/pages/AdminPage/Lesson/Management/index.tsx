import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Badge } from "@ui/Badge";
import { Dialog, DialogTrigger } from "@ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/Select";
import { Search, Plus, Trash2, Eye } from "lucide-react";
import { Tabs } from "@ui/Tabs";
import HeaderAdmin from "@organisms/Header/Admin";
import PaginationControls from "@ui/PaginationControls";
import { useLessonList } from "@hooks/useLesson";
import { Skeleton } from "@ui/Skeleton";
import TabListLevelJLBT from "@organisms/TabListLevelJLBT";
import { useTranslation } from "react-i18next";
import CreateLesson from "../CreateLesson";
import Breadcrumb from "@atoms/Breadcrumb";
import { BookOpen, FileText, Target, ArrowRight } from "lucide-react";
import LessonContentStep from "../WorkflowSteps/LessonContentStep";
import LessonExercisesStep from "../WorkflowSteps/LessonExercisesStep";

interface LessonItem {
  id: number;
  slug: string;
  titleKey: string;
  levelJlpt: number;
  estimatedTimeMinutes: number;
  lessonOrder: number;
  isPublished: boolean;
  publishedAt: string | null;
  version: string;
  lessonCategoryId: number;
}

const LessonsManagement = () => {
  const { t } = useTranslation();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);
  const [selectedLesson, setSelectedLesson] = useState<LessonItem | null>(null);
  const [activeStep, setActiveStep] = useState<string>("content"); // content, exercises
  const [activeJlptTab, setActiveJlptTab] = useState<string>("all");
  const [activePublishTab, setActivePublishTab] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const [itemsPerPage, setItemsPerPage] = useState<number>(15);
  const [sortBy, setSortBy] = useState<string>("createdAt");
  const [sort, setSort] = useState<string>("desc");

  const levelJlpt = activeJlptTab === "all" ? undefined : Number(activeJlptTab);
  const isPublished =
    activePublishTab === "all"
      ? undefined
      : activePublishTab === "published"
      ? true
      : activePublishTab === "draft"
      ? false
      : undefined;

  const { data, isLoading } = useLessonList({
    page,
    limit: itemsPerPage,
    search: searchQuery,
    levelJlpt,
    isPublished,
    sortBy,
    sort,
  });

  const lessons: LessonItem[] = data?.results || [];
  const pagination = data?.pagination;

  const getPublishedBadge = (published: boolean) =>
    published ? t("lesson.published") : t("lesson.draft");

  /**
   * Skeleton component for loading state
   */
  const LessonCardSkeleton = () => (
    <Card className="bg-muted/50 border-border">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="h-6 w-3/4 mb-2" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3 mt-1" />
          </div>
        </div>
        <div className="flex gap-2 mt-3">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-6 w-20 rounded-full" />
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-12" />
          </div>
          <div className="flex justify-between">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-4 w-8" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 flex-1" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      {/* Header */}
      <HeaderAdmin
        title={t("lesson.title")}
        description={t("lesson.description")}
      />

      <div className="mt-24 p-8">
        {/* Breadcrumb */}
        <Breadcrumb
          items={[
            {
              label: t("lesson.breadcrumb"),
              icon: <BookOpen className="h-4 w-4" />,
            },
          ]}
          className="mb-6"
        />

        {/* Lesson Selection */}
        {!selectedLesson ? (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-foreground mb-4">
              {t("lesson.selectLesson")}
            </h3>
            <p className="text-muted-foreground mb-6">
              {t("lesson.selectLessonDescription")}
            </p>
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-foreground">
                  {t("lesson.managing")}: {selectedLesson.titleKey}
                </h3>
                <p className="text-sm text-muted-foreground">
                  JLPT N{selectedLesson.levelJlpt} •{" "}
                  {selectedLesson.isPublished
                    ? t("lesson.published")
                    : t("lesson.draft")}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={() => setSelectedLesson(null)}
                className="border-border text-foreground hover:bg-muted"
              >
                {t("lesson.backToLessons")}
              </Button>
            </div>

            {/* Workflow Steps */}
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div
                  onClick={() => setActiveStep("content")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all hover:opacity-90 ${
                    activeStep === "content"
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <FileText className="h-4 w-4" />
                  <span className="font-medium">
                    {t("lesson.workflowContent")}
                  </span>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
                <div
                  onClick={() => setActiveStep("exercises")}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer transition-all hover:opacity-90 ${
                    activeStep === "exercises"
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  <Target className="h-4 w-4" />
                  <span className="font-medium">
                    {t("lesson.workflowExercises")}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        {!selectedLesson ? (
          <>
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("lesson.totalLessons")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">156</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("lesson.published")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">142</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("lesson.draft")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">14</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {t("lesson.totalStudents")}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-foreground">
                    5,920
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lessons Content */}
            <Card className="bg-card border-border">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-foreground">
                    {t("lesson.lessonList")}
                  </CardTitle>
                  <Dialog
                    open={isAddDialogOpen}
                    onOpenChange={setIsAddDialogOpen}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-primary text-white hover:bg-primary/90 rounded-full shadow-md transition-transform transform hover:scale-105">
                        <Plus className="h-4 w-4 mr-2" />
                        {t("lesson.addLesson")}
                      </Button>
                    </DialogTrigger>
                    <CreateLesson setIsAddDialogOpen={setIsAddDialogOpen} />
                  </Dialog>
                </div>
                <div className="mt-4 flex items-center gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder={t("lesson.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background border-border text-foreground"
                    />
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[160px] bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="createdAt">
                          {t("lesson.createdAt")}
                        </SelectItem>
                        <SelectItem value="updatedAt">
                          {t("lesson.updatedAt")}
                        </SelectItem>
                        <SelectItem value="titleKey">
                          {t("lesson.title")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger className="w-[120px] bg-background border-border text-foreground">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="asc">
                          {t("lesson.ascending")}
                        </SelectItem>
                        <SelectItem value="desc">
                          {t("lesson.descending")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <Tabs value={activeJlptTab} onValueChange={setActiveJlptTab}>
                    <TabListLevelJLBT />
                  </Tabs>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground">
                      <Button
                        variant={
                          activePublishTab === "published" ? "outline" : "ghost"
                        }
                        className={`h-8 px-4 hover:bg-gray-200 ${
                          activePublishTab === "published"
                            ? "shadow-xl bg-transparent font-bold"
                            : ""
                        }`}
                        onClick={() =>
                          setActivePublishTab(
                            activePublishTab === "published"
                              ? "all"
                              : "published"
                          )
                        }
                      >
                        {t("lesson.published")}
                      </Button>
                      <Button
                        variant={
                          activePublishTab === "draft" ? "outline" : "ghost"
                        }
                        className={`h-8 px-4 hover:bg-gray-200 ${
                          activePublishTab === "draft"
                            ? "shadow-xl bg-transparent font-bold"
                            : ""
                        }`}
                        onClick={() =>
                          setActivePublishTab(
                            activePublishTab === "draft" ? "all" : "draft"
                          )
                        }
                      >
                        {t("lesson.draft")}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  {lessons.length === 0 ? (
                    <div className="flex justify-center items-center h-96 w-full text-center">
                      <p className="text-muted-foreground text-center text-2xl font-bold">
                        {t("lesson.noLessons")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      {isLoading
                        ? Array.from({ length: itemsPerPage }).map((_, idx) => (
                            <LessonCardSkeleton key={`skeleton-${idx}`} />
                          ))
                        : lessons.map((lesson) => (
                            <Card
                              key={lesson.id}
                              className="bg-muted/50 border-border hover:border-primary/50 transition-colors"
                            >
                              <CardHeader>
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <CardTitle className="text-lg text-foreground mb-2">
                                      {lesson.titleKey}
                                    </CardTitle>
                                    <p className="text-sm text-muted-foreground line-clamp-2">
                                      {lesson.slug}
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2 mt-3">
                                  <Badge className="bg-chart-1 text-white">
                                    JLPT N{lesson.levelJlpt}
                                  </Badge>
                                  <Badge
                                    className={
                                      lesson.isPublished
                                        ? "bg-chart-4 text-white"
                                        : "bg-muted text-muted-foreground"
                                    }
                                  >
                                    {getPublishedBadge(lesson.isPublished)}
                                  </Badge>
                                </div>
                              </CardHeader>
                              <CardContent>
                                <div className="space-y-2 text-sm text-muted-foreground mb-4">
                                  <div className="flex justify-between">
                                    <span>{t("lesson.estimatedTime")}:</span>
                                    <span className="text-foreground font-medium">
                                      {lesson.estimatedTimeMinutes}{" "}
                                      {t("common.minutes")}
                                    </span>
                                  </div>
                                  <div className="flex justify-between">
                                    <span>{t("lesson.lessonOrder")}:</span>
                                    <span className="text-foreground font-medium">
                                      {lesson.lessonOrder}
                                    </span>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="flex-1 border-border text-foreground hover:bg-muted bg-transparent"
                                    onClick={() => setSelectedLesson(lesson)}
                                  >
                                    <Eye className="h-4 w-4 mr-1" />
                                    {t("lesson.manage")}
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="border-destructive text-destructive hover:bg-destructive/10 bg-transparent"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </CardContent>
                            </Card>
                          ))}
                    </div>
                  )}
                  <div className="flex justify-end mt-6">
                    {pagination && (
                      <PaginationControls
                        currentPage={pagination.current || 1}
                        totalPages={pagination.totalPage || 0}
                        totalItems={pagination.totalItem || 0}
                        itemsPerPage={pagination.pageSize || itemsPerPage}
                        onPageChange={(nextPage: number) => setPage(nextPage)}
                        onItemsPerPageChange={(size: number) =>
                          setItemsPerPage(size)
                        }
                        isLoading={isLoading}
                      />
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          /* Workflow Content */
          <div className="space-y-6">
            {activeStep === "content" && (
              <LessonContentStep
                lesson={selectedLesson}
                onNext={() => setActiveStep("exercises")}
              />
            )}

            {activeStep === "exercises" && (
              <LessonExercisesStep
                lesson={selectedLesson}
                onNext={() => {
                  setSelectedLesson(null);
                  setActiveStep("content");
                }}
                onBack={() => setActiveStep("content")}
              />
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default LessonsManagement;
