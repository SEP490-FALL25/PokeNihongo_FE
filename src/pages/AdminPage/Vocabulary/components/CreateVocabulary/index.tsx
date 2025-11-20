import { Button } from '@ui/Button';
import { DialogContent, DialogFooter } from '@ui/Dialog';
import { DialogHeader, DialogTitle } from '@ui/Dialog';
import { Input } from '@ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@ui/Select';
import { Controller, useForm } from 'react-hook-form';
import { Textarea } from '@ui/Textarea';
import { useEffect, useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import vocabularyService from '@services/vocabulary';
import { CreateVocabularyFullMultipartSchema, ICreateVocabularyFullMultipartType } from '@models/vocabulary/request';
import { Card, CardContent, CardHeader, CardTitle } from '@ui/Card';
import { Badge } from '@ui/Badge';
import { Plus, Trash2, Languages, UploadCloud } from 'lucide-react';
import { cn } from '@utils/CN';
import ImageDropzone from '@ui/ImageDropzone/ImageDropzone';
import AudioDropzone from '@ui/AudioDropzone';
import { useWordTypeList } from '@hooks/useWordType';
import { useTranslation } from 'react-i18next';

interface CreateVocabularyProps {
    setIsAddDialogOpen: (value: boolean) => void;
}

const LANGUAGE_OPTIONS = [
    { code: 'vi', label: 'Tiếng Việt (vi)' },
    { code: 'en', label: 'English (en)' },
    { code: 'ja', label: '日本語 (ja)' },
];

const CreateVocabulary = ({ setIsAddDialogOpen }: CreateVocabularyProps) => {
    const { t } = useTranslation();
    const { data: wordTypesData } = useWordTypeList({ page: 1, limit: 100 });

    // Form setup
    // Keep form type broad to avoid resolver generic mismatch; Zod will validate and transform
    const { control, handleSubmit, formState: { errors }, reset, setValue, watch } = useForm<any>({
        resolver: zodResolver(CreateVocabularyFullMultipartSchema),
        defaultValues: {
            word_jp: '',
            reading: '',
            level_n: '',
            word_type_id: '',
            translations: '',
            image: undefined,
            audio: undefined,
        }
    });

    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [creationMode, setCreationMode] = useState<'manual' | 'import'>('manual');
    const [selectedImportFile, setSelectedImportFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [audioPreview, setAudioPreview] = useState<string | null>(null);



    // Friendlier translations UI state
    // meanings grouped by language for easier editing
    const [meaningsByLang, setMeaningsByLang] = useState<Record<string, string[]>>({ vi: [''] });
    const [selectedMeaningLang, setSelectedMeaningLang] = useState<string>('vi');
    const [examples, setExamples] = useState<Array<{ language_code: string; sentence: string; original_sentence: string }>>([]);

    // Keep hidden translations JSON in sync for zod validation
    useEffect(() => {
        const meaningArray: Array<{ language_code: string; value: string }> = [];
        Object.entries(meaningsByLang).forEach(([lang, values]) => {
            values.forEach((val) => {
                if (val && val.trim().length > 0) {
                    meaningArray.push({ language_code: lang, value: val.trim() });
                }
            });
        });
        const payload = { meaning: meaningArray, examples: examples.length ? examples : [] };
        setValue('translations', JSON.stringify(payload));
    }, [meaningsByLang, examples, setValue]);

    // Cleanup object URLs
    useEffect(() => {
        return () => {
            if (imagePreview) URL.revokeObjectURL(imagePreview);
            if (audioPreview) URL.revokeObjectURL(audioPreview);
        };
    }, [imagePreview, audioPreview]);

    const createVocabularyMutation = useMutation({
        mutationFn: vocabularyService.createVocabulary,
        onSuccess: () => {
            reset();
            setIsAddDialogOpen(false);
            setIsSubmitting(false);
            toast.success(t('vocabulary.createVocabulary.createSuccess'));
        },
        onError: (error: any) => {
            setIsSubmitting(false);
            console.error('Error creating Vocabulary:', error);
            console.error('Error response:', error.response?.data?.message);

            if (error.response?.status === 422) {
                const messages = error.response?.data?.message;
                if (Array.isArray(messages)) {
                    toast.error(`${t('vocabulary.createVocabulary.validationErrors')}: ${messages.join(', ')}`);
                } else {
                    toast.error(messages || t('vocabulary.createVocabulary.validationError'));
                }
            } else {
                toast.error(error.response?.data?.message || t('vocabulary.createVocabulary.generalError'));
            }
        }
    });

    const onSubmit = async (data: ICreateVocabularyFullMultipartType) => {
        setIsSubmitting(true);
        try {
            // Ensure files are passed along (service builds FormData)
            const submitPayload: any = {
                ...data,
            };
            const imageFile: File | undefined = (watch('image') as any) as File | undefined;
            const audioFile: File | undefined = (watch('audio') as any) as File | undefined;
            if (imageFile) submitPayload.image = imageFile;
            if (audioFile) submitPayload.audio = audioFile;
            createVocabularyMutation.mutate(submitPayload as ICreateVocabularyFullMultipartType);
        } catch (error: any) {
            setIsSubmitting(false);
            console.error('Unexpected error:', error);
            toast.error(error.response?.data?.message || t('vocabulary.createVocabulary.generalError'));
        }
    };

    return (
        <>
            <DialogContent className="bg-white border-border max-w-4xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-2xl">{t("vocabulary.createVocabulary.title")}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 mt-4 max-h-[70vh] overflow-y-auto pr-2 md:pr-6" noValidate>
                    {/* Creation Mode Toggle */}
                    <div className="flex items-center justify-center mb-2">
                        <div className="flex items-center gap-1 rounded-lg bg-muted p-1">
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "px-6 py-2 rounded-md transition-all duration-200",
                                    creationMode === 'manual' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => setCreationMode('manual')}
                            >
                                <Plus className="h-4 w-4 mr-2" /> {t("vocabulary.createVocabulary.modes.manual")}
                            </Button>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className={cn(
                                    "px-6 py-2 rounded-md transition-all duration-200",
                                    creationMode === 'import' ? "bg-white text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                                )}
                                onClick={() => setCreationMode('import')}
                            >
                                <UploadCloud className="h-4 w-4 mr-2" /> {t("vocabulary.createVocabulary.modes.import")}
                            </Button>
                        </div>
                    </div>

                    {creationMode === 'import' && (
                        <div className="space-y-6">
                            <div className="text-center mb-2">
                                <h3 className="text-lg font-semibold text-foreground mb-1">{t("vocabulary.createVocabulary.import.title")}</h3>
                                <p className="text-sm text-muted-foreground">{t("vocabulary.createVocabulary.import.description")}</p>
                            </div>

                            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 bg-muted/20">
                                <label htmlFor="vocab-file-upload" className="flex flex-col items-center justify-center cursor-pointer group">
                                    <div className="flex flex-col items-center justify-center">
                                        <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors mb-4">
                                            <UploadCloud className="w-12 h-12 text-primary" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-foreground mb-2">{t("vocabulary.createVocabulary.import.selectFile")}</h4>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            <span className="font-medium">{t("vocabulary.createVocabulary.import.clickToSelect")}</span> {t("vocabulary.createVocabulary.import.dragAndDrop")}
                                        </p>
                                        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                                            <span className="px-2 py-1 bg-muted rounded">JSON</span>
                                            <span className="px-2 py-1 bg-muted rounded">{t("vocabulary.createVocabulary.import.maxSize")}</span>
                                        </div>
                                    </div>
                                    <Input
                                        id="vocab-file-upload"
                                        type="file"
                                        className="hidden"
                                        accept=".json,application/json"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) setSelectedImportFile(file);
                                        }}
                                    />
                                </label>

                                {selectedImportFile && (
                                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-green-100 rounded-full">
                                                <UploadCloud className="w-5 h-5 text-green-600" />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-medium text-green-800">{selectedImportFile.name}</p>
                                                <p className="text-sm text-green-600">{(selectedImportFile.size / 1024 / 1024).toFixed(2)} MB</p>
                                            </div>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => setSelectedImportFile(null)}
                                                className="text-green-600 hover:text-green-700"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {creationMode === 'manual' && (
                        <>
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">{t("vocabulary.createVocabulary.basicInfo.title")}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                                        {/* Left column */}
                                        <div className="space-y-4">
                                            <Controller
                                                name="word_jp"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input label={t("vocabulary.createVocabulary.basicInfo.wordJp")} placeholder={t("vocabulary.createVocabulary.basicInfo.wordJpPlaceholder")} error={errors.word_jp?.message as string} {...field} />
                                                )}
                                            />

                                            <Controller
                                                name="reading"
                                                control={control}
                                                render={({ field }) => (
                                                    <Input label={t("vocabulary.createVocabulary.basicInfo.reading")} placeholder={t("vocabulary.createVocabulary.basicInfo.readingPlaceholder")} error={errors.reading?.message as string} {...field} />
                                                )}
                                            />
                                        </div>

                                        {/* Right column */}
                                        <div className="space-y-4">
                                            <Controller
                                                name="level_n"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="flex flex-col gap-2">
                                                        <label htmlFor="level_n">{t("vocabulary.createVocabulary.basicInfo.jlptLevel")}</label>
                                                        <Select onValueChange={field.onChange} value={String(field.value)}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={t("vocabulary.createVocabulary.basicInfo.jlptLevelPlaceholder")} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                <SelectItem value="5">N5</SelectItem>
                                                                <SelectItem value="4">N4</SelectItem>
                                                                <SelectItem value="3">N3</SelectItem>
                                                                <SelectItem value="2">N2</SelectItem>
                                                                <SelectItem value="1">N1</SelectItem>
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.level_n && <p className="text-xs text-destructive mt-1">{errors.level_n.message as string}</p>}
                                                    </div>
                                                )}
                                            />

                                            <Controller
                                                name="word_type_id"
                                                control={control}
                                                render={({ field }) => (
                                                    <div className="flex flex-col gap-2">
                                                        <label htmlFor="word_type_id">{t("vocabulary.createVocabulary.basicInfo.wordType")}</label>
                                                        <Select onValueChange={field.onChange} value={String(field.value)}>
                                                            <SelectTrigger>
                                                                <SelectValue placeholder={t("vocabulary.createVocabulary.basicInfo.wordTypePlaceholder")} />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {wordTypesData?.results?.map((t: any) => (
                                                                    <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                        {errors.word_type_id && <p className="text-xs text-destructive mt-1">{errors.word_type_id.message as string}</p>}
                                                    </div>
                                                )}
                                            />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Translations friendly UI */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-base">{t("vocabulary.createVocabulary.translations.title")}</CardTitle>
                                        <div className="flex items-center gap-2">
                                            <Select
                                                onValueChange={(val) => {
                                                    if (!Object.keys(meaningsByLang).includes(val)) {
                                                        setMeaningsByLang((prev) => ({ ...prev, [val]: [''] }));
                                                    }
                                                    setSelectedMeaningLang(val);
                                                }}
                                            >
                                                <SelectTrigger className="w-52">
                                                    <SelectValue placeholder={t("vocabulary.createVocabulary.translations.addLanguage")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {LANGUAGE_OPTIONS.filter((opt) => !Object.keys(meaningsByLang).includes(opt.code)).map((opt) => (
                                                        <SelectItem key={opt.code} value={opt.code}>{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-0 space-y-5">

                                    {/* Language chips */}
                                    <div className="flex flex-wrap gap-2">
                                        {Object.keys(meaningsByLang).map((lang) => (
                                            <Badge
                                                key={lang}
                                                variant={selectedMeaningLang === lang ? 'default' : 'outline'}
                                                onClick={() => setSelectedMeaningLang(lang)}
                                                className="cursor-pointer select-none"
                                            >
                                                <Languages className="h-3.5 w-3.5 mr-1.5" />
                                                {LANGUAGE_OPTIONS.find((l) => l.code === lang)?.label || lang}
                                                <span className="ml-2 text-[10px] opacity-80">{meaningsByLang[lang].length}</span>
                                            </Badge>
                                        ))}
                                    </div>

                                    {/* Meaning lines for selected language */}
                                    <div className="space-y-3">
                                        {(meaningsByLang[selectedMeaningLang] || []).map((val, idx) => {
                                            const totalLines = Object.values(meaningsByLang).reduce((acc, arr) => acc + arr.length, 0);
                                            const canRemove = totalLines > 1;
                                            return (
                                                <div key={`${selectedMeaningLang}-${idx}`} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                                                    <div className="md:col-span-5">
                                                        <Input
                                                            label={`${t("vocabulary.createVocabulary.translations.meaning")} (${selectedMeaningLang})`}
                                                            placeholder={t("vocabulary.createVocabulary.translations.meaningPlaceholder")}
                                                            value={val}
                                                            onChange={(e) => {
                                                                const newVal = e.target.value;
                                                                setMeaningsByLang((prev) => {
                                                                    const next = { ...prev };
                                                                    const list = [...(next[selectedMeaningLang] || [])];
                                                                    list[idx] = newVal;
                                                                    next[selectedMeaningLang] = list;
                                                                    return next;
                                                                });
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="md:col-span-1">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            disabled={!canRemove}
                                                            onClick={() => {
                                                                setMeaningsByLang((prev) => {
                                                                    const next = { ...prev };
                                                                    const list = [...(next[selectedMeaningLang] || [])];
                                                                    list.splice(idx, 1);
                                                                    if (list.length === 0) {
                                                                        delete next[selectedMeaningLang];
                                                                        const remaining = Object.keys(next);
                                                                        if (remaining.length === 0) {
                                                                            next['vi'] = [''];
                                                                            setSelectedMeaningLang('vi');
                                                                        } else if (!remaining.includes(selectedMeaningLang)) {
                                                                            setSelectedMeaningLang(remaining[0]);
                                                                        }
                                                                    } else {
                                                                        next[selectedMeaningLang] = list;
                                                                    }
                                                                    return next;
                                                                });
                                                            }}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <Button
                                            type="button"
                                            variant="outline"
                                            onClick={() => setMeaningsByLang((prev) => ({
                                                ...prev,
                                                [selectedMeaningLang]: [...(prev[selectedMeaningLang] || []), '']
                                            }))}
                                        >
                                            <Plus className="h-4 w-4 mr-1" /> {t("vocabulary.createVocabulary.translations.addMeaningLine")}
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex items-center justify-between pt-2">
                                <h4 className="text-sm font-medium">{t("vocabulary.createVocabulary.examples.title")}</h4>
                                <Button type="button" variant="outline" onClick={() => setExamples((prev) => [...prev, { language_code: 'vi', sentence: '', original_sentence: '' }])}>{t("vocabulary.createVocabulary.examples.addExample")}</Button>
                            </div>
                            <div className="space-y-3">
                                {examples.map((ex, idx) => (
                                    <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                                        <div className="md:col-span-1">
                                            <label className="mb-2 block text-sm font-medium text-gray-700">{t("vocabulary.createVocabulary.examples.language")}</label>
                                            <Select
                                                onValueChange={(val) => setExamples((prev) => prev.map((it, i) => i === idx ? { ...it, language_code: val } : it))}
                                                defaultValue={ex.language_code}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder={t("vocabulary.createVocabulary.examples.selectLanguage")} />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {LANGUAGE_OPTIONS.map((opt) => (
                                                        <SelectItem key={opt.code} value={opt.code}>{opt.label}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                label={t("vocabulary.createVocabulary.examples.originalSentence")}
                                                placeholder={t("vocabulary.createVocabulary.examples.originalSentencePlaceholder")}
                                                value={ex.original_sentence}
                                                onChange={(e) => setExamples((prev) => prev.map((it, i) => i === idx ? { ...it, original_sentence: e.target.value } : it))}
                                            />
                                        </div>
                                        <div className="md:col-span-2">
                                            <Input
                                                label={t("vocabulary.createVocabulary.examples.translation")}
                                                placeholder={t("vocabulary.createVocabulary.examples.translationPlaceholder")}
                                                value={ex.sentence}
                                                onChange={(e) => setExamples((prev) => prev.map((it, i) => i === idx ? { ...it, sentence: e.target.value } : it))}
                                            />
                                        </div>
                                        <div className="md:col-span-1">
                                            <Button type="button" variant="outline" onClick={() => setExamples((prev) => prev.filter((_, i) => i !== idx))}>{t("vocabulary.createVocabulary.examples.delete")}</Button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Hidden textarea to satisfy zod union (string -> JSON) */}
                            <Controller
                                name="translations"
                                control={control}
                                render={({ field }) => (
                                    <Textarea {...field as any} className="hidden" />
                                )}
                            />
                            {errors.translations && (
                                <p className="text-xs text-destructive mt-1">{(errors.translations as any)?.message}</p>
                            )}

                            {/* Media upload */}
                            <Card>
                                <CardHeader className="pb-3">
                                    <CardTitle className="text-base">{t("vocabulary.createVocabulary.attachments.title")}</CardTitle>
                                </CardHeader>
                                <CardContent className="pt-0 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <Controller
                                        name="image"
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <ImageDropzone value={value} onChange={(file) => {
                                                if (imagePreview) URL.revokeObjectURL(imagePreview);
                                                setImagePreview(file ? URL.createObjectURL(file) : null);
                                                onChange(file);
                                            }} />
                                        )}
                                    />
                                    <Controller
                                        name="audio"
                                        control={control}
                                        render={({ field: { onChange, value } }) => (
                                            <AudioDropzone value={value as File | undefined} onChange={(file) => {
                                                if (audioPreview) URL.revokeObjectURL(audioPreview);
                                                const url = file ? URL.createObjectURL(file) : null;
                                                setAudioPreview(url);
                                                onChange(file);
                                            }} />
                                        )}
                                    />
                                </CardContent>
                            </Card>

                        </>
                    )}

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)} disabled={isSubmitting}>{t("vocabulary.createVocabulary.cancel")}</Button>
                        <Button type="submit" className="bg-primary text-primary-foreground" disabled={isSubmitting}>
                            {isSubmitting ? t("vocabulary.createVocabulary.creating") : t("vocabulary.createVocabulary.create")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent >
        </>
    );
};

export default CreateVocabulary;