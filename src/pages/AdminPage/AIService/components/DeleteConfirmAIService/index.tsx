import { useDeleteServiceConfig } from "@hooks/useAI";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@ui/AlertDialog";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface IDeleteConfirmAIServiceProps {
  configIdToDelete: number | null;
  setConfigIdToDelete: (configId: number | null) => void;
}

const DeleteConfirmAIService = ({
  configIdToDelete,
  setConfigIdToDelete,
}: IDeleteConfirmAIServiceProps) => {
  const { t } = useTranslation();

  /**
   * Handle Delete Service Config
   */
  const deleteMutation = useDeleteServiceConfig();

  const handleDeleteConfirm = async () => {
    if (configIdToDelete === null) return;

    try {
      await deleteMutation.mutateAsync(configIdToDelete);
      setConfigIdToDelete(null);
    } catch (error) {
      console.error("Error deleting service config:", error);
    }
  };
  //------------------------End------------------------//

  return (
    <AlertDialog
      open={configIdToDelete !== null}
      onOpenChange={(open) => !open && setConfigIdToDelete(null)}
    >
      <AlertDialogContent className="bg-white border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            {t("aiService.deleteDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {t("aiService.deleteDialog.message")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="border-border text-foreground hover:bg-muted cursor-pointer">
            {t("common.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={deleteMutation.isPending}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
          >
            {deleteMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                {t("aiService.deleteDialog.deleting")}
              </>
            ) : (
              t("aiService.deleteDialog.deleteButton")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmAIService;

