import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog'
import { Brain, Calendar, Hash, Sparkles, Trash2, Loader2 } from 'lucide-react'
import { Badge } from '@ui/Badge'
import { Card, CardContent } from '@ui/Card'
import { Textarea } from '@ui/Textarea'
import { Switch } from '@ui/Switch'
import { Button } from '@ui/Button'
import { useTranslation } from 'react-i18next'
import { GeminiConfigPromptsEntity } from '@models/ai/entity'
import { formatDate } from '@utils/date'
import { getStatusBadgeColor } from '@atoms/BadgeStatusColor'
import { getStatusLabel } from '@atoms/StatusLabel'
import { useGetConfigCustomPromptsById, useUpdateConfigCustomPrompts, useGetAIGeminiModels, useGetAIConfigModels } from '@hooks/useAI'
import { useEffect, useMemo } from 'react'
import { Skeleton } from '@ui/Skeleton'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select'
import { toast } from 'react-toastify'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { updateGeminiConfigPromptsSchema, IUpdateGeminiConfigPromptsRequest } from '@models/ai/request'

interface EditAiPromptsProps {
    selectedPrompt: GeminiConfigPromptsEntity | null
    setSelectedPrompt: (prompt: GeminiConfigPromptsEntity | null) => void
}

const EditAiPrompts = ({ selectedPrompt, setSelectedPrompt }: EditAiPromptsProps) => {
    const { t } = useTranslation()
    const promptId = selectedPrompt?.id

    /**
     * Handle Get Config Custom Prompts By Id
     */
    const { data: promptData, isLoading: isLoadingPrompt, error: promptError } = useGetConfigCustomPromptsById(
        promptId || 0
    )
    //-----------------------End-----------------------//

    const prompt = (promptId && promptData) ? promptData : selectedPrompt
    const isLoading = promptId ? isLoadingPrompt : false

    /**
     * Handle Get Gemini Models
     * @returns 
     */
    const { data: geminiModels } = useGetAIGeminiModels()
    const { data: configModelsData } = useGetAIConfigModels({ page: 1, limit: 1000 })

    // Find config model and gemini model for display
    const configModel = useMemo(() => {
        if (!prompt?.geminiConfigModelId || !configModelsData?.results) return null
        return configModelsData.results.find((cm: any) => cm.id === prompt.geminiConfigModelId)
    }, [prompt?.geminiConfigModelId, configModelsData])

    const geminiModelName = useMemo(() => {
        if (configModel?.geminiModel) {
            return configModel.geminiModel.displayName || configModel.geminiModel.key
        }
        if (configModel?.geminiModelId && geminiModels) {
            const model = geminiModels.find((m: any) => m.id === configModel.geminiModelId)
            return model?.displayName || model?.key || `ID ${configModel.geminiModelId}`
        }
        return prompt?.geminiConfigModelId ? `Config Model ID: ${prompt.geminiConfigModelId}` : 'N/A'
    }, [configModel, geminiModels, prompt?.geminiConfigModelId])
    //-----------------------End-----------------------//

    /**
     * Handle Form with react-hook-form
     */
    const {
        control,
        handleSubmit,
        formState: { errors, isSubmitting },
        reset,
        watch,
    } = useForm<IUpdateGeminiConfigPromptsRequest>({
        resolver: zodResolver(updateGeminiConfigPromptsSchema(t)),
        defaultValues: {
            geminiConfigModelId: prompt?.geminiConfigModelId || 0,
            prompt: prompt?.prompt || '',
            isActive: prompt?.isActive || false,
        },
        mode: 'onChange',
    })

    // Watch prompt length for character count
    const promptValue = watch('prompt')

    // Update form when prompt data changes
    useEffect(() => {
        if (prompt) {
            reset({
                geminiConfigModelId: prompt.geminiConfigModelId,
                prompt: prompt.prompt,
                isActive: prompt.isActive,
            })
        }
    }, [prompt, reset])
    //-----------------------End-----------------------//

    /**
     * Handle Update Config Custom Prompts
     * @returns 
     */
    const updateMutation = useUpdateConfigCustomPrompts()

    const onSubmit = async (data: IUpdateGeminiConfigPromptsRequest) => {
        if (!promptId) return

        try {
            await updateMutation.mutateAsync({
                id: promptId,
                data,
            })
            setSelectedPrompt(null)
        } catch (error: any) {
            console.error('Failed to update prompt:', error)
            toast.error(error?.response?.data?.message || t('aiCommon.errorUpdating', { defaultValue: 'Lỗi khi cập nhật prompt' }))
        }
    }
    //-----------------------End-----------------------//

    const handleClose = () => {
        setSelectedPrompt(null)
        // Reset form when closing
        if (prompt) {
            reset({
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
            <DialogContent className="bg-white border-border max-w-4xl h-[90vh] overflow-hidden flex flex-col p-0">
                <DialogHeader className="border-b border-border pb-4 px-6 pt-6 space-y-3 flex-shrink-0">
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
                                        {t('aiCommon.modelId', { defaultValue: 'Model ID' })}: {geminiModelName} {prompt.geminiConfigModelId && `(${prompt.geminiConfigModelId})`}
                                    </p>
                                </>
                            ) : null}
                        </div>
                    </DialogTitle>
                </DialogHeader>

                {isLoading ? (
                    <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6" style={{ minHeight: 0 }}>
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
                    <div className="flex-1 overflow-y-auto py-6 px-6 flex items-center justify-center" style={{ minHeight: 0 }}>
                        <Card className="w-full">
                            <CardContent className="p-6 text-center">
                                <p className="text-destructive">
                                    {t('aiCommon.errorLoading', { defaultValue: 'Lỗi khi tải dữ liệu' })}
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                ) : prompt ? (
                    <form id="edit-prompt-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto py-6 px-6 space-y-6" style={{ minHeight: 0 }}>
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
                                    {t('aiCommon.modelId', { defaultValue: 'Config Model' })}
                                </label>
                                <Controller
                                    control={control}
                                    name="geminiConfigModelId"
                                    render={({ field }) => (
                                        <Select
                                            value={String(field.value)}
                                            onValueChange={(value) => field.onChange(parseInt(value) || 0)}
                                        >
                                            <SelectTrigger className={`bg-background border-border text-foreground h-11 ${errors.geminiConfigModelId ? 'border-destructive' : ''}`}>
                                                <SelectValue placeholder={t('aiCommon.selectModel', { defaultValue: 'Chọn config model' })} />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                {configModelsData?.results && Array.isArray(configModelsData.results) && configModelsData.results.length > 0 ? (
                                                    configModelsData.results.map((cm: any) => {
                                                        const modelName = cm.geminiModel?.displayName || cm.geminiModel?.key || `ID ${cm.geminiModelId}`
                                                        return (
                                                            <SelectItem key={cm.id} value={String(cm.id)}>
                                                                {cm.name} - {modelName}
                                                            </SelectItem>
                                                        )
                                                    })
                                                ) : (
                                                    <SelectItem value={String(field.value)} disabled>
                                                        {t('aiCommon.noModels', { defaultValue: 'Không có model' })}
                                                    </SelectItem>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    )}
                                />
                                {errors.geminiConfigModelId && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.geminiConfigModelId.message as string}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                    <Brain className="h-4 w-4 text-primary" />
                                    {t('aiPrompts.content', { defaultValue: 'Nội dung Prompt' })}
                                </label>
                                <Controller
                                    control={control}
                                    name="prompt"
                                    render={({ field }) => (
                                        <div className="relative">
                                            <Textarea
                                                rows={14}
                                                {...field}
                                                className={`bg-background border-border text-foreground font-mono text-sm leading-relaxed resize-none pr-20 ${errors.prompt ? 'border-destructive' : ''}`}
                                                placeholder={t('aiPrompts.contentPlaceholder', {
                                                    defaultValue: 'Nhập nội dung prompt...',
                                                })}
                                            />
                                            <div className="absolute bottom-3 right-3 px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
                                                {promptValue?.length || 0} {t('aiCommon.chars', { defaultValue: 'ký tự' })}
                                            </div>
                                        </div>
                                    )}
                                />
                                {errors.prompt && (
                                    <p className="text-sm text-destructive mt-1">
                                        {errors.prompt.message as string}
                                    </p>
                                )}
                            </div>

                            <Card className="bg-gradient-to-br from-muted/50 to-muted/20 border-border/50">
                                <CardContent className="p-5 flex items-center justify-between">
                                    <div className="space-y-1">
                                        <label className="text-sm font-semibold text-foreground flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-primary" />
                                            {t('aiPrompts.activeState', { defaultValue: 'Trạng thái hoạt động' })}
                                        </label>
                                        <p className="text-xs text-muted-foreground max-w-sm">
                                            {watch('isActive')
                                                ? t('aiPrompts.activeOn', {
                                                    defaultValue:
                                                        'Prompt đang được kích hoạt và có thể sử dụng trong hệ thống',
                                                })
                                                : t('aiPrompts.activeOff', {
                                                    defaultValue: 'Prompt hiện đang tắt và không thể sử dụng',
                                                })}
                                        </p>
                                    </div>
                                    <Controller
                                        control={control}
                                        name="isActive"
                                        render={({ field }) => (
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="data-[state=checked]:bg-primary"
                                            />
                                        )}
                                    />
                                </CardContent>
                            </Card>
                        </div>
                    </form>
                ) : null}

                {prompt && !isLoading && !promptError && (
                    <div className="flex justify-between items-center gap-3 pt-4 pb-6 px-6 border-t border-border flex-shrink-0">
                        <Button
                            type="button"
                            variant="outline"
                            className="text-destructive border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                            disabled={isLoading || isSubmitting || updateMutation.isPending}
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {t('aiCommon.deletePrompt', { defaultValue: 'Xóa prompt' })}
                        </Button>
                        <div className="flex gap-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                className="border-border text-foreground hover:bg-muted"
                                disabled={isSubmitting || updateMutation.isPending}
                            >
                                {t('aiCommon.cancel', { defaultValue: 'Hủy' })}
                            </Button>
                            <Button
                                type="submit"
                                form="edit-prompt-form"
                                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm"
                                disabled={isLoading || isSubmitting || updateMutation.isPending || !prompt}
                            >
                                {isSubmitting || updateMutation.isPending ? (
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
                )}
            </DialogContent>
        </Dialog>
    )
}

export default EditAiPrompts