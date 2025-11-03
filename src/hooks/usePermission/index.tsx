import { IQueryRequest } from "@models/common/request";
import permissionService from "@services/permission";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectCurrentLanguage } from "@redux/features/language/selector";
import { IUpdateRoleRequest } from "@models/permission/request";
import { toast } from "react-toastify";

/**
 * Handle Role List
 * @param params 
 * @returns 
 */
export const useRoleList = (params: IQueryRequest) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const { data, isLoading, error } = useQuery({
        queryKey: ['role-list', params, currentLanguage],
        queryFn: () => permissionService.getRoleList(params),
    });
    return { data: data?.data?.data, isLoading, error };
};
//----------------------End----------------------//


/**
 * Handle Permission List
 * @param roleId 
 * @param params 
 * @returns 
 */
export const usePermissionList = (roleId: number, params: IQueryRequest) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const { data, isLoading, error } = useQuery({
        queryKey: ['permission-list', roleId, params, currentLanguage],
        queryFn: () => permissionService.getPermissionByRoleId(roleId, params),
    });
    return { data: data?.data?.data.permissions, isLoading, error };
};
//----------------------End----------------------//


/**
 * Handle Update Permission By Role ID
 * @param roleId 
 * @returns 
 */
export const useUpdatePermissionByRoleId = (roleId: number) => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: IUpdateRoleRequest) => permissionService.updateForRole(roleId, data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['permission-list', roleId] });
            toast.success(data?.message || "Permissions updated successfully!");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "An error occurred while updating permissions.");
        },
    });
};
//----------------------End----------------------//