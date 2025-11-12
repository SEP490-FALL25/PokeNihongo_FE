import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Badge } from "@ui/Badge"
import { Input } from "@ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Search, Trash2, Loader2, Brain, Sparkles, Calendar, Hash } from "lucide-react"
import HeaderAdmin from "@organisms/Header/Admin"
import { useConfigPromptsCustom, useGetAIGeminiModels, useGetAIConfigModels } from "@hooks/useAI"
import { GeminiConfigPromptsEntity } from "@models/ai/entity"
import { useTranslation } from "react-i18next"
import AddAiPrompts from "./components/AddAiPrompts"
import { getStatusBadgeColor } from "@atoms/BadgeStatusColor"
import { getStatusLabel } from "@atoms/StatusLabel"
import { formatDate } from "@utils/date"
import EditAiPrompts from "./components/EditAiPrompts"
import { Skeleton } from "@ui/Skeleton"
import DeleteConfirmAiPrompts from "./components/DeleteConfirmAiPrompts"

export default function AIPromptManagement() {
    const { t } = useTranslation()
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [showAddDialog, setShowAddDialog] = useState<boolean>(false)
    const [selectedPrompt, setSelectedPrompt] = useState<GeminiConfigPromptsEntity | null>(null)

    /**
     * Handle Delete Prompt
     */
    const [promptIdToDelete, setPromptIdToDelete] = useState<number | null>(null)
    //------------------------End------------------------//


    /**
     * Handle config prompts hook
     */
    const [currentPage, setCurrentPage] = useState<number>(1)
    const [pageSize] = useState<number>(10)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [sortBy] = useState<string>("id")
    const [sortOrder] = useState<"asc" | "desc">("desc")
    const queryParams = useMemo(() => {
        const params: any = {
            page: currentPage,
            limit: pageSize,
            sortBy,
            sortOrder,
        }

        if (debouncedSearchQuery) {
            params.promptLike = debouncedSearchQuery
        }

        if (statusFilter !== "all") {
            params.isActive = statusFilter === "active"
        }

        return params
    }, [currentPage, pageSize, debouncedSearchQuery, statusFilter, sortBy, sortOrder])

    const { data, isLoading, error } = useConfigPromptsCustom(queryParams)
    //------------------------End------------------------//

    // Get Gemini Models and Config Models for mapping
    const { data: geminiModels } = useGetAIGeminiModels()
    const { data: configModelsData } = useGetAIConfigModels({ page: 1, limit: 1000 })


    /**
     * Handle Get Model Name
     */
    const getModelName = useCallback((configModelId: number) => {
        if (!configModelsData?.results) return `ID ${configModelId}`
        const configModel = configModelsData.results.find((cm: any) => cm.id === configModelId)
        if (configModel?.geminiModel) {
            return configModel.geminiModel.displayName || configModel.geminiModel.key || `ID ${configModelId}`
        }
        if (configModel?.geminiModelId && geminiModels) {
            const model = geminiModels.find((m: any) => m.id === configModel.geminiModelId)
            return model?.displayName || model?.key || `ID ${configModelId}`
        }
        return `ID ${configModelId}`
    }, [configModelsData, geminiModels])
    //------------------------End------------------------//


    /**
     * Handle Accumulated Results
     */
    const [accumulatedResults, setAccumulatedResults] = useState<GeminiConfigPromptsEntity[]>([])
    useEffect(() => {
        const results = data?.results
        if (results && Array.isArray(results) && results.length > 0) {
            if (currentPage === 1) {
                setAccumulatedResults(results)
            } else {
                setAccumulatedResults(prev => {
                    const existingIds = new Set(prev.map(p => p.id))
                    const newResults = results.filter((p: GeminiConfigPromptsEntity) => !existingIds.has(p.id))
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
    const lastPromptElementRef = useCallback((node: HTMLTableRowElement | null) => {
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
    }, [debouncedSearchQuery, statusFilter])
    //------------------------End------------------------//

    /**
     * Handle Debounce Search
     */
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery.trim()), 500)
        return () => clearTimeout(timer)
    }, [searchQuery])
    //------------------------End------------------------//


    const prompts = accumulatedResults
    const pagination = data?.pagination

    return (
        <>
            {/* Header */}
            <HeaderAdmin title={t('aiPrompts.title', { defaultValue: 'Quản lý AI Prompts' })} description={t('aiPrompts.desc', { defaultValue: 'Quản lý các prompt ngữ cảnh cho AI trợ giúp học tập' })} />

            <div className="mt-24 p-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3">
                    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('aiPrompts.stats.total', { defaultValue: 'Tổng prompts' })}</CardTitle>
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <Brain className="w-5 h-5" />
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
                    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('aiPrompts.stats.loaded', { defaultValue: 'Đã tải' })}</CardTitle>
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
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
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('aiPrompts.stats.progress', { defaultValue: 'Tiến độ' })}</CardTitle>
                                <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                    <Hash className="w-5 h-5" />
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
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Brain className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-xl font-bold text-foreground">{t('aiPrompts.title', { defaultValue: 'Quản lý AI Prompts' })}</CardTitle>
                        </div>
                        <CardContent className="px-0 pt-0 pb-0">
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <div className="flex-1 w-full sm:max-w-md relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                    <Input
                                        placeholder={t('aiPrompts.search', { defaultValue: 'Tìm kiếm prompt...' })}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                    />
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Select value={statusFilter} onValueChange={(value) => {
                                        setStatusFilter(value)
                                    }}>
                                        <SelectTrigger className="w-[140px] bg-background border-border text-foreground h-11 shadow-sm">
                                            <SelectValue placeholder={t('aiCommon.status', { defaultValue: 'Trạng thái' })} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="all">{t('aiCommon.all', { defaultValue: 'Tất cả' })}</SelectItem>
                                            <SelectItem value="active">{t('aiCommon.active', { defaultValue: 'Hoạt động' })}</SelectItem>
                                            <SelectItem value="inactive">{t('aiCommon.inactive', { defaultValue: 'Tắt' })}</SelectItem>
                                        </SelectContent>
                                    </Select>

                                    <AddAiPrompts showAddDialog={showAddDialog} setShowAddDialog={setShowAddDialog} />
                                </div>
                            </div>
                        </CardContent>
                    </CardHeader>
                </Card>

                {/* Prompts Grid */}
                {isLoading && currentPage === 1 && accumulatedResults.length === 0 ? (
                    <div className="space-y-4">
                        {Array.from({ length: 3 }).map((_, index) => (
                            <Card key={`skeleton-${index}`} className="bg-card border-border">
                                <CardContent className="p-6">
                                    <div className="space-y-4">
                                        {/* Header Skeleton */}
                                        <div className="flex items-start gap-3">
                                            <Skeleton className="h-12 w-12 rounded-xl" />
                                            <div className="flex-1 space-y-2">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-6 w-32" />
                                                    <Skeleton className="h-5 w-20 rounded-full" />
                                                </div>
                                                <Skeleton className="h-4 w-48" />
                                            </div>
                                        </div>
                                        {/* Prompt Content Skeleton */}
                                        <div className="bg-muted/40 rounded-lg p-4 border border-border/50 space-y-2">
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-full" />
                                            <Skeleton className="h-4 w-3/4" />
                                        </div>
                                        {/* Footer Metadata Skeleton */}
                                        <div className="flex items-center gap-4">
                                            <Skeleton className="h-4 w-32" />
                                            <Skeleton className="h-4 w-32" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                ) : error ? (
                    <Card className="bg-card border-border border-destructive/50 shadow-md">
                        <CardContent className="py-12 text-center">
                            <div className="flex flex-col items-center justify-center gap-4">
                                <div className="p-3 bg-destructive/10 rounded-full">
                                    <Brain className="w-8 h-8 text-destructive" />
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
                                    <Brain className="h-16 w-16 text-muted-foreground opacity-30" />
                                </div>
                                <p className="text-lg font-semibold text-foreground mb-2">{t('aiCommon.notFound', { defaultValue: 'Không tìm thấy prompt' })}</p>
                                <p className="text-sm text-muted-foreground">{t('aiCommon.tryChangeFilters', { defaultValue: 'Thử thay đổi bộ lọc hoặc tạo prompt mới' })}</p>
                            </div>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {prompts.map((prompt: GeminiConfigPromptsEntity, index: number) => (
                            <Card
                                key={prompt.id}
                                ref={index === prompts.length - 1 ? lastPromptElementRef : null}
                                className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                onClick={() => setSelectedPrompt(prompt)}
                            >
                                {/* Decorative gradient overlay */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                
                                <CardContent className="p-6 relative">
                                    <div className="relative flex items-start justify-between gap-4">
                                        {/* Left Content */}
                                        <div className="flex-1 min-w-0 space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start gap-3">
                                                <div className="p-3 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl border border-purple-500/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                    <Brain className="h-6 w-6 text-purple-500" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                        <h3 className="text-lg font-bold text-foreground">{t('aiPrompts.itemTitle', { defaultValue: 'AI Prompt' })} #{prompt.id}</h3>
                                                        <Badge className={`${getStatusBadgeColor(prompt.isActive)} shadow-sm font-medium flex items-center gap-1`}>
                                                            <Sparkles className="h-3 w-3" />
                                                            {getStatusLabel(prompt.isActive, t)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1 bg-muted/40 px-2 py-1 rounded-md">
                                                            <Hash className="h-3 w-3" />
                                                            <span className="font-medium">{t('aiCommon.modelId', { defaultValue: 'Model ID' })}: {getModelName(prompt.geminiConfigModelId)} ({prompt.geminiConfigModelId})</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Prompt Content */}
                                            <div className="bg-gradient-to-br from-muted/40 to-muted/20 rounded-lg p-4 border border-border/50 shadow-sm">
                                                <p className="text-sm font-mono text-foreground leading-relaxed line-clamp-4">
                                                    {prompt.prompt}
                                                </p>
                                            </div>

                                            {/* Footer Metadata */}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{t('aiCommon.created', { defaultValue: 'Tạo' })}: {prompt.createdAt ? formatDate(prompt.createdAt) : 'N/A'}</span>
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center gap-1.5 bg-muted/30 px-2 py-1 rounded-md">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{t('aiCommon.updated', { defaultValue: 'Cập nhật' })}: {prompt.updatedAt ? formatDate(prompt.updatedAt) : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Actions */}
                                        <div className="absolute top-4 right-4 flex gap-2 z-10">
                                            <div 
                                                className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-600 rounded-lg cursor-pointer transition-all shadow-sm hover:shadow-md"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setPromptIdToDelete(prompt.id)
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
                                <span className="text-sm text-muted-foreground">{t('aiCommon.loadingMorePrompts', { defaultValue: 'Đang tải thêm prompts...' })}</span>
                            </div>
                        )}

                        {/* End of list indicator */}
                        {!isLoading && pagination && pagination.current >= pagination.totalPage && accumulatedResults.length > 0 && (
                            <Card className="bg-muted/30 border-0">
                                <CardContent className="py-4 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        {t('aiCommon.loadedAllCountPrompts', { defaultValue: '✓ Đã hiển thị tất cả {{count}} prompts', count: pagination.totalItem })}
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* View/Edit Prompt Dialog */}
            {selectedPrompt && (
                <EditAiPrompts selectedPrompt={selectedPrompt} setSelectedPrompt={setSelectedPrompt} />
            )}

            {/* Delete Confirmation Dialog */}
            <DeleteConfirmAiPrompts
                promptIdToDelete={promptIdToDelete}
                setPromptIdToDelete={setPromptIdToDelete}
            />
        </>
    )
}
