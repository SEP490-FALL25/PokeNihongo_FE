import { useDeleteBattleLeaderBoardSeason } from "@hooks/useBattle";
import { Button } from "@ui/Button"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@ui/Dialog"
import { useTranslation } from "react-i18next"

interface DialogDeleteSeasonProps {
    candidate: { id: number; name: string } | null
    isOpen: boolean
    onCancel: () => void
}

export default function DialogDeleteSeason({
    candidate,
    isOpen,
    onCancel,
}: DialogDeleteSeasonProps) {
    const { t } = useTranslation()

    /**
     * Handle Delete Battle Leader Board Season
     */
    const deleteSeasonMutation = useDeleteBattleLeaderBoardSeason()
    const handleConfirmDelete = async () => {
        if (!candidate) return
        try {
            await deleteSeasonMutation.mutateAsync(candidate.id)
            onCancel()
        } catch (error) {
            console.log(error)
        }
    }
    //------------------------End------------------------//

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            if (!open) {
                onCancel()
            }
        }}>
            <DialogContent className="bg-white border-border max-w-md">
                <DialogHeader>
                    <DialogTitle className="text-foreground text-lg font-semibold">
                        {t("tournaments.delete.confirmTitle", { defaultValue: "Xác nhận xoá mùa giải" })}
                    </DialogTitle>
                </DialogHeader>
                <div className="space-y-3 text-sm text-muted-foreground">
                    <p>
                        {t("tournaments.delete.confirmMessage", {
                            defaultValue: "Bạn có chắc chắn muốn xoá mùa giải này không?",
                        })}
                    </p>
                    {candidate?.name && (
                        <p className="text-foreground font-medium">
                            {candidate.name}
                        </p>
                    )}
                    <p className="text-xs italic text-error">
                        {t("tournaments.delete.note", {
                            defaultValue: "Hành động này không thể hoàn tác.",
                        })}
                    </p>
                </div>
                <DialogFooter className="pt-4">
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        disabled={deleteSeasonMutation.isPending}
                        className="border-border text-foreground hover:bg-muted shadow-sm"
                    >
                        {t("common.cancel", { defaultValue: "Hủy" })}
                    </Button>
                    <Button
                        onClick={handleConfirmDelete}
                        disabled={deleteSeasonMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm"
                    >
                        {deleteSeasonMutation.isPending
                            ? t("tournaments.delete.deleting", { defaultValue: "Đang xoá..." })
                            : t("tournaments.delete.confirmAction", { defaultValue: "Xoá mùa giải" })}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
