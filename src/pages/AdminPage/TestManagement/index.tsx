import React, { useEffect, useState } from "react";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@ui/Select";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card";
import { Badge } from "@ui/Badge";
import { Skeleton } from "@ui/Skeleton";
import { Search, DollarSign, X } from "lucide-react";
import HeaderAdmin from "@organisms/Header/Admin";
import PaginationControls from "@ui/PaginationControls";
import { Checkbox } from "@ui/Checkbox";
import { Switch } from "@ui/Switch";
import { useQuestionBankList } from "@hooks/useQuestionBank";
import { IQueryQuestionRequest } from "@models/questionBank/request";
import { QuestionEntityType } from "@models/questionBank/entity";
import { QuestionType } from "@constants/questionBank";
import { toast } from "react-toastify";
import { useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { TestCreateRequest } from "@models/test/request";
import {
  useCreateTest,
  useUpdateTest,
  useLinkQuestionBanks,
  useGetLinkedQuestionBanks,
  useDeleteLinkedQuestionBanks,
  useTest,
} from "@hooks/useTest";

const TestManagement: React.FC = () => {
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

  type TranslationEntry = { language: string; value: string };
  const isTranslationArray = (field: unknown): field is TranslationEntry[] =>
    Array.isArray(field);

  const extractText = (field: unknown, lang: string = "vi"): string => {
    if (isTranslationArray(field)) {
      const byLang = field.find((f) => f?.language === lang)?.value?.trim();
      if (byLang) return byLang;
      const vi = field.find((f) => f?.language === "vi")?.value?.trim();
      if (vi) return vi;
      const en = field.find((f) => f?.language === "en")?.value?.trim();
      if (en) return en;
      const first = field.find((f) => f?.value)?.value?.trim();
      return first || "";
    }
    if (typeof field === "string") return field;
    return "";
  };

  const getTranslation = (field: unknown, language: string): string => {
    if (isTranslationArray(field)) {
      return field.find((f) => f?.language === language)?.value || "";
    }
    return typeof field === "string" ? field : "";
  };
  const {
    tests,
    isLoading,
    filters,
    pagination,
    handleSearch,
    handleFilterByLevel,
    handleFilterByTestType,
    handleFilterByStatus,
    handlePageChange,
    handlePageSizeChange,
  } = useTest();
  const [saving, setSaving] = useState(false);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddQuestionsOpen, setIsAddQuestionsOpen] = useState(false);
  // Linked questions of current test set
  const [selectedLinkedIds, setSelectedLinkedIds] = useState<number[]>([]);
  
  // Test service hooks
  const createTestMutation = useCreateTest();
  const updateTestMutation = useUpdateTest();
  const linkQuestionBanksMutation = useLinkQuestionBanks();
  const deleteLinkedQuestionBanksMutation = useDeleteLinkedQuestionBanks();
  const {
    data: linkedQuestionsData,
    isLoading: loadingLinked,
  } = useGetLinkedQuestionBanks(selectedId, { enabled: isDialogOpen && selectedId !== null });
  
  const linkedQuestions = (linkedQuestionsData || []).map((q) => ({
    ...q,
    questionType: (q.questionType as QuestionType) || "VOCABULARY" as QuestionType,
  }));
  const [form, setForm] = useState({
    nameVi: "Đề thi từ vựng N3 - Phần 1",
    nameEn: "N3 Vocabulary Test - Part 1",
    descriptionVi:
      "Bộ đề thi từ vựng N3 bao gồm 50 câu hỏi về từ vựng cơ bản trong tiếng Nhật",
    descriptionEn:
      "N3 vocabulary test with 50 basic vocabulary questions in Japanese",
    content:
      "２月１４日は、日本ではバレンタインデーです。キリスト教の特別な日ですが、日本では、女の人が好きな人にチョコレートなどのプレゼントをする日になりました。世界にも同じような日があります。ブラジルでは、６月１２日が「恋人の日」と呼ばれる日です。その日は、男の人も女の人もプレゼントを用意して、恋人におくります。 ブラジルでは、日本のようにチョコレートではなく、写真立てに写真を入れて、プレゼントするそうです。",
    price: 0,
    levelN: 5 as number,
    testType: "PLACEMENT_TEST_DONE" as TestCreateRequest["testType"],
    status: "ACTIVE" as TestCreateRequest["status"],
  });

  const openCreate = () => {
    setSelectedId(null);
    setForm({
      nameVi: "",
      nameEn: "",
      descriptionVi: "",
      descriptionEn: "",
      content: "",
      price: 0,
      levelN: 5,
      testType: "PLACEMENT_TEST_DONE",
      status: "ACTIVE",
    });
    setIsDialogOpen(true);
  };

  const openEdit = (id: number) => {
    const item = tests.find((t) => t.id === id);
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
      price: item.price || 0,
      levelN: item.levelN as number,
      testType: item.testType as TestCreateRequest["testType"],
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
        toast.success("Đã xóa câu hỏi khỏi test");
      },
      onError: (e) => {
        console.error("Lỗi xóa câu hỏi khỏi test:", e);
        toast.error(getErrorMessage(e, "Không thể xóa câu hỏi khỏi test"));
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
      toast.error("Hãy chọn ít nhất một câu hỏi để xóa");
      return;
    }
    deleteLinkedQuestionBanksMutation.mutate(selectedLinkedIds, {
      onSuccess: () => {
        toast.success(`Đã xóa ${selectedLinkedIds.length} câu hỏi khỏi test`);
        setSelectedLinkedIds([]);
      },
      onError: (e) => {
        console.error("Lỗi xóa câu hỏi khỏi test:", e);
        toast.error(getErrorMessage(e, "Không thể xóa câu hỏi khỏi test"));
      },
    });
  };

  const handleSave = async () => {
    setSaving(true);
    const body = {
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
      price: form.price,
      levelN: form.levelN,
      testType: form.testType,
      status: form.status,
    } as TestCreateRequest;

    try {
      if (selectedId) {
        // Update test
        updateTestMutation.mutate(
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
                      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
                      toast.success("Cập nhật thành công");
                      setIsDialogOpen(false);
                      setSelectedId(null);
                      setSaving(false);
                    },
                    onError: () => {
                      // Still close dialog even if linking fails
                      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
                      toast.success("Cập nhật thành công");
                      setIsDialogOpen(false);
                      setSelectedId(null);
                      setSaving(false);
                    },
                  }
                );
              } else {
                queryClient.invalidateQueries({ queryKey: ["testset-list"] });
                toast.success("Cập nhật thành công");
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
        // Create test
        createTestMutation.mutate(body, {
          onSuccess: (response) => {
            const newId = response?.data?.id;
            if (!newId) {
              toast.error("Không nhận được ID từ server sau khi tạo");
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
                    queryClient.invalidateQueries({ queryKey: ["testset-list"] });
                    toast.success("Tạo bộ đề thành công");
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
                    queryClient.invalidateQueries({ queryKey: ["testset-list"] });
                    toast.success("Tạo bộ đề thành công");
                    setSelectedId(newId);
                    setIsDialogOpen(true);
                    setQbForceKey((k) => k + 1);
                    setIsAddQuestionsOpen(true);
                    setSaving(false);
                  },
                }
              );
            } else {
              queryClient.invalidateQueries({ queryKey: ["testset-list"] });
              toast.success("Tạo bộ đề thành công");
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
      console.error("Lỗi không xác định:", e);
      toast.error(getErrorMessage(e, "Đã xảy ra lỗi không mong muốn"));
      setSaving(false);
    }
  };

  const queryClient = useQueryClient();

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
    questionType: form.testType as unknown as QuestionType,
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
      toast.error("Hãy chọn ít nhất một câu hỏi");
      return;
    }
    linkQuestionBanksMutation.mutate(
      {
        testSetId: selectedId,
        questionBankIds: selectedQuestionIds,
      },
      {
        onSuccess: () => {
          toast.success("Đã thêm câu hỏi vào Test");
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

  return (
    <>
      <HeaderAdmin
        title="Quản lý Test"
        description="Quản lý các bài kiểm tra"
      />

      <div className="p-8 mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Quản lý Test</h2>
          <Button onClick={openCreate}>Thêm mới</Button>
        </div>

        <Card className="bg-white border mt-4">
          <CardHeader>
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-3 items-center">
              <div className="relative w-full md:flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Tìm kiếm test ..."
                  defaultValue={filters.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select
                value={filters.levelN ? String(filters.levelN) : "ALL"}
                onValueChange={(v) =>
                  handleFilterByLevel(v === "ALL" ? undefined : Number(v))
                }
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Cấp độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả cấp</SelectItem>
                  <SelectItem value="0">N0 (Tất cả cấp)</SelectItem>
                  <SelectItem value="1">N1</SelectItem>
                  <SelectItem value="2">N2</SelectItem>
                  <SelectItem value="3">N3</SelectItem>
                  <SelectItem value="4">N4</SelectItem>
                  <SelectItem value="5">N5</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.testType || "ALL"}
                onValueChange={(v) =>
                  handleFilterByTestType(
                    v === "ALL"
                      ? undefined
                      : (v as TestCreateRequest["testType"])
                  )
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Loại đề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả loại</SelectItem>
                  <SelectItem value="PLACEMENT_TEST_DONE">PLACEMENT_TEST_DONE</SelectItem>
                  <SelectItem value="MATCH_TEST">MATCH_TEST</SelectItem>
                  <SelectItem value="QUIZ_TEST">QUIZ_TEST</SelectItem>
                  <SelectItem value="REVIEW_TEST">REVIEW_TEST</SelectItem>
                  <SelectItem value="PRACTICE_TEST">PRACTICE_TEST</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status || "ALL"}
                onValueChange={(v) =>
                  handleFilterByStatus(
                    v === "ALL"
                      ? undefined
                      : (v as TestCreateRequest["status"])
                  )
                }
              >
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả</SelectItem>
                  <SelectItem value="DRAFT">DRAFT</SelectItem>
                  <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                  <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="mt-4">
          {isLoading ? (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="bg-white">
                  <CardHeader>
                    <Skeleton className="h-5 w-2/3" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-2/3" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : tests.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              Không có test
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {tests.map((t) => (
                  <Card
                    key={t.id}
                    className="hover:border-primary/40 transition-colors cursor-pointer"
                    onClick={() => openEdit(t.id)}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg">
                            {extractText(
                              (t as unknown as Record<string, unknown>).name,
                              "vi"
                            )}
                          </CardTitle>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {extractText(
                              (t as unknown as Record<string, unknown>)
                                .description,
                              "vi"
                            )}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <Badge variant="outline">N{t.levelN}</Badge>
                          <Badge
                            className={
                              t.status === "ACTIVE"
                                ? "bg-green-100 text-green-800"
                                : t.status === "DRAFT"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-800"
                            }
                          >
                            {t.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-sm text-gray-700 mb-3 line-clamp-3">
                        {extractText(
                          (t as unknown as Record<string, unknown>).description,
                          "vi"
                        )}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {t.price
                            ? `${t.price.toLocaleString()} ₫`
                            : "Miễn phí"}
                        </div>
                        <div>{t.testType.toUpperCase()}</div>
                        <div>#{t.id}</div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
              <div className="flex justify-end mt-6">
                {pagination && (
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
                )}
              </div>
            </>
          )}
        </div>

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
                {selectedId ? "Chỉnh sửa Test" : "Tạo Test"}
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium">Name (vi)</label>
                  <Input
                    value={form.nameVi}
                    onChange={(e) =>
                      setForm({ ...form, nameVi: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Name (en)</label>
                  <Input
                    value={form.nameEn}
                    onChange={(e) =>
                      setForm({ ...form, nameEn: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">
                    Description (vi)
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
                    Description (en)
                  </label>
                  <Input
                    value={form.descriptionEn}
                    onChange={(e) =>
                      setForm({ ...form, descriptionEn: e.target.value })
                    }
                  />
                </div>
              </div>
            
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div className="flex items-end gap-2">
                  <label className="text-sm font-medium">Có phí</label>
                  <Switch
                    checked={form.price === 1}
                    onCheckedChange={(checked) =>
                      setForm({ ...form, price: checked ? 1 : 0 })
                    }
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">LevelN</label>
                  <Select
                    value={String(form.levelN)}
                    onValueChange={(v) =>
                      setForm({ ...form, levelN: Number(v) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn cấp độ" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">N0 (Tất cả cấp)</SelectItem>
                      <SelectItem value="1">N1</SelectItem>
                      <SelectItem value="2">N2</SelectItem>
                      <SelectItem value="3">N3</SelectItem>
                      <SelectItem value="4">N4</SelectItem>
                      <SelectItem value="5">N5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Test Type</label>
                  <Select
                    value={form.testType}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        testType: v as TestCreateRequest["testType"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLACEMENT_TEST_DONE">Placement test</SelectItem>
                      <SelectItem value="MATCH_TEST">Match test</SelectItem>
                      <SelectItem value="QUIZ_TEST">Quiz test</SelectItem>
                      <SelectItem value="REVIEW_TEST">Review test</SelectItem>
                      <SelectItem value="PRACTICE_TEST">Practice test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={form.status}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        status: v as TestCreateRequest["status"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
                      <SelectItem value="DRAFT">DRAFT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {selectedId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Câu hỏi đã thêm
                    </label>
                    {selectedLinkedIds.length > 0 && (
                      <Button
                        type="button"
                        variant="destructive"
                        className=" text-white hover:bg-red-400 bg-red-400 border-2 border-red-400"
                        size="sm"
                        onClick={handleRemoveSelectedLinked}
                      >
                        Xóa đã chọn ({selectedLinkedIds.length})
                      </Button>
                    )}
                  </div>
                  <div className="border rounded">
                    {loadingLinked ? (
                      <div className="p-4 text-sm text-gray-500">
                        Đang tải...
                      </div>
                    ) : linkedQuestions.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">
                        Chưa có câu hỏi
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
                                {q.questionJp} - {q.questionType}
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
                  Thêm câu hỏi
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setIsDialogOpen(false);
                    setSelectedId(null);
                  }}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={saving || createTestMutation.isPending || updateTestMutation.isPending}
                >
                  {saving || createTestMutation.isPending || updateTestMutation.isPending
                    ? "Đang lưu..."
                    : "Lưu"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add Questions Dialog */}
        <Dialog open={isAddQuestionsOpen} onOpenChange={setIsAddQuestionsOpen}>
          <DialogContent className="max-w-3xl bg-white">
            <DialogHeader>
              <DialogTitle>Thêm câu hỏi vào TestSet #{selectedId}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Tìm kiếm câu hỏi..."
                  value={qbSearch}
                  onChange={(e) => {
                    setQbSearch(e.target.value);
                    setQbPage(1);
                  }}
                />
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm text-muted-foreground">
                    noTestSet
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
                  <label className="text-sm font-medium">Test Type</label>
                  <Select
                    value={form.testType}
                    onValueChange={(v) =>
                      setForm({
                        ...form,
                        testType: v as TestCreateRequest["testType"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PLACEMENT_TEST_DONE">Placement test</SelectItem>
                      <SelectItem value="MATCH_TEST">Match test</SelectItem>
                      <SelectItem value="QUIZ_TEST">Quiz test</SelectItem>
                      <SelectItem value="REVIEW_TEST">Review test</SelectItem>
                      <SelectItem value="PRACTICE_TEST">Practice test</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border rounded">
                {qbLoading ? (
                  <div className="p-4 text-sm text-gray-500">Đang tải...</div>
                ) : qbItems.length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    Không có câu hỏi phù hợp
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
                  Đóng
                </Button>
                <Button
                  onClick={handleLinkSelected}
                  disabled={selectedQuestionIds.length === 0 || linkQuestionBanksMutation.isPending}
                >
                  {linkQuestionBanksMutation.isPending ? "Đang thêm..." : "Thêm vào Test"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default TestManagement;
