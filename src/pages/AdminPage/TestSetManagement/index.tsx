import React, { useEffect, useState } from "react";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Textarea } from "@ui/Textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog";
import testSetService from "@services/testSet";
import { useTestSet } from "@hooks/useTestSet";
import { TestSetCreateRequest } from "@models/testSet/request";
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

const TestSetManagement: React.FC = () => {
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
  // Linked questions of current test set
  const [linkedQuestions, setLinkedQuestions] = useState<
    Array<{ id: number; questionJp: string; questionType: QuestionType; levelN: number }>
  >([]);
  const [loadingLinked, setLoadingLinked] = useState(false);
  const [selectedLinkedIds, setSelectedLinkedIds] = useState<number[]>([]);
  const [form, setForm] = useState({
    nameVi: "Đề thi từ vựng N3 - Phần 1",
    nameEn: "N3 Vocabulary Test - Part 1",
    descriptionVi:
      "Bộ đề thi từ vựng N3 bao gồm 50 câu hỏi về từ vựng cơ bản trong tiếng Nhật",
    descriptionEn:
      "N3 vocabulary test with 50 basic vocabulary questions in Japanese",
    content:
      "２月１４日は、日本ではバレンタインデーです。キリスト教の特別な日ですが、日本では、女の人が好きな人にチョコレートなどのプレゼントをする日になりました。世界にも同じような日があります。ブラジルでは、６月１２日が「恋人の日」と呼ばれる日です。その日は、男の人も女の人もプレゼントを用意して、恋人におくります。 ブラジルでは、日本のようにチョコレートではなく、写真立てに写真を入れて、プレゼントするそうです。",
    audioUrl:
      "https://storage.googleapis.com/pokenihongo-audio/testset-n3-vocab-instruction.mp3",
    price: 0,
    levelN: 3,
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

  // Load questions already linked to the test set when opening dialog in edit mode
  useEffect(() => {
    const loadLinked = async () => {
      if (!isDialogOpen || !selectedId) {
        setLinkedQuestions([]);
        setSelectedLinkedIds([]);
        return;
      }
      try {
        setLoadingLinked(true);
        const list = await testSetService.getLinkedQuestionBanksByTestSet(
          selectedId
        );
        setLinkedQuestions(
          Array.isArray(list)
            ? list.map((q) => ({
                ...q,
                levelN: (q as { levelN?: number }).levelN ?? 0,
              }))
            : []
        );
        setSelectedLinkedIds([]);
      } catch (err) {
        console.error("Lỗi tải danh sách câu hỏi đã liên kết:", err);
        toast.error(
          getErrorMessage(err, "Không thể tải danh sách câu hỏi đã liên kết")
        );
        setLinkedQuestions([]);
        setSelectedLinkedIds([]);
      } finally {
        setLoadingLinked(false);
      }
    };
    loadLinked();
  }, [isDialogOpen, selectedId]);

  const handleRemoveLinked = async (id: number) => {
    if (!id) return;
    try {
      await testSetService.deleteLinkedQuestionBanksMany([id]);
      setLinkedQuestions((prev) => prev.filter((q) => q.id !== id));
      setSelectedLinkedIds((prev) => prev.filter((qId) => qId !== id));
      toast.success("Đã xóa câu hỏi khỏi test set");
    } catch (e) {
      console.error("Lỗi xóa câu hỏi khỏi test set:", e);
      toast.error(getErrorMessage(e, "Không thể xóa câu hỏi khỏi test set"));
    }
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
    try {
      await testSetService.deleteLinkedQuestionBanksMany(selectedLinkedIds);
      setLinkedQuestions((prev) =>
        prev.filter((q) => !selectedLinkedIds.includes(q.id))
      );
      toast.success(`Đã xóa ${selectedLinkedIds.length} câu hỏi khỏi test set`);
      setSelectedLinkedIds([]);
    } catch (e) {
      console.error("Lỗi xóa câu hỏi khỏi test set:", e);
      toast.error(getErrorMessage(e, "Không thể xóa câu hỏi khỏi test set"));
    }
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
        try {
          await testSetService.updateTestSet(selectedId, body);
        } catch (e) {
          console.error("Lỗi cập nhật test set:", e);
          toast.error(getErrorMessage(e, "Cập nhật test set thất bại"));
          return;
        }

        // Link selected questions if any on update flow
        if (selectedQuestionIds.length > 0) {
          try {
            await testSetService.linkQuestionBanksMultiple({
              testSetId: selectedId,
              questionBankIds: selectedQuestionIds,
            });
            setSelectedQuestionIds([]);
          } catch (e) {
            console.error("Lỗi liên kết câu hỏi:", e);
            toast.error(getErrorMessage(e, "Liên kết câu hỏi thất bại"));
            // Continue to refresh list even if linking fails
          }
        }

        // refresh list
        queryClient.invalidateQueries({ queryKey: ["testset-list"] });
        toast.success("Cập nhật thành công");
        setIsDialogOpen(false);
        setSelectedId(null);
      } else {
        // Create test set
        let created;
        try {
          created = await testSetService.createTestSetWithMeanings(body);
        } catch (e) {
          console.error("Lỗi tạo test set:", e);
          toast.error(getErrorMessage(e, "Tạo test set thất bại"));
          return;
        }

        const newId = created?.data?.id;
        if (!newId) {
          toast.error("Không nhận được ID từ server sau khi tạo");
          return;
        }

        // If admin has pre-selected questions, link them now using new id
        if (selectedQuestionIds.length > 0) {
          try {
            await testSetService.linkQuestionBanksMultiple({
              testSetId: newId,
              questionBankIds: selectedQuestionIds,
            });
            setSelectedQuestionIds([]);
          } catch (e) {
            console.error("Lỗi liên kết câu hỏi:", e);
            toast.error(
              getErrorMessage(
                e,
                "Tạo test set thành công nhưng liên kết câu hỏi thất bại"
              )
            );
            // Continue even if linking fails
          }
        }

        // refresh list to include newly created item
        queryClient.invalidateQueries({ queryKey: ["testset-list"] });
        toast.success("Tạo bộ đề thành công");

        // keep dialog open and switch to edit mode for further actions
        setSelectedId(newId);
        setIsDialogOpen(true);
        // open add-questions dialog so admin can tiếp tục thêm
        setQbForceKey((k) => k + 1);
        setIsAddQuestionsOpen(true);
      }
    } catch (e) {
      console.error("Lỗi không xác định:", e);
      toast.error(getErrorMessage(e, "Đã xảy ra lỗi không mong muốn"));
    } finally {
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

  const handleLinkSelected = async () => {
    if (!selectedId || selectedQuestionIds.length === 0) {
      toast.error("Hãy chọn ít nhất một câu hỏi");
      return;
    }
    try {
      await testSetService.linkQuestionBanksMultiple({
        testSetId: selectedId,
        questionBankIds: selectedQuestionIds,
      });
      toast.success("Đã thêm câu hỏi vào TestSet");
      // refresh caches and next-open fetches
      queryClient.invalidateQueries({ queryKey: ["question-bank-list"] });
      queryClient.invalidateQueries({ queryKey: ["testset-list"] });
      // Reload linked questions
      try {
        const list = await testSetService.getLinkedQuestionBanksByTestSet(
          selectedId
        );
        setLinkedQuestions(
          Array.isArray(list)
            ? list.map((q) => ({
                ...q,
                levelN: (q as { levelN?: number }).levelN ?? 0,
              }))
            : []
        );
        setSelectedLinkedIds([]);
      } catch (err) {
        console.error("Lỗi tải lại danh sách câu hỏi:", err);
      }
      setQbForceKey((k) => k + 1);
      setIsAddQuestionsOpen(false);
    } catch (e) {
      console.error("Lỗi liên kết câu hỏi:", e);
      toast.error(getErrorMessage(e, "Không thể liên kết câu hỏi"));
    }
  };

  return (
    <>
      <HeaderAdmin
        title="Quản lý Test Set"
        description="Quản lý các bộ đề thi"
      />

      <div className="p-8 mt-24">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Quản lý Test Set</h2>
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
                  placeholder="Tìm kiếm test set..."
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
                  <SelectItem value="0">Tất cả cấp</SelectItem>
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
                      : (v as TestSetCreateRequest["testType"])
                  )
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Loại đề" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả loại</SelectItem>
                  <SelectItem value="VOCABULARY">VOCABULARY</SelectItem>
                  <SelectItem value="GRAMMAR">GRAMMAR</SelectItem>
                  <SelectItem value="KANJI">KANJI</SelectItem>
                  <SelectItem value="LISTENING">LISTENING</SelectItem>
                  <SelectItem value="READING">READING</SelectItem>
                  <SelectItem value="SPEAKING">SPEAKING</SelectItem>
                  <SelectItem value="GENERAL">GENERAL</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.status || "ALL"}
                onValueChange={(v) =>
                  handleFilterByStatus(
                    v === "ALL"
                      ? undefined
                      : (v as TestSetCreateRequest["status"])
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
          ) : testSets.length === 0 ? (
            <div className="text-center text-gray-500 py-16">
              Không có test set
            </div>
          ) : (
            <>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {testSets.map((t) => (
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
                        {t.content}
                      </div>
                      <div className="flex items-center justify-between text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          {t.price
                            ? `${t.price.toLocaleString()} ₫`
                            : "Miễn phí"}
                        </div>
                        <div>{t.testType}</div>
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
                {selectedId ? "Chỉnh sửa Test Set" : "Tạo Test Set"}
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
                      <SelectItem value="0">Tất cả cấp</SelectItem>
                      <SelectItem value="1">N1</SelectItem>
                      <SelectItem value="2">N2</SelectItem>
                      <SelectItem value="3">N3</SelectItem>
                      <SelectItem value="4">N4</SelectItem>
                      <SelectItem value="5">N5</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Loại đề</label>
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
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VOCABULARY">Từ vựng</SelectItem>
                      <SelectItem value="GRAMMAR">Ngữ pháp</SelectItem>
                      <SelectItem value="KANJI">Hán tự</SelectItem>
                      <SelectItem value="LISTENING">Nghe</SelectItem>
                      <SelectItem value="READING">Đọc</SelectItem>
                      <SelectItem value="SPEAKING">Nói</SelectItem>
                      <SelectItem value="GENERAL">Tổng hợp</SelectItem>
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
                        status: v as TestSetCreateRequest["status"],
                      })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">DRAFT</SelectItem>
                      <SelectItem value="ACTIVE">ACTIVE</SelectItem>
                      <SelectItem value="INACTIVE">INACTIVE</SelectItem>
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
                <Button onClick={handleSave} disabled={saving}>
                  {saving ? "Đang lưu..." : "Lưu"}
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
             Lấy những câu hỏi không có trong test set
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
                  <label className="text-sm font-medium">Loại câu hỏi</label>
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
                      <SelectValue placeholder="Chọn loại" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="VOCABULARY">Từ vựng</SelectItem>
                      <SelectItem value="GRAMMAR">Ngữ pháp</SelectItem>
                      <SelectItem value="KANJI">Hán tự</SelectItem>
                      <SelectItem value="LISTENING">Nghe</SelectItem>
                      <SelectItem value="READING">Đọc</SelectItem>
                      <SelectItem value="SPEAKING">Nói</SelectItem>
                      <SelectItem value="GENERAL">Tổng hợp</SelectItem>
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
                  disabled={selectedQuestionIds.length === 0}
                >
                  Thêm vào TestSet
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default TestSetManagement;
