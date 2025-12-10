import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/Tabs"
import { Badge } from "@ui/Badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Package, DollarSign, Users, TrendingUp, Check, Loader2, BarChart3, PieChart as PieChartIcon, AlertCircle } from "lucide-react"
import HeaderAdmin from "@organisms/Header/Admin"
import { useTranslation } from "react-i18next"
import { useGetDashboardRevenue, useGetDashboardSubscriptionPlan } from "@hooks/useDashboard"
import {
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"

const monthOptions = (t: any) => Array.from({ length: 12 }, (_, index) => ({
    value: index + 1,
    label: `${t('packageManagement.month')} ${index + 1}`,
}));

const buildYearOptions = (currentYear: number, range = 5) =>
    Array.from({ length: range }, (_, index) => {
        const year = currentYear - Math.floor(range / 2) + index;
        return { value: year, label: `${year}` };
    });

const formatCurrency = (value: number) => value.toLocaleString("vi-VN");

const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"];

export default function PackageManagement() {
    const { t } = useTranslation();
    const now = new Date();
    const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1);
    const [selectedYear, setSelectedYear] = useState(now.getFullYear());
    const [activeTab, setActiveTab] = useState<string>("overview");
    const yearOptions = useMemo(() => buildYearOptions(now.getFullYear(), 6), [now]);
    const monthOptionsList = useMemo(() => monthOptions(t), [t]);

    const { data: subscriptionStats, isLoading: isSubscriptionLoading } = useGetDashboardSubscriptionPlan();
    const { data: revenueStats, isLoading: isRevenueLoading } = useGetDashboardRevenue(selectedMonth, selectedYear);

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
                    ? t('packageManagement.packages.lifetime')
                    : plan.durationInDays
                        ? t('packageManagement.packages.days', { count: plan.durationInDays })
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
                activeUsers: plan.stats.activeUsers,
                status: plan.stats.activeUsers > 0 ? "active" : "inactive",
                features,
                color: mapTagToColor(plan.subscription.tagName, plan.type),
            }
        })
    }, [subscriptionStats])

    const packages = remotePackages ?? []

    // Prepare chart data
    const revenueChartData = useMemo(() => {
        if (!revenueStats) return []
        return revenueStats.plans.map((plan) => {
            const planInfo = subscriptionPlanMap[plan.planId]
            return {
                name: planInfo?.name || `Plan ${plan.planId}`,
                month: plan.revenue.month.total,
                year: plan.revenue.year.total,
                monthCount: plan.revenue.month.count,
                yearCount: plan.revenue.year.count,
            }
        })
    }, [revenueStats, subscriptionPlanMap])

    const subscribersChartData = useMemo(() => {
        if (!subscriptionStats) return []
        return subscriptionStats.plans.map((plan, index) => {
            const planInfo = subscriptionPlanMap[plan.planId]
            return {
                name: planInfo?.name || `Plan ${plan.planId}`,
                value: plan.stats.totalPurchases,
                color: COLORS[index % COLORS.length],
            }
        })
    }, [subscriptionStats, subscriptionPlanMap])

    const stats = useMemo(() => [
        {
            label: t('packageManagement.stats.totalPackages'),
            value: subscriptionStats?.totalActivePlans ?? packages.length,
            icon: Package,
            gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
            borderColor: "border-blue-500/20",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500",
            isLoading: isSubscriptionLoading,
        },
        {
            label: t('packageManagement.stats.monthlyRevenue'),
            value: revenueStats ? `${formatCurrency(revenueStats.totalRevenue.month)} VND` : "—",
            icon: DollarSign,
            gradient: "from-green-500/20 via-green-500/10 to-transparent",
            borderColor: "border-green-500/20",
            iconBg: "bg-green-500/10",
            iconColor: "text-green-500",
            isLoading: isRevenueLoading,
        },
        {
            label: t('packageManagement.stats.totalSubscriptions'),
            value: revenueStats
                ? String(revenueStats.plans.reduce((sum, plan) => sum + plan.revenue.month.count, 0))
                : "—",
            icon: Users,
            gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
            borderColor: "border-purple-500/20",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-500",
            isLoading: isRevenueLoading,
        },
        {
            label: t('packageManagement.stats.yearlyRevenue'),
            value: revenueStats ? `${formatCurrency(revenueStats.totalRevenue.year)} VND` : "—",
            icon: TrendingUp,
            gradient: "from-yellow-500/20 via-yellow-500/10 to-transparent",
            borderColor: "border-yellow-500/20",
            iconBg: "bg-yellow-500/10",
            iconColor: "text-yellow-500",
            isLoading: isRevenueLoading,
        },
    ], [subscriptionStats, packages.length, revenueStats, isSubscriptionLoading, isRevenueLoading, t])

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
            <HeaderAdmin title={t('packageManagement.title')} description={t('packageManagement.description')} />
            <div className="mt-24 p-8 space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full max-w-2xl grid-cols-2 bg-muted/50 p-1.5 rounded-xl">
                        <TabsTrigger
                            value="overview"
                            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                        >
                            <BarChart3 className="w-4 h-4" />
                            {t('packageManagement.tabs.overview')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="packages"
                            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                        >
                            <Package className="w-4 h-4" />
                            {t('packageManagement.tabs.packages')}
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Stats Cards */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {stats.map((stat) => (
                                <Card
                                    key={stat.label}
                                    className={`relative overflow-hidden border-2 ${stat.borderColor} bg-gradient-to-br ${stat.gradient} hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                                    <CardHeader className="pb-3 relative">
                                        <div className="flex items-center justify-between">
                                            <CardTitle className="text-sm font-semibold text-foreground/90">{stat.label}</CardTitle>
                                            <div className={`p-2.5 ${stat.iconBg} rounded-xl ${stat.iconColor} shadow-lg group-hover:scale-110 transition-transform`}>
                                                <stat.icon className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="relative">
                                        {stat.isLoading ? (
                                            <div className="flex items-center justify-center h-20">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                                                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Revenue Section */}
                        <Card className="border-2 border-border/50 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-emerald-500/5 to-transparent border-b border-border/50">
                                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                                    <div>
                                        <CardTitle className="text-lg font-bold flex items-center gap-2">
                                            <DollarSign className="w-5 h-5 text-emerald-500" />
                                            {t('packageManagement.revenue.title')}
                                        </CardTitle>
                                        <p className="text-sm text-muted-foreground mt-1">{t('packageManagement.month')} {selectedMonth}/{selectedYear}</p>
                                    </div>
                                    <div className="flex flex-wrap gap-3">
                                        <Select
                                            value={selectedMonth.toString()}
                                            onValueChange={(value) => setSelectedMonth(Number(value))}
                                        >
                                            <SelectTrigger className="w-[140px] bg-background border-2 border-border h-10">
                                                <SelectValue placeholder={t('packageManagement.month')} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {monthOptionsList.map((option) => (
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
                                            <SelectTrigger className="w-[140px] bg-background border-2 border-border h-10">
                                                <SelectValue placeholder={t('packageManagement.year')} />
                                            </SelectTrigger>
                                            <SelectContent>
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
                            <CardContent className="pt-6">
                                {isRevenueLoading ? (
                                    <div className="flex flex-col items-center justify-center py-12">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                                        <p className="text-muted-foreground">{t('common.loading')}</p>
                                    </div>
                                ) : revenueStats ? (
                                    <div className="space-y-6">
                                        {/* Revenue Summary */}
                                        <div className="grid gap-4 md:grid-cols-2">
                                            <div className="p-6 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 border-2 border-emerald-500/20 text-center">
                                                <p className="text-sm font-semibold text-muted-foreground mb-2">{t('packageManagement.revenue.monthly')}</p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {formatCurrency(revenueStats.totalRevenue.month)} VND
                                                </p>
                                            </div>
                                            <div className="p-6 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/5 border-2 border-blue-500/20 text-center">
                                                <p className="text-sm font-semibold text-muted-foreground mb-2">{t('packageManagement.revenue.yearly')}</p>
                                                <p className="text-3xl font-bold text-foreground">
                                                    {formatCurrency(revenueStats.totalRevenue.year)} VND
                                                </p>
                                            </div>
                                        </div>

                                        {/* Revenue Chart */}
                                        {revenueChartData.length > 0 && (
                                            <div className="space-y-4">
                                                <h3 className="text-lg font-bold text-foreground">{t('packageManagement.revenue.byPackage')}</h3>
                                                <ResponsiveContainer width="100%" height={300}>
                                                    <BarChart data={revenueChartData}>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                                        <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                                        <Tooltip
                                                            contentStyle={{
                                                                backgroundColor: "hsl(var(--card))",
                                                                border: "1px solid hsl(var(--border))",
                                                                borderRadius: "8px",
                                                            }}
                                                            formatter={(value: number) => [`${formatCurrency(value)} VND`, ""]}
                                                        />
                                                        <Legend />
                                                        <Bar dataKey="month" fill="hsl(var(--chart-1))" name={t('packageManagement.revenue.monthly')} radius={[8, 8, 0, 0]} />
                                                        <Bar dataKey="year" fill="hsl(var(--chart-2))" name={t('packageManagement.revenue.yearly')} radius={[8, 8, 0, 0]} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-12 text-center gap-3">
                                        <AlertCircle className="w-10 h-10 text-muted-foreground" />
                                        <p className="text-muted-foreground font-medium">{t('packageManagement.revenue.noData')}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Subscribers Distribution */}
                        {subscribersChartData.length > 0 && (
                            <div className="grid gap-6 md:grid-cols-2">
                                <Card className="border-2 border-border/50 shadow-lg">
                                    <CardHeader className="bg-gradient-to-r from-purple-500/5 to-transparent border-b border-border/50">
                                        <CardTitle className="flex items-center gap-2">
                                            <PieChartIcon className="w-5 h-5 text-purple-500" />
                                            {t('packageManagement.subscribers.distribution')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={subscribersChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                >
                                                    {subscribersChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </CardContent>
                                </Card>

                                <Card className="border-2 border-border/50 shadow-lg">
                                    <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent border-b border-border/50">
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="w-5 h-5 text-blue-500" />
                                            {t('packageManagement.subscribers.details')}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {subscriptionStats ? (
                                            <div className="space-y-3">
                                                {subscriptionStats.plans.map((plan) => {
                                                    const planInfo = subscriptionPlanMap[plan.planId]
                                                    const colorClasses = getColorClasses(planInfo?.color || "blue")
                                                    return (
                                                        <div
                                                            key={plan.planId}
                                                            className="p-4 rounded-xl border-2 border-border/50 bg-gradient-to-r from-muted/50 to-muted/30 hover:shadow-md transition-all"
                                                        >
                                                            <div className="flex items-center justify-between mb-2">
                                                                <p className="font-semibold text-foreground">
                                                                    {planInfo?.name || `Plan ${plan.planId}`}
                                                                </p>
                                                                <Badge className={`${colorClasses.bg} ${colorClasses.text}`}>
                                                                    {plan.subscription.tagName}
                                                                </Badge>
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-3 mt-3">
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">{t('packageManagement.subscribers.totalPurchases')}</p>
                                                                    <p className="text-lg font-bold text-foreground">{plan.stats.totalPurchases.toLocaleString()}</p>
                                                                </div>
                                                                <div>
                                                                    <p className="text-xs text-muted-foreground">{t('packageManagement.subscribers.activeUsers')}</p>
                                                                    <p className="text-lg font-bold text-foreground">{plan.stats.activeUsers.toLocaleString()}</p>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <div className="flex items-center justify-center h-[300px]">
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </TabsContent>

                    {/* Packages Tab */}
                    <TabsContent value="packages" className="space-y-6">
                        {isSubscriptionLoading ? (
                            <div className="flex flex-col items-center justify-center py-16">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">{t('common.loading')}</p>
                            </div>
                        ) : packages.length > 0 ? (
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {packages.map((pkg) => {
                                    const colorClasses = getColorClasses(pkg.color)
                                    return (
                                        <Card
                                            key={pkg.id}
                                            className={`group relative overflow-hidden bg-gradient-to-br ${colorClasses.gradient} border-2 ${colorClasses.border} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                                        >
                                            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                            <CardHeader className="text-center pb-4 relative">
                                                <div className="flex flex-col items-center gap-3 mb-4">
                                                    <div className={`p-3 rounded-xl ${colorClasses.bg} ${colorClasses.text} border-2 ${colorClasses.border} shadow-lg group-hover:scale-110 transition-transform`}>
                                                        <Package className="w-8 h-8" />
                                                    </div>
                                                    <div>
                                                        <CardTitle className={`text-xl font-bold ${colorClasses.text} mb-1`}>{pkg.name}</CardTitle>
                                                        <p className="text-muted-foreground text-sm">{pkg.duration}</p>
                                                    </div>
                                                </div>

                                                <div className="text-center p-4 bg-muted/30 rounded-xl border border-border/50">
                                                    <div className="flex items-baseline justify-center gap-1 mb-1">
                                                        <span className="text-4xl font-bold text-foreground">{pkg.price.toLocaleString()}</span>
                                                        <span className="text-muted-foreground">VND</span>
                                                    </div>
                                                </div>
                                            </CardHeader>

                                            <CardContent className="space-y-4 relative">
                                                <div className="space-y-2 mb-4 p-4 bg-card/50 rounded-lg border border-border/50">
                                                    {pkg.features.slice(0, 4).map((feature) => (
                                                        <div key={feature} className="flex items-start gap-2">
                                                            <div className={`p-1 rounded-full ${colorClasses.bg} ${colorClasses.text} mt-0.5 flex-shrink-0`}>
                                                                <Check className="w-3 h-3" />
                                                            </div>
                                                            <span className="text-foreground text-sm leading-relaxed">{feature}</span>
                                                        </div>
                                                    ))}
                                                    {pkg.features.length > 4 && (
                                                        <p className="text-xs text-muted-foreground text-center mt-2">
                                                            {t('packageManagement.packages.moreFeatures', { count: pkg.features.length - 4 })}
                                                        </p>
                                                    )}
                                                </div>

                                                <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border border-border/50">
                                                    <span className="text-muted-foreground font-medium flex items-center gap-2 text-sm">
                                                        <Users className="w-4 h-4" />
                                                        {t('packageManagement.packages.subscribers')}
                                                    </span>
                                                    <span className="text-foreground font-bold text-lg">{pkg.subscribers.toLocaleString()}</span>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    )
                                })}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
                                <Package className="w-10 h-10 text-muted-foreground" />
                                <p className="text-muted-foreground font-medium">{t('packageManagement.packages.noPackages')}</p>
                            </div>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}
