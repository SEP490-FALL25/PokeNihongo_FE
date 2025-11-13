import { useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@ui/Dialog"
import { Button } from "@ui/Button"
import { Input } from "@ui/Input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Switch } from "@ui/Switch"
import { useForm, useFieldArray, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useTranslation } from "react-i18next"
import { BATTLE } from "@constants/battle"
import { CreateBattleLeaderBoardSeasonRequestSchema, ICreateBattleLeaderBoardSeasonRequest } from "@models/battle/request"
import { useCreateBattleLeaderBoardSeason } from "@hooks/useBattle"
import MultilingualInput from "@ui/MultilingualInput"

interface CreateSeasonProps {
    isOpen: boolean
    onClose: () => void
}

const defaultValues: ICreateBattleLeaderBoardSeasonRequest = {
    status: BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.PREVIEW,
    enablePrecreate: true,
    precreateBeforeEndDays: 7,
    isRandomItemAgain: true,
    nameTranslations: [
        { key: "vi", value: "" },
        { key: "en", value: "" },
        { key: "ja", value: "" },
    ],
}

const CreateSeason = ({ isOpen, onClose }: CreateSeasonProps) => {
    const { t } = useTranslation()

    const {
        control,
        handleSubmit,
        register,
        reset,
        watch,
        trigger,
        formState: { errors },
    } = useForm<ICreateBattleLeaderBoardSeasonRequest>({
        resolver: zodResolver(CreateBattleLeaderBoardSeasonRequestSchema),
        defaultValues,
        mode: "onTouched",
        reValidateMode: "onChange",
    })

    const { fields: nameFields } = useFieldArray({
        control,
        name: "nameTranslations",
    })

    const createSeasonMutation = useCreateBattleLeaderBoardSeason()

    const isPrecreateEnabled = watch("enablePrecreate")

    useEffect(() => {
        if (isOpen) {
            reset(defaultValues)
        }
    }, [isOpen, reset])

    const statusOptions = useMemo(
        () => [
            {
                value: BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.PREVIEW,
                label: t("tournaments.status.preview", { defaultValue: "Xem trước" }),
            },
            {
                value: BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.ACTIVE,
                label: t("tournaments.status.active", { defaultValue: "Đang diễn ra" }),
            },
            {
                value: BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.INACTIVE,
                label: t("tournaments.status.inactive", { defaultValue: "Tạm dừng" }),
            },
            {
                value: BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.EXPIRED,
                label: t("tournaments.status.expired", { defaultValue: "Đã kết thúc" }),
            },
        ],
        [t],
    )

    const onSubmit = async (data: ICreateBattleLeaderBoardSeasonRequest) => {
        try {
            await createSeasonMutation.mutateAsync(data)
            onClose()
        } catch {
            // handled in mutation
        }
    }

    const handleFormSubmit = handleSubmit(async (data) => {
        // Trigger validation for all fields before submit
        const isValid = await trigger()
        if (isValid) {
            await onSubmit(data)
        }
    })

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="bg-white border-border max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-xl font-semibold">
                        {t("tournaments.createSeason.title", { defaultValue: "Tạo mùa giải mới" })}
                    </DialogTitle>
                    <p className="text-sm text-muted-foreground">
                        {t("tournaments.createSeason.subtitle", {
                            defaultValue: "Thiết lập thông tin và cấu hình cho mùa giải mới.",
                        })}
                    </p>
                </DialogHeader>

                <form onSubmit={handleFormSubmit} className="space-y-6 py-4">
                    {/* Multilingual Input */}
                    <MultilingualInput
                        label={t("tournaments.createSeason.nameLabel", { defaultValue: "Tên mùa giải" })}
                        fields={nameFields.map((field) => ({
                            id: field.id,
                            key: field.key,
                        }))}
                        register={register}
                        errors={errors.nameTranslations}
                        placeholderKey="tournaments.createSeason.namePlaceholder"
                        requiredKey="tournaments.createSeason.nameRequiredVi"
                        fieldName="name"
                    />

                    <section className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-sm font-semibold text-foreground">
                                {t("tournaments.createSeason.statusLabel", { defaultValue: "Trạng thái" })}
                            </label>
                            <Controller
                                name="status"
                                control={control}
                                render={({ field }) => (
                                    <Select value={field.value} onValueChange={field.onChange}>
                                        <SelectTrigger className="bg-background border-border text-foreground h-11 shadow-sm">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            {statusOptions.map((option) => (
                                                <SelectItem key={option.value} value={option.value}>
                                                    {option.label}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                )}
                            />
                        </div>
                    </section>

                    <section className="space-y-4 rounded-xl border border-border p-4 bg-muted/30">
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-sm font-semibold text-foreground">
                                    {t("tournaments.createSeason.autoCreateLabel", { defaultValue: "Tự động tạo mùa tiếp theo" })}
                                </h3>
                                <p className="text-xs text-muted-foreground">
                                    {t("tournaments.createSeason.autoCreateDescription", {
                                        defaultValue: "Hệ thống sẽ tự động mở mùa giải mới trước khi mùa hiện tại kết thúc.",
                                    })}
                                </p>
                            </div>
                            <Controller
                                name="enablePrecreate"
                                control={control}
                                render={({ field }) => (
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                )}
                            />
                        </div>

                        {isPrecreateEnabled && (
                            <div className="grid gap-4 sm:grid-cols-2">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground">
                                        {t("tournaments.createSeason.precreateDays", {
                                            defaultValue: "Tạo trước (ngày)",
                                        })}
                                    </label>
                                    <Controller
                                        name="precreateBeforeEndDays"
                                        control={control}
                                        render={({ field }) => (
                                            <>
                                                <Input
                                                    type="number"
                                                    min={1}
                                                    max={30}
                                                    value={field.value}
                                                    onChange={(event) => {
                                                        const value = Number(event.target.value)
                                                        field.onChange(Number.isNaN(value) ? 0 : value)
                                                    }}
                                                    className="bg-background border-border"
                                                    variant={errors.precreateBeforeEndDays ? "destructive" : "default"}
                                                />
                                                {errors.precreateBeforeEndDays && (
                                                    <p className={`text-xs mt-1 ${errors.precreateBeforeEndDays ? 'text-error' : 'text-foreground'}`}>
                                                        {errors.precreateBeforeEndDays.message as string}
                                                    </p>
                                                )}
                                                <p className="text-xs text-muted-foreground">
                                                    {t("tournaments.createSeason.precreateHint", {
                                                        defaultValue: "Số ngày trước khi mùa giải kết thúc để mở mùa mới.",
                                                    })}
                                                </p>
                                            </>
                                        )}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-sm font-medium text-foreground">
                                        {t("tournaments.createSeason.randomItemAgain", {
                                            defaultValue: "Random lại phần thưởng",
                                        })}
                                    </label>
                                    <Controller
                                        name="isRandomItemAgain"
                                        control={control}
                                        render={({ field }) => (
                                            <div className="flex h-11 items-center justify-between rounded-lg border border-border bg-background px-4">
                                                <span className="text-sm text-muted-foreground">
                                                    {field.value
                                                        ? t("tournaments.createSeason.randomItemAgainOn", { defaultValue: "Bật" })
                                                        : t("tournaments.createSeason.randomItemAgainOff", { defaultValue: "Tắt" })}
                                                </span>
                                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                                            </div>
                                        )}
                                    />
                                </div>
                            </div>
                        )}
                    </section>

                    <DialogFooter className="pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={createSeasonMutation.isPending}>
                            {t("common.cancel", { defaultValue: "Hủy" })}
                        </Button>
                        <Button
                            type="submit"
                            disabled={createSeasonMutation.isPending}
                            className="bg-primary text-primary-foreground hover:bg-primary/90"
                        >
                            {createSeasonMutation.isPending
                                ? t("tournaments.createSeason.submitting", { defaultValue: "Đang tạo..." })
                                : t("tournaments.createSeason.submit", { defaultValue: "Tạo mùa giải" })}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default CreateSeason