import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Button } from "@ui/Button"
import { Input } from "@ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/Table"
import { Badge } from "@ui/Badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@ui/Dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Search, Plus, Edit, Trash2, MoreVertical } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ui/DropdownMenu"
import HeaderAdmin from "@organisms/Header/Admin"
import { useUserList } from "@hooks/useUser"
import { IUser } from "@models/user/entity"
import PaginationControls from "@ui/PaginationControls"
import SortableTableHeader from "@ui/SortableTableHeader"

const UsersManagement = () => {
    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(15)
    const [statusFilter, setStatusFilter] = useState<string>("all")
    const [roleFilter, setRoleFilter] = useState<string>("all")
    const [sortBy, setSortBy] = useState<string>("id")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

    // Debounce search query
    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedSearchQuery(searchQuery)
            setCurrentPage(1) // Reset to first page when search changes
        }, 500)

        return () => clearTimeout(timer)
    }, [searchQuery])

    // Handle sort
    const handleSort = (key: string) => {
        if (sortBy === key) {
            // Toggle sort order if same column
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            // Set new column with default desc order
            setSortBy(key)
            setSortOrder("desc")
        }
        setCurrentPage(1) // Reset to first page when sorting changes
    }

    // Build query params
    const queryParams = useMemo(() => {
        const params: any = {
            page: currentPage,
            limit: pageSize,
            sortBy,
            sortOrder,
        }

        if (debouncedSearchQuery) {
            params.emailLike = debouncedSearchQuery
        }

        if (statusFilter !== "all") {
            params.status = statusFilter
        }

        if (roleFilter !== "all") {
            params.roleId = roleFilter
        }

        return params
    }, [currentPage, pageSize, debouncedSearchQuery, statusFilter, roleFilter, sortBy, sortOrder])

    // Fetch user list
    const { data, isLoading, error } = useUserList(queryParams)

    const users = data?.results || []
    const pagination = data?.pagination

    const getRoleBadgeColor = (roleName: string) => {
        switch (roleName.toUpperCase()) {
            case "ADMIN":
                return "bg-destructive text-destructive-foreground"
            case "INSTRUCTOR":
                return "bg-chart-1 text-white"
            case "STUDENT":
                return "bg-chart-2 text-white"
            default:
                return "bg-muted text-muted-foreground"
        }
    }

    const getStatusBadgeColor = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "bg-chart-4 text-white"
            case "INACTIVE":
                return "bg-muted text-muted-foreground"
            case "BANNED":
                return "bg-destructive text-destructive-foreground"
            default:
                return "bg-muted text-muted-foreground"
        }
    }

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "ACTIVE":
                return "Hoạt động"
            case "INACTIVE":
                return "Không hoạt động"
            case "BANNED":
                return "Bị cấm"
            default:
                return status
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN")
    }

    return (
        <div className="p-8">
            {/* Header */}
            <HeaderAdmin title="Quản lý người dùng" description="Quản lý tất cả người dùng trong hệ thống" />

            {/* Stats Cards */}
            <div className="grid gap-6 md:grid-cols-4 mb-8">
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Tổng người dùng</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {pagination?.totalItem || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Trang hiện tại</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {pagination?.current || 0} / {pagination?.totalPage || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Kết quả/trang</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {pagination?.pageSize || 0}
                        </div>
                    </CardContent>
                </Card>
                <Card className="bg-card border-border">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Đang hiển thị</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-3xl font-bold text-foreground">
                            {users.length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Users Table */}
            <Card className="bg-card border-border">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-foreground">Danh sách người dùng</CardTitle>
                        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                            <DialogTrigger asChild>
                                <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Thêm người dùng
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="bg-card border-border">
                                <DialogHeader>
                                    <DialogTitle className="text-foreground">Thêm người dùng mới</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4 py-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Họ và tên</label>
                                        <Input placeholder="Nhập họ và tên" className="bg-background border-border text-foreground" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Email</label>
                                        <Input
                                            type="email"
                                            placeholder="Nhập email"
                                            className="bg-background border-border text-foreground"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Vai trò</label>
                                        <Select>
                                            <SelectTrigger className="bg-background border-border text-foreground">
                                                <SelectValue placeholder="Chọn vai trò" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-card border-border">
                                                <SelectItem value="student">Học viên</SelectItem>
                                                <SelectItem value="instructor">Giảng viên</SelectItem>
                                                <SelectItem value="admin">Quản trị viên</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium text-foreground">Mật khẩu</label>
                                        <Input
                                            type="password"
                                            placeholder="Nhập mật khẩu"
                                            className="bg-background border-border text-foreground"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3">
                                    <Button
                                        variant="outline"
                                        onClick={() => setIsAddDialogOpen(false)}
                                        className="border-border text-foreground"
                                    >
                                        Hủy
                                    </Button>
                                    <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Thêm</Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                    <div className="mt-4 space-y-4">
                        <div className="flex gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Tìm kiếm theo email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10 bg-background border-border text-foreground"
                                />
                            </div>
                            <Select value={statusFilter} onValueChange={(value) => {
                                setStatusFilter(value)
                                setCurrentPage(1)
                            }}>
                                <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                                    <SelectValue placeholder="Trạng thái" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                                    <SelectItem value="ACTIVE">Hoạt động</SelectItem>
                                    <SelectItem value="INACTIVE">Không hoạt động</SelectItem>
                                    <SelectItem value="BANNED">Bị cấm</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={roleFilter} onValueChange={(value) => {
                                setRoleFilter(value)
                                setCurrentPage(1)
                            }}>
                                <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
                                    <SelectValue placeholder="Vai trò" />
                                </SelectTrigger>
                                <SelectContent className="bg-card border-border">
                                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                                    <SelectItem value="1">Admin</SelectItem>
                                    <SelectItem value="2">Instructor</SelectItem>
                                    <SelectItem value="3">Student</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    {isLoading ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Đang tải...</div>
                        </div>
                    ) : error ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-destructive">Có lỗi xảy ra khi tải dữ liệu</div>
                        </div>
                    ) : users.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <div className="text-muted-foreground">Không tìm thấy người dùng</div>
                        </div>
                    ) : (
                        <>
                            <Table>
                                <TableHeader>
                                    <TableRow className="border-border hover:bg-muted/50">
                                        <SortableTableHeader
                                            title="ID"
                                            sortKey="id"
                                            currentSortBy={sortBy}
                                            currentSort={sortOrder}
                                            onSort={handleSort}
                                        />
                                        <SortableTableHeader
                                            title="Họ và tên"
                                            sortKey="name"
                                            currentSortBy={sortBy}
                                            currentSort={sortOrder}
                                            onSort={handleSort}
                                        />
                                        <SortableTableHeader
                                            title="Email"
                                            sortKey="email"
                                            currentSortBy={sortBy}
                                            currentSort={sortOrder}
                                            onSort={handleSort}
                                        />
                                        <TableHead className="text-muted-foreground">Vai trò</TableHead>
                                        <TableHead className="text-muted-foreground">Trạng thái</TableHead>
                                        <SortableTableHeader
                                            title="EXP"
                                            sortKey="exp"
                                            currentSortBy={sortBy}
                                            currentSort={sortOrder}
                                            onSort={handleSort}
                                        />
                                        <SortableTableHeader
                                            title="Ngày tạo"
                                            sortKey="createdAt"
                                            currentSortBy={sortBy}
                                            currentSort={sortOrder}
                                            onSort={handleSort}
                                        />
                                        <TableHead className="text-muted-foreground text-right">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user: IUser) => (
                                        <TableRow key={user.id} className="border-border hover:bg-muted/50">
                                            <TableCell className="text-muted-foreground">{user.id}</TableCell>
                                            <TableCell className="font-medium text-foreground">{user.name}</TableCell>
                                            <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                            <TableCell>
                                                <Badge className={getRoleBadgeColor(user.role.name)}>
                                                    {user.role.name}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusBadgeColor(user.status)}>
                                                    {getStatusLabel(user.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-muted-foreground">{user.exp}</TableCell>
                                            <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground">
                                                            <MoreVertical className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="bg-card border-border">
                                                        <DropdownMenuItem className="text-foreground hover:bg-muted cursor-pointer">
                                                            <Edit className="h-4 w-4 mr-2" />
                                                            Chỉnh sửa
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="text-destructive hover:bg-destructive/10 cursor-pointer">
                                                            <Trash2 className="h-4 w-4 mr-2" />
                                                            Xóa
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>

                            {/* Pagination */}
                            {pagination && pagination.totalPage > 0 && (
                                <div className="mt-4 pt-4 border-t border-border">
                                    <PaginationControls
                                        currentPage={pagination.current}
                                        totalPages={pagination.totalPage}
                                        totalItems={pagination.totalItem}
                                        itemsPerPage={pagination.pageSize}
                                        onPageChange={setCurrentPage}
                                        onItemsPerPageChange={(newSize) => {
                                            setPageSize(newSize)
                                            setCurrentPage(1)
                                        }}
                                        itemsPerPageOptions={[10, 15, 25, 50]}
                                        isLoading={isLoading}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}

export default UsersManagement
