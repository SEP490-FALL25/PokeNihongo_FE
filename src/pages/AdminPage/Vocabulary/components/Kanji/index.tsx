import { Badge } from "@ui/Badge";
import { Button } from "@ui/Button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/Card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@ui/Dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/Table";
import { Input } from "@ui/Input";
import { Edit, Plus, Rows, Trash2, ChevronUp, ChevronDown, ChevronsUpDown, Minus } from 'lucide-react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/Tabs";
import { useKanjiListManagement, useCreateKanjiWithMeaning } from "@hooks/useKanji";
import { useDebounce } from "@hooks/useDebounce";
import { useEffect, useState } from "react";
import { KanjiManagement } from "@models/kanji/entity";
import { EnhancedPagination as Pagination } from "@ui/Pagination";
import { Skeleton } from "@ui/Skeleton";
import { Controller, useForm, useFieldArray } from "react-hook-form";
import { IKanjiWithMeaningRequest } from "@models/kanji/request";
import { toast } from "react-toastify";
import TabListLevelJLBT from "@organisms/TabListLevelJLBT";
import DeleteConfirmKanji from "./components/DeleteConfirmKanji";

interface KanjiVocabulary {
    isAddKanjiDialogOpen: boolean;
    setIsAddKanjiDialogOpen: (value: boolean) => void;
}

const KanjiVocabulary = ({ isAddKanjiDialogOpen, setIsAddKanjiDialogOpen }: KanjiVocabulary) => {

    /**
     * Pagination
     */
    const [page, setPage] = useState<number>(1);
    const [activeTab, setActiveTab] = useState<string>("all");
    const [itemsPerPage, setItemsPerPage] = useState<number>(15);
    const [sortBy, setSortBy] = useState<string>("id");
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const debouncedSearchQuery = useDebounce(searchQuery, 500);
    const [kanjiIdToDelete, setKanjiIdToDelete] = useState<number | null>(null);
    //--------------------End--------------------//

    /**
     * Kanji List
     */
    const { data, isLoading } = useKanjiListManagement({
        page,
        limit: itemsPerPage,
        search: debouncedSearchQuery,
        sortOrder,
        sortBy,
        jlptLevel: activeTab === 'all' ? undefined : activeTab,
        strokeCount: "",
    });

    const kanjiList = data?.data;
    //--------------------End--------------------//

    /**
     * Hanlde Add Kanji Dialog
     */
    const { register, handleSubmit, control, reset } = useForm<IKanjiWithMeaningRequest>({
        defaultValues: {
            character: "",
            strokeCount: 0,
            jlptLevel: 0,
            image: null,
            readings: [],
            meanings: [],
        },
    });

    const { fields: readingsFields, append: appendReading, remove: removeReading } = useFieldArray({ control, name: "readings" });
    const { fields: meaningFields, append: appendMeaning, remove: removeMeaning } = useFieldArray({ control, name: "meanings" });

    const createKanjiMutation = useCreateKanjiWithMeaning();

    const onSubmit = (formData: IKanjiWithMeaningRequest) => {
        createKanjiMutation.mutate(formData, {
            onSuccess: (res: any) => {
                if (res.data.statusCode === 201 || res.data.statusCode === 200) {
                    toast.success("Thêm Kanji thành công!");
                    setIsAddKanjiDialogOpen(false);
                }
            },
            onError: (error: any) => {
                toast.error(error.response?.data?.message || "Đã có lỗi xảy ra.");
            }
        });
    };

    useEffect(() => {
        if (isAddKanjiDialogOpen) {
            reset({
                character: "",
                strokeCount: 0,
                jlptLevel: 5,
                image: null,
                readings: [{ readingType: "onyomi", reading: "" }],
                meanings: [{ translations: { vi: "", en: "" } }],
            });
        }
    }, [isAddKanjiDialogOpen, reset]);
    //--------------------End--------------------//

    /**
     * Handle items per page change
     */
    const handleItemsPerPageChange = (value: string) => {
        setItemsPerPage(parseInt(value));
        setPage(1);
    };
    //--------------------------------End--------------------------------//

    /**
     * Handle column sort
     */
    const toggleSort = (columnKey: string) => {
        if (sortBy === columnKey) {
            setSortOrder(prev => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortBy(columnKey);
            setSortOrder("asc");
        }
        setPage(1);
    };
    //--------------------------------End--------------------------------//

    return (
        <Card className="shadow-lg bg-white">
            <CardHeader className="pb-0">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-2xl font-bold text-gray-800">Quản lý Kanji</CardTitle>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <div className="mt-4 pb-4 flex-1 mr-4 focus:ring-primary focus:ring-2">
                        <Input
                            placeholder="Tìm kiếm Kanji..."
                            value={searchQuery}
                            isSearch
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <Dialog open={isAddKanjiDialogOpen} onOpenChange={setIsAddKanjiDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary text-white hover:bg-primary/90 rounded-full shadow-md transition-transform transform hover:scale-105">
                                <Plus className="h-5 w-5 mr-2" />
                                Thêm mới
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="bg-white border-gray-200 shadow-xl max-w-3xl rounded-xl">
                            <DialogHeader>
                                <DialogTitle className="text-2xl font-bold text-gray-800">Thêm Kanji mới</DialogTitle>
                            </DialogHeader>
                            <form onSubmit={handleSubmit(onSubmit)} noValidate>
                                <Tabs defaultValue="info" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3 bg-gray-100 rounded-lg p-1">
                                        <TabsTrigger value="info" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md">Thông tin</TabsTrigger>
                                        <TabsTrigger value="readings" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md">Cách đọc</TabsTrigger>
                                        <TabsTrigger value="meanings" className="data-[state=active]:bg-white data-[state=active]:shadow-md data-[state=active]:text-primary rounded-md">Ý nghĩa</TabsTrigger>
                                    </TabsList>
                                    <div className="max-h-[60vh] overflow-y-auto p-1 mt-2">

                                        <TabsContent value="info">
                                            <Card className="border-none shadow-none">
                                                <CardContent className="space-y-6 pt-6">
                                                    <div className="space-y-2">
                                                        <label className="text-sm font-medium text-gray-700">Ký tự Kanji</label>
                                                        <Input placeholder="日" className="bg-gray-50 border-gray-300 text-gray-800 rounded-lg" {...register("character", { required: true })} />
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">Số nét</label>
                                                            <Input type="number" placeholder="4" className="bg-gray-50 border-gray-300 text-gray-800 rounded-lg" {...register("strokeCount", { valueAsNumber: true })} />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <label className="text-sm font-medium text-gray-700">Cấp độ JLPT</label>
                                                            <Controller
                                                                control={control}
                                                                name="jlptLevel"
                                                                render={({ field }) => (
                                                                    <Select onValueChange={(v) => field.onChange(Number(v))}>
                                                                        <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-800 rounded-lg">
                                                                            <SelectValue placeholder="Chọn cấp độ" />
                                                                        </SelectTrigger>
                                                                        <SelectContent>
                                                                            <SelectItem value="5">N5</SelectItem>
                                                                            <SelectItem value="4">N4</SelectItem>
                                                                            <SelectItem value="3">N3</SelectItem>
                                                                            <SelectItem value="2">N2</SelectItem>
                                                                            <SelectItem value="1">N1</SelectItem>
                                                                        </SelectContent>
                                                                    </Select>
                                                                )}
                                                            />
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="readings">
                                            <TabListLevelJLBT />
                                            <Card className="border-none shadow-none">
                                                <CardContent className="space-y-6 pt-6">
                                                    {/* Readings (combined onyomi/kunyomi) */}
                                                    {readingsFields.map((field, index) => (
                                                        <div key={field.id} className="grid grid-cols-2 gap-2 items-center">
                                                            <Select defaultValue={field.readingType}>
                                                                <SelectTrigger className="bg-gray-50 border-gray-300 text-gray-800 rounded-lg">
                                                                    <SelectValue placeholder="Loại đọc" />
                                                                </SelectTrigger>
                                                                <SelectContent>
                                                                    <SelectItem value="onyomi">Onyomi</SelectItem>
                                                                    <SelectItem value="kunyomi">Kunyomi</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                            <Input placeholder={`Đọc #${index + 1}`} className="bg-gray-50 border-gray-300" {...register(`readings.${index}.reading` as const)} />
                                                            <input type="hidden" {...register(`readings.${index}.readingType` as const)} defaultValue={field.readingType || "onyomi"} />
                                                            <div className="flex justify-end">
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeReading(index)}><Trash2 className="w-5 h-5 text-red-500" /></Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-end">
                                                        <Button type="button" variant="outline" onClick={() => appendReading({ readingType: "onyomi", reading: "" })}>
                                                            <Plus className="h-4 w-4 mr-2" /> Thêm cách đọc
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>

                                        <TabsContent value="meanings">
                                            <Card className="border-none shadow-none">
                                                <CardContent className="space-y-4 pt-6">
                                                    {meaningFields.map((field, index) => (
                                                        <div key={field.id} className="p-4 border rounded-lg bg-gray-50 space-y-4 relative">
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-gray-700">Tiếng Việt</label>
                                                                <Input placeholder="VD: mặt trời" className="bg-white border-gray-300" {...register(`meanings.${index}.translations.vi` as const)} />
                                                            </div>
                                                            <div className="space-y-2">
                                                                <label className="text-sm font-medium text-gray-700">Tiếng Anh</label>
                                                                <Input placeholder="VD: sun" className="bg-white border-gray-300" {...register(`meanings.${index}.translations.en` as const)} />
                                                            </div>
                                                            <div className="flex justify-end">
                                                                <Button type="button" variant="ghost" size="icon" onClick={() => removeMeaning(index)}><Trash2 className="w-4 h-4 text-red-500" /></Button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                    <div className="flex justify-end">
                                                        <Button type="button" variant="outline" className="mt-2 border-dashed" onClick={() => appendMeaning({ translations: { vi: "", en: "" } as any })}>
                                                            <Plus className="h-4 w-4 mr-2" /> Thêm ý nghĩa
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </TabsContent>
                                    </div>

                                </Tabs>

                                <div className="flex justify-end gap-3 pt-4 border-t mt-4">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddKanjiDialogOpen(false)}
                                        className="rounded-full"
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit" disabled={createKanjiMutation.isPending} className="bg-primary text-white hover:bg-primary/90 rounded-full shadow-md">{createKanjiMutation.isPending ? "Đang thêm..." : "Thêm"}</Button>
                                </div>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </CardHeader>
            <CardContent>
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabListLevelJLBT />
                    <TabsContent value={activeTab} className="mt-6">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-24">
                                        <span className="inline-flex items-center gap-1 text-gray-600">
                                            Kanji
                                            <Minus className="w-4 h-4 text-gray-300" />
                                        </span>
                                    </TableHead>
                                    <TableHead className="w-56">
                                        <span className="inline-flex items-center gap-1 text-gray-600">
                                            Nghĩa
                                            <Minus className="w-4 h-4 text-gray-300" />
                                        </span>
                                    </TableHead>
                                    <TableHead className="w-28 select-none">
                                        <button
                                            className="inline-flex items-center gap-1 hover:text-gray-900"
                                            onClick={() => toggleSort("strokeCount")}
                                        >
                                            Số nét
                                            <span className="inline-block w-4 h-4">
                                                {sortBy === "strokeCount" ? (
                                                    sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                                                )}
                                            </span>
                                        </button>
                                    </TableHead>
                                    <TableHead className="w-24 select-none">
                                        <button
                                            className="inline-flex items-center gap-1 hover:text-gray-900"
                                            onClick={() => toggleSort("jlptLevel")}
                                        >
                                            JLPT
                                            <span className="inline-block w-4 h-4">
                                                {sortBy === "jlptLevel" ? (
                                                    sortOrder === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />
                                                ) : (
                                                    <ChevronsUpDown className="w-4 h-4 text-gray-400" />
                                                )}
                                            </span>
                                        </button>
                                    </TableHead>
                                    <TableHead className="w-40">
                                        <span className="inline-flex items-center gap-1 text-gray-600">
                                            On'yomi
                                            <Minus className="w-4 h-4 text-gray-300" />
                                        </span>
                                    </TableHead>
                                    <TableHead className="w-40">
                                        <span className="inline-flex items-center gap-1 text-gray-600">
                                            Kun'yomi
                                            <Minus className="w-4 h-4 text-gray-300" />
                                        </span>
                                    </TableHead>
                                    <TableHead className="text-right w-28">
                                        <div className="inline-flex items-center gap-1 justify-end w-full text-gray-600">
                                            Hành động
                                            <Minus className="w-4 h-4 text-gray-300" />
                                        </div>
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    Array.from({ length: kanjiList?.pagination?.pageSize || itemsPerPage }).map((_, i) => (
                                        <TableRow key={`skeleton-${i}`}>
                                            <TableCell className="py-4"><Skeleton className="h-6 w-10" /></TableCell>
                                            <TableCell className="py-4"><Skeleton className="h-6 w-40" /></TableCell>
                                            <TableCell className="py-4"><Skeleton className="h-6 w-14" /></TableCell>
                                            <TableCell className="py-4"><Skeleton className="h-6 w-12" /></TableCell>
                                            <TableCell className="py-4"><Skeleton className="h-6 w-32" /></TableCell>
                                            <TableCell className="py-4"><Skeleton className="h-6 w-32" /></TableCell>
                                            <TableCell className="py-4 text-right"><Skeleton className="h-6 w-16 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    kanjiList?.results?.map((k: KanjiManagement) => (
                                        <TableRow key={k.id}>
                                            <TableCell className="text-2xl font-bold w-24 whitespace-nowrap">{k.kanji}</TableCell>
                                            <TableCell className="w-56">{k.meaning || ''}</TableCell>
                                            <TableCell className="w-28 whitespace-nowrap">{k.strokeCount || ''}</TableCell>
                                            <TableCell className="w-24 whitespace-nowrap"><Badge className="text-white font-semibold">N{k.jlptLevel}</Badge></TableCell>
                                            <TableCell className="w-40">{k.onyomi}</TableCell>
                                            <TableCell className="w-40">{k.kunyomi}</TableCell>
                                            <TableCell className="text-right w-28">
                                                <Button variant="ghost" size="icon"><Edit className="w-4 h-4" /></Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => setKanjiIdToDelete(k.id)}
                                                    className="text-error hover:text-white hover:bg-error"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TabsContent>
                </Tabs>

            </CardContent>
            <CardFooter className="flex justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Select value={String(kanjiList?.pagination?.pageSize || itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                        <SelectTrigger className="w-[100px] bg-background border-border text-foreground h-9">
                            <Rows className="h-4 w-4 mr-2" />
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-card border-border">
                            {[15, 30, 45, 60].map(size => (
                                <SelectItem key={size} value={String(size)}>{size} / trang</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                {!isLoading && kanjiList && (
                    <Pagination
                        currentPage={kanjiList?.pagination?.current || 1}
                        totalPages={kanjiList?.pagination?.totalPage || 0}
                        totalItems={kanjiList?.pagination?.totalItem || 0}
                        itemsPerPage={kanjiList?.pagination?.pageSize || 0}
                        onPageChange={(nextPage: number) => { setPage(nextPage); }}
                    />
                )}
            </CardFooter>

            <DeleteConfirmKanji
                kanjiIdToDelete={kanjiIdToDelete}
                setKanjiIdToDelete={setKanjiIdToDelete}
            />
        </Card>
    )
}

export default KanjiVocabulary