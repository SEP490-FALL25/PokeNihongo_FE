import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog'
import { Brain, Calendar, Hash, Sparkles, Trash2 } from 'lucide-react'
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

interface EditAiPromptsProps {
    selectedPrompt: GeminiConfigPromptsEntity
    setSelectedPrompt: (prompt: GeminiConfigPromptsEntity | null) => void
}

const EditAiPrompts = ({ selectedPrompt, setSelectedPrompt }: EditAiPromptsProps) => {
    const { t } = useTranslation()
    return (
        <Dialog open={!!selectedPrompt} onOpenChange={() => setSelectedPrompt(null)}>
            <DialogContent className="bg-card border-border max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
                <DialogHeader className="border-b border-border pb-4 space-y-3">
                    <DialogTitle className="text-foreground flex items-center gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-primary/20 to-primary/5 rounded-xl">
                            <Brain className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1">
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-bold">{t('aiPrompts.itemTitle', { defaultValue: 'AI Prompt' })} #{selectedPrompt.id}</span>
                                <Badge className={getStatusBadgeColor(selectedPrompt.isActive)}>
                                    <Sparkles className="h-3 w-3 mr-1" />
                                    {getStatusLabel(selectedPrompt.isActive, t)}
                                </Badge>
                            </div>
                            <p className="text-sm font-normal text-muted-foreground mt-1 flex items-center gap-1.5">
                                <Hash className="h-3.5 w-3.5" />
                                {t('aiCommon.modelId', { defaultValue: 'Model ID' })}: {selectedPrompt.geminiConfigModelId}
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
                                    <p className="text-xs font-medium text-muted-foreground">{t('aiCommon.createdAt', { defaultValue: 'Ngày tạo' })}</p>
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
                                    <p className="text-xs font-medium text-muted-foreground">{t('aiCommon.updatedAt', { defaultValue: 'Cập nhật lần cuối' })}</p>
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
                                {t('aiCommon.modelId', { defaultValue: 'Model ID' })}
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
                                {t('aiPrompts.content', { defaultValue: 'Nội dung Prompt' })}
                            </label>
                            <div className="relative">
                                <Textarea
                                    rows={14}
                                    defaultValue={selectedPrompt.prompt}
                                    className="bg-background border-border text-foreground font-mono text-sm leading-relaxed resize-none pr-20"
                                    placeholder={t('aiPrompts.contentPlaceholder', { defaultValue: 'Nhập nội dung prompt...' })}
                                />
                                <div className="absolute bottom-3 right-3 px-2 py-1 bg-muted rounded text-xs font-medium text-muted-foreground">
                                    {selectedPrompt.prompt.length} {t('aiCommon.chars', { defaultValue: 'ký tự' })}
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
                                        {selectedPrompt.isActive
                                            ? t('aiPrompts.activeOn', { defaultValue: 'Prompt đang được kích hoạt và có thể sử dụng trong hệ thống' })
                                            : t('aiPrompts.activeOff', { defaultValue: 'Prompt hiện đang tắt và không thể sử dụng' })}
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
                        {t('aiCommon.deletePrompt', { defaultValue: 'Xóa prompt' })}
                    </Button>
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setSelectedPrompt(null)}
                            className="border-border text-foreground hover:bg-muted"
                        >
                            {t('aiCommon.cancel', { defaultValue: 'Hủy' })}
                        </Button>
                        <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                            <Sparkles className="h-4 w-4 mr-2" />
                            {t('aiCommon.saveChanges', { defaultValue: 'Lưu thay đổi' })}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default EditAiPrompts