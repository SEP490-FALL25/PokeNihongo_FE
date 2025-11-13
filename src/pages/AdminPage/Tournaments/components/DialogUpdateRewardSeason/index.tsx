
import { useCallback, useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ui/Dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/Tabs";
import { ScrollArea, ScrollBar } from "@ui/ScrollArea";
import { Checkbox } from "@ui/Checkbox";
import { Input } from "@ui/Input";
import { Badge } from "@ui/Badge";
import { Button } from "@ui/Button";
import { Loader2, Plus } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useGetRewardList } from "@hooks/useReward";
import { useUpdateSeasonRankReward } from "@hooks/useBattle";
import { IRewardEntityType } from "@models/reward/entity";
import { Card, CardContent, CardHeader } from "@ui/Card";

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

    const rewardsLabels = {
        rewardCount: (count: number) => t('tournaments.detail.rewards.rewardCount', { count }),
        table: {
            type: t('tournaments.detail.rewards.table.type'),
            target: t('tournaments.detail.rewards.table.target'),
            value: t('tournaments.detail.rewards.table.value'),
            note: t('tournaments.detail.rewards.table.note'),
        },
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
    const [rewardSearch, setRewardSearch] = useState("");
    const [pendingSelections, setPendingSelections] = useState<PendingSelections>({});
    const [newOrderInputs, setNewOrderInputs] = useState<Record<string, string>>({});

    useEffect(() => {
        if (open) {
            setPendingSelections(baselineSelections);
            setRewardSearch("");
            setActiveRank(rankGroups[0]?.[0] ?? "");
            setNewOrderInputs({});
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

    const filteredRewardOptions = useMemo(() => {
        const keyword = rewardSearch.trim().toLowerCase();
        if (!keyword) return rewardOptions;
        return rewardOptions.filter((reward) => {
            const name = (reward.nameTranslation || reward.nameKey || "").toLowerCase();
            return (
                name.includes(keyword) ||
                reward.rewardType?.toLowerCase().includes(keyword) ||
                reward.rewardTarget?.toLowerCase().includes(keyword) ||
                String(reward.rewardItem ?? "").includes(keyword)
            );
        });
    }, [rewardOptions, rewardSearch]);

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
        setRewardSearch("");
        setActiveRank(rankGroups[0]?.[0] ?? "");
        setNewOrderInputs({});
    }, [baselineSelections, rankGroups]);

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
            <DialogContent className="max-w-6xl max-h-[90vh] bg-white border-border shadow-xl flex flex-col">
                <DialogHeader className="flex-shrink-0">
                    <DialogTitle>{dialogLabels.title}</DialogTitle>
                    <DialogDescription>{dialogLabels.description}</DialogDescription>
                </DialogHeader>
                {rankGroups.length === 0 ? (
                    <p className="text-sm text-muted-foreground">{messages.noRewards}</p>
                ) : (
                    <div className="flex flex-col gap-6 flex-1 min-h-0">
                        <div className="flex flex-wrap items-center justify-between gap-3 flex-shrink-0">
                            <Input
                                value={rewardSearch}
                                onChange={(event) => setRewardSearch(event.target.value)}
                                placeholder={dialogLabels.searchPlaceholder}
                                className="max-w-md bg-background border-border"
                                disabled={isRewardListLoading}
                            />
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
                            className="flex flex-col gap-4 flex-1 min-h-0 overflow-hidden"
                        >
                            <ScrollArea className="max-w-full flex-shrink-0">
                                <TabsList className="flex w-full flex-nowrap gap-2 bg-muted/40 p-2">
                                    {rankGroups.map(([rankName]) => (
                                        <TabsTrigger key={rankName} value={rankName} className="min-w-[120px]">
                                            {rankName}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                                <ScrollBar orientation="horizontal" />
                            </ScrollArea>
                            {rankGroups.map(([rankName, entries]) => {
                                const existingOrders = new Set(entries.map(e => e.order));
                                const newOrderInput = newOrderInputs[rankName] ?? "";
                                const newOrderSelections = Object.entries(pendingSelections[rankName] ?? {})
                                    .filter(([order]) => !existingOrders.has(Number(order)))
                                    .map(([order, rewards]) => ({ order: Number(order), rewards: rewards as number[] }))
                                    .sort((a, b) => a.order - b.order);

                                return (
                                    <TabsContent key={rankName} value={rankName} className="mt-0 flex-1 min-h-0 overflow-hidden">
                                        <ScrollArea className="h-full">
                                            <div className="space-y-4 pr-4 py-2">
                                                {/* Add New Order Section */}
                                                <Card className="border border-blue-200/50 bg-blue-50/50 shadow-sm">
                                                    <CardHeader className="space-y-3">
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
                                                        <CardContent className="space-y-3">
                                                            {newOrderSelections.map(({ order, rewards }) => {
                                                                const selectedRewardIds = rewards;
                                                                return (
                                                                    <div key={order} className="space-y-2 p-3 rounded-lg border border-blue-200/40 bg-background/70">
                                                                        <div className="flex items-center justify-between">
                                                                            <Badge className="bg-blue-500/20 text-blue-700 border-blue-500/40 font-semibold">
                                                                                {t('tournaments.detail.rewards.range.single', { rank: order })}
                                                                            </Badge>
                                                                            <span className="text-xs text-muted-foreground">
                                                                                {rewardsLabels.rewardCount(selectedRewardIds.length)}
                                                                            </span>
                                                                        </div>
                                                                        {isRewardListLoading ? (
                                                                            <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                                                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                                                {dialogLabels.loading}
                                                                            </div>
                                                                        ) : filteredRewardOptions.length === 0 ? (
                                                                            <p className="text-sm text-muted-foreground">{dialogLabels.noResults}</p>
                                                                        ) : (
                                                                            <ScrollArea className="h-48 pr-3">
                                                                                <div className="space-y-2">
                                                                                    {filteredRewardOptions.map((reward) => {
                                                                                        const rewardId = reward.id;
                                                                                        const checkboxId = `reward-new-${rankName}-${order}-${rewardId}`;
                                                                                        const checked = selectedRewardIds.includes(rewardId);
                                                                                        return (
                                                                                            <div
                                                                                                key={rewardId}
                                                                                                className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-2"
                                                                                            >
                                                                                                <Checkbox
                                                                                                    id={checkboxId}
                                                                                                    checked={checked}
                                                                                                    disabled={isSavingRewards}
                                                                                                    onCheckedChange={(state) => {
                                                                                                        if (state === true || state === false) {
                                                                                                            handleToggleReward(rankName, order, rewardId);
                                                                                                        }
                                                                                                    }}
                                                                                                />
                                                                                                <label htmlFor={checkboxId} className="flex flex-col gap-1 text-sm text-foreground cursor-pointer flex-1">
                                                                                                    <span className="font-medium">
                                                                                                        {reward.nameTranslation || reward.nameKey || `#${rewardId}`}
                                                                                                    </span>
                                                                                                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                                                                        <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                                                                                                            {reward.rewardType}
                                                                                                        </Badge>
                                                                                                        <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                                                                                                            {reward.rewardTarget}
                                                                                                        </Badge>
                                                                                                        <span className="font-semibold text-primary">
                                                                                                            {reward.rewardItem}
                                                                                                        </span>
                                                                                                    </div>
                                                                                                </label>
                                                                                            </div>
                                                                                        );
                                                                                    })}
                                                                                </div>
                                                                                <ScrollBar orientation="vertical" />
                                                                            </ScrollArea>
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

                                                    return (
                                                        <Card
                                                            key={entry.id}
                                                            className="border border-amber-200/50 bg-background/90 shadow-sm"
                                                        >
                                                            <CardHeader className="space-y-2">
                                                                <div className="flex flex-wrap items-center justify-between gap-3">
                                                                    <div className="flex items-center gap-2">
                                                                        <Badge className="bg-primary/15 text-primary border-primary/30 font-semibold uppercase tracking-wide">
                                                                            {rangeLabel}
                                                                        </Badge>
                                                                    </div>
                                                                    <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                                        {rewardsLabels.rewardCount(selectedRewardIds.length)}
                                                                    </span>
                                                                </div>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {selectedRewardIds.length === 0 ? (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            {messages.noRewardRange}
                                                                        </span>
                                                                    ) : (
                                                                        selectedRewardIds.map((rewardId) => {
                                                                            const reward = rewardOptionsMap.get(rewardId)
                                                                            return (
                                                                                <Badge
                                                                                    key={rewardId}
                                                                                    className="bg-primary/10 text-primary border-primary/30"
                                                                                >
                                                                                    {reward?.nameTranslation || reward?.nameKey || `#${rewardId}`}
                                                                                </Badge>
                                                                            )
                                                                        })
                                                                    )}
                                                                </div>
                                                            </CardHeader>
                                                            <CardContent className="space-y-3">
                                                                {isRewardListLoading ? (
                                                                    <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                        {dialogLabels.loading}
                                                                    </div>
                                                                ) : filteredRewardOptions.length === 0 ? (
                                                                    <p className="text-sm text-muted-foreground">
                                                                        {dialogLabels.noResults}
                                                                    </p>
                                                                ) : (
                                                                    <ScrollArea className="h-64 pr-3">
                                                                        <div className="space-y-2">
                                                                            {filteredRewardOptions.map((reward) => {
                                                                                const rewardId = reward.id
                                                                                const checkboxId = `reward-${rankName}-${entry.order}-${rewardId}`
                                                                                const checked = selectedRewardIds.includes(rewardId)
                                                                                return (
                                                                                    <div
                                                                                        key={rewardId}
                                                                                        className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3"
                                                                                    >
                                                                                        <Checkbox
                                                                                            id={checkboxId}
                                                                                            checked={checked}
                                                                                            disabled={isSavingRewards}
                                                                                            onCheckedChange={(state) => {
                                                                                                if (state === true || state === false) {
                                                                                                    handleToggleReward(rankName, entry.order, rewardId)
                                                                                                }
                                                                                            }}
                                                                                        />
                                                                                        <label
                                                                                            htmlFor={checkboxId}
                                                                                            className="flex flex-col gap-1 text-sm text-foreground cursor-pointer"
                                                                                        >
                                                                                            <span className="font-medium">
                                                                                                {reward.nameTranslation || reward.nameKey || `#${rewardId}`}
                                                                                            </span>
                                                                                            <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                                                                                                <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                                                                                                    {reward.rewardType}
                                                                                                </Badge>
                                                                                                <Badge className="bg-green-500/10 text-green-600 border-green-500/30">
                                                                                                    {reward.rewardTarget}
                                                                                                </Badge>
                                                                                                <span className="font-semibold text-primary">
                                                                                                    {reward.rewardItem}
                                                                                                </span>
                                                                                            </div>
                                                                                        </label>
                                                                                    </div>
                                                                                )
                                                                            })}
                                                                        </div>
                                                                        <ScrollBar orientation="vertical" />
                                                                    </ScrollArea>
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
                <DialogFooter className="flex items-center justify-end gap-2 flex-shrink-0">
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
        </Dialog>
    )
}

export default DialogUpdateRewardSeason

