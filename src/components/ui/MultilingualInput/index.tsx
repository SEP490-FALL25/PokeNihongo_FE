import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/Tabs";
import { Input } from "@ui/Input";
import { Textarea } from "@ui/Textarea";
import { cn } from "@utils/CN";
import { useTranslation } from "react-i18next";

interface MultilingualField {
    id: string;
    key: string;
}

interface MultilingualInputProps {
    label: string;
    fields: MultilingualField[];
    values?: Record<string, string>;
    onChange?: (field: string, value: string) => void;
    register?: any;
    errors?: any;
    placeholderKey: string;
    requiredKey?: string;
    isTextarea?: boolean;
    className?: string;
    fieldName?: string;
}

const MultilingualInput: React.FC<MultilingualInputProps> = ({
    label,
    fields,
    values,
    onChange,
    register,
    errors,
    placeholderKey,
    requiredKey,
    isTextarea = false,
    className = "",
    fieldName = "name"
}) => {
    const { t } = useTranslation();

    const InputComponent = isTextarea ? Textarea : Input;

    // Check if using react-hook-form (has register) or state management (has values/onChange)
    const isReactHookForm = !!register;

    return (
        <div className={cn("space-y-1.5", className)}>
            <label className={cn("text-sm font-medium text-foreground", errors && "text-destructive")}>
                {label}
            </label>
            <Tabs defaultValue="vi" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="vi" className={`${errors?.[2]?.value ? "border-error focus-visible:ring-destructive" : ""}`}>
                        {t('dailyQuest.languages.vi')}
                    </TabsTrigger>
                    <TabsTrigger value="en" className={`${errors?.[0]?.value ? "border-error focus-visible:ring-destructive" : ""}`}>
                        {t('dailyQuest.languages.en')}
                    </TabsTrigger>
                    <TabsTrigger value="ja" className={`${errors?.[1]?.value ? "border-error focus-visible:ring-destructive" : ""}`}>
                        {t('dailyQuest.languages.ja')}
                    </TabsTrigger>
                </TabsList>
                {fields.map((field, index) => (
                    <TabsContent key={field.id} value={field.key} className="mt-2">
                        {isReactHookForm ? (
                            <InputComponent
                                placeholder={t(placeholderKey, { lang: field.key.toUpperCase() })}
                                variant={errors?.[index]?.value ? "destructive" : "default"}
                                {...register(`${fieldName}Translations.${index}.value` as const, {
                                    required: field.key === 'vi'
                                        ? t(requiredKey || 'common.required')
                                        : field.key === 'en'
                                            ? t(`${requiredKey?.replace('Vi', 'En')}` || 'common.required')
                                            : t(`${requiredKey?.replace('Vi', 'Ja')}` || 'common.required'),
                                })}
                            />
                        ) : (
                            <InputComponent
                                placeholder={t(placeholderKey, { lang: field.key.toUpperCase() })}
                                value={values?.[`name${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`] || ""}
                                onChange={(e) => onChange?.(`name${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`, e.target.value)}
                                variant={errors?.[`name${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`] ? "destructive" : "default"}
                            />
                        )}
                        {isReactHookForm ? (
                            errors?.[index]?.value && (
                                <p className="text-xs text-error mt-1">
                                    {typeof errors[index]?.value?.message === "string"
                                        ? t(errors[index]?.value?.message as string)
                                        : errors[index]?.value?.message}
                                </p>
                            )
                        ) : (
                            errors?.[`name${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`] && (
                                <p className="text-xs text-error mt-1">
                                    {errors[`name${field.key.charAt(0).toUpperCase() + field.key.slice(1)}`]}
                                </p>
                            )
                        )}
                        {isReactHookForm && (
                            <input type="hidden" {...register(`${fieldName}Translations.${index}.key` as const)} />
                        )}
                    </TabsContent>
                ))}
            </Tabs>
            {isReactHookForm && errors && (
                <div className="text-xs text-error mt-2">
                    {(() => {
                        const missingLanguages: string[] = [];
                        errors.forEach((error: any, index: number) => {
                            if (error?.value?.type === 'required') {
                                const languageKey = fields[index]?.key;
                                if (languageKey === 'vi') missingLanguages.push(t('reward.languageVi'));
                                else if (languageKey === 'en') missingLanguages.push(t('reward.languageEn'));
                                else if (languageKey === 'ja') missingLanguages.push(t('reward.languageJa'));
                            }
                        });

                        if (missingLanguages.length > 0) {
                            return (
                                <p className="font-medium">
                                    {t('reward.missingLanguages')}: {missingLanguages.join(', ')}
                                </p>
                            );
                        }
                        return null;
                    })()}
                </div>
            )}
        </div>
    );
};

export default MultilingualInput;
