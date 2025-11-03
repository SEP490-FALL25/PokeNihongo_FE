import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Badge } from "@ui/Badge"
import { Button } from "@ui/Button"
import { Input } from "@ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Plus, Search, Edit, Trash2, MoreVertical, Loader2, Brain, Sparkles, Eye, Calendar, Hash, Settings, Code, CheckCircle2, XCircle } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ui/DropdownMenu"
import HeaderAdmin from "@organisms/Header/Admin"
import { useGetAIConfigModels, useGetAIGeminiModels, useGetAIGeminiConfigPresets } from "@hooks/useAI"
import { IGeminiConfigModelsEntity } from "@models/ai/entity"
import CreateConfigModel from "@pages/AdminPage/AICustom/components/CreateConfigModel"

export default function CustomAIManagement() {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [showCreateDialog, setShowCreateDialog] = useState(false)
    const [selectedConfig, setSelectedConfig] = useState<IGeminiConfigModelsEntity | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [geminiModelFilter, setGeminiModelFilter] = useState<string>("all")
    const [presetFilter, setPresetFilter] = useState<string>("all")
    const [jsonModeFilter, setJsonModeFilter] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("createdAt")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    // Get options for filters
    const { data: geminiModels } = useGetAIGeminiModels()
    const { data: configPresets } = useGetAIGeminiConfigPresets()

    // Build query params
    const queryParams = useMemo(() => {
        const params: any = {
            page: currentPage,
            limit: pageSize,
            sortBy,
            sortOrder,
        }

        if (debouncedSearchQuery) {
            params.nameLike = debouncedSearchQuery
        }

        if (statusFilter !== "all") {
            params.isEnabled = statusFilter === "active"
        }

        if (geminiModelFilter !== "all") {
            params.geminiModelId = Number(geminiModelFilter)
        }

        if (presetFilter !== "all") {
            params.presetId = Number(presetFilter)
        }

        if (jsonModeFilter !== "all") {
            params.jsonMode = jsonModeFilter === "true"
        }

        return params
    }, [currentPage, pageSize, debouncedSearchQuery, statusFilter, geminiModelFilter, presetFilter, jsonModeFilter, sortBy, sortOrder])

    // Fetch config models
    const { data, isLoading, error } = useGetAIConfigModels(queryParams)

    /**
     * Handle Accumulated Results
     */
    const [accumulatedResults, setAccumulatedResults] = useState<IGeminiConfigModelsEntity[]>([])
    useEffect(() => {
        const results = data?.results
        if (results && Array.isArray(results) && results.length > 0) {
            if (currentPage === 1) {
                setAccumulatedResults(results)
            } else {
                setAccumulatedResults(prev => {
                    const existingIds = new Set(prev.map(c => c.id))
                    const newResults = results.filter((c: IGeminiConfigModelsEntity) => !existingIds.has(c.id))
                    return [...prev, ...newResults]
                })
            }
        } else if (!isLoading && currentPage === 1) {
            setAccumulatedResults([])
        }
    }, [data, currentPage, isLoading])
    //------------------------End------------------------//

    /**
     * Handle Intersection Observer
     */
    const observerRef = useRef<IntersectionObserver | null>(null)
    const lastConfigElementRef = useCallback((node: HTMLDivElement | null) => {
        if (observerRef.current) observerRef.current.disconnect()
        observerRef.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting &&
                data?.pagination?.current &&
                data?.pagination?.totalPage &&
                data?.pagination.current < data?.pagination.totalPage &&
                !isLoading) {
                setCurrentPage(prev => prev + 1)
            }
        })
        if (node) observerRef.current.observe(node)
    }, [data?.pagination, isLoading])
    //------------------------End------------------------//

    /**
     * Handle Reset Page and Accumulated Results
     */
    useEffect(() => {
        setCurrentPage(1)
    }, [debouncedSearchQuery, statusFilter, geminiModelFilter, presetFilter, jsonModeFilter, sortBy, sortOrder])
    //------------------------End------------------------//

    /**
     * Handle Debounce Search
     */
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery.trim()), 500)
        return () => clearTimeout(timer)
    }, [searchQuery])
    //------------------------End------------------------//

    const configs = accumulatedResults
    const pagination = data?.pagination

    const getStatusBadgeColor = (isEnabled: boolean) => {
        return isEnabled ? "bg-chart-4 text-white" : "bg-muted text-muted-foreground"
    }

    const getStatusLabel = (isEnabled: boolean) => {
        return isEnabled ? "Hoạt động" : "Tắt"
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN", {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleSort = (key: string) => {
        if (sortBy === key) {
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(key)
            setSortOrder("desc")
        }
    }

    return (
        <>
            {/* Header */}
            <HeaderAdmin title="Config AI - Custom AI" description="Quản lý các cấu hình AI tuỳ chỉnh" />

            <div className="mt-24 p-8 rounded-2xl bg-muted/60 backdrop-blur-sm">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card className="bg-slate-50 border-border shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng cấu hình</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {pagination?.totalItem || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Trong hệ thống</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-border shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Đã tải</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {accumulatedResults.length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {pagination && pagination.current < pagination.totalPage
                                    ? 'Cuộn xuống để xem thêm'
                                    : 'Đã tải hết'}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-slate-50 border-border shadow-md">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tiến độ</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {pagination?.totalItem ? Math.round((accumulatedResults.length / pagination.totalItem) * 100) : 0}%
                            </div>
                            <div className="w-full bg-muted rounded-full h-2 mt-2">
                                <div
                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${pagination?.totalItem ? (accumulatedResults.length / pagination.totalItem) * 100 : 0}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Bar */}
                <Card className="bg-slate-50 border-border mb-4 shadow-md">
                    <CardContent className="py-4">
                        <div className="flex flex-col gap-4">
                            {/* Search and Create */}
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <div className="flex-1 w-full sm:max-w-md relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder="Tìm kiếm theo tên cấu hình..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-background border-border text-foreground"
                                    />
                                </div>
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm" onClick={() => setShowCreateDialog(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Tạo cấu hình
                                </Button>
                            </div>

                            {/* Filters Row */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                <Select value={statusFilter} onValueChange={setStatusFilter}>
                                    <SelectTrigger className="bg-background border-border text-foreground">
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                        <SelectItem value="active">Hoạt động</SelectItem>
                                        <SelectItem value="inactive">Tắt</SelectItem>
                                    </SelectContent>
                                </Select>

                                <Select value={geminiModelFilter} onValueChange={setGeminiModelFilter}>
                                    <SelectTrigger className="bg-background border-border text-foreground">
                                        <SelectValue placeholder="Gemini Model" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="all">Tất cả model</SelectItem>
                                        {geminiModels && Array.isArray(geminiModels) && geminiModels.map((m: any) => (
                                            <SelectItem key={m.id} value={String(m.id)}>
                                                {m.key}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={presetFilter} onValueChange={setPresetFilter}>
                                    <SelectTrigger className="bg-background border-border text-foreground">
                                        <SelectValue placeholder="Preset" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="all">Tất cả preset</SelectItem>
                                        {configPresets && Array.isArray(configPresets) && configPresets.map((p: any) => (
                                            <SelectItem key={p.id} value={String(p.id)}>
                                                {p.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>

                                <Select value={jsonModeFilter} onValueChange={setJsonModeFilter}>
                                    <SelectTrigger className="bg-background border-border text-foreground">
                                        <SelectValue placeholder="JSON Mode" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="true">Bật JSON Mode</SelectItem>
                                        <SelectItem value="false">Tắt JSON Mode</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {/* Sort Controls */}
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-muted-foreground">Sắp xếp:</span>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSort("createdAt")}
                                    className={`border-border ${sortBy === "createdAt" ? "bg-primary/10 border-primary" : ""}`}
                                >
                                    Ngày tạo {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleSort("name")}
                                    className={`border-border ${sortBy === "name" ? "bg-primary/10 border-primary" : ""}`}
                                >
                                    Tên {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Configs Grid */}
                {isLoading && currentPage === 1 && accumulatedResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <Card className="bg-slate-50 border-border border-destructive/50 shadow-md">
                        <CardContent className="py-12 text-center">
                            <div className="text-destructive">Có lỗi xảy ra khi tải dữ liệu</div>
                        </CardContent>
                    </Card>
                ) : accumulatedResults.length === 0 ? (
                    <Card className="bg-slate-50 border-border border-dashed shadow-md">
                        <CardContent className="py-16 text-center">
                            <Settings className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium text-foreground mb-2">Không tìm thấy cấu hình</p>
                            <p className="text-sm text-muted-foreground">Thử thay đổi bộ lọc hoặc tạo cấu hình mới</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {configs.map((config: IGeminiConfigModelsEntity, index: number) => (
                            <Card
                                key={config.id}
                                ref={index === configs.length - 1 ? lastConfigElementRef : null}
                                className="bg-slate-50 border-border shadow-md hover:border-primary/50 hover:shadow-lg transition-all duration-200 group"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left Content */}
                                        <div className="flex-1 min-w-0 space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start gap-3">
                                                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                                                    <Settings className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <h3 className="text-lg font-semibold text-foreground">{config.name}</h3>
                                                        <Badge className={getStatusBadgeColor(config.isEnabled)}>
                                                            {config.isEnabled ? (
                                                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                                            ) : (
                                                                <XCircle className="h-3 w-3 mr-1" />
                                                            )}
                                                            {getStatusLabel(config.isEnabled)}
                                                        </Badge>
                                                        {config.jsonMode && (
                                                            <Badge className="bg-chart-2 text-white">
                                                                <Code className="h-3 w-3 mr-1" />
                                                                JSON Mode
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                                                        <div className="flex items-center gap-1">
                                                            <Brain className="h-3 w-3" />
                                                            <span>Model: {config.geminiModel?.key || `ID ${config.geminiModelId}`}</span>
                                                        </div>
                                                        <span>•</span>
                                                        <div className="flex items-center gap-1">
                                                            <Sparkles className="h-3 w-3" />
                                                            <span>Preset: {config.preset?.name || `ID ${config.presetId}`}</span>
                                                        </div>
                                                        <span>•</span>
                                                        <div className="flex items-center gap-1">
                                                            <Hash className="h-3 w-3" />
                                                            <span>Max Tokens: {config.maxTokens}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* System Instruction Preview */}
                                            <div className="bg-muted/40 rounded-lg p-4 border border-border/50">
                                                <p className="text-xs font-medium text-muted-foreground mb-2">System Instruction:</p>
                                                <p className="text-sm font-mono text-foreground leading-relaxed line-clamp-3">
                                                    {config.systemInstruction}
                                                </p>
                                            </div>

                                            {/* Extra Info */}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>Tạo: {config.createdAt ? formatDate(config.createdAt) : 'N/A'}</span>
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>Cập nhật: {config.updatedAt ? formatDate(config.updatedAt) : 'N/A'}</span>
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Code className="h-3.5 w-3.5" />
                                                    <span>MIME: {config.extraParams?.responseMimeType || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Actions */}
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                                                onClick={() => setSelectedConfig(config)}
                                                title="Xem chi tiết"
                                            >
                                                <Eye className="h-4 w-4" />
                                            </Button>
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-9 w-9"
                                                    >
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end" className="bg-card border-border w-48">
                                                    <DropdownMenuItem
                                                        className="text-foreground hover:bg-muted cursor-pointer"
                                                        onClick={() => setSelectedConfig(config)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-destructive hover:bg-destructive/10 cursor-pointer">
                                                        <Trash2 className="h-4 w-4 mr-2" />
                                                        Xóa
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Loading indicator when loading more pages */}
                        {isLoading && currentPage > 1 && (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                                <span className="text-sm text-muted-foreground">Đang tải thêm cấu hình...</span>
                            </div>
                        )}

                        {/* End of list indicator */}
                        {!isLoading && pagination && pagination.current >= pagination.totalPage && accumulatedResults.length > 0 && (
                            <Card className="bg-muted/50 border-0 shadow-none">
                                <CardContent className="py-4 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        ✓ Đã hiển thị tất cả {pagination.totalItem} cấu hình
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* Create Config Model Dialog */}
            <CreateConfigModel
                showCreateDialog={showCreateDialog}
                setShowCreateDialog={setShowCreateDialog}
                onSuccess={() => {
                    setShowCreateDialog(false)
                    setCurrentPage(1)
                    setAccumulatedResults([])
                }}
            />

            {/* View/Edit Config Dialog - Can be implemented similarly to AIPrompts */}
            {selectedConfig && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center" onClick={() => setSelectedConfig(null)}>
                    <div className="bg-card border-border rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
                        <h2 className="text-xl font-bold mb-4">Chi tiết cấu hình: {selectedConfig.name}</h2>
                        {/* Add detailed view here */}
                        <Button onClick={() => setSelectedConfig(null)} className="mt-4">Đóng</Button>
                    </div>
                </div>
            )}
        </>
    )
}
