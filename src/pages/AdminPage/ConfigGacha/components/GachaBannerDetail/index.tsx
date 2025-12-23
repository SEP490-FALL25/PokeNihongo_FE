import { useGachaBannerById, useDashboardGachaStatsDetail } from "@hooks/useGacha";
import { Card, CardContent, CardHeader } from "@ui/Card";
import { Skeleton } from "@ui/Skeleton";
import { useParams } from "react-router-dom";
import HeaderAdmin from "@organisms/Header/Admin";
import { useTranslation } from "react-i18next";
import { IGachaBannerEntity } from "@models/gacha/entity";
import GachaDetailView from "../GachaDetailView";

export default function GachaBannerDetail() {
    const { t } = useTranslation();
    const { bannerId } = useParams<{ bannerId: string }>();
    const { data: bannerDetail, isLoading: isBannerLoading } = useGachaBannerById(Number(bannerId));
    const { data: statsDetail, isLoading: isStatsLoading } = useDashboardGachaStatsDetail(Number(bannerId));

    const isLoading = isBannerLoading || isStatsLoading;

    return (
        <>
            <HeaderAdmin title={t('configGacha.title')} description={t('configGacha.description')} />
            {isLoading ? (
                <div className="p-8 mt-24">
                    <Card className="bg-card border-border">
                        <CardHeader>
                            <Skeleton className="h-8 w-48" />
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <Skeleton key={i} className="h-20 w-full" />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            ) : (
                <GachaDetailView
                    bannerDetail={bannerDetail?.data || {} as IGachaBannerEntity}
                    statsDetail={statsDetail?.data}
                />
            )}
        </>
    );
}

