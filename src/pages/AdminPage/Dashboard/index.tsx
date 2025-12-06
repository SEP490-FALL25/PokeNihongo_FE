import HeaderAdmin from "@organisms/Header/Admin"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Users, Languages, TrendingUp, Sparkles, Clock, ArrowUpRight, AlertCircle, UserCheck, UserX, Loader2, Trophy, BookOpen } from "lucide-react"
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
            { name: "N5", value: jlptDistributionData.summary.N5.total },
            { name: "N4", value: jlptDistributionData.summary.N4.total },
            { name: "N3", value: jlptDistributionData.summary.N3.total },
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

    const stats = [
        {
            title: "Tổng người dùng",
            value: totalUserData?.total?.toLocaleString() || "0",
            change: "+0%",
            icon: Users,
            color: "text-chart-1",
            isLoading: isLoadingTotalUser,
        },
        {
            title: "Người dùng mới",
            value: newUserData?.count?.toLocaleString() || "0",
            change: "+0%",
            icon: TrendingUp,
            color: "text-chart-2",
            isLoading: isLoadingNewUser,
        },
        {
            title: "Người dùng hoạt động",
            value: activeUserData?.activeUsers?.toLocaleString() || "0",
            change: "+0%",
            icon: UserCheck,
            color: "text-chart-3",
            isLoading: isLoadingActiveUser,
        },
        {
            title: "Tổng người dùng chưa kích hoạt",
            value: userActivationData?.summary?.total?.toLocaleString() || "0",
            change: "+0%",
            icon: UserX,
            color: "text-chart-4",
            isLoading: isLoadingActivation,
        },
    ]

    return (
        <>
            {/* Header */}
            <HeaderAdmin title="Tổng quan" description="Chào mừng trở lại! Đây là tổng quan về hệ thống của bạn." />

            <div className="p-8 mt-24 space-y-8">
                {/* Stats Grid */}
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                    {stats.map((stat, index) => {
                        const gradients = [
                            "from-blue-500/10 to-cyan-500/10 border-blue-500/20",
                            "from-green-500/10 to-emerald-500/10 border-green-500/20",
                            "from-purple-500/10 to-pink-500/10 border-purple-500/20",
                            "from-orange-500/10 to-red-500/10 border-orange-500/20",
                        ];
                        const iconColors = [
                            "text-blue-500",
                            "text-green-500",
                            "text-purple-500",
                            "text-orange-500",
                        ];
                        const iconBgs = [
                            "bg-blue-500/10",
                            "bg-green-500/10",
                            "bg-purple-500/10",
                            "bg-orange-500/10",
                        ];
                        return (
                            <Card key={stat.title} className={`relative overflow-hidden bg-gradient-to-br ${gradients[index]} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                                <CardHeader className="pb-3 relative">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="text-sm font-semibold text-foreground/90">{stat.title}</CardTitle>
                                        <div className={`p-2 ${iconBgs[index]} rounded-lg ${iconColors[index]}`}>
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
                                            <div className="flex items-center gap-2 mt-2">
                                                <ArrowUpRight className={`h-4 w-4 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`} />
                                                <p className="text-xs font-medium text-muted-foreground">{stat.change} so với tháng trước</p>
                                            </div>
                                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                                        </>
                                    )}
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>

                {/* Charts Section */}
                <div className="grid gap-6 md:grid-cols-2">
                    {/* JLPT Distribution Chart */}
                    <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Languages className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">Phân bố JLPT</CardTitle>
                            </div>
                            {jlptDistributionData && (
                                <p className="text-sm text-muted-foreground mt-2">
                                    Tổng: {jlptDistributionData.totalUsers.toLocaleString()} người dùng
                                </p>
                            )}
                        </CardHeader>
                        <CardContent>
                            {isLoadingJlpt ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : jlptChartData.length > 0 ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <PieChart>
                                        <Pie
                                            data={jlptChartData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={false}
                                            label={({ name, percent }: any) => `${name}: ${(percent * 100).toFixed(1)}%`}
                                            outerRadius={100}
                                            fill="#8884d8"
                                            dataKey="value"
                                        >
                                            {jlptChartData.map((_entry, index) => (
                                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                        />
                                        <Legend />
                                    </PieChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                                    <div className="text-center">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Không có dữ liệu</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* User Activation Chart */}
                    <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <UserCheck className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">Trạng thái kích hoạt tài khoản</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingActivation ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : userActivationData ? (
                                <ResponsiveContainer width="100%" height={300}>
                                    <BarChart data={[
                                        { name: "Chờ test", value: userActivationData.pending_test.count, percent: userActivationData.pending_test.percent },
                                        { name: "Test lại", value: userActivationData.test_again.count, percent: userActivationData.test_again.percent },
                                        { name: "Chờ chọn JLPT", value: userActivationData.pending_choose_level_jlpt.count, percent: userActivationData.pending_choose_level_jlpt.percent },
                                        { name: "Chờ chọn Pokemon", value: userActivationData.pending_choose_pokemon.count, percent: userActivationData.pending_choose_pokemon.percent },
                                    ]}>
                                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                        <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                        <YAxis stroke="hsl(var(--muted-foreground))" />
                                        <Tooltip
                                            contentStyle={{
                                                backgroundColor: "hsl(var(--card))",
                                                border: "1px solid hsl(var(--border))",
                                                borderRadius: "8px",
                                            }}
                                            formatter={(value: number, _name: string, props: any) => {
                                                // percent from API is already a percentage (0-100)
                                                const percentValue = typeof props.payload.percent === 'number'
                                                    ? (props.payload.percent > 1 ? props.payload.percent : props.payload.percent * 100)
                                                    : Number(props.payload.percent) || 0;
                                                return [`${value} (${percentValue.toFixed(1)}%)`, "Số lượng"];
                                            }}
                                        />
                                        <Bar dataKey="value" fill="hsl(var(--chart-1))" />
                                    </BarChart>
                                </ResponsiveContainer>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                                    <div className="text-center">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Không có dữ liệu</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Period Selector and User Growth Charts */}
                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-foreground">Người dùng hoạt động</CardTitle>
                                </div>
                                <select
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground"
                                >
                                    <option value="day">Ngày</option>
                                    <option value="week">Tuần</option>
                                    <option value="month">Tháng</option>
                                    <option value="year">Năm</option>
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingActiveUser ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : activeUserData ? (
                                <div className="h-[300px] flex flex-col items-center justify-center">
                                    <div className="text-5xl font-bold text-foreground mb-2">{activeUserData.activeUsers.toLocaleString()}</div>
                                    <p className="text-muted-foreground">Người dùng hoạt động ({activeUserData.period})</p>
                                </div>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                                    <div className="text-center">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Không có dữ liệu</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <Users className="w-5 h-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-foreground">Người dùng mới</CardTitle>
                                </div>
                                <select
                                    value={period}
                                    onChange={(e) => setPeriod(e.target.value)}
                                    className="px-3 py-1 text-sm border border-border rounded-md bg-background text-foreground"
                                >
                                    <option value="day">Ngày</option>
                                    <option value="week">Tuần</option>
                                    <option value="month">Tháng</option>
                                    <option value="year">Năm</option>
                                </select>
                            </div>
                        </CardHeader>
                        <CardContent>
                            {isLoadingNewUser ? (
                                <div className="h-[300px] flex items-center justify-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                </div>
                            ) : newUserData ? (
                                <div className="h-[300px] flex flex-col items-center justify-center">
                                    <div className="text-5xl font-bold text-foreground mb-2">{newUserData.count.toLocaleString()}</div>
                                    <p className="text-muted-foreground">Người dùng mới ({newUserData.period})</p>
                                </div>
                            ) : (
                                <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                                    <div className="text-center">
                                        <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>Không có dữ liệu</p>
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* User Activation Details */}
                {userActivationData && (
                    <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                        <CardHeader className="pb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Clock className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">Chi tiết trạng thái kích hoạt</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="group flex items-center gap-4 p-4 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/30 hover:shadow-md transition-all duration-200">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-orange-500/20 to-orange-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <Clock className="h-6 w-6 text-orange-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-foreground">Chờ làm bài test</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {userActivationData.pending_test.count.toLocaleString()} người dùng ({formatPercent(userActivationData.pending_test.percent)}%)
                                        </p>
                                    </div>
                                    <div className="text-2xl font-bold text-orange-500">{userActivationData.pending_test.count.toLocaleString()}</div>
                                </div>

                                <div className="group flex items-center gap-4 p-4 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/30 hover:shadow-md transition-all duration-200">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-yellow-500/20 to-yellow-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <AlertCircle className="h-6 w-6 text-yellow-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-foreground">Cần test lại</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {userActivationData.test_again.count.toLocaleString()} người dùng ({formatPercent(userActivationData.test_again.percent)}%)
                                        </p>
                                    </div>
                                    <div className="text-2xl font-bold text-yellow-500">{userActivationData.test_again.count.toLocaleString()}</div>
                                </div>

                                <div className="group flex items-center gap-4 p-4 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/30 hover:shadow-md transition-all duration-200">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500/20 to-blue-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <Languages className="h-6 w-6 text-blue-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-foreground">Chờ chọn cấp độ JLPT</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {userActivationData.pending_choose_level_jlpt.count.toLocaleString()} người dùng ({formatPercent(userActivationData.pending_choose_level_jlpt.percent)}%)
                                        </p>
                                    </div>
                                    <div className="text-2xl font-bold text-blue-500">{userActivationData.pending_choose_level_jlpt.count.toLocaleString()}</div>
                                </div>

                                <div className="group flex items-center gap-4 p-4 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/30 hover:shadow-md transition-all duration-200">
                                    <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-500/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                        <Sparkles className="h-6 w-6 text-purple-500" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-semibold text-foreground">Chờ chọn Pokemon</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {userActivationData.pending_choose_pokemon.count.toLocaleString()} người dùng ({formatPercent(userActivationData.pending_choose_pokemon.percent)}%)
                                        </p>
                                    </div>
                                    <div className="text-2xl font-bold text-purple-500">{userActivationData.pending_choose_pokemon.count.toLocaleString()}</div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Engagement Section */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold text-foreground">Tương tác & Tham gia</h2>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Sparkles Accumulation */}
                        {sparklesData && (
                            <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Sparkles className="w-5 h-5 text-primary" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-foreground">Phân bố Sparkles</CardTitle>
                                    </div>
                                    {sparklesData && (
                                        <div className="mt-2 space-y-1">
                                            <p className="text-sm text-muted-foreground">
                                                Tổng: {sparklesData.totalUsers.toLocaleString()} người dùng
                                            </p>
                                            <p className="text-sm text-muted-foreground">
                                                Trung bình: {sparklesData.averageSparkles.toLocaleString()} sparkles
                                            </p>
                                        </div>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {isLoadingSparkles ? (
                                        <div className="h-[300px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : sparklesChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <BarChart data={sparklesChartData}>
                                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                                                <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                                                <YAxis stroke="hsl(var(--muted-foreground))" />
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "hsl(var(--card))",
                                                        border: "1px solid hsl(var(--border))",
                                                        borderRadius: "8px",
                                                    }}
                                                />
                                                <Bar dataKey="value" fill="hsl(var(--chart-2))" />
                                            </BarChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                                            <div className="text-center">
                                                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p>Không có dữ liệu</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}

                        {/* Starter Pokemon Distribution */}
                        {starterPokemonData && (
                            <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                                <CardHeader className="pb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-primary/10 rounded-lg">
                                            <Trophy className="w-5 h-5 text-primary" />
                                        </div>
                                        <CardTitle className="text-xl font-bold text-foreground">Phân bố Starter Pokemon</CardTitle>
                                    </div>
                                    {starterPokemonData && (
                                        <p className="text-sm text-muted-foreground mt-2">
                                            Tổng: {starterPokemonData.totalCount.toLocaleString()} người dùng
                                        </p>
                                    )}
                                </CardHeader>
                                <CardContent>
                                    {isLoadingStarterPokemon ? (
                                        <div className="h-[300px] flex items-center justify-center">
                                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                        </div>
                                    ) : starterPokemonChartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height={300}>
                                            <PieChart>
                                                <Pie
                                                    data={starterPokemonChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    labelLine={false}
                                                    label={({ nameJp, percent }: any) => `${nameJp}: ${(percent * 100).toFixed(1)}%`}
                                                    outerRadius={100}
                                                    fill="#8884d8"
                                                    dataKey="count"
                                                >
                                                    {starterPokemonChartData.map((_entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{
                                                        backgroundColor: "hsl(var(--card))",
                                                        border: "1px solid hsl(var(--border))",
                                                        borderRadius: "8px",
                                                    }}
                                                />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                                            <div className="text-center">
                                                <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                                <p>Không có dữ liệu</p>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* Streak Retention */}
                    {streakData && (
                        <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <TrendingUp className="w-5 h-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-foreground">Duy trì chuỗi học tập</CardTitle>
                                </div>
                                {streakData && (
                                    <p className="text-sm text-muted-foreground mt-2">
                                        Tổng: {streakData.totalUsers.toLocaleString()} người dùng
                                    </p>
                                )}
                            </CardHeader>
                            <CardContent>
                                {isLoadingStreak ? (
                                    <div className="h-[200px] flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : streakData ? (
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                                            <p className="text-sm font-semibold text-foreground mb-2">Chuỗi hàng ngày</p>
                                            <p className="text-2xl font-bold text-foreground">{streakData.daily_streak.count.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{formatPercent(streakData.daily_streak.percent)}% người dùng</p>
                                        </div>
                                        <div className="p-4 rounded-lg bg-muted/20 border border-border/50">
                                            <p className="text-sm font-semibold text-foreground mb-2">Chuỗi hàng tháng</p>
                                            <p className="text-2xl font-bold text-foreground">{streakData.monthly_streak.count.toLocaleString()}</p>
                                            <p className="text-xs text-muted-foreground mt-1">{formatPercent(streakData.monthly_streak.percent)}% người dùng</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="h-[200px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                                        <div className="text-center">
                                            <AlertCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                            <p>Không có dữ liệu</p>
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}

                    {/* Popular Content */}
                    {popularContentData && popularContentData.topContent.length > 0 && (
                        <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                            <CardHeader className="pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 rounded-lg">
                                        <BookOpen className="w-5 h-5 text-primary" />
                                    </div>
                                    <CardTitle className="text-xl font-bold text-foreground">Nội dung phổ biến</CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent>
                                {isLoadingPopularContent ? (
                                    <div className="h-[300px] flex items-center justify-center">
                                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {popularContentData.topContent.slice(0, 5).map((content, index) => (
                                            <div key={content.lessonId} className="flex items-center gap-4 p-3 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/30 transition-all">
                                                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center font-bold text-primary">
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1">
                                                    <p className="text-sm font-semibold text-foreground">{content.titleTranslation || content.titleJp}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">{content.titleJp}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-sm font-bold text-foreground">{content.completedCount.toLocaleString()}</p>
                                                    <p className="text-xs text-muted-foreground">hoàn thành</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </>
    )
}

export default AdminDashboard
