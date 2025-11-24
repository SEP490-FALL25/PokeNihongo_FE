import { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@ui/Dialog";
import { Input } from "@ui/Input";
import { Textarea } from "@ui/Textarea";
import { Button } from "@ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { Badge } from "@ui/Badge";
import { Alert, AlertDescription, AlertTitle } from "@ui/Alert";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ui/Accordion";
import { CreateGrammarRequest, ICreateGrammarRequest } from "@models/grammar/request";
import { useCreateGrammar } from "@hooks/useGrammar";
import { toast } from "react-toastify";
import { Plus, Save, Trash2 } from "lucide-react";

const LEVEL_OPTIONS = ["N5", "N4", "N3", "N2", "N1"] as const;
const LANGUAGE_OPTIONS = ["vi", "en", "ja"] as const;

const defaultValues: ICreateGrammarRequest = {
    structure: "",
    level: "N5",
    usage: {
        exampleSentenceJp: "",
    },
    translations: {
        usage: LANGUAGE_OPTIONS.map((language) => ({
            language_code: language,
            explanation: "",
            example: "",
        })),
    },
};

interface CreateGrammarDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const CreateGrammarDialog = ({ open, onOpenChange }: CreateGrammarDialogProps) => {
    const { t } = useTranslation();
    const createGrammar = useCreateGrammar();

    const form = useForm<ICreateGrammarRequest>({
        resolver: zodResolver(CreateGrammarRequest),
        defaultValues,
    });

    const {
        control,
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "translations.usage",
    });

    const translationValues = useWatch({
        control,
        name: "translations.usage",
    });

    const isSubmitting = createGrammar.isPending;

    useEffect(() => {
        if (!open) {
            reset(defaultValues);
        }
    }, [open, reset]);

    const closeDialog = () => onOpenChange(false);

    const onSubmit = async (values: ICreateGrammarRequest) => {
        try {
            // Filter bỏ các item có explanation hoặc example rỗng
            const validUsageItems = values.translations.usage.filter(
                (item) => item.explanation.trim() !== "" && item.example.trim() !== ""
            );

            // Kiểm tra có ít nhất 1 item hợp lệ
            if (validUsageItems.length === 0) {
                toast.error(t("createGrammar.error.noValidTranslation", { defaultValue: "Vui lòng điền ít nhất một bản dịch hợp lệ" }));
                return;
            }

            const cleanedValues: ICreateGrammarRequest = {
                ...values,
                translations: {
                    usage: validUsageItems,
                },
            };
            await createGrammar.mutateAsync(cleanedValues);
            toast.success(t("createGrammar.success"));
            closeDialog();
        } catch {
            // handled inside hook toast
        }
    };

    const handleAddUsage = () => {
        append({
            language_code: "vi",
            explanation: "",
            example: "",
        });
    };

    const sectionDescription = t("createGrammar.translationHint");

    const languageOptions = useMemo(
        () =>
            LANGUAGE_OPTIONS.map((language) => ({
                value: language,
                label: t(`createGrammar.languages.${language}`),
            })),
        [t],
    );

    const handleDialogOpenChange = (nextOpen: boolean) => {
        if (!isSubmitting) {
            onOpenChange(nextOpen);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleDialogOpenChange}>
            <DialogContent className="w-full max-w-5xl h-[90vh] p-0 bg-white">
                <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex h-full flex-col overflow-hidden">
                    <DialogHeader className="px-6 pt-6 pb-2 text-left space-y-2">
                        <DialogTitle className="text-2xl font-semibold">{t("createGrammar.title")}</DialogTitle>
                        <DialogDescription>{t("createGrammar.description")}</DialogDescription>
                        <p className="text-sm text-muted-foreground">{t("createGrammar.requiredHint")}</p>
                    </DialogHeader>
                    <div className="px-6 pb-2 pt-4 flex-1 overflow-y-auto space-y-8">
                        <Alert className="bg-primary/5 border-primary/30">
                            <AlertTitle>{t("createGrammar.quickGuideTitle")}</AlertTitle>
                            <AlertDescription className="text-sm leading-relaxed">
                                {t("createGrammar.quickGuideDescription")}
                            </AlertDescription>
                        </Alert>

                        <section className="space-y-5 rounded-xl border border-border/60 bg-card/60 p-4">
                            <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                {t("createGrammar.basicInfo")}
                            </p>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-foreground">
                                        {t("createGrammar.structureLabel")} *
                                    </label>
                                    <Input
                                        placeholder={t("createGrammar.structurePlaceholder")}
                                        {...register("structure")}
                                        aria-invalid={Boolean(errors.structure)}
                                    />
                                    {errors.structure ? (
                                        <p className="text-sm text-destructive">{errors.structure.message as string}</p>
                                    ) : (
                                        <p className="text-xs text-muted-foreground">{t("createGrammar.structureHint")}</p>
                                    )}
                                </div>

                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground">
                                            {t("createGrammar.levelLabel")} *
                                        </label>
                                        <Controller
                                            control={control}
                                            name="level"
                                            render={({ field }) => (
                                                <Select value={field.value} onValueChange={field.onChange}>
                                                    <SelectTrigger aria-invalid={Boolean(errors.level)}>
                                                        <SelectValue placeholder={t("createGrammar.levelPlaceholder")} />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        {LEVEL_OPTIONS.map((level) => (
                                                            <SelectItem key={level} value={level}>
                                                                {level}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            )}
                                        />
                                        {errors.level ? (
                                            <p className="text-sm text-destructive">{errors.level.message as string}</p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">{t("createGrammar.levelHint")}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-foreground">
                                            {t("createGrammar.exampleLabel")} *
                                        </label>
                                        <Textarea
                                            rows={4}
                                            placeholder={t("createGrammar.examplePlaceholder")}
                                            {...register("usage.exampleSentenceJp")}
                                            aria-invalid={Boolean(errors.usage?.exampleSentenceJp)}
                                        />
                                        {errors.usage?.exampleSentenceJp ? (
                                            <p className="text-sm text-destructive">
                                                {errors.usage.exampleSentenceJp.message as string}
                                            </p>
                                        ) : (
                                            <p className="text-xs text-muted-foreground">{t("createGrammar.exampleHint")}</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4 rounded-xl border border-border/60 bg-card/60 p-4">
                            <div className="flex flex-col gap-1">
                                <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                                    {t("createGrammar.translations")}
                                </p>
                                {sectionDescription ? (
                                    <p className="text-sm text-muted-foreground">{sectionDescription}</p>
                                ) : null}
                            </div>

                            <Accordion type="single" collapsible className="space-y-2">
                                {fields.map((field, index) => {
                                    const currentLanguage =
                                        translationValues?.[index]?.language_code ||
                                        field.language_code ||
                                        t("createGrammar.languagePlaceholder");

                                    return (
                                        <AccordionItem key={field.id} value={field.id} className="border border-border/70 rounded-lg px-2">
                                            <AccordionTrigger className="flex w-full items-center justify-between gap-4 px-2 py-3 text-left">
                                                <div className="flex items-center gap-3">
                                                    <Badge variant="secondary" className="uppercase tracking-wide">
                                                        {currentLanguage.toString().toUpperCase()}
                                                    </Badge>
                                                    <span className="text-sm font-medium text-foreground">
                                                        {t("createGrammar.translationPanelTitle", { language: currentLanguage.toString().toUpperCase() })}
                                                    </span>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="space-y-4 px-2 pb-4">
                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-foreground">
                                                            {t("createGrammar.translationLanguage")}
                                                        </label>
                                                        <Controller
                                                            control={control}
                                                            name={`translations.usage.${index}.language_code`}
                                                            render={({ field }) => (
                                                                <Select value={field.value} onValueChange={field.onChange}>
                                                                    <SelectTrigger aria-invalid={Boolean(errors.translations?.usage?.[index]?.language_code)}>
                                                                        <SelectValue placeholder={t("createGrammar.languagePlaceholder")} />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        {languageOptions.map((option) => (
                                                                            <SelectItem key={`${option.value}-${index}`} value={option.value}>
                                                                                {option.label}
                                                                            </SelectItem>
                                                                        ))}
                                                                    </SelectContent>
                                                                </Select>
                                                            )}
                                                        />
                                                        {errors.translations?.usage?.[index]?.language_code ? (
                                                            <p className="text-sm text-destructive">
                                                                {errors.translations.usage?.[index]?.language_code?.message as string}
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground">{t("createGrammar.languageHint")}</p>
                                                        )}
                                                    </div>

                                                    <div className="flex items-end justify-end">
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="text-destructive hover:text-destructive"
                                                            onClick={() => remove(index)}
                                                            disabled={fields.length === 1}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            {t("createGrammar.removeUsage")}
                                                        </Button>
                                                    </div>
                                                </div>

                                                <div className="grid gap-4 md:grid-cols-2">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-foreground">
                                                            {t("createGrammar.translationExplanation")}
                                                        </label>
                                                        <Textarea
                                                            rows={4}
                                                            placeholder={t("createGrammar.translationExplanationPlaceholder")}
                                                            {...register(`translations.usage.${index}.explanation` as const)}
                                                            aria-invalid={Boolean(errors.translations?.usage?.[index]?.explanation)}
                                                        />
                                                        {errors.translations?.usage?.[index]?.explanation ? (
                                                            <p className="text-sm text-destructive">
                                                                {errors.translations.usage?.[index]?.explanation?.message as string}
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground">{t("createGrammar.translationExplanationHint")}</p>
                                                        )}
                                                    </div>

                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-foreground">
                                                            {t("createGrammar.translationExample")}
                                                        </label>
                                                        <Textarea
                                                            rows={4}
                                                            placeholder={t("createGrammar.translationExamplePlaceholder")}
                                                            {...register(`translations.usage.${index}.example` as const)}
                                                            aria-invalid={Boolean(errors.translations?.usage?.[index]?.example)}
                                                        />
                                                        {errors.translations?.usage?.[index]?.example ? (
                                                            <p className="text-sm text-destructive">
                                                                {errors.translations.usage?.[index]?.example?.message as string}
                                                            </p>
                                                        ) : (
                                                            <p className="text-xs text-muted-foreground">{t("createGrammar.translationExampleHint")}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    );
                                })}
                            </Accordion>

                            <Button type="button" variant="outline" onClick={handleAddUsage} className="w-full sm:w-auto">
                                <Plus className="h-4 w-4" />
                                {t("createGrammar.addUsage")}
                            </Button>
                        </section>
                    </div>

                    <div className="flex flex-col gap-3 border-t border-border px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            className="text-muted-foreground w-full sm:w-auto"
                            onClick={closeDialog}
                            disabled={isSubmitting}
                        >
                            {t("createGrammar.cancel")}
                        </Button>

                        <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                            <Save className="h-4 w-4" />
                            {isSubmitting ? t("createGrammar.submitting") : t("createGrammar.submit")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateGrammarDialog;

