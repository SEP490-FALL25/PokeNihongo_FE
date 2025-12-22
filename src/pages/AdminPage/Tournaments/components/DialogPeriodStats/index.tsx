import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Loader2, BarChart3, Users, Target, Trophy, TrendingUp } from "lucide-react"
import { useTranslation } from "react-i18next"
import { useGetDashboardLeaderboardSeasonStatsBySeasonId } from "@hooks/useDashboard"

interface DialogPeriodStatsProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    seasonId: number | undefined
}

export default function DialogPeriodStats({ open, onOpenChange, seasonId }: DialogPeriodStatsProps) {
    const { t } = useTranslation()
    const [selectedPeriod, setSelectedPeriod] = useState<string>("month")

    const { data: seasonStats, isLoading: isLoadingStats } = useGetDashboardLeaderboardSeasonStatsBySeasonId(seasonId, selectedPeriod)

    const messages = {
        loading: t('tournaments.detail.messages.loading'),
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold text-foreground flex items-center gap-2">
                        <BarChart3 className="w-6 h-6 text-primary" />
                        {t('tournaments.detail.periodStats.title')}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 mt-4">
                    {/* Period Selector */}
                    <div className="flex items-center gap-3">
                        <label className="text-sm font-medium text-foreground">
                            {t('tournaments.detail.periodStats.selectPeriod')}:
                        </label>
                        <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                            <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-card border-border">
                                <SelectItem value="day">{t('tournaments.detail.periodStats.periods.day')}</SelectItem>
                                <SelectItem value="week">{t('tournaments.detail.periodStats.periods.week')}</SelectItem>
                                <SelectItem value="month">{t('tournaments.detail.periodStats.periods.month')}</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Loading State */}
                    {isLoadingStats ? (
                        <div className="flex flex-col items-center justify-center py-10 gap-4">
                            <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            <p className="text-sm text-muted-foreground">{messages.loading}</p>
                        </div>
                    ) : !seasonStats?.periodStats || Object.keys(seasonStats.periodStats).length === 0 ? (
                        <p className="text-sm text-muted-foreground py-4 text-center">{t('tournaments.detail.periodStats.noData')}</p>
                    ) : (
                        <div className="space-y-6">
                            {/* Overall Stats Summary */}
                            {seasonStats && (
                                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    <div className="rounded-lg border border-border/50 bg-gradient-to-br from-primary/5 via-background to-background/80 p-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                            <Users className="w-4 h-4" />
                                            {t('tournaments.detail.periodStats.overall.totalParticipants')}
                                        </div>
                                        <p className="text-2xl font-bold text-foreground">{seasonStats.totalParticipants || 0}</p>
                                    </div>
                                    <div className="rounded-lg border border-border/50 bg-gradient-to-br from-emerald-500/5 via-background to-background/80 p-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                            <Target className="w-4 h-4" />
                                            {t('tournaments.detail.periodStats.overall.totalMatches')}
                                        </div>
                                        <p className="text-2xl font-bold text-foreground">{seasonStats.totalMatches || 0}</p>
                                    </div>
                                    <div className="rounded-lg border border-border/50 bg-gradient-to-br from-green-500/5 via-background to-background/80 p-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                            <Trophy className="w-4 h-4" />
                                            {t('tournaments.detail.periodStats.overall.totalMatchesSuccess')}
                                        </div>
                                        <p className="text-2xl font-bold text-foreground">{seasonStats.totalMatchesSuccess || 0}</p>
                                    </div>
                                    <div className="rounded-lg border border-border/50 bg-gradient-to-br from-blue-500/5 via-background to-background/80 p-4">
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                            <TrendingUp className="w-4 h-4" />
                                            {t('tournaments.detail.periodStats.overall.successRate')}
                                        </div>
                                        <p className="text-2xl font-bold text-foreground">
                                            {seasonStats.totalMatches > 0
                                                ? `${Math.round((seasonStats.totalMatchesSuccess / seasonStats.totalMatches) * 100)}%`
                                                : '0%'}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Period Stats Table */}
                            <div className="overflow-x-auto rounded-md border border-border/60">
                                <table className="min-w-full divide-y divide-border/60">
                                    <thead className="bg-muted/40">
                                        <tr>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('tournaments.detail.periodStats.table.period')}
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('tournaments.detail.periodStats.table.participants')}
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('tournaments.detail.periodStats.table.newParticipants')}
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('tournaments.detail.periodStats.table.activeParticipants')}
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('tournaments.detail.periodStats.table.matches')}
                                            </th>
                                            <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                {t('tournaments.detail.periodStats.table.winRate')}
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/40 bg-background/80">
                                        {Object.entries(seasonStats.periodStats || {}).map(([periodKey, periodData]: [string, any]) => (
                                            <tr key={periodKey} className="hover:bg-muted/20 transition-colors">
                                                <td className="px-4 py-3 text-sm font-medium text-foreground">
                                                    {periodKey.includes('_to_')
                                                        ? periodKey.replace('_to_', ' → ')
                                                        : periodKey.includes('-')
                                                            ? periodKey
                                                            : periodKey}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">
                                                    {periodData.participantsInPeriod || 0}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">
                                                    <span className="text-green-600 font-semibold">
                                                        +{periodData.newParticipantsInPeriod || 0}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">
                                                    {periodData.activeParticipantsInPeriod || 0}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">
                                                    {periodData.matchesInPeriod || 0}
                                                </td>
                                                <td className="px-4 py-3 text-sm text-foreground">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="font-semibold text-primary">
                                                            {periodData.winRate || 0}%
                                                        </span>
                                                        <span className="text-xs text-muted-foreground">
                                                            {t('tournaments.detail.periodStats.table.wins')}: {periodData.totalWins || 0} / {t('tournaments.detail.periodStats.table.losses')}: {periodData.totalLosses || 0}
                                                        </span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}

