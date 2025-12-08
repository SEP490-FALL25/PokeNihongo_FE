import { useEffect, useMemo } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@ui/Dialog";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { Plus, Trash2, Loader2 } from "lucide-react";
import { useUpdateKanjiWithMeaning } from "@hooks/useKanji";
import { IKanjiWithMeaningRequest } from "@models/kanji/request";
import { KanjiManagement } from "@models/kanji/entity";
import { useTranslation } from "react-i18next";

type UpdateKanjiFormValues = IKanjiWithMeaningRequest;

interface UpdateKanjiDialogProps {
    kanjiToEdit: KanjiManagement | null;
    onClose: () => void;
}

const UpdateKanjiDialog = ({ kanjiToEdit, onClose }: UpdateKanjiDialogProps) => {
    const { t } = useTranslation();

    const initialReadings = useMemo(() => {
        if (!kanjiToEdit) return [{ readingType: "onyomi", reading: "" }];

        const readings: { readingType: string; reading: string }[] = [];

        if (kanjiToEdit.onyomi) {
            kanjiToEdit.onyomi.split(/[,;]+/).map((r) => r.trim()).filter(Boolean).forEach((r) => {
                readings.push({ readingType: "onyomi", reading: r });
            });
        }

        if (kanjiToEdit.kunyomi) {
            kanjiToEdit.kunyomi.split(/[,;]+/).map((r) => r.trim()).filter(Boolean).forEach((r) => {
                readings.push({ readingType: "kunyomi", reading: r });
            });
        }

        if (readings.length === 0) {
            readings.push({ readingType: "onyomi", reading: "" });
        }

        return readings;
    }, [kanjiToEdit]);

    const initialMeanings = useMemo(() => {
        if (!kanjiToEdit) return [{ translations: { vi: "", en: "" } }];
        const baseMeaning = kanjiToEdit.meaning || "";
        return [{ translations: { vi: baseMeaning, en: baseMeaning } }];
    }, [kanjiToEdit]);

    const { control, handleSubmit, register, reset, setValue, watch } = useForm<UpdateKanjiFormValues>({
        defaultValues: {
            character: kanjiToEdit?.kanji || "",
            strokeCount: kanjiToEdit?.strokeCount || 0,
            jlptLevel: kanjiToEdit?.jlptLevel || 5,
            image: null,
            readings: initialReadings,
            meanings: initialMeanings,
        },
    });

    const { fields: readingsFields, append: appendReading, remove: removeReading } = useFieldArray({ control, name: "readings" });
    const { fields: meaningFields, append: appendMeaning, remove: removeMeaning } = useFieldArray({ control, name: "meanings" });

    const updateMutation = useUpdateKanjiWithMeaning();

    useEffect(() => {
        reset({
            character: kanjiToEdit?.kanji || "",
            strokeCount: kanjiToEdit?.strokeCount || 0,
            jlptLevel: kanjiToEdit?.jlptLevel || 5,
            image: null,
            readings: initialReadings,
            meanings: initialMeanings,
        });
    }, [kanjiToEdit, reset, initialReadings, initialMeanings]);

    const onSubmit = async (values: UpdateKanjiFormValues) => {
        if (!kanjiToEdit) return;

        await updateMutation.mutateAsync({
            identifier: kanjiToEdit.id,
            data: values,
        });
        onClose();
    };

    return (
        <Dialog open={!!kanjiToEdit} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-white max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="text-xl font-semibold text-foreground">
                        {t("vocabulary.kanji.updateDialog.title", "Cập nhật Kanji")}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium text-muted-foreground">{t("vocabulary.kanji.createKanji.character")}</p>
                            <Input {...register("character")} disabled />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium text-muted-foreground">{t("vocabulary.kanji.createKanji.strokeCount")}</p>
                            <Input type="number" {...register("strokeCount", { valueAsNumber: true })} />
                        </div>
                        <div className="space-y-1.5">
                            <p className="text-sm font-medium text-muted-foreground">{t("vocabulary.kanji.createKanji.jlptLevel")}</p>
                            <Controller
                                control={control}
                                name="jlptLevel"
                                render={({ field }) => (
                                    <Select value={String(field.value)} onValueChange={(v) => field.onChange(Number(v))}>
                                        <SelectTrigger>
                                            <SelectValue placeholder={t("vocabulary.kanji.createKanji.selectLevel")} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="5">N5</SelectItem>
                                            <SelectItem value="4">N4</SelectItem>
                                            <SelectItem value="3">N3</SelectItem>
                                            <SelectItem value="2">N2</SelectItem>
                                            <SelectItem value="1">N1</SelectItem>
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{t("vocabulary.kanji.createKanji.tabs.readings")}</p>
                        {readingsFields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-2 gap-2 items-center">
                                <Select
                                    value={watch(`readings.${index}.readingType`) || field.readingType}
                                    onValueChange={(value) => setValue(`readings.${index}.readingType`, value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={t("vocabulary.kanji.createKanji.readingType")} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="onyomi">{t("vocabulary.kanji.createKanji.readingTypes.onyomi")}</SelectItem>
                                        <SelectItem value="kunyomi">{t("vocabulary.kanji.createKanji.readingTypes.kunyomi")}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Input {...register(`readings.${index}.reading` as const)} defaultValue={field.reading} />
                                <input type="hidden" {...register(`readings.${index}.readingType` as const)} defaultValue={field.readingType} />
                                <div className="flex justify-end">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeReading(index)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <Button type="button" variant="outline" onClick={() => appendReading({ readingType: "onyomi", reading: "" })}>
                                <Plus className="h-4 w-4 mr-2" /> {t("vocabulary.kanji.createKanji.addReading")}
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <p className="text-sm font-medium text-muted-foreground">{t("vocabulary.kanji.createKanji.tabs.meanings")}</p>
                        {meaningFields.map((field, index) => (
                            <div key={field.id} className="p-4 border rounded-lg bg-gray-50 space-y-3 relative">
                                <div className="space-y-1.5">
                                    <p className="text-sm text-muted-foreground">{t("vocabulary.kanji.createKanji.vietnamese")}</p>
                                    <Input {...register(`meanings.${index}.translations.vi` as const)} defaultValue={field.translations?.vi} />
                                </div>
                                <div className="space-y-1.5">
                                    <p className="text-sm text-muted-foreground">{t("vocabulary.kanji.createKanji.english")}</p>
                                    <Input {...register(`meanings.${index}.translations.en` as const)} defaultValue={field.translations?.en} />
                                </div>
                                <div className="flex justify-end">
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeMeaning(index)}>
                                        <Trash2 className="w-4 h-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                        <div className="flex justify-end">
                            <Button type="button" variant="outline" onClick={() => appendMeaning({ translations: { vi: "", en: "" } as any })}>
                                <Plus className="h-4 w-4 mr-2" /> {t("vocabulary.kanji.createKanji.addMeaning")}
                            </Button>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
                            {t("common.cancel")}
                        </Button>
                        <Button type="submit" className="bg-primary text-primary-foreground" disabled={updateMutation.isPending}>
                            {updateMutation.isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {t("vocabulary.kanji.updateDialog.updating", "Đang cập nhật...")}
                                </>
                            ) : (
                                t("vocabulary.kanji.updateDialog.save", "Lưu thay đổi")
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default UpdateKanjiDialog;

