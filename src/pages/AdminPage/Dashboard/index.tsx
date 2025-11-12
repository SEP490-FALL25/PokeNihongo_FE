import HeaderAdmin from "@organisms/Header/Admin"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Users, BookOpen, Languages, TrendingUp, Sparkles, CheckCircle2, Clock, ArrowUpRight } from "lucide-react"

const AdminDashboard = () => {
    const stats = [
        {
            title: "Tổng người dùng",
            value: "2,543",
            change: "+12.5%",
            icon: Users,
            color: "text-chart-1",
        },
        {
            title: "Bài học",
            value: "156",
            change: "+8.2%",
            icon: BookOpen,
            color: "text-chart-2",
        },
        {
            title: "Từ vựng",
            value: "4,892",
            change: "+15.3%",
            icon: Languages,
            color: "text-chart-3",
        },
        {
            title: "Hoạt động hôm nay",
            value: "892",
            change: "+23.1%",
            icon: TrendingUp,
            color: "text-chart-4",
        },
    ]

    return (
        <div className="p-8 mt-24 space-y-8">
            {/* Header */}
            <HeaderAdmin title="Tổng quan" description="Chào mừng trở lại! Đây là tổng quan về hệ thống của bạn." />

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
                                <div className="text-4xl font-bold text-foreground mb-1">{stat.value}</div>
                                <div className="flex items-center gap-2 mt-2">
                                    <ArrowUpRight className={`h-4 w-4 ${stat.change.startsWith('+') ? 'text-green-500' : 'text-red-500'}`} />
                                    <p className="text-xs font-medium text-muted-foreground">{stat.change} so với tháng trước</p>
                                </div>
                                <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Charts Section */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-xl font-bold text-foreground">Người dùng mới</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                            Biểu đồ người dùng mới theo thời gian
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-xl font-bold text-foreground">Hoạt động học tập</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px] flex items-center justify-center text-muted-foreground bg-muted/20 rounded-lg border border-border/50">
                            Biểu đồ hoạt động học tập
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Activity */}
            <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                <CardHeader className="pb-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/10 rounded-lg">
                            <Clock className="w-5 h-5 text-primary" />
                        </div>
                        <CardTitle className="text-xl font-bold text-foreground">Hoạt động gần đây</CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="group flex items-center gap-4 p-4 rounded-lg bg-muted/20 border border-border/50 hover:bg-muted/30 hover:shadow-md transition-all duration-200">
                                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                                    <Users className="h-6 w-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-foreground">Người dùng mới đăng ký</p>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        user{i}@example.com - {i} phút trước
                                    </p>
                                </div>
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}

export default AdminDashboard
