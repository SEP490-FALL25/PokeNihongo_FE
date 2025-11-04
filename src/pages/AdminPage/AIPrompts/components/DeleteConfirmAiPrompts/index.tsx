import { useDeleteConfigCustomPrompts } from "@hooks/useAI";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, } from "@ui/AlertDialog"
import { Loader2 } from "lucide-react"
import { useTranslation } from "react-i18next"

interface IDeleteConfirmAiPromptsProps {
    promptIdToDelete: number | null;
    setPromptIdToDelete: (promptId: number | null) => void;
}

const DeleteConfirmAiPrompts = ({ promptIdToDelete, setPromptIdToDelete }: IDeleteConfirmAiPromptsProps) => {
    const { t } = useTranslation();

    /**
     * Handle Delete Prompt
     */
    const deleteMutation = useDeleteConfigCustomPrompts()


    const handleDeleteConfirm = async () => {
        if (promptIdToDelete === null) return

        try {
            await deleteMutation.mutateAsync(promptIdToDelete)
            setPromptIdToDelete(null)
        } catch (error) {
            console.error('Error deleting prompt:', error)
        }
    }
    //------------------------End------------------------//

    return (
        <AlertDialog open={promptIdToDelete !== null} onOpenChange={(open) => !open && setPromptIdToDelete(null)}>
            <AlertDialogContent className="bg-white border-border">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">
                        {t('aiPrompts.deleteDialog.title', { defaultValue: 'Xác nhận xóa' })}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        {t('aiPrompts.deleteDialog.message', {
                            defaultValue: 'Bạn có chắc chắn muốn xóa prompt này? Hành động này không thể hoàn tác.'
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
                                {t('aiPrompts.deleteDialog.deleting', { defaultValue: 'Đang xóa...' })}
                            </>
                        ) : (
                            t('aiPrompts.deleteDialog.deleteButton', { defaultValue: 'Xóa' })
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}

export default DeleteConfirmAiPrompts