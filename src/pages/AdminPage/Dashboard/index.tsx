import HeaderAdmin from "@organisms/Header/Admin"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/Tabs"
import { Users, Languages, TrendingUp, Sparkles, Clock, AlertCircle, UserCheck, UserX, Loader2, Trophy, BookOpen, BarChart3 } from "lucide-react"
import { useTranslation } from "react-i18next"
import {
    useGetDashboardJlptDistribution,
    useGetDashboardUserActivation,
    useGetDashboardUserGrowthActiveUser,
    useGetDashboardUserGrowthNewUser,
    useGetDashboardUserGrowthTotalUser,
    useGetDashboardEngagementSparklesAccumulation,
    useGetDashboardEngagementStarterPokemonDistribution,
    useGetDashboardEngagementStreakRelention,
    useGetDashboardEngagementPopularContent,
} from "@hooks/useDashboard"
import { useState } from "react"
import {
    PieChart,
    Pie,
    Cell,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"

const AdminDashboard = () => {
    const { t, i18n } = useTranslation()
    const [period, setPeriod] = useState<string>("month")
    const [activeTab, setActiveTab] = useState<string>("overview")

    // Helper function to get Pokemon name based on current language
    const getPokemonName = (pokemon: any) => {
        if (!pokemon) return ''
        const currentLang = i18n.language
        if (currentLang === 'ja') {
            return pokemon.nameJp || pokemon.nameTranslations?.ja || ''
        } else if (currentLang === 'vi') {
            return pokemon.nameTranslations?.en || ''
        } else {
            return pokemon.nameTranslations?.en || pokemon.nameJp || ''
        }
    }

    // Fetch data
    const { data: totalUserData, isLoading: isLoadingTotalUser } = useGetDashboardUserGrowthTotalUser()
    const { data: jlptDistributionData, isLoading: isLoadingJlpt } = useGetDashboardJlptDistribution()
    const { data: userActivationData, isLoading: isLoadingActivation } = useGetDashboardUserActivation()
    const { data: activeUserData, isLoading: isLoadingActiveUser } = useGetDashboardUserGrowthActiveUser(period)
    const { data: newUserData, isLoading: isLoadingNewUser } = useGetDashboardUserGrowthNewUser(period)
    const { data: sparklesData, isLoading: isLoadingSparkles } = useGetDashboardEngagementSparklesAccumulation()
    const { data: starterPokemonData, isLoading: isLoadingStarterPokemon } = useGetDashboardEngagementStarterPokemonDistribution()
    const { data: streakData, isLoading: isLoadingStreak } = useGetDashboardEngagementStreakRelention()
    const { data: popularContentData, isLoading: isLoadingPopularContent } = useGetDashboardEngagementPopularContent()

    // Prepare chart data
    const jlptChartData = jlptDistributionData
        ? [
            { name: "N5", value: jlptDistributionData.summary.N5.total, color: "hsl(var(--chart-1))" },
            { name: "N4", value: jlptDistributionData.summary.N4.total, color: "hsl(var(--chart-2))" },
            { name: "N3", value: jlptDistributionData.summary.N3.total, color: "hsl(var(--chart-3))" },
        ]
        : []

    const sparklesChartData = sparklesData
        ? [
            { name: "0-100", value: sparklesData.distribution["0-100"].count, percent: sparklesData.distribution["0-100"].percent },
            { name: "101-500", value: sparklesData.distribution["101-500"].count, percent: sparklesData.distribution["101-500"].percent },
            { name: "501-1000", value: sparklesData.distribution["501-1000"].count, percent: sparklesData.distribution["501-1000"].percent },
            { name: "1001-5000", value: sparklesData.distribution["1001-5000"].count, percent: sparklesData.distribution["1001-5000"].percent },
            { name: "5000+", value: sparklesData.distribution["5000+"].count, percent: sparklesData.distribution["5000+"].percent },
        ]
        : []

    const starterPokemonChartData = starterPokemonData?.starters || []
    const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

    // Helper function to format percent
    const formatPercent = (percent: number) => {
        return percent > 1 ? percent.toFixed(1) : (percent * 100).toFixed(1)
    }

    // Helper function to translate period
    const translatePeriod = (periodValue: string) => {
        return t(`dashboard.period.${periodValue}` as any) || periodValue
    }

    // Overview Stats
    const overviewStats = [
        {
            title: t('dashboard.stats.totalUsers'),
            value: totalUserData?.total?.toLocaleString() || "0",
            icon: Users,
            gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
            borderColor: "border-blue-500/20",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500",
            isLoading: isLoadingTotalUser,
        },
        {
            title: t('dashboard.stats.activeUsers'),
            value: activeUserData?.activeUsers?.toLocaleString() || "0",
            icon: UserCheck,
            gradient: "from-green-500/20 via-green-500/10 to-transparent",
            borderColor: "border-green-500/20",
            iconBg: "bg-green-500/10",
            iconColor: "text-green-500",
            isLoading: isLoadingActiveUser,
        },
        {
            title: t('dashboard.stats.newUsers'),
            value: newUserData?.count?.toLocaleString() || "0",
            icon: TrendingUp,
            gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
            borderColor: "border-purple-500/20",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-500",
            isLoading: isLoadingNewUser,
        },
        {
            title: t('dashboard.stats.notActivated'),
            value: userActivationData?.summary?.total?.toLocaleString() || "0",
            icon: UserX,
            gradient: "from-orange-500/20 via-orange-500/10 to-transparent",
            borderColor: "border-orange-500/20",
            iconBg: "bg-orange-500/10",
            iconColor: "text-orange-500",
            isLoading: isLoadingActivation,
        },
    ]

    return (
        <>
            <HeaderAdmin title={t('dashboard.title')} description={t('dashboard.description')} />

            <div className="p-8 mt-24 space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-muted/50 p-1.5 rounded-xl">
                        <TabsTrigger
                            value="overview"
                            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                        >
                            <BarChart3 className="w-4 h-4" />
                            {t('dashboard.tabs.overview')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="users"
                            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                        >
                            <Users className="w-4 h-4" />
                            {t('dashboard.tabs.users')}
                        </TabsTrigger>
                        <TabsTrigger
                            value="engagement"
                            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                        >
                            <Sparkles className="w-4 h-4" />
                            {t('dashboard.tabs.engagement')}
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Key Stats */}
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                            {overviewStats.map((stat) => (
                                <Card
                                    key={stat.title}
                                    className={`relative overflow-hidden border-2 ${stat.borderColor} bg-gradient-to-br ${stat.gradient} hover:shadow-xl transition-all duration-300 hover:scale-105 group`}
                                >
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500" />
                                    <CardContent className="p-6 relative">
                                        {stat.isLoading ? (
                                            <div className="flex items-center justify-center h-24">
                                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : (
                                            <>
                                                <div className="flex items-center justify-between mb-4">
                                                    <p className="text-sm font-semibold text-muted-foreground">{stat.title}</p>
                                                    <div className={`p-2.5 ${stat.iconBg} rounded-xl ${stat.iconColor} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                                        <stat.icon className="w-5 h-5" />
                                                    </div>
                                                </div>
                                                <p className="text-4xl font-bold text-foreground mb-1">{stat.value}</p>
                                                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                                            </>
                                        )}
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Charts Row */}
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* JLPT Distribution */}
                            <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardHeader className="bg-gradient-to-r from-blue-500/5 to-transparent border-b border-border/50">
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="p-2 bg-blue-500/10 rounded-lg">
                                            <Languages className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold">{t('dashboard.jlpt.title')}</p>
                                            {jlptDistributionData && (
                                                <p className="text-sm text-muted-foreground font-normal">
                                                    {jlptDistributionData.totalUsers.toLocaleString()} {t('dashboard.jlpt.users')}
                                                </p>
                                            )}
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {isLoadingJlpt ? (
                                        <div className="h-[250px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : jlptChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={jlptChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={true}
                                                    label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"

                                                >
                                                    {jlptChartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                            <AlertCircle className="h-8 w-8 opacity-50" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* User Activation Status */}
                            <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardHeader className="bg-gradient-to-r from-green-500/5 to-transparent border-b border-border/50">
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="p-2 bg-green-500/10 rounded-lg">
                                            <UserCheck className="w-5 h-5 text-green-500" />
                                        </div>
                                        <p className="text-lg font-bold">{t('dashboard.activation.title')}</p>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {isLoadingActivation ? (
                                        <div className="h-[250px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : userActivationData ? (
                                        <ResponsiveContainer width="100%" height={250}>
                                            <BarChart data={[
                                                { name: t('dashboard.activation.pendingTest'), value: userActivationData.pending_test.count, percent: userActivationData.pending_test.percent },
                                                { name: t('dashboard.activation.testAgain'), value: userActivationData.test_again.count, percent: userActivationData.test_again.percent },
                                                { name: t('dashboard.activation.pendingChooseJlpt'), value: userActivationData.pending_choose_level_jlpt.count, percent: userActivationData.pending_choose_level_jlpt.percent },
                                                { name: t('dashboard.activation.pendingChoosePokemon'), value: userActivationData.pending_choose_pokemon.count, percent: userActivationData.pending_choose_pokemon.percent },
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                                <Tooltip
                                                    formatter={(value: any, _name: any, props: any) => {
                                                        if (!props?.payload) return value
                                                        const data = props.payload
                                                        return [
                                                            `${value} (${data.percent?.toFixed(1)}%)`,
                                                            t('dashboard.sparkles.userCount')
                                                        ]
                                                    }}
                                                />
                                                <Bar dataKey="value" fill="hsl(var(--chart-1))" radius={[8, 8, 0, 0]} />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                            <AlertCircle className="h-8 w-8 opacity-50" />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Popular Content */}
                        {popularContentData && popularContentData.topContent.length > 0 && (
                            <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                <CardHeader className="bg-gradient-to-r from-purple-500/5 to-transparent border-b border-border/50">
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="p-2 bg-purple-500/10 rounded-lg">
                                            <BookOpen className="w-5 h-5 text-purple-500" />
                                        </div>
                                        <p className="text-lg font-bold">{t('dashboard.popularContent.title')}</p>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {isLoadingPopularContent ? (
                                        <div className="h-[200px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {popularContentData.topContent.slice(0, 5).map((content, index) => (
                                                <div
                                                    key={content.lessonId}
                                                    className="flex items-center gap-4 p-4 rounded-xl bg-gradient-to-r from-muted/50 to-muted/30 border border-border/50 hover:from-muted hover:to-muted/80 hover:shadow-md transition-all duration-300 hover:scale-[1.02] group"
                                                >
                                                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-bold text-primary text-sm shadow-lg group-hover:scale-110 transition-transform">
                                                        {index + 1}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-semibold text-foreground truncate">
                                                            {content.titleTranslation || content.titleJp}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground truncate mt-0.5">{content.titleJp}</p>
                                                    </div>
                                                    <div className="text-right px-3 py-2 rounded-lg bg-primary/5">
                                                        <p className="text-base font-bold text-foreground">{content.completedCount.toLocaleString()}</p>
                                                        <p className="text-xs text-muted-foreground">{t('dashboard.popularContent.completed')}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Users Tab */}
                    <TabsContent value="users" className="space-y-6">
                        {/* Period Selector */}
                        <Card className="border-2 border-border/50 shadow-lg">
                            <CardHeader className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border/50">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg font-bold">{t('dashboard.userStats.title')}</CardTitle>
                                    <select
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                        className="px-4 py-2 text-sm border-2 border-border rounded-lg bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="day">{t('dashboard.period.day')}</option>
                                        <option value="week">{t('dashboard.period.week')}</option>
                                        <option value="month">{t('dashboard.period.month')}</option>
                                        <option value="year">{t('dashboard.period.year')}</option>
                                    </select>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="p-8 rounded-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-2 border-green-500/20 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                                        <div className="mb-4">
                                            <UserCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                            <p className="text-sm font-semibold text-muted-foreground">{t('dashboard.userStats.activeUsers')}</p>
                                        </div>
                                        {isLoadingActiveUser ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                                        ) : (
                                            <>
                                                <p className="text-5xl font-bold text-foreground mb-2">
                                                    {activeUserData?.activeUsers.toLocaleString() || "0"}
                                                </p>
                                                <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full inline-block">
                                                    {t('dashboard.userStats.usersPer')}/{translatePeriod(activeUserData?.period || period)}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    <div className="p-8 rounded-xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-2 border-purple-500/20 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                                        <div className="mb-4">
                                            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                                            <p className="text-sm font-semibold text-muted-foreground">{t('dashboard.userStats.newUsers')}</p>
                                        </div>
                                        {isLoadingNewUser ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                                        ) : (
                                            <>
                                                <p className="text-5xl font-bold text-foreground mb-2">
                                                    {newUserData?.count.toLocaleString() || "0"}
                                                </p>
                                                <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full inline-block">
                                                    {t('dashboard.userStats.usersPer')}/{translatePeriod(newUserData?.period || period)}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* User Activation Details */}
                        {userActivationData && (
                            <Card className="border-2 border-border/50 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-orange-500/5 to-transparent border-b border-border/50">
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-500/10 rounded-lg">
                                            <Clock className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <p className="text-lg font-bold">{t('dashboard.activation.detailsTitle')}</p>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="p-5 rounded-xl border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-500/5 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-semibold text-foreground">{t('dashboard.activation.notTakenTest')}</p>
                                                <Clock className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <p className="text-3xl font-bold text-foreground mb-1">{userActivationData.pending_test.count.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground bg-orange-500/10 px-2 py-1 rounded-full inline-block">
                                                {formatPercent(userActivationData.pending_test.percent)}%
                                            </p>
                                        </div>
                                        <div className="p-5 rounded-xl border-2 border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-semibold text-foreground">{t('dashboard.activation.retryTest')}</p>
                                                <AlertCircle className="h-5 w-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <p className="text-3xl font-bold text-foreground mb-1">{userActivationData.test_again.count.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground bg-yellow-500/10 px-2 py-1 rounded-full inline-block">
                                                {formatPercent(userActivationData.test_again.percent)}%
                                            </p>
                                        </div>
                                        <div className="p-5 rounded-xl border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-semibold text-foreground">{t('dashboard.activation.notChosenJlpt')}</p>
                                                <Languages className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <p className="text-3xl font-bold text-foreground mb-1">{userActivationData.pending_choose_level_jlpt.count.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground bg-blue-500/10 px-2 py-1 rounded-full inline-block">
                                                {formatPercent(userActivationData.pending_choose_level_jlpt.percent)}%
                                            </p>
                                        </div>
                                        <div className="p-5 rounded-xl border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-500/5 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-semibold text-foreground">{t('dashboard.activation.choosingPokemon')}</p>
                                                <Sparkles className="h-5 w-5 text-purple-500 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <p className="text-3xl font-bold text-foreground mb-1">{userActivationData.pending_choose_pokemon.count.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground bg-purple-500/10 px-2 py-1 rounded-full inline-block">
                                                {formatPercent(userActivationData.pending_choose_pokemon.percent)}%
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>

                    {/* Engagement Tab */}
                    <TabsContent value="engagement" className="space-y-6">
                        <div className="grid gap-6 md:grid-cols-2">
                            {/* Sparkles Distribution */}
                            {sparklesData && (
                                <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <CardHeader className="bg-gradient-to-r from-yellow-500/5 to-transparent border-b border-border/50">
                                        <CardTitle className="flex items-center gap-3">
                                            <div className="p-2 bg-yellow-500/10 rounded-lg">
                                                <Sparkles className="w-5 h-5 text-yellow-500" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold">{t('dashboard.sparkles.title')}</p>
                                                <div className="mt-2 space-y-1 text-sm text-muted-foreground font-normal">
                                                    <p>{t('dashboard.sparkles.total')}: {sparklesData.totalUsers.toLocaleString()} {t('dashboard.sparkles.users')}</p>
                                                    <p>{t('dashboard.sparkles.average')}: {sparklesData.averageSparkles.toLocaleString()} sparkles</p>
                                                </div>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {isLoadingSparkles ? (
                                            <div className="h-[250px] flex items-center justify-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : sparklesChartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <BarChart data={sparklesChartData}>
                                                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                                    <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                                    <Tooltip
                                                        formatter={(value: any, _name: any, props: any) => {
                                                            if (!props?.payload) return value
                                                            const data = props.payload
                                                            return [
                                                                `${value} (${data.percent?.toFixed(1)}%)`,
                                                                t('dashboard.sparkles.userCount')
                                                            ]
                                                        }}
                                                    />
                                                    <Bar dataKey="value" fill="hsl(var(--chart-2))" radius={[8, 8, 0, 0]} />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                                <AlertCircle className="h-8 w-8 opacity-50" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}

                            {/* Starter Pokemon */}
                            {starterPokemonData && (
                                <Card className="border-2 border-border/50 shadow-lg hover:shadow-xl transition-all duration-300">
                                    <CardHeader className="bg-gradient-to-r from-amber-500/5 to-transparent border-b border-border/50">
                                        <CardTitle className="flex items-center gap-3">
                                            <div className="p-2 bg-amber-500/10 rounded-lg">
                                                <Trophy className="w-5 h-5 text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="text-lg font-bold">{t('dashboard.starterPokemon.title')}</p>
                                                <p className="text-sm text-muted-foreground font-normal mt-1">
                                                    {starterPokemonData.totalCount.toLocaleString()} {t('dashboard.starterPokemon.users')}
                                                </p>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="pt-6">
                                        {isLoadingStarterPokemon ? (
                                            <div className="h-[250px] flex items-center justify-center">
                                                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                            </div>
                                        ) : starterPokemonChartData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height={250}>
                                                <PieChart>
                                                    <Pie
                                                        data={starterPokemonChartData}
                                                        cx="50%"
                                                        cy="50%"
                                                        labelLine={true}
                                                        label={(props: any) => {
                                                            // Only show label if percent > 0
                                                            if (!props || props.percent <= 0) return ''
                                                            // Find pokemon from chart data using index
                                                            const pokemon = starterPokemonChartData[props.index]
                                                            if (!pokemon) return ''
                                                            const pokemonName = getPokemonName(pokemon)
                                                            // Use percent directly from pokemon data (already in percentage format 0-100)
                                                            return `${pokemonName}: ${pokemon.percent.toFixed(0)}%`
                                                        }}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="count"
                                                    >
                                                        {starterPokemonChartData.map((_entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                        ))}
                                                    </Pie>
                                                    <Tooltip
                                                        content={({ active, payload }: any) => {
                                                            if (!active || !payload || !payload[0]) return null
                                                            const data = payload[0].payload
                                                            const pokemon = starterPokemonChartData.find((p: any) => p.pokemonId === data.pokemonId)
                                                            if (!pokemon) return null
                                                            const pokemonName = getPokemonName(pokemon)
                                                            return (
                                                                <div className="rounded-lg border bg-white p-2 shadow-sm">
                                                                    <p className="text-sm font-medium">{pokemonName}: {payload[0].value}</p>
                                                                </div>
                                                            )
                                                        }}
                                                    />
                                                    <Legend
                                                        formatter={(value: any, entry: any) => {
                                                            if (!entry?.payload?.pokemonId) return value
                                                            const pokemon = starterPokemonChartData.find((p: any) => p.pokemonId === entry.payload.pokemonId)
                                                            if (!pokemon) return value
                                                            return getPokemonName(pokemon)
                                                        }}
                                                    />
                                                </PieChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="h-[250px] flex items-center justify-center text-muted-foreground">
                                                <AlertCircle className="h-8 w-8 opacity-50" />
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            )}
                        </div>

                        {/* Streak Retention */}
                        {streakData && (
                            <Card className="border-2 border-border/50 shadow-lg">
                                <CardHeader className="bg-gradient-to-r from-emerald-500/5 to-transparent border-b border-border/50">
                                    <CardTitle className="flex items-center gap-3">
                                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold">{t('dashboard.streak.title')}</p>
                                            <p className="text-sm text-muted-foreground font-normal mt-1">
                                                {streakData.totalUsers.toLocaleString()} {t('dashboard.streak.users')}
                                            </p>
                                        </div>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    {isLoadingStreak ? (
                                        <div className="h-[150px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : (
                                        <div className="grid md:grid-cols-2 gap-4">
                                            <div className="p-8 rounded-xl border-2 border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                                                <p className="text-sm font-semibold text-muted-foreground mb-3">{t('dashboard.streak.daily')}</p>
                                                <p className="text-4xl font-bold text-foreground mb-2">{streakData.daily_streak.count.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground bg-emerald-500/10 px-3 py-1 rounded-full inline-block">
                                                    {formatPercent(streakData.daily_streak.percent)}{t('dashboard.streak.usersPercent')}
                                                </p>
                                            </div>
                                            <div className="p-8 rounded-xl border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                                                <p className="text-sm font-semibold text-muted-foreground mb-3">{t('dashboard.streak.monthly')}</p>
                                                <p className="text-4xl font-bold text-foreground mb-2">{streakData.monthly_streak.count.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground bg-blue-500/10 px-3 py-1 rounded-full inline-block">
                                                    {formatPercent(streakData.monthly_streak.percent)}{t('dashboard.streak.usersPercent')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </TabsContent>
                </Tabs>
            </div>
        </>
    )
}

export default AdminDashboard
