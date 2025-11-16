import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Button } from "@ui/Button"
import { Input } from "@ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/Table"
import { Badge } from "@ui/Badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Search, Plus, Edit, Trash2, MoreVertical, Users as UsersIcon, UserCheck, UserX, UserCog, Loader2 } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@ui/DropdownMenu"
import HeaderAdmin from "@organisms/Header/Admin"
import { useUserList } from "@hooks/useUser"
import { IUser } from "@models/user/entity"
import PaginationControls from "@ui/PaginationControls"
import SortableTableHeader from "@ui/SortableTableHeader"
import AddUserModal from "./components/AddUserModal"
import { useTranslation } from "react-i18next"

const UsersManagement = () => {
    const { t } = useTranslation()

    const [searchQuery, setSearchQuery] = useState("")
    const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState<boolean>(false)
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
        return t(`users.statuses.${status}`, { defaultValue: status })
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString("vi-VN")
    }

    return (
        <>
            {/* Header */}
            <HeaderAdmin title={t('users.title')} description={t('users.description')} />
            <div className="mt-24 p-8 space-y-8">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4">
                    <Card className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('users.totalUsers')}</CardTitle>
                                <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                    <UsersIcon className="w-5 h-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">
                                {pagination?.totalItem || 0}
                            </div>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('users.currentPage')}</CardTitle>
                                <div className="p-2 bg-green-500/10 rounded-lg text-green-500">
                                    <UserCheck className="w-5 h-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">
                                {pagination?.current || 0} / {pagination?.totalPage || 0}
                            </div>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('users.resultsPerPage')}</CardTitle>
                                <div className="p-2 bg-purple-500/10 rounded-lg text-purple-500">
                                    <UserCog className="w-5 h-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">
                                {pagination?.pageSize || 0}
                            </div>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                    <Card className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-amber-500/10 border-yellow-500/20 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full -mr-16 -mt-16" />
                        <CardHeader className="pb-3 relative">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-sm font-semibold text-foreground/90">{t('users.displaying')}</CardTitle>
                                <div className="p-2 bg-yellow-500/10 rounded-lg text-yellow-500">
                                    <UserX className="w-5 h-5" />
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="relative">
                            <div className="text-4xl font-bold text-foreground mb-1">
                                {users.length}
                            </div>
                            <div className="h-1 w-16 bg-gradient-to-r from-transparent via-current to-transparent opacity-20 mt-2" />
                        </CardContent>
                    </Card>
                </div>

                {/* Users Table */}
                <Card className="bg-gradient-to-br from-card via-card to-card/95 border-border shadow-md">
                    <CardHeader className="pb-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 rounded-lg">
                                    <UsersIcon className="w-5 h-5 text-primary" />
                                </div>
                                <CardTitle className="text-xl font-bold text-foreground">{t('users.listTitle')}</CardTitle>
                            </div>
                            <Button
                                className="bg-gradient-to-r from-primary to-primary/80 text-primary-foreground hover:from-primary/90 hover:to-primary/70 shadow-lg"
                                onClick={() => setIsAddDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {t('users.addUser')}
                            </Button>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div className="flex flex-col sm:flex-row gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                                    <Input
                                        placeholder={t('users.searchPlaceholder')}
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-background border-border text-foreground h-11 shadow-sm focus:shadow-md transition-shadow"
                                    />
                                </div>
                                <Select value={statusFilter} onValueChange={(value) => {
                                    setStatusFilter(value)
                                    setCurrentPage(1)
                                }}>
                                    <SelectTrigger className="w-[180px] bg-background border-border text-foreground h-11 shadow-sm">
                                        <SelectValue placeholder={t('users.status')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="all">{t('users.allStatuses')}</SelectItem>
                                        <SelectItem value="ACTIVE">{t('users.statuses.ACTIVE')}</SelectItem>
                                        <SelectItem value="INACTIVE">{t('users.statuses.INACTIVE')}</SelectItem>
                                        <SelectItem value="BANNED">{t('users.statuses.BANNED')}</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={roleFilter} onValueChange={(value) => {
                                    setRoleFilter(value)
                                    setCurrentPage(1)
                                }}>
                                    <SelectTrigger className="w-[180px] bg-background border-border text-foreground h-11 shadow-sm">
                                        <SelectValue placeholder={t('users.role')} />
                                    </SelectTrigger>
                                    <SelectContent className="bg-card border-border">
                                        <SelectItem value="all">{t('users.allRoles')}</SelectItem>
                                        <SelectItem value="1">{t('users.roles.admin')}</SelectItem>
                                        <SelectItem value="2">{t('users.roles.instructor')}</SelectItem>
                                        <SelectItem value="3">{t('users.roles.student')}</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <Loader2 className="w-8 h-8 animate-spin text-primary mb-4" />
                                <p className="text-muted-foreground">{t('users.loading')}</p>
                            </div>
                        ) : error ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="p-3 bg-destructive/10 rounded-full mb-4">
                                    <UserX className="w-8 h-8 text-destructive" />
                                </div>
                                <p className="text-destructive font-medium">{t('users.error')}</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12">
                                <div className="p-3 bg-muted rounded-full mb-4">
                                    <UsersIcon className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <p className="text-muted-foreground font-medium">{t('users.noUsers')}</p>
                            </div>
                        ) : (
                            <>
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-border hover:bg-muted/50">
                                            <SortableTableHeader
                                                title={t('users.table.id')}
                                                sortKey="id"
                                                currentSortBy={sortBy}
                                                currentSort={sortOrder}
                                                onSort={handleSort}
                                            />
                                            <SortableTableHeader
                                                title={t('users.table.fullName')}
                                                sortKey="name"
                                                currentSortBy={sortBy}
                                                currentSort={sortOrder}
                                                onSort={handleSort}
                                            />
                                            <SortableTableHeader
                                                title={t('users.table.email')}
                                                sortKey="email"
                                                currentSortBy={sortBy}
                                                currentSort={sortOrder}
                                                onSort={handleSort}
                                            />
                                            <TableHead className="text-muted-foreground">{t('users.role')}</TableHead>
                                            <TableHead className="text-muted-foreground">{t('users.status')}</TableHead>
                                            <SortableTableHeader
                                                title={t('users.table.exp')}
                                                sortKey="exp"
                                                currentSortBy={sortBy}
                                                currentSort={sortOrder}
                                                onSort={handleSort}
                                            />
                                            <SortableTableHeader
                                                title={t('users.table.createdAt')}
                                                sortKey="createdAt"
                                                currentSortBy={sortBy}
                                                currentSort={sortOrder}
                                                onSort={handleSort}
                                            />
                                            <TableHead className="text-muted-foreground text-right">{t('common.actions')}</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {users.map((user: IUser) => (
                                            <TableRow key={user.id} className="border-border hover:bg-muted/30 transition-colors group">
                                                <TableCell className="text-muted-foreground font-medium">{user.id}</TableCell>
                                                <TableCell className="font-semibold text-foreground">{user.name}</TableCell>
                                                <TableCell className="text-muted-foreground">{user.email}</TableCell>
                                                <TableCell>
                                                    <Badge className={`${getRoleBadgeColor(user.role.name)} shadow-sm font-medium`}>
                                                        {user.role.name}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={`${getStatusBadgeColor(user.status)} shadow-sm font-medium`}>
                                                        {getStatusLabel(user.status)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-muted-foreground font-medium">{user.exp}</TableCell>
                                                <TableCell className="text-muted-foreground">{formatDate(user.createdAt)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-all">
                                                                <MoreVertical className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="bg-card border-border shadow-lg">
                                                            <DropdownMenuItem className="text-foreground hover:bg-primary/10 cursor-pointer transition-colors">
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                {t('users.edit')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive hover:bg-destructive/10 cursor-pointer transition-colors">
                                                                <Trash2 className="h-4 w-4 mr-2" />
                                                                {t('users.delete')}
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
                                    <Card className="bg-card border-border shadow-md mt-4">
                                        <CardContent className="pt-4">
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
                                        </CardContent>
                                    </Card>
                                )}
                            </>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Add User Modal */}
            <AddUserModal
                isAddDialogOpen={isAddDialogOpen}
                setIsAddDialogOpen={setIsAddDialogOpen}
            />
        </>
    )
}

export default UsersManagement
