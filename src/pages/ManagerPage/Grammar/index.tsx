import { useState } from "react";
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
import { ArrowUpDown, BookOpenCheck, ChevronDown, ChevronUp, RefreshCcw } from "lucide-react";
import { useGrammarList } from "@hooks/useGrammar";
import { useDebounce } from "@hooks/useDebounce";
import { formatDateTime } from "@utils/date";

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

const levelOptions: GrammarLevelValue[] = ["all", "N5", "N4", "N3", "N2", "N1"];

const LEVEL_BADGE_STYLES: Record<string, string> = {
    N5: "bg-emerald-100 text-emerald-700 border-emerald-200",
    N4: "bg-teal-100 text-teal-700 border-teal-200",
    N3: "bg-sky-100 text-sky-700 border-sky-200",
    N2: "bg-indigo-100 text-indigo-700 border-indigo-200",
    N1: "bg-purple-100 text-purple-700 border-purple-200",
};

const GrammarManagementPage = () => {
    const { t } = useTranslation();
    const [searchValue, setSearchValue] = useState("");
    const debouncedSearchValue = useDebounce(searchValue, 500);
    const [page, setPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [selectedLevel, setSelectedLevel] = useState<GrammarLevelValue>("all");
    const [sortBy, setSortBy] = useState<"createdAt" | "updatedAt">("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const { data, isLoading, isFetching, error, refetch } = useGrammarList({
        page,
        limit: itemsPerPage,
        search: debouncedSearchValue || undefined,
        levelN: selectedLevel === "all" ? undefined : Number(selectedLevel.replace("N", "")),
        sortBy,
        sort: sortDirection,
    });

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

    const handleSort = (columnKey: "createdAt" | "updatedAt") => {
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

    const renderSortIcon = (columnKey: "createdAt" | "updatedAt") => {
        if (sortBy !== columnKey) {
            return <ArrowUpDown className="h-4 w-4 text-muted-foreground" />;
        }
        return sortDirection === "asc" ? (
            <ChevronUp className="h-4 w-4 text-primary" />
        ) : (
            <ChevronDown className="h-4 w-4 text-primary" />
        );
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

    const getLevelClassName = (label: string) =>
        LEVEL_BADGE_STYLES[label] ?? "bg-muted text-muted-foreground border-border";

    const errorMessage =
        (error as any)?.response?.data?.message ??
        (error as Error | undefined)?.message ??
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
        <div className="min-h-screen bg-muted/20 p-6 md:p-10 space-y-6">
            <div className="space-y-2">
                <h1 className="text-3xl font-bold text-foreground">{t("managerGrammar.title")}</h1>
                <p className="text-muted-foreground">{t("managerGrammar.description")}</p>
            </div>

            <Card className="border-border shadow-sm">
                <CardHeader className="space-y-4">
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

                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
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
                                className="mt-2 sm:mt-6"
                                onClick={refreshList}
                                disabled={isFetching}
                            >
                                <RefreshCcw className={`mr-2 h-4 w-4 ${isFetching ? "animate-spin" : ""}`} />
                                {t("managerGrammar.refresh")}
                            </Button>
                        </div>
                    </div>

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
                </CardHeader>

                <CardContent className="space-y-4">
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
                                    <TableHead className="w-32">{t("managerGrammar.columns.level")}</TableHead>
                                    <TableHead>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground"
                                            onClick={() => handleSort("createdAt")}
                                        >
                                            {t("managerGrammar.columns.createdAt")}
                                            {renderSortIcon("createdAt")}
                                        </button>
                                    </TableHead>
                                    <TableHead>
                                        <button
                                            type="button"
                                            className="inline-flex items-center gap-2 font-medium text-muted-foreground hover:text-foreground"
                                            onClick={() => handleSort("updatedAt")}
                                        >
                                            {t("managerGrammar.columns.updatedAt")}
                                            {renderSortIcon("updatedAt")}
                                        </button>
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
                                                    <Badge className={getLevelClassName(levelLabel)}>{levelLabel}</Badge>
                                                </TableCell>
                                                <TableCell>{formatDateTime(grammar.createdAt)}</TableCell>
                                                <TableCell>{formatDateTime(grammar.updatedAt)}</TableCell>
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
    );
};

export default GrammarManagementPage;

