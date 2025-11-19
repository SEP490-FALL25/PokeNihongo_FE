""

import { useMemo, useState } from "react"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@ui/Card"
import { Badge } from "@ui/Badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Package, DollarSign, Users, TrendingUp, Check, Sparkles, Loader2 } from "lucide-react"
import HeaderAdmin from "@organisms/Header/Admin"
import { useTranslation } from "react-i18next"
import { useGetDashboardRevenue, useGetDashboardSubscriptionPlan } from "@hooks/useDashboard"

const monthOptions = Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: `Tháng ${index + 1}`,
}));

const buildYearOptions = (currentYear: number, range = 5) =>
    Array.from({ length: range }, (_, index) => {
        const year = currentYear - Math.floor(range / 2) + index;
        return { value: year, label: `${year}` };
    });

const formatCurrency = (value: number) => value.toLocaleString("vi-VN");

export default function PackageManagement() {
    const { t } = useTranslation();
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const yearOptions = useMemo(() => buildYearOptions(now.getFullYear(), 6), [now]);

    const { data: subscriptionStats, isLoading: isSubscriptionLoading } = useGetDashboardSubscriptionPlan();
    const { data: revenueStats, isLoading: isRevenueLoading } = useGetDashboardRevenue(selectedMonth, selectedYear);
    console.log(revenueStats);
    const defaultPackages = useMemo(() => [
        {
            id: 1,
            name: "Gói Cơ Bản",
            nameEn: "Basic Plan",
            price: 99000,
            duration: "1 tháng",
            subscribers: 234,
            status: "active",
            features: ["Truy cập 50 bài học", "5 Pokemon miễn phí", "Hỗ trợ email", "Tham gia giải đấu cơ bản"],
            color: "blue",
        },
        {
            id: 2,
            name: "Gói Tiêu Chuẩn",
            nameEn: "Standard Plan",
            price: 249000,
            duration: "3 tháng",
            subscribers: 456,
            status: "active",
            features: [
                "Truy cập 200 bài học",
                "15 Pokemon miễn phí",
                "Hỗ trợ ưu tiên",
                "Tham gia mọi giải đấu",
                "AI trợ giúp học tập",
            ],
            color: "purple",
        },
        {
            id: 3,
            name: "Gói Premium",
            nameEn: "Premium Plan",
            price: 499000,
            duration: "6 tháng",
            subscribers: 189,
            status: "active",
            features: [
                "Truy cập không giới hạn",
                "30 Pokemon miễn phí",
                "Hỗ trợ 24/7",
                "Giải đấu VIP",
                "AI cá nhân hóa",
                "Chứng chỉ hoàn thành",
            ],
            color: "yellow",
        },
        {
            id: 4,
            name: "Gói Doanh Nghiệp",
            nameEn: "Enterprise Plan",
            price: 2999000,
            duration: "1 năm",
            subscribers: 23,
            status: "active",
            features: [
                "Tất cả tính năng Premium",
                "Quản lý nhóm",
                "Báo cáo chi tiết",
                "API tích hợp",
                "Đào tạo riêng",
                "Tùy chỉnh nội dung",
            ],
            color: "red",
        },
    ], [])

    const mapTagToColor = (tagName?: string, type?: string) => {
        const normalizedTag = tagName?.toUpperCase()
        switch (normalizedTag) {
            case "NORMAL":
                return "blue"
            case "ULTRA":
                return "purple"
            case "PREMIUM":
                return "yellow"
            case "ENTERPRISE":
                return "red"
            default:
                return type === "RECURRING" ? "purple" : "blue"
        }
    }

    const getTranslationValue = (
        translations: Array<{ key: string; value: string }> | undefined,
        lang: "vi" | "en" | "ja"
    ) => translations?.find((translation) => translation.key === lang)?.value

    const remotePackages = useMemo(() => {
        if (!subscriptionStats) return null
        return subscriptionStats.plans.map((plan) => {
            const viName =
                getTranslationValue(plan.subscription.nameTranslations, "vi") ??
                plan.subscription.nameTranslation
            const enName =
                getTranslationValue(plan.subscription.nameTranslations, "en") ?? viName
            const durationLabel =
                plan.type === "LIFETIME"
                    ? "Trọn đời"
                    : plan.durationInDays
                        ? `${plan.durationInDays} ngày`
                        : "-"
            const features = plan.subscription.features.map((feature) => {
                const label = feature.feature.nameTranslation
                return feature.value ? `${label} (${feature.value})` : label
            })
            return {
                id: plan.planId,
                name: viName,
                nameEn: enName,
                price: plan.price,
                duration: durationLabel,
                subscribers: plan.stats.totalPurchases,
                status: plan.stats.activeUsers > 0 ? "active" : "inactive",
                features,
                color: mapTagToColor(plan.subscription.tagName, plan.type),
            }
        })
    }, [subscriptionStats])

    const subscriptionPlanMap = useMemo(() => {
        if (!subscriptionStats) return {}
        const map: Record<number, { name: string; color: string }> = {}
        subscriptionStats.plans.forEach((plan) => {
            const name =
                getTranslationValue(plan.subscription.nameTranslations, "vi") ??
                plan.subscription.nameTranslation ??
                plan.subscription.nameKey
            map[plan.planId] = {
                name,
                color: mapTagToColor(plan.subscription.tagName, plan.type),
            }
        })
        return map
    }, [subscriptionStats])

    const packages = remotePackages ?? defaultPackages


    const packageGridColumns = useMemo(() => {
        const count = packages.length
        if (count >= 4) {
            return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-4"
        }
        if (count === 3) {
            return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        }
        if (count === 2) {
            return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-2"
        }
        return "grid-cols-1 sm:grid-cols-1 lg:grid-cols-1"
    }, [packages.length])

    const stats = useMemo(() => [
        {
            label: "Tổng gói dịch vụ",
            value: remotePackages
                ? String(subscriptionStats?.totalActivePlans ?? packages.length)
                : defaultPackages.length.toString(),
            icon: Package,
            gradient: "from-blue-500/10 to-cyan-500/10",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500",
            borderColor: "border-blue-500/20"
        },
        {
            label: "Doanh thu tháng này",
            value: revenueStats
                ? `${revenueStats.totalRevenue.month.toLocaleString()} VND`
                : "—",
            icon: DollarSign,
            gradient: "from-green-500/10 to-emerald-500/10",
            iconBg: "bg-green-500/10",
            iconColor: "text-green-500",
            borderColor: "border-green-500/20"
        },
        {
            label: "Tổng người đăng ký (theo tháng)",
            value: revenueStats
                ? String(revenueStats.plans.reduce((sum, plan) => sum + plan.revenue.month.count, 0))
                : "—",
            icon: Users,
            gradient: "from-purple-500/10 to-pink-500/10",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-500",
            borderColor: "border-purple-500/20"
        },
        {
            label: "Doanh thu năm",
            value: revenueStats
                ? `${revenueStats.totalRevenue.year.toLocaleString()} VND`
                : "—",
            icon: TrendingUp,
            gradient: "from-yellow-500/10 to-amber-500/10",
            iconBg: "bg-yellow-500/10",
            iconColor: "text-yellow-500",
            borderColor: "border-yellow-500/20"
        },
    ], [subscriptionStats, packages.length, defaultPackages.length, revenueStats])

    const getColorClasses = (color: string) => {
        const colors: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
            blue: {
                bg: "bg-blue-500/10",
                text: "text-blue-600",
                border: "border-blue-500/40",
                gradient: "from-blue-500/20 to-cyan-500/20"
            },
            purple: {
                bg: "bg-purple-500/10",
                text: "text-purple-600",
                border: "border-purple-500/40",
                gradient: "from-purple-500/20 to-pink-500/20"
            },
            yellow: {
                bg: "bg-yellow-500/10",
                text: "text-yellow-600",
                border: "border-yellow-500/40",
                gradient: "from-yellow-500/20 to-amber-500/20"
            },
            red: {
                bg: "bg-red-500/10",
                text: "text-red-600",
                border: "border-red-500/40",
                gradient: "from-red-500/20 to-rose-500/20"
            },
        }
        return colors[color] || colors.blue
    }

    return (
        <>
            <HeaderAdmin title="Quản lý gói dịch vụ" description="Quản lý các gói đăng ký và dịch vụ" />
            <div className="mt-24 p-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    {stats.map((stat) => (
                        <Card
                            key={stat.label}
                            className={`relative overflow-hidden bg-gradient-to-br ${stat.gradient} border ${stat.borderColor} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                            <CardHeader className="pb-3 relative">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-sm font-semibold text-foreground/90">{stat.label}</CardTitle>
                                    <div className={`p-2 rounded-lg ${stat.iconBg} ${stat.iconColor}`}>
                                        <stat.icon className="w-5 h-5" />
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="relative">
                                <div className="text-4xl font-bold text-foreground mb-1">
                                    {stat.value}
                                </div>
                                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                            </CardContent>
                        </Card>
                    ))}
                </div>

                {/* Revenue Overview */}
                <Card className="bg-gradient-to-br from-emerald-500/10 via-card to-card/95 border-emerald-500/20 shadow-lg">
                    <CardHeader className="pb-4">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <div>
                                <CardTitle className="text-xl font-bold text-foreground">Doanh thu gói dịch vụ</CardTitle>
                                <p className="text-sm text-muted-foreground">Theo tháng và tổng năm hiện tại</p>
                            </div>
                            <div className="flex flex-wrap gap-3">
                                <Select
                                    value={selectedMonth.toString()}
                                    onValueChange={(value) => setSelectedMonth(Number(value))}
                                >
                                    <SelectTrigger className="w-[140px] bg-background border-border text-foreground h-10">
                                        <SelectValue placeholder="Tháng" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        {monthOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Select
                                    value={selectedYear.toString()}
                                    onValueChange={(value) => setSelectedYear(Number(value))}
                                >
                                    <SelectTrigger className="w-[140px] bg-background border-border text-foreground h-10">
                                        <SelectValue placeholder="Năm" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        {yearOptions.map((option) => (
                                            <SelectItem key={option.value} value={option.value.toString()}>
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isRevenueLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">{t('common.loading')}</p>
                            </div>
                        ) : revenueStats ? (
                            <>
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="p-4 bg-white/70 rounded-xl border border-emerald-200 shadow-sm">
                                        <p className="text-sm text-muted-foreground font-medium">Doanh thu tháng</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">
                                            {formatCurrency(revenueStats.totalRevenue.month)} VND
                                        </p>
                                    </div>
                                    <div className="p-4 bg-white/70 rounded-xl border border-emerald-200 shadow-sm">
                                        <p className="text-sm text-muted-foreground font-medium">Doanh thu năm</p>
                                        <p className="text-2xl font-bold text-foreground mt-1">
                                            {formatCurrency(revenueStats.totalRevenue.year)} VND
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-6 space-y-4">
                                    {revenueStats.plans.map((plan) => {
                                        const planInfo = subscriptionPlanMap[plan.planId]
                                        const colorClasses = getColorClasses(planInfo?.color || "blue")
                                        return (
                                            <Card key={plan.planId} className="border border-border/60 bg-card/90">
                                                <CardContent className="p-4 space-y-4">
                                                    <div className="flex flex-wrap items-center justify-between gap-3">
                                                        <div>
                                                            <p className="text-base font-semibold text-foreground">
                                                                {planInfo?.name ?? `Plan #${plan.planId}`}
                                                            </p>
                                                            <p className="text-sm text-muted-foreground">
                                                                {plan.type === "LIFETIME"
                                                                    ? "Trọn đời"
                                                                    : plan.durationInDays
                                                                        ? `${plan.durationInDays} ngày`
                                                                        : "Không xác định"}
                                                            </p>
                                                        </div>
                                                        <Badge className={`px-3 py-1 ${colorClasses.bg} ${colorClasses.text}`}>
                                                            {plan.subscription.tagName}
                                                        </Badge>
                                                    </div>
                                                    <div className="grid gap-3 sm:grid-cols-2">
                                                        <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                                                Doanh thu tháng
                                                            </p>
                                                            <p className="text-lg font-semibold text-foreground">
                                                                {formatCurrency(plan.revenue.month.total)} VND
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {plan.revenue.month.count} lượt mua
                                                            </p>
                                                        </div>
                                                        <div className="p-3 rounded-lg border border-border/50 bg-muted/30">
                                                            <p className="text-xs text-muted-foreground uppercase tracking-wide">
                                                                Doanh thu năm
                                                            </p>
                                                            <p className="text-lg font-semibold text-foreground">
                                                                {formatCurrency(plan.revenue.year.total)} VND
                                                            </p>
                                                            <p className="text-xs text-muted-foreground">
                                                                {plan.revenue.year.count} lượt mua
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        )
                                    })}
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                                <Sparkles className="w-10 h-10 text-muted-foreground" />
                                <p className="text-muted-foreground font-medium">Chưa có dữ liệu doanh thu</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Packages Grid */}
                <div className="w-full pb-16">
                    <div className={`grid ${packageGridColumns} gap-6 justify-items-center max-w-6xl mx-auto`}>
                        {isSubscriptionLoading && !packages ? (
                            <div className="col-span-full flex flex-col items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">{t('common.loading')}</p>
                            </div>
                        ) : packages.length > 0 ? (
                            packages.map((pkg) => {
                                const colorClasses = getColorClasses(pkg.color)
                                return (
                                    <Card
                                        key={pkg.id}
                                        className={`w-full group relative overflow-hidden bg-gradient-to-br ${colorClasses.gradient} border-2 ${colorClasses.border} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col h-full`}
                                    >
                                        {/* Decorative gradient overlay */}
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                        {/* Popular Badge */}
                                        {pkg.id === 2 && !remotePackages && (
                                            <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
                                                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg font-bold">
                                                    <Sparkles className="w-3 h-3 mr-1" />
                                                    Phổ biến nhất
                                                </Badge>
                                            </div>
                                        )}

                                        <CardHeader className="text-center pb-4 relative">
                                            <div className="flex flex-col items-center gap-2 mb-4">
                                                <div className={`p-3 rounded-xl ${colorClasses.bg} ${colorClasses.text} border ${colorClasses.border} shadow-lg`}>
                                                    <Package className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <CardTitle className={`text-xl font-bold ${colorClasses.text} mb-1`}>{pkg.name}</CardTitle>
                                                    <p className="text-muted-foreground text-sm">{pkg.nameEn}</p>
                                                </div>
                                            </div>

                                            <div className="text-center mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                                                <div className="flex items-baseline justify-center gap-1 mb-1">
                                                    <span className="text-4xl font-bold text-foreground">{pkg.price.toLocaleString()}</span>
                                                    <span className="text-muted-foreground">VND</span>
                                                </div>
                                                <p className="text-muted-foreground text-sm font-medium">{pkg.duration}</p>
                                            </div>
                                        </CardHeader>

                                        <CardContent className="space-y-4 relative flex-1 flex flex-col">
                                            <div className="space-y-3 mb-6 p-4 bg-card/50 rounded-lg border border-border/50 flex-1">
                                                {pkg.features.map((feature, index) => (
                                                    <div key={index} className="flex items-start gap-2">
                                                        <div className={`p-1 rounded-full ${colorClasses.bg} ${colorClasses.text} mt-0.5 flex-shrink-0`}>
                                                            <Check className="w-3 h-3" />
                                                        </div>
                                                        <span className="text-foreground text-sm font-medium leading-relaxed">{feature}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </CardContent>

                                        <CardFooter className="w-full mt-auto px-0 pt-0">
                                            <div className="pt-4 border-t border-border/50 space-y-4 w-full">
                                                <div className="flex items-center justify-between text-sm p-3 bg-muted/30 rounded-lg">
                                                    <span className="text-muted-foreground font-medium flex items-center gap-2">
                                                        <Users className="w-4 h-4" />
                                                        Người đăng ký
                                                    </span>
                                                    <span className="text-foreground font-bold text-lg">{pkg.subscribers}</span>
                                                </div>
                                            </div>
                                        </CardFooter>
                                    </Card>
                                )
                            })
                        ) : (
                            <div className="col-span-full flex flex-col items-center justify-center py-16 text-center gap-3">
                                <Package className="w-10 h-10 text-muted-foreground" />
                                <p className="text-muted-foreground font-medium">Chưa có gói dịch vụ nào phù hợp</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    )
}
