import { useState, useMemo, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@ui/Card"
import { Button } from "@ui/Button"
import { Input } from "@ui/Input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@ui/Table"
import { Badge } from "@ui/Badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select"
import { Search, Plus, Edit, Trash2, MoreVertical } from "lucide-react"
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
            <div className="mt-24 p-8">
                {/* Stats Cards */}
                <div className="grid gap-6 md:grid-cols-4 mb-8">
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{t('users.totalUsers')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {pagination?.totalItem || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{t('users.currentPage')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {pagination?.current || 0} / {pagination?.totalPage || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{t('users.resultsPerPage')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-foreground">
                                {pagination?.pageSize || 0}
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="bg-card border-border">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-muted-foreground">{t('users.displaying')}</CardTitle>
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
                            <CardTitle className="text-foreground">{t('users.listTitle')}</CardTitle>
                            <Button
                                className="bg-primary text-primary-foreground hover:bg-primary/90"
                                onClick={() => setIsAddDialogOpen(true)}
                            >
                                <Plus className="h-4 w-4 mr-2" />
                                {t('users.addUser')}
                            </Button>
                        </div>
                        <div className="mt-4 space-y-4">
                            <div className="flex gap-4">
                                <div className="flex-1 relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        placeholder={t('users.searchPlaceholder')}
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
                                    <SelectTrigger className="w-[180px] bg-background border-border text-foreground">
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
                            <div className="flex items-center justify-center py-8">
                                <div className="text-muted-foreground">{t('users.loading')}</div>
                            </div>
                        ) : error ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-destructive">{t('users.error')}</div>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="flex items-center justify-center py-8">
                                <div className="text-muted-foreground">{t('users.noUsers')}</div>
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
                                                                {t('users.edit')}
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="text-destructive hover:bg-destructive/10 cursor-pointer">
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

            {/* Add User Modal */}
            <AddUserModal
                isAddDialogOpen={isAddDialogOpen}
                setIsAddDialogOpen={setIsAddDialogOpen}
            />
        </>
    )
}

export default UsersManagement
