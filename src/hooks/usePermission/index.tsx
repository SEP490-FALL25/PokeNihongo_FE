import { IQueryRequest } from "@models/common/request";
import permissionService from "@services/permission";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { selectCurrentLanguage } from "@redux/features/language/selector";

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
    return { data: data?.data?.data, isLoading, error };
};
//----------------------End----------------------//