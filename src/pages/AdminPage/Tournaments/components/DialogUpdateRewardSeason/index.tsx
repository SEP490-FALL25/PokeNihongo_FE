import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/Tabs";
import { ScrollArea, ScrollBar } from "@ui/ScrollArea";
import { Input } from "@ui/Input";
import { Badge } from "@ui/Badge";
import { Button } from "@ui/Button";
import { Loader2, Plus, X, Edit2, Trash2, Award } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetRewardList } from "@hooks/useReward";
import { useUpdateSeasonRankReward } from "@hooks/useBattle";
import { IRewardEntityType } from "@models/reward/entity";
import { Card, CardContent, CardHeader } from "@ui/Card";
import DialogReward from "../DialogReward";

// Sử dụng -1 để đại diện cho order null (rewards chung) trong state
// Chuyển đổi sang null khi gửi API
const COMMON_ORDER_KEY = -1;

type PendingSelections = Record<string, Record<number, number[]>>;

type SeasonRankReward = {
    id: number;
    order: number | null;
    rewards?: Array<{
        id: number;
        rewardType: string | number;
        rewardItem: string | number;
        rewardTarget: string | null;
        nameTranslation?: string | null;
        nameKey?: string;
    }>;
};

interface DialogUpdateRewardSeasonProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    seasonId: number;
    rankGroups: Array<[string, SeasonRankReward[]]>;
}

const DialogUpdateRewardSeason = ({ open, onOpenChange, seasonId, rankGroups }: DialogUpdateRewardSeasonProps) => {
    const { t } = useTranslation();

    const messages = {
        noRewards: t('tournaments.detail.messages.noRewards'),
        noRewardRange: t('tournaments.detail.messages.noRewardRange'),
    };

    const dialogLabels = {
        title: t('tournaments.detail.rewards.dialog.title'),
        description: t('tournaments.detail.rewards.dialog.description'),
        searchPlaceholder: t('tournaments.detail.rewards.dialog.searchPlaceholder'),
        noResults: t('tournaments.detail.rewards.dialog.noResults'),
        loading: t('tournaments.detail.rewards.dialog.loading'),
        reset: t('tournaments.detail.rewards.dialog.reset'),
        cancel: t('tournaments.detail.rewards.dialog.cancel'),
        save: t('tournaments.detail.rewards.dialog.save'),
    };


    const formatRangeLabel = useCallback((start: number, nextStart?: number) => {
        if (nextStart === undefined || nextStart === null) {
            return t('tournaments.detail.rewards.range.infinite', { start })
        }
        const end = nextStart - 1
        if (end <= start) {
            return t('tournaments.detail.rewards.range.single', { rank: start })
        }
        return t('tournaments.detail.rewards.range.range', { start, end })
    }, [t])

    const rewardListQueryParams = useMemo(() => ({ page: 1, limit: 200 }), []);
    const { data: rewardListData, isLoading: isRewardListLoading } = useGetRewardList(rewardListQueryParams);
    const rewardOptions = useMemo<IRewardEntityType[]>(() => rewardListData?.results ?? [], [rewardListData]);
    const rewardOptionsMap = useMemo(() => new Map(rewardOptions.map((item) => [item.id, item])), [rewardOptions]);

    const baselineSelections = useMemo<PendingSelections>(() => {
        const result: PendingSelections = {};
        rankGroups.forEach(([rankName, entries]) => {
            result[rankName] = {};
            // Khởi tạo order mặc định cho rewards chung (sử dụng COMMON_ORDER_KEY = -1)
            result[rankName][COMMON_ORDER_KEY] = [];

            entries.forEach((entry) => {
                const rewardIds = Array.isArray(entry.rewards) ? entry.rewards.map((reward) => reward.id) : [];

                // Xử lý order null từ API (chuyển thành COMMON_ORDER_KEY)
                if (entry.order === null) {
                    result[rankName][COMMON_ORDER_KEY] = rewardIds;
                } else {
                    result[rankName][entry.order] = rewardIds;
                }
            });
        });
        return result;
    }, [rankGroups]);

    const [activeRank, setActiveRank] = useState<string>("");
    const [pendingSelections, setPendingSelections] = useState<PendingSelections>({});
    const [newOrderInputs, setNewOrderInputs] = useState<Record<string, string>>({});
    const [rewardSelectDialog, setRewardSelectDialog] = useState<{
        open: boolean;
        rankName: string;
        order: number;
    } | null>(null);

    useEffect(() => {
        if (open) {
            setPendingSelections(baselineSelections);
            setActiveRank(rankGroups[0]?.[0] ?? "");
            setNewOrderInputs({});
            setRewardSelectDialog(null);
        }
    }, [open, baselineSelections, rankGroups]);

    const handleAddNewOrder = useCallback((rankName: string, orderStr: string) => {
        const order = Number.parseInt(orderStr, 10);
        // Không cho phép thêm order < 1 hoặc order === COMMON_ORDER_KEY
        if (Number.isNaN(order) || order < 1 || order === COMMON_ORDER_KEY) return;

        setPendingSelections((prev) => {
            const rankOrders = { ...(prev[rankName] ?? {}) };
            if (!rankOrders[order]) {
                rankOrders[order] = [];
            }
            return {
                ...prev,
                [rankName]: rankOrders,
            };
        });
        setNewOrderInputs((prev) => ({ ...prev, [rankName]: "" }));
    }, []);


    const updateSeasonRankRewardMutation = useUpdateSeasonRankReward();
    const isSavingRewards = updateSeasonRankRewardMutation.isPending;

    const handleDialogChange = useCallback(
        (nextOpen: boolean) => {
            if (!nextOpen && isSavingRewards) return;
            onOpenChange(nextOpen);
        },
        [isSavingRewards, onOpenChange]
    );

    const handleToggleReward = useCallback((rankName: string, order: number, rewardId: number) => {
        setPendingSelections((prev) => {
            const rankOrders = { ...(prev[rankName] ?? {}) };
            const currentSet = new Set(rankOrders[order] ?? []);
            if (currentSet.has(rewardId)) {
                currentSet.delete(rewardId);
            } else {
                currentSet.add(rewardId);
            }
            return {
                ...prev,
                [rankName]: {
                    ...rankOrders,
                    [order]: Array.from(currentSet),
                },
            };
        });
    }, []);

    const handleReset = useCallback(() => {
        setPendingSelections(baselineSelections);
        setActiveRank(rankGroups[0]?.[0] ?? "");
        setNewOrderInputs({});
        setRewardSelectDialog(null);
    }, [baselineSelections, rankGroups]);

    const handleOpenRewardSelect = useCallback((rankName: string, order: number) => {
        setRewardSelectDialog({ open: true, rankName, order });
    }, []);

    const handleCloseRewardSelect = useCallback(() => {
        setRewardSelectDialog(null);
    }, []);

    const handleRemoveReward = useCallback((rankName: string, order: number, rewardId: number) => {
        setPendingSelections((prev) => {
            const rankOrders = { ...(prev[rankName] ?? {}) };
            const currentSet = new Set(rankOrders[order] ?? []);
            currentSet.delete(rewardId);
            return {
                ...prev,
                [rankName]: {
                    ...rankOrders,
                    [order]: Array.from(currentSet),
                },
            };
        });
    }, []);

    const handleRemoveOrder = useCallback((rankName: string, order: number) => {
        setPendingSelections((prev) => {
            const rankOrders = { ...(prev[rankName] ?? {}) };
            // Không cho phép xóa order COMMON_ORDER_KEY (rewards chung)
            if (order === COMMON_ORDER_KEY) return prev;
            const newRankOrders = { ...rankOrders };
            delete newRankOrders[order];
            return {
                ...prev,
                [rankName]: newRankOrders,
            };
        });
    }, []);

    const handleSaveRewards = useCallback(async () => {
        const payload = {
            seasonId,
            items: Object.entries(pendingSelections).map(([rankName, orders]) => {
                const infoOrders: Array<{ order: number | null; rewards: number[] }> = [];

                // Xử lý order COMMON_ORDER_KEY (chuyển thành null cho API)
                if (orders[COMMON_ORDER_KEY] !== undefined) {
                    infoOrders.push({
                        order: null,
                        rewards: orders[COMMON_ORDER_KEY],
                    });
                }

                // Xử lý các order khác (số)
                Object.entries(orders).forEach(([orderStr, rewards]) => {
                    const order = Number(orderStr);
                    if (!Number.isNaN(order) && order !== COMMON_ORDER_KEY) {
                        infoOrders.push({
                            order,
                            rewards: rewards as number[],
                        });
                    }
                });

                return {
                    rankName,
                    infoOrders,
                };
            }),
        };

        try {
            await updateSeasonRankRewardMutation.mutateAsync(payload);
            onOpenChange(false);
        } catch {
            // toast handled in mutation
        }
    }, [pendingSelections, seasonId, updateSeasonRankRewardMutation, onOpenChange]);

    const activeRankValue = activeRank || (rankGroups[0]?.[0] ?? "");

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogContent className="max-w-6xl h-[90vh] bg-white border-border shadow-xl flex flex-col overflow-hidden">
                <DialogHeader className="flex-shrink-0 pb-4">
                    <DialogTitle>{dialogLabels.title}</DialogTitle>
                    <DialogDescription>{dialogLabels.description}</DialogDescription>
                </DialogHeader>
                <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
                    <div className="flex flex-wrap items-center justify-end gap-3 flex-shrink-0 mb-4">
                        <Button
                            variant="outline"
                            onClick={handleReset}
                            disabled={isSavingRewards}
                        >
                            {dialogLabels.reset}
                        </Button>
                    </div>
                    <Tabs
                        value={activeRankValue}
                        onValueChange={setActiveRank}
                        className="flex flex-col flex-1 min-h-0 overflow-hidden"
                    >
                        <div className="flex-shrink-0 mb-4">
                            <ScrollArea className="max-w-full">
                                <TabsList className="flex w-full flex-nowrap gap-2 bg-muted/40 p-2">
                                    {rankGroups.map(([rankName]) => (
                                        <TabsTrigger key={rankName} value={rankName} className="min-w-[120px]">
                                            {rankName}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                        </div>
                        {rankGroups.map(([rankName, entries]) => {
                            // Tạo Set các existing orders (bao gồm cả null được chuyển thành COMMON_ORDER_KEY)
                            const existingOrders = new Set(
                                entries
                                    .map(e => e.order === null ? COMMON_ORDER_KEY : e.order)
                                    .filter((order): order is number => order !== null)
                            );
                            const newOrderInput = newOrderInputs[rankName] ?? "";
                            const currentSelections = pendingSelections[rankName] ?? {};

                            // Lấy order COMMON_ORDER_KEY (rewards chung)
                            const commonRewards = currentSelections[COMMON_ORDER_KEY] ?? [];

                            // Lấy các order mới (không có trong existingOrders và không phải COMMON_ORDER_KEY)
                            const newOrderSelections: Array<{ order: number; rewards: number[] }> = [];

                            // Duyệt qua tất cả keys
                            Object.keys(currentSelections).forEach((orderStr) => {
                                const order = Number(orderStr);
                                if (!Number.isNaN(order) && order !== COMMON_ORDER_KEY && !existingOrders.has(order)) {
                                    const rewards = currentSelections[order];
                                    if (Array.isArray(rewards)) {
                                        newOrderSelections.push({
                                            order,
                                            rewards: rewards as number[],
                                        });
                                    }
                                }
                            });

                            newOrderSelections.sort((a, b) => a.order - b.order);

                            const commonRewardsList = commonRewards
                                .map((id: number) => rewardOptionsMap.get(id))
                                .filter((reward): reward is IRewardEntityType => reward !== undefined);

                            return (
                                <TabsContent key={rankName} value={rankName} className="mt-0 flex-1 min-h-0 flex flex-col overflow-hidden">
                                    <ScrollArea className="flex-1">
                                        <div className="space-y-3 py-2 pr-2">
                                            {/* Rewards chung (order null) */}
                                            <Card className="border border-purple-200/50 bg-purple-50/50 shadow-sm">
                                                <CardHeader className="space-y-3 pb-3">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-gradient-to-r from-purple-500/50 to-pink-500/50 text-purple-900 border-2 border-purple-500/70 font-bold shadow-md flex items-center gap-1.5 px-3 py-1">
                                                                <Award className="w-4 h-4" />
                                                                {t('tournaments.detail.rewards.dialog.commonRewards', { defaultValue: 'Phần thưởng chung cho tất cả' })}
                                                            </Badge>
                                                        </div>
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            onClick={() => handleOpenRewardSelect(rankName, COMMON_ORDER_KEY)}
                                                            disabled={isSavingRewards || isRewardListLoading}
                                                            className="h-8"
                                                        >
                                                            <Edit2 className="w-3 h-3 mr-1.5" />
                                                            {t('tournaments.detail.rewards.dialog.selectRewards', { defaultValue: 'Chọn rewards' })}
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="pt-0">
                                                    {commonRewards.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground py-2">
                                                            {t('tournaments.detail.rewards.dialog.noCommonRewards', { defaultValue: 'Chưa có rewards chung cho rank này.' })}
                                                        </p>
                                                    ) : (
                                                        <div className="flex flex-wrap gap-2">
                                                            {commonRewardsList.map((reward: IRewardEntityType) => (
                                                                <Badge
                                                                    key={reward.id}
                                                                    variant="secondary"
                                                                    className="bg-purple-500/25 text-purple-800 border-purple-500/50 pr-1 cursor-pointer hover:bg-purple-500/35 transition-colors font-medium shadow-sm"
                                                                    onClick={() => handleRemoveReward(rankName, COMMON_ORDER_KEY, reward.id)}
                                                                >
                                                                    {reward.nameTranslation || reward.nameKey || `#${reward.id}`}
                                                                    <X className="w-3 h-3 ml-1.5" />
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {/* Add New Order Section */}
                                            <Card className="border border-blue-200/50 bg-blue-50/50 shadow-sm">
                                                <CardHeader className="space-y-3 pb-3">
                                                    <div className="flex items-center gap-2">
                                                        <Plus className="w-4 h-4 text-primary" />
                                                        <span className="text-sm font-semibold text-foreground">
                                                            {t('tournaments.detail.rewards.dialog.addNewOrder', { defaultValue: 'Thêm vị trí mới' })}
                                                        </span>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            placeholder={t('tournaments.detail.rewards.dialog.orderPlaceholder', { defaultValue: 'Nhập vị trí (order)' })}
                                                            value={newOrderInput}
                                                            onChange={(e) => setNewOrderInputs(prev => ({ ...prev, [rankName]: e.target.value }))}
                                                            className="flex-1 bg-background border-border"
                                                            disabled={isSavingRewards}
                                                        />
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleAddNewOrder(rankName, newOrderInput)}
                                                            disabled={isSavingRewards || !newOrderInput || Number.isNaN(Number.parseInt(newOrderInput, 10))}
                                                        >
                                                            <Plus className="w-4 h-4 mr-1" />
                                                            {t('common.add', { defaultValue: 'Thêm' })}
                                                        </Button>
                                                    </div>
                                                </CardHeader>
                                                {newOrderSelections.length > 0 && (
                                                    <CardContent className="space-y-3 pt-0">
                                                        {newOrderSelections.map(({ order, rewards }) => {
                                                            const selectedRewardIds = rewards;
                                                            const selectedRewards = selectedRewardIds
                                                                .map(id => rewardOptionsMap.get(id))
                                                                .filter((reward): reward is IRewardEntityType => reward !== undefined);
                                                            return (
                                                                <div key={order} className="p-4 rounded-lg border border-blue-200/40 bg-background/70 space-y-3">
                                                                    <div className="flex items-center justify-between">
                                                                        <Badge className="bg-blue-500/40 text-blue-900 border-blue-500/60 font-semibold shadow-sm">
                                                                            {t('tournaments.detail.rewards.range.single', { rank: order })}
                                                                        </Badge>
                                                                        <div className="flex items-center gap-2">
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handleOpenRewardSelect(rankName, order)}
                                                                                disabled={isSavingRewards || isRewardListLoading}
                                                                                className="h-8"
                                                                            >
                                                                                <Edit2 className="w-3 h-3 mr-1.5" />
                                                                                {t('tournaments.detail.rewards.dialog.selectRewards', { defaultValue: 'Chọn rewards' })}
                                                                            </Button>
                                                                            <Button
                                                                                size="sm"
                                                                                variant="outline"
                                                                                onClick={() => handleRemoveOrder(rankName, order)}
                                                                                disabled={isSavingRewards}
                                                                                className="h-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                            >
                                                                                <Trash2 className="w-3 h-3" />
                                                                            </Button>
                                                                        </div>
                                                                    </div>
                                                                    {selectedRewardIds.length === 0 ? (
                                                                        <p className="text-sm text-muted-foreground py-2">
                                                                            {messages.noRewardRange}
                                                                        </p>
                                                                    ) : (
                                                                        <div className="flex flex-wrap gap-2">
                                                                            {selectedRewards.map((reward: IRewardEntityType) => (
                                                                                <Badge
                                                                                    key={reward.id}
                                                                                    variant="secondary"
                                                                                    className="bg-blue-500/25 text-blue-800 border-blue-500/50 pr-1 cursor-pointer hover:bg-blue-500/35 transition-colors font-medium shadow-sm"
                                                                                    onClick={() => handleRemoveReward(rankName, order, reward.id)}
                                                                                >
                                                                                    {reward.nameTranslation || reward.nameKey || `#${reward.id}`}
                                                                                    <X className="w-3 h-3 ml-1.5" />
                                                                                </Badge>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </CardContent>
                                                )}
                                            </Card>
                                            {(() => {
                                                // Lọc các entries có order !== null và sắp xếp theo order
                                                const validEntries = entries
                                                    .filter((entry) => entry.order !== null)
                                                    .sort((a, b) => (a.order as number) - (b.order as number));

                                                return validEntries.map((entry, index) => {
                                                    const nextEntry = validEntries[index + 1];
                                                    const order = entry.order as number;
                                                    const nextOrder = nextEntry?.order as number | undefined;
                                                    const rangeLabel = formatRangeLabel(order, nextOrder);
                                                    const selectedRewardIds = pendingSelections[rankName]?.[order] ?? [];
                                                    const selectedRewards = selectedRewardIds
                                                        .map((id: number) => rewardOptionsMap.get(id))
                                                        .filter((reward): reward is IRewardEntityType => reward !== undefined);

                                                    return (
                                                        <Card
                                                            key={entry.id}
                                                            className="border border-amber-200/50 bg-background/90 shadow-sm"
                                                        >
                                                            <CardHeader className="space-y-3 pb-3">
                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                    <Badge className="bg-primary/35 text-primary border-primary/60 font-semibold uppercase tracking-wide shadow-sm">
                                                                        {rangeLabel}
                                                                    </Badge>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleOpenRewardSelect(rankName, order)}
                                                                        disabled={isSavingRewards || isRewardListLoading}
                                                                        className="h-8"
                                                                    >
                                                                        <Edit2 className="w-3 h-3 mr-1.5" />
                                                                        {t('tournaments.detail.rewards.dialog.selectRewards', { defaultValue: 'Chọn rewards' })}
                                                                    </Button>
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent className="pt-0">
                                                                {selectedRewardIds.length === 0 ? (
                                                                    <p className="text-sm text-muted-foreground py-2">
                                                                        {messages.noRewardRange}
                                                                    </p>
                                                                ) : (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        {selectedRewards.map((reward: IRewardEntityType) => (
                                                                            <Badge
                                                                                key={reward.id}
                                                                                variant="secondary"
                                                                                className="bg-primary/25 text-primary border-primary/50 pr-1 cursor-pointer hover:bg-primary/35 transition-colors font-medium shadow-sm"
                                                                                onClick={() => handleRemoveReward(rankName, order, reward.id)}
                                                                            >
                                                                                {reward.nameTranslation || reward.nameKey || `#${reward.id}`}
                                                                                <X className="w-3 h-3 ml-1.5" />
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    );
                                                })
                                            })()}
                                        </div>
                                        <ScrollBar orientation="vertical" />
                                    </ScrollArea>
                                </TabsContent>
                            );
                        })}
                    </Tabs>
                </div>
                <DialogFooter className="flex items-center justify-end gap-2 flex-shrink-0 pt-4 border-t">
                    <Button
                        variant="outline"
                        onClick={() => handleDialogChange(false)}
                        disabled={isSavingRewards}
                    >
                        {dialogLabels.cancel}
                    </Button>
                    <Button
                        onClick={handleSaveRewards}
                        disabled={isSavingRewards || rankGroups.length === 0}
                    >
                        {isSavingRewards && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        {dialogLabels.save}
                    </Button>
                </DialogFooter>
            </DialogContent>

            {/* Dialog chọn rewards */}
            {rewardSelectDialog && (
                <DialogReward
                    open={rewardSelectDialog.open}
                    onOpenChange={(open) => !open && handleCloseRewardSelect()}
                    rankName={rewardSelectDialog.rankName}
                    order={rewardSelectDialog.order === COMMON_ORDER_KEY ? null : rewardSelectDialog.order}
                    rewardOptions={rewardOptions}
                    isRewardListLoading={isRewardListLoading}
                    selectedRewardIds={pendingSelections[rewardSelectDialog.rankName]?.[rewardSelectDialog.order] ?? []}
                    onToggleReward={(rewardId) => handleToggleReward(rewardSelectDialog.rankName, rewardSelectDialog.order, rewardId)}
                    isSavingRewards={isSavingRewards}
                    searchPlaceholder={dialogLabels.searchPlaceholder}
                    loadingLabel={dialogLabels.loading}
                    noResultsLabel={dialogLabels.noResults}
                />
            )}
        </Dialog>
    )
}

export default DialogUpdateRewardSeason