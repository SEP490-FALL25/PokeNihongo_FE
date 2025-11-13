import { useGetBattleLeaderBoardSeasonDetail } from "@hooks/useBattle"
import { Badge } from "@ui/Badge"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Calendar, CheckCircle2, Clock, Gift, Languages, Loader2, RefreshCcw, Trophy, XCircle } from "lucide-react"
import { useParams } from "react-router-dom"
import { formatDateOnly, formatDateTime } from "@utils/date"
import { BATTLE_STATUS_CONFIG, getStatusBadgeColor, getStatusText } from "@atoms/BadgeStatusColor"

const renderRewardValue = (value: unknown) => {
    if (value === null || value === undefined) return "—"
    return typeof value === "string" || typeof value === "number" ? value : JSON.stringify(value)
}

interface LeaderboardDetailProps {
    leaderboardSeasonId?: number
}

export default function LeaderboardDetail({ leaderboardSeasonId }: LeaderboardDetailProps) {
    const { tournamentId } = useParams<{ tournamentId?: string }>()
    const resolvedId = leaderboardSeasonId ?? (tournamentId ? Number(tournamentId) : undefined)

    if (resolvedId === undefined || Number.isNaN(resolvedId)) {
        return (
            <Card className="bg-card border-border shadow-md">
                <CardContent className="py-8">
                    <div className="flex flex-col items-center gap-3 text-muted-foreground">
                        <Trophy className="w-8 h-8" />
                        <p className="font-medium">Không tìm thấy thông tin mùa giải hợp lệ.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const { data: season, isLoading, error } = useGetBattleLeaderBoardSeasonDetail(resolvedId)

    if (isLoading) {
        return (
            <Card className="bg-card border-border shadow-md">
                <CardContent className="py-10 flex flex-col items-center gap-4">
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                    <p className="text-muted-foreground">Đang tải chi tiết mùa giải...</p>
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
                        <p className="font-medium">Không thể tải chi tiết mùa giải. Vui lòng thử lại sau.</p>
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
                        <p className="font-medium">Không có dữ liệu mùa giải.</p>
                    </div>
                </CardContent>
            </Card>
        )
    }

    const nameTranslations = Array.isArray(season.nameTranslations) ? season.nameTranslations : []
    const sortedRewards = Array.isArray(season.seasonRankRewards)
        ? [...season.seasonRankRewards].sort((a, b) => a.order - b.order)
        : []

    return (
        <div className="space-y-6">
            <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <CardTitle className="text-2xl font-bold text-foreground">
                                {season.nameTranslation || season.nameKey}
                            </CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Mã mùa: <span className="font-medium text-foreground">{season.nameKey}</span>
                            </p>
                        </div>
                        <div className="flex flex-wrap gap-2 justify-end">
                            <Badge className={`${getStatusBadgeColor(season.status, BATTLE_STATUS_CONFIG)} border`}>
                                {getStatusText(season.status, BATTLE_STATUS_CONFIG)}
                            </Badge>
                            <Badge className={`flex items-center gap-1 border ${season.hasOpened ? "bg-green-500/10 text-green-600 border-green-500/30" : "bg-orange-500/10 text-orange-600 border-orange-500/30"}`}>
                                {season.hasOpened ? (
                                    <>
                                        <CheckCircle2 className="w-3 h-3" />
                                        Đã mở
                                    </>
                                ) : (
                                    <>
                                        <XCircle className="w-3 h-3" />
                                        Chưa mở
                                    </>
                                )}
                            </Badge>
                            <Badge className={`flex items-center gap-1 border ${season.enablePrecreate ? "bg-blue-500/10 text-blue-600 border-blue-500/30" : "bg-muted text-muted-foreground border-border/60"}`}>
                                <Calendar className="w-3 h-3" />
                                {season.enablePrecreate ? `Mở sớm ${season.precreateBeforeEndDays} ngày` : "Không mở sớm"}
                            </Badge>
                            <Badge className={`flex items-center gap-1 border ${season.isRandomItemAgain ? "bg-purple-500/10 text-purple-600 border-purple-500/30" : "bg-muted text-muted-foreground border-border/60"}`}>
                                <RefreshCcw className="w-3 h-3" />
                                {season.isRandomItemAgain ? "Random lại phần thưởng" : "Giữ nguyên phần thưởng"}
                            </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                        <div className="p-4 rounded-lg border border-border/60 bg-muted/20">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="w-4 h-4" />
                                Thời gian diễn ra
                            </div>
                            <p className="mt-2 text-base font-semibold text-foreground">
                                {formatDateOnly(season.startDate)} - {formatDateOnly(season.endDate)}
                            </p>
                        </div>
                        <div className="p-4 rounded-lg border border-border/60 bg-muted/20">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="w-4 h-4" />
                                Thời gian tạo & cập nhật
                            </div>
                            <p className="mt-2 text-base font-semibold text-foreground">
                                Tạo: {formatDateTime(season.createdAt)}
                            </p>
                            <p className="text-sm text-muted-foreground mt-1">
                                Cập nhật: {formatDateTime(season.updatedAt)}
                            </p>
                        </div>
                    </div>

                    {nameTranslations.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Languages className="w-4 h-4 text-primary" />
                                </div>
                                <h3 className="text-lg font-semibold text-foreground">Tên đa ngôn ngữ</h3>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {nameTranslations.map((translation) => (
                                    <Badge
                                        key={translation.key}
                                        className="border-border/60 bg-background text-foreground shadow-sm px-3 py-1 flex items-center gap-2"
                                    >
                                        <span className="uppercase text-xs font-semibold text-muted-foreground">{translation.key}</span>
                                        <span className="text-sm font-medium">{translation.value}</span>
                                    </Badge>
                                ))}
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="bg-card border-border shadow-md">
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Gift className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-bold text-foreground">Phần thưởng theo hạng</CardTitle>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    {sortedRewards.length === 0 ? (
                        <div className="text-sm text-muted-foreground">Chưa thiết lập phần thưởng cho mùa giải này.</div>
                    ) : (
                        sortedRewards.map((rank) => {
                            const rewards = Array.isArray(rank.rewards) ? rank.rewards : []
                            return (
                                <Card key={rank.id} className="border border-border/70 bg-muted/20 shadow-sm">
                                    <CardHeader className="pb-3">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <Badge className="bg-primary/15 text-primary border-primary/30">
                                                    Hạng {rank.rankName}
                                                </Badge>
                                                <span className="text-sm text-muted-foreground">Thứ tự: {rank.order}</span>
                                            </div>
                                            <Badge className="bg-yellow-500/10 text-yellow-600 border-yellow-500/30 flex items-center gap-1">
                                                <Trophy className="w-3 h-3" />
                                                {rewards.length} phần thưởng
                                            </Badge>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {rewards.map((reward) => (
                                            <div key={reward.id} className="p-3 rounded-lg border border-border/60 bg-background flex flex-col gap-2">
                                                <div className="flex flex-wrap items-center gap-2 text-sm">
                                                    <Badge className="bg-primary/10 text-primary border-primary/30">
                                                        {renderRewardValue(reward.rewardType)}
                                                    </Badge>
                                                    <Badge className="bg-blue-500/10 text-blue-600 border-blue-500/30">
                                                        Mục tiêu: {renderRewardValue(reward.rewardTarget)}
                                                    </Badge>
                                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30">
                                                        Giá trị: {renderRewardValue(reward.rewardItem)}
                                                    </Badge>
                                                </div>
                                                {reward.nameTranslation && (
                                                    <p className="text-sm text-muted-foreground">
                                                        Ghi chú: <span className="text-foreground font-medium">{reward.nameTranslation}</span>
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )
                        })
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
