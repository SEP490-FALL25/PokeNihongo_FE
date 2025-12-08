import { FormEvent, useState } from "react";
import { useTranslation } from "react-i18next";
import { Input } from "@ui/Input";
import { Card, CardContent, CardFooter, CardHeader } from "@ui/Card";
import { Button } from "@ui/Button";
import { Badge } from "@ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/Table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import PaginationControls from "@ui/PaginationControls";
import { Alert, AlertDescription, AlertTitle } from "@ui/Alert";
import { Skeleton } from "@ui/Skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ui/Dialog";
import { BookOpenCheck, Pencil, Plus, RefreshCcw, Trash2 } from "lucide-react";
import { useGrammarList, useUpdateGrammar, useDeleteGrammar } from "@hooks/useGrammar";
import { useDebounce } from "@hooks/useDebounce";
import { formatDateTime } from "@utils/date";
import HeaderAdmin from "@organisms/Header/Admin";
import SortableTableHeader from "@ui/SortableTableHeader";
import CreateGrammarDialog from "./CreateGrammar";

type GrammarLevelValue = "all" | "N5" | "N4" | "N3" | "N2" | "N1";

interface GrammarItem {
    id: number;
    structure?: string;
    title?: string;
    level?: string | number;
    levelN?: number;
    createdAt?: string;
    updatedAt?: string;
}

interface PaginationMeta {
    current: number;
    pageSize: number;
    totalPage: number;
    totalItem: number;
}

interface GrammarListResponse {
    results?: GrammarItem[];
    pagination?: PaginationMeta;
}

interface ApiError {
    message?: string;
    response?: {
        data?: {
            message?: string;
        };
    };
}

const levelOptions: GrammarLevelValue[] = ["all", "N5", "N4", "N3", "N2", "N1"];

const LEVEL_BADGE_BASE_CLASS = "font-semibold uppercase tracking-wide text-[11px] leading-tight";

const LEVEL_BADGE_STYLES: Record<string, string> = {
    N5: "bg-emerald-400 text-emerald-950 border-emerald-600 shadow-sm",
    N4: "bg-teal-400 text-teal-950 border-teal-600 shadow-sm",
    N3: "bg-sky-400 text-sky-950 border-sky-600 shadow-sm",
    N2: "bg-indigo-500 text-white border-indigo-700 shadow-sm",
    N1: "bg-purple-500 text-white border-purple-700 shadow-sm",
};

type SortColumn = "level" | "createdAt" | "updatedAt";

type EditGrammarForm = {
    structure: string;
    level: GrammarLevelValue;
};

const GrammarManagementPage = () => {
    const { t } = useTranslation();
    const [searchValue, setSearchValue] = useState<string>("");
    const debouncedSearchValue = useDebounce(searchValue, 500);
    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
    const [page, setPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(15);
    const [selectedLevel, setSelectedLevel] = useState<GrammarLevelValue>("all");
    const [sortBy, setSortBy] = useState<SortColumn>("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
    const [editingGrammar, setEditingGrammar] = useState<GrammarItem | null>(null);
    const [editForm, setEditForm] = useState<EditGrammarForm>({ structure: "", level: "N5" });
    const [grammarToDelete, setGrammarToDelete] = useState<GrammarItem | null>(null);

    const { data, isLoading, isFetching, error, refetch } = useGrammarList({
        page,
        limit: itemsPerPage,
        search: debouncedSearchValue || undefined,
        level: selectedLevel === "all" ? undefined : selectedLevel,
        sortBy,
        sort: sortDirection,
    });
    const updateGrammar = useUpdateGrammar();
    const deleteGrammar = useDeleteGrammar();

    const grammarResponse = (data ?? {}) as GrammarListResponse;
    const grammars = grammarResponse.results ?? [];
    const pagination = grammarResponse.pagination ?? {
        current: page,
        pageSize: itemsPerPage,
        totalPage: 1,
        totalItem: grammars.length,
    };

    const totalItems = pagination.totalItem ?? 0;
    const tableIsLoading = isLoading;
    const showEmptyState = !tableIsLoading && grammars.length === 0;

    const handleLevelChange = (value: string) => {
        setSelectedLevel(value as GrammarLevelValue);
        setPage(1);
    };

    const handleItemsPerPageChange = (value: number) => {
        setItemsPerPage(value);
        setPage(1);
    };

    const handleSort = (columnKey: SortColumn) => {
        if (sortBy === columnKey) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(columnKey);
            setSortDirection("asc");
        }
        setPage(1);
    };

    const refreshList = () => {
        void refetch?.();
    };

    const openEditDialog = (grammar: GrammarItem) => {
        setEditingGrammar(grammar);
        setEditForm({
            structure: grammar.structure || grammar.title || "",
            level: getLevelValue(grammar),
        });
    };

    const closeEditDialog = () => {
        if (updateGrammar.isPending) return;
        setEditingGrammar(null);
    };

    const handleUpdateSubmit = async (event: FormEvent) => {
        event.preventDefault();
        if (!editingGrammar) return;
        const trimmedStructure = editForm.structure.trim();
        if (!trimmedStructure) return;
        try {
            await updateGrammar.mutateAsync({
                id: editingGrammar.id,
                data: {
                    structure: trimmedStructure,
                    level: editForm.level,
                },
            });
            closeEditDialog();
        } catch {
            // toast handled in hook
        }
    };

    const openDeleteDialog = (grammar: GrammarItem) => {
        setGrammarToDelete(grammar);
    };

    const closeDeleteDialog = () => {
        if (deleteGrammar.isPending) return;
        setGrammarToDelete(null);
    };

    const handleDelete = async () => {
        if (!grammarToDelete) return;
        try {
            await deleteGrammar.mutateAsync(grammarToDelete.id);
            closeDeleteDialog();
        } catch {
            // toast handled in hook
        }
    };

    const getLevelLabel = (grammar: GrammarItem) => {
        if (typeof grammar.level === "string" && grammar.level.trim() !== "") {
            return grammar.level.toUpperCase();
        }
        if (typeof grammar.level === "number") {
            return `N${grammar.level}`;
        }
        if (grammar.levelN) {
            return `N${grammar.levelN}`;
        }
        return t("managerGrammar.allLevels");
    };

    const getLevelValue = (grammar: GrammarItem): GrammarLevelValue => {
        const normalized = getLevelLabel(grammar).toUpperCase();
        if (["N5", "N4", "N3", "N2", "N1"].includes(normalized)) {
            return normalized as GrammarLevelValue;
        }
        return "N5";
    };

    const getLevelClassName = (label: string) =>
        LEVEL_BADGE_STYLES[label] ?? "bg-muted text-muted-foreground border-border";

    const errorMessage =
        (error as ApiError | undefined)?.response?.data?.message ??
        (error as ApiError | undefined)?.message ??
        t("managerGrammar.fallbackError");

    const SkeletonRows = () => (
        <TableBody>
            {Array.from({ length: pagination.pageSize || itemsPerPage }).map((_, index) => (
                <TableRow key={`grammar-skeleton-${index}`}>
                    <TableCell>
                        <Skeleton className="h-5 w-48" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-6 w-12 rounded-full" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-32" />
                    </TableCell>
                    <TableCell>
                        <Skeleton className="h-4 w-32" />
                    </TableCell>
                </TableRow>
            ))}
        </TableBody>
    );

    return (
        <>
            <HeaderAdmin title={t("managerGrammar.title")} description={t("managerGrammar.description")} />
            <div className="p-8 mt-24 space-y-8">
                <Card className="bg-white shadow-lg">
                    <CardHeader className="pb-0 space-y-6">
                        <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                            <Input
                                value={searchValue}
                                onChange={(event) => {
                                    setSearchValue(event.target.value);
                                    setPage(1);
                                }}
                                placeholder={t("managerGrammar.searchPlaceholder")}
                                isSearch
                                className="placeholder:text-muted-foreground"
                            />

                            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-end">
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                        {t("managerGrammar.levelLabel")}
                                    </span>
                                    <Select value={selectedLevel} onValueChange={handleLevelChange}>
                                        <SelectTrigger className="w-full sm:w-48 bg-background border-border">
                                            <SelectValue placeholder={t("managerGrammar.allLevels")} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            {levelOptions.map((option) => (
                                                <SelectItem key={option} value={option}>
                                                    {option === "all" ? t("managerGrammar.allLevels") : option}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="w-full sm:w-auto"
                                    onClick={refreshList}
                                    disabled={isFetching}
                                >
                                    <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                                    {t("managerGrammar.refresh")}
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                                <div className="inline-flex items-center gap-2">
                                    <BookOpenCheck className="h-4 w-4 text-primary" />
                                    <span>{t("managerGrammar.totalItems", { count: totalItems })}</span>
                                </div>
                                <Badge variant="outline" className="border-dashed text-muted-foreground">
                                    {t("managerGrammar.pageStat", {
                                        current: pagination.current ?? page,
                                        total: pagination.totalPage ?? 1,
                                    })}
                                </Badge>
                            </div>

                            <Button className="w-full sm:w-auto lg:w-auto" onClick={() => setIsCreateDialogOpen(true)}>
                                <Plus className="h-4 w-4" />
                                {t("managerGrammar.createButton")}
                            </Button>
                        </div>
                    </CardHeader>

                    <CardContent className="mt-6 space-y-4">
                        {error ? (
                            <Alert variant="destructive">
                                <AlertTitle>{t("common.error")}</AlertTitle>
                                <AlertDescription>{errorMessage}</AlertDescription>
                            </Alert>
                        ) : null}

                        <div className="rounded-lg border border-border bg-card overflow-hidden">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t("managerGrammar.columns.structure")}</TableHead>
                                        <SortableTableHeader
                                            title={t("managerGrammar.columns.level")}
                                            sortKey="level"
                                            currentSortBy={sortBy}
                                            currentSort={sortDirection}
                                            onSort={(key) => handleSort(key as SortColumn)}
                                            className="w-32"
                                        />
                                        <SortableTableHeader
                                            title={t("managerGrammar.columns.createdAt")}
                                            sortKey="createdAt"
                                            currentSortBy={sortBy}
                                            currentSort={sortDirection}
                                            onSort={(key) => handleSort(key as SortColumn)}
                                        />
                                        <SortableTableHeader
                                            title={t("managerGrammar.columns.updatedAt")}
                                            sortKey="updatedAt"
                                            currentSortBy={sortBy}
                                            currentSort={sortDirection}
                                            onSort={(key) => handleSort(key as SortColumn)}
                                        />
                                    <TableHead className="text-right w-36">
                                        {t("managerGrammar.columns.actions", { defaultValue: "Thao tác" })}
                                    </TableHead>
                                    </TableRow>
                                </TableHeader>

                                {tableIsLoading ? (
                                    <SkeletonRows />
                                ) : (
                                    <TableBody>
                                        {grammars.map((grammar) => {
                                            const levelLabel = getLevelLabel(grammar);
                                            return (
                                                <TableRow key={grammar.id}>
                                                    <TableCell className="font-semibold text-foreground">
                                                        {grammar.structure || grammar.title || "—"}
                                                    </TableCell>
                                                    <TableCell>
                                                    <Badge
                                                        variant="flat"
                                                        className={`${LEVEL_BADGE_BASE_CLASS} ${getLevelClassName(levelLabel)}`}
                                                    >
                                                        {levelLabel}
                                                    </Badge>
                                                    </TableCell>
                                                    <TableCell>{formatDateTime(grammar.createdAt)}</TableCell>
                                                    <TableCell>{formatDateTime(grammar.updatedAt)}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        type="button"
                                                        variant="outline"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => openEditDialog(grammar)}
                                                    >
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-destructive"
                                                        onClick={() => openDeleteDialog(grammar)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                                </TableRow>
                                            );
                                        })}
                                    </TableBody>
                                )}
                            </Table>

                            {showEmptyState ? (
                                <div className="py-12 text-center space-y-2">
                                    <p className="text-lg font-semibold text-foreground">
                                        {t("managerGrammar.emptyState.title")}
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        {t("managerGrammar.emptyState.subtitle")}
                                    </p>
                                </div>
                            ) : null}
                        </div>
                    </CardContent>

                    <CardFooter className="flex flex-col gap-4">
                        <PaginationControls
                            currentPage={pagination.current ?? page}
                            totalPages={pagination.totalPage ?? 1}
                            totalItems={totalItems}
                            itemsPerPage={pagination.pageSize ?? itemsPerPage}
                            onPageChange={setPage}
                            onItemsPerPageChange={handleItemsPerPageChange}
                            isLoading={tableIsLoading}
                        />
                    </CardFooter>
                </Card>
            </div>
            <Dialog open={Boolean(editingGrammar)} onOpenChange={(open) => (!open ? closeEditDialog() : null)}>
                <DialogContent className="max-w-lg bg-white">
                    <DialogHeader>
                        <DialogTitle>{t("managerGrammar.editTitle", { defaultValue: "Chỉnh sửa ngữ pháp" })}</DialogTitle>
                        <DialogDescription>
                            {t("managerGrammar.editSubtitle", { defaultValue: "Cập nhật cấu trúc và cấp độ" })}
                        </DialogDescription>
                    </DialogHeader>
                    <form className="space-y-4" onSubmit={handleUpdateSubmit}>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                {t("managerGrammar.columns.structure")}
                            </label>
                            <Input
                                value={editForm.structure}
                                onChange={(event) => setEditForm((prev) => ({ ...prev, structure: event.target.value }))}
                                placeholder={t("managerGrammar.structurePlaceholder", { defaultValue: "Ví dụ: ~です" })}
                                autoFocus
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground">
                                {t("managerGrammar.columns.level")}
                            </label>
                            <Select
                                value={editForm.level}
                                onValueChange={(value) => setEditForm((prev) => ({ ...prev, level: value as GrammarLevelValue }))}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder={t("managerGrammar.levelLabel")} />
                                </SelectTrigger>
                                <SelectContent>
                                    {levelOptions
                                        .filter((option) => option !== "all")
                                        .map((option) => (
                                            <SelectItem key={option} value={option}>
                                                {option}
                                            </SelectItem>
                                        ))}
                                </SelectContent>
                            </Select>
                        </div>

                        {updateGrammar.isError ? (
                            <Alert variant="destructive">
                                <AlertTitle>{t("common.error")}</AlertTitle>
                                <AlertDescription>
                                    {(updateGrammar.error as ApiError | undefined)?.response?.data?.message ||
                                        (updateGrammar.error as ApiError | undefined)?.message ||
                                        t("updateGrammar.error.general", { defaultValue: "Có lỗi xảy ra khi cập nhật" })}
                                </AlertDescription>
                            </Alert>
                        ) : null}

                        <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                            <Button type="button" variant="ghost" onClick={closeEditDialog} disabled={updateGrammar.isPending}>
                                {t("common.cancel")}
                            </Button>
                            <Button type="submit" disabled={updateGrammar.isPending || !editForm.structure.trim()}>
                                {t("managerGrammar.saveButton", { defaultValue: "Lưu thay đổi" })}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            <Dialog open={Boolean(grammarToDelete)} onOpenChange={(open) => (!open ? closeDeleteDialog() : null)}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-destructive">
                            {t("managerGrammar.deleteTitle", { defaultValue: "Xóa ngữ pháp" })}
                        </DialogTitle>
                        <DialogDescription>
                            {t("managerGrammar.deleteSubtitle", { defaultValue: "Thao tác này không thể hoàn tác" })}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-2">
                        <p className="text-sm text-muted-foreground">
                            {t("managerGrammar.deleteConfirm", {
                                defaultValue: "Bạn có chắc muốn xóa ngữ pháp",
                            })}{" "}
                            <span className="font-semibold text-foreground">
                                {grammarToDelete?.structure || grammarToDelete?.title || "—"}
                            </span>
                            ?
                        </p>
                    </div>
                    <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                        <Button type="button" variant="ghost" onClick={closeDeleteDialog} disabled={deleteGrammar.isPending}>
                            {t("common.cancel")}
                        </Button>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleDelete}
                            disabled={deleteGrammar.isPending}
                        >
                            {t("managerGrammar.deleteButton", { defaultValue: "Xóa" })}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <CreateGrammarDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
        </>
    );
};

export default GrammarManagementPage;

