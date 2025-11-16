import React, { useState, useEffect } from "react";
import { Button } from "@ui/Button";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@ui/Card";
import { Skeleton } from "@ui/Skeleton";
import { Badge } from "@ui/Badge";
import { FileText, Plus, Loader2, Sparkles, CheckCircle2, Clock, Target } from "lucide-react";
import HeaderAdmin from "@organisms/Header/Admin";
import PaginationControls from "@ui/PaginationControls";
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
import { extractText, getTranslation } from "./utils/helpers";
import FilterSection from "./components/FilterSection";
import TestCard from "./components/TestCard";
import TestDialog from "./components/TestDialog";
import AddTestSetsDialog from "./components/AddTestSetsDialog";

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
    nameVi: "",
    nameEn: "",
    descriptionVi: "",
    descriptionEn: "",
    price: 0,
    limit: undefined as number | undefined,
    levelN: 5 as number,
    testType: "READING_TEST" as TestCreateRequest["testType"],
    status: "ACTIVE" as TestCreateRequest["status"],
  });

  const openCreate = () => {
    setSelectedId(null);
    setForm({
      nameVi: "",
      nameEn: "",
      descriptionVi: "",
      descriptionEn: "",
      price: 0,
      limit: undefined,
      levelN: 5,
      testType: "READING_TEST",
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

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setSelectedId(null);
    setSelectedLinkedIds([]);
  };

  // Add testSets dialog state
  const [tsSearch, setTsSearch] = useState("");
  const [tsPage, setTsPage] = useState(1);
  const [tsPageSize, setTsPageSize] = useState(15);
  const [tsForceKey, setTsForceKey] = useState(0);
  const [tsLevelN, setTsLevelN] = useState<number | undefined>(undefined);
  const [tsTestType, setTsTestType] = useState<TestSetListRequest["testType"]>(undefined);
  const [tsNoPrice, setTsNoPrice] = useState<boolean | undefined>(undefined);

  const testSetFilters: TestSetListRequest = {
    currentPage: tsPage,
    pageSize: tsPageSize,
    search: tsSearch || undefined,
    levelN: tsLevelN,
    testType: tsTestType,
    noPrice: tsNoPrice,
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
    setTsLevelN(undefined);
    setTsTestType(undefined);
    setTsNoPrice(undefined);
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

      <div className="p-8 mt-24 space-y-8">
        <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <CardTitle className="text-xl font-bold text-foreground">Quản lý Test</CardTitle>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => autoAddFreeTestSetsMutation.mutate()}
                  disabled={autoAddFreeTestSetsMutation.isPending}
                  className="border-border text-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all shadow-sm"
                >
                  {autoAddFreeTestSetsMutation.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang thêm...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      Tự động thêm TestSet miễn phí
                    </>
                  )}
                </Button>
                <Button 
                  onClick={openCreate}
                  className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Thêm mới
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
            ) : tests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="p-3 bg-muted rounded-full mb-4">
                  <FileText className="w-8 h-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground font-medium text-lg">
                  Không có test
                </p>
              </div>
            ) : (
              <>
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {tests.map((t) => (
                    <TestCard
                      key={t.id}
                      test={{
                        ...t,
                        levelN: t.levelN ?? 0,
                        price: t.price ?? 0,
                      }}
                      extractText={extractText}
                      onClick={() => openEdit(t.id)}
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

        <TestDialog
          open={isDialogOpen}
          onOpenChange={setIsDialogOpen}
          selectedId={selectedId}
          form={form}
          onFormChange={setForm}
          linkedTestSets={linkedTestSets || []}
          loadingLinked={loadingLinked}
          selectedLinkedIds={selectedLinkedIds}
          extractText={extractText}
          onToggleSelectLinked={toggleSelectLinked}
          onRemoveLinked={handleRemoveLinked}
          onRemoveSelectedLinked={handleRemoveSelectedLinked}
          onCreateTestSet={handleOpenAddTestSets}
          onSave={handleSave}
          onCancel={handleDialogClose}
          isSaving={createTestMutation.isPending || updateTestMutation.isPending}
        />

        <AddTestSetsDialog
          open={isAddTestSetsOpen}
          onOpenChange={setIsAddTestSetsOpen}
          selectedId={selectedId}
          tsItems={tsItems || []}
          tsLoading={tsLoading}
          tsPagination={tsPagination}
          tsPage={tsPage}
          tsPageSize={tsPageSize}
          tsSearch={tsSearch}
          tsLevelN={tsLevelN}
          tsTestType={tsTestType}
          tsNoPrice={tsNoPrice}
          selectedTestSetIds={selectedTestSetIds}
          extractText={extractText}
          onSearchChange={(search) => {
            setTsSearch(search);
            setTsPage(1);
          }}
          onLevelChange={(level) => {
            setTsLevelN(level);
            setTsPage(1);
            setTsForceKey((k) => k + 1);
          }}
          onTestTypeChange={(testType) => {
            setTsTestType(testType);
            setTsPage(1);
            setTsForceKey((k) => k + 1);
          }}
          onNoPriceChange={(noPrice) => {
            setTsNoPrice(noPrice);
            setTsPage(1);
            setTsForceKey((k) => k + 1);
          }}
          onPageChange={setTsPage}
          onPageSizeChange={(size) => {
            setTsPageSize(size);
            setTsPage(1);
          }}
          onToggleSelect={toggleSelectTestSet}
          onLinkSelected={handleLinkSelected}
          isLinking={linkTestSetsMutation.isPending}
        />
      </div>
    </>
  );
};

export default TestManagement;
