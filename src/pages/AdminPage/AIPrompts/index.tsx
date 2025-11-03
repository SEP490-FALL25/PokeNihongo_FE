import { useState, useMemo, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Badge } from "@ui/Badge"
import { Button } from "@ui/Button"
import { Input } from "@ui/Input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Textarea } from "@ui/Textarea"
import { Plus, Search, Edit, Trash2, MoreVertical, Loader2, Brain, Sparkles, Copy, Eye, Calendar, Hash } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ui/DropdownMenu"
import { Switch } from "@ui/Switch"
import HeaderAdmin from "@organisms/Header/Admin"
import { useConfigPromptsCustom } from "@hooks/useAI"
import { GeminiConfigPromptsEntity } from "@models/ai/entity"

export default function AIPromptManagement() {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [showAddDialog, setShowAddDialog] = useState(false)
    const [selectedPrompt, setSelectedPrompt] = useState<GeminiConfigPromptsEntity | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize] = useState(10)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [sortBy] = useState<string>("id")
    const [sortOrder] = useState<"asc" | "desc">("desc")

    // Build query params
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

    // Fetch prompts
    const { data, isLoading, error } = useConfigPromptsCustom(queryParams)

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

    const getStatusBadgeColor = (isActive: boolean) => {
        return isActive ? "bg-chart-4 text-white" : "bg-muted text-muted-foreground"
    }

    const getStatusLabel = (isActive: boolean) => {
        return isActive ? "Hoạt động" : "Không hoạt động"
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

    return (
        <>
            {/* Header */}
            <HeaderAdmin title="Quản lý AI Prompts" description="Quản lý các prompt ngữ cảnh cho AI trợ giúp học tập" />

            <div className="mt-24 p-8">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">Tổng prompts</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {pagination?.totalItem || 0}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">Trong hệ thống</p>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
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
                    <Card className="bg-card border-border">
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
                <Card className="bg-card border-border mb-4">
                    <CardContent className="py-4">
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                            <div className="flex-1 w-full sm:max-w-md relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm prompt..."
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
                                        <SelectValue placeholder="Trạng thái" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="active">Hoạt động</SelectItem>
                                        <SelectItem value="inactive">Tắt</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                                    <DialogTrigger asChild>
                                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                                            <Plus className="h-4 w-4 mr-2" />
                                            Tạo mới
                                        </Button>
                                    </DialogTrigger>
                                    <DialogContent className="bg-card border-border max-w-3xl">
                                        <DialogHeader>
                                            <DialogTitle className="text-foreground flex items-center gap-2">
                                                <Brain className="h-5 w-5 text-primary" />
                                                Tạo AI Prompt mới
                                            </DialogTitle>
                                        </DialogHeader>
                                        <div className="space-y-4 py-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Model ID</label>
                                                <Input placeholder="Nhập model ID" className="bg-background border-border text-foreground" type="number" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-foreground">Nội dung Prompt</label>
                                                <Textarea
                                                    rows={8}
                                                    placeholder="Nhập nội dung prompt chi tiết..."
                                                    className="bg-background border-border text-foreground font-mono text-sm"
                                                />
                                            </div>
                                            <Card className="bg-muted/30 border-0">
                                                <CardContent className="p-4 flex items-center justify-between">
                                                    <div>
                                                        <label className="text-sm font-medium text-foreground block mb-1">Trạng thái hoạt động</label>
                                                        <p className="text-xs text-muted-foreground">Kích hoạt để có thể sử dụng prompt</p>
                                                    </div>
                                                    <Switch />
                                                </CardContent>
                                            </Card>
                                        </div>
                                        <div className="flex justify-end gap-3">
                                            <Button
                                                variant="outline"
                                                onClick={() => setShowAddDialog(false)}
                                                className="border-border text-foreground"
                                            >
                                                Hủy
                                            </Button>
                                            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                                                <Plus className="h-4 w-4 mr-2" />
                                                Tạo prompt
                                            </Button>
                                        </div>
                                    </DialogContent>
                                </Dialog>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Prompts Grid */}
                {isLoading && currentPage === 1 && accumulatedResults.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16">
                        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                        <p className="text-muted-foreground">Đang tải dữ liệu...</p>
                    </div>
                ) : error ? (
                    <Card className="bg-card border-border border-destructive/50">
                        <CardContent className="py-12 text-center">
                            <div className="text-destructive">Có lỗi xảy ra khi tải dữ liệu</div>
                        </CardContent>
                    </Card>
                ) : accumulatedResults.length === 0 ? (
                    <Card className="bg-card border-border border-dashed">
                        <CardContent className="py-16 text-center">
                            <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-30" />
                            <p className="text-lg font-medium text-foreground mb-2">Không tìm thấy prompt</p>
                            <p className="text-sm text-muted-foreground">Thử thay đổi bộ lọc hoặc tạo prompt mới</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {prompts.map((prompt: GeminiConfigPromptsEntity, index: number) => (
                            <Card
                                key={prompt.id}
                                ref={index === prompts.length - 1 ? lastPromptElementRef : null}
                                className="bg-card border-border hover:border-primary/50 hover:shadow-lg transition-all duration-200 group"
                            >
                                <CardContent className="p-6">
                                    <div className="flex items-start justify-between gap-4">
                                        {/* Left Content */}
                                        <div className="flex-1 min-w-0 space-y-4">
                                            {/* Header */}
                                            <div className="flex items-start gap-3">
                                                <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl group-hover:from-primary/30 group-hover:to-primary/10 transition-all">
                                                    <Brain className="h-6 w-6 text-primary" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <h3 className="text-lg font-semibold text-foreground">AI Prompt #{prompt.id}</h3>
                                                        <Badge className={getStatusBadgeColor(prompt.isActive)}>
                                                            {getStatusLabel(prompt.isActive)}
                                                        </Badge>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-1">
                                                            <Hash className="h-3 w-3" />
                                                            <span>Model ID: {prompt.geminiConfigModelId}</span>
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
                                                    <span>Tạo: {prompt.createdAt ? formatDate(prompt.createdAt) : 'N/A'}</span>
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="h-3.5 w-3.5" />
                                                    <span>Cập nhật: {prompt.updatedAt ? formatDate(prompt.updatedAt) : 'N/A'}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right Actions */}
                                        <div className="flex flex-col gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-9 w-9 hover:bg-primary/10 hover:text-primary"
                                                onClick={() => setSelectedPrompt(prompt)}
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
                                                        onClick={() => setSelectedPrompt(prompt)}
                                                    >
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Chỉnh sửa
                                                    </DropdownMenuItem>
                                                    <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer">
                                                        <Copy className="h-4 w-4 mr-2" />
                                                        Sao chép
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
                                <span className="text-sm text-muted-foreground">Đang tải thêm prompts...</span>
                            </div>
                        )}

                        {/* End of list indicator */}
                        {!isLoading && pagination && pagination.current >= pagination.totalPage && accumulatedResults.length > 0 && (
                            <Card className="bg-muted/30 border-0">
                                <CardContent className="py-4 text-center">
                                    <p className="text-sm text-muted-foreground">
                                        ✓ Đã hiển thị tất cả {pagination.totalItem} prompts
                                    </p>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </div>

            {/* View/Edit Prompt Dialog */}
            {selectedPrompt && (
                <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
                    <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                        <DialogHeader className="border-b border-border pb-4 space-y-3">
                            <DialogTitle className="text-foreground flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
                                    <Brain className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold">AI Prompt #{selectedPrompt.id}</span>
                                        <Badge className={getStatusBadgeColor(selectedPrompt.isActive)}>
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            {getStatusLabel(selectedPrompt.isActive)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm font-normal text-muted-foreground mt-1 flex items-center gap-1.5">
                                        <Hash className="h-3.5 w-3.5" />
                                        Model ID: {selectedPrompt.geminiConfigModelId}
                                    </p>
                                </div>
                            </DialogTitle>
                        </DialogHeader>

                        <div className="flex-1 overflow-y-auto py-6 space-y-6">
                            {/* Metadata Cards */}
                            <div className="grid grid-cols-2 gap-4">
                                <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="h-4 w-4 text-primary" />
                                            <p className="text-xs font-medium text-muted-foreground">Ngày tạo</p>
                                        </div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {selectedPrompt.createdAt ? formatDate(selectedPrompt.createdAt) : 'N/A'}
                                        </p>
                                    </CardContent>
                                </Card>
                                <Card className="bg-gradient-to-br from-chart-2/5 to-transparent border-chart-2/20">
                                    <CardContent className="p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                            <Calendar className="h-4 w-4 text-chart-2" />
                                            <p className="text-xs font-medium text-muted-foreground">Cập nhật lần cuối</p>
                                        </div>
                                        <p className="text-sm font-semibold text-foreground">
                                            {selectedPrompt.updatedAt ? formatDate(selectedPrompt.updatedAt) : 'N/A'}
                                        </p>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Edit Form */}
                            <div className="space-y-5">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Hash className="h-4 w-4 text-primary" />
                                        Model ID
                                    </label>
                                    <Input
                                        defaultValue={selectedPrompt.geminiConfigModelId}
                                        className="bg-background border-border text-foreground h-11"
                                        type="number"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                        <Brain className="h-4 w-4 text-primary" />
                                        Nội dung Prompt
                                    </label>
                                    <div className="relative">
                                        <Textarea
                                            rows={14}
                                            defaultValue={selectedPrompt.prompt}
                                            className="bg-background border-border text-foreground font-mono text-sm leading-relaxed resize-none pr-20"
                                            placeholder="Nhập nội dung prompt..."
                                        />
                                        <div className="absolute bottom-3 right-3 px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
                                            {selectedPrompt.prompt.length} ký tự
                                        </div>
                                    </div>
                                </div>

                                <Card className="bg-gradient-to-br from-muted/50 to-muted/20 border-border/50">
                                    <CardContent className="p-5 flex items-center justify-between">
                                        <div className="space-y-1">
                                            <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                                <Sparkles className="h-4 w-4 text-primary" />
                                                Trạng thái hoạt động
                                            </label>
                                            <p className="text-xs text-muted-foreground max-w-sm">
                                                {selectedPrompt.isActive
                                                    ? 'Prompt đang được kích hoạt và có thể sử dụng trong hệ thống'
                                                    : 'Prompt hiện đang tắt và không thể sử dụng'}
                                            </p>
                                        </div>
                                        <Switch defaultChecked={selectedPrompt.isActive} className="data-[state=checked]:bg-primary" />
                                    </CardContent>
                                </Card>
                            </div>
                        </div>

                        <div className="flex justify-between items-center gap-3 pt-4 border-t border-border">
                            <Button
                                variant="outline"
                                className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                            >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Xóa prompt
                            </Button>
                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedPrompt(null)}
                                    className="border-border text-foreground hover:bg-muted"
                                >
                                    Hủy
                                </Button>
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    Lưu thay đổi
                                </Button>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )}
        </>
    )
}
