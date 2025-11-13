import { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@ui/Dialog";
import { ScrollArea, ScrollBar } from "@ui/ScrollArea";
import { Checkbox } from "@ui/Checkbox";
import { Input } from "@ui/Input";
import { Badge } from "@ui/Badge";
import { Button } from "@ui/Button";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { IRewardEntityType } from "@models/reward/entity";

interface DialogRewardProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    rankName: string;
    order: number;
    rewardOptions: IRewardEntityType[];
    isRewardListLoading: boolean;
    selectedRewardIds: number[];
    onToggleReward: (rewardId: number) => void;
    isSavingRewards: boolean;
    searchPlaceholder?: string;
    loadingLabel?: string;
    noResultsLabel?: string;
}

const DialogReward = ({
    open,
    onOpenChange,
    rankName,
    order,
    rewardOptions,
    isRewardListLoading,
    selectedRewardIds,
    onToggleReward,
    isSavingRewards,
    searchPlaceholder,
    loadingLabel,
    noResultsLabel,
}: DialogRewardProps) => {
    const { t } = useTranslation();
    const [search, setSearch] = useState("");

    const filteredRewardOptions = useMemo(() => {
        const keyword = search.trim().toLowerCase();
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
    }, [rewardOptions, search]);

    const handleClose = () => {
        setSearch("");
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
            <DialogContent className="max-w-3xl max-h-[80vh] flex flex-col overflow-hidden bg-white">
                <DialogHeader>
                    <DialogTitle>
                        {t('tournaments.detail.rewards.dialog.selectRewardsTitle', {
                            defaultValue: 'Chọn rewards',
                            rankName,
                            order
                        })}
                    </DialogTitle>
                    <DialogDescription>
                        {t('tournaments.detail.rewards.dialog.selectRewardsDescription', {
                            defaultValue: 'Tìm kiếm và chọn rewards cho vị trí này'
                        })}
                    </DialogDescription>
                </DialogHeader>
                <div className="flex flex-col flex-1 min-h-0 space-y-4">
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder={searchPlaceholder || t('tournaments.detail.rewards.dialog.searchPlaceholder', { defaultValue: 'Tìm kiếm rewards...' })}
                        className="bg-background border-border"
                        disabled={isRewardListLoading}
                    />
                    <ScrollArea className="flex-1 min-h-0">
                        {isRewardListLoading ? (
                            <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                {loadingLabel || t('tournaments.detail.rewards.dialog.loading', { defaultValue: 'Đang tải...' })}
                            </div>
                        ) : filteredRewardOptions.length === 0 ? (
                            <p className="text-sm text-muted-foreground text-center py-10">
                                {noResultsLabel || t('tournaments.detail.rewards.dialog.noResults', { defaultValue: 'Không tìm thấy kết quả' })}
                            </p>
                        ) : (
                            <div className="space-y-2 pr-4">
                                {filteredRewardOptions.map((reward) => {
                                    const rewardId = reward.id;
                                    const checked = selectedRewardIds.includes(rewardId);
                                    const checkboxId = `reward-select-${rankName}-${order}-${rewardId}`;
                                    return (
                                        <div
                                            key={rewardId}
                                            className="flex items-start gap-3 rounded-lg border border-border/60 bg-background/70 p-3 hover:bg-accent/50 transition-colors"
                                        >
                                            <Checkbox
                                                id={checkboxId}
                                                checked={checked}
                                                disabled={isSavingRewards}
                                                onCheckedChange={(state) => {
                                                    if (state === true || state === false) {
                                                        onToggleReward(rewardId);
                                                    }
                                                }}
                                            />
                                            <label
                                                htmlFor={checkboxId}
                                                className="flex flex-col gap-1 text-sm text-foreground cursor-pointer flex-1"
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
                                    );
                                })}
                            </div>
                        )}
                        <ScrollBar orientation="vertical" />
                    </ScrollArea>
                </div>
                <DialogFooter>
                    <Button
                        onClick={handleClose}
                        disabled={isSavingRewards}
                    >
                        {t('common.close', { defaultValue: 'Đóng' })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default DialogReward;

