import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@ui/Card";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/Table";
import { Badge } from "@ui/Badge";
import { Plus, Edit, Trash2, MoreVertical, Calendar, Target, Sparkles, Loader2, Search, CheckCircle2 } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ui/DropdownMenu";
import HeaderAdmin from "@organisms/Header/Admin";
import { toast } from "react-toastify";
import { cn } from "@utils/CN";
import CreateDailyQuestDialog from "./CreateDailyQuest";
import { useTranslation } from "react-i18next";
import { useGetDailyRequestList } from "@hooks/useDailyRequest";
import PaginationControls from "@ui/PaginationControls";
import SortableTableHeader from "@ui/SortableTableHeader";
import FilterPanel from "@ui/FilterPanel";
import { IDailyRequestResponse } from "@models/dailyRequest/response";
import TableSkeleton from "@ui/TableSkeleton";



// --- Dữ liệu giả lập cho rewards ---
const mockRewards = [
    { id: 1, name: "Gem x10" },
    { id: 2, name: "Exp x50" },
    { id: 3, name: "Stamina Refill S" },
    { id: 4, name: "Vé Quay x1" },
];

const DailyQuestManagement = () => {
    const { t } = useTranslation();

    // --- States ---
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [, setEditingQuest] = useState<any | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [statusFilter, setStatusFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");
    const [streakFilter, setStreakFilter] = useState("all");
    const [rewardFilter, setRewardFilter] = useState("all");
    const [sortBy, setSortBy] = useState<string | undefined>("id");
    const [sort, setSort] = useState<"asc" | "desc" | undefined>("desc");

    const { data: dailyRequestList, isLoading } = useGetDailyRequestList({
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sort,
        nameTranslation: searchQuery || undefined,
        dailyRequestType: typeFilter !== "all" ? typeFilter : undefined,
        isActive: statusFilter !== "all" ? statusFilter === "active" : undefined,
        isStreak: streakFilter !== "all" ? streakFilter === "true" : undefined,
        rewardId: rewardFilter !== "all" ? parseInt(rewardFilter) : undefined,
    });

    // Filter options
    const statusOptions = [
        { value: "all", label: t('dailyQuest.allStatuses') },
        { value: "active", label: t('common.active') },
        { value: "inactive", label: t('common.inactive') }
    ];

    const typeOptions = [
        { value: "all", label: t('dailyQuest.allTypes') },
        { value: "DAILY_LOGIN", label: "Daily Login" },
        { value: "STREAK_LOGIN", label: "Streak Login" },
        { value: "COMPLETE_LESSON", label: "Complete Lesson" },
        { value: "VOCABULARY_PRACTICE", label: "Vocabulary Practice" }
    ];

    const streakOptions = [
        { value: "all", label: t('dailyQuest.allStreaks') },
        { value: "true", label: t('dailyQuest.hasStreak') },
        { value: "false", label: t('dailyQuest.noStreak') }
    ];

    const rewardOptions = [
        { value: "all", label: t('dailyQuest.allRewards') },
        { value: "1", label: "Gem x10" },
        { value: "2", label: "Exp x50" },
        { value: "3", label: "Stamina Refill S" },
        { value: "4", label: "Vé Quay x1" }
    ];

    const handleDelete = async (questId: number) => {
        if (window.confirm(t('dailyQuest.confirmDelete'))) {
            try {
                // TODO: Gọi API xóa quest
                console.log('Deleting quest:', questId);
                toast.success(t('dailyQuest.deleteSuccess'));
            } catch (error) {
                console.error("Lỗi khi xóa nhiệm vụ:", error);
                toast.error(t('dailyQuest.deleteError'));
            }
        }
    };

    const getConditionLabel = (type: string) => {
        switch (type) {
            case "DAILY_LOGIN": return "Daily Login";
            case "STREAK_LOGIN": return "Streak Login";
            case "COMPLETE_LESSON": return "Complete Lesson";
            case "VOCABULARY_PRACTICE": return "Vocabulary Practice";
            default: return type;
        }
    };

    const handleSort = (columnKey: string) => {
        if (sortBy === columnKey) {
            setSort(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(columnKey);
            setSort("asc");
        }
        setCurrentPage(1);
    };

    const handleClearAllFilters = () => {
        setSearchQuery("");
        setTypeFilter("all");
        setStatusFilter("all");
        setStreakFilter("all");
        setRewardFilter("all");
        setCurrentPage(1);
    };


    const openAddDialog = () => {
        setEditingQuest(null);
        setIsAddEditDialogOpen(true);
    };

    const closeDialog = () => {
        setIsAddEditDialogOpen(false);
        setEditingQuest(null);
    };


    return (
        <>
            <HeaderAdmin title={t('dailyQuest.title')} description={t('dailyQuest.description')} />
            <div className="mt-24 p-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">Tổng nhiệm vụ</CardTitle>
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Target className="w-5 h-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">
                                {dailyRequestList?.pagination?.totalItem || 0}
                            </div>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Daily Quest Table */}
                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Calendar className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">{t('dailyQuest.title')}</CardTitle>
                            </div>
                            <Button 
                                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg"
                                onClick={openAddDialog}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {t('dailyQuest.addQuest')}
                            </Button>
                        </div>

                        {/* Filter Panel */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                <Input
                                    placeholder={t('dailyQuest.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                />
                            </div>
                            <Select
                                value={typeFilter}
                                onValueChange={setTypeFilter}
                            >
                                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border text-foreground h-11 shadow-sm">
                                    <SelectValue placeholder={t('dailyQuest.filterByType')} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {typeOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={statusFilter}
                                onValueChange={setStatusFilter}
                            >
                                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border text-foreground h-11 shadow-sm">
                                    <SelectValue placeholder={t('dailyQuest.filterByStatus')} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {statusOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={streakFilter}
                                onValueChange={setStreakFilter}
                            >
                                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border text-foreground h-11 shadow-sm">
                                    <SelectValue placeholder={t('dailyQuest.filterByStreak')} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {streakOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={rewardFilter}
                                onValueChange={setRewardFilter}
                            >
                                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border text-foreground h-11 shadow-sm">
                                    <SelectValue placeholder={t('dailyQuest.filterByReward')} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {rewardOptions.map((option) => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>

                    <CardContent>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">{t('common.loading')}</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border hover:bg-muted/30">
                                        <TableHead className="text-muted-foreground font-semibold">{t('common.name')}</TableHead>
                                        <SortableTableHeader
                                            title={t('common.condition') + ' ' + t('common.type')}
                                            sortKey="dailyRequestType"
                                            currentSortBy={sortBy}
                                            currentSort={sort}
                                            onSort={handleSort}
                                        />
                                        <SortableTableHeader
                                            title={t('common.value')}
                                            sortKey="conditionValue"
                                            currentSortBy={sortBy}
                                            currentSort={sort}
                                            onSort={handleSort}
                                        />
                                        <SortableTableHeader
                                            title={t('common.reward')}
                                            sortKey="rewardId"
                                            currentSortBy={sortBy}
                                            currentSort={sort}
                                            onSort={handleSort}
                                        />
                                        <SortableTableHeader
                                            title={t('common.status')}
                                            sortKey="isActive"
                                            currentSortBy={sortBy}
                                            currentSort={sort}
                                            onSort={handleSort}
                                        />
                                        <TableHead className="text-muted-foreground text-right">{t('common.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {dailyRequestList?.results && dailyRequestList.results.length > 0 ? (
                                        dailyRequestList.results.map((quest: IDailyRequestResponse) => (
                                            <TableRow key={quest.id} className="border-border hover:bg-muted/30 transition-colors group">
                                                <TableCell className="font-semibold text-foreground">{quest.nameTranslation}</TableCell>
                                                <TableCell>
                                                    <Badge className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-600 border-purple-500/30 shadow-sm font-medium">
                                                        {getConditionLabel(quest.dailyRequestType)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-foreground font-medium">{quest.conditionValue}</TableCell>
                                                <TableCell>
                                                    <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border-green-500/30 shadow-sm font-medium">
                                                        Reward ID: {quest.rewardId}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge
                                                        className={`shadow-sm font-medium flex items-center gap-1 ${
                                                            quest.isActive 
                                                                ? "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border-green-500/30" 
                                                                : "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-600 border-red-500/30"
                                                        }`}
                                                    >
                                                        {quest.isActive && <CheckCircle2 className="w-3 h-3" />}
                                                        {quest.isActive ? t('common.active') : t('common.inactive')}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all"
                                                            >
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-card border-border shadow-lg">
                                                            <DropdownMenuItem
                                                                className="text-foreground hover:bg-primary/10 cursor-pointer transition-colors"
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                {t('common.edit')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                                                                onClick={() => handleDelete(quest.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                {t('common.delete')}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={6} className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="p-3 bg-muted rounded-full">
                                                        <Target className="w-8 h-8 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-muted-foreground font-medium">{t('dailyQuest.noQuestsFound')}</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                    <CardFooter className="border-t border-border bg-muted/30">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={dailyRequestList?.pagination?.totalPage || 1}
                            totalItems={dailyRequestList?.pagination?.totalItem || 0}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                            isLoading={isLoading}
                        />
                    </CardFooter>
                </Card>
            </div>

            {/* Dialog component */}
            <CreateDailyQuestDialog
                isOpen={isAddEditDialogOpen}
                onClose={closeDialog}
                mockRewards={mockRewards}
            />
        </>
    );
};

export default DailyQuestManagement;