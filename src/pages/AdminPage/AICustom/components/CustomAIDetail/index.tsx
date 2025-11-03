import { useMemo, useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import HeaderAdmin from '@organisms/Header/Admin'
import { Card, CardContent, CardHeader, CardTitle } from '@ui/Card'
import { Input } from '@ui/Input'
import { Button } from '@ui/Button'
import { Switch } from '@ui/Switch'
import { Badge } from '@ui/Badge'
import PaginationControls from '@ui/PaginationControls'
import { useGetAIModelConfigPolicySchema } from '@hooks/useAI'
import ModalEntityCustomAI from '@pages/AdminPage/AICustom/components/ModalEntity'
import { ChevronLeft, Database } from 'lucide-react'
import { useTranslation } from 'react-i18next'

const CustomAIDetail = () => {
    const { t } = useTranslation()
    const { configId } = useParams()
    const navigate = useNavigate()
    const [searchQuery, setSearchQuery] = useState('')
    const [debouncedSearch, setDebouncedSearch] = useState('')
    const { data, isLoading, error } = useGetAIModelConfigPolicySchema(debouncedSearch || undefined)

    // debounce local search bar (sent to API)
    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(searchQuery.trim()), 400)
        return () => clearTimeout(t)
    }, [searchQuery])

    const list = Array.isArray(data) ? data : []

    const filtered = useMemo(() => list, [list])

    // Selection state (schema names)
    const [selectedSchemas, setSelectedSchemas] = useState<Set<string>>(new Set())
    const [showEntityModal, setShowEntityModal] = useState(false)
    const [page, setPage] = useState(1)
    const [limit, setLimit] = useState(12)

    const totalItems = filtered.length
    const totalPages = Math.max(1, Math.ceil(totalItems / limit))
    const paginated = useMemo(() => {
        const start = (page - 1) * limit
        return filtered.slice(start, start + limit)
    }, [filtered, page, limit])

    useEffect(() => { setPage(1) }, [debouncedSearch])

    const isAllSelectedOnPage = paginated.length > 0 && paginated.every((s) => selectedSchemas.has(s))
    const toggleSelectAllOnPage = (checked: boolean) => {
        setSelectedSchemas(prev => {
            const next = new Set(prev)
            paginated.forEach((s) => checked ? next.add(s) : next.delete(s))
            return next
        })
    }
    const toggleSelectOne = (schema: string, checked: boolean) => {
        setSelectedSchemas(prev => {
            const next = new Set(prev)
            if (checked) next.add(schema); else next.delete(schema)
            return next
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

                <Card className="shadow-lg border-gray-200 overflow-hidden bg-white">
                    <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50 py-3">
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
                                    placeholder="e.g. Achievement"
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

                        {isLoading && <div className="text-sm text-muted-foreground">{t('aiCommon.loading', { defaultValue: 'Đang tải dữ liệu...' })}</div>}
                        {error && <div className="text-sm text-destructive">{t('aiCommon.loadError', { defaultValue: 'Có lỗi xảy ra khi tải dữ liệu' })}</div>}

                        {/* Quick actions */}
                        <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-2 00">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-green-300 transition-all duration-200 shadow-sm">
                                <Switch id="select-all-page" checked={isAllSelectedOnPage} onCheckedChange={toggleSelectAllOnPage} />
                                <label htmlFor="select-all-page" className="text-xs font-bold cursor-pointer hover:text-green-600 transition-colors select-none text-gray-700">
                                    {t('aiCommon.selectAll', { defaultValue: 'Select All' })}
                                </label>
                            </div>
                        </div>
                        {/* Schema grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                            {paginated.map((schema) => (
                                <div key={schema} className="group rounded-lg border border-gray-200 p-3 hover:shadow-lg hover:border-green-400 transition-all duration-200 bg-white">
                                    <div className="flex items-start gap-2">
                                        <div className="pt-0.5">
                                            <Switch id={`schema-${schema}`} checked={selectedSchemas.has(schema)} onCheckedChange={(val) => toggleSelectOne(schema, val)} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <label htmlFor={`schema-${schema}`} className="font-bold cursor-pointer text-xs text-gray-900 block group-hover:text-green-600 transition-colors leading-tight">
                                                {schema}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        <div className="pt-2">
                            <PaginationControls
                                currentPage={page}
                                totalPages={totalPages}
                                totalItems={totalItems}
                                itemsPerPage={limit}
                                onPageChange={(p) => setPage(p)}
                                onItemsPerPageChange={(size) => { setLimit(size); setPage(1) }}
                                isLoading={isLoading}
                            />
                        </div>



                        {/* No policy preview with current response shape */}
                    </CardContent>
                </Card>
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