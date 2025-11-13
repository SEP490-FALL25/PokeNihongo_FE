import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@ui/Card"
import { Badge } from "@ui/Badge"
import { Button } from "@ui/Button"
import { Input } from "@ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Trophy, Calendar, Users, Award, Search, Edit, Trash2, Loader2, Clock, CheckCircle2, X, Plus } from "lucide-react"
import HeaderAdmin from "@organisms/Header/Admin"
import { useTranslation } from "react-i18next"
import { useBattleListLeaderBoardSeason } from "@hooks/useBattle"
import PaginationControls from "@ui/PaginationControls"
import { BATTLE } from "@constants/battle"
import CustomDatePicker from "@ui/DatePicker"
import CreateSeason from "./components/CreateSeason"
import DialogDeleteSeason from "./components/DialogDeleteSeason"
import { ROUTES } from "@constants/route"
import { useNavigate } from "react-router-dom"
import { formatDateOnly } from "@utils/date"
import { BATTLE_STATUS_CONFIG, getStatusBadgeColor, getStatusText } from "@atoms/BadgeStatusColor"

export default function TournamentManagement() {
    const { t } = useTranslation()
    const router = useNavigate()

    const [searchQuery, setSearchQuery] = useState<string>("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState<string>("")
    const [selectedStatus, setSelectedStatus] = useState<string>("all")
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null)
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null)
    const [filterHasOpened, setFilterHasOpened] = useState<"all" | "opened" | "notOpened">("all")
    const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize, setPageSize] = useState<number>(15)

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
            setCurrentPage(1) // Reset to first page when search changes
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Format dates for API (YYYY-MM-DD format)
    const formatDateForAPI = (date: Date | null) => {
        if (!date) return undefined
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
    }

    // Build query params
    const queryParams = useMemo(() => {
        const params: any = {
            currentPage,
            pageSize,
        }

        if (debouncedSearchQuery) {
            params.nameTranslation = debouncedSearchQuery
        }

        if (selectedStatus !== "all") {
            params.status = selectedStatus
        }

        if (filterStartDate) {
            params.startDate = formatDateForAPI(filterStartDate)
        }

        if (filterEndDate) {
            params.endDate = formatDateForAPI(filterEndDate)
        }

        if (filterHasOpened === "opened") {
            params.hasOpened = true
        } else if (filterHasOpened === "notOpened") {
            params.hasOpened = false
        }

        return params
    }, [currentPage, pageSize, debouncedSearchQuery, selectedStatus, filterStartDate, filterEndDate, filterHasOpened])

    // Fetch tournaments data
    const { data: tournaments, pagination, isLoading, error } = useBattleListLeaderBoardSeason(queryParams)

    // Ensure tournaments is always an array
    const tournamentsList = Array.isArray(tournaments) ? tournaments : []

    // Stats calculations
    const stats = useMemo(() => {
        const totalTournaments = pagination?.totalItem || 0
        const activeTournaments = tournamentsList.filter((t: any) => t.status === BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.ACTIVE).length

        const totalParticipants = 0
        const monthlyRewards = 0

        return [
            {
                label: "Tổng giải đấu",
                value: totalTournaments.toString(),
                icon: Trophy,
                gradient: "from-yellow-500/20 to-amber-500/20",
                iconBg: "bg-yellow-500/10",
                iconColor: "text-yellow-500",
                borderColor: "border-yellow-500/20"
            },
            {
                label: "Đang diễn ra",
                value: activeTournaments.toString(),
                icon: Calendar,
                gradient: "from-blue-500/20 to-cyan-500/20",
                iconBg: "bg-blue-500/10",
                iconColor: "text-blue-500",
                borderColor: "border-blue-500/20"
            },
            {
                label: "Tổng người tham gia",
                value: totalParticipants.toString() || "0",
                icon: Users,
                gradient: "from-green-500/20 to-emerald-500/20",
                iconBg: "bg-green-500/10",
                iconColor: "text-green-500",
                borderColor: "border-green-500/20"
            },
            {
                label: "Giải thưởng tháng này",
                value: monthlyRewards.toString() || "0",
                icon: Award,
                gradient: "from-purple-500/20 to-pink-500/20",
                iconBg: "bg-purple-500/10",
                iconColor: "text-purple-500",
                borderColor: "border-purple-500/20"
            },
        ]
    }, [tournamentsList, pagination])

    // Handle clear filters
    const handleClearFilters = () => {
        setFilterStartDate(null)
        setFilterEndDate(null)
        setFilterHasOpened("all")
        setSelectedStatus("all")
        setSearchQuery("")
        setCurrentPage(1)
    }

    const hasActiveFilters =
        !!filterStartDate ||
        !!filterEndDate ||
        filterHasOpened !== "all" ||
        selectedStatus !== "all" ||
        !!searchQuery


    /**
     * Delete Candidate
     */
    const [deleteCandidate, setDeleteCandidate] = useState<{ id: number; name: string } | null>(null)
    //------------------------End------------------------//

    return (

        <>
            <HeaderAdmin title={t('tournaments.title')} description={t('tournaments.description')} />
            <div className="mt-24 p-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    {stats.map((stat) => (
                        <Card
                            key={stat.label}
                            className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} border ${stat.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                            <CardHeader className="pb-3">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-foreground/90">{stat.label}</CardTitle>
                                    <div className={`p-2 rounded-lg ${stat.iconBg} ${stat.iconColor}`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-4xl font-bold text-foreground mb-1">
                                    {stat.value}
                                </div>
                                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Filters */}
                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Trophy className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">Danh sách giải đấu</CardTitle>
                            </div>
                            <Button
                                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg"
                                onClick={() => setShowAddDialog(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tạo giải đấu
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {/* Row 1: Search + Status */}
                            <div className="flex flex-col lg:flex-row gap-4">
                                <div className="flex-1">
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                        Tìm kiếm
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                        <Input
                                            type="text"
                                            placeholder="Tìm kiếm giải đấu..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value)
                                                setCurrentPage(1)
                                            }}
                                            className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                        />
                                    </div>
                                </div>
                                <div className="lg:w-[220px]">
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                        Trạng thái
                                    </label>
                                    <Select
                                        value={selectedStatus}
                                        onValueChange={(value) => {
                                            setSelectedStatus(value)
                                            setCurrentPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-background border-border text-foreground h-11 shadow-sm">
                                            <SelectValue placeholder="Trạng thái" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="all">Tất cả</SelectItem>
                                            <SelectItem value={BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.ACTIVE}>
                                                {getStatusText(BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.ACTIVE, BATTLE_STATUS_CONFIG)}
                                            </SelectItem>
                                            <SelectItem value={BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.PREVIEW}>
                                                {getStatusText(BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.PREVIEW, BATTLE_STATUS_CONFIG)}
                                            </SelectItem>
                                            <SelectItem value={BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.EXPIRED}>
                                                {getStatusText(BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.EXPIRED, BATTLE_STATUS_CONFIG)}
                                            </SelectItem>
                                            <SelectItem value={BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.INACTIVE}>
                                                {getStatusText(BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.INACTIVE, BATTLE_STATUS_CONFIG)}
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Row 2: Date filters + Has opened */}
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                        Ngày bắt đầu
                                    </label>
                                    <CustomDatePicker
                                        value={filterStartDate}
                                        onChange={(date) => {
                                            setFilterStartDate(date)
                                            setCurrentPage(1)
                                        }}
                                        placeholder="Chọn ngày bắt đầu"
                                        dayPickerProps={{
                                            disabled: false
                                        }}
                                    />
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                        Ngày kết thúc
                                    </label>
                                    <CustomDatePicker
                                        value={filterEndDate}
                                        onChange={(date) => {
                                            setFilterEndDate(date)
                                            setCurrentPage(1)
                                        }}
                                        placeholder="Chọn ngày kết thúc"
                                        dayPickerProps={{
                                            disabled: false
                                        }}
                                    />
                                </div>
                                <div className="lg:w-[220px]">
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                        Trạng thái mở
                                    </label>
                                    <Select
                                        value={filterHasOpened}
                                        onValueChange={(value: "all" | "opened" | "notOpened") => {
                                            setFilterHasOpened(value)
                                            setCurrentPage(1)
                                        }}
                                    >
                                        <SelectTrigger className="w-full bg-background border-border text-foreground h-11 shadow-sm">
                                            <SelectValue placeholder="Trạng thái mở" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="all">Tất cả</SelectItem>
                                            <SelectItem value="opened">Đã mở</SelectItem>
                                            <SelectItem value="notOpened">Chưa mở</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-end">
                                    {hasActiveFilters ? (
                                        <Button
                                            variant="outline"
                                            onClick={handleClearFilters}
                                            className="w-full border-border text-foreground hover:bg-muted shadow-sm h-11"
                                        >
                                            <X className="w-4 h-4 mr-2" />
                                            Xóa bộ lọc
                                        </Button>
                                    ) : (
                                        <div className="h-11" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Tournaments Grid */}
                {isLoading ? (
                    <Card className="bg-card border-border shadow-md">
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <Loader2 className="w-12 h-12 animate-spin text-primary" />
                                <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : error ? (
                    <Card className="bg-card border-border shadow-md">
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="p-3 bg-destructive/10 rounded-full">
                                    <Trophy className="w-8 h-8 text-destructive" />
                                </div>
                                <p className="text-destructive font-medium">Có lỗi xảy ra khi tải dữ liệu</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : tournamentsList.length === 0 ? (
                    <Card className="bg-card border-border shadow-md">
                        <CardContent className="p-12">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="p-3 bg-muted rounded-full">
                                    <Trophy className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium">Không tìm thấy giải đấu nào</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {tournamentsList.map((tournament: any) => (
                                <Card
                                    key={tournament.id}
                                    className="cursor-pointer group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
                                    onClick={() => router(`${ROUTES.ADMIN.TOURNAMENT_MANAGEMENT}/${tournament.id}`)}
                                >
                                    {/* Decorative gradient overlay */}
                                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                    <CardHeader className="relative pb-4">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-2">
                                                    <CardTitle className="text-xl font-bold text-foreground line-clamp-2">
                                                        {tournament.nameTranslation || tournament.nameKey}
                                                    </CardTitle>
                                                </div>
                                            </div>
                                            <div className="p-3 bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl border border-yellow-500/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <Trophy className="w-6 h-6 text-yellow-500" />
                                            </div>
                                        </div>
                                    </CardHeader>

                                    <CardContent className="relative space-y-4">
                                        {/* Status Badges */}
                                        <div className="flex flex-wrap gap-2">
                                            <Badge className={`${getStatusBadgeColor(tournament.status, BATTLE_STATUS_CONFIG)} border shadow-sm font-medium`}>
                                                {getStatusText(tournament.status, BATTLE_STATUS_CONFIG)}
                                            </Badge>
                                            {tournament.hasOpened && (
                                                <Badge className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border-green-500/30 shadow-sm font-medium flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    Đã mở
                                                </Badge>
                                            )}
                                        </div>

                                        {/* Tournament Info */}
                                        <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-border/50">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-muted-foreground flex items-center gap-2 font-medium">
                                                    <Clock className="w-4 h-4" />
                                                    Thời gian
                                                </span>
                                                <span className="text-foreground font-semibold">
                                                    {formatDateOnly(tournament.startDate)} - {formatDateOnly(tournament.endDate)}
                                                </span>
                                            </div>
                                            <div className="h-px bg-border/50" />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="border-border text-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all shadow-sm"
                                            >
                                                <Edit className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="border-border text-destructive hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all shadow-sm"
                                                onClick={() => setDeleteCandidate({ id: tournament.id, name: tournament.nameTranslation || tournament.nameKey })}
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPage > 0 && (
                            <Card className="bg-card border-border shadow-md">
                                <CardFooter className="py-4">
                                    <PaginationControls
                                        currentPage={pagination.current}
                                        totalPages={pagination.totalPage}
                                        totalItems={pagination.totalItem}
                                        itemsPerPage={pagination.pageSize}
                                        onPageChange={setCurrentPage}
                                        onItemsPerPageChange={(newSize) => {
                                            setPageSize(newSize)
                                            setCurrentPage(1)
                                        }}
                                        isLoading={isLoading}
                                    />
                                </CardFooter>
                            </Card>
                        )}
                    </>
                )}

                <CreateSeason isOpen={showAddDialog} onClose={() => setShowAddDialog(false)} />

                <DialogDeleteSeason
                    candidate={deleteCandidate}
                    isOpen={!!deleteCandidate}
                    onCancel={() => setDeleteCandidate(null)}
                />
            </div >
        </>
    )
}
