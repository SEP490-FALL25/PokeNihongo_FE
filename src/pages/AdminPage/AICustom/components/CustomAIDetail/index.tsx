import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HeaderAdmin from '@organisms/Header/Admin'
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@ui/Card'
import { Input } from '@ui/Input'
import { Button } from '@ui/Button'
import { Switch } from '@ui/Switch'
import { Badge } from '@ui/Badge'
import PaginationControls from '@ui/PaginationControls'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@ui/Accordion'
import { Skeleton } from '@ui/Skeleton'
import { useGetAIConfigModelById, useGetAIModelConfigPolicySchemaFields } from '@hooks/useAI'
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
    const [selectedFields, setSelectedFields] = useState<Record<string, Set<string>>>({})
    const [showEntityModal, setShowEntityModal] = useState(false)
    const [expandedEntities, setExpandedEntities] = useState<string[]>([])
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(12)
    const [searchQuery, setSearchQuery] = useState('')

    // Initialize selectedSchemas from configData.extraParams.policy.entities
    useEffect(() => {
        if (entities.length > 0) {
            const entityNames = entities.map((entity: any) => entity.entity).filter(Boolean)
            setSelectedSchemas(new Set(entityNames))
        } else {
            setSelectedSchemas(new Set())
        }
    }, [entities])

    // Get schema fields for selected entities
    const selectedEntitiesArray = Array.from(selectedSchemas)
    const { data: schemaFieldsData, isLoading: isLoadingFields } = useGetAIModelConfigPolicySchemaFields(
        selectedEntitiesArray.length > 0 ? selectedEntitiesArray : []
    )

    // Initialize selectedFields from configData entities
    useEffect(() => {
        if (entities.length > 0 && schemaFieldsData) {
            const initialFields: Record<string, Set<string>> = {}
            entities.forEach((entity: any) => {
                if (entity.entity && entity.fields && Array.isArray(entity.fields)) {
                    initialFields[entity.entity] = new Set(entity.fields)
                }
            })
            if (Object.keys(initialFields).length > 0) {
                setSelectedFields(initialFields)
            }
        }
    }, [entities, schemaFieldsData])

    // Filter entities and fields based on search (local search only)
    const filteredSchemaFields = useMemo(() => {
        if (!schemaFieldsData || !searchQuery.trim()) return schemaFieldsData || {}
        const query = searchQuery.toLowerCase()
        const filtered: Record<string, string[]> = {}
        Object.entries(schemaFieldsData).forEach(([entityName, fields]) => {
            if (entityName.toLowerCase().includes(query)) {
                filtered[entityName] = fields as string[]
            } else {
                const matchingFields = (fields as string[]).filter((field: string) =>
                    field.toLowerCase().includes(query)
                )
                if (matchingFields.length > 0) {
                    filtered[entityName] = matchingFields
                }
            }
        })
        return filtered
    }, [schemaFieldsData, searchQuery])

    const entityKeys = useMemo(() => Object.keys(filteredSchemaFields), [filteredSchemaFields])
    const totalItems = entityKeys.length
    const totalPages = Math.max(1, Math.ceil(totalItems / limit))
    const paginatedEntityKeys = useMemo(() => {
        const start = (page - 1) * limit
        return entityKeys.slice(start, start + limit)
    }, [entityKeys, page, limit])

    useEffect(() => { setPage(1) }, [searchQuery])

    const toggleSelectEntityAllFields = (entityName: string, checked: boolean) => {
        setSelectedFields(prev => {
            const next = { ...prev }
            const fields = (filteredSchemaFields[entityName] || []) as string[]
            if (checked) {
                next[entityName] = new Set(fields)
            } else {
                delete next[entityName]
            }
            return next
        })
    }

    const toggleSelectField = (entityName: string, fieldName: string, checked: boolean) => {
        setSelectedFields(prev => {
            const next = { ...prev }
            if (!next[entityName]) next[entityName] = new Set()
            if (checked) {
                next[entityName].add(fieldName)
            } else {
                next[entityName].delete(fieldName)
                if (next[entityName].size === 0) {
                    delete next[entityName]
                }
            }
            return next
        })
    }

    const isAllFieldsSelectedInEntity = (entityName: string) => {
        const fields = (filteredSchemaFields[entityName] || []) as string[]
        const selected = selectedFields[entityName] || new Set()
        return fields.length > 0 && fields.every(field => selected.has(field))
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

                {/* Schema Entities & Fields Card - Always show when config is loaded */}
                {configData && !isLoadingConfig && (
                    <Card className="shadow-lg border-gray-200 overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 py-3">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-lg">⚙️</span>
                                        <CardTitle className="text-base font-bold text-gray-900">
                                            Schema Entities & Fields
                                        </CardTitle>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        {t('aiCustom.modalEntity.description', { defaultValue: 'Search and select schema entities to configure' })}
                                    </p>
                                    {selectedSchemas.size > 0 && (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-green-50 border border-green-200 rounded-lg">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-green-600"></span>
                                            </span>
                                            <span className="text-xs font-bold text-green-700">
                                                {selectedSchemas.size} {selectedSchemas.size === 1 ? 'entity' : 'entities'} selected
                                            </span>
                                        </div>
                                    )}
                                </div>
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

                            {/* Quick Actions */}
                            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-green-300 transition-all duration-200 shadow-sm">
                                    <Switch
                                        id="expand-all"
                                        checked={expandedEntities.length === paginatedEntityKeys.length && paginatedEntityKeys.length > 0}
                                        onCheckedChange={(val) => setExpandedEntities(val ? paginatedEntityKeys : [])}
                                    />
                                    <label htmlFor="expand-all" className="text-xs font-bold cursor-pointer hover:text-green-600 transition-colors select-none text-gray-700">
                                        Expand All
                                    </label>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 bg-gray-50">
                            <div className="mb-4">
                                <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5 mb-1.5">
                                    <span className="text-sm">🔎</span>
                                    {t('aiCommon.search', { defaultValue: 'Search' })}
                                </label>
                                <Input
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="e.g. UserTestAttempt, id, userId..."
                                    className="h-9 border border-gray-200 hover:border-green-400 transition-all duration-200 shadow-sm hover:shadow focus-visible:border-green-500 bg-white text-sm"
                                />
                            </div>

                            {isLoadingFields ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="rounded-xl border border-gray-200 p-4 bg-white animate-pulse">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-10 w-10 rounded-lg bg-gray-200" />
                                                    <div className="space-y-1.5">
                                                        <Skeleton className="h-4 w-24 bg-gray-200" />
                                                        <Skeleton className="h-3 w-16 bg-gray-200" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-8 w-12 rounded-full bg-gray-200" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : entityKeys.length === 0 ? (
                                <div className="text-center py-12 px-6 bg-white rounded-xl border border-dashed border-gray-300">
                                    <Database className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                                    <h3 className="font-bold text-base mb-2 text-gray-900">No Entities Found</h3>
                                    <p className="text-xs text-gray-600 max-w-md mx-auto">
                                        {selectedSchemas.size === 0
                                            ? 'Select entities to view their fields'
                                            : 'No entities match your current search criteria.'}
                                    </p>
                                </div>
                            ) : (
                                <Accordion type="multiple" value={expandedEntities} onValueChange={setExpandedEntities} className="w-full space-y-3">
                                    {paginatedEntityKeys.map((entityName) => {
                                        const fields = (filteredSchemaFields[entityName] || []) as string[]
                                        const isAllSelected = isAllFieldsSelectedInEntity(entityName)

                                        return (
                                            <AccordionItem
                                                key={entityName}
                                                value={entityName}
                                                className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:border-green-300 bg-white"
                                            >
                                                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-green-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-green-50 [&[data-state=open]]:to-green-50 transition-all duration-200">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-green-500 to-green-600 flex items-center justify-center shadow-md">
                                                            <span className="text-lg font-black text-white">{entityName.charAt(0)}</span>
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="font-bold text-sm text-gray-900 block">{entityName}</span>
                                                            <span className="text-[10px] font-semibold text-gray-500">
                                                                {fields.length} {fields.length !== 1 ? 'fields' : 'field'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-auto flex items-center gap-2 pr-1">
                                                        <label htmlFor={`select-entity-all-${entityName}`} className="text-xs font-bold text-gray-600 cursor-pointer hover:text-green-600 transition-colors select-none">
                                                            Select All
                                                        </label>
                                                        <Switch
                                                            id={`select-entity-all-${entityName}`}
                                                            checked={isAllSelected}
                                                            onCheckedChange={(val) => toggleSelectEntityAllFields(entityName, val)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
                                                        {fields.map((fieldName) => {
                                                            const isSelected = selectedFields[entityName]?.has(fieldName) || false
                                                            return (
                                                                <div
                                                                    key={`${entityName}-${fieldName}`}
                                                                    className="group rounded-lg border border-gray-200 p-3 hover:shadow-lg hover:border-green-400 transition-all duration-200 bg-white"
                                                                >
                                                                    <div className="flex items-start gap-2">
                                                                        <div className="pt-0.5">
                                                                            <Switch
                                                                                id={`field-${entityName}-${fieldName}`}
                                                                                checked={isSelected}
                                                                                onCheckedChange={(val) => toggleSelectField(entityName, fieldName, val)}
                                                                            />
                                                                        </div>
                                                                        <div className="flex-1 min-w-0">
                                                                            <label
                                                                                htmlFor={`field-${entityName}-${fieldName}`}
                                                                                className="font-bold cursor-pointer text-xs text-gray-900 block group-hover:text-green-600 transition-colors leading-tight"
                                                                            >
                                                                                {fieldName}
                                                                            </label>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        )
                                    })}
                                </Accordion>
                            )}
                        </CardContent>
                        <CardFooter className="border-t border-gray-200 bg-white py-3 pt-3">
                            <PaginationControls
                                currentPage={page}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                itemsPerPage={limit}
                                onPageChange={(p) => setPage(p)}
                                onItemsPerPageChange={(size) => { setLimit(size); setPage(1) }}
                                isLoading={isLoadingFields}
                            />
                        </CardFooter>
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