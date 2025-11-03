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
import { useGetAIConfigModelById, useGetAIModelConfigPolicySchemaFields, useUpdateModelConfigsPolicySchema } from '@hooks/useAI'
import ModalEntityCustomAI from '@pages/AdminPage/AICustom/components/ModalEntity'
import { ChevronLeft, Database, Settings, Brain, Sparkles, Hash, Calendar, Code, CheckCircle2, XCircle, Loader2, Undo, Redo, Save } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AI_POLICY_SCOPE, PURPOSE_POLICY_AI } from '@constants/ai'

const CustomAIDetail = () => {
    const { t } = useTranslation()
    const { configId } = useParams()
    const navigate = useNavigate()

    // Get config detail
    const configIdNumber = configId ? parseInt(configId, 10) : 0
    const { data: configData, isLoading: isLoadingConfig, error: configError } = useGetAIConfigModelById(configIdNumber)

    // Extract entities and policy info from configData
    const initialPolicy = useMemo(() => {
        if (!configData?.extraParams) return null
        return (configData.extraParams as any)?.policy || null
    }, [configData])

    const entities = useMemo(() => {
        if (!configData?.extraParams) return []
        const policyEntities = (configData.extraParams as any)?.policy?.entities
        const directEntities = configData.extraParams.entities
        const result = Array.isArray(policyEntities) ? policyEntities : (Array.isArray(directEntities) ? directEntities : [])
        console.log('🔍 entities from configData:', result)
        return result
    }, [configData])

    // Draft state (local changes, not saved yet)
    type DraftState = {
        selectedSchemas: Set<string>
        selectedFields: Record<string, Set<string>>
    }
    const [history, setHistory] = useState<DraftState[]>([])
    const [historyIndex, setHistoryIndex] = useState<number>(-1)
    const [showEntityModal, setShowEntityModal] = useState(false)
    const [expandedEntities, setExpandedEntities] = useState<string[]>([])
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(15)
    const [searchQuery, setSearchQuery] = useState('')

    // Derive selectedSchemas and selectedFields directly from entities
    const selectedSchemasFromEntities = useMemo(() => {
        if (entities.length > 0) {
            const entityNames = new Set(entities.map((e: any) => e.entity).filter(Boolean))
            console.log('🔍 selectedSchemasFromEntities:', Array.from(entityNames))
            return entityNames
        }
        console.log('🔍 selectedSchemasFromEntities: empty')
        return new Set<string>()
    }, [entities])

    const selectedFieldsFromEntities = useMemo(() => {
        const fieldsMap: Record<string, Set<string>> = {}
        entities.forEach((entity: any) => {
            if (entity.entity && entity.fields && Array.isArray(entity.fields)) {
                fieldsMap[entity.entity] = new Set(entity.fields)
            }
        })
        return fieldsMap
    }, [entities])

    // Initialize draft from configData
    useEffect(() => {
        if (entities.length > 0) {
            const initialDraft: DraftState = {
                selectedSchemas: selectedSchemasFromEntities,
                selectedFields: selectedFieldsFromEntities
            }
            setHistory([initialDraft])
            setHistoryIndex(0)
        } else if (configData && entities.length === 0) {
            // Config exists but no entities - initialize empty
            const emptyDraft: DraftState = { selectedSchemas: new Set(), selectedFields: {} }
            setHistory([emptyDraft])
            setHistoryIndex(0)
        }
    }, [entities, configData, selectedSchemasFromEntities, selectedFieldsFromEntities])

    // Get current draft from history
    const currentDraft = useMemo(() => {
        if (historyIndex >= 0 && historyIndex < history.length) {
            return history[historyIndex]
        }
        // Return entities state if history not initialized yet
        return { selectedSchemas: selectedSchemasFromEntities, selectedFields: selectedFieldsFromEntities }
    }, [history, historyIndex, selectedSchemasFromEntities, selectedFieldsFromEntities])

    const selectedSchemas = currentDraft.selectedSchemas
    const selectedFields = currentDraft.selectedFields

    // Push new state to history
    const pushHistory = (nextDraft: DraftState) => {
        const base = history.slice(0, historyIndex + 1)
        const newHistory = [...base, nextDraft]
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
    }

    const handleUndo = () => {
        if (historyIndex <= 0) return
        setHistoryIndex(historyIndex - 1)
    }

    const handleRedo = () => {
        if (historyIndex >= history.length - 1) return
        setHistoryIndex(historyIndex + 1)
    }

    // Get schema fields for selected entities
    const selectedEntitiesArray = Array.from(selectedSchemas)
    console.log('🔍 selectedEntitiesArray for API:', selectedEntitiesArray)
    console.log('🔍 selectedSchemas size:', selectedSchemas.size)
    const { data: schemaFieldsData, isLoading: isLoadingFields } = useGetAIModelConfigPolicySchemaFields(selectedEntitiesArray)
    console.log('🔍 schemaFieldsData:', schemaFieldsData)
    console.log('🔍 isLoadingFields:', isLoadingFields)

    // Filter entities and fields based on search (local search only)
    const filteredSchemaFields = useMemo(() => {
        if (!schemaFieldsData) return {}
        if (!searchQuery.trim()) return schemaFieldsData
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
        const nextDraft: DraftState = {
            selectedSchemas: new Set(selectedSchemas),
            selectedFields: { ...selectedFields }
        }
        const fields = (filteredSchemaFields[entityName] || []) as string[]
        if (checked) {
            nextDraft.selectedFields[entityName] = new Set(fields)
        } else {
            delete nextDraft.selectedFields[entityName]
        }
        pushHistory(nextDraft)
    }

    const toggleSelectField = (entityName: string, fieldName: string, checked: boolean) => {
        const nextDraft: DraftState = {
            selectedSchemas: new Set(selectedSchemas),
            selectedFields: { ...selectedFields }
        }
        if (!nextDraft.selectedFields[entityName]) nextDraft.selectedFields[entityName] = new Set()
        if (checked) {
            nextDraft.selectedFields[entityName].add(fieldName)
        } else {
            nextDraft.selectedFields[entityName].delete(fieldName)
            if (nextDraft.selectedFields[entityName].size === 0) {
                delete nextDraft.selectedFields[entityName]
            }
        }
        pushHistory(nextDraft)
    }

    // Check if draft has changes
    const isDirty = useMemo(() => {
        if (historyIndex !== history.length - 1) return true
        const initialDraft = history[0] || { selectedSchemas: new Set(), selectedFields: {} }
        const current = history[historyIndex] || { selectedSchemas: new Set(), selectedFields: {} }

        // Compare schemas
        if (initialDraft.selectedSchemas.size !== current.selectedSchemas.size) return true
        for (const schema of initialDraft.selectedSchemas) {
            if (!current.selectedSchemas.has(schema)) return true
        }
        for (const schema of current.selectedSchemas) {
            if (!initialDraft.selectedSchemas.has(schema)) return true
        }

        // Compare fields
        const initialKeys = Object.keys(initialDraft.selectedFields)
        const currentKeys = Object.keys(current.selectedFields)
        if (initialKeys.length !== currentKeys.length) return true

        for (const entityName of initialKeys) {
            const initialFields = initialDraft.selectedFields[entityName] || new Set()
            const currentFields = current.selectedFields[entityName] || new Set()
            if (initialFields.size !== currentFields.size) return true
            for (const field of initialFields) {
                if (!currentFields.has(field)) return true
            }
        }

        return false
    }, [history, historyIndex])

    // Save mutation
    const { mutateAsync: updatePolicySchema, isPending: isSaving } = useUpdateModelConfigsPolicySchema()

    const handleSave = async () => {
        if (!configData || !initialPolicy) return

        const current = history[historyIndex]

        // Build entities array from draft
        const entitiesArray = Array.from(current.selectedSchemas).map(entityName => {
            const fields = Array.from(current.selectedFields[entityName] || [])
            // Get scope from original entity or default to SELF_ONLY
            const originalEntity = entities.find((e: any) => e.entity === entityName)
            const scope = originalEntity?.scope || AI_POLICY_SCOPE.SELF_ONLY

            return {
                entity: entityName,
                scope: scope as any,
                fields: fields,
            }
        })

        const payload = {
            policy: {
                purpose: (initialPolicy.purpose || PURPOSE_POLICY_AI.PERSONALIZED_RECOMMENDATIONS) as any,
                entities: entitiesArray,
                maskingRules: initialPolicy.maskingRules || {},
            }
        }

        await updatePolicySchema({ modelId: configIdNumber, data: payload })

        // Reset history after save
        const savedDraft: DraftState = {
            selectedSchemas: new Set(current.selectedSchemas),
            selectedFields: { ...current.selectedFields }
        }
        setHistory([savedDraft])
        setHistoryIndex(0)
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

                                {/* Undo/Redo */}
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleUndo}
                                        disabled={historyIndex <= 0}
                                        className={`p-2 rounded-lg border border-gray-200 hover:border-green-300 transition-all ${historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        title="Undo"
                                    >
                                        <Undo className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={handleRedo}
                                        disabled={historyIndex >= history.length - 1}
                                        className={`p-2 rounded-lg border border-gray-200 hover:border-green-300 transition-all ${historyIndex >= history.length - 1 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        title="Redo"
                                    >
                                        <Redo className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Save Button */}
                                {isDirty && (
                                    <Button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        size="sm"
                                        className="bg-gradient-to-r from-green-600 to-green-600 hover:from-green-700 hover:to-green-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-bold h-9 px-6 text-sm"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="h-4 w-4 mr-2" />
                                                Save Changes
                                            </>
                                        )}
                                    </Button>
                                )}
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
                                                        <div className="text-left flex-1">
                                                            <span className="font-bold text-sm text-gray-900 block">{entityName}</span>
                                                            <div className="flex items-center gap-2 mt-0.5">
                                                                <span className="text-[10px] font-medium text-gray-500">
                                                                    {fields.length} {fields.length !== 1 ? 'fields' : 'field'} total
                                                                </span>
                                                                {selectedFields[entityName] && selectedFields[entityName].size > 0 && (
                                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 border border-green-300">
                                                                        <span className="relative flex h-1.5 w-1.5">
                                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75"></span>
                                                                            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-600"></span>
                                                                        </span>
                                                                        <span className="text-[10px] font-bold text-green-700">
                                                                            {selectedFields[entityName].size}/{fields.length} selected
                                                                        </span>
                                                                    </span>
                                                                )}
                                                            </div>
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
                    const nextDraft: DraftState = {
                        selectedSchemas: new Set(selected),
                        selectedFields: { ...selectedFields }
                    }
                    // Remove fields for entities that are no longer selected
                    Object.keys(nextDraft.selectedFields).forEach(entityName => {
                        if (!nextDraft.selectedSchemas.has(entityName)) {
                            delete nextDraft.selectedFields[entityName]
                        }
                    })
                    pushHistory(nextDraft)
                }}
            />
        </>
    )
}

export default CustomAIDetail