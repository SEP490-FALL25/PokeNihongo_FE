import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HeaderAdmin from '@organisms/Header/Admin'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/Card'
import { Input } from '@ui/Input'
import { Button } from '@ui/Button'
import { Switch } from '@ui/Switch'
import { Badge } from '@ui/Badge'
import PaginationControls from '@ui/PaginationControls'
import { useGetAIConfigModelById } from '@hooks/useAI'
import ModalEntityCustomAI from '@pages/AdminPage/AICustom/components/ModalEntity'
import { ChevronLeft, Database, Settings, Brain, Sparkles, Hash, Calendar, Code, CheckCircle2, XCircle, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const CustomAIDetail = () => {
    const { t } = useTranslation()
    const { configId } = useParams()
    const navigate = useNavigate()

    // Get config detail
    const configIdNumber = configId ? parseInt(configId, 10) : 0
    const { data: configData, isLoading: isLoadingConfig, error: configError } = useGetAIConfigModelById(configIdNumber)

    // Extract entities from configData
    const entities = useMemo(() => {
        if (!configData?.extraParams) return []
        const policyEntities = (configData.extraParams as any)?.policy?.entities
        const directEntities = configData.extraParams.entities
        return Array.isArray(policyEntities) ? policyEntities : (Array.isArray(directEntities) ? directEntities : [])
    }, [configData])

    // Selection state (schema names)
    const [selectedSchemas, setSelectedSchemas] = useState<Set<string>>(new Set())
    const [showEntityModal, setShowEntityModal] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(12)

    // Initialize selectedSchemas from configData.extraParams.policy.entities
    useEffect(() => {
        if (entities.length > 0) {
            const entityNames = entities.map((entity: any) => entity.entity).filter(Boolean)
            setSelectedSchemas(new Set(entityNames))
        } else {
            setSelectedSchemas(new Set())
        }
    }, [entities])

    // Filter entities based on search (local search only)
    const [searchQuery, setSearchQuery] = useState('')
    const filteredEntities = useMemo(() => {
        if (!searchQuery.trim()) return entities
        const query = searchQuery.toLowerCase()
        return entities.filter((entity: any) =>
            entity.entity?.toLowerCase().includes(query) ||
            entity.scope?.toLowerCase().includes(query) ||
            entity.fields?.some((field: string) => field.toLowerCase().includes(query))
        )
    }, [entities, searchQuery])

    const totalItems = filteredEntities.length
    const totalPages = Math.max(1, Math.ceil(totalItems / limit))
    const paginated = useMemo(() => {
        const start = (page - 1) * limit
        return filteredEntities.slice(start, start + limit)
    }, [filteredEntities, page, limit])

    useEffect(() => { setPage(1) }, [searchQuery])

    const isAllSelectedOnPage = paginated.length > 0 && paginated.every((entity: any) => selectedSchemas.has(entity.entity))
    const toggleSelectAllOnPage = (checked: boolean) => {
        setSelectedSchemas(prev => {
            const next = new Set(prev)
            paginated.forEach((entity: any) => {
                if (entity.entity) {
                    checked ? next.add(entity.entity) : next.delete(entity.entity)
                }
            })
            return next
        })
    }
    const toggleSelectOne = (entityName: string, checked: boolean) => {
        setSelectedSchemas(prev => {
            const next = new Set(prev)
            if (checked) next.add(entityName); else next.delete(entityName)
            return next
        })
    }

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

    return (
        <>
            <HeaderAdmin
                title={`Config #${configId}`}
                description={t('aiCustom.detailTitle', { defaultValue: 'Chi tiết cấu hình' }) as string}
            />

            <div className="mt-24 p-6">
                <Button variant="outline" className="mb-4" onClick={() => navigate(-1)}>
                    <ChevronLeft className="h-4 w-4 mr-2" />
                    {t('common.back', { defaultValue: 'Quay lại' })}
                </Button>

                {/* Config Detail Card */}
                {isLoadingConfig ? (
                    <Card className="mb-6 bg-slate-50 border-border shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-center py-8">
                                <Loader2 className="h-6 w-6 animate-spin text-primary mr-3" />
                                <span className="text-sm text-muted-foreground">{t('aiCommon.loading', { defaultValue: 'Đang tải dữ liệu...' })}</span>
                            </div>
                        </CardContent>
                    </Card>
                ) : configError ? (
                    <Card className="mb-6 bg-slate-50 border-border border-destructive/50 shadow-md">
                        <CardContent className="p-6">
                            <div className="text-center py-8">
                                <div className="text-destructive">{t('aiCommon.loadError', { defaultValue: 'Có lỗi xảy ra khi tải dữ liệu' })}</div>
                            </div>
                        </CardContent>
                    </Card>
                ) : configData ? (
                    <Card className="mb-6 bg-slate-50 border-border shadow-md">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between gap-4">
                                {/* Left Content */}
                                <div className="flex-1 min-w-0 space-y-4">
                                    {/* Header */}
                                    <div className="flex items-start gap-3">
                                        <div className="p-3 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
                                            <Settings className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                                                <h3 className="text-lg font-semibold text-foreground">{configData.name}</h3>
                                                <Badge className={getStatusBadgeColor(configData.isEnabled)}>
                                                    {configData.isEnabled ? (
                                                        <CheckCircle2 className="h-3 w-3 mr-1" />
                                                    ) : (
                                                        <XCircle className="h-3 w-3 mr-1" />
                                                    )}
                                                    {getStatusLabel(configData.isEnabled)}
                                                </Badge>
                                                {configData.jsonMode && (
                                                    <Badge className="bg-chart-2 text-white">
                                                        <Code className="h-3 w-3 mr-1" />
                                                        {t('aiCustom.jsonMode', { defaultValue: 'JSON Mode' })}
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-3 text-sm text-muted-foreground flex-wrap">
                                                <div className="flex items-center gap-1">
                                                    <Brain className="h-3 w-3" />
                                                    <span>{t('aiCustom.modelLabel', { defaultValue: 'Model' })}: {configData.geminiModel?.key || `ID ${configData.geminiModelId}`}</span>
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    <Sparkles className="h-3 w-3" />
                                                    <span>{t('aiCustom.presetLabel', { defaultValue: 'Preset' })}: {configData.preset?.name || `ID ${configData.presetId}`}</span>
                                                </div>
                                                <span>•</span>
                                                <div className="flex items-center gap-1">
                                                    <Hash className="h-3 w-3" />
                                                    <span>{t('aiCustom.maxTokens', { defaultValue: 'Max Tokens' })}: {configData.maxTokens}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* System Instruction Preview */}
                                    <div className="bg-muted/40 rounded-lg p-4 border border-border/50">
                                        <p className="text-xs font-medium text-muted-foreground mb-2">{t('aiCustom.systemInstruction', { defaultValue: 'System Instruction:' })}</p>
                                        <p className="text-sm font-mono text-foreground leading-relaxed line-clamp-3">
                                            {configData.systemInstruction}
                                        </p>
                                    </div>

                                    {/* Extra Info */}
                                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{t('aiCommon.created', { defaultValue: 'Tạo' })}: {configData.createdAt ? formatDate(configData.createdAt) : 'N/A'}</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{t('aiCommon.updated', { defaultValue: 'Cập nhật' })}: {configData.updatedAt ? formatDate(configData.updatedAt) : 'N/A'}</span>
                                        </div>
                                        <span>•</span>
                                        <div className="flex items-center gap-1.5">
                                            <Code className="h-3.5 w-3.5" />
                                            <span>MIME: {configData.extraParams?.responseMimeType || 'N/A'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ) : null}

                {/* Schema Entities Card - Always show when config is loaded */}
                {configData && !isLoadingConfig && (
                    <Card className="shadow-lg border-gray-200 overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 py-6">
                            <div className="flex items-center gap-1.5">
                                <span className="text-base">⚙️</span>
                                <div>
                                    <CardTitle className="text-base font-bold text-gray-900">Schema Entities</CardTitle>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {t('aiCustom.modalEntity.description', { defaultValue: 'Search and select schema entities to configure' })}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 pb-4 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
                                <div className="flex-1 w-full sm:max-w-md">
                                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                                        <span className="text-sm">🔎</span>
                                        {t('aiCommon.search', { defaultValue: 'Search' })}
                                    </label>
                                    <Input
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="e.g. UserAnswerLog"
                                        className="h-9 border border-gray-200 hover:border-green-400 transition-all duration-200 shadow-sm hover:shadow focus-visible:border-green-500 bg-white text-sm"
                                    />
                                </div>
                                <div className="mt-6 sm:mt-0">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowEntityModal(true)}
                                        className="border-border hover:bg-primary/10 hover:border-primary"
                                    >
                                        <Database className="h-4 w-4 mr-2" />
                                        {t('aiCustom.selectEntities', { defaultValue: 'Chọn Entities' })}
                                        {selectedSchemas.size > 0 && (
                                            <Badge className="ml-2 bg-primary text-primary-foreground">{selectedSchemas.size}</Badge>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {entities.length === 0 && (
                                <div className="text-center py-8">
                                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <p className="text-sm text-muted-foreground">
                                        {t('aiCustom.noPolicyEntities', { defaultValue: 'Config này không có policy entities được cấu hình' })}
                                    </p>
                                </div>
                            )}

                            {/* Quick actions */}
                            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-2 00">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-green-300 transition-all duration-200 shadow-sm">
                                    <Switch id="select-all-page" checked={isAllSelectedOnPage} onCheckedChange={toggleSelectAllOnPage} />
                                    <label htmlFor="select-all-page" className="text-xs font-bold cursor-pointer hover:text-green-600 transition-colors select-none text-gray-700">
                                        {t('aiCommon.selectAll', { defaultValue: 'Select All' })}
                                    </label>
                                </div>
                            </div>
                            {/* Entities grid */}
                            {entities.length > 0 && (
                                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                                    {paginated.map((entity: any, index: number) => (
                                        <div key={`${entity.entity}-${index}`} className="group rounded-lg border border-gray-200 p-3 hover:shadow-lg hover:border-green-400 transition-all duration-200 bg-white">
                                            <div className="flex items-start gap-2">
                                                <div className="pt-0.5">
                                                    <Switch
                                                        id={`entity-${entity.entity}-${index}`}
                                                        checked={selectedSchemas.has(entity.entity)}
                                                        onCheckedChange={(val) => toggleSelectOne(entity.entity, val)}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <label htmlFor={`entity-${entity.entity}-${index}`} className="cursor-pointer">
                                                        <div className="font-bold text-xs text-gray-900 block group-hover:text-green-600 transition-colors leading-tight mb-1">
                                                            {entity.entity}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground">
                                                            <span className="inline-block px-1.5 py-0.5 rounded bg-muted/60 mr-1 mb-1">
                                                                {entity.scope}
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                {entity.fields?.length || 0} fields
                                                            </span>
                                                        </div>
                                                    </label>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Pagination */}
                            <div className="pt-2">
                                <PaginationControls
                                    currentPage={page}
                                    totalPages={totalPages}
                                    totalItems={totalItems}
                                    itemsPerPage={limit}
                                    onPageChange={(p) => setPage(p)}
                                    onItemsPerPageChange={(size) => { setLimit(size); setPage(1) }}
                                    isLoading={isLoadingConfig}
                                />
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>

            {/* Entity Selection Modal */}
            <ModalEntityCustomAI
                open={showEntityModal}
                onOpenChange={setShowEntityModal}
                initialSelected={Array.from(selectedSchemas)}
                onConfirm={(selected) => {
                    setSelectedSchemas(new Set(selected))
                }}
            />
        </>
    )
}

export default CustomAIDetail