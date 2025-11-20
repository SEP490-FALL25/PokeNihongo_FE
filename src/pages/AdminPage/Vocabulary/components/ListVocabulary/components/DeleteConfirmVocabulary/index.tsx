import { useDeleteVocabulary } from "@hooks/useVocabulary";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@ui/AlertDialog";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface IDeleteConfirmVocabularyProps {
  vocabularyIdToDelete: number | null;
  setVocabularyIdToDelete: (vocabularyId: number | null) => void;
}

const DeleteConfirmVocabulary = ({
  vocabularyIdToDelete,
  setVocabularyIdToDelete,
}: IDeleteConfirmVocabularyProps) => {
  const { t } = useTranslation();

  /**
   * Handle Delete Vocabulary
   */
  const deleteMutation = useDeleteVocabulary();

  const handleDeleteConfirm = async () => {
    if (vocabularyIdToDelete === null) return;

    try {
      await deleteMutation.mutateAsync(vocabularyIdToDelete);
      setVocabularyIdToDelete(null);
    } catch (error) {
      console.error("Error deleting vocabulary:", error);
    }
  };
  //------------------------End------------------------//

  return (
    <AlertDialog
      open={vocabularyIdToDelete !== null}
      onOpenChange={(open) => !open && setVocabularyIdToDelete(null)}
    >
      <AlertDialogContent className="bg-white border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            {t("vocabulary.deleteDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {t("vocabulary.deleteDialog.message")}
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
                {t("vocabulary.deleteDialog.deleting")}
              </>
            ) : (
              t("vocabulary.deleteDialog.deleteButton")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmVocabulary;

