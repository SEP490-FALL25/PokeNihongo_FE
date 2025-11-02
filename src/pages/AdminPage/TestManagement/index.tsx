import React, { useState, useEffect } from "react";
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
import { toast } from "react-toastify";
import { TestCreateRequest } from "@models/test/request";
import {
  useCreateTest,
  useUpdateTest,
  useTest,
  useGetLinkedTestSets,
  useLinkTestSets,
  useDeleteLinkedTestSets,
  useAutoAddFreeTestSets,
} from "@hooks/useTest";
import { useTestSetList } from "@hooks/useTestSet";
import { TestSetListRequest } from "@models/testSet/request";
import { TestSetEntity } from "@models/testSet/entity";
import { extractText, getTranslation } from "./utils/helpers";

const TestManagement: React.FC = () => {
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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isAddTestSetsOpen, setIsAddTestSetsOpen] = useState(false);
  const [selectedLinkedIds, setSelectedLinkedIds] = useState<number[]>([]);
  const [selectedTestSetIds, setSelectedTestSetIds] = useState<number[]>([]);
  
  // Test service hooks
  const createTestMutation = useCreateTest();
  const updateTestMutation = useUpdateTest();
  const linkTestSetsMutation = useLinkTestSets();
  const deleteLinkedTestSetsMutation = useDeleteLinkedTestSets();
  const autoAddFreeTestSetsMutation = useAutoAddFreeTestSets();
  const {
    data: linkedTestSets,
    isLoading: loadingLinked,
  } = useGetLinkedTestSets(selectedId, { enabled: isDialogOpen && selectedId !== null });
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
    limit: undefined as number | undefined,
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
      limit: undefined,
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
      limit: (item as { limit?: number | null }).limit ?? undefined,
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

  const handleRemoveLinked = (id: number) => {
    if (!id || !selectedId) return;
    deleteLinkedTestSetsMutation.mutate(
      { testId: selectedId, testSetIds: [id] },
      {
        onSuccess: () => {
          setSelectedLinkedIds((prev) => prev.filter((qId) => qId !== id));
        },
      }
    );
  };

  const toggleSelectLinked = (id: number) => {
    setSelectedLinkedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleRemoveSelectedLinked = () => {
    if (selectedLinkedIds.length === 0 || !selectedId) {
      toast.error("Hãy chọn ít nhất một bộ đề để xóa");
      return;
    }
    deleteLinkedTestSetsMutation.mutate(
      { testId: selectedId, testSetIds: selectedLinkedIds },
      {
        onSuccess: () => {
          setSelectedLinkedIds([]);
        },
      }
    );
  };


  const handleSave = () => {
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
      limit: form.limit,
      levelN: form.levelN,
      testType: form.testType,
      status: form.status,
    } as TestCreateRequest;

    if (selectedId) {
      updateTestMutation.mutate(
        { id: selectedId, data: body },
        {
          onSuccess: () => {
            setIsDialogOpen(false);
            setSelectedId(null);
          },
        }
      );
    } else {
      createTestMutation.mutate(body, {
        onSuccess: () => {
          setIsDialogOpen(false);
          setSelectedId(null);
        },
      });
    }
  };

  // Add testSets dialog state
  const [tsSearch, setTsSearch] = useState("");
  const [tsPage, setTsPage] = useState(1);
  const [tsPageSize, setTsPageSize] = useState(15);
  const [tsForceKey, setTsForceKey] = useState(0);

  const testSetFilters: TestSetListRequest = {
    currentPage: tsPage,
    pageSize: tsPageSize,
    search: tsSearch || undefined,
    levelN: form.levelN === 0 ? undefined : form.levelN,
    testType: undefined, // Allow all test types for now
  };

  const {
    data: tsItems,
    pagination: tsPagination,
    isLoading: tsLoading,
  } = useTestSetList(testSetFilters, { forceKey: tsForceKey });

  const toggleSelectTestSet = (id: number) => {
    setSelectedTestSetIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleOpenAddTestSets = () => {
    if (!selectedId) return;
    setSelectedTestSetIds([]);
    setTsSearch("");
    setTsPage(1);
    setTsForceKey((k) => k + 1);
    setIsAddTestSetsOpen(true);
  };

  const handleLinkSelected = () => {
    if (!selectedId || selectedTestSetIds.length === 0) {
      toast.error("Hãy chọn ít nhất một bộ đề");
      return;
    }
    linkTestSetsMutation.mutate(
      {
        testId: selectedId,
        data: { testSetIds: selectedTestSetIds },
      },
      {
        onSuccess: () => {
          setSelectedTestSetIds([]);
          setTsForceKey((k) => k + 1);
          setIsAddTestSetsOpen(false);
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
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => autoAddFreeTestSetsMutation.mutate()}
              disabled={autoAddFreeTestSetsMutation.isPending}
            >
              {autoAddFreeTestSetsMutation.isPending
                ? "Đang thêm..."
                : "Tự động thêm TestSet miễn phí"}
            </Button>
            <Button onClick={openCreate}>Thêm mới</Button>
          </div>
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
              <div>
                <label className="text-sm font-medium">
                  Giới hạn số lần làm (Limit)
                </label>
                <Input
                  type="number"
                  placeholder="Để trống nếu không giới hạn"
                  value={form.limit ?? ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    setForm({
                      ...form,
                      limit: value === "" ? undefined : Number(value),
                    });
                  }}
                  min="0"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Số lần tối đa người dùng có thể làm test này. Để trống nếu không giới hạn.
                </p>
              </div>
              {selectedId && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Bộ đề đã thêm
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
                    ) : linkedTestSets.length === 0 ? (
                      <div className="p-4 text-sm text-gray-500">
                        Chưa có bộ đề
                      </div>
                    ) : (
                      <div className="max-h-[30vh] overflow-auto">
                        {linkedTestSets.map((ts) => (
                          <div
                            key={ts.id}
                            role="button"
                            onClick={() => toggleSelectLinked(ts.id)}
                            className="flex items-start gap-3 p-3 border-b hover:bg-gray-50"
                          >
                            <Checkbox
                              checked={selectedLinkedIds.includes(ts.id)}
                              onCheckedChange={() => toggleSelectLinked(ts.id)}
                            />
                            <div className="flex-1">
                              <div className="font-medium">
                                {extractText(
                                  (ts as unknown as Record<string, unknown>).name,
                                  "vi"
                                )} - {ts.testType} - N{ts.levelN}
                              </div>
                            </div>
                            <button
                              type="button"
                              aria-label="Remove"
                              className="text-gray-500 hover:text-red-600 shrink-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveLinked(ts.id);
                              }}
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
                  onClick={handleOpenAddTestSets}
                  disabled={!selectedId}
                >
                  Thêm bộ đề
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
                  disabled={createTestMutation.isPending || updateTestMutation.isPending}
                >
                  {createTestMutation.isPending || updateTestMutation.isPending
                    ? "Đang lưu..."
                    : "Lưu"}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Add TestSets Dialog */}
        <Dialog open={isAddTestSetsOpen} onOpenChange={setIsAddTestSetsOpen}>
          <DialogContent className="max-w-3xl bg-white">
            <DialogHeader>
              <DialogTitle>Thêm bộ đề vào Test #{selectedId}</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Tìm kiếm bộ đề..."
                  value={tsSearch}
                  onChange={(e) => {
                    setTsSearch(e.target.value);
                    setTsPage(1);
                  }}
                />
              </div>

              <div className="border rounded">
                {tsLoading ? (
                  <div className="p-4 text-sm text-gray-500">Đang tải...</div>
                ) : (tsItems || []).length === 0 ? (
                  <div className="p-4 text-sm text-gray-500">
                    Không có bộ đề phù hợp
                  </div>
                ) : (
                  <div className="max-h-[50vh] overflow-auto">
                    {(tsItems as unknown as TestSetEntity[]).map((ts) => (
                      <div
                        key={ts.id}
                        className="flex items-start gap-3 p-3 border-b cursor-pointer hover:bg-gray-50"
                        role="button"
                        onClick={() => toggleSelectTestSet(ts.id)}
                      >
                        <Checkbox
                          checked={selectedTestSetIds.includes(ts.id)}
                          onCheckedChange={() => toggleSelectTestSet(ts.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1">
                          <div className="font-medium">
                            {extractText(
                              (ts as unknown as Record<string, unknown>).name,
                              "vi"
                            )}
                          </div>
                          <div className="text-xs text-gray-600">
                            #{ts.id} • N{ts.levelN} • {ts.testType}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {tsPagination && (
                <div className="flex justify-end">
                  <PaginationControls
                    currentPage={tsPagination.current || 1}
                    totalPages={tsPagination.totalPage || 0}
                    totalItems={tsPagination.totalItem || 0}
                    itemsPerPage={tsPagination.pageSize || tsPageSize}
                    onPageChange={(p: number) => setTsPage(p)}
                    onItemsPerPageChange={(s: number) => {
                      setTsPageSize(s);
                      setTsPage(1);
                    }}
                    isLoading={tsLoading}
                  />
                </div>
              )}

              <div className="flex justify-end gap-2">
                <Button
                  variant="ghost"
                  onClick={() => setIsAddTestSetsOpen(false)}
                >
                  Đóng
                </Button>
                <Button
                  onClick={handleLinkSelected}
                  disabled={selectedTestSetIds.length === 0 || linkTestSetsMutation.isPending}
                >
                  {linkTestSetsMutation.isPending ? "Đang thêm..." : "Thêm vào Test"}
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
