import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@ui/Card";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/Table";
import { Badge } from "@ui/Badge";
import { Plus, Edit, Trash2, MoreVertical, Gift, Loader2, Search } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ui/DropdownMenu";
import HeaderAdmin from "@organisms/Header/Admin";
import { toast } from "react-toastify";
import CreateRewardDialog from "./components/CreateRewardDialog";
import { useTranslation } from "react-i18next";
import { useGetRewardList, useDeleteReward } from "@hooks/useReward";
import PaginationControls from "@ui/PaginationControls";
import SortableTableHeader from "@ui/SortableTableHeader";
import { IRewardEntityType } from "@models/reward/entity";
import { REWARD_TYPE, REWARD_TARGET } from "@constants/reward";

const RewardManagement = () => {
    const { t } = useTranslation();

    // --- States ---
    const [searchQuery, setSearchQuery] = useState("");
    const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
    const [editingReward, setEditingReward] = useState<any | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(15);
    const [typeFilter, setTypeFilter] = useState("all");
    const [targetFilter, setTargetFilter] = useState("all");
    const [sortBy, setSortBy] = useState<string | undefined>("id");
    const [sort, setSort] = useState<"asc" | "desc" | undefined>("desc");

    const { data: rewardList, isLoading } = useGetRewardList({
        page: currentPage,
        limit: itemsPerPage,
        sortBy,
        sort,
        name: searchQuery || undefined,
        rewardType: typeFilter !== "all" ? typeFilter : undefined,
        rewardTarget: targetFilter !== "all" ? targetFilter : undefined,
    });

    const deleteRewardMutation = useDeleteReward();

    // Filter options
    const typeOptions = [
        { value: "all", label: t('reward.allTypes') },
        { value: REWARD_TYPE.LESSON, label: t('reward.rewardTypeLESSON') },
        { value: REWARD_TYPE.DAILY_REQUEST, label: t('reward.rewardTypeDAILY_REQUEST') },
        { value: REWARD_TYPE.EVENT, label: t('reward.rewardTypeEVENT') },
        { value: REWARD_TYPE.ACHIEVEMENT, label: t('reward.rewardTypeACHIEVEMENT') },
        { value: REWARD_TYPE.LEVEL, label: t('reward.rewardTypeLEVEL') },
    ];

    const targetOptions = [
        { value: "all", label: t('reward.allTargets') },
        { value: REWARD_TARGET.EXP, label: t('reward.rewardTargetEXP') },
        { value: REWARD_TARGET.POKEMON, label: t('reward.rewardTargetPOKEMON') },
        { value: REWARD_TARGET.POKE_COINS, label: t('reward.rewardTargetPOKE_COINS') },
        { value: REWARD_TARGET.SPARKLES, label: t('reward.rewardTargetSPARKLES') },
    ];

    const getRewardTypeLabel = (type: string) => {
        switch (type) {
            case REWARD_TYPE.LESSON: return t('reward.rewardTypeLESSON');
            case REWARD_TYPE.DAILY_REQUEST: return t('reward.rewardTypeDAILY_REQUEST');
            case REWARD_TYPE.EVENT: return t('reward.rewardTypeEVENT');
            case REWARD_TYPE.ACHIEVEMENT: return t('reward.rewardTypeACHIEVEMENT');
            case REWARD_TYPE.LEVEL: return t('reward.rewardTypeLEVEL');
            default: return type;
        }
    };

    const getRewardTargetLabel = (target: string) => {
        switch (target) {
            case REWARD_TARGET.EXP: return t('reward.rewardTargetEXP');
            case REWARD_TARGET.POKEMON: return t('reward.rewardTargetPOKEMON');
            case REWARD_TARGET.POKE_COINS: return t('reward.rewardTargetPOKE_COINS');
            case REWARD_TARGET.SPARKLES: return t('reward.rewardTargetSPARKLES');
            default: return target;
        }
    };

    const handleDelete = async (rewardId: number) => {
        if (window.confirm(t('reward.confirmDelete'))) {
            try {
                await deleteRewardMutation.mutateAsync(rewardId);
                toast.success(t('reward.deleteSuccess'));
            } catch (error) {
                console.error("Error deleting reward:", error);
                toast.error(t('reward.deleteError'));
            }
        }
    };

    const handleEdit = (reward: any) => {
        setEditingReward(reward);
        setIsAddEditDialogOpen(true);
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

    const openAddDialog = () => {
        setEditingReward(null);
        setIsAddEditDialogOpen(true);
    };

    const closeDialog = () => {
        setIsAddEditDialogOpen(false);
        setEditingReward(null);
    };

    return (
        <>
            <HeaderAdmin title={t('reward.title')} description={t('reward.description')} />
            <div className="mt-24 p-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">Tổng phần thưởng</CardTitle>
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <Gift className="w-5 h-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">
                                {rewardList?.pagination?.totalItem || 0}
                            </div>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Rewards Table */}
                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Gift className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">{t('reward.title')}</CardTitle>
                            </div>
                            <Button
                                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg"
                                onClick={openAddDialog}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {t('reward.addReward')}
                            </Button>
                        </div>

                        {/* Filter Panel */}
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                <Input
                                    placeholder={t('reward.searchPlaceholder')}
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
                                    <SelectValue placeholder={t('reward.filterByType')} />
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
                                value={targetFilter}
                                onValueChange={setTargetFilter}
                            >
                                <SelectTrigger className="w-full sm:w-[180px] bg-background border-border text-foreground h-11 shadow-sm">
                                    <SelectValue placeholder={t('reward.filterByTarget')} />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    {targetOptions.map((option) => (
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
                                        <SortableTableHeader
                                            title={t('reward.name')}
                                            sortKey="nameTranslation"
                                            currentSortBy={sortBy}
                                            currentSort={sort}
                                            onSort={handleSort}
                                        />
                                        <SortableTableHeader
                                            title={t('reward.rewardType')}
                                            sortKey="rewardType"
                                            currentSortBy={sortBy}
                                            currentSort={sort}
                                            onSort={handleSort}
                                        />
                                        <SortableTableHeader
                                            title={t('reward.rewardValue')}
                                            sortKey="rewardItem"
                                            currentSortBy={sortBy}
                                            currentSort={sort}
                                            onSort={handleSort}
                                        />
                                        <SortableTableHeader
                                            title={t('reward.rewardTarget')}
                                            sortKey="rewardTarget"
                                            currentSortBy={sortBy}
                                            currentSort={sort}
                                            onSort={handleSort}
                                        />
                                        <TableHead className="text-muted-foreground text-right">{t('common.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {rewardList?.results && rewardList.results.length > 0 ? (
                                        rewardList.results.map((reward: IRewardEntityType) => (
                                            <TableRow key={reward.id} className="border-border hover:bg-muted/30 transition-colors group">
                                                <TableCell className="font-semibold text-foreground">{reward.nameTranslation}</TableCell>
                                                <TableCell>
                                                    <Badge className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 border-blue-500/30 shadow-sm font-medium">
                                                        {getRewardTypeLabel(reward.rewardType)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-foreground font-medium">{reward.rewardItem}</TableCell>
                                                <TableCell>
                                                    <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border-green-500/30 shadow-sm font-medium">
                                                        {getRewardTargetLabel(reward.rewardTarget)}
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
                                                                onClick={() => handleEdit(reward)}
                                                            >
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                {t('common.edit')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                className="text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
                                                                onClick={() => handleDelete(reward.id)}
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
                                            <TableCell colSpan={5} className="text-center py-12">
                                                <div className="flex flex-col items-center justify-center gap-4">
                                                    <div className="p-3 bg-muted rounded-full">
                                                        <Gift className="w-8 h-8 text-muted-foreground" />
                                                    </div>
                                                    <p className="text-muted-foreground font-medium">{t('reward.noRewardsFound')}</p>
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
                            totalPages={rewardList?.pagination?.totalPage || 1}
                            totalItems={rewardList?.pagination?.totalItem || 0}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                            isLoading={isLoading}
                        />
                    </CardFooter>
                </Card>
            </div>

            {/* Dialog component */}
            <CreateRewardDialog
                isOpen={isAddEditDialogOpen}
                onClose={closeDialog}
                editingReward={editingReward}
            />
        </>
    );
};

export default RewardManagement;
