import { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/Card";
import { Button } from "@ui/Button";
import { Badge } from "@ui/Badge";
import { Skeleton } from "@ui/Skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import HeaderAdmin from "@organisms/Header/Admin";
import PaginationControls from "@ui/PaginationControls";
import { Plus, Calendar, X, Coins, Star, Sparkles, Gift, Loader2, Clock, CheckCircle2 } from "lucide-react";
import { useGachaBannerList } from "@hooks/useGacha";
import { useTranslation } from "react-i18next";
import CustomDatePicker from "@ui/DatePicker";
import { GACHA } from "@constants/gacha";
import { ROUTES } from "@constants/route";
import { useNavigate } from "react-router-dom";
import CreateGachaBannerDialog from "./components/CreateGachaBannerDialog";

export default function ConfigGacha() {
    /**
     * Define Variables
     */
    const { t } = useTranslation();
    const navigate = useNavigate();
    //------------------------End------------------------//


    const [isCreateDialogOpen, setIsCreateDialogOpen] = useState<boolean>(false);

    /***
     * Handle Gacha Banner List
     */
    const [currentPage, setCurrentPage] = useState<number>(1);
    const [itemsPerPage, setItemsPerPage] = useState<number>(15);

    // Format dates for API (YYYY-MM-DD format)
    const formatDateForAPI = (date: Date | null) => {
        if (!date) return undefined;
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };
    const [filterStatus, setFilterStatus] = useState<string>("all")
    const [filterStartDate, setFilterStartDate] = useState<Date | null>(null);
    const [filterEndDate, setFilterEndDate] = useState<Date | null>(null);
    const { data: bannersData, isLoading: isBannersLoading } = useGachaBannerList({
        page: currentPage,
        limit: itemsPerPage,
        startDate: formatDateForAPI(filterStartDate),
        endDate: formatDateForAPI(filterEndDate),
        status: filterStatus !== "all" ? [filterStatus] : undefined,
    });
    //------------------------End------------------------//


    /**
     * Handle Filters
     */
    const handleClearFilters = () => {
        setFilterStartDate(null);
        setFilterEndDate(null);
        setFilterStatus("all");
        setCurrentPage(1);
    };

    const hasActiveFilters = filterStartDate || filterEndDate || filterStatus !== "all";
    //------------------------End------------------------//


    const handleViewBanner = (id: number) => {
        navigate(`${ROUTES.ADMIN.CONFIG_GACHA}/${id}`);
    };

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
        <>
            <HeaderAdmin title={t('configGacha.title')} description={t('configGacha.description')} />

            <div className="p-8 mt-24 space-y-8">
                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Gift className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">{t('configGacha.bannerList')}</CardTitle>
                            </div>
                            <Button
                                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg"
                                onClick={() => setIsCreateDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {t('configGacha.createBanner')}
                            </Button>
                        </div>
                        {/* Filters */}
                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                    {t('configGacha.filterStartDate')}
                                </label>
                                <CustomDatePicker
                                    value={filterStartDate}
                                    onChange={setFilterStartDate}
                                    placeholder={t('configGacha.selectStartDate')}
                                    dayPickerProps={{
                                        disabled: false
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                    {t('configGacha.filterEndDate')}
                                </label>
                                <CustomDatePicker
                                    value={filterEndDate}
                                    onChange={setFilterEndDate}
                                    placeholder={t('configGacha.selectEndDate')}
                                    dayPickerProps={{
                                        disabled: false
                                    }}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-foreground mb-2 block">
                                    {t('configGacha.filterStatus')}
                                </label>
                                <Select value={filterStatus} onValueChange={setFilterStatus}>
                                    <SelectTrigger className="bg-background border-border text-foreground h-11 shadow-sm">
                                        <SelectValue placeholder={t('configGacha.selectStatus')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="all">{t('common.all')}</SelectItem>
                                        <SelectItem value={GACHA.GachaBannerStatus.PREVIEW}>{t('configGacha.preview')}</SelectItem>
                                        <SelectItem value={GACHA.GachaBannerStatus.ACTIVE}>{t('common.active')}</SelectItem>
                                        <SelectItem value={GACHA.GachaBannerStatus.INACTIVE}>{t('common.inactive')}</SelectItem>
                                        <SelectItem value={GACHA.GachaBannerStatus.EXPIRED}>{t('configGacha.expired')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        {hasActiveFilters && (
                            <div className="mt-4 flex items-center gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleClearFilters}
                                    className="border-border text-foreground hover:bg-muted/80 shadow-sm"
                                >
                                    <X className="h-4 w-4 mr-1" />
                                    {t('configGacha.clearFilters')}
                                </Button>
                            </div>
                        )}
                    </CardHeader>

                    <CardContent>
                        {isBannersLoading ? (
                            <BannersSkeleton />
                        ) : bannersData?.data?.results?.length ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {bannersData.data.results.map((banner: any) => (
                                    <Card
                                        key={banner.id}
                                        className="group relative overflow-hidden bg-gradient-to-br from-card via-card to-card/95 border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] cursor-pointer"
                                        onClick={() => handleViewBanner(banner.id)}
                                    >
                                        {/* Decorative gradient overlay */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 via-transparent to-transparent rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                                        
                                        <CardHeader className="relative">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-3">
                                                        <div className="p-2 bg-primary/10 rounded-lg">
                                                            <Gift className="w-4 h-4 text-primary" />
                                                        </div>
                                                        <CardTitle className="text-lg font-bold text-foreground line-clamp-2">
                                                            {banner.nameTranslation}
                                                        </CardTitle>
                                                    </div>
                                                    <div className="flex items-center gap-2 mb-3">
                                                        {getStatusBadge(banner.status)}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent className="relative">
                                            <div className="space-y-3 text-sm p-4 bg-muted/20 rounded-lg border border-border/50">
                                                <div className="flex items-center gap-2">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-muted-foreground font-medium">
                                                        {formatDate(banner.startDate)} - {formatDate(banner.endDate)}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Coins className="h-4 w-4 text-yellow-500" />
                                                    <span className="text-foreground font-bold">
                                                        {t('configGacha.costRoll')}: {banner.costRoll}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <Star className="h-4 w-4 text-yellow-500" />
                                                    <span className="text-foreground font-bold">
                                                        {t('configGacha.hardPity')}: {banner.hardPity5Star}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-muted-foreground mt-2 pt-2 border-t border-border/50">
                                                    ID: {banner.id}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="p-3 bg-muted rounded-full mb-4">
                                    <Gift className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium text-lg">
                                    {t('configGacha.noBannersFound')}
                                </p>
                            </div>
                        )}
                    </CardContent>

                    <CardFooter className="border-t border-border bg-muted/30">
                        <PaginationControls
                            currentPage={currentPage}
                            totalPages={bannersData?.data?.pagination?.totalPage || 1}
                            totalItems={bannersData?.data?.pagination?.totalItem || 0}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                            onItemsPerPageChange={setItemsPerPage}
                            isLoading={isBannersLoading}
                        />
                    </CardFooter>
                </Card>
            </div>

            <CreateGachaBannerDialog isOpen={isCreateDialogOpen} onClose={() => setIsCreateDialogOpen(false)} />
        </>
    );
}

function BannersSkeleton() {
    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
                <Card key={`skeleton-${index}`} className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader>
                        <div className="flex items-center gap-2 mb-3">
                            <Skeleton className="h-8 w-8 rounded-lg" />
                            <Skeleton className="h-6 w-3/4" />
                        </div>
                        <Skeleton className="h-6 w-24 rounded-full" />
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3 p-4 bg-muted/20 rounded-lg">
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-full" />
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-16 mt-2" />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}

