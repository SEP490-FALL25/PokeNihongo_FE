import { useMemo, useState, useEffect } from "react";
import { usePermissionList, useRoleList, useUpdatePermissionByRoleId } from "@hooks/usePermission";
import { IQueryRequest } from "@models/common/request";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@ui/Card";
import { Input } from "@ui/Input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@ui/Select";
import PaginationControls from "@ui/PaginationControls";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@ui/Accordion";
import { useDebounce } from "@hooks/useDebounce";
import { Badge } from "@ui/Badge";
import { Skeleton } from "@ui/Skeleton";
import { Switch } from "@ui/Switch";
import { Button } from "@ui/Button";
import { IPermissionEntity as IPermission } from "@models/permission/entity";
import HeaderAdmin from "@organisms/Header/Admin";
import { useTranslation } from "react-i18next";

const PermissionManagement = () => {
    const { t } = useTranslation();
    /**
     * Role List
     */
    const [roleId, setRoleId] = useState<number>(1);
    const [roleParams] = useState<IQueryRequest>({ page: 1, limit: 100, sortBy: 'name' });
    const { data: roleData, isLoading: roleLoading } = useRoleList(roleParams);
    const safeRoleId = useMemo(() => (roleId ?? (roleData?.results?.[0]?.id ?? null)), [roleId, roleData]);
    //-----------------------End--------------------//


    /**
     * Permission List - Query Params (FE filter)
     */
    const [permParams, setPermParams] = useState<IQueryRequest>({ page: 1, limit: 15, sortBy: 'module' });
    const [moduleSearch, setModuleSearch] = useState<string>("");
    const [pathSearch, setPathSearch] = useState<string>("");
    const debouncedModule = useDebounce(moduleSearch, 400);
    const debouncedPath = useDebounce(pathSearch, 400);


    const permQueryParams = useMemo(() => ({ sortBy: 'module' } as IQueryRequest), []);

    const { data: permData, isLoading: permLoading } = usePermissionList(safeRoleId || 0, permQueryParams);

    const permissionsList = useMemo(() => {
        if (Array.isArray(permData)) return permData as IPermission[];
        if (permData && Array.isArray((permData as any).permissions)) return (permData as any).permissions as IPermission[];
        if (permData && Array.isArray((permData as any).results)) return (permData as any).results as IPermission[];
        return [] as IPermission[];
    }, [permData]);

    // FE filtering
    const filteredPermissions = useMemo(() => {
        const moduleKey = (debouncedModule || '').toLowerCase().trim();
        const pathKey = (debouncedPath || '').replace(/^\/+/, '').toLowerCase().trim();
        return permissionsList.filter((p: IPermission) => {
            const modOk = moduleKey ? (p.module || '').toLowerCase().includes(moduleKey) : true;
            const pathOk = pathKey ? (p.path || '').toLowerCase().includes(pathKey) : true;
            return modOk && pathOk;
        });
    }, [permissionsList, debouncedModule, debouncedPath]);
    //-----------------------End--------------------//



    /**
     * Selection UI State
     */
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [expandedModules, setExpandedModules] = useState<string[]>([]);
    //-----------------------End--------------------//

    useEffect(() => {
        if (permissionsList.length) {
            const hasPermissionIds = new Set<number>(
                permissionsList.filter((p: IPermission) => p.hasPermission).map((p: IPermission) => p.id)
            );
            setSelectedIds(hasPermissionIds);
        }
    }, [permissionsList]);


    const groupedByModule = useMemo(() => {
        const groups: Record<string, IPermission[]> = {};
        filteredPermissions.forEach((p: IPermission) => {
            const key = p.module || 'Unknown';
            if (!groups[key]) groups[key] = [];
            groups[key].push(p);
        });
        return groups;
    }, [filteredPermissions]);

    const moduleKeys = useMemo(() => Object.keys(groupedByModule), [groupedByModule]);

    // FE pagination by modules
    const paginatedModuleKeys = useMemo(() => {
        const page = permParams.page ?? 1;
        const limit = permParams.limit ?? 20;
        const start = (page - 1) * limit;
        const end = start + limit;
        return moduleKeys.slice(start, end);
    }, [moduleKeys, permParams.page, permParams.limit]);

    const allIdsOnPage = useMemo(() => {
        const ids: number[] = [];
        paginatedModuleKeys.forEach((mk) => {
            (groupedByModule[mk] || []).forEach((p) => ids.push(p.id));
        });
        return ids;
    }, [paginatedModuleKeys, groupedByModule]);

    const isAllSelectedOnPage = allIdsOnPage.length > 0 && allIdsOnPage.every((id: number) => selectedIds.has(id));

    const toggleSelectAllOnPage = (checked: boolean) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            allIdsOnPage.forEach((id: number) => checked ? next.add(id) : next.delete(id));
            return next;
        });
    };

    const toggleSelectModule = (moduleName: string, checked: boolean) => {
        const ids = (groupedByModule[moduleName] || []).map((p: IPermission) => p.id);
        setSelectedIds(prev => {
            const next = new Set(prev);
            ids.forEach(id => checked ? next.add(id) : next.delete(id));
            return next;
        });
    };
    const toggleSelectOne = (id: number, checked: boolean) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (checked) next.add(id); else next.delete(id);
            return next;
        });
    };

    const isDirty = useMemo(() => {
        return selectedIds.size > 0;
    }, [selectedIds]);


    const methodBadgeClass = (method: string) => {
        const m = (method || '').toUpperCase();
        switch (m) {
            case 'GET':
                return 'bg-emerald-500 text-white';
            case 'POST':
                return 'bg-blue-500 text-white';
            case 'PUT':
            case 'PATCH':
                return 'bg-amber-500 text-white';
            case 'DELETE':
                return 'bg-rose-500 text-white';
            default:
                return 'bg-gray-300 text-gray-900';
        }
    };

    /**
     * Handle Select Role Change
     */
    const handleSelectRole = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const id = Number(e.target.value);
        setRoleId(Number.isNaN(id) ? 1 : id);
    };
    //-----------------------End--------------------//


    /**
     * Handle Save Update Permissions
     */
    const { mutate: updatePermissions, isPending: isUpdating } = useUpdatePermissionByRoleId(safeRoleId ?? 0);
    const handleSave = () => {
        updatePermissions({ name: roleData?.results?.find((r: any) => r.id === safeRoleId)?.name || '', description: roleData?.results?.find((r: any) => r.id === safeRoleId)?.description || '', isActive: true, permissionIds: Array.from(selectedIds) });
    };
    //-----------------------End--------------------//

    return (
        <>
            <HeaderAdmin
                title={t('permission.title')}
                description={t('permission.description')}
            />
            <div className="mt-24 min-h-screen bg-gray-50">
                <div className="max-w-[1600px] mx-auto p-3 md:p-4 lg:p-6 space-y-4">

                    {/* Filters Card */}
                    <Card className="shadow-lg border-gray-200 overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 py-3">
                            <div className="flex items-center gap-1.5">
                                <span className="text-base">⚙️</span>
                                <div>
                                    <CardTitle className="text-base font-bold text-gray-900">{t('permission.config.title')}</CardTitle>
                                    <p className="text-xs text-gray-600 mt-0.5">
                                        {t('permission.config.subtitle')}
                                    </p>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="pt-4 pb-4">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                        <span className="text-sm">👤</span>
                                        {t('permission.config.selectRole')}
                                    </label>
                                    <Select onValueChange={(val) => handleSelectRole({ target: { value: val } } as any)} disabled={roleLoading} value={String(safeRoleId)}>
                                        <SelectTrigger className="h-9 border border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow bg-white text-sm">
                                            <SelectValue placeholder={t('permission.config.selectRolePlaceholder')} />
                                        </SelectTrigger>
                                        <SelectContent className="border-gray-200 bg-white">
                                            {roleData?.results?.map((r: any) => (
                                                <SelectItem key={r.id} value={String(r.id)} className="cursor-pointer text-sm">
                                                    <div className="flex items-center gap-1.5">
                                                        <div className="h-1.5 w-1.5 rounded-full bg-gradient-to-r from-blue-500 to-indigo-500"></div>
                                                        <span className="font-medium">{r.name}</span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                        <span className="text-sm">📦</span>
                                        {t('permission.config.filterByModule')}
                                    </label>
                                    <Input
                                        placeholder={t('permission.config.filterByModulePlaceholder')}
                                        value={moduleSearch}
                                        onChange={(e) => setModuleSearch(e.target.value)}
                                        className="h-9 border border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow focus-visible:border-blue-500 bg-white text-sm"
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                                        <span className="text-sm">🔗</span>
                                        {t('permission.config.filterByPath')}
                                    </label>
                                    <Input
                                        placeholder={t('permission.config.filterByPathPlaceholder')}
                                        value={pathSearch}
                                        onChange={(e) => setPathSearch(e.target.value)}
                                        className="h-9 border border-gray-200 hover:border-blue-400 transition-all duration-200 shadow-sm hover:shadow focus-visible:border-blue-500 bg-white text-sm"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Permissions Card */}
                    <Card className="shadow-lg border-gray-200 overflow-hidden bg-white">
                        <CardHeader className="border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50 py-3">
                            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-1.5">
                                        <span className="text-lg">✨</span>
                                        <CardTitle className="text-base font-bold text-gray-900">
                                            {t('permission.matrix.title')}
                                        </CardTitle>
                                    </div>
                                    <p className="text-xs text-gray-600">
                                        {t('permission.matrix.description')}
                                    </p>
                                    {selectedIds.size > 0 && (
                                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 border border-blue-200 rounded-lg">
                                            <span className="relative flex h-2 w-2">
                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-500 opacity-75"></span>
                                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600"></span>
                                            </span>
                                            <span className="text-xs font-bold text-blue-700">
                                                {selectedIds.size} {t('permission.matrix.selected')}
                                            </span>
                                        </div>
                                    )}
                                </div>
                                {isDirty && (
                                    <Button
                                        onClick={handleSave}
                                        disabled={isUpdating}
                                        size="sm"
                                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-md hover:shadow-lg transition-all duration-200 font-bold h-9 px-6 text-sm"
                                    >
                                        {isUpdating ? (
                                            <>
                                                <span className="animate-spin mr-1.5 text-sm">⏳</span>
                                                {t('permission.matrix.saving')}
                                            </>
                                        ) : (
                                            <>
                                                <span className="mr-1.5 text-sm">💾</span>
                                                {t('permission.matrix.saveChanges')}
                                            </>
                                        )}
                                    </Button>
                                )}
                            </div>

                            {/* Quick Actions */}
                            <div className="flex flex-wrap items-center gap-3 mt-3 pt-3 border-t border-gray-200">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm">
                                    <Switch
                                        id="select-all-page"
                                        checked={isAllSelectedOnPage}
                                        onCheckedChange={toggleSelectAllOnPage}
                                    />
                                    <label htmlFor="select-all-page" className="text-xs font-bold cursor-pointer hover:text-blue-600 transition-colors select-none text-gray-700">
                                        {t('permission.matrix.selectAll')}
                                    </label>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white border border-gray-200 hover:border-blue-300 transition-all duration-200 shadow-sm">
                                    <Switch
                                        id="expand-all"
                                        checked={expandedModules.length === paginatedModuleKeys.length && paginatedModuleKeys.length > 0}
                                        onCheckedChange={(val) => setExpandedModules(val ? paginatedModuleKeys : [])}
                                    />
                                    <label htmlFor="expand-all" className="text-xs font-bold cursor-pointer hover:text-blue-600 transition-colors select-none text-gray-700">
                                        {t('permission.matrix.expandAll')}
                                    </label>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-4 bg-gray-50">
                            {permLoading ? (
                                <div className="space-y-3">
                                    {Array.from({ length: 3 }).map((_, i) => (
                                        <div key={i} className="rounded-xl border border-gray-200 p-4 bg-white animate-pulse">
                                            <div className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Skeleton className="h-10 w-10 rounded-lg bg-gray-200" />
                                                    <div className="space-y-1.5">
                                                        <Skeleton className="h-4 w-24 bg-gray-200" />
                                                        <Skeleton className="h-3 w-16 bg-gray-200" />
                                                    </div>
                                                </div>
                                                <Skeleton className="h-8 w-12 rounded-full bg-gray-200" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <Accordion type="multiple" value={expandedModules} onValueChange={setExpandedModules} className="w-full space-y-3">
                                    {paginatedModuleKeys.map((moduleName) => {
                                        const items = groupedByModule[moduleName];
                                        const isAllSelectedInModule = items.every((p: IPermission) => selectedIds.has(p.id));

                                        return (
                                            <AccordionItem
                                                key={moduleName}
                                                value={moduleName}
                                                className="border border-gray-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-300 bg-white"
                                            >
                                                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-blue-50 [&[data-state=open]]:bg-gradient-to-r [&[data-state=open]]:from-blue-50 [&[data-state=open]]:to-indigo-50 transition-all duration-200">
                                                    <div className="flex items-center gap-3 flex-1">
                                                        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                                                            <span className="text-lg font-black text-white">{moduleName.charAt(0)}</span>
                                                        </div>
                                                        <div className="text-left">
                                                            <span className="font-bold text-sm text-gray-900 block">{moduleName}</span>
                                                            <span className="text-[10px] font-semibold text-gray-500">
                                                                {items.length} {items.length !== 1 ? t('permission.matrix.permissions') : t('permission.matrix.permission')}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="ml-auto flex items-center gap-2 pr-1">
                                                        <label htmlFor={`select-module-${moduleName}`} className="text-xs font-bold text-gray-600 cursor-pointer hover:text-blue-600 transition-colors select-none">
                                                            {t('permission.matrix.enableAll')}
                                                        </label>
                                                        <Switch
                                                            id={`select-module-${moduleName}`}
                                                            checked={isAllSelectedInModule}
                                                            onCheckedChange={(val) => toggleSelectModule(moduleName, val)}
                                                            onClick={(e) => e.stopPropagation()}
                                                        />
                                                    </div>
                                                </AccordionTrigger>
                                                <AccordionContent className="px-4 py-3 border-t border-gray-200 bg-gray-50">
                                                    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
                                                        {items.map((p: IPermission) => (
                                                            <div
                                                                key={p.id}
                                                                className="group rounded-lg border border-gray-200 p-3 hover:shadow-lg hover:border-blue-400 transition-all duration-200 bg-white"
                                                            >
                                                                <div className="flex items-start gap-2">
                                                                    <div className="pt-0.5">
                                                                        <Switch
                                                                            id={`perm-${p.id}`}
                                                                            checked={selectedIds.has(p.id)}
                                                                            onCheckedChange={(val) => toggleSelectOne(p.id, val)}
                                                                        />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0 space-y-1.5">
                                                                        <label
                                                                            htmlFor={`perm-${p.id}`}
                                                                            className="font-bold cursor-pointer text-xs text-gray-900 block group-hover:text-blue-600 transition-colors leading-tight"
                                                                        >
                                                                            {p.name}
                                                                        </label>
                                                                        <div className="flex flex-col gap-1">
                                                                            <Badge className={`${methodBadgeClass(p.method)} w-fit text-[9px] font-black px-2 py-0.5`}>
                                                                                {(p.method || '').toUpperCase()}
                                                                            </Badge>
                                                                            <span className="text-[10px] text-gray-600 font-mono break-all leading-relaxed bg-gray-100 px-1.5 py-0.5 rounded">
                                                                                {p.path}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </AccordionContent>
                                            </AccordionItem>
                                        );
                                    })}
                                    {!moduleKeys.length && (
                                        <div className="text-center py-12 px-6 bg-white rounded-xl border border-dashed border-gray-300">
                                            <div className="text-5xl mb-3 animate-bounce">🔍</div>
                                            <h3 className="font-bold text-base mb-2 text-gray-900">{t('permission.matrix.noPermissionsFound')}</h3>
                                            <p className="text-xs text-gray-600 max-w-md mx-auto">
                                                {t('permission.matrix.noPermissionsMatch')}
                                            </p>
                                        </div>
                                    )}
                                </Accordion>
                            )}
                        </CardContent>
                        <CardFooter className="border-t border-gray-200 bg-white py-3 pt-3">
                            <PaginationControls
                                currentPage={permParams.page ?? 1}
                                totalPages={Math.max(1, Math.ceil(moduleKeys.length / (permParams.limit ?? 20)))}
                                totalItems={moduleKeys.length}
                                itemsPerPage={permParams.limit ?? 20}
                                onPageChange={(pageNum) => setPermParams((prev) => ({ ...prev, page: pageNum }))}
                                onItemsPerPageChange={(size) => setPermParams((prev) => ({ ...prev, limit: size, page: 1 }))}
                                isLoading={permLoading}
                            />
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </>
    );
};

export default PermissionManagement;


