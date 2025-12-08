import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@ui/Dialog";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Switch } from "@ui/Switch";
import { useUpdateVocabulary } from "@hooks/useVocabulary";
import { IUpdateVocabularyPayload } from "@models/vocabulary/request";
import ImageDropzone from "@ui/ImageDropzone/ImageDropzone";
import AudioDropzone from "@ui/AudioDropzone";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";

interface UpdateVocabularyDialogProps {
    vocabulary: MODELS.VocabularyForUpdate | null;
    onClose: () => void;
}

type UpdateVocabularyFormValues = {
    reading: string;
    imageUrl?: File | null;
    audioUrl?: File | null;
    regenerateAudio: boolean;
};

const UpdateVocabularyDialog = ({ vocabulary, onClose }: UpdateVocabularyDialogProps) => {
    const { t } = useTranslation();
    const { control, handleSubmit, reset, formState: { isSubmitting }, watch, setValue } = useForm<UpdateVocabularyFormValues>({
        defaultValues: {
            reading: vocabulary?.reading || "",
            imageUrl: null,
            audioUrl: null,
            regenerateAudio: false,
        }
    });

    const updateMutation = useUpdateVocabulary();

    useEffect(() => {
        reset({
            reading: vocabulary?.reading || "",
            imageUrl: null,
            audioUrl: null,
            regenerateAudio: false,
        });
    }, [vocabulary, reset]);

    const regenerateAudio = watch("regenerateAudio");

    const onSubmit = async (values: UpdateVocabularyFormValues) => {
        if (!vocabulary) return;
        if (!values.reading?.trim()) {
            toast.error(t("validation.readingRequired", "Reading is required"));
            return;
        }

        const payload: IUpdateVocabularyPayload = {
            reading: values.reading.trim(),
        };

        if (values.imageUrl) {
            payload.imageUrl = values.imageUrl;
        }

        if (values.audioUrl) {
            payload.audioUrl = values.audioUrl;
        }

        try {
            await updateMutation.mutateAsync({
                wordJp: vocabulary.wordJp,
                regenerateAudio: values.regenerateAudio,
                payload,
            });
            onClose();
        } catch (error) {
            console.error("Failed to update vocabulary", error);
        }
    };

    return (
        <Dialog open={!!vocabulary} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-white max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-foreground">
                        {t("vocabulary.updateDialog.title", "Cập nhật từ vựng")}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <p className="text-sm font-medium text-muted-foreground">{t("vocabulary.listVocabulary.columns.wordJp")}</p>
                        <Input value={vocabulary?.wordJp || ""} disabled />
                    </div>

                    <div className="space-y-1.5">
                        <p className="text-sm font-medium text-muted-foreground">{t("vocabulary.listVocabulary.columns.reading")}</p>
                        <Controller
                            name="reading"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Input {...field} placeholder={t("vocabulary.updateDialog.readingPlaceholder", "Nhập cách đọc mới")} />
                            )}
                        />
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{t("vocabulary.updateDialog.mediaSection", "Tệp đính kèm (tùy chọn)")}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Controller
                                name="imageUrl"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <ImageDropzone value={value || undefined} onChange={onChange} />
                                )}
                            />
                            <Controller
                                name="audioUrl"
                                control={control}
                                render={({ field: { onChange, value } }) => (
                                    <AudioDropzone value={value || undefined} onChange={onChange} />
                                )}
                            />
                        </div>
                        {(vocabulary?.imageUrl || vocabulary?.audioUrl) && (
                            <div className="space-y-2">
                                {vocabulary?.imageUrl && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">{t("vocabulary.updateDialog.currentImage", "Ảnh hiện tại")}</p>
                                        <div className="w-40 h-28 rounded-md border border-dashed border-gray-200 overflow-hidden bg-muted/30">
                                            <img
                                                src={vocabulary.imageUrl}
                                                alt="current vocabulary"
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    </div>
                                )}
                                {vocabulary?.audioUrl && (
                                    <div className="space-y-1">
                                        <p className="text-xs text-muted-foreground">{t("vocabulary.updateDialog.currentAudio", "Audio hiện tại")}</p>
                                        <audio controls className="w-full">
                                            <source src={vocabulary.audioUrl} />
                                        </audio>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-3">
                        <Switch
                            checked={!!regenerateAudio}
                            onCheckedChange={(checked) => setValue("regenerateAudio", checked)}
                        />
                        <span className="text-sm text-foreground">
                            {t("vocabulary.updateDialog.regenerateAudio", "Tự động sinh audio mới bằng TTS nếu không tải audio")}
                        </span>
                    </div>

                    <DialogFooter className="pt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending || isSubmitting}>
                            {t("common.cancel", "Hủy")}
                        </Button>
                        <Button type="submit" className="bg-primary text-primary-foreground" disabled={updateMutation.isPending || isSubmitting}>
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t("vocabulary.updateDialog.updating", "Đang cập nhật...")}
                                </>
                            ) : (
                                t("vocabulary.updateDialog.save", "Lưu thay đổi")
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateVocabularyDialog;

