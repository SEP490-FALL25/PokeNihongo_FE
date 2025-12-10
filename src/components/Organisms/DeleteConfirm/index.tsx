import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@ui/AlertDialog";
import { Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";

interface IDeleteConfirmProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    isDeleting?: boolean;
    titleKey: string;
    messageKey: string;
    deleteButtonKey?: string;
    deletingKey?: string;
}

const DeleteConfirm = ({
    open,
    onOpenChange,
    onConfirm,
    isDeleting = false,
    titleKey,
    messageKey,
    deleteButtonKey = "common.delete",
    deletingKey,
}: IDeleteConfirmProps) => {
    const { t } = useTranslation();

    const handleDeleteConfirm = () => {
        onConfirm();
    };

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="bg-white border-border">
                <AlertDialogHeader>
                    <AlertDialogTitle className="text-foreground">
                        {t(titleKey)}
                    </AlertDialogTitle>
                    <AlertDialogDescription className="text-muted-foreground">
                        {t(messageKey)}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel className="border-border text-foreground hover:bg-muted cursor-pointer">
                        {t("common.cancel")}
                    </AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleDeleteConfirm}
                        disabled={isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                {deletingKey ? t(deletingKey) : t("common.deleting")}
                            </>
                        ) : (
                            t(deleteButtonKey)
                        )}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
};

export default DeleteConfirm;
