import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Controller, useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import HeaderAdmin from "@organisms/Header/Admin";
import { Card, CardContent, CardFooter, CardHeader } from "@ui/Card";
import { Input } from "@ui/Input";
import { Textarea } from "@ui/Textarea";
import { Button } from "@ui/Button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { Badge } from "@ui/Badge";
import { ROUTES } from "@constants/route";
import { CreateGrammarRequest, ICreateGrammarRequest } from "@models/grammar/request";
import { useCreateGrammar } from "@hooks/useGrammar";
import { toast } from "react-toastify";
import { ChevronLeft, Plus, Save, Trash2 } from "lucide-react";

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

const CreateGrammarPage = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const createGrammar = useCreateGrammar();

    const form = useForm<ICreateGrammarRequest>({
        resolver: zodResolver(CreateGrammarRequest),
        defaultValues,
    });

    const {
        control,
        register,
        handleSubmit,
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

    const onSubmit = async (values: ICreateGrammarRequest) => {
        try {
            await createGrammar.mutateAsync(values);
            toast.success(t("createGrammar.success"));
            navigate(ROUTES.MANAGER.GRAMMAR_MANAGEMENT);
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

    return (
        <>
            <HeaderAdmin title={t("createGrammar.title")} description={t("createGrammar.description")} />
            <div className="p-6 mt-24 lg:p-10">
                <Card className="max-w-5xl mx-auto bg-white shadow-lg">
                    <form onSubmit={handleSubmit(onSubmit)} noValidate>
                        <CardHeader className="space-y-2">
                            <p className="text-sm text-muted-foreground">{t("createGrammar.requiredHint")}</p>
                        </CardHeader>
                        <CardContent className="space-y-10">
                            <section className="space-y-6">
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
                                    ) : null}
                                </div>

                                <div className="grid gap-6 md:grid-cols-2">
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
                                        ) : null}
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
                                        ) : null}
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-4">
                                <div>
                                    <p className="text-base font-semibold text-foreground">{t("createGrammar.translations")}</p>
                                    {sectionDescription ? (
                                        <p className="text-sm text-muted-foreground mt-1">{sectionDescription}</p>
                                    ) : null}
                                </div>

                                <div className="space-y-4">
                                    {fields.map((field, index) => (
                                        <div key={field.id} className="rounded-lg border border-border bg-card/40 p-4 space-y-4">
                                            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                                <div className="space-y-2 md:flex-1">
                                                    <label className="text-sm font-medium text-muted-foreground">
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
                                                    ) : null}
                                                </div>

                                                <Badge variant="secondary" className="w-fit uppercase tracking-wide">
                                                    {(translationValues?.[index]?.language_code ||
                                                        field.language_code ||
                                                        t("createGrammar.languagePlaceholder"))?.toString().toUpperCase()}
                                                </Badge>

                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="sm"
                                                    className="justify-start md:justify-end text-destructive hover:text-destructive"
                                                    onClick={() => remove(index)}
                                                    disabled={fields.length === 1}
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                    {t("createGrammar.removeUsage")}
                                                </Button>
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
                                                    ) : null}
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
                                                    ) : null}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <Button type="button" variant="outline" onClick={handleAddUsage} className="w-full sm:w-auto">
                                    <Plus className="h-4 w-4" />
                                    {t("createGrammar.addUsage")}
                                </Button>
                            </section>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <Button
                                type="button"
                                variant="ghost"
                                className="text-muted-foreground w-full sm:w-auto"
                                onClick={() => navigate(ROUTES.MANAGER.GRAMMAR_MANAGEMENT)}
                            >
                                <ChevronLeft className="h-4 w-4" />
                                {t("createGrammar.cancel")}
                            </Button>

                            <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                                <Save className="h-4 w-4" />
                                {isSubmitting ? t("createGrammar.submitting") : t("createGrammar.submit")}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>
            </div>
        </>
    );
};

export default CreateGrammarPage;

