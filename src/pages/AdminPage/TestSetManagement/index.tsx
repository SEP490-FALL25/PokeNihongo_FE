import React, { useEffect, useState } from "react";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Textarea } from "@ui/Textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@ui/AlertDialog";
import {
  useTestSet,
  useCreateTestSet,
  useUpdateTestSet,
  useLinkQuestionBanksToTestSet,
  useGetLinkedQuestionBanksByTestSet,
  useDeleteLinkedQuestionBanksFromTestSet,
  useDeleteTestSet,
} from "@hooks/useTestSet";
import { TestSetCreateRequest } from "@models/testSet/request";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card";
import { Skeleton } from "@ui/Skeleton";
import { FileText, Plus, Mic, X, Loader2 } from "lucide-react";
import HeaderAdmin from "@organisms/Header/Admin";
import PaginationControls from "@ui/PaginationControls";
import { Checkbox } from "@ui/Checkbox";
import { Switch } from "@ui/Switch";
import { useQuestionBankList } from "@hooks/useQuestionBank";
import { IQueryQuestionRequest } from "@models/questionBank/request";
import { QuestionEntityType } from "@models/questionBank/entity";
import { QuestionType } from "@constants/questionBank";
import { toast } from "react-toastify";
import { AxiosError } from "axios";
import FilterSection from "./components/FilterSection";
import TestSetCard from "./components/TestSetCard";
import { extractText, getTranslation } from "./utils/helpers";
import { TestSetEntity } from "@models/testSet/entity";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const TestSetManagement: React.FC = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  // Helper function to extract error message from axios error response
  const getErrorMessage = (error: unknown, defaultMessage: string): string => {
    if (error instanceof AxiosError) {
      const message = error.response?.data?.message;
      if (message) {
        return Array.isArray(message) ? message.join(", ") : message;
      }
    }
    if (error instanceof Error) {
      return error.message;
    }
    return defaultMessage;
  };
  const {
    testSets,
    isLoading,
    filters,
    pagination,
    handleSearch,
    handleFilterByLevel,
    handleFilterByTestType,
    handleFilterByStatus,
    handlePageChange,
    handlePageSizeChange,
  } = useTestSet();
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddQuestionsOpen, setIsAddQuestionsOpen] = useState(false);
  const [selectedLinkedIds, setSelectedLinkedIds] = useState<number[]>([]);
  const [testSetIdToDelete, setTestSetIdToDelete] = useState<number | null>(null);
  
  // Test set service hooks
  const createTestSetMutation = useCreateTestSet();
  const updateTestSetMutation = useUpdateTestSet();
  const linkQuestionBanksMutation = useLinkQuestionBanksToTestSet();
  const deleteLinkedQuestionBanksMutation = useDeleteLinkedQuestionBanksFromTestSet();
  const deleteTestSetMutation = useDeleteTestSet();
  const {
    data: linkedQuestionsData,
    isLoading: loadingLinked,
  } = useGetLinkedQuestionBanksByTestSet(selectedId, { enabled: isDialogOpen && selectedId !== null });
  
  const linkedQuestions = (linkedQuestionsData || []).map((q) => ({
    ...q,
    questionType: (q.questionType as QuestionType) || "VOCABULARY" as QuestionType,
    levelN: (q as { levelN?: number }).levelN ?? 0,
  }));
  const [form, setForm] = useState({
    nameVi: "Đề thi từ vựng N5 - Phần 1",
    nameEn: "N5 Vocabulary Test - Part 1",
    descriptionVi:
      "Bộ đề thi từ vựng N5 bao gồm 50 câu hỏi về từ vựng cơ bản trong tiếng Nhật",
    descriptionEn:
      "N5 vocabulary test with 50 basic vocabulary questions in Japanese",
    content:
      "２月１４日は、日本ではバレンタインデーです。キリスト教の特別な日ですが、日本では、女の人が好きな人にチョコレートなどのプレゼントをする日になりました。世界にも同じような日があります。ブラジルでは、６月１２日が「恋人の日」と呼ばれる日です。その日は、男の人も女の人もプレゼントを用意して、恋人におくります。 ブラジルでは、日本のようにチョコレートではなく、写真立てに写真を入れて、プレゼントするそうです。",
    audioUrl:
      "https://storage.googleapis.com/pokenihongo-audio/testset-n5-vocab-instruction.mp3",
    price: 0,
    levelN: 5,
    testType: "VOCABULARY" as TestSetCreateRequest["testType"],
    status: "DRAFT" as TestSetCreateRequest["status"],
  });

  const openCreate = () => {
    setSelectedId(null);
    setForm({
      nameVi: "",
      nameEn: "",
      descriptionVi: "",
      descriptionEn: "",
      content: "",
      audioUrl: "",
      price: 1,
      levelN: 0,
      testType: "GENERAL",
      status: "ACTIVE",
    });
    setIsDialogOpen(true);
  };

  const openEdit = (id: number) => {
    const item = testSets.find((t) => t.id === id);
    if (!item) return;
    setForm({
      nameVi:
        getTranslation(
          (item as unknown as Record<string, unknown>).name,
          "vi"
        ) ||
        extractText((item as unknown as Record<string, unknown>).name, "vi"),
      nameEn:
        getTranslation(
          (item as unknown as Record<string, unknown>).name,
          "en"
        ) ||
        extractText((item as unknown as Record<string, unknown>).name, "en"),
      descriptionVi:
        getTranslation(
          (item as unknown as Record<string, unknown>).description,
          "vi"
        ) ||
        extractText(
          (item as unknown as Record<string, unknown>).description,
          "vi"
        ),
      descriptionEn:
        getTranslation(
          (item as unknown as Record<string, unknown>).description,
          "en"
        ) ||
        extractText(
          (item as unknown as Record<string, unknown>).description,
          "en"
        ),
      content: (item as unknown as Record<string, unknown>).content as string,
      audioUrl: item.audioUrl || "",
      price: item.price || 0,
      levelN: item.levelN,
      testType: item.testType,
      status: item.status,
    });
    setSelectedId(id);
    setIsDialogOpen(true);
  };

  // Reset selected linked IDs when dialog closes
  useEffect(() => {
    if (!isDialogOpen) {
      setSelectedLinkedIds([]);
    }
  }, [isDialogOpen]);

  const handleRemoveLinked = async (id: number) => {
    if (!id) return;
    deleteLinkedQuestionBanksMutation.mutate([id], {
      onSuccess: () => {
        setSelectedLinkedIds((prev) => prev.filter((qId) => qId !== id));
        toast.success(t("testSetManagement.removeQuestionSuccess"));
      },
      onError: (e) => {
        console.error(t("testSetManagement.removeQuestionError"), e);
        toast.error(getErrorMessage(e, t("testSetManagement.removeQuestionError")));
      },
    });
  };

  const toggleSelectLinked = (id: number) => {
    setSelectedLinkedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleRemoveSelectedLinked = async () => {
    if (selectedLinkedIds.length === 0) {
      toast.error(t("testSetManagement.selectAtLeastOneQuestionToDelete"));
      return;
    }
    deleteLinkedQuestionBanksMutation.mutate(selectedLinkedIds, {
      onSuccess: () => {
        toast.success(
          t("testSetManagement.removeSelectedQuestionsSuccess", {
            count: selectedLinkedIds.length,
          })
        );
        setSelectedLinkedIds([]);
      },
      onError: (e) => {
        console.error(t("testSetManagement.removeQuestionError"), e);
        toast.error(getErrorMessage(e, t("testSetManagement.removeQuestionError")));
      },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const body = {
      content: form.content,
      meanings: [
        {
          field: "name" as const,
          translations: { vi: form.nameVi, en: form.nameEn },
        },
        {
          field: "description" as const,
          translations: { vi: form.descriptionVi, en: form.descriptionEn },
        },
      ],
      audioUrl: form.audioUrl,
      price: form.price,
      levelN: form.levelN,
      testType: form.testType,
      status: form.status,
    } as TestSetCreateRequest;

    try {
      if (selectedId) {
        // Update test set
        updateTestSetMutation.mutate(
          { id: selectedId, data: body },
          {
            onSuccess: () => {
              // Link selected questions if any on update flow
              if (selectedQuestionIds.length > 0) {
                linkQuestionBanksMutation.mutate(
                  {
                    testSetId: selectedId,
                    questionBankIds: selectedQuestionIds,
                  },
                  {
                    onSuccess: () => {
                      setSelectedQuestionIds([]);
                      toast.success(t("testSetManagement.updateSuccess"));
                      setIsDialogOpen(false);
                      setSelectedId(null);
                      setSaving(false);
                    },
                    onError: () => {
                      // Still close dialog even if linking fails
                      toast.success(t("testSetManagement.updateSuccess"));
                      setIsDialogOpen(false);
                      setSelectedId(null);
                      setSaving(false);
                    },
                  }
                );
              } else {
                toast.success(t("testSetManagement.updateSuccess"));
                setIsDialogOpen(false);
                setSelectedId(null);
                setSaving(false);
              }
            },
            onError: () => {
              // Error handled by hook
              setSaving(false);
            },
          }
        );
      } else {
        // Create test set
        createTestSetMutation.mutate(body, {
          onSuccess: (response) => {
            const newId = response?.data?.id;
            if (!newId) {
          toast.error(t("testSetManagement.createNoId"));
              setSaving(false);
              return;
            }

            // If admin has pre-selected questions, link them now using new id
            if (selectedQuestionIds.length > 0) {
              linkQuestionBanksMutation.mutate(
                {
                  testSetId: newId,
                  questionBankIds: selectedQuestionIds,
                },
                {
                  onSuccess: () => {
                    setSelectedQuestionIds([]);
                toast.success(t("testSetManagement.createSuccess"));
                    // keep dialog open and switch to edit mode for further actions
                    setSelectedId(newId);
                    setIsDialogOpen(true);
                    // open add-questions dialog so admin can tiếp tục thêm
                    setQbForceKey((k) => k + 1);
                    setIsAddQuestionsOpen(true);
                    setSaving(false);
                  },
                  onError: () => {
                    // Still proceed even if linking fails
                toast.success(t("testSetManagement.createSuccess"));
                    setSelectedId(newId);
                    setIsDialogOpen(true);
                    setQbForceKey((k) => k + 1);
                    setIsAddQuestionsOpen(true);
                    setSaving(false);
                  },
                }
              );
            } else {
          toast.success(t("testSetManagement.createSuccess"));
              setSelectedId(newId);
              setIsDialogOpen(true);
              setQbForceKey((k) => k + 1);
              setIsAddQuestionsOpen(true);
              setSaving(false);
            }
          },
          onError: () => {
            // Error handled by hook
            setSaving(false);
          },
        });
        return; // Early return since mutation handles the flow
      }
    } catch (e) {
      console.error(t("testSetManagement.unknownError"), e);
      toast.error(getErrorMessage(e, t("testSetManagement.unknownError")));
      setSaving(false);
    }
  };

  // Add questions dialog state
  const [qbSearch, setQbSearch] = useState("");
  const [qbPage, setQbPage] = useState(1);
  const [qbPageSize, setQbPageSize] = useState(15);
  const [qbNoTestSet, setQbNoTestSet] = useState<boolean>(false);
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<number[]>([]);
  const [qbForceKey, setQbForceKey] = useState(0);

  type QuestionListFilters = IQueryQuestionRequest & {
    testSetId?: number;
    noTestSet?: boolean;
  };

  const {
    data: qbItems,
    pagination: qbPagination,
    isLoading: qbLoading,
  } = useQuestionBankList({
    page: qbPage,
    limit: qbPageSize,
    search: qbSearch || undefined,
    levelN: form.levelN === 0 ? undefined : (form.levelN as unknown as number),
    questionType: form.testType === "GENERAL" ? undefined : (form.testType as unknown as QuestionType),
    // extra flexible fields supported by backend through catchall
    testSetId: selectedId || undefined,
    noTestSet: qbNoTestSet,
    forceKey: qbForceKey,
  } as QuestionListFilters);

  const toggleSelectQuestion = (id: number) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleOpenAddQuestions = () => {
    if (!selectedId) return;
    setSelectedQuestionIds([]);
    setQbSearch("");
    setQbPage(1);
    setQbForceKey((k) => k + 1);
    setIsAddQuestionsOpen(true);
  };

  const handleLinkSelected = () => {
    if (!selectedId || selectedQuestionIds.length === 0) {
      toast.error(t("testSetManagement.selectAtLeastOneQuestion"));
      return;
    }
    linkQuestionBanksMutation.mutate(
      {
        testSetId: selectedId,
        questionBankIds: selectedQuestionIds,
      },
      {
        onSuccess: () => {
          toast.success(t("testSetManagement.addQuestionSuccess"));
          setSelectedQuestionIds([]);
          setQbForceKey((k) => k + 1);
          setIsAddQuestionsOpen(false);
        },
        onError: () => {
          // Error handled by hook
        },
      }
    );
  };

  const handleDeleteTestSet = (id: number) => {
    setTestSetIdToDelete(id);
  };

  const handleDeleteConfirm = async () => {
    if (testSetIdToDelete === null) return;

    try {
      await deleteTestSetMutation.mutateAsync(testSetIdToDelete);
      toast.success(t("testSetManagement.deleteSuccess"));
      setTestSetIdToDelete(null);
    } catch (error) {
      console.error("Error deleting test set:", error);
      // Error already handled by hook
    }
  };

  return (
    <>
      <HeaderAdmin
        title={t("testSetManagement.title")}
        description={t("testSetManagement.description")}
      />

      <div className="p-8 mt-24 space-y-8">
        <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">
                  {t("testSetManagement.title")}
                </CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline"
                  onClick={() => navigate('/manager/testset-speaking')}
                  className="border-border text-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all shadow-sm"
                >
                  <Mic className="h-4 w-4 mr-2" />
                  {t("testSetManagement.addSpeakingTest")}
                </Button>
                <Button 
                  onClick={openCreate}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  {t("testSetManagement.addNew")}
                </Button>
              </div>
            </div>
            <FilterSection
              filters={filters}
              onSearchChange={handleSearch}
              onLevelChange={handleFilterByLevel}
              onTestTypeChange={handleFilterByTestType}
              onStatusChange={handleFilterByStatus}
            />
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader>
                      <div className="flex items-center gap-2 mb-3">
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <Skeleton className="h-6 w-3/4" />
                      </div>
                      <Skeleton className="h-6 w-24 rounded-full" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : testSets.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="p-3 bg-muted rounded-full mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium text-lg">
                  {t("testSetManagement.noTestSets")}
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {testSets.map((t) => (
                    <TestSetCard
                      key={t.id}
                      testSet={t as unknown as TestSetEntity}
                      extractText={extractText}
                      onClick={() => {
                        if (t.testType === "SPEAKING") {
                          navigate(`/manager/testset-speaking/${t.id}`);
                        } else {
                          openEdit(t.id);
                        }
                      }}
                      onDelete={handleDeleteTestSet}
                    />
                  ))}
                </div>
                {pagination && pagination.totalPage > 0 && (
                  <Card className="bg-card border-border shadow-md mt-6">
                    <CardContent className="pt-4">
                      <PaginationControls
                        currentPage={pagination.current || 1}
                        totalPages={pagination.totalPage || 0}
                        totalItems={pagination.totalItem || 0}
                        itemsPerPage={pagination.pageSize || 10}
                        onPageChange={(nextPage: number) =>
                          handlePageChange(nextPage)
                        }
                        onItemsPerPageChange={(size: number) =>
                          handlePageSizeChange(size)
                        }
                        isLoading={isLoading}
                      />
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Dialog
          open={isDialogOpen}
          onOpenChange={(o) => {
            if (!o) {
              setIsDialogOpen(false);
              setSelectedId(null);
              setSelectedLinkedIds([]);
            }
          }}
        >
          <DialogContent className="max-w-2xl bg-white">
            <DialogHeader>
              <DialogTitle>
                {selectedId
                  ? t("testSetManagement.editTitle")
                  : t("testSetManagement.createTitle")}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">
                    {t("testSetManagement.nameVi")}
                  </label>
                  <Input
                    value={form.nameVi}
                    onChange={(e) =>
                      setForm({ ...form, nameVi: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("testSetManagement.nameEn")}
                  </label>
                  <Input
                    value={form.nameEn}
                    onChange={(e) =>
                      setForm({ ...form, nameEn: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("testSetManagement.descriptionVi")}
                  </label>
                  <Input
                    value={form.descriptionVi}
                    onChange={(e) =>
                      setForm({ ...form, descriptionVi: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("testSetManagement.descriptionEn")}
                  </label>
                  <Input
                    value={form.descriptionEn}
                    onChange={(e) =>
                      setForm({ ...form, descriptionEn: e.target.value })
                    }
                  />
                </div>
              </div>
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
              />
              <label className="text-sm font-medium">Audio URL</label>
              <Input
                value={form.audioUrl}
                onChange={(e) => setForm({ ...form, audioUrl: e.target.value })}
              />
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="flex items-center gap-2">
                  <label className="text-sm font-medium">Có phí</label>
                  <Switch
                    checked={form.price === 1}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, price: checked ? 1 : 0 })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("testSetManagement.levelN")}
                  </label>
                  <Select
                    value={String(form.levelN)}
                    onValueChange={(v) =>
                      setForm({ ...form, levelN: Number(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("testSetManagement.selectLevel")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">{t("testManagement.allLevels")}</SelectItem>
                      <SelectItem value="1">{t("testManagement.levels.N1")}</SelectItem>
                      <SelectItem value="2">{t("testManagement.levels.N2")}</SelectItem>
                      <SelectItem value="3">{t("testManagement.levels.N3")}</SelectItem>
                      <SelectItem value="4">{t("testManagement.levels.N4")}</SelectItem>
                      <SelectItem value="5">{t("testManagement.levels.N5")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("testSetManagement.testType")}
                  </label>
                  <Select
                    value={form.testType}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        testType: v as TestSetCreateRequest["testType"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("testSetManagement.selectTestType")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VOCABULARY">
                        {t("testManagement.testSetTypes.VOCABULARY")}
                      </SelectItem>
                      <SelectItem value="GRAMMAR">
                        {t("testManagement.testSetTypes.GRAMMAR")}
                      </SelectItem>
                      <SelectItem value="KANJI">
                        {t("testManagement.testSetTypes.KANJI")}
                      </SelectItem>
                      <SelectItem value="LISTENING">
                        {t("testManagement.testSetTypes.LISTENING")}
                      </SelectItem>
                      <SelectItem value="READING">
                        {t("testManagement.testSetTypes.READING")}
                      </SelectItem>
                      <SelectItem value="SPEAKING">
                        {t("testManagement.testSetTypes.SPEAKING")}
                      </SelectItem>
                      <SelectItem value="GENERAL">
                        {t("testManagement.testSetTypes.GENERAL")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">
                    {t("testSetManagement.status")}
                  </label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        status: v as TestSetCreateRequest["status"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={t("testSetManagement.selectStatus")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">
                        {t("testSetManagement.statuses.DRAFT")}
                      </SelectItem>
                      <SelectItem value="ACTIVE">
                        {t("testSetManagement.statuses.ACTIVE")}
                      </SelectItem>
                      <SelectItem value="INACTIVE">
                        {t("testSetManagement.statuses.INACTIVE")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      {t("testSetManagement.linkedQuestions")}
                    </label>
                    {selectedLinkedIds.length > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        className=" text-white hover:bg-red-400 bg-red-400 border-2 border-red-400"
                        size="sm"
                        onClick={handleRemoveSelectedLinked}
                      >
                        {t("testSetManagement.removeSelected")} ({selectedLinkedIds.length})
                      </Button>
                    )}
                  </div>
                  <div className="border rounded">
                    {loadingLinked ? (
                      <div className="p-4 text-sm text-gray-500">
                        {t("common.loading")}
                      </div>
                    ) : linkedQuestions.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">
                        {t("testSetManagement.noQuestions")}
                      </div>
                    ) : (
                      <div className="max-h-[30vh] overflow-auto">
                        {linkedQuestions.map((q) => (
                          <div
                            key={q.id}
                            role="button"
                            onClick={() => toggleSelectLinked(q.id)}
                            className="flex items-start gap-3 p-3 border-b hover:bg-gray-50"
                          >
                            <Checkbox
                              checked={selectedLinkedIds.includes(q.id)}
                              onCheckedChange={() => toggleSelectLinked(q.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">
                                {q.questionJp} - {q.questionType} - N{q.levelN || 0}
                              </div>
                            </div>
                            <button
                              type="button"
                              aria-label="Remove"
                              className="text-gray-500 hover:text-red-600 shrink-0"
                              onClick={() => handleRemoveLinked(q.id)}
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleOpenAddQuestions}
                >
                  {t("testSetManagement.addQuestion")}
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedId(null);
                  }}
                >
                  {t("common.cancel")}
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || createTestSetMutation.isPending || updateTestSetMutation.isPending}
                >
                  {saving || createTestSetMutation.isPending || updateTestSetMutation.isPending
                    ? t("common.saving")
                    : t("common.save")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Questions Dialog */}
        <Dialog open={isAddQuestionsOpen} onOpenChange={setIsAddQuestionsOpen}>
          <DialogContent className="max-w-3xl bg-white">
            <DialogHeader>
              <DialogTitle>
                {t("testSetManagement.addQuestionsTitle", { id: selectedId ?? "" })}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Input
                  placeholder={t("testSetManagement.searchQuestionPlaceholder")}
                  value={qbSearch}
                  onChange={(e) => {
                    setQbSearch(e.target.value);
                    setQbPage(1);
                  }}
                />
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm text-muted-foreground">
                    {t("testSetManagement.fetchNoTestSet")}
                  </span>
                  <Switch
                    checked={qbNoTestSet}
                    onCheckedChange={(val) => {
                      setQbNoTestSet(Boolean(val));
                      setQbPage(1);
                      setQbForceKey((k) => k + 1);
                    }}
                  />
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <label className="text-sm font-medium">
                    {t("testSetManagement.questionType")}
                  </label>
                  <Select
                    value={form.testType}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        testType: v as TestSetCreateRequest["testType"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t("testSetManagement.selectTestType")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VOCABULARY">
                        {t("testManagement.testSetTypes.VOCABULARY")}
                      </SelectItem>
                      <SelectItem value="GRAMMAR">
                        {t("testManagement.testSetTypes.GRAMMAR")}
                      </SelectItem>
                      <SelectItem value="KANJI">
                        {t("testManagement.testSetTypes.KANJI")}
                      </SelectItem>
                      <SelectItem value="LISTENING">
                        {t("testManagement.testSetTypes.LISTENING")}
                      </SelectItem>
                      <SelectItem value="READING">
                        {t("testManagement.testSetTypes.READING")}
                      </SelectItem>
                      <SelectItem value="SPEAKING">
                        {t("testManagement.testSetTypes.SPEAKING")}
                      </SelectItem>
                      <SelectItem value="GENERAL">
                        {t("testManagement.testSetTypes.GENERAL")}
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded">
                {qbLoading ? (
                  <div className="p-4 text-sm text-gray-500">{t("common.loading")}</div>
                ) : qbItems.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    {t("testSetManagement.noMatchingQuestions")}
                  </div>
                ) : (
                  <div className="max-h-[50vh] overflow-auto">
                    {(qbItems as unknown as QuestionEntityType[]).map((q) => (
                      <div
                        key={q.id}
                        className="flex items-start gap-3 p-3 border-b cursor-pointer hover:bg-gray-50"
                        role="button"
                        onClick={() => toggleSelectQuestion(q.id)}
                      >
                        <Checkbox
                          checked={selectedQuestionIds.includes(q.id)}
                          onCheckedChange={() => toggleSelectQuestion(q.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="font-medium">{q.questionJp}</div>
                          <div className="text-xs text-gray-600">
                            #{q.id} • N{q.levelN} • {q.questionType}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {qbPagination && (
                <div className="flex justify-end">
                  <PaginationControls
                    currentPage={qbPagination.current || 1}
                    totalPages={qbPagination.totalPage || 0}
                    totalItems={qbPagination.totalItem || 0}
                    itemsPerPage={qbPagination.pageSize || qbPageSize}
                    onPageChange={(p: number) => setQbPage(p)}
                    onItemsPerPageChange={(s: number) => {
                      setQbPageSize(s);
                      setQbPage(1);
                    }}
                    isLoading={qbLoading}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsAddQuestionsOpen(false)}
                >
                  {t("common.close")}
                </Button>
                <Button
                  onClick={handleLinkSelected}
                  disabled={selectedQuestionIds.length === 0 || linkQuestionBanksMutation.isPending}
                >
                  {linkQuestionBanksMutation.isPending
                    ? t("testSetManagement.linking")
                    : t("testSetManagement.addToTestSet")}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={testSetIdToDelete !== null}
          onOpenChange={(open) => !open && setTestSetIdToDelete(null)}
        >
          <AlertDialogContent className="bg-white border-border">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-foreground">
                {t("testSetManagement.deleteDialog.title")}
              </AlertDialogTitle>
              <AlertDialogDescription className="text-muted-foreground">
                {t("testSetManagement.deleteDialog.message")}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-border text-foreground hover:bg-muted cursor-pointer">
                {t("common.cancel")}
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDeleteConfirm}
                disabled={deleteTestSetMutation.isPending}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              >
                {deleteTestSetMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {t("testSetManagement.deleteDialog.deleting")}
                  </>
                ) : (
                  t("testSetManagement.deleteDialog.deleteButton")
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
};

export default TestSetManagement;
