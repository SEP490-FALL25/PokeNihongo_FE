import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Badge } from "@ui/Badge"
import { Button } from "@ui/Button"
import { Input } from "@ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Plus, Search, Trash2, Loader2, Brain, Sparkles, Calendar, Hash, Settings, Code, CheckCircle2, XCircle } from "lucide-react"
import HeaderAdmin from "@organisms/Header/Admin"
import { useGetAIConfigModels, useGetAIGeminiModels, useGetAIGeminiConfigPresets } from "@hooks/useAI"
import { IGeminiConfigModelsEntity } from "@models/ai/entity"
import CreateConfigModel from "@pages/AdminPage/AICustom/components/CreateConfigModel"
import { useTranslation } from "react-i18next"
import { useNavigate } from "react-router-dom"
import { ROUTES } from "@constants/route"
import DeleteCustomDialog from "./components/DeleteConfirmAICustom"

export default function CustomAIManagement() {
    const { t } = useTranslation()
    const navigate = useNavigate()
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
        return isEnabled ? t('aiCustom.active', { defaultValue: 'Hoạt động' }) : t('aiCustom.inactive', { defaultValue: 'Tắt' })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString(t('locale', { defaultValue: 'vi-VN' }) as string, {
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


    /**
     * Handle Delete Config
     */
    const [configIdToDelete, setConfigIdToDelete] = useState<number | null>(null)
    //------------------------End------------------------//

    return (
        <>
            {/* Header */}
            <HeaderAdmin title={t('aiCustom.title', { defaultValue: 'Config AI - Custom AI' })} description={t('aiCustom.description', { defaultValue: 'Quản lý các cấu hình AI tuỳ chỉnh' })} />

            <div className="mt-24 p-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('aiCustom.stats.total', { defaultValue: 'Tổng cấu hình' })}</CardTitle>
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <Settings className="w-5 h-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">
                                {pagination?.totalItem || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">{t('aiCommon.inSystem', { defaultValue: 'Trong hệ thống' })}</p>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('aiCustom.stats.loaded', { defaultValue: 'Đã tải' })}</CardTitle>
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">
                                {accumulatedResults.length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-2">
                                {pagination && pagination.current < pagination.totalPage
                                    ? t('aiCommon.scrollForMore', { defaultValue: 'Cuộn xuống để xem thêm' })
                                    : t('aiCommon.loadedAll', { defaultValue: 'Đã tải hết' })}
                            </p>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('aiCustom.stats.progress', { defaultValue: 'Tiến độ' })}</CardTitle>
                                <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                    <Code className="w-5 h-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-2">
                                {pagination?.totalItem ? Math.round((accumulatedResults.length / pagination.totalItem) * 100) : 0}%
                            </div>
                            <div className="w-full bg-muted rounded-full h-2.5 mt-2 shadow-inner">
                                <div
                                    className="bg-gradient-to-r from-green-500 to-emerald-500 h-2.5 rounded-full transition-all duration-300 shadow-sm"
                                    style={{ width: `${pagination?.totalItem ? (accumulatedResults.length / pagination.totalItem) * 100 : 0}%` }}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters Bar */}
                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Settings className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">{t('aiCustom.title', { defaultValue: 'Config AI - Custom AI' })}</CardTitle>
                            </div>
                            <Button 
                                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg"
                                onClick={() => setShowCreateDialog(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {t('aiCustom.createConfig', { defaultValue: 'Tạo cấu hình' })}
                            </Button>
                        </div>
                        <CardContent className="px-0 pt-0 pb-0">
                            <div className="flex flex-col gap-4">
                                {/* Search */}
                                <div className="flex-1 w-full relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                    <Input
                                        placeholder={t('aiCustom.searchPlaceholder', { defaultValue: 'Tìm kiếm theo tên cấu hình...' })}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                    />
                                </div>

                                {/* Filters Row */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                                        <SelectTrigger className="bg-background border-border text-foreground h-11 shadow-sm">
                                            <SelectValue placeholder={t('aiCommon.status', { defaultValue: 'Trạng thái' })} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="all">{t('aiCommon.allStatuses', { defaultValue: 'Tất cả trạng thái' })}</SelectItem>
                                            <SelectItem value="active">{t('aiCommon.active', { defaultValue: 'Hoạt động' })}</SelectItem>
                                            <SelectItem value="inactive">{t('aiCommon.inactive', { defaultValue: 'Tắt' })}</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <Select value={geminiModelFilter} onValueChange={setGeminiModelFilter}>
                                        <SelectTrigger className="bg-background border-border text-foreground h-11 shadow-sm">
                                            <SelectValue placeholder={t('aiCustom.geminiModel', { defaultValue: 'Gemini Model' })} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="all">{t('aiCommon.allModels', { defaultValue: 'Tất cả model' })}</SelectItem>
                                            {geminiModels && Array.isArray(geminiModels) && geminiModels.map((m: any) => (
                                                <SelectItem key={m.id} value={String(m.id)}>
                                                    {m.key}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={presetFilter} onValueChange={setPresetFilter}>
                                        <SelectTrigger className="bg-background border-border text-foreground h-11 shadow-sm">
                                            <SelectValue placeholder={t('aiCustom.preset', { defaultValue: 'Preset' })} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="all">{t('aiCommon.allPresets', { defaultValue: 'Tất cả preset' })}</SelectItem>
                                            {configPresets && Array.isArray(configPresets) && configPresets.map((p: any) => (
                                                <SelectItem key={p.id} value={String(p.id)}>
                                                    {p.name}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>

                                    <Select value={jsonModeFilter} onValueChange={setJsonModeFilter}>
                                        <SelectTrigger className="bg-background border-border text-foreground h-11 shadow-sm">
                                            <SelectValue placeholder={t('aiCustom.jsonMode', { defaultValue: 'JSON Mode' })} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="all">{t('aiCommon.all', { defaultValue: 'Tất cả' })}</SelectItem>
                                            <SelectItem value="true">{t('aiCustom.jsonOn', { defaultValue: 'Bật JSON Mode' })}</SelectItem>
                                            <SelectItem value="false">{t('aiCustom.jsonOff', { defaultValue: 'Tắt JSON Mode' })}</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sort Controls */}
                                <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-sm font-medium text-muted-foreground">{t('aiCommon.sort', { defaultValue: 'Sắp xếp:' })}</span>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSort("createdAt")}
                                        className={`border-border shadow-sm transition-all ${sortBy === "createdAt" ? "bg-primary/10 border-primary text-primary shadow-md" : "hover:shadow-md"}`}
                                    >
                                        {t('aiCommon.createdAt', { defaultValue: 'Ngày tạo' })} {sortBy === "createdAt" && (sortOrder === "asc" ? "↑" : "↓")}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleSort("name")}
                                        className={`border-border shadow-sm transition-all ${sortBy === "name" ? "bg-primary/10 border-primary text-primary shadow-md" : "hover:shadow-md"}`}
                                    >
                                        {t('aiCommon.name', { defaultValue: 'Tên' })} {sortBy === "name" && (sortOrder === "asc" ? "↑" : "↓")}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </CardHeader>
                </Card>

                {/* Configs Grid */}
                {isLoading && currentPage === 1 && accumulatedResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">{t('aiCommon.loading', { defaultValue: 'Đang tải dữ liệu...' })}</p>
                    </div>
                ) : error ? (
                    <Card className="bg-card border-border border-destructive/50 shadow-md">
                        <CardContent className="py-12 text-center">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="p-3 bg-destructive/10 rounded-full">
                                    <Settings className="w-8 h-8 text-destructive" />
                                </div>
                                <p className="text-destructive font-medium">{t('aiCommon.loadError', { defaultValue: 'Có lỗi xảy ra khi tải dữ liệu' })}</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : accumulatedResults.length === 0 ? (
                    <Card className="bg-card border-border border-dashed shadow-md">
                        <CardContent className="py-16 text-center">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="p-3 bg-muted rounded-full">
                                    <Settings className="h-16 w-16 text-muted-foreground opacity-30" />
                                </div>
                                <p className="text-lg font-semibold text-foreground mb-2">{t('aiCustom.empty.title', { defaultValue: 'Không tìm thấy cấu hình' })}</p>
                                <p className="text-sm text-muted-foreground">{t('aiCustom.empty.subtitle', { defaultValue: 'Thử thay đổi bộ lọc hoặc tạo cấu hình mới' })}</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {configs.map((config: IGeminiConfigModelsEntity, index: number) => (
                            <Card
                                key={config.id}
                                ref={index === configs.length - 1 ? lastConfigElementRef : null}
                                className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                onClick={() => navigate(`${ROUTES.ADMIN.CUSTOM_AI_MANAGEMENT}/${config.id}`)}
                            >
                                {/* Decorative gradient overlay */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                <CardContent className="p-6 relative">
                                    <div className="relative flex items-start justify-between gap-4">
                                        {/* Left Content */}
                                        <div className="flex-1 min-w-0 space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start gap-3">
                                                <div className="p-3 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl border border-blue-500/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <Settings className="h-6 w-6 text-blue-500" />
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
                                                                {t('aiCustom.jsonMode', { defaultValue: 'JSON Mode' })}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                                                        <div className="flex items-center gap-1">
                                                            <Brain className="h-3 w-3" />
                                                            <span>{t('aiCustom.modelLabel', { defaultValue: 'Model' })}: {config.geminiModel?.key || `ID ${config.geminiModelId}`}</span>
                                                        </div>
                                                        <span>•</span>
                                                        <div className="flex items-center gap-1">
                                                            <Sparkles className="h-3 w-3" />
                                                            <span>{t('aiCustom.presetLabel', { defaultValue: 'Preset' })}: {config.preset?.name || `ID ${config.presetId}`}</span>
                                                        </div>
                                                        <span>•</span>
                                                        <div className="flex items-center gap-1">
                                                            <Hash className="h-3 w-3" />
                                                            <span>{t('aiCustom.maxTokens', { defaultValue: 'Max Tokens' })}: {config.maxTokens}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* System Instruction Preview */}
                                            <div className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg p-4 border border-border/50 shadow-sm">
                                                <p className="text-xs font-semibold text-muted-foreground mb-2">{t('aiCustom.systemInstruction', { defaultValue: 'System Instruction:' })}</p>
                                                <p className="text-sm font-mono text-foreground leading-relaxed line-clamp-3">
                                                    {config.systemInstruction}
                                                </p>
                                            </div>

                                            {/* Extra Info */}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                                                <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{t('aiCommon.created', { defaultValue: 'Tạo' })}: {config.createdAt ? formatDate(config.createdAt) : 'N/A'}</span>
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{t('aiCommon.updated', { defaultValue: 'Cập nhật' })}: {config.updatedAt ? formatDate(config.updatedAt) : 'N/A'}</span>
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                                                    <Code className="h-3.5 w-3.5" />
                                                    <span>MIME: {config.extraParams?.responseMimeType || 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Actions */}
                                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                                            <div
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setConfigIdToDelete(config.id)
                                                }}
                                            >
                                                <Trash2 className="h-5 w-5" />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}

                        {/* Loading indicator when loading more pages */}
                        {isLoading && currentPage > 1 && (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                                <span className="text-sm text-muted-foreground">{t('aiCommon.loadingMore', { defaultValue: 'Đang tải thêm cấu hình...' })}</span>
                            </div>
                        )}

                        {/* End of list indicator */}
                        {!isLoading && pagination && pagination.current >= pagination.totalPage && accumulatedResults.length > 0 && (
                            <Card className="bg-muted/50 border-0 shadow-none">
                                <CardContent className="py-4 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        {t('aiCommon.loadedAllCount', { defaultValue: '✓ Đã hiển thị tất cả {{count}} cấu hình', count: pagination.totalItem })}
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
                        <h2 className="text-xl font-bold mb-4">{t('aiCustom.detailTitle', { defaultValue: 'Chi tiết cấu hình' })}: {selectedConfig.name}</h2>
                        {/* Add detailed view here */}
                        <Button onClick={() => setSelectedConfig(null)} className="mt-4">{t('aiCommon.close', { defaultValue: 'Đóng' })}</Button>
                    </div>
                </div>
            )}

            {/* Delete Config Dialog */}
            {configIdToDelete && (
                <DeleteCustomDialog
                    configId={configIdToDelete}
                    setConfigIdToDelete={setConfigIdToDelete}
                />
            )}
        </>
    )
}
