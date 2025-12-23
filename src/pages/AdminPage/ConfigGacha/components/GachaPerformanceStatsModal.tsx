import { useTranslation } from "react-i18next";
import { Activity, ShoppingCart } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@ui/Dialog";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { IDashboardGachaStatsDetailEntity } from "@models/dashboard/dashboard.entity";

interface GachaPerformanceStatsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    statsDetail: IDashboardGachaStatsDetailEntity;
}

export default function GachaPerformanceStatsModal({
    open,
    onOpenChange,
    statsDetail,
}: GachaPerformanceStatsModalProps) {
    const { t } = useTranslation();

    const colors = [
        "#f97316", // ONE
        "#3b82f6", // TWO
        "#22c55e", // THREE
        "#a855f7", // FOUR
        "#eab308", // FIVE
    ];

    const getStarAmountLabel = (star: string) => {
        switch (star) {
            case "ONE":
                return t("configGacha.amount1Star");
            case "TWO":
                return t("configGacha.amount2Star");
            case "THREE":
                return t("configGacha.amount3Star");
            case "FOUR":
                return t("configGacha.amount4Star");
            case "FIVE":
                return t("configGacha.amount5Star");
            default:
                return star;
        }
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white max-w-3xl">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Activity className="h-5 w-5 text-muted-foreground" />
                        {t("configGacha.performanceStats")}
                    </DialogTitle>
                </DialogHeader>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                    <div className="space-y-4">
                        <div className="space-y-2 bg-muted/20 p-4 rounded-lg border border-border">
                            <div className="flex items-center gap-2">
                                <Activity className="h-4 w-4 text-muted-foreground" />
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {t("configGacha.totalRolls")}
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {statsDetail.totalRolls.toLocaleString()}
                            </p>
                        </div>
                        <div className="space-y-2 bg-muted/20 p-4 rounded-lg border border-border">
                            <div className="flex items-center gap-2">
                                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                                    {t("configGacha.totalPurchases")}
                                </p>
                            </div>
                            <p className="text-2xl font-bold text-foreground">
                                {statsDetail.totalPurchases.toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={statsDetail.starDistribution.map((stat) => ({
                                        ...stat,
                                        name: getStarAmountLabel(stat.star),
                                    }))}
                                    dataKey="count"
                                    nameKey="name"
                                    cx="50%"
                                    cy="50%"
                                    outerRadius={90}
                                    labelLine={false}
                                    label={({ name, percent }: any) =>
                                        `${name}: ${(percent * 100).toFixed(1)}%`
                                    }
                                >
                                    {statsDetail.starDistribution.map((stat, index) => (
                                        <Cell
                                            key={stat.star}
                                            fill={colors[index % colors.length]}
                                        />
                                    ))}
                                </Pie>
                                <Tooltip
                                    formatter={(value: any, _name: any, props: any) => {
                                        const payload: any = props?.payload || {};
                                        return [
                                            `${value} (${payload.percentage}%)`,
                                            t("dashboard.sparkles.userCount"),
                                        ];
                                    }}
                                />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}


