import { useDeleteShopItem } from "@hooks/useShop";
import DeleteConfirm from "../DeleteConfirm";

interface IDeleteConfirmShopItemProps {
    itemIdToDelete: number | null;
    setItemIdToDelete: (itemId: number | null) => void;
}

const DeleteConfirmShopItem = ({
    itemIdToDelete,
    setItemIdToDelete,
}: IDeleteConfirmShopItemProps) => {
    /**
     * Handle Delete Shop Item
     */
    const deleteShopItemMutation = useDeleteShopItem();

    const handleDeleteConfirm = () => {
        if (itemIdToDelete === null) return;

        deleteShopItemMutation.mutate(itemIdToDelete, {
            onSuccess: () => {
                setItemIdToDelete(null);
            },
            onError: () => {
                setItemIdToDelete(null);
            }
        });
    };
    //------------------------End------------------------//

    return (
        <DeleteConfirm
            open={itemIdToDelete !== null}
            onOpenChange={(open) => !open && setItemIdToDelete(null)}
            onConfirm={handleDeleteConfirm}
            isDeleting={deleteShopItemMutation.isPending}
            titleKey="configShop.deleteDialog.title"
            messageKey="configShop.deleteDialog.message"
            deleteButtonKey="configShop.deleteDialog.deleteButton"
            deletingKey="configShop.deleteDialog.deleting"
        />
    );
};

export default DeleteConfirmShopItem;
