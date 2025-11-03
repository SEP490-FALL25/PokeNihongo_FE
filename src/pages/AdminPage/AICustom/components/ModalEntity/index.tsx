import { useState, useMemo, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@ui/Dialog'
import { Input } from '@ui/Input'
import { Button } from '@ui/Button'
import { Card, CardContent } from '@ui/Card'
import { Switch } from '@ui/Switch'
import { Badge } from '@ui/Badge'
import { Search, Loader2, CheckCircle2 } from 'lucide-react'
import { useGetAIModelConfigPolicySchema } from '@hooks/useAI'
import { useTranslation } from 'react-i18next'

interface Props {
    open: boolean
    onOpenChange: (open: boolean) => void
    onConfirm?: (selectedSchemas: string[]) => void
    initialSelected?: string[]
}

const ModalEntityCustomAI = ({ open, onOpenChange, onConfirm, initialSelected = [] }: Props) => {
    const { t } = useTranslation()
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
    const [selectedSchemas, setSelectedSchemas] = useState<Set<string>>(new Set(initialSelected))

    // Fetch schema data with search query
    const { data, isLoading, error } = useGetAIModelConfigPolicySchema(debouncedSearchQuery || undefined)

    // Initialize selected schemas from props
    useEffect(() => {
        if (open && initialSelected.length > 0) {
            setSelectedSchemas(new Set(initialSelected))
        } else if (open && initialSelected.length === 0) {
            setSelectedSchemas(new Set())
        }
    }, [open, initialSelected])

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearchQuery(searchQuery.trim()), 400)
        return () => clearTimeout(timer)
    }, [searchQuery])

    // Filter schemas based on search
    const schemas = useMemo(() => {
        const list = Array.isArray(data) ? data : []
        if (!debouncedSearchQuery) return list
        const searchKey = debouncedSearchQuery.toLowerCase().trim()
        return list.filter((schema: string) => schema.toLowerCase().includes(searchKey))
    }, [data, debouncedSearchQuery])

    const toggleSelect = (schema: string) => {
        setSelectedSchemas(prev => {
            const next = new Set(prev)
            if (next.has(schema)) {
                next.delete(schema)
            } else {
                next.add(schema)
            }
            return next
        })
    }

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedSchemas(new Set(schemas))
        } else {
            setSelectedSchemas(new Set())
        }
    }

    const isAllSelected = schemas.length > 0 && schemas.every((s: string) => selectedSchemas.has(s))

    const handleConfirm = () => {
        if (onConfirm) {
            onConfirm(Array.from(selectedSchemas))
        }
        onOpenChange(false)
    }

    const handleCancel = () => {
        setSearchQuery('')
        setDebouncedSearchQuery('')
        onOpenChange(false)
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader>
                    <DialogTitle className="text-xl font-bold">
                        {t('aiCustom.modalEntity.title', { defaultValue: 'Select Schema Entities' })}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                        {t('aiCustom.modalEntity.description', { defaultValue: 'Search and select schema entities to configure' })}
                    </p>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder={t('aiCustom.modalEntity.searchPlaceholder', { defaultValue: 'Search schema entities...' })}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="pl-10"
                        />
                    </div>

                    {/* Select All */}
                    {schemas.length > 0 && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 border border-border">
                            <Switch
                                id="select-all-schemas"
                                checked={isAllSelected}
                                onCheckedChange={toggleSelectAll}
                            />
                            <label htmlFor="select-all-schemas" className="text-sm font-medium cursor-pointer">
                                {t('aiCommon.selectAll', { defaultValue: 'Select All' })} ({selectedSchemas.size} / {schemas.length})
                            </label>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="flex flex-col items-center justify-center py-12">
                            <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
                            <p className="text-sm text-muted-foreground">
                                {t('aiCommon.loading', { defaultValue: 'Đang tải dữ liệu...' })}
                            </p>
                        </div>
                    )}

                    {/* Error State */}
                    {error && (
                        <Card className="border-destructive/50 bg-destructive/10">
                            <CardContent className="py-6 text-center">
                                <p className="text-sm text-destructive">
                                    {t('aiCommon.loadError', { defaultValue: 'Có lỗi xảy ra khi tải dữ liệu' })}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Empty State */}
                    {!isLoading && !error && schemas.length === 0 && (
                        <Card className="border-dashed">
                            <CardContent className="py-12 text-center">
                                <p className="text-sm text-muted-foreground">
                                    {debouncedSearchQuery
                                        ? t('aiCustom.modalEntity.noResults', { defaultValue: 'Không tìm thấy schema nào' })
                                        : t('aiCustom.modalEntity.noData', { defaultValue: 'Không có dữ liệu' })}
                                </p>
                            </CardContent>
                        </Card>
                    )}

                    {/* Schema List */}
                    {!isLoading && !error && schemas.length > 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                            {schemas.map((schema: string) => {
                                const isSelected = selectedSchemas.has(schema)
                                return (
                                    <Card
                                        key={schema}
                                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${isSelected
                                            ? 'border-primary bg-primary/5 shadow-sm'
                                            : 'border-border hover:border-primary/50'
                                            }`}
                                        onClick={() => toggleSelect(schema)}
                                    >
                                        <CardContent className="p-4">
                                            <div className="flex items-start gap-3">
                                                <div className="pt-1">
                                                    <Switch
                                                        checked={isSelected}
                                                        onCheckedChange={() => toggleSelect(schema)}
                                                        onClick={(e) => e.stopPropagation()}
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <h3 className="font-semibold text-sm text-foreground">{schema}</h3>
                                                        {isSelected && (
                                                            <Badge className="bg-primary text-primary-foreground text-[10px] px-1.5 py-0">
                                                                <CheckCircle2 className="h-2.5 w-2.5 mr-1" />
                                                                {t('aiCommon.selected', { defaultValue: 'Selected' })}
                                                            </Badge>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )
                            })}
                        </div>
                    )}
                </div>

                <DialogFooter className="border-t pt-4 mt-4">
                    <Button variant="outline" onClick={handleCancel}>
                        {t('common.cancel', { defaultValue: 'Hủy' })}
                    </Button>
                    <Button onClick={handleConfirm} disabled={selectedSchemas.size === 0}>
                        {t('common.confirm', { defaultValue: 'Xác nhận' })} ({selectedSchemas.size})
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export default ModalEntityCustomAI
