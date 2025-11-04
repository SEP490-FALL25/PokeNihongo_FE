import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog'
import { Button } from '@ui/Button'
import { Brain, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Textarea } from '@ui/Textarea'
import { Card, CardContent } from '@ui/Card'
import { Switch } from '@ui/Switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select'
import { useGetAIConfigModels, useCreateConfigCustomPrompts } from '@hooks/useAI'
import { useState } from 'react'
import { IUpdateGeminiConfigPromptsRequest } from '@models/ai/request'

interface IAddAiPromptsProps {
    showAddDialog: boolean
    setShowAddDialog: (show: boolean) => void
}

const AddAiPrompts = ({ showAddDialog, setShowAddDialog }: IAddAiPromptsProps) => {
    const { t } = useTranslation()

    /**
     * Handle Get Config Models
     */
    const { data: configModelsData } = useGetAIConfigModels({ page: 1, limit: 1000 })
    //------------------------End------------------------//


    /**
     * Handle Create Config Custom Prompts
     */
    const createMutation = useCreateConfigCustomPrompts()

    const [isActive, setIsActive] = useState<boolean>(false)
    const [geminiConfigModelId, setGeminiConfigModelId] = useState<number>(0)
    const [prompt, setPrompt] = useState<string>('')

    const handleSubmit = async () => {
        if (!geminiConfigModelId || !prompt.trim()) {
            return
        }

        const data: IUpdateGeminiConfigPromptsRequest = {
            geminiConfigModelId,
            prompt: prompt.trim(),
            isActive,
        }

        try {
            await createMutation.mutateAsync(data)
            setShowAddDialog(false)
            setGeminiConfigModelId(0)
            setPrompt('')
            setIsActive(false)
        } catch (error) {
            console.error('Error creating prompt:', error)
        }
    }
    //------------------------End------------------------//

    return (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('aiPrompts.create', { defaultValue: 'Tạo mới' })}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-white border-border max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        {t('aiPrompts.createTitle', { defaultValue: 'Tạo AI Prompt mới' })}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t('aiCommon.modelId', { defaultValue: 'Config Model' })}</label>
                        <Select
                            value={geminiConfigModelId ? String(geminiConfigModelId) : ''}
                            onValueChange={(value) => setGeminiConfigModelId(parseInt(value) || 0)}
                        >
                            <SelectTrigger className="bg-background border-border text-foreground h-11">
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
                                    <SelectItem value="" disabled>
                                        {t('aiCommon.noModels', { defaultValue: 'Không có model' })}
                                    </SelectItem>
                                )}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t('aiPrompts.content', { defaultValue: 'Nội dung Prompt' })}</label>
                        <Textarea
                            rows={8}
                            placeholder={t('aiPrompts.contentPlaceholder', { defaultValue: 'Nhập nội dung prompt chi tiết...' })}
                            className="bg-background border-border text-foreground font-mono text-sm"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                        />
                    </div>
                    <Card className="bg-muted/30 border-0">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-foreground block mb-1">{t('aiCommon.activeState', { defaultValue: 'Trạng thái hoạt động' })}</label>
                                <p className="text-xs text-muted-foreground">{t('aiPrompts.activeHint', { defaultValue: 'Kích hoạt để có thể sử dụng prompt' })}</p>
                            </div>
                            <Switch checked={isActive} onCheckedChange={setIsActive} />
                        </CardContent>
                    </Card>
                </div>
                <div className="flex justify-end gap-3">
                    <Button
                        variant="outline"
                        onClick={() => {
                            setShowAddDialog(false)
                            // Reset form
                            setGeminiConfigModelId(0)
                            setPrompt('')
                            setIsActive(false)
                        }}
                        className="border-border text-foreground"
                        disabled={createMutation.isPending}
                    >
                        {t('aiCommon.cancel', { defaultValue: 'Hủy' })}
                    </Button>
                    <Button
                        className="bg-primary text-primary-foreground hover:bg-primary/90"
                        onClick={handleSubmit}
                        disabled={createMutation.isPending || !geminiConfigModelId || !prompt.trim()}
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        {createMutation.isPending ? t('aiCommon.saving', { defaultValue: 'Đang lưu...' }) : t('aiPrompts.create', { defaultValue: 'Tạo mới' })}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddAiPrompts