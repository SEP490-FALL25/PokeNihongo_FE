import { useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { useTranslation } from "react-i18next";
import { useGetRewardById, useUpdateReward } from "@hooks/useReward";
import { toast } from "react-toastify";
import MultilingualInput from "@ui/MultilingualInput";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { CreateRewardSchema, ICreateRewardRequest } from "@models/reward/request";
import { zodResolver } from "@hookform/resolvers/zod";
import { REWARD_TYPE, REWARD_TARGET } from "@constants/reward";
import { Loader2 } from "lucide-react";
import { cn } from "@utils/CN";

interface UpdateRewardDialogProps {
    isOpen: boolean;
    onClose: () => void;
    editingReward?: { id: number } | null;
}

const LANGUAGE_ORDER: Array<'en' | 'ja' | 'vi'> = ['en', 'ja', 'vi'];

const buildDefaultTranslations = (): ICreateRewardRequest["nameTranslations"] =>
    LANGUAGE_ORDER.map((lang) => ({ key: lang, value: "" }));

const normalizeTranslations = (translations?: Array<{ key: string; value: string }>): ICreateRewardRequest["nameTranslations"] => {
    return LANGUAGE_ORDER.map((lang) => ({
        key: lang,
        value: translations?.find((item) => item.key === lang)?.value ?? "",
    }));
};

const UpdateRewardDialog = ({ isOpen, onClose, editingReward }: UpdateRewardDialogProps) => {
    const { t } = useTranslation();
    const rewardId = editingReward?.id;
    const { data: rewardDetail, isLoading: isRewardDetailLoading } = useGetRewardById(rewardId, {
        enabled: isOpen && Boolean(rewardId),
    });

    const updateRewardMutation = useUpdateReward();

    const defaultValues = useMemo<ICreateRewardRequest>(() => ({
        rewardType: undefined,
        rewardItem: 1,
        rewardTarget: undefined,
        nameTranslations: buildDefaultTranslations(),
    }), []);

    const {
        control,
        handleSubmit,
        register,
        reset,
        formState: { errors },
    } = useForm<ICreateRewardRequest>({
        resolver: zodResolver(CreateRewardSchema),
        defaultValues,
    });

    const { fields: nameFields } = useFieldArray({
        control,
        name: "nameTranslations",
    });

    useEffect(() => {
        if (isOpen && rewardDetail) {
            reset({
                rewardType: rewardDetail.rewardType as ICreateRewardRequest["rewardType"],
                rewardItem: rewardDetail.rewardItem,
                rewardTarget: rewardDetail.rewardTarget as ICreateRewardRequest["rewardTarget"],
                nameTranslations: normalizeTranslations(rewardDetail.nameTranslations) as ICreateRewardRequest["nameTranslations"],
            });
        }
    }, [isOpen, rewardDetail, reset]);

    useEffect(() => {
        if (!isOpen) {
            reset(defaultValues);
        }
    }, [isOpen, reset, defaultValues]);

    const rewardTypeOptions = [
        { value: REWARD_TYPE.LESSON, label: t('reward.rewardTypeLESSON') },
        { value: REWARD_TYPE.DAILY_REQUEST, label: t('reward.rewardTypeDAILY_REQUEST') },
        { value: REWARD_TYPE.EVENT, label: t('reward.rewardTypeEVENT') },
        { value: REWARD_TYPE.ACHIEVEMENT, label: t('reward.rewardTypeACHIEVEMENT') },
        { value: REWARD_TYPE.LEVEL, label: t('reward.rewardTypeLEVEL') },
    ];

    const rewardTargetOptions = [
        { value: REWARD_TARGET.EXP, label: t('reward.rewardTargetEXP') },
        { value: REWARD_TARGET.POKEMON, label: t('reward.rewardTargetPOKEMON') },
        { value: REWARD_TARGET.POKE_COINS, label: t('reward.rewardTargetPOKE_COINS') },
        { value: REWARD_TARGET.SPARKLES, label: t('reward.rewardTargetSPARKLES') },
    ];

    const closeDialog = () => {
        onClose();
    };

    const handleDialogChange = (open: boolean) => {
        if (!open) {
            closeDialog();
        }
    };

    const onSubmit = async (data: ICreateRewardRequest) => {
        if (!editingReward?.id) return;
        try {
            await updateRewardMutation.mutateAsync({ id: editingReward.id, data });
            toast.success(t('reward.updateSuccess'));
            closeDialog();
        } catch (error) {
            console.error("Error updating reward:", error);
            toast.error(t('reward.updateError'));
        }
    };

    const isSubmitting = updateRewardMutation.isPending;
    const isFormDisabled = isSubmitting || (isOpen && Boolean(rewardId) && isRewardDetailLoading);

    return (
        <Dialog open={isOpen} onOpenChange={handleDialogChange}>
            <DialogContent className="bg-white border-border max-w-2xl">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {t('reward.editTitle')}
                    </DialogTitle>
                </DialogHeader>

                {isRewardDetailLoading && editingReward ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 text-muted-foreground">
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <p>{t('common.loading')}</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
                        <MultilingualInput
                            label={t('reward.name')}
                            fields={nameFields.map((field, index) => ({
                                id: field.id,
                                key: field.key || LANGUAGE_ORDER[index],
                            }))}
                            register={register}
                            errors={errors.nameTranslations}
                            placeholderKey="reward.namePlaceholder"
                            requiredKey="reward.nameRequiredVi"
                            fieldName="name"
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('reward.rewardType')}
                            </label>
                            <Controller
                                name="rewardType"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}
                                        disabled={isFormDisabled}
                                    >
                                        <SelectTrigger className={cn("bg-background border-border text-foreground", errors.rewardType && "border-error focus-visible:ring-destructive")}>
                                            <SelectValue placeholder={t('reward.rewardTypePlaceholder')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            {rewardTypeOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.rewardType && (
                                <p className="mt-1 text-xs text-error">{errors.rewardType.message as string}</p>
                            )}
                        </div>

                        <Controller
                            name="rewardItem"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    label={t('reward.rewardValue')}
                                    type="number"
                                    value={field.value ?? ''}
                                    onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                                    error={errors.rewardItem?.message as string}
                                    placeholder={t('reward.rewardItemPlaceholder')}
                                    variant="original"
                                    disabled={isFormDisabled}
                                />
                            )}
                        />

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                {t('reward.rewardTarget')}
                            </label>
                            <Controller
                                name="rewardTarget"
                                control={control}
                                render={({ field }) => (
                                    <Select
                                        value={field.value ?? ""}
                                        onValueChange={field.onChange}
                                        disabled={isFormDisabled}
                                    >
                                        <SelectTrigger className={cn("bg-background border-border text-foreground", errors.rewardTarget && "border-error focus-visible:ring-destructive")}>
                                            <SelectValue placeholder={t('reward.rewardTargetPlaceholder')} />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            {rewardTargetOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                            {errors.rewardTarget && (
                                <p className="mt-1 text-xs text-error">{errors.rewardTarget.message as string}</p>
                            )}
                        </div>

                        <div className="flex justify-end space-x-2 pt-4">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={closeDialog}
                                disabled={isFormDisabled}
                            >
                                {t('common.cancel')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isFormDisabled}
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                            >
                                {isSubmitting ? t('common.saving') : t('common.update')}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
};

export default UpdateRewardDialog;