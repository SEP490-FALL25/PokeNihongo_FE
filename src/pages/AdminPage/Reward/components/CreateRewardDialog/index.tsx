import { useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { useTranslation } from "react-i18next";
import { useCreateReward, useUpdateReward } from "@hooks/useReward";
import { toast } from "react-toastify";
import MultilingualInput from "@ui/MultilingualInput";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateRewardSchema } from "@models/reward/request";
import { cn } from "@utils/CN";
import { REWARD_TYPE, REWARD_TARGET } from "@constants/reward";
import { ICreateRewardRequest } from "@models/reward/request";

interface CreateRewardDialogProps {
    isOpen: boolean;
    onClose: () => void;
    editingReward?: any | null;
}

const CreateRewardDialog = ({ isOpen, onClose, editingReward }: CreateRewardDialogProps) => {
    const { t } = useTranslation();
    const createRewardMutation = useCreateReward();
    const updateRewardMutation = useUpdateReward();

    const {
        control,
        handleSubmit,
        register,
        formState: { errors },
        reset,
    } = useForm<ICreateRewardRequest>({
        resolver: zodResolver(CreateRewardSchema),
        defaultValues: {
            rewardType: undefined,
            rewardItem: 1,
            rewardTarget: undefined,
            nameTranslations: [
                { key: "en" as const, value: "" },
                { key: "ja" as const, value: "" },
                { key: "vi" as const, value: "" },
            ],
        },
    });

    const { fields: nameFields } = useFieldArray({ control, name: "nameTranslations" });

    // Reset form when dialog opens/closes
    useEffect(() => {
        if (isOpen) {
            if (editingReward) {
                reset({
                    rewardType: editingReward.rewardType as any,
                    rewardItem: editingReward.rewardItem || 1,
                    rewardTarget: editingReward.rewardTarget as any,
                    nameTranslations: [
                        { key: "en" as const, value: editingReward.name || "" },
                        { key: "ja" as const, value: editingReward.name || "" },
                        { key: "vi" as const, value: editingReward.name || "" },
                    ],
                });
            } else {
                reset({
                    rewardType: undefined,
                    rewardItem: 1,
                    rewardTarget: undefined,
                    nameTranslations: [
                        { key: "en" as const, value: "" },
                        { key: "ja" as const, value: "" },
                        { key: "vi" as const, value: "" },
                    ],
                });
            }
        }
    }, [isOpen, editingReward, reset]);

    // Get options using flattened JSON localization keys
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

    const handleFormSubmit = async (data: ICreateRewardRequest) => {
        try {
            if (editingReward) {
                await updateRewardMutation.mutateAsync({ id: editingReward.id, data });
                toast.success(t('reward.updateSuccess'));
            } else {
                await createRewardMutation.mutateAsync(data);
                toast.success(t('reward.createSuccess'));
            }
            onClose();
        } catch (error) {
            console.error("Error saving reward:", error);
            toast.error(editingReward ? t('reward.updateError') : t('reward.createError'));
        }
    };

    const isLoading = createRewardMutation.isPending || updateRewardMutation.isPending;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="bg-white border-border">
                <DialogHeader>
                    <DialogTitle className="text-foreground">
                        {editingReward ? t('reward.editTitle') : t('reward.addTitle')}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4" noValidate>
                    {/* Multilingual Name Input */}
                    <MultilingualInput
                        label={t('reward.name')}
                        fields={nameFields}
                        register={register}
                        errors={errors.nameTranslations}
                        placeholderKey="reward.namePlaceholder"
                        requiredKey="reward.nameRequiredVi"
                        fieldName="name"
                    />

                    {/* Reward Type */}
                    <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('reward.rewardType')}
                        </label>
                        <Controller
                            name="rewardType"
                            control={control}
                            rules={{ required: t('reward.rewardTypeRequired') }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={cn("bg-background text-foreground", errors.rewardType && "border-error focus-visible:ring-destructive")}>
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
                            <p className="mt-1 text-xs text-red-500">{errors.rewardType.message}</p>
                        )}
                    </>

                    {/* Reward Item */}
                    <Controller
                        name="rewardItem"
                        control={control}
                        render={({ field }) => (
                            <Input
                                label={t('reward.rewardItem')}
                                type="number"
                                {...field}
                                value={field.value || ''}
                                onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                                error={errors.rewardItem?.message}
                                placeholder={t('reward.rewardItemPlaceholder')}
                                className="bg-background border-border text-foreground h-11"
                            />
                        )}
                    />

                    <>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('reward.rewardTarget')}
                        </label>
                        <Controller
                            name="rewardTarget"
                            control={control}
                            rules={{ required: t('reward.rewardTargetRequired') }}
                            render={({ field }) => (
                                <Select value={field.value} onValueChange={field.onChange}>
                                    <SelectTrigger className={cn("bg-background text-foreground", errors.rewardTarget && "border-error focus-visible:ring-destructive")}>
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
                            <p className="mt-1 text-xs text-red-500">{errors.rewardTarget.message}</p>
                        )}
                    </>

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            disabled={isLoading}
                        >
                            {t('common.cancel')}
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {isLoading ? t('common.saving') : (editingReward ? t('common.update') : t('common.create'))}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
};

export default CreateRewardDialog;
