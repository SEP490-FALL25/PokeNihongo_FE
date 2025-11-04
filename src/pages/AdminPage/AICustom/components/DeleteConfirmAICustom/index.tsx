import { useDeleteAIConfigModel } from "@hooks/useAI"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@ui/AlertDialog"
import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

interface IDeleteConfirmAICustomProps {
    configId: number | null
    setConfigIdToDelete: (configId: number | null) => void
}

const DeleteCustomDialog = ({ configId, setConfigIdToDelete }: IDeleteConfirmAICustomProps) => {
    const { t } = useTranslation()

    /**
     * Handle Delete Config Model
     */
    const deleteMutation = useDeleteAIConfigModel()

    const handleDeleteConfirm = async () => {
        if (configId === null) return

        try {
            await deleteMutation.mutateAsync(configId)
            setConfigIdToDelete(null)
        } catch (error) {
            console.error('Error deleting config model:', error)
        }
    }
    //------------------------End------------------------//

    return (
        <AlertDialog open={configId !== null} onOpenChange={(open) => !open && setConfigIdToDelete(null)}>
            <AlertDialogContent className="bg-white border-border">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">
                        {t('aiCustom.deleteDialog.title', { defaultValue: 'Xác nhận xóa' })}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        {t('aiCustom.deleteDialog.message', {
                            defaultValue: 'Bạn có chắc chắn muốn xóa config này? Hành động này không thể hoàn tác.'
                        })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-border text-foreground hover:bg-muted cursor-pointer">
                        {t('aiCommon.cancel', { defaultValue: 'Hủy' })}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteConfirm}
                        disabled={deleteMutation.isPending}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                    >
                        {deleteMutation.isPending ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {t('aiCustom.deleteDialog.deleting', { defaultValue: 'Đang xóa...' })}
                            </>
                        ) : (
                            t('aiCustom.deleteDialog.deleteButton', { defaultValue: 'Xóa' })
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteCustomDialog