import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/Tabs";
import { ScrollArea, ScrollBar } from "@ui/ScrollArea";
import { Input } from "@ui/Input";
import { Badge } from "@ui/Badge";
import { Button } from "@ui/Button";
import { Loader2, Plus, X, Edit2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetRewardList } from "@hooks/useReward";
import { useUpdateSeasonRankReward } from "@hooks/useBattle";
import { IRewardEntityType } from "@models/reward/entity";
import { Card, CardContent, CardHeader } from "@ui/Card";
import DialogReward from "../DialogReward";

type PendingSelections = Record<string, Record<number, number[]>>;

type SeasonRankReward = {
    id: number;
    order: number;
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
            entries.forEach((entry) => {
                const rewardIds = Array.isArray(entry.rewards) ? entry.rewards.map((reward) => reward.id) : [];
                result[rankName][entry.order] = rewardIds;
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
        if (Number.isNaN(order) || order < 1) return;

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

    const handleSaveRewards = useCallback(async () => {
        const payload = {
            seasonId,
            items: Object.entries(pendingSelections).map(([rankName, orders]) => ({
                rankName,
                infoOrders: Object.entries(orders).map(([order, rewards]) => ({
                    order: Number(order),
                    rewards,
                })),
            })),
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
                {rankGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{messages.noRewards}</p>
                ) : (
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
                                const existingOrders = new Set(entries.map(e => e.order));
                                const newOrderInput = newOrderInputs[rankName] ?? "";
                                const newOrderSelections = Object.entries(pendingSelections[rankName] ?? {})
                                    .filter(([order]) => !existingOrders.has(Number(order)))
                                    .map(([order, rewards]) => ({ order: Number(order), rewards: rewards as number[] }))
                                    .sort((a, b) => a.order - b.order);

                                return (
                                    <TabsContent key={rankName} value={rankName} className="mt-0 flex-1 min-h-0 flex flex-col overflow-hidden">
                                        <ScrollArea className="flex-1">
                                            <div className="space-y-3 py-2 pr-2">
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
                                                                            <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/40 font-semibold">
                                                                                {t('tournaments.detail.rewards.range.single', { rank: order })}
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
                                                                        {selectedRewardIds.length === 0 ? (
                                                                            <p className="text-sm text-muted-foreground py-2">
                                                                                {messages.noRewardRange}
                                                                            </p>
                                                                        ) : (
                                                                            <div className="flex flex-wrap gap-2">
                                                                                {selectedRewards.map((reward) => (
                                                                                    <Badge
                                                                                        key={reward.id}
                                                                                        variant="secondary"
                                                                                        className="bg-blue-500/10 text-blue-700 border-blue-500/30 pr-1 cursor-pointer hover:bg-blue-500/20 transition-colors"
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
                                                {entries.map((entry, index) => {
                                                    const nextEntry = entries[index + 1];
                                                    const rangeLabel = formatRangeLabel(entry.order, nextEntry?.order);
                                                    const selectedRewardIds = pendingSelections[rankName]?.[entry.order] ?? [];
                                                    const selectedRewards = selectedRewardIds
                                                        .map(id => rewardOptionsMap.get(id))
                                                        .filter((reward): reward is IRewardEntityType => reward !== undefined);

                                                    return (
                                                        <Card
                                                            key={entry.id}
                                                            className="border border-amber-200/50 bg-background/90 shadow-sm"
                                                        >
                                                            <CardHeader className="space-y-3 pb-3">
                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                    <Badge className="bg-primary/15 text-primary border-primary/30 font-semibold uppercase tracking-wide">
                                                                        {rangeLabel}
                                                                    </Badge>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="outline"
                                                                        onClick={() => handleOpenRewardSelect(rankName, entry.order)}
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
                                                                        {selectedRewards.map((reward) => (
                                                                            <Badge
                                                                                key={reward.id}
                                                                                variant="secondary"
                                                                                className="bg-primary/10 text-primary border-primary/30 pr-1 cursor-pointer hover:bg-primary/20 transition-colors"
                                                                                onClick={() => handleRemoveReward(rankName, entry.order, reward.id)}
                                                                            >
                                                                                {reward.nameTranslation || reward.nameKey || `#${reward.id}`}
                                                                                <X className="w-3 h-3 ml-1.5" />
                                                                            </Badge>
                                                                        ))}
                                                                    </div>
                                                                )}
                                                            </CardContent>
                                                        </Card>
                                                    )
                                                })}
                                            </div>
                                            <ScrollBar orientation="vertical" />
                                        </ScrollArea>
                                    </TabsContent>
                                );
                            })}
                        </Tabs>
                    </div>
                )}
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
                    order={rewardSelectDialog.order}
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