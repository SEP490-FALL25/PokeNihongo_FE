import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@ui/Dialog'
import { Button } from '@ui/Button'
import { Brain, Plus } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Input } from '@ui/Input'
import { Textarea } from '@ui/Textarea'
import { Card, CardContent } from '@ui/Card'
import { Switch } from '@ui/Switch'

const AddAiPrompts = ({ showAddDialog, setShowAddDialog }: { showAddDialog: boolean, setShowAddDialog: (show: boolean) => void }) => {
    const { t } = useTranslation()
    return (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
                <Button className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    {t('aiPrompts.create', { defaultValue: 'Tạo mới' })}
                </Button>
            </DialogTrigger>
            <DialogContent className="bg-card border-border max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground flex items-center gap-2">
                        <Brain className="h-5 w-5 text-primary" />
                        {t('aiPrompts.createTitle', { defaultValue: 'Tạo AI Prompt mới' })}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t('aiCommon.modelId', { defaultValue: 'Model ID' })}</label>
                        <Input placeholder={t('aiCommon.modelIdPlaceholder', { defaultValue: 'Nhập model ID' })} className="bg-background border-border text-foreground" type="number" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">{t('aiPrompts.content', { defaultValue: 'Nội dung Prompt' })}</label>
                        <Textarea
                            rows={8}
                            placeholder={t('aiPrompts.contentPlaceholder', { defaultValue: 'Nhập nội dung prompt chi tiết...' })}
                            className="bg-background border-border text-foreground font-mono text-sm"
                        />
                    </div>
                    <Card className="bg-muted/30 border-0">
                        <CardContent className="p-4 flex items-center justify-between">
                            <div>
                                <label className="text-sm font-medium text-foreground block mb-1">{t('aiCommon.activeState', { defaultValue: 'Trạng thái hoạt động' })}</label>
                                <p className="text-xs text-muted-foreground">{t('aiPrompts.activeHint', { defaultValue: 'Kích hoạt để có thể sử dụng prompt' })}</p>
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
                        {t('aiCommon.cancel', { defaultValue: 'Hủy' })}
                    </Button>
                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                        <Plus className="h-4 w-4 mr-2" />
                        {t('aiPrompts.create', { defaultValue: 'Tạo mới' })}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default AddAiPrompts