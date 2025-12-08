
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/Card";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Tabs, TabsContent } from "@ui/Tabs";
import { Edit, Trash2, Volume2, ChevronUp, ChevronDown, ChevronsUpDown, Minus } from "lucide-react";
import { Badge } from "@ui/Badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/Table";
import { Dialog, DialogTrigger } from "@ui/Dialog";
import { Plus } from "lucide-react";
import CreateVocabulary from "../CreateVocabulary";
import { useVocabularyList } from "@hooks/useVocabulary";
import { useDebounce } from "@hooks/useDebounce";
import PaginationControls from "@ui/PaginationControls";
import { useState } from "react";
import { Skeleton } from "@ui/Skeleton";
import TabListLevelJLBT from "@organisms/TabListLevelJLBT";
import DeleteConfirmVocabulary from "./components/DeleteConfirmVocabulary";
import { useTranslation } from "react-i18next";
import UpdateVocabularyDialog from "./components/UpdateVocabularyDialog";

interface Vocabulary {
    isAddVocabularyDialogOpen: boolean;
    setIsAddVocabularyDialogOpen: (value: boolean) => void;
}

const ListVocabulary = ({ isAddVocabularyDialogOpen, setIsAddVocabularyDialogOpen }: Vocabulary) => {
    const { t } = useTranslation();

    /**
     * Handle Vocabulary List Hook
     */
    const [searchQuery, setSearchQuery] = useState<string>("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [page, setPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(15);
    const [sortBy, setSortBy] = useState<string | undefined>("createdAt");
    const [sort, setSort] = useState<"asc" | "desc" | undefined>("desc");
    const [vocabularyIdToDelete, setVocabularyIdToDelete] = useState<number | null>(null);
    const [vocabularyToEdit, setVocabularyToEdit] = useState<MODELS.VocabularyForUpdate | null>(null);
    const { data: vocabularies, isLoading } = useVocabularyList({
        page: page,
        limit: itemsPerPage,
        search: debouncedSearchQuery,
        levelN: activeTab === "all" ? undefined : activeTab,
        sortBy,
        sort,
    });
    //--------------------------------End--------------------------------//


    /**
     * handle play audio
     * @param audioUrl 
     */
    const handlePlayAudio = (audioUrl: string) => {
        const audio = new Audio(audioUrl);
        audio.play().catch(error => {
            console.error('Error playing audio:', error);
        });
    };
    //--------------------------------End--------------------------------//

    /**
     * get type badge color
     * @param type 
     * @returns 
     */
    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case "noun":
                return "bg-blue-500 text-white";
            case "verb":
                return "bg-green-500 text-white";
            case "adjective":
                return "bg-yellow-500 text-white";
            case "adverb":
                return "bg-indigo-500 text-white";
            case "particle":
                return "bg-pink-500 text-white";
            default:
                return "bg-gray-400 text-white";
        }
    };
    //--------------------------------End--------------------------------//


    /**
     * get level badge color
     * @param level 
     * @returns 
     */

    //--------------------------------End--------------------------------//

    //--------------------------------End--------------------------------//

    /**
     * Handle column sort
     */
    const toggleSort = (columnKey: string) => {
        if (sortBy === columnKey) {
            setSort(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(columnKey);
            setSort("asc");
        }
        setPage(1);
    };
    //--------------------------------End--------------------------------//

    /**
     * Skeleton component for loading state
     */
    const VocabularySkeleton = () => (
        <Table>
            <TableHeader>
                <TableRow className="border-gray-200 hover:bg-gray-50">
                    <TableHead className="text-gray-600 font-semibold">{t("vocabulary.listVocabulary.columns.wordJp")}</TableHead>
                    <TableHead className="text-gray-600 font-semibold">{t("vocabulary.listVocabulary.columns.reading")}</TableHead>
                    <TableHead className="text-gray-600 font-semibold">{t("vocabulary.listVocabulary.columns.wordType")}</TableHead>
                    <TableHead className="text-gray-600 font-semibold">{t("vocabulary.listVocabulary.columns.level")}</TableHead>
                    <TableHead className="text-gray-600 font-semibold">{t("vocabulary.listVocabulary.columns.media")}</TableHead>
                    <TableHead>
                        <div className="text-center font-semibold text-gray-600">{t("vocabulary.listVocabulary.columns.actions")}</div>
                    </TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {Array.from({ length: vocabularies?.pagination?.pageSize || itemsPerPage }).map((_, index) => (
                    <TableRow key={index} className="border-gray-200 hover:bg-gray-50">
                        <TableCell>
                            <Skeleton className="h-6 w-24" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-5 w-20" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-6 w-16 rounded-full" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-6 w-12 rounded-full" />
                        </TableCell>
                        <TableCell>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </TableCell>
                        <TableCell className="text-right">
                            <div className="flex justify-center gap-2">
                                <Skeleton className="h-8 w-8 rounded-full" />
                                <Skeleton className="h-8 w-8 rounded-full" />
                            </div>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    );

    return (
        <Card className="bg-white shadow-lg">
            <CardHeader className="pb-0">
                <div className="flex items-center justify-between mt-2">
                    <CardTitle className="text-2xl font-bold text-gray-800">{t("vocabulary.listVocabulary.title")}</CardTitle>
                </div>

                <div className="flex items-center justify-between">
                    <div className="mt-4 pb-4 flex-1 mr-4 focus:ring-primary focus:ring-2">
                        <Input
                            placeholder={t("vocabulary.listVocabulary.searchPlaceholder")}
                            value={searchQuery}
                            isSearch
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Dialog open={isAddVocabularyDialogOpen} onOpenChange={setIsAddVocabularyDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary text-white hover:bg-primary/90 rounded-full shadow-md transition-transform transform hover:scale-105">
                                <Plus className="h-5 w-5 mr-2" /> {t("vocabulary.listVocabulary.addNew")}
                            </Button>
                        </DialogTrigger>
                        <CreateVocabulary setIsAddDialogOpen={setIsAddVocabularyDialogOpen} />
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabListLevelJLBT />

                    <TabsContent value={activeTab} className="mt-6">
                        {isLoading ? (
                            <VocabularySkeleton />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-gray-200 hover:bg-gray-50">
                                        <TableHead className="text-gray-600 font-semibold w-40">
                                            <span className="inline-flex items-center gap-1 text-gray-600">
                                                {t("vocabulary.listVocabulary.columns.wordJp")}
                                                <Minus className="w-4 h-4 text-gray-300" />
                                            </span>
                                        </TableHead>
                                        <TableHead className="text-gray-600 font-semibold w-36">
                                            <span className="inline-flex items-center gap-1 text-gray-600">
                                                {t("vocabulary.listVocabulary.columns.reading")}
                                                <Minus className="w-4 h-4 text-gray-300" />
                                            </span>
                                        </TableHead>
                                        <TableHead className="text-gray-600 font-semibold w-28">
                                            <span className="inline-flex items-center gap-1 text-gray-600">
                                                {t("vocabulary.listVocabulary.columns.wordType")}
                                                <Minus className="w-4 h-4 text-gray-300" />
                                            </span>
                                        </TableHead>
                                        <TableHead className="text-gray-600 font-semibold select-none w-24">
                                            <button
                                                className="inline-flex items-center gap-1 hover:text-gray-900"
                                                onClick={() => toggleSort("levelN")}
                                            >
                                                {t("vocabulary.listVocabulary.columns.level")}
                                                <span className="inline-block w-4 h-4">
                                                    {sortBy === "levelN" ? (
                                                        sort === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                                    ) : (
                                                        <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                                                    )}
                                                </span>
                                            </button>
                                        </TableHead>
                                        <TableHead className="text-gray-600 font-semibold w-24">
                                            <span className="inline-flex items-center gap-1 text-gray-600">
                                                {t("vocabulary.listVocabulary.columns.media")}
                                                <Minus className="w-4 h-4 text-gray-300" />
                                            </span>
                                        </TableHead>
                                        <TableHead className="text-right w-28">
                                            <div className="inline-flex items-center gap-1 justify-end w-full text-gray-600 font-semibold">
                                                {t("vocabulary.listVocabulary.columns.actions")}
                                                <Minus className="w-4 h-4 text-gray-300" />
                                            </div>
                                        </TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {vocabularies?.results?.map((vocab: any) => (
                                        <TableRow key={vocab.id} className="border-gray-200 hover:bg-gray-50">
                                            <TableCell className="font-semibold text-lg text-gray-800 w-40 whitespace-nowrap">{vocab.wordJp}</TableCell>
                                            <TableCell className="text-gray-500 w-36 whitespace-nowrap">{vocab.reading}</TableCell>
                                            <TableCell className="w-28 whitespace-nowrap">
                                                {(() => {
                                                    const typeName = (vocab?.wordType?.name as string | undefined) || "unknown";
                                                    const label = t(`vocabulary.listVocabulary.wordTypes.${typeName}`, typeName);
                                                    return (
                                                        <Badge className={getTypeBadgeColor(typeName) + " font-semibold"}>
                                                            {label}
                                                        </Badge>
                                                    );
                                                })()}
                                            </TableCell>
                                            <TableCell className="w-24 whitespace-nowrap">
                                                <Badge className={"text-white font-semibold"}>N{vocab.levelN}</Badge>
                                            </TableCell>
                                            <TableCell className="w-24">
                                                <div className="flex gap-2">
                                                    {vocab.audioUrl && (
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-blue-500 hover:bg-blue-100 rounded-full"
                                                            onClick={() => handlePlayAudio(vocab.audioUrl)}
                                                        >
                                                            <Volume2 className="h-4 w-4" />
                                                        </Button>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right w-28">
                                                <Button variant="ghost" size="icon" onClick={() => setVocabularyToEdit(vocab)}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setVocabularyIdToDelete(vocab.id)}
                                                    className="text-error hover:text-white hover:bg-error"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </TabsContent>
                </Tabs>
            </CardContent>

            <CardFooter>
                <PaginationControls
                    currentPage={vocabularies?.pagination?.current || 1}
                    totalPages={vocabularies?.pagination?.totalPage || 1}
                    totalItems={vocabularies?.pagination?.totalItem || 0}
                    itemsPerPage={vocabularies?.pagination?.pageSize || itemsPerPage}
                    onPageChange={setPage}
                    onItemsPerPageChange={setItemsPerPage}
                    isLoading={isLoading}
                />
            </CardFooter>

            <DeleteConfirmVocabulary
                vocabularyIdToDelete={vocabularyIdToDelete}
                setVocabularyIdToDelete={setVocabularyIdToDelete}
            />
            <UpdateVocabularyDialog
                vocabulary={vocabularyToEdit}
                onClose={() => setVocabularyToEdit(null)}
            />
        </Card>
    )
}

export default ListVocabulary