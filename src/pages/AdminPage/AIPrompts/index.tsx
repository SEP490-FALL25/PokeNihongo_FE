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

            <div className="mt-24 p-8">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{t('aiPrompts.stats.total', { defaultValue: 'Tổng prompts' })}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {pagination?.totalItem || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">{t('aiCommon.inSystem', { defaultValue: 'Trong hệ thống' })}</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{t('aiPrompts.stats.loaded', { defaultValue: 'Đã tải' })}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {accumulatedResults.length}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                                {pagination && pagination.current < pagination.totalPage
                                    ? t('aiCommon.scrollForMore', { defaultValue: 'Cuộn xuống để xem thêm' })
                                    : t('aiCommon.loadedAll', { defaultValue: 'Đã tải hết' })}
                            </p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{t('aiPrompts.stats.progress', { defaultValue: 'Tiến độ' })}</CardTitle>
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
                <Card className="bg-card border-border mb-4">
                    <CardContent className="py-4">
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                            <div className="flex-1 w-full sm:max-w-md relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder={t('aiPrompts.search', { defaultValue: 'Tìm kiếm prompt...' })}
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background border-border text-foreground"
                                />
                            </div>
                            <div className="flex gap-2 w-full sm:w-auto">
                                <Select value={statusFilter} onValueChange={(value) => {
                                    setStatusFilter(value)
                                }}>
                                    <SelectTrigger className="w-[140px] bg-background border-border text-foreground">
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
                    <Card className="bg-card border-border border-destructive/50">
                        <CardContent className="py-12 text-center">
                            <div className="text-destructive">{t('aiCommon.loadError', { defaultValue: 'Có lỗi xảy ra khi tải dữ liệu' })}</div>
                        </CardContent>
                    </Card>
                ) : accumulatedResults.length === 0 ? (
                    <Card className="bg-card border-border border-dashed">
                        <CardContent className="py-16 text-center">
                            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium text-foreground mb-2">{t('aiCommon.notFound', { defaultValue: 'Không tìm thấy prompt' })}</p>
                            <p className="text-sm text-muted-foreground">{t('aiCommon.tryChangeFilters', { defaultValue: 'Thử thay đổi bộ lọc hoặc tạo prompt mới' })}</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {prompts.map((prompt: GeminiConfigPromptsEntity, index: number) => (
                            <Card
                                key={prompt.id}
                                ref={index === prompts.length - 1 ? lastPromptElementRef : null}
                                className="bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200 group cursor-pointer"
                                onClick={() => setSelectedPrompt(prompt)}
                            >
                                <CardContent className="p-6">
                                    <div className="relative flex items-start justify-between gap-4">
                                        {/* Left Content */}
                                        <div className="flex-1 min-w-0 space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start gap-3">
                                                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                                                    <Brain className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold text-foreground">{t('aiPrompts.itemTitle', { defaultValue: 'AI Prompt' })} #{prompt.id}</h3>
                                                        <Badge className={getStatusBadgeColor(prompt.isActive)}>
                                                            <Sparkles className="h-3 w-3 mr-1" />
                                                            {getStatusLabel(prompt.isActive, t)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Hash className="h-3 w-3" />
                                                            <span>{t('aiCommon.modelId', { defaultValue: 'Model ID' })}: {getModelName(prompt.geminiConfigModelId)} ({prompt.geminiConfigModelId})</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Prompt Content */}
                                            <div className="bg-muted/40 rounded-lg p-4 border border-border/50">
                                                <p className="text-sm font-mono text-foreground leading-relaxed line-clamp-4">
                                                    {prompt.prompt}
                                                </p>
                                            </div>

                                            {/* Footer Metadata */}
                                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{t('aiCommon.created', { defaultValue: 'Tạo' })}: {prompt.createdAt ? formatDate(prompt.createdAt) : 'N/A'}</span>
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>{t('aiCommon.updated', { defaultValue: 'Cập nhật' })}: {prompt.updatedAt ? formatDate(prompt.updatedAt) : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Actions */}
                                        <div className="absolute top-0 right-0 flex gap-2">
                                            <Trash2
                                                className="h-8 w-8 mr-2 text-red-500 hover:text-red-600 hover:bg-red-100 rounded-full p-2 cursor-pointer transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation()
                                                    setPromptIdToDelete(prompt.id)
                                                }}
                                            />
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
