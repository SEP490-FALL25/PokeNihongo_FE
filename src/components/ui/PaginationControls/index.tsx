import { Rows } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { EnhancedPagination } from "@ui/Pagination";
import { useTranslation } from "react-i18next";

interface PaginationControlsProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange: (itemsPerPage: number) => void;
    itemsPerPageOptions?: number[];
    isLoading?: boolean;
}

const PaginationControls = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    itemsPerPageOptions = [15, 30, 45, 60],
    isLoading = false
}: PaginationControlsProps) => {
    const { t } = useTranslation();
    const handleItemsPerPageChange = (value: string) => {
        onItemsPerPageChange(parseInt(value));
    };

    return (
        <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                    <SelectTrigger className="w-[100px] bg-background border-border text-foreground h-9">
                        <Rows className="h-4 w-4 mr-2" />
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                        {itemsPerPageOptions.map(size => (
                            <SelectItem key={size} value={String(size)}>{size}{t('common.perPage')}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            {!isLoading && (
                <EnhancedPagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    onPageChange={onPageChange}
                />
            )}
        </div>
    );
};

export default PaginationControls;
