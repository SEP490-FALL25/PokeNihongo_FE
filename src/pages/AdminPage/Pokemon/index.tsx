import { useState } from "react";
import { Edit, Trash2, MoreVertical, Filter, Search, Circle } from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/Card";
import { Button } from "@ui/Button";
import { Input } from "@ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import { Badge } from "@ui/Badge";
import { Skeleton } from "@ui/Skeleton";
import HeaderAdmin from "@organisms/Header/Admin";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ui/DropdownMenu";
import PaginationControls from "@ui/PaginationControls";
import { usePokemonList } from "@hooks/usePokemon";
import { useElementalTypeList } from "@hooks/useElemental";
import { useDebounce } from "@hooks/useDebounce";
import { RarityPokemon } from "@constants/pokemon";
import CreatePokemon from "./components/CreatePokemon";
import { useTranslation } from "react-i18next";


export default function PokemonManagement() {
    const { t } = useTranslation();
    const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false);


    /**
     * Handle Pokemon List Hook
     */
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [selectedRarity, setSelectedRarity] = useState<string>("all");
    const [selectedType, setSelectedType] = useState<string>("all");
    const [itemsPerPage, setItemsPerPage] = useState<number>(15);
    const [currentPage, setCurrentPage] = useState<number>(1);
    const debouncedSearchQuery = useDebounce(searchQuery, 500);

    const { data: pokemonData, isLoading: isPokemonLoading, error: pokemonError } = usePokemonList({
        page: currentPage,
        limit: itemsPerPage,
        type: selectedType === 'all' ? undefined : selectedType,
        search: debouncedSearchQuery || undefined,
        rarity: selectedRarity === 'all' ? undefined : selectedRarity,
    });


    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
        setCurrentPage(1);
    };

    const handleTypeChange = (value: string) => {
        setSelectedType(value);
        setCurrentPage(1);
    };


    const handleRarityChange = (value: string) => {
        setSelectedRarity(value);
        setCurrentPage(1);
    };
    //--------------------------------End--------------------------------//

    /**
     * Handle Elemental Type List Hook
     */
    const { data: typesData, isLoading: isTypesLoading } = useElementalTypeList({ page: 1, limit: 100 });
    //--------------------------------End--------------------------------//

    const getRarityBadgeVariant = (rarity: string) => {
        switch (rarity) {
            case RarityPokemon.COMMON: return "secondary";
            case RarityPokemon.UNCOMMON: return "secondary";
            case RarityPokemon.RARE: return "secondary";
            case RarityPokemon.EPIC: return "secondary";
            case RarityPokemon.LEGENDARY: return "destructive";
            default: return "outline";
        }
    };

    /**
     * Skeleton component for loading state
     */
    const PokemonSkeleton = () => (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: itemsPerPage }).map((_, index) => (
                <Card key={`skeleton-${index}`} className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md flex flex-col">
                    <CardHeader>
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4 flex-1">
                                <Skeleton className="w-24 h-24 rounded-xl" />
                                <div className="space-y-2 flex-1">
                                    <Skeleton className="h-6 w-24" />
                                    <Skeleton className="h-4 w-32" />
                                    <div className="flex gap-2 mt-2">
                                        <Skeleton className="h-5 w-16 rounded-full" />
                                        <Skeleton className="h-5 w-20 rounded-full" />
                                    </div>
                                </div>
                            </div>
                            <Skeleton className="h-8 w-8 rounded-full" />
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-end">
                        <div className="space-y-3 pt-4 border-t border-border/50 bg-muted/20 rounded-lg p-4">
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-4 w-16" />
                                <Skeleton className="h-6 w-20 rounded-full" />
                            </div>
                            <div className="flex justify-between items-center">
                                <Skeleton className="h-4 w-24" />
                                <Skeleton className="h-4 w-8" />
                            </div>
                            <div className="pt-2 border-t border-border/50">
                                <Skeleton className="h-8 w-full" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );



    return (
        <>
            <HeaderAdmin title={t('pokemon.title')} description={t('pokemon.description')} />
            <div className="p-8 mt-24 space-y-8">
                {/* Filters Bar */}
                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Circle className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">{t('pokemon.title')}</CardTitle>
                            </div>
                            <CreatePokemon
                                isAddDialogOpen={isAddDialogOpen}
                                setIsAddDialogOpen={setIsAddDialogOpen}
                                typesData={typesData}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                <Input
                                    placeholder={t('pokemon.searchPlaceholder')}
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                    className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                />
                            </div>
                            <Select value={selectedType} onValueChange={handleTypeChange}>
                                <SelectTrigger className="bg-background border-border text-foreground w-full sm:w-[180px] h-11 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder={t('pokemon.filterByType')} />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="all">{t('pokemon.allTypes')}</SelectItem>
                                    {isTypesLoading ? (
                                        <SelectItem value="loading" disabled>{t('common.loading')}</SelectItem>
                                    ) : (
                                        typesData?.results.map((type: any) => (
                                            <SelectItem key={type.id} value={type.id}>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: type.color_hex }} />
                                                    {type.display_name.vi}
                                                </div>
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            <Select value={selectedRarity} onValueChange={handleRarityChange}>
                                <SelectTrigger className="bg-background border-border text-foreground w-full sm:w-[180px] h-11 shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <Filter className="h-4 w-4 text-muted-foreground" />
                                        <SelectValue placeholder={t('pokemon.filterByRarity')} />
                                    </div>
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="all">{t('pokemon.allRarities')}</SelectItem>
                                    {Object.values(RarityPokemon).map((rarity: string) => (
                                        <SelectItem key={rarity} value={rarity}>{rarity}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardHeader>
                </Card>

                {/* Pokemon Grid */}
                <Card className="bg-card border-border shadow-md">
                    <CardContent className="p-6">
                        {isPokemonLoading ? (
                            <PokemonSkeleton />
                        ) : pokemonError ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="p-3 bg-destructive/10 rounded-full mb-4">
                                    <Circle className="w-8 h-8 text-destructive" />
                                </div>
                                <p className="text-destructive font-medium">Đã có lỗi xảy ra khi tải dữ liệu Pokémon.</p>
                            </div>
                        ) : !pokemonData?.results || pokemonData.results.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="p-3 bg-muted rounded-full mb-4">
                                    <Circle className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium">Không tìm thấy Pokémon nào.</p>
                            </div>
                        ) : (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {pokemonData?.results.map((pokemon: any) => (
                                    <Card
                                        key={pokemon.id}
                                        className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] flex flex-col"
                                    >
                                        {/* Decorative gradient overlay */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        <CardHeader className="relative">
                                            <div className="flex items-start justify-between gap-4">
                                                <div className="flex items-center gap-4 flex-1">
                                                    <div className="relative">
                                                        <img
                                                            src={pokemon.imageUrl}
                                                            alt={pokemon.nameTranslations.en}
                                                            className="w-24 h-24 rounded-xl bg-muted/50 object-contain border-2 border-border shadow-lg group-hover:scale-110 transition-transform duration-300"
                                                        />
                                                        <div className="absolute -bottom-1 -right-1 p-1.5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-lg border border-primary/30 shadow-sm">
                                                            <Circle className="w-4 h-4 text-primary" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <CardTitle className="text-lg font-bold text-foreground mb-1 line-clamp-1">{pokemon.nameJp}</CardTitle>
                                                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">{pokemon.nameTranslations.en}</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {pokemon.types.map((type: any) => (
                                                                <Badge
                                                                    key={type.id}
                                                                    className="shadow-sm font-medium text-xs"
                                                                    style={{ backgroundColor: type.color_hex, color: 'white', border: 'none' }}
                                                                >
                                                                    {type.display_name.vi}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all h-8 w-8 relative z-10"
                                                        >
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-card border-border shadow-lg">
                                                        <DropdownMenuItem className="text-foreground hover:bg-primary/10 cursor-pointer transition-colors">
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            {t('common.edit')}
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive hover:bg-destructive/10 cursor-pointer transition-colors">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            {t('common.delete')}
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="flex-1 flex flex-col justify-end relative">
                                            <div className="space-y-3 text-sm pt-4 border-t border-border/50 bg-muted/20 rounded-lg p-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground font-medium">Độ hiếm:</span>
                                                    <Badge variant={getRarityBadgeVariant(pokemon.rarity)} className="shadow-sm font-medium">{pokemon.rarity}</Badge>
                                                </div>
                                                <div className="flex justify-between items-center">
                                                    <span className="text-muted-foreground font-medium">Cấp độ yêu cầu:</span>
                                                    <span className="text-foreground font-bold">{pokemon.conditionLevel}</span>
                                                </div>
                                                <div className="pt-2 border-t border-border/50">
                                                    <p className="text-xs text-foreground/80 line-clamp-2 leading-relaxed">{pokemon.description.replace(/\\n/g, ' ')}</p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </CardContent>

                    {/* Pagination */}
                    {pokemonData?.pagination && pokemonData.pagination.totalPage > 0 && (
                        <CardFooter className="border-t border-border bg-muted/30">
                            <PaginationControls
                                currentPage={currentPage}
                                totalPages={pokemonData.pagination.totalPage || 1}
                                totalItems={pokemonData.pagination.totalItem || 0}
                                itemsPerPage={itemsPerPage}
                                onPageChange={setCurrentPage}
                                onItemsPerPageChange={setItemsPerPage}
                                isLoading={isPokemonLoading}
                            />
                        </CardFooter>
                    )}
                </Card>
            </div>
        </>
    );
}