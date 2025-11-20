import { useDeleteKanji } from "@hooks/useKanji";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@ui/AlertDialog";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface IDeleteConfirmKanjiProps {
  kanjiIdToDelete: number | null;
  setKanjiIdToDelete: (kanjiId: number | null) => void;
}

const DeleteConfirmKanji = ({
  kanjiIdToDelete,
  setKanjiIdToDelete,
}: IDeleteConfirmKanjiProps) => {
  const { t } = useTranslation();

  /**
   * Handle Delete Kanji
   */
  const deleteMutation = useDeleteKanji();

  const handleDeleteConfirm = async () => {
    if (kanjiIdToDelete === null) return;

    try {
      await deleteMutation.mutateAsync(kanjiIdToDelete);
      setKanjiIdToDelete(null);
    } catch (error) {
      console.error("Error deleting kanji:", error);
    }
  };
  //------------------------End------------------------//

  return (
    <AlertDialog
      open={kanjiIdToDelete !== null}
      onOpenChange={(open) => !open && setKanjiIdToDelete(null)}
    >
      <AlertDialogContent className="bg-white border-border">
        <AlertDialogHeader>
          <AlertDialogTitle className="text-foreground">
            {t("vocabulary.kanji.deleteDialog.title")}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            {t("vocabulary.kanji.deleteDialog.message")}
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
                {t("vocabulary.kanji.deleteDialog.deleting")}
              </>
            ) : (
              t("vocabulary.kanji.deleteDialog.deleteButton")
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteConfirmKanji;

