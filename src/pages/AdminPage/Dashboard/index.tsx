import HeaderAdmin from "@organisms/Header/Admin"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@ui/Tabs"
import { Users, Languages, TrendingUp, Sparkles, Clock, AlertCircle, UserCheck, UserX, Loader2, Trophy, BookOpen, BarChart3 } from "lucide-react"
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
    const [period, setPeriod] = useState<string>("month")
    const [activeTab, setActiveTab] = useState<string>("overview")

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
            { name: "0-100", value: sparklesData.distribution["0-100"].count },
            { name: "101-500", value: sparklesData.distribution["101-500"].count },
            { name: "501-1000", value: sparklesData.distribution["501-1000"].count },
            { name: "1001-5000", value: sparklesData.distribution["1001-5000"].count },
            { name: "5000+", value: sparklesData.distribution["5000+"].count },
        ]
        : []

    const starterPokemonChartData = starterPokemonData?.starters || []
    const COLORS = ["hsl(var(--chart-1))", "hsl(var(--chart-2))", "hsl(var(--chart-3))", "hsl(var(--chart-4))", "hsl(var(--chart-5))"]

    // Helper function to format percent
    const formatPercent = (percent: number) => {
        return percent > 1 ? percent.toFixed(1) : (percent * 100).toFixed(1)
    }

    // Overview Stats
    const overviewStats = [
        {
            title: "Tổng người dùng",
            value: totalUserData?.total?.toLocaleString() || "0",
            icon: Users,
            gradient: "from-blue-500/20 via-blue-500/10 to-transparent",
            borderColor: "border-blue-500/20",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500",
            isLoading: isLoadingTotalUser,
        },
        {
            title: "Người dùng hoạt động",
            value: activeUserData?.activeUsers?.toLocaleString() || "0",
            icon: UserCheck,
            gradient: "from-green-500/20 via-green-500/10 to-transparent",
            borderColor: "border-green-500/20",
            iconBg: "bg-green-500/10",
            iconColor: "text-green-500",
            isLoading: isLoadingActiveUser,
        },
        {
            title: "Người dùng mới",
            value: newUserData?.count?.toLocaleString() || "0",
            icon: TrendingUp,
            gradient: "from-purple-500/20 via-purple-500/10 to-transparent",
            borderColor: "border-purple-500/20",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-500",
            isLoading: isLoadingNewUser,
        },
        {
            title: "Chưa kích hoạt",
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
            <HeaderAdmin title="Tổng quan" description="Thống kê và phân tích hệ thống" />

            <div className="p-8 mt-24 space-y-8">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full max-w-2xl grid-cols-3 bg-muted/50 p-1.5 rounded-xl">
                        <TabsTrigger
                            value="overview"
                            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                        >
                            <BarChart3 className="w-4 h-4" />
                            Tổng quan
                        </TabsTrigger>
                        <TabsTrigger
                            value="users"
                            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                        >
                            <Users className="w-4 h-4" />
                            Người dùng
                        </TabsTrigger>
                        <TabsTrigger
                            value="engagement"
                            className="flex items-center gap-2 data-[state=active]:bg-background data-[state=active]:shadow-md transition-all"
                        >
                            <Sparkles className="w-4 h-4" />
                            Tương tác
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
                                            <p className="text-lg font-bold">Phân bố cấp độ JLPT</p>
                                            {jlptDistributionData && (
                                                <p className="text-sm text-muted-foreground font-normal">
                                                    {jlptDistributionData.totalUsers.toLocaleString()} người dùng
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
                                                    labelLine={false}
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
                                        <p className="text-lg font-bold">Trạng thái kích hoạt</p>
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
                                                { name: "Chờ test", value: userActivationData.pending_test.count },
                                                { name: "Test lại", value: userActivationData.test_again.count },
                                                { name: "Chờ chọn JLPT", value: userActivationData.pending_choose_level_jlpt.count },
                                                { name: "Chờ chọn Pokemon", value: userActivationData.pending_choose_pokemon.count },
                                            ]}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                                <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                                                <Tooltip />
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
                                        <p className="text-lg font-bold">Nội dung phổ biến nhất</p>
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
                                                        <p className="text-xs text-muted-foreground">hoàn thành</p>
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
                                    <CardTitle className="text-lg font-bold">Thống kê người dùng</CardTitle>
                                    <select
                                        value={period}
                                        onChange={(e) => setPeriod(e.target.value)}
                                        className="px-4 py-2 text-sm border-2 border-border rounded-lg bg-background hover:border-primary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                                    >
                                        <option value="day">Theo ngày</option>
                                        <option value="week">Theo tuần</option>
                                        <option value="month">Theo tháng</option>
                                        <option value="year">Theo năm</option>
                                    </select>
                                </div>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <div className="grid gap-6 md:grid-cols-2">
                                    <div className="p-8 rounded-xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border-2 border-green-500/20 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                                        <div className="mb-4">
                                            <UserCheck className="h-8 w-8 text-green-500 mx-auto mb-2" />
                                            <p className="text-sm font-semibold text-muted-foreground">Người dùng hoạt động</p>
                                        </div>
                                        {isLoadingActiveUser ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                                        ) : (
                                            <>
                                                <p className="text-5xl font-bold text-foreground mb-2">
                                                    {activeUserData?.activeUsers.toLocaleString() || "0"}
                                                </p>
                                                <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full inline-block">
                                                    người dùng/{activeUserData?.period || period}
                                                </p>
                                            </>
                                        )}
                                    </div>
                                    <div className="p-8 rounded-xl bg-gradient-to-br from-purple-500/10 via-purple-500/5 to-transparent border-2 border-purple-500/20 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                                        <div className="mb-4">
                                            <TrendingUp className="h-8 w-8 text-purple-500 mx-auto mb-2" />
                                            <p className="text-sm font-semibold text-muted-foreground">Người dùng mới</p>
                                        </div>
                                        {isLoadingNewUser ? (
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mx-auto" />
                                        ) : (
                                            <>
                                                <p className="text-5xl font-bold text-foreground mb-2">
                                                    {newUserData?.count.toLocaleString() || "0"}
                                                </p>
                                                <p className="text-xs text-muted-foreground bg-muted/50 px-3 py-1 rounded-full inline-block">
                                                    người dùng/{newUserData?.period || period}
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
                                        <p className="text-lg font-bold">Chi tiết trạng thái kích hoạt</p>
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="pt-6">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="p-5 rounded-xl border-2 border-orange-500/20 bg-gradient-to-br from-orange-500/10 to-orange-500/5 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-semibold text-foreground">Không làm kiểm tra đầu vào</p>
                                                <Clock className="h-5 w-5 text-orange-500 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <p className="text-3xl font-bold text-foreground mb-1">{userActivationData.pending_test.count.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground bg-orange-500/10 px-2 py-1 rounded-full inline-block">
                                                {formatPercent(userActivationData.pending_test.percent)}%
                                            </p>
                                        </div>
                                        <div className="p-5 rounded-xl border-2 border-yellow-500/20 bg-gradient-to-br from-yellow-500/10 to-yellow-500/5 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-semibold text-foreground">Thử lại kiểm tra đầu vào</p>
                                                <AlertCircle className="h-5 w-5 text-yellow-500 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <p className="text-3xl font-bold text-foreground mb-1">{userActivationData.test_again.count.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground bg-yellow-500/10 px-2 py-1 rounded-full inline-block">
                                                {formatPercent(userActivationData.test_again.percent)}%
                                            </p>
                                        </div>
                                        <div className="p-5 rounded-xl border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-semibold text-foreground">Chưa chọn trình độ JLPT</p>
                                                <Languages className="h-5 w-5 text-blue-500 group-hover:scale-110 transition-transform" />
                                            </div>
                                            <p className="text-3xl font-bold text-foreground mb-1">{userActivationData.pending_choose_level_jlpt.count.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground bg-blue-500/10 px-2 py-1 rounded-full inline-block">
                                                {formatPercent(userActivationData.pending_choose_level_jlpt.percent)}%
                                            </p>
                                        </div>
                                        <div className="p-5 rounded-xl border-2 border-purple-500/20 bg-gradient-to-br from-purple-500/10 to-purple-500/5 hover:shadow-lg transition-all duration-300 hover:scale-105 group">
                                            <div className="flex items-center justify-between mb-3">
                                                <p className="text-sm font-semibold text-foreground">Đang chọn Pokemon</p>
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
                                                <p className="text-lg font-bold">Phân bố Sparkles</p>
                                                <div className="mt-2 space-y-1 text-sm text-muted-foreground font-normal">
                                                    <p>Tổng: {sparklesData.totalUsers.toLocaleString()} người dùng</p>
                                                    <p>Trung bình: {sparklesData.averageSparkles.toLocaleString()} sparkles</p>
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
                                                    <Tooltip />
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
                                                <p className="text-lg font-bold">Starter Pokemon</p>
                                                <p className="text-sm text-muted-foreground font-normal mt-1">
                                                    {starterPokemonData.totalCount.toLocaleString()} người dùng
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
                                                        labelLine={false}
                                                        label={({ nameJp, percent }: any) => `${nameJp}: ${(percent * 100).toFixed(0)}%`}
                                                        outerRadius={80}
                                                        fill="#8884d8"
                                                        dataKey="count"
                                                    >
                                                        {starterPokemonChartData.map((_entry, index) => (
                                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
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
                                            <p className="text-lg font-bold">Duy trì chuỗi học tập</p>
                                            <p className="text-sm text-muted-foreground font-normal mt-1">
                                                {streakData.totalUsers.toLocaleString()} người dùng
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
                                                <p className="text-sm font-semibold text-muted-foreground mb-3">Chuỗi hàng ngày</p>
                                                <p className="text-4xl font-bold text-foreground mb-2">{streakData.daily_streak.count.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground bg-emerald-500/10 px-3 py-1 rounded-full inline-block">
                                                    {formatPercent(streakData.daily_streak.percent)}% người dùng
                                                </p>
                                            </div>
                                            <div className="p-8 rounded-xl border-2 border-blue-500/20 bg-gradient-to-br from-blue-500/10 to-blue-500/5 text-center hover:shadow-lg transition-all duration-300 hover:scale-105">
                                                <p className="text-sm font-semibold text-muted-foreground mb-3">Chuỗi hàng tháng</p>
                                                <p className="text-4xl font-bold text-foreground mb-2">{streakData.monthly_streak.count.toLocaleString()}</p>
                                                <p className="text-xs text-muted-foreground bg-blue-500/10 px-3 py-1 rounded-full inline-block">
                                                    {formatPercent(streakData.monthly_streak.percent)}% người dùng
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
