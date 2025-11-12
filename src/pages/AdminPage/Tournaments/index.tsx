"use client"

import { useState, useEffect, useMemo } from "react"
import { Card, CardContent, CardFooter } from "@ui/Card"
import { Badge } from "@ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog"
import { Trophy, Calendar, Users, Award, Search, Edit, Trash2, Eye, Loader2 } from "lucide-react"
import HeaderAdmin from "@organisms/Header/Admin"
import { useTranslation } from "react-i18next"
import { useBattleListLeaderBoardSeason } from "@hooks/useBattle"
import PaginationControls from "@ui/PaginationControls"
import { BATTLE } from "@constants/battle"

export default function TournamentManagement() {
    const { t } = useTranslation()

    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [selectedStatus, setSelectedStatus] = useState("all")
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

        return params
    }, [currentPage, pageSize, debouncedSearchQuery, selectedStatus])

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
            { label: "Tổng giải đấu", value: totalTournaments.toString(), icon: Trophy, color: "text-yellow-400" },
            { label: "Đang diễn ra", value: activeTournaments.toString(), icon: Calendar, color: "text-blue-400" },
            { label: "Tổng người tham gia", value: totalParticipants.toString() || "0", icon: Users, color: "text-green-400" },
            { label: "Giải thưởng tháng này", value: monthlyRewards.toString() || "0", icon: Award, color: "text-purple-400" },
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
                return "bg-green-500/20 text-green-400 border-green-500/30"
            case BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.PREVIEW:
                return "bg-blue-500/20 text-blue-400 border-blue-500/30"
            case BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.EXPIRED:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30"
            case BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.INACTIVE:
                return "bg-red-500/20 text-red-400 border-red-500/30"
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-500/30"
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

    return (

        <>
            <HeaderAdmin title={t('tournaments.title')} description={t('tournaments.description')} />
            <div className="p-6 space-y-6 mt-24">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {stats.map((stat) => (
                        <div key={stat.label} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-gray-400 text-sm">{stat.label}</p>
                                    <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
                                </div>
                                <stat.icon className={`w-8 h-8 ${stat.color}`} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Filters */}
                <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Tìm kiếm giải đấu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-900 border border-gray-800 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                        />
                    </div>
                    <div className="flex gap-2">
                        {["all", BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.ACTIVE, BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.PREVIEW, BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.EXPIRED, BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.INACTIVE].map((status) => (
                            <button
                                key={status}
                                onClick={() => {
                                    setSelectedStatus(status)
                                    setCurrentPage(1) // Reset to first page when filter changes
                                }}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${selectedStatus === status
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-900 text-gray-400 hover:bg-gray-800 border border-gray-800"
                                    }`}
                            >
                                {status === "all"
                                    ? "Tất cả"
                                    : getStatusText(status)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tournaments Grid */}
                {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
                    </div>
                ) : error ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-red-400">Có lỗi xảy ra khi tải dữ liệu</p>
                    </div>
                ) : tournamentsList.length === 0 ? (
                    <div className="flex items-center justify-center py-12">
                        <p className="text-gray-400">Không tìm thấy giải đấu nào</p>
                    </div>
                ) : (
                    <>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            {tournamentsList.map((tournament: any) => (
                                <div
                                    key={tournament.id}
                                    className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-gray-700 transition-colors"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <h3 className="text-xl font-semibold text-white mb-2">
                                                {tournament.nameTranslation || tournament.nameKey}
                                            </h3>
                                            <p className="text-gray-400 text-sm">
                                                {tournament.nameKey}
                                            </p>
                                        </div>
                                        <Trophy className="w-6 h-6 text-yellow-400 ml-4" />
                                    </div>

                                    <div className="flex gap-2 mb-4">
                                        <Badge className={`${getStatusColor(tournament.status)} border`}>
                                            {getStatusText(tournament.status)}
                                        </Badge>
                                        {tournament.hasOpened && (
                                            <Badge className="bg-blue-500/10 text-blue-400 border border-blue-500/30">
                                                Đã mở
                                            </Badge>
                                        )}
                                    </div>

                                    <div className="space-y-3 mb-4">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Thời gian
                                            </span>
                                            <span className="text-white">
                                                {formatDate(tournament.startDate)} - {formatDate(tournament.endDate)}
                                            </span>
                                        </div>
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-gray-400 flex items-center gap-2">
                                                <Calendar className="w-4 h-4" />
                                                Trạng thái
                                            </span>
                                            <span className="text-white">
                                                {tournament.hasOpened ? "Đã mở" : "Chưa mở"}
                                            </span>
                                        </div>
                                        {tournament.enablePrecreate && (
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-400 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4" />
                                                    Tạo trước
                                                </span>
                                                <span className="text-white">
                                                    {tournament.precreateBeforeEndDays} ngày trước khi kết thúc
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setSelectedTournament(tournament.id)}
                                            className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            Chi tiết
                                        </button>
                                        <button className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm">
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-800 hover:bg-red-900/50 text-red-400 rounded-lg transition-colors text-sm">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.totalPage > 0 && (
                            <Card className="bg-gray-900 border-gray-800">
                                <CardFooter className="justify-between">
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
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
                        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            <h2 className="text-xl font-bold text-white mb-4">Tạo giải đấu mới</h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Tên giải đấu</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Mô tả</label>
                                    <textarea
                                        rows={3}
                                        className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Ngày bắt đầu</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Ngày kết thúc</label>
                                        <input
                                            type="date"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Số người tối đa</label>
                                        <input
                                            type="number"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm text-gray-400 mb-1">Giải thưởng</label>
                                        <input
                                            type="text"
                                            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm text-gray-400 mb-1">Cấp độ</label>
                                    <select className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-blue-500">
                                        <option>Beginner</option>
                                        <option>Intermediate</option>
                                        <option>Advanced</option>
                                        <option>All Levels</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={() => setShowAddDialog(false)}
                                    className="flex-1 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors"
                                >
                                    Hủy
                                </button>
                                <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                                    Tạo giải đấu
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tournament Details Dialog */}
                {selectedTournament && (
                    <Dialog open={!!selectedTournament} onOpenChange={() => setSelectedTournament(null)}>
                        <DialogContent className="bg-gray-900 border-gray-800 max-w-4xl max-h-[80vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle className="text-white">Chi tiết giải đấu</DialogTitle>
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
            <div className="grid grid-cols-3 gap-4">
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-white">156</div>
                        <p className="text-sm text-gray-400">Người tham gia</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-white">1,234</div>
                        <p className="text-sm text-gray-400">Trận đấu</p>
                    </CardContent>
                </Card>
                <Card className="bg-gray-800 border-gray-700">
                    <CardContent className="pt-6">
                        <div className="text-2xl font-bold text-yellow-400">1M VND</div>
                        <p className="text-sm text-gray-400">Giải thưởng</p>
                    </CardContent>
                </Card>
            </div>

            <div>
                <h3 className="text-lg font-semibold text-white mb-4">Bảng xếp hạng</h3>
                <div className="space-y-2">
                    {leaderboard.map((player) => (
                        <div
                            key={player.rank}
                            className="flex items-center justify-between p-4 bg-gray-800 border border-gray-700 rounded-lg"
                        >
                            <div className="flex items-center gap-4">
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${player.rank === 1
                                        ? "bg-yellow-500 text-black"
                                        : player.rank === 2
                                            ? "bg-gray-400 text-black"
                                            : player.rank === 3
                                                ? "bg-orange-600 text-white"
                                                : "bg-gray-700 text-white"
                                        }`}
                                >
                                    {player.rank}
                                </div>
                                <div>
                                    <p className="font-semibold text-white">{player.name}</p>
                                    <p className="text-sm text-gray-400">{player.pokemon}</p>
                                </div>
                            </div>
                            <div className="text-right">
                                <p className="text-lg font-bold text-white">{player.score}</p>
                                <p className="text-xs text-gray-400">điểm</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
