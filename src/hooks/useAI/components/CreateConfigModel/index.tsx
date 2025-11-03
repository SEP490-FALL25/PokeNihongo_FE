import z from 'zod'
import { Input } from '@ui/Input'
import { Textarea } from '@ui/Textarea'
import { Button } from '@ui/Button'
import { Switch } from '@ui/Switch'
import { Card, CardContent } from '@ui/Card'
import { useCreateAIGeminiConfigModels } from '@hooks/useAI'
import { createCreateGeminiConfigModelsSchema } from '@models/ai/request'
import { useTranslation } from 'react-i18next'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@ui/Dialog'

interface Props {
    showCreateDialog: boolean
    setShowCreateDialog: (show: boolean) => void
    onSuccess?: () => void
}

export default function CreateConfigModel({ showCreateDialog, setShowCreateDialog, onSuccess }: Props) {
    const { t } = useTranslation()
    const schema = createCreateGeminiConfigModelsSchema(t)
    type FormType = z.infer<typeof schema>

    const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<FormType>({
        resolver: zodResolver(schema),
        defaultValues: {
            name: '',
            geminiModelId: 1,
            maxTokens: 1024,
            jsonMode: false,
            systemInstruction: '',
            safetySettings: {},
            extraParams: { responseMimeType: 'application/json' },
            isEnabled: true,
            presetId: 1,
        },
        mode: 'onChange'
    })

    const createMutation = useCreateAIGeminiConfigModels()

    const onSubmit = (data: FormType) => {
        createMutation.mutate(data as any, {
            onSuccess: () => {
                onSuccess?.()
                reset()
            }
        })
    }

    return (
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogContent className="bg-white border-border max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-foreground">Tạo cấu hình model</DialogTitle>
                </DialogHeader>
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-foreground">Tên cấu hình</label>
                            <Controller control={control} name="name" render={({ field }) => (
                                <Input {...field} placeholder="Tên cấu hình" variant={`${errors.name ? 'destructive' : 'default'}`} />
                            )} />
                            {errors.name && <p className={`text-xs mt-1 ${errors.name ? 'block text-error' : 'hidden'}`}>{errors.name.message as string}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Gemini Model ID</label>
                            <Controller control={control} name="geminiModelId" render={({ field }) => (
                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} placeholder="Gemini Model ID" variant={`${errors.geminiModelId ? 'destructive' : 'default'}`} />
                            )} />
                            {errors.geminiModelId && <p className={`text-xs mt-1 ${errors.geminiModelId ? 'block text-error' : 'hidden'}`}>{errors.geminiModelId.message as string}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Max Tokens</label>
                            <Controller control={control} name="maxTokens" render={({ field }) => (
                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} placeholder="Max Tokens" variant={`${errors.maxTokens ? 'destructive' : 'default'}`} />
                            )} />
                            {errors.maxTokens && <p className={`text-xs mt-1 ${errors.maxTokens ? 'block text-error' : 'hidden'}`}>{errors.maxTokens.message as string}</p>}
                        </div>
                        <div>
                            <label className="text-sm font-medium text-foreground">Preset ID</label>
                            <Controller control={control} name="presetId" render={({ field }) => (
                                <Input type="number" {...field} onChange={(e) => field.onChange(Number(e.target.value))} placeholder="Preset ID" variant={`${errors.presetId ? 'destructive' : 'default'}`} />
                            )} />
                            {errors.presetId && <p className={`text-xs mt-1 ${errors.presetId ? 'block text-error' : 'hidden'}`}>{errors.presetId.message as string}</p>}
                        </div>
                    </div>

                    <div>
                        <label className="text-sm font-medium text-foreground">System Instruction</label>
                        <Controller control={control} name="systemInstruction" render={({ field }) => (
                            <Textarea rows={6} {...field} placeholder="System Instruction" className={`${errors.systemInstruction ? 'border-error focus-visible:ring-error' : 'border-border focus-visible:ring-ring'}`} />
                        )} />
                        {errors.systemInstruction && <p className={`text-xs mt-1 ${errors.systemInstruction ? 'block text-error' : 'hidden'}`}>{errors.systemInstruction.message as string}</p>}
                    </div>

                    <Card className="bg-muted/30 border-border/50">
                        <CardContent className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
                            <div>
                                <label className="text-sm font-medium text-foreground">Response MIME Type</label>
                                <Controller control={control} name="extraParams.responseMimeType" render={({ field }) => (
                                    <Input {...field} placeholder="Response MIME Type" variant={`${errors.extraParams?.responseMimeType ? 'destructive' : 'default'}`} />
                                )} />
                                {errors.extraParams?.responseMimeType && <p className={`text-xs mt-1 ${errors.extraParams?.responseMimeType ? 'block text-error' : 'hidden'}`}>{errors.extraParams.responseMimeType.message as string}</p>}
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-foreground">JSON Mode</label>
                                    <p className="text-xs text-muted-foreground mt-1">Bật để yêu cầu trả về JSON</p>
                                </div>
                                <Controller control={control} name="jsonMode" render={({ field }) => (
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                )} />
                            </div>
                            <div className="flex items-center justify-between">
                                <div>
                                    <label className="text-sm font-medium text-foreground">Kích hoạt</label>
                                    <p className="text-xs text-muted-foreground mt-1">Cho phép cấu hình được sử dụng</p>
                                </div>
                                <Controller control={control} name="isEnabled" render={({ field }) => (
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                )} />
                            </div>
                        </CardContent>
                    </Card>

                    <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" disabled={isSubmitting || createMutation.isPending} onClick={() => reset()}>
                            Làm mới
                        </Button>
                        <Button type="submit" disabled={isSubmitting || createMutation.isPending} className="bg-primary text-primary-foreground hover:bg-primary/90">
                            {createMutation.isPending ? 'Đang tạo...' : 'Tạo model'}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}


