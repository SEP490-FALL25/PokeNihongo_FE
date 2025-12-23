import { useTranslation } from "react-i18next";
import { Badge } from "@ui/Badge";
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card";
import { Button } from "@ui/Button";
import { Separator } from "@ui/Separator";
import { ArrowLeft, Settings, Calendar, TrendingUp, Zap, Coins, Star, Sparkles, X, Undo, Redo, Save, Activity, Percent } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { IGachaBannerEntity } from "@models/gacha/entity";
import { IDashboardGachaStatsDetailEntity } from "@models/dashboard/dashboard.entity";
import { RarityBadge } from "@atoms/BadgeRarity";
import { useEffect, useState } from "react";
import EditGachaDialog from "../EditGachaDialog";
import AddGachaPokemonSidebar from "../AddGachaPokemonSidebar";
import { useDeleteGachaItem, useUpdateGachaItemList } from "@hooks/useGacha";
import getHeaderColor from "@atoms/HeaderColorRarity";
import getCardColor from "@atoms/CardColorRarity";
import { RarityToStarTypeMap } from "@constants/gacha";
import GachaPerformanceStatsModal from "../GachaPerformanceStatsModal";

export default function GachaDetailView({ bannerDetail, statsDetail }: { bannerDetail: IGachaBannerEntity; statsDetail?: IDashboardGachaStatsDetailEntity }) {

    /**
     * Define Variables
     */
    const { t } = useTranslation();
    const navigate = useNavigate();
    const [isEditOpen, setIsEditOpen] = useState<boolean>(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
    const [hoveredItemId, setHoveredItemId] = useState<number | null>(null);
    const { mutate: deleteGachaItem } = useDeleteGachaItem();
    const [itemsByRarity, setItemsByRarity] = useState<Record<string, any[]>>({
        COMMON: [], UNCOMMON: [], RARE: [], EPIC: [], LEGENDARY: []
    })
    const [dragOverRarity, setDragOverRarity] = useState<string | null>(null)
    const [history, setHistory] = useState<Record<string, any[]>[]>([])
    const [historyIndex, setHistoryIndex] = useState<number>(-1)
    const [isStatsModalOpen, setIsStatsModalOpen] = useState<boolean>(false)


    /**
     * Initialize grouping
     */
    useEffect(() => {
        const grouped: Record<string, any[]> = { COMMON: [], UNCOMMON: [], RARE: [], EPIC: [], LEGENDARY: [] }
            ; (bannerDetail?.items || []).forEach((it: any) => {
                const key = (it?.pokemon?.rarity || 'COMMON') as string
                if (!grouped[key]) grouped[key] = []
                grouped[key].push(it)
            })
        setItemsByRarity(grouped)
        setHistory([grouped])
        setHistoryIndex(0)
    }, [bannerDetail])

    const pushHistory = (nextState: Record<string, any[]>) => {
        const base = history.slice(0, historyIndex + 1)
        const newHistory = [...base, nextState]
        setHistory(newHistory)
        setHistoryIndex(newHistory.length - 1)
    }

    const handleUndo = () => {
        if (historyIndex <= 0) return
        const idx = historyIndex - 1
        setHistoryIndex(idx)
        setItemsByRarity(history[idx])
    }

    const handleRedo = () => {
        if (historyIndex >= history.length - 1) return
        const idx = historyIndex + 1
        setHistoryIndex(idx)
        setItemsByRarity(history[idx])
    }


    const { mutateAsync: updateGachaItemList } = useUpdateGachaItemList();
    const handleSave = async () => {
        if (historyIndex !== history.length - 1) return
        const draft = history[historyIndex]
        const starTypeToPokemonIds: Record<string, number[]> = {}
        Object.values(draft).forEach((arr: any) => {
            (arr || []).forEach((it: any) => {
                const star = it?.gachaItemRate?.starType || 'THREE'
                if (!starTypeToPokemonIds[star]) starTypeToPokemonIds[star] = []
                if (typeof it.pokemonId === 'number') {
                    starTypeToPokemonIds[star].push(it.pokemonId)
                }
            })
        })
        const items = Object.entries(starTypeToPokemonIds).map(([starType, pokemons]) => ({ starType, pokemons })) as any
        await updateGachaItemList({ bannerId: bannerDetail.id, items })
    }
    //------------------------End------------------------//

    const makeDropHandlers = (rarity: string) => ({
        onDragOver: (e: React.DragEvent) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; setDragOverRarity(rarity) },
        onDragEnter: (e: React.DragEvent) => { e.preventDefault(); setDragOverRarity(rarity) },
        onDragLeave: () => { setDragOverRarity((curr) => (curr === rarity ? null : curr)) },
        onDrop: (e: React.DragEvent) => {
            e.preventDefault()
            setDragOverRarity(null)
            const listData = e.dataTransfer.getData('application/pokemon-list')
            const singleData = e.dataTransfer.getData('application/pokemon')
            if (!listData && !singleData) return
            try {
                const payload: any[] = listData ? JSON.parse(listData) : [JSON.parse(singleData)]
                const next = { ...itemsByRarity }
                payload.forEach((p) => {
                    const exists = Object.values(next).flat().some((it: any) => it?.pokemonId === p.id)
                    if (!exists) {
                        // Use the target column's rarity, not the Pokemon's original rarity
                        const targetRarity = rarity
                        const starType = RarityToStarTypeMap[targetRarity] || 'THREE'
                        const newItem = {
                            id: Math.floor(Math.random() * 1e9),
                            bannerId: bannerDetail.id,
                            pokemonId: p.id,
                            gachaItemRateId: 0,
                            pokemon: {
                                imageUrl: p.imageUrl,
                                nameTranslations: { en: p.nameTranslations.en },
                                pokedex_number: p.pokedex_number,
                                rarity: targetRarity,
                            },
                            gachaItemRate: { id: 0, starType: starType as any, rate: 1 },
                        }
                        next[targetRarity] = [...(next[targetRarity] || []), newItem]
                    }
                })
                setItemsByRarity(next)
                pushHistory(next)
                setIsSidebarOpen(false)
            } catch { }
        }
    })
    //------------------------End------------------------//


    /**
     * Handle Back to List
     */
    const handleBackToList = () => {
        navigate(-1);
    };
    //------------------------End------------------------//




    const getStatusBadge = (status: string) => {
        const statusMap: Record<string, { label: string; variant: string }> = {
            PREVIEW: { label: t('configGacha.preview'), variant: "secondary" },
            ACTIVE: { label: t('common.active'), variant: "default" },
            INACTIVE: { label: t('common.inactive'), variant: "outline" },
            EXPIRED: { label: t('configGacha.expired'), variant: "destructive" },
        };

        const statusInfo = statusMap[status] || { label: status, variant: "outline" };
        return (
            <Badge variant={statusInfo.variant as any} className="text-xs">
                {statusInfo.label}
            </Badge>
        );
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("vi-VN");
    };

    return (
        <div className="p-8 mt-24">
            <Card className="bg-card border-border">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Button variant="ghost" size="icon" onClick={handleBackToList}>
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <CardTitle className="text-foreground">{bannerDetail?.nameTranslation}</CardTitle>
                                <div className="flex items-center gap-2 mt-2">
                                    {getStatusBadge(bannerDetail?.status || '') as any}
                                </div>
                            </div>
                        </div>

                        {/* Button Actions */}
                        <div className="flex items-center gap-2">
                            {/* Edit Banner Button */}
                            <Button
                                variant="outline"
                                className="bg-blue-500 text-white hover:bg-blue-600 border-blue-500"
                                onClick={() => setIsEditOpen(true)}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                {t('common.edit')}
                            </Button>
                        </div>
                    </div>
                </CardHeader>

                <CardContent>
                    <div className="space-y-6">
                        {/* Basic Info section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-base font-semibold text-foreground">{t('configGacha.basicInfo')}</h3>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2 bg-muted/20 p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('configGacha.startDate')}</p>
                                    </div>
                                    <p className="text-base font-semibold text-foreground">{formatDate(bannerDetail?.startDate || '')}</p>
                                </div>
                                <div className="space-y-2 bg-muted/20 p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('configGacha.endDate')}</p>
                                    </div>
                                    <p className="text-base font-semibold text-foreground">{formatDate(bannerDetail?.endDate || '')}</p>
                                </div>
                                <div className="space-y-2 bg-muted/20 p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-2">
                                        <Coins className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('configGacha.costRoll')}</p>
                                    </div>
                                    <p className="text-base font-semibold text-foreground">{bannerDetail?.costRoll}</p>
                                </div>
                                <div className="space-y-2 bg-muted/20 p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-2">
                                        <Star className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('configGacha.hardPity')}</p>
                                    </div>
                                    <p className="text-base font-semibold text-foreground">{bannerDetail?.hardPity5Star}</p>
                                </div>
                            </div>
                        </div>

                        {/* Separator */}
                        <Separator />

                        {/* Performance Stats section (open in modal) */}
                        {statsDetail && (
                            <div className="rounded-lg border border-blue-200 bg-blue-50/60 px-4 py-3 mb-4 flex items-center justify-between">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-2">
                                        <div className="p-1.5 rounded-md bg-blue-100">
                                            <Activity className="h-4 w-4 text-blue-600" />
                                        </div>
                                        <h3 className="text-sm font-semibold text-foreground tracking-wide uppercase">
                                            {t('configGacha.performanceStats')}
                                        </h3>
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {t('configGacha.totalRolls')}:{" "}
                                        <span className="font-semibold text-foreground">
                                            {statsDetail.totalRolls.toLocaleString()}
                                        </span>
                                    </p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2 border-blue-400 text-blue-600 hover:bg-blue-50 bg-background/80"
                                    onClick={() => setIsStatsModalOpen(true)}
                                >
                                    <Percent className="h-4 w-4 text-blue-600" />
                                    <span className="text-xs font-semibold">
                                        {t('common.view')} {t('configGacha.starDistribution')}
                                    </span>
                                </Button>
                            </div>
                        )}

                        {/* Gacha Stats section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <TrendingUp className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-base font-semibold text-foreground">{t('configGacha.gachaStats')}</h3>
                            </div>
                            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                <div className="p-4 rounded-lg border border-green-200 bg-green-50/60">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-green-800 uppercase tracking-wide">{t('configGacha.amount1Star')}</p>
                                        <Star className="h-4 w-4 text-green-700" />
                                    </div>
                                    <p className="mt-2 text-base font-bold text-green-900">
                                        {bannerDetail?.amount1StarCurrent}/{bannerDetail?.amount1Star}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg border border-emerald-200 bg-emerald-50/60">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-emerald-800 uppercase tracking-wide">{t('configGacha.amount2Star')}</p>
                                        <Star className="h-4 w-4 text-emerald-700" />
                                    </div>
                                    <p className="mt-2 text-base font-bold text-emerald-900">
                                        {bannerDetail?.amount2StarCurrent}/{bannerDetail?.amount2Star}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg border border-blue-200 bg-blue-50/60">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-blue-800 uppercase tracking-wide">{t('configGacha.amount3Star')}</p>
                                        <Star className="h-4 w-4 text-blue-700" />
                                    </div>
                                    <p className="mt-2 text-base font-bold text-blue-900">
                                        {bannerDetail?.amount3StarCurrent}/{bannerDetail?.amount3Star}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg border border-purple-200 bg-purple-50/60">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-purple-800 uppercase tracking-wide">{t('configGacha.amount4Star')}</p>
                                        <Star className="h-4 w-4 text-purple-700" />
                                    </div>
                                    <p className="mt-2 text-base font-bold text-purple-900">
                                        {bannerDetail?.amount4StarCurrent}/{bannerDetail?.amount4Star}
                                    </p>
                                </div>
                                <div className="p-4 rounded-lg border border-amber-200 bg-amber-50/60">
                                    <div className="flex items-center justify-between">
                                        <p className="text-xs font-semibold text-amber-800 uppercase tracking-wide">{t('configGacha.amount5Star')}</p>
                                        <Star className="h-4 w-4 text-amber-700" />
                                    </div>
                                    <p className="mt-2 text-base font-bold text-amber-900">
                                        {bannerDetail?.amount5StarCurrent}/{bannerDetail?.amount5Star}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Separator */}
                        <Separator />

                        {/* Auto Pre-create Settings section */}
                        <div>
                            <div className="flex items-center gap-2 mb-4">
                                <Zap className="h-5 w-5 text-muted-foreground" />
                                <h3 className="text-base font-semibold text-foreground">{t('configGacha.autoPrecreateSettings')}</h3>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-2 bg-muted/20 p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('configGacha.enablePrecreate')}</p>
                                    </div>
                                    <Badge variant={bannerDetail?.enablePrecreate ? "default" : "outline"} className="mt-1">
                                        {bannerDetail?.enablePrecreate ? t('common.active') : t('common.inactive')}
                                    </Badge>
                                </div>
                                <div className="space-y-2 bg-muted/20 p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('configGacha.precreateBeforeEndDays')}</p>
                                    </div>
                                    <p className="text-base font-semibold text-foreground">{bannerDetail?.precreateBeforeEndDays} {t('configGacha.days')}</p>
                                </div>
                                <div className="space-y-2 bg-muted/20 p-4 rounded-lg border border-border">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{t('configGacha.isRandomItemAgain')}</p>
                                    </div>
                                    <Badge variant={bannerDetail?.isRandomItemAgain ? "default" : "outline"} className="mt-1">
                                        {bannerDetail?.isRandomItemAgain ? t('common.active') : t('common.inactive')}
                                    </Badge>
                                </div>
                            </div>
                        </div>

                        {/* Separator */}
                        <Separator />

                        {/* Gacha Items by Rarity with DnD */}
                        <div>
                            <div className="flex items-center justify-between gap-2 mb-4">
                                <h3 className="text-lg font-semibold text-foreground mb-4">{t('configGacha.pokemonInGacha')}</h3>

                                <div className="flex items-center gap-2">
                                    {/* Undo/Redo */}
                                    <div className="flex items-center gap-4">
                                        <div className={`cursor-pointer ${historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleUndo}>
                                            <Undo className="h-4 w-4" />
                                        </div>
                                        <div className={`cursor-pointer ${historyIndex >= history.length - 1 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleRedo}>
                                            <Redo className="h-4 w-4" />
                                        </div>
                                    </div>
                                    <div className={`ml-3 cursor-pointer ${historyIndex <= 0 ? 'opacity-50 cursor-not-allowed' : ''}`} onClick={handleSave}>
                                        <Save className="h-5 w-5" />
                                    </div>

                                    {/* Open Sidebar to add Pokemon */}
                                    <Button
                                        className="bg-primary text-primary-foreground hover:bg-primary/90 ml-3"
                                        onClick={() => setIsSidebarOpen(true)}
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        {t('configGacha.addPokemonToGacha')}
                                    </Button>
                                </div>
                            </div>

                            <div className="grid gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-5">
                                {(['COMMON', 'UNCOMMON', 'RARE', 'EPIC', 'LEGENDARY'] as const).map((rar) => (
                                    <div key={rar} className={`rounded-lg border border-dashed min-h-[260px] transition-colors ${dragOverRarity === rar ? 'ring-2 ring-primary/50 bg-primary/5' : ''}`}
                                        {...makeDropHandlers(rar)}
                                    >
                                        <div className={`px-3 py-2 rounded-t-lg border-b text-xs font-semibold tracking-wide flex items-center justify-between ${getHeaderColor(rar)}`}>
                                            <span>{rar}</span>
                                            <span className="text-xs font-normal opacity-90">({(itemsByRarity[rar] || []).length})</span>
                                        </div>
                                        <div className="p-2 space-y-2">
                                            {(itemsByRarity[rar] || []).map((item: any) => (
                                                <Card
                                                    key={item.id}
                                                    className={`bg-white relative group transition-colors border shadow-sm ${getCardColor(rar)}`}
                                                    onMouseEnter={() => setHoveredItemId(item.id)}
                                                    onMouseLeave={() => setHoveredItemId(null)}
                                                >
                                                    {hoveredItemId === item.id && (
                                                        <div className="absolute top-2 right-2 flex gap-2 z-10">
                                                            <button
                                                                className="w-7 h-7 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 transition-colors cursor-pointer shadow"
                                                                onClick={() => {
                                                                    // remove locally and push history
                                                                    const next = { ...itemsByRarity }
                                                                    next[rar] = (next[rar] || []).filter((it: any) => it.id !== item.id)
                                                                    setItemsByRarity(next)
                                                                    pushHistory(next)
                                                                    // try delete on server (if exists)
                                                                    try {
                                                                        if (item?.gachaItemRateId && item.gachaItemRateId > 0) {
                                                                            deleteGachaItem(item.id)
                                                                        }
                                                                    } catch { }
                                                                }}
                                                            >
                                                                <X className="w-4 h-4 text-white" />
                                                            </button>
                                                        </div>
                                                    )}
                                                    <CardHeader>
                                                        <div className="flex items-center gap-3">
                                                            <img
                                                                src={item.pokemon.imageUrl}
                                                                alt={item.pokemon.nameTranslations.en}
                                                                className="w-14 h-14 rounded-md shadow"
                                                            />
                                                            <div className="min-w-0">
                                                                <CardTitle className="text-sm truncate">{item.pokemon.nameTranslations.en}</CardTitle>
                                                                <p className="text-[11px] text-muted-foreground mt-0.5 truncate">#{item.pokemon.pokedex_number}</p>
                                                            </div>
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent>
                                                        <div className="space-y-1.5 text-[12px]">
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">{t('configGacha.starType')}:</span>
                                                                <span className="font-medium text-foreground">{item.gachaItemRate.starType} ★</span>
                                                            </div>
                                                            <div className="flex justify-between">
                                                                <span className="text-muted-foreground">{t('configGacha.rate')}:</span>
                                                                <span className="font-medium text-foreground">{item.gachaItemRate.rate}%</span>
                                                            </div>
                                                            <div className="pt-1">
                                                                <RarityBadge level={item.pokemon.rarity as any} />
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <EditGachaDialog isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} bannerData={bannerDetail} />
            <AddGachaPokemonSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} gachaBannerId={bannerDetail.id} />

            {statsDetail && (
                <GachaPerformanceStatsModal
                    open={isStatsModalOpen}
                    onOpenChange={setIsStatsModalOpen}
                    statsDetail={statsDetail}
                />
            )}
        </div>
    );
}

