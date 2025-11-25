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
import { Search, Plus, Trash2, Eye, BookOpen, BookOpen as BookOpenIcon, FileText, Target, ArrowRight, CheckCircle2, Clock, Edit } from "lucide-react";
import { Tabs } from "@ui/Tabs";
import HeaderAdmin from "@organisms/Header/Admin";
import PaginationControls from "@ui/PaginationControls";
import { useLessonList } from "@hooks/useLesson";
import { Skeleton } from "@ui/Skeleton";
import TabListLevelJLBT from "@organisms/TabListLevelJLBT";
import { useTranslation } from "react-i18next";
import CreateLesson from "../CreateLesson";
import Breadcrumb from "@atoms/Breadcrumb";
import LessonContentStep from "../WorkflowSteps/LessonContentStep";
import LessonExercisesStep from "../WorkflowSteps/LessonExercisesStep";

interface LessonItem {
  id: number;
  slug: string;
  titleJp: string;
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
  const [editingLessonId, setEditingLessonId] = useState<number | null>(null);
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
    <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-3">
            <div className="flex items-center gap-2">
              <Skeleton className="h-8 w-8 rounded-lg" />
              <Skeleton className="h-6 w-3/4" />
            </div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="flex gap-2">
              <Skeleton className="h-6 w-16 rounded-full" />
              <Skeleton className="h-6 w-20 rounded-full" />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4 p-4 bg-muted/20 rounded-lg">
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
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-9" />
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

      <div className="mt-24 p-8 space-y-8">
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
          <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <BookOpenIcon className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl font-bold text-foreground">
                    {t("lesson.selectLesson")}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    {t("lesson.selectLessonDescription")}
                  </p>
                </div>
              </div>
            </CardHeader>
          </Card>
        ) : (
          <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl">
                    <BookOpenIcon className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {t("lesson.managing")}: {selectedLesson.titleJp}
                    </CardTitle>
                    <div className="flex items-center gap-3 mt-2">
                      <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 border-blue-500/30 shadow-sm font-medium">
                        JLPT N{selectedLesson.levelJlpt}
                      </Badge>
                      <Badge className={`shadow-sm font-medium ${
                        selectedLesson.isPublished
                          ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border-green-500/30"
                          : "bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-600 border-gray-500/30"
                      }`}>
                        {selectedLesson.isPublished
                          ? t("lesson.published")
                          : t("lesson.draft")}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() => setSelectedLesson(null)}
                  className="border-border text-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all shadow-sm"
                >
                  {t("lesson.backToLessons")}
                </Button>
              </div>

              {/* Workflow Steps */}
              <div className="flex items-center justify-center mt-6 pt-6 border-t border-border">
                <div className="flex items-center gap-4">
                  <div
                    onClick={() => setActiveStep("content")}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all shadow-lg ${
                      activeStep === "content"
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-xl scale-105"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:shadow-md"
                    }`}
                  >
                    <FileText className="h-5 w-5" />
                    <span className="font-semibold">
                      {t("lesson.workflowContent")}
                    </span>
                  </div>
                  <ArrowRight className={`h-5 w-5 transition-colors ${
                    activeStep === "content" ? "text-primary" : "text-muted-foreground"
                  }`} />
                  <div
                    onClick={() => setActiveStep("exercises")}
                    className={`flex items-center gap-3 px-6 py-3 rounded-xl cursor-pointer transition-all shadow-lg ${
                      activeStep === "exercises"
                        ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground shadow-xl scale-105"
                        : "bg-muted text-muted-foreground hover:bg-muted/80 hover:shadow-md"
                    }`}
                  >
                    <Target className="h-5 w-5" />
                    <span className="font-semibold">
                      {t("lesson.workflowExercises")}
                    </span>
                  </div>
                </div>
              </div>
            </CardHeader>
          </Card>
        )}

        {/* Main Content */}
        {!selectedLesson ? (
          <>
            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-3">
              <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                <CardHeader className="pb-3 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground/90">
                      {t("lesson.totalLessons")}
                    </CardTitle>
                    <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                      <BookOpenIcon className="w-5 h-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-4xl font-bold text-foreground mb-1">{pagination?.totalItem || 0}</div>
                  <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                <CardHeader className="pb-3 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground/90">
                      {t("lesson.published")}
                    </CardTitle>
                    <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-4xl font-bold text-foreground mb-1">
                    {lessons.filter((l) => l.isPublished).length}
                  </div>
                  <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                </CardContent>
              </Card>
              <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                <CardHeader className="pb-3 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground/90">
                      {t("lesson.draft")}
                    </CardTitle>
                    <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-4xl font-bold text-foreground mb-1">
                    {lessons.filter((l) => !l.isPublished).length}
                  </div>
                  <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                </CardContent>
              </Card>
              {/* <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                <CardHeader className="pb-3 relative">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-semibold text-foreground/90">
                      {t("lesson.totalStudents")}
                    </CardTitle>
                    <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="relative">
                  <div className="text-4xl font-bold text-foreground mb-1">
                    5,920
                  </div>
                  <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                </CardContent>
              </Card> */}
            </div>

            {/* Lessons Content */}
            <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <BookOpenIcon className="w-5 h-5 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold text-foreground">
                      {t("lesson.lessonList")}
                    </CardTitle>
                  </div>
                  <Dialog
                    open={isAddDialogOpen || editingLessonId !== null}
                    onOpenChange={(open) => {
                      setIsAddDialogOpen(open);
                      if (!open) setEditingLessonId(null);
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg">
                        <Plus className="h-4 w-4 mr-2" />
                        {t("lesson.addLesson")}
                      </Button>
                    </DialogTrigger>
                    <CreateLesson 
                      setIsAddDialogOpen={(open) => {
                        setIsAddDialogOpen(open);
                        if (!open) setEditingLessonId(null);
                      }} 
                      lessonId={editingLessonId}
                    />
                  </Dialog>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                    <Input
                      placeholder={t("lesson.searchPlaceholder")}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Select value={sortBy} onValueChange={setSortBy}>
                      <SelectTrigger className="w-[160px] bg-background border-border text-foreground h-11 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        <SelectItem value="createdAt">
                          {t("lesson.createdAt")}
                        </SelectItem>
                        <SelectItem value="updatedAt">
                          {t("lesson.updatedAt")}
                        </SelectItem>
                        <SelectItem value="titleJp">
                          {t("lesson.title")}
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <Select value={sort} onValueChange={setSort}>
                      <SelectTrigger className="w-[120px] bg-background border-border text-foreground h-11 shadow-sm">
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
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                  <Tabs value={activeJlptTab} onValueChange={setActiveJlptTab}>
                    <TabListLevelJLBT />
                  </Tabs>
                  <div className="flex items-center gap-2">
                    <div className="inline-flex h-10 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground shadow-sm">
                      <Button
                        variant={
                          activePublishTab === "published" ? "default" : "ghost"
                        }
                        className={`h-8 px-4 transition-all ${
                          activePublishTab === "published"
                            ? "bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-md font-bold"
                            : "hover:bg-muted/80"
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
                          activePublishTab === "draft" ? "default" : "ghost"
                        }
                        className={`h-8 px-4 transition-all ${
                          activePublishTab === "draft"
                            ? "bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-md font-bold"
                            : "hover:bg-muted/80"
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
              </CardHeader>
              <CardContent>
                <div className="mt-6">
                  {isLoading && lessons.length === 0 ? (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {Array.from({ length: itemsPerPage }).map((_, idx) => (
                        <LessonCardSkeleton key={`skeleton-${idx}`} />
                      ))}
                    </div>
                  ) : lessons.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                      <div className="p-3 bg-muted rounded-full mb-4">
                        <BookOpenIcon className="w-8 h-8 text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground font-medium text-lg">
                        {t("lesson.noLessons")}
                      </p>
                    </div>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {lessons.map((lesson) => (
                        <Card
                          key={lesson.id}
                          className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                        >
                          {/* Decorative gradient overlay */}
                          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                          
                          <CardHeader className="relative">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-3">
                                  <div className="p-2 bg-primary/10 rounded-lg">
                                    <BookOpenIcon className="w-4 h-4 text-primary" />
                                  </div>
                                  <CardTitle className="text-lg font-bold text-foreground line-clamp-2">
                                    {lesson.titleJp}
                                  </CardTitle>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                                  {lesson.slug}
                                </p>
                                <div className="flex gap-2 flex-wrap">
                                  <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 border-blue-500/30 shadow-sm font-medium">
                                    JLPT N{lesson.levelJlpt}
                                  </Badge>
                                  <Badge
                                    className={`shadow-sm font-medium ${
                                      lesson.isPublished
                                        ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border-green-500/30"
                                        : "bg-gradient-to-r from-yellow-500/20 to-amber-500/20 text-yellow-600 border-yellow-500/30"
                                    }`}
                                  >
                                    {getPublishedBadge(lesson.isPublished)}
                                  </Badge>
                                </div>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="relative">
                            <div className="space-y-3 text-sm mb-4 p-4 bg-muted/20 rounded-lg border border-border/50">
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium flex items-center gap-2">
                                  <Clock className="w-4 h-4" />
                                  {t("lesson.estimatedTime")}:
                                </span>
                                <span className="text-foreground font-bold">
                                  {lesson.estimatedTimeMinutes} {t("common.minutes")}
                                </span>
                              </div>
                              <div className="flex justify-between items-center">
                                <span className="text-muted-foreground font-medium">
                                  {t("lesson.lessonOrder")}:
                                </span>
                                <span className="text-foreground font-bold">
                                  {lesson.lessonOrder}
                                </span>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                className="flex-1 border-border text-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all shadow-sm"
                                onClick={() => setSelectedLesson(lesson)}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                {t("lesson.manage")}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-border text-foreground hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-all shadow-sm"
                                onClick={() => setEditingLessonId(lesson.id)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="border-border text-destructive hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all shadow-sm"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {pagination && pagination.totalPage > 0 && (
                    <Card className="bg-card border-border shadow-md mt-6">
                      <CardContent className="pt-4">
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
                      </CardContent>
                    </Card>
                  )}
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
