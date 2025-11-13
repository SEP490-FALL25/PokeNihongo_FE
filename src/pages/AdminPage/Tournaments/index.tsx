"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@ui/Card"
import { Badge } from "@ui/Badge"
import { Button } from "@ui/Button"
import { Input } from "@ui/Input"
import { Textarea } from "@ui/Textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog"
import { Trophy, Calendar, Users, Award, Search, Edit, Trash2, Eye, Loader2, Sparkles, Clock, CheckCircle2, X, Plus } from "lucide-react"
import HeaderAdmin from "@organisms/Header/Admin"
import { useTranslation } from "react-i18next"
import { useBattleListLeaderBoardSeason } from "@hooks/useBattle"
import PaginationControls from "@ui/PaginationControls"
import { BATTLE } from "@constants/battle"
import CustomDatePicker from "@ui/DatePicker"

export default function TournamentManagement() {
    const { t } = useTranslation()

    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null)
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null)
    const [filterHasOpened, setFilterHasOpened] = useState<boolean | null>(null)
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [selectedTournament, setSelectedTournament] = useState<number | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)

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

        if (filterHasOpened !== null) {
            params.hasOpened = filterHasOpened
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
        // TODO: Calculate total participants and monthly rewards when API provides these fields
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

    // Format date
    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            return date.toLocaleDateString("vi-VN", {
                year: "numeric",
                month: "2-digit",
                day: "2-digit",
            })
        } catch (error) {
            return dateString
        }
    }

    // Get status color based on API status
    const getStatusColor = (status: string) => {
        switch (status) {
            case BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.ACTIVE:
                return "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border-green-500/40 shadow-sm"
            case BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.PREVIEW:
                return "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 border-blue-500/40 shadow-sm"
            case BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.EXPIRED:
                return "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-600 border-gray-500/40 shadow-sm"
            case BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.INACTIVE:
                return "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-600 border-red-500/40 shadow-sm"
            default:
                return "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-600 border-gray-500/40 shadow-sm"
        }
    }

    // Get status text
    const getStatusText = (status: string) => {
        switch (status) {
            case BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.ACTIVE:
                return "Đang diễn ra"
            case BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.PREVIEW:
                return "Xem trước"
            case BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.EXPIRED:
                return "Đã kết thúc"
            case BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.INACTIVE:
                return "Không hoạt động"
            default:
                return status
        }
    }

    // Handle clear filters
    const handleClearFilters = () => {
        setFilterStartDate(null)
        setFilterEndDate(null)
        setFilterHasOpened(null)
        setSelectedStatus("all")
        setSearchQuery("")
        setCurrentPage(1)
    }

    const hasActiveFilters = filterStartDate || filterEndDate || filterHasOpened !== null || selectedStatus !== "all" || searchQuery

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
                            {/* First row: Search and Status */}
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <label className="text-sm font-medium text-foreground mb-2 block">
                                        Tìm kiếm
                                    </label>
                                    <div className="relative">
                                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                        <Input
                                            type="text"
                                            placeholder="Tìm kiếm giải đấu..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Second row: Date filters, HasOpened, and Clear button */}
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

                                <div className="sm:w-[200px]">
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
                                                {getStatusText(BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.ACTIVE)}
                                            </SelectItem>
                                            <SelectItem value={BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.PREVIEW}>
                                                {getStatusText(BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.PREVIEW)}
                                            </SelectItem>
                                            <SelectItem value={BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.EXPIRED}>
                                                {getStatusText(BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.EXPIRED)}
                                            </SelectItem>
                                            <SelectItem value={BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.INACTIVE}>
                                                {getStatusText(BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.INACTIVE)}
                                            </SelectItem>
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
                                    className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]"
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
                                            <Badge className={`${getStatusColor(tournament.status)} border shadow-sm font-medium`}>
                                                {getStatusText(tournament.status)}
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
                                                    {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                                                </span>
                                            </div>
                                            <div className="h-px bg-border/50" />
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-2">
                                            <Button
                                                variant="outline"
                                                onClick={() => setSelectedTournament(tournament.id)}
                                                className="flex-1 border-border text-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all shadow-sm"
                                            >
                                                <Eye className="w-4 h-4 mr-2" />
                                                Chi tiết
                                            </Button>
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
                                <CardFooter className="border-t border-border py-4">
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

                {/* Add Tournament Dialog */}
                {showAddDialog && (
                    <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                        <DialogContent className="bg-gradient-to-br from-card via-card to-card/95 border-border max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 shadow-2xl">
                            <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Plus className="w-5 h-5 text-primary" />
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-bold text-foreground">Tạo giải đấu mới</DialogTitle>
                                        <p className="text-sm text-muted-foreground mt-1">Thêm giải đấu mới vào hệ thống</p>
                                    </div>
                                </div>
                            </DialogHeader>
                            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6" style={{ minHeight: 0 }}>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <Trophy className="w-4 h-4 text-primary" />
                                        Tên giải đấu *
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Nhập tên giải đấu..."
                                        className="bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-foreground">Mô tả</label>
                                    <Textarea
                                        rows={3}
                                        placeholder="Nhập mô tả giải đấu..."
                                        className="bg-background border-border text-foreground shadow-sm focus:shadow-md transition-shadow resize-none"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            Ngày bắt đầu *
                                        </label>
                                        <Input
                                            type="date"
                                            className="bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <Calendar className="w-4 h-4 text-primary" />
                                            Ngày kết thúc *
                                        </label>
                                        <Input
                                            type="date"
                                            className="bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <Users className="w-4 h-4 text-primary" />
                                            Số người tối đa
                                        </label>
                                        <Input
                                            type="number"
                                            placeholder="Nhập số người..."
                                            className="bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                            <Award className="w-4 h-4 text-primary" />
                                            Giải thưởng
                                        </label>
                                        <Input
                                            type="text"
                                            placeholder="Nhập giải thưởng..."
                                            className="bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-foreground">Cấp độ</label>
                                    <Select>
                                        <SelectTrigger className="bg-background border-border text-foreground h-11 shadow-sm">
                                            <SelectValue placeholder="Chọn cấp độ" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="beginner">Beginner</SelectItem>
                                            <SelectItem value="intermediate">Intermediate</SelectItem>
                                            <SelectItem value="advanced">Advanced</SelectItem>
                                            <SelectItem value="all">All Levels</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="flex justify-between items-center gap-3 px-6 py-4 border-t border-border bg-muted/30">
                                <p className="text-xs text-muted-foreground">* Trường bắt buộc</p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAddDialog(false)}
                                        className="border-border text-foreground hover:bg-muted shadow-sm"
                                    >
                                        Hủy
                                    </Button>
                                    <Button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg">
                                        <Plus className="w-4 h-4 mr-2" />
                                        Tạo giải đấu
                                    </Button>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* Tournament Details Dialog */}
                {selectedTournament && (
                    <Dialog open={!!selectedTournament} onOpenChange={() => setSelectedTournament(null)}>
                        <DialogContent className="bg-card border-border max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-foreground">Chi tiết giải đấu</DialogTitle>
                            </DialogHeader>
                            <TournamentDetails tournamentId={selectedTournament} />
                        </DialogContent>
                    </Dialog>
                )}
            </div >
        </>
    )
}

function TournamentDetails({ tournamentId }: { tournamentId: number }) {
    // TODO: Fetch tournament details and leaderboard using tournamentId
    // const { data: tournamentDetails } = useTournamentDetails(tournamentId);
    // const { data: leaderboard } = useTournamentLeaderboard(tournamentId);

    const leaderboard = [
        { rank: 1, name: "Nguyễn Văn A", score: 1250, pokemon: "Charizard" },
        { rank: 2, name: "Trần Thị B", score: 1180, pokemon: "Pikachu" },
        { rank: 3, name: "Lê Văn C", score: 1120, pokemon: "Mewtwo" },
        { rank: 4, name: "Phạm Thị D", score: 1050, pokemon: "Blastoise" },
        { rank: 5, name: "Hoàng Văn E", score: 980, pokemon: "Venusaur" },
    ]

    // Suppress unused variable warning - will be used when API is implemented
    void tournamentId;

    return (
        <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <Users className="w-5 h-5 text-blue-500" />
                        </div>
                        <div className="text-3xl font-bold text-foreground mb-1">156</div>
                        <p className="text-sm text-muted-foreground font-medium">Người tham gia</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <Trophy className="w-5 h-5 text-purple-500" />
                        </div>
                        <div className="text-3xl font-bold text-foreground mb-1">1,234</div>
                        <p className="text-sm text-muted-foreground font-medium">Trận đấu</p>
                    </CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20 shadow-lg">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <Award className="w-5 h-5 text-yellow-500" />
                        </div>
                        <div className="text-3xl font-bold text-yellow-600 mb-1">1M VND</div>
                        <p className="text-sm text-muted-foreground font-medium">Giải thưởng</p>
                    </CardContent>
                </Card>
            </div>

            {/* Leaderboard */}
            <div>
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-primary/10 rounded-lg">
                        <Trophy className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-xl font-bold text-foreground">Bảng xếp hạng</h3>
                </div>
                <div className="space-y-3">
                    {leaderboard.map((player) => (
                        <Card
                            key={player.rank}
                            className={`bg-card border-border hover:shadow-lg transition-all duration-200 ${player.rank <= 3 ? 'border-primary/30 shadow-md' : 'shadow-sm'
                                }`}
                        >
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-lg ${player.rank === 1
                                                ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-black"
                                                : player.rank === 2
                                                    ? "bg-gradient-to-br from-gray-300 to-gray-500 text-black"
                                                    : player.rank === 3
                                                        ? "bg-gradient-to-br from-orange-500 to-orange-700 text-white"
                                                        : "bg-muted text-foreground"
                                                }`}
                                        >
                                            {player.rank === 1 && <Trophy className="w-5 h-5" />}
                                            {player.rank !== 1 && player.rank}
                                        </div>
                                        <div>
                                            <p className="font-bold text-foreground text-base">{player.name}</p>
                                            <p className="text-sm text-muted-foreground flex items-center gap-1">
                                                <Sparkles className="w-3 h-3" />
                                                {player.pokemon}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="flex items-baseline gap-1">
                                            <p className="text-2xl font-bold text-foreground">{player.score.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground">điểm</p>
                                        </div>
                                        {player.rank <= 3 && (
                                            <Badge className={`mt-1 ${player.rank === 1 ? 'bg-yellow-500/20 text-yellow-600 border-yellow-500/30' :
                                                player.rank === 2 ? 'bg-gray-500/20 text-gray-600 border-gray-500/30' :
                                                    'bg-orange-500/20 text-orange-600 border-orange-500/30'
                                                }`}>
                                                Top {player.rank}
                                            </Badge>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
