import { useMemo, useState } from "react"
import { useGetBattleLeaderBoardSeasonDetail } from "@hooks/useBattle"
import { Badge } from "@ui/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Button } from "@ui/Button"
import { Award, Calendar, CheckCircle2, Clock, Gift, Languages, Loader2, RefreshCcw, Trophy, XCircle } from "lucide-react"
import { useParams } from "react-router-dom"
import { formatDateOnly, formatDateTime } from "@utils/date"
import { BATTLE_STATUS_CONFIG, getStatusBadgeColor, getStatusText } from "@atoms/BadgeStatusColor"
import HeaderAdmin from "@organisms/Header/Admin"
import { useTranslation } from "react-i18next"
import DialogUpdateRewardSeason from "../DialogUpdateRewardSeason"

type SeasonRankRewardEntry = {
    id: number
    order: number | null | undefined
}

const getRewardOrderValue = (value: SeasonRankRewardEntry["order"]) => value ?? Number.MAX_SAFE_INTEGER

const compareSeasonRankRewards = <T extends SeasonRankRewardEntry>(a: T, b: T) => {
    const diff = getRewardOrderValue(a.order) - getRewardOrderValue(b.order)
    if (diff !== 0) return diff
    return a.id - b.id
}

const renderRewardValue = (value: unknown) => {
    if (value === null || value === undefined) return "—"
    return typeof value === "string" || typeof value === "number" ? value : JSON.stringify(value)
}

interface LeaderboardDetailProps {
    leaderboardSeasonId?: number
}

export default function LeaderboardDetail({ leaderboardSeasonId }: LeaderboardDetailProps) {
    const { t } = useTranslation();
    const { tournamentId } = useParams<{ tournamentId?: string }>()
    const resolvedId = leaderboardSeasonId ?? (tournamentId ? Number(tournamentId) : undefined)

    const messages = {
        invalidSeason: t('tournaments.detail.messages.invalidSeason'),
        loading: t('tournaments.detail.messages.loading'),
        loadError: t('tournaments.detail.messages.loadError'),
        noData: t('tournaments.detail.messages.noData'),
        noTimeline: t('tournaments.detail.messages.noTimeline'),
        noRewardStats: t('tournaments.detail.messages.noRewardStats'),
        noRewards: t('tournaments.detail.messages.noRewards'),
        noRewardRange: t('tournaments.detail.messages.noRewardRange'),
        noTranslations: t('tournaments.detail.messages.noTranslations'),
    }

    const commonTexts = {
        yes: t('tournaments.detail.common.yes'),
        no: t('tournaments.detail.common.no'),
        notAvailable: t('tournaments.detail.common.notAvailable'),
    }

    const summaryLabels = {
        rankGroups: t('tournaments.detail.summary.rankGroups'),
        rewardBuckets: t('tournaments.detail.summary.rewardBuckets'),
        rewardItems: t('tournaments.detail.summary.rewardItems'),
        duration: t('tournaments.detail.summary.duration'),
        openStatus: {
            label: t('tournaments.detail.summary.openStatus.label'),
            opened: t('tournaments.detail.summary.openStatus.opened'),
            closed: t('tournaments.detail.summary.openStatus.closed'),
        },
    }

    const timelineLabels = {
        title: t('tournaments.detail.timeline.title'),
        start: t('tournaments.detail.timeline.start'),
        end: t('tournaments.detail.timeline.end'),
        created: t('tournaments.detail.timeline.created'),
        updated: t('tournaments.detail.timeline.updated'),
    }

    const overviewLabels = {
        duration: t('tournaments.detail.overview.duration'),
        createdAt: t('tournaments.detail.overview.createdAt'),
        updatedAt: t('tournaments.detail.overview.updatedAt'),
        createdBy: t('tournaments.detail.overview.createdBy'),
        updatedBy: t('tournaments.detail.overview.updatedBy'),
    }

    const metadataLabels = {
        title: t('tournaments.detail.metadata.title'),
        seasonId: t('tournaments.detail.metadata.seasonId'),
        seasonKey: t('tournaments.detail.metadata.seasonKey'),
        enablePrecreate: t('tournaments.detail.metadata.enablePrecreate'),
        precreateDays: t('tournaments.detail.metadata.precreateDays'),
        randomAgain: t('tournaments.detail.metadata.randomAgain'),
        hasOpened: t('tournaments.detail.metadata.hasOpened'),
    }

    const [isRewardDialogOpen, setIsRewardDialogOpen] = useState(false)

    const rewardOverviewLabels = {
        title: t('tournaments.detail.rewardOverview.title'),
        rankGroups: t('tournaments.detail.rewardOverview.rankGroups'),
        rewardItems: t('tournaments.detail.rewardOverview.rewardItems'),
        typeCount: (count: number) => t('tournaments.detail.rewardOverview.typeCount', { count }),
    }

    const translationLabels = {
        title: t('tournaments.detail.translations.title'),
        empty: messages.noTranslations,
        language: t('tournaments.detail.translations.language'),
        value: t('tournaments.detail.translations.value'),
    }

    const rewardsLabels = {
        title: t('tournaments.detail.rewards.title'),
        empty: messages.noRewardStats,
        groupCount: (count: number) => t('tournaments.detail.rewards.groupCount', { count }),
        rewardCount: (count: number) => t('tournaments.detail.rewards.rewardCount', { count }),
        table: {
            type: t('tournaments.detail.rewards.table.type'),
            target: t('tournaments.detail.rewards.table.target'),
            value: t('tournaments.detail.rewards.table.value'),
            note: t('tournaments.detail.rewards.table.note'),
        },
    }

    if (resolvedId === undefined || Number.isNaN(resolvedId)) {
        return (
            <Card className="bg-card border-border shadow-md">
                <CardContent className="py-8">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Trophy className="w-8 h-8" />
                        <p className="font-medium">{messages.invalidSeason}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const { data: season, isLoading, error } = useGetBattleLeaderBoardSeasonDetail(resolvedId)

    const nameTranslations = useMemo(
        () => (Array.isArray(season?.nameTranslations) ? season!.nameTranslations : []),
        [season]
    )

    const sortedRewards = useMemo(() => {
        if (!Array.isArray(season?.seasonRankRewards)) return []
        return [...season.seasonRankRewards].sort(compareSeasonRankRewards)
    }, [season])

    const rankGroups = useMemo(() => {
        const map = new Map<string, typeof sortedRewards>()
        sortedRewards.forEach((reward) => {
            const list = map.get(reward.rankName)
            if (list) {
                list.push(reward)
            } else {
                map.set(reward.rankName, [reward])
            }
        })
        return Array.from(map.entries()).map(([rankName, list]) => [
            rankName,
            [...list].sort(compareSeasonRankRewards),
        ]) as Array<[string, typeof sortedRewards]>
    }, [sortedRewards])

    const totalRankGroups = rankGroups.length
    const totalRewardBuckets = sortedRewards.length
    const totalRewardItems = useMemo(
        () =>
            sortedRewards.reduce(
                (acc, rank) => acc + (Array.isArray(rank.rewards) ? rank.rewards.length : 0),
                0
            ),
        [sortedRewards]
    )

    const rewardTypeSummary = useMemo(() => {
        const typeMap = new Map<string, number>()
        sortedRewards.forEach((rank) => {
            if (!Array.isArray(rank.rewards)) return
            rank.rewards.forEach((reward) => {
                const key = String(reward.rewardType)
                typeMap.set(key, (typeMap.get(key) ?? 0) + 1)
            })
        })
        return Array.from(typeMap.entries()).map(([type, count]) => ({ type, count }))
    }, [sortedRewards])

    const durationDays = useMemo(() => {
        if (!season?.startDate || !season?.endDate) return null
        const start = new Date(season.startDate).getTime()
        const end = new Date(season.endDate).getTime()
        if (Number.isNaN(start) || Number.isNaN(end)) return null
        return Math.max(1, Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1)
    }, [season])

    const timelineItems = useMemo(() => {
        if (!season) return []
        return [
            season.startDate && {
                label: timelineLabels.start,
                value: formatDateTime(season.startDate),
                icon: Calendar,
            },
            season.endDate && {
                label: timelineLabels.end,
                value: formatDateTime(season.endDate),
                icon: Calendar,
            },
            season.createdAt && {
                label: timelineLabels.created,
                value: formatDateTime(season.createdAt),
                icon: Clock,
            },
            season.updatedAt && {
                label: timelineLabels.updated,
                value: formatDateTime(season.updatedAt),
                icon: RefreshCcw,
            },
        ].filter(Boolean) as Array<{ label: string; value: string; icon: typeof Calendar }>
    }, [season, timelineLabels])

    if (isLoading) {
        return (
            <Card className="bg-card border-border shadow-md">
                <CardContent className="py-10 flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">{messages.loading}</p>
                </CardContent>
            </Card>
        )
    }

    if (error) {
        return (
            <Card className="bg-card border-border shadow-md">
                <CardContent className="py-8">
                    <div className="flex flex-col items-center gap-3 text-destructive">
                        <Trophy className="w-8 h-8" />
                        <p className="font-medium">{messages.loadError}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    if (!season) {
        return (
            <Card className="bg-card border-border shadow-md">
                <CardContent className="py-8">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Trophy className="w-8 h-8" />
                        <p className="font-medium">{messages.noData}</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const summaryStats = [
        {
            label: summaryLabels.rankGroups,
            value: totalRankGroups.toString(),
            icon: Trophy,
        },
        {
            label: summaryLabels.rewardBuckets,
            value: totalRewardBuckets.toString(),
            icon: Gift,
        },
        {
            label: summaryLabels.rewardItems,
            value: totalRewardItems.toString(),
            icon: Award,
        },
        {
            label: summaryLabels.duration,
            value: durationDays
                ? t('tournaments.detail.summary.durationValue', { count: durationDays })
                : commonTexts.notAvailable,
            icon: Calendar,
        },
        {
            label: summaryLabels.openStatus.label,
            value: season.hasOpened ? summaryLabels.openStatus.opened : summaryLabels.openStatus.closed,
            icon: season.hasOpened ? CheckCircle2 : XCircle,
            highlightClass: season.hasOpened ? "text-green-600" : "text-orange-500",
        },
    ]

    const statusChips = [
        {
            key: "status",
            content: (
                <Badge className={`${getStatusBadgeColor(season.status, BATTLE_STATUS_CONFIG)} border`}>
                    {getStatusText(season.status, BATTLE_STATUS_CONFIG)}
                </Badge>
            ),
        },
        {
            key: "hasOpened",
            content: (
                <Badge
                    className={`flex items-center gap-1 border ${season.hasOpened
                        ? "bg-green-500/10 text-green-600 border-green-500/30"
                        : "bg-orange-500/10 text-orange-600 border-orange-500/30"
                        }`}
                >
                    {season.hasOpened ? (
                        <>
                            <CheckCircle2 className="w-3 h-3" />
                            {t('tournaments.detail.chips.hasOpened.opened')}
                        </>
                    ) : (
                        <>
                            <XCircle className="w-3 h-3" />
                            {t('tournaments.detail.chips.hasOpened.closed')}
                        </>
                    )}
                </Badge>
            ),
        },
        {
            key: "precreate",
            content: (
                <Badge
                    className={`flex items-center gap-1 border ${season.enablePrecreate
                        ? "bg-blue-500/10 text-blue-600 border-blue-500/30"
                        : "bg-muted text-muted-foreground border-border/60"
                        }`}
                >
                    <Calendar className="w-3 h-3" />
                    {season.enablePrecreate
                        ? t('tournaments.detail.chips.precreate.enabled', { days: season.precreateBeforeEndDays })
                        : t('tournaments.detail.chips.precreate.disabled')}
                </Badge>
            ),
        },
        {
            key: "random-reward",
            content: (
                <Badge
                    className={`flex items-center gap-1 border ${season.isRandomItemAgain
                        ? "bg-purple-500/10 text-purple-600 border-purple-500/30"
                        : "bg-muted text-muted-foreground border-border/60"
                        }`}
                >
                    <RefreshCcw className="w-3 h-3" />
                    {season.isRandomItemAgain
                        ? t('tournaments.detail.chips.randomReward.enabled')
                        : t('tournaments.detail.chips.randomReward.disabled')}
                </Badge>
            ),
        },
    ]

    const overviewItems = [
        {
            label: overviewLabels.duration,
            value: `${formatDateOnly(season.startDate)} - ${formatDateOnly(season.endDate)}`,
            icon: Calendar,
        },
        {
            label: overviewLabels.createdAt,
            value: formatDateTime(season.createdAt),
            icon: Clock,
        },
        {
            label: overviewLabels.updatedAt,
            value: formatDateTime(season.updatedAt),
            icon: RefreshCcw,
        },
        {
            label: overviewLabels.createdBy,
            value: season.createdById !== null && season.createdById !== undefined
                ? season.createdById.toString()
                : commonTexts.notAvailable,
            icon: Trophy,
        },
        {
            label: overviewLabels.updatedBy,
            value: season.updatedById !== null && season.updatedById !== undefined
                ? season.updatedById.toString()
                : commonTexts.notAvailable,
            icon: Trophy,
        },
    ]

    const metadataItems = [
        { label: metadataLabels.seasonId, value: season.id?.toString() ?? commonTexts.notAvailable },
        { label: metadataLabels.seasonKey, value: season.nameKey ?? commonTexts.notAvailable },
        { label: metadataLabels.enablePrecreate, value: season.enablePrecreate ? commonTexts.yes : commonTexts.no },
        {
            label: metadataLabels.precreateDays,
            value: season.enablePrecreate
                ? t('tournaments.detail.metadata.daysValue', { count: season.precreateBeforeEndDays })
                : commonTexts.notAvailable,
        },
        { label: metadataLabels.randomAgain, value: season.isRandomItemAgain ? commonTexts.yes : commonTexts.no },
        { label: metadataLabels.hasOpened, value: season.hasOpened ? commonTexts.yes : commonTexts.no },
    ]

    const formatRankRange = (start?: number | null, nextStart?: number | null) => {
        if (start === null || start === undefined) {
            return t('tournaments.detail.rewards.range.default')
        }
        if (nextStart === null || nextStart === undefined) {
            return t('tournaments.detail.rewards.range.infinite', { start })
        }
        const end = nextStart - 1
        if (end <= start) {
            return t('tournaments.detail.rewards.range.single', { rank: start })
        }
        return t('tournaments.detail.rewards.range.range', { start, end })
    }

    const isStandalonePage = leaderboardSeasonId === undefined
    const containerClassName = isStandalonePage ? "mt-24 p-8 space-y-8" : "space-y-8"

    const content = (
        <div className={containerClassName}>
            <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                <CardHeader className="space-y-3">
                    <div className="flex flex-col gap-2">
                        <CardTitle className="text-2xl font-bold text-foreground">
                            {season.nameTranslation || season.nameKey}
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {t('tournaments.detail.labels.seasonCode', { code: season.nameKey })}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {statusChips.map((chip) => (
                            <span key={chip.key}>{chip.content}</span>
                        ))}
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
                        {summaryStats.map((stat) => (
                            <div
                                key={stat.label}
                                className="rounded-xl border border-border/40 bg-gradient-to-br from-primary/5 via-background to-background/70 p-4 shadow-sm hover:shadow-primary/40 transition-shadow"
                            >
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-muted-foreground">{stat.label}</span>
                                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                                        <stat.icon className="w-4 h-4" />
                                    </div>
                                </div>
                                <p className={`mt-3 text-2xl font-semibold text-foreground ${stat.highlightClass ?? ""}`}>
                                    {stat.value}
                                </p>
                            </div>
                        ))}
                    </div>
                    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        {overviewItems.map((item) => (
                            <div
                                key={item.label}
                                className="p-4 rounded-lg border border-border/50 bg-gradient-to-br from-muted/60 via-card to-background/80 flex flex-col gap-1"
                            >
                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                    <item.icon className="w-4 h-4" />
                                    {item.label}
                                </div>
                                <p className="text-base font-semibold text-foreground">{item.value}</p>
                            </div>
                        ))}
                    </div>
                    <Card className="border border-border/60 bg-background shadow-none">
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base font-semibold text-foreground">
                                {metadataLabels.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-3 sm:grid-cols-2">
                                {metadataItems.map((item) => (
                                    <div key={item.label} className="flex flex-col gap-1 rounded-lg border border-border/50 p-3">
                                        <span className="text-xs uppercase text-muted-foreground tracking-wide">{item.label}</span>
                                        <span className="text-sm font-medium text-foreground">{item.value ?? commonTexts.notAvailable}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
                <Card className="border border-primary/20 bg-gradient-to-br from-primary/10 via-background to-background shadow-lg shadow-primary/10">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Calendar className="w-5 h-5 text-primary" />
                            {timelineLabels.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {timelineItems.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{messages.noTimeline}</p>
                        ) : (
                            <ol className="relative border-s border-border/60 ps-5 space-y-4">
                                {timelineItems.map((item) => (
                                    <li key={item.label} className="space-y-1">
                                        <span className="absolute -start-2.5 flex h-5 w-5 items-center justify-center rounded-full border border-border bg-background">
                                            <item.icon className="h-3 w-3 text-primary" />
                                        </span>
                                        <p className="text-xs uppercase tracking-wide text-muted-foreground">
                                            {item.label}
                                        </p>
                                        <p className="text-sm font-semibold text-foreground">{item.value}</p>
                                    </li>
                                ))}
                            </ol>
                        )}
                    </CardContent>
                </Card>

                <Card className="border border-emerald-200/50 bg-gradient-to-br from-emerald-500/10 via-background to-background shadow-lg shadow-emerald-200/20">
                    <CardHeader className="pb-3">
                        <CardTitle className="text-lg font-semibold text-foreground flex items-center gap-2">
                            <Gift className="w-5 h-5 text-primary" />
                            {rewardOverviewLabels.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex flex-wrap gap-3">
                            <div className="rounded-lg border border-border/60 bg-primary/5 px-4 py-3">
                                <p className="text-xs uppercase text-muted-foreground tracking-wide">
                                    {rewardOverviewLabels.rankGroups}
                                </p>
                                <p className="text-lg font-semibold text-primary">{totalRankGroups}</p>
                            </div>
                            <div className="rounded-lg border border-border/60 bg-emerald-500/5 px-4 py-3">
                                <p className="text-xs uppercase text-muted-foreground tracking-wide">
                                    {rewardOverviewLabels.rewardItems}
                                </p>
                                <p className="text-lg font-semibold text-emerald-600">{totalRewardItems}</p>
                            </div>
                        </div>
                        {rewardTypeSummary.length === 0 ? (
                            <p className="text-sm text-muted-foreground">{messages.noRewardStats}</p>
                        ) : (
                            <div className="space-y-3">
                                {rewardTypeSummary.map((summary) => (
                                    <div
                                        key={summary.type}
                                        className="flex items-center justify-between rounded-lg border border-border/50 bg-background px-4 py-3"
                                    >
                                        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                                            <span className="inline-flex h-2 w-2 rounded-full bg-primary" />
                                            {summary.type}
                                        </div>
                                        <span className="text-sm text-muted-foreground">
                                            {rewardOverviewLabels.typeCount(summary.count)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Card className="border border-blue-300/40 bg-gradient-to-br from-blue-500/10 via-background to-background shadow-lg shadow-blue-300/20">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Languages className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-bold text-foreground">
                            {translationLabels.title}
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    {nameTranslations.length === 0 ? (
                        <p className="text-sm text-muted-foreground">{translationLabels.empty}</p>
                    ) : (
                        <div className="overflow-x-auto rounded-md border border-border/60">
                            <table className="min-w-full divide-y divide-border/60">
                                <thead className="bg-muted/40">
                                    <tr>
                                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {translationLabels.language}
                                        </th>
                                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                            {translationLabels.value}
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border/40 bg-background/80">
                                    {nameTranslations.map((translation) => (
                                        <tr key={translation.key}>
                                            <td className="px-4 py-2 text-sm font-medium uppercase text-muted-foreground">
                                                {translation.key}
                                            </td>
                                            <td className="px-4 py-2 text-sm text-foreground">
                                                {translation.value}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border border-amber-300/50 bg-gradient-to-br from-amber-500/10 via-background to-background shadow-lg shadow-amber-200/30">
                <CardHeader>
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Gift className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-xl font-bold text-foreground">
                                {rewardsLabels.title}
                            </CardTitle>
                        </div>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setIsRewardDialogOpen(true)}
                            className="h-9"
                        >
                            {t('tournaments.detail.rewards.editButton')}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    {rankGroups.length === 0 ? (
                        <div className="text-sm text-muted-foreground">{messages.noRewards}</div>
                    ) : (
                        rankGroups.map(([rankName, entries]) => {
                            const totalRewardsForRank = entries.reduce(
                                (acc, entry) => acc + (Array.isArray(entry.rewards) ? entry.rewards.length : 0),
                                0
                            )
                            return (
                                <div
                                    key={rankName}
                                    className="rounded-2xl border border-amber-300/40 bg-gradient-to-br from-amber-400/5 via-background to-background p-5 space-y-4 shadow-sm hover:shadow-amber-200/30 transition-shadow"
                                >
                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                        <div className="flex items-center gap-2">
                                            <Badge className="bg-primary/15 text-primary border-primary/30 uppercase tracking-wide">
                                                {rankName}
                                            </Badge>
                                            <span className="text-sm text-muted-foreground">
                                                {rewardsLabels.groupCount(entries.length)}
                                            </span>
                                        </div>
                                        <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 flex items-center gap-1">
                                            <Trophy className="w-3 h-3" />
                                            {rewardsLabels.rewardCount(totalRewardsForRank)}
                                        </Badge>
                                    </div>
                                    <div className="space-y-3">
                                        {entries.map((entry, index) => {
                                            const nextEntry = entries[index + 1]
                                            const rangeLabel = formatRankRange(entry.order, nextEntry?.order ?? null)
                                            const entryRewards = Array.isArray(entry.rewards) ? entry.rewards : []

                                            return (
                                                <div
                                                    key={entry.id}
                                                    className="rounded-xl border border-amber-200/40 bg-background/70 p-4 space-y-3"
                                                >
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div className="flex items-center gap-2">
                                                            <Badge className="bg-amber-500/20 text-amber-700 border-amber-500/40 font-semibold">
                                                                {rangeLabel}
                                                            </Badge>
                                                        </div>
                                                        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                                            {rewardsLabels.rewardCount(entryRewards.length)}
                                                        </span>
                                                    </div>

                                                    {entryRewards.length === 0 ? (
                                                        <p className="text-sm text-muted-foreground">
                                                            {messages.noRewardRange}
                                                        </p>
                                                    ) : (
                                                        <div className="overflow-x-auto">
                                                            <table className="min-w-full divide-y divide-border/40">
                                                                <thead className="bg-background/80">
                                                                    <tr>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                                            {rewardsLabels.table.type}
                                                                        </th>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                                            {rewardsLabels.table.target}
                                                                        </th>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                                            {rewardsLabels.table.value}
                                                                        </th>
                                                                        <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                                                            {rewardsLabels.table.note}
                                                                        </th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-border/40">
                                                                    {entryRewards.map((reward) => (
                                                                        <tr key={reward.id} className="bg-background/60">
                                                                            <td className="px-4 py-2 text-sm text-foreground font-medium">
                                                                                {renderRewardValue(reward.rewardType)}
                                                                            </td>
                                                                            <td className="px-4 py-2 text-sm text-foreground">
                                                                                {renderRewardValue(reward.rewardTarget)}
                                                                            </td>
                                                                            <td className="px-4 py-2 text-sm text-primary font-semibold">
                                                                                {renderRewardValue(reward.rewardItem)}
                                                                            </td>
                                                                            <td className="px-4 py-2 text-sm text-muted-foreground">
                                                                                {reward.nameTranslation || commonTexts.notAvailable}
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    )

    const rewardDialog = (
        <DialogUpdateRewardSeason
            open={isRewardDialogOpen}
            onOpenChange={setIsRewardDialogOpen}
            seasonId={season.id}
            rankGroups={rankGroups}
        />
    )

    if (isStandalonePage) {
        return (
            <>
                <HeaderAdmin title={t('tournaments.title')} description={t('tournaments.description')} />
                {content}
                {rewardDialog}
            </>
        )
    }

    return (
        <>
            {content}
            {rewardDialog}
        </>
    )
}
