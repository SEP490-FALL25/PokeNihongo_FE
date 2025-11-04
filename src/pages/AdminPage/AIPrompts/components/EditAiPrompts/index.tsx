import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog'
import { Brain, Calendar, Hash, Sparkles, Trash2, Loader2 } from 'lucide-react'
import { Badge } from '@ui/Badge'
import { Card, CardContent } from '@ui/Card'
import { Input } from '@ui/Input'
import { Textarea } from '@ui/Textarea'
import { Switch } from '@ui/Switch'
import { Button } from '@ui/Button'
import { useTranslation } from 'react-i18next'
import { GeminiConfigPromptsEntity } from '@models/ai/entity'
import { formatDate } from '@utils/date'
import { getStatusBadgeColor } from '@atoms/BadgeStatusColor'
import { getStatusLabel } from '@atoms/StatusLabel'
import { useGetConfigCustomPromptsById, useUpdateConfigCustomPrompts } from '@hooks/useAI'
import { useState, useEffect } from 'react'
import { Skeleton } from '@ui/Skeleton'

interface EditAiPromptsProps {
    selectedPrompt: GeminiConfigPromptsEntity | null
    setSelectedPrompt: (prompt: GeminiConfigPromptsEntity | null) => void
}

const EditAiPrompts = ({ selectedPrompt, setSelectedPrompt }: EditAiPromptsProps) => {
    const { t } = useTranslation()
    const promptId = selectedPrompt?.id

    // Fetch prompt detail by id (only fetch if we have a valid id)
    const { data: promptData, isLoading: isLoadingPrompt, error: promptError } = useGetConfigCustomPromptsById(
        promptId || 0
    )

    // Use data from hook if available, otherwise fallback to prop
    // Only use hook data if we actually fetched with a valid id
    const prompt = (promptId && promptData) ? promptData : selectedPrompt
    const isLoading = promptId ? isLoadingPrompt : false

    // Form state
    const [formData, setFormData] = useState({
        geminiConfigModelId: prompt?.geminiConfigModelId || 0,
        prompt: prompt?.prompt || '',
        isActive: prompt?.isActive || false,
    })

    // Update form data when prompt data changes
    useEffect(() => {
        if (prompt) {
            setFormData({
                geminiConfigModelId: prompt.geminiConfigModelId,
                prompt: prompt.prompt,
                isActive: prompt.isActive,
            })
        }
    }, [prompt])

    // Update mutation
    const updateMutation = useUpdateConfigCustomPrompts()

    const handleSubmit = async () => {
        if (!promptId) return

        try {
            await updateMutation.mutateAsync({
                id: promptId,
                data: formData,
            })
            setSelectedPrompt(null)
        } catch (error) {
            // Error is handled by the hook
            console.error('Failed to update prompt:', error)
        }
    }

    const handleClose = () => {
        setSelectedPrompt(null)
        // Reset form when closing
        if (prompt) {
            setFormData({
                geminiConfigModelId: prompt.geminiConfigModelId,
                prompt: prompt.prompt,
                isActive: prompt.isActive,
            })
        }
    }

    if (!selectedPrompt && !promptId) {
        return null
    }

    return (
        <Dialog open={!!selectedPrompt} onOpenChange={handleClose}>
            <DialogContent className="bg-white border-border max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="border-b border-border pb-4 space-y-3">
                    <DialogTitle className="text-foreground flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
                            <Brain className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            {isLoading ? (
                                <div className="space-y-2">
                                    <Skeleton className="h-7 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            ) : promptError ? (
                                <div className="text-destructive">
                                    {t('aiCommon.errorLoading', { defaultValue: 'Lỗi khi tải dữ liệu' })}
                                </div>
                            ) : prompt ? (
                                <>
                                    <div className="flex items-center gap-3">
                                        <span className="text-xl font-bold">
                                            {t('aiPrompts.itemTitle', { defaultValue: 'AI Prompt' })} #{prompt.id}
                                        </span>
                                        <Badge className={getStatusBadgeColor(prompt.isActive)}>
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            {getStatusLabel(prompt.isActive, t)}
                                        </Badge>
                                    </div>
                                    <p className="text-sm font-normal text-muted-foreground mt-1 flex items-center gap-1.5">
                                        <Hash className="h-3.5 w-3.5" />
                                        {t('aiCommon.modelId', { defaultValue: 'Model ID' })}: {prompt.geminiConfigModelId}
                                    </p>
                                </>
                            ) : null}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex-1 overflow-y-auto py-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <Skeleton className="h-20 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                        <div className="space-y-4">
                            <Skeleton className="h-10 w-full" />
                            <Skeleton className="h-64 w-full" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                ) : promptError ? (
                    <div className="flex-1 overflow-y-auto py-6 flex items-center justify-center">
                        <Card className="w-full">
                            <CardContent className="p-6 text-center">
                                <p className="text-destructive">
                                    {t('aiCommon.errorLoading', { defaultValue: 'Lỗi khi tải dữ liệu' })}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                ) : prompt ? (
                    <div className="flex-1 overflow-y-auto py-6 space-y-6">
                        {/* Metadata Cards */}
                        <div className="grid grid-cols-2 gap-4">
                            <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="h-4 w-4 text-primary" />
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {t('aiCommon.createdAt', { defaultValue: 'Ngày tạo' })}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {prompt.createdAt ? formatDate(prompt.createdAt) : 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card className="bg-gradient-to-br from-chart-2/5 to-transparent border-chart-2/20">
                                <CardContent className="p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="h-4 w-4 text-chart-2" />
                                        <p className="text-xs font-medium text-muted-foreground">
                                            {t('aiCommon.updatedAt', { defaultValue: 'Cập nhật lần cuối' })}
                                        </p>
                                    </div>
                                    <p className="text-sm font-semibold text-foreground">
                                        {prompt.updatedAt ? formatDate(prompt.updatedAt) : 'N/A'}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Edit Form */}
                        <div className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Hash className="h-4 w-4 text-primary" />
                                    {t('aiCommon.modelId', { defaultValue: 'Model ID' })}
                                </label>
                                <Input
                                    value={formData.geminiConfigModelId}
                                    onChange={(e) =>
                                        setFormData({
                                            ...formData,
                                            geminiConfigModelId: parseInt(e.target.value) || 0,
                                        })
                                    }
                                    className="bg-background border-border text-foreground h-11"
                                    type="number"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-primary" />
                                    {t('aiPrompts.content', { defaultValue: 'Nội dung Prompt' })}
                                </label>
                                <div className="relative">
                                    <Textarea
                                        rows={14}
                                        value={formData.prompt}
                                        onChange={(e) =>
                                            setFormData({
                                                ...formData,
                                                prompt: e.target.value,
                                            })
                                        }
                                        className="bg-background border-border text-foreground font-mono text-sm leading-relaxed resize-none pr-20"
                                        placeholder={t('aiPrompts.contentPlaceholder', {
                                            defaultValue: 'Nhập nội dung prompt...',
                                        })}
                                    />
                                    <div className="absolute bottom-3 right-3 px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
                                        {formData.prompt.length} {t('aiCommon.chars', { defaultValue: 'ký tự' })}
                                    </div>
                                </div>
                            </div>

                            <Card className="bg-gradient-to-br from-muted/50 to-muted/20 border-border/50">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            {t('aiPrompts.activeState', { defaultValue: 'Trạng thái hoạt động' })}
                                        </label>
                                        <p className="text-xs text-muted-foreground max-w-sm">
                                            {formData.isActive
                                                ? t('aiPrompts.activeOn', {
                                                    defaultValue:
                                                        'Prompt đang được kích hoạt và có thể sử dụng trong hệ thống',
                                                })
                                                : t('aiPrompts.activeOff', {
                                                    defaultValue: 'Prompt hiện đang tắt và không thể sử dụng',
                                                })}
                                        </p>
                                    </div>
                                    <Switch
                                        checked={formData.isActive}
                                        onCheckedChange={(checked) =>
                                            setFormData({
                                                ...formData,
                                                isActive: checked,
                                            })
                                        }
                                        className="data-[state=checked]:bg-primary"
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                ) : null}

                <div className="flex justify-between items-center gap-3 pt-4 border-t border-border">
                    <Button
                        variant="outline"
                        className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                        disabled={isLoading || updateMutation.isPending}
                    >
                        <Trash2 className="h-4 w-4 mr-2" />
                        {t('aiCommon.deletePrompt', { defaultValue: 'Xóa prompt' })}
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={handleClose}
                            className="border-border text-foreground hover:bg-muted"
                            disabled={updateMutation.isPending}
                        >
                            {t('aiCommon.cancel', { defaultValue: 'Hủy' })}
                        </Button>
                        <Button
                            onClick={handleSubmit}
                            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                            disabled={isLoading || updateMutation.isPending || !prompt}
                        >
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t('aiCommon.saving', { defaultValue: 'Đang lưu...' })}
                                </>
                            ) : (
                                <>
                                    <Sparkles className="h-4 w-4 mr-2" />
                                    {t('aiCommon.saveChanges', { defaultValue: 'Lưu thay đổi' })}
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EditAiPrompts