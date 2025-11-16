""

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@ui/Card"
import { Badge } from "@ui/Badge"
import { Button } from "@ui/Button"
import { Input } from "@ui/Input"
import { Textarea } from "@ui/Textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@ui/Dialog"
import { Package, DollarSign, Users, TrendingUp, Plus, Search, Edit, Trash2, Check, Sparkles, Loader2, ArrowRight } from "lucide-react"
import HeaderAdmin from "@organisms/Header/Admin"
import { useTranslation } from "react-i18next"

export default function PackageManagement() {
    const { t } = useTranslation()
    const [searchQuery, setSearchQuery] = useState("")
    const [showAddDialog, setShowAddDialog] = useState(false)

    const packages = [
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
    ]

    const stats = [
        {
            label: "Tổng gói dịch vụ",
            value: "4",
            icon: Package,
            gradient: "from-blue-500/10 to-cyan-500/10",
            iconBg: "bg-blue-500/10",
            iconColor: "text-blue-500",
            borderColor: "border-blue-500/20"
        },
        {
            label: "Doanh thu tháng này",
            value: "125M VND",
            icon: DollarSign,
            gradient: "from-green-500/10 to-emerald-500/10",
            iconBg: "bg-green-500/10",
            iconColor: "text-green-500",
            borderColor: "border-green-500/20"
        },
        {
            label: "Tổng người đăng ký",
            value: "902",
            icon: Users,
            gradient: "from-purple-500/10 to-pink-500/10",
            iconBg: "bg-purple-500/10",
            iconColor: "text-purple-500",
            borderColor: "border-purple-500/20"
        },
        {
            label: "Tăng trưởng",
            value: "+23%",
            icon: TrendingUp,
            gradient: "from-yellow-500/10 to-amber-500/10",
            iconBg: "bg-yellow-500/10",
            iconColor: "text-yellow-500",
            borderColor: "border-yellow-500/20"
        },
    ]

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

                {/* Search & Filters */}
                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Package className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">Danh sách gói dịch vụ</CardTitle>
                            </div>
                            <Button
                                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg"
                                onClick={() => setShowAddDialog(true)}
                            >
                                <Plus className="w-4 h-4 mr-2" />
                                Tạo gói mới
                            </Button>
                        </div>
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                            <Input
                                type="text"
                                placeholder="Tìm kiếm gói dịch vụ..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                            />
                        </div>
                    </CardHeader>
                </Card>

                {/* Packages Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {packages.filter(pkg =>
                        !searchQuery ||
                        pkg.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        pkg.nameEn.toLowerCase().includes(searchQuery.toLowerCase())
                    ).map((pkg) => {
                        const colorClasses = getColorClasses(pkg.color)
                        return (
                            <Card
                                key={pkg.id}
                                className={`group relative overflow-hidden bg-gradient-to-br ${colorClasses.gradient} border-2 ${colorClasses.border} shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105`}
                            >
                                {/* Decorative gradient overlay */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-32 -mt-32 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                                {/* Popular Badge */}
                                {pkg.id === 2 && (
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

                                <CardContent className="space-y-4 relative">
                                    <div className="space-y-3 mb-6 p-4 bg-card/50 rounded-lg border border-border/50">
                                        {pkg.features.map((feature, index) => (
                                            <div key={index} className="flex items-start gap-2">
                                                <div className={`p-1 rounded-full ${colorClasses.bg} ${colorClasses.text} mt-0.5 flex-shrink-0`}>
                                                    <Check className="w-3 h-3" />
                                                </div>
                                                <span className="text-foreground text-sm font-medium leading-relaxed">{feature}</span>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="pt-4 border-t border-border/50 space-y-4">
                                        <div className="flex items-center justify-between text-sm p-3 bg-muted/30 rounded-lg">
                                            <span className="text-muted-foreground font-medium flex items-center gap-2">
                                                <Users className="w-4 h-4" />
                                                Người đăng ký
                                            </span>
                                            <span className="text-foreground font-bold text-lg">{pkg.subscribers}</span>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1 border-border text-foreground hover:bg-primary/10 hover:border-primary/50 hover:text-primary transition-all shadow-sm"
                                            >
                                                <Edit className="w-4 h-4 mr-2" />
                                                Sửa
                                            </Button>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="border-border text-destructive hover:bg-destructive/10 hover:border-destructive hover:text-destructive transition-all shadow-sm"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        )
                    })}
                </div>

                {/* Subscribers Table */}
                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                            <CardTitle className="text-xl font-bold text-foreground">Người đăng ký gần đây</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {[
                                { name: "Nguyễn Văn A", package: "Gói Premium", date: "2024-03-15", amount: "499,000 VND" },
                                { name: "Trần Thị B", package: "Gói Tiêu Chuẩn", date: "2024-03-14", amount: "249,000 VND" },
                                { name: "Lê Văn C", package: "Gói Cơ Bản", date: "2024-03-14", amount: "99,000 VND" },
                                { name: "Phạm Thị D", package: "Gói Premium", date: "2024-03-13", amount: "499,000 VND" },
                                { name: "Hoàng Văn E", package: "Gói Doanh Nghiệp", date: "2024-03-12", amount: "2,999,000 VND" },
                            ].map((subscriber, index) => (
                                <Card
                                    key={index}
                                    className="bg-gradient-to-br from-card via-card to-card/95 border-border hover:border-primary/50 hover:shadow-md transition-all duration-200"
                                >
                                    <CardContent className="p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="p-2 bg-primary/10 rounded-lg">
                                                    <Users className="w-5 h-5 text-primary" />
                                                </div>
                                                <div>
                                                    <p className="font-bold text-foreground">{subscriber.name}</p>
                                                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                                        <Package className="w-3 h-3" />
                                                        {subscriber.package}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-foreground text-lg">{subscriber.amount}</p>
                                                <p className="text-sm text-muted-foreground">{subscriber.date}</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Add Package Dialog */}
                <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
                    <DialogContent className="bg-gradient-to-br from-card via-card to-card/95 border-border max-w-2xl max-h-[90vh] overflow-hidden flex flex-col p-0 shadow-2xl">
                        <DialogHeader className="px-6 pt-6 pb-4 border-b border-border bg-gradient-to-r from-primary/5 to-transparent">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <Sparkles className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <DialogTitle className="text-2xl font-bold text-foreground">Tạo gói dịch vụ mới</DialogTitle>
                                    <p className="text-sm text-muted-foreground mt-1">Thêm gói dịch vụ mới vào hệ thống</p>
                                </div>
                            </div>
                        </DialogHeader>
                        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6" style={{ minHeight: 0 }}>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <Package className="w-4 h-4 text-primary" />
                                        Tên gói (Tiếng Việt) *
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Nhập tên gói..."
                                        className="bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <Package className="w-4 h-4 text-primary" />
                                        Tên gói (English) *
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="Enter package name..."
                                        className="bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <DollarSign className="w-4 h-4 text-primary" />
                                        Giá (VND) *
                                    </label>
                                    <Input
                                        type="number"
                                        placeholder="Nhập giá..."
                                        className="bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                        <TrendingUp className="w-4 h-4 text-primary" />
                                        Thời hạn *
                                    </label>
                                    <Select>
                                        <SelectTrigger className="bg-background border-border text-foreground h-11 shadow-sm">
                                            <SelectValue placeholder="Chọn thời hạn" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-card border-border">
                                            <SelectItem value="1">1 tháng</SelectItem>
                                            <SelectItem value="3">3 tháng</SelectItem>
                                            <SelectItem value="6">6 tháng</SelectItem>
                                            <SelectItem value="12">1 năm</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                    <Sparkles className="w-4 h-4 text-primary" />
                                    Màu chủ đạo
                                </label>
                                <Select>
                                    <SelectTrigger className="bg-background border-border text-foreground h-11 shadow-sm">
                                        <SelectValue placeholder="Chọn màu" />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="blue">Xanh dương</SelectItem>
                                        <SelectItem value="purple">Tím</SelectItem>
                                        <SelectItem value="yellow">Vàng</SelectItem>
                                        <SelectItem value="red">Đỏ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-semibold text-foreground">Tính năng (mỗi dòng một tính năng)</label>
                                <Textarea
                                    rows={6}
                                    placeholder="Truy cập 50 bài học&#10;5 Pokemon miễn phí&#10;Hỗ trợ email"
                                    className="bg-background border-border text-foreground shadow-sm focus:shadow-md transition-shadow resize-none"
                                />
                            </div>
                        </div>
                        <DialogFooter className="px-6 py-4 border-t border-border bg-muted/30">
                            <div className="flex justify-between items-center gap-3 w-full">
                                <p className="text-xs text-muted-foreground">* Trường bắt buộc</p>
                                <div className="flex gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setShowAddDialog(false)}
                                        className="border-border text-foreground hover:bg-muted shadow-sm"
                                    >
                                        Hủy
                                    </Button>
                                    <Button className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg">
                                        <Sparkles className="w-4 h-4 mr-2" />
                                        Tạo gói
                                    </Button>
                                </div>
                            </div>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </>
    )
}
