import { IQueryRequest } from "@models/common/request";
import { selectCurrentLanguage } from "@redux/features/language/selector";
import userService from "@services/user";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";

/**
 * Handle User List
 * @param params IQueryRequest
 * @returns 
 */
//TODO: Làm khi rảnh
export const useUserList = (params: IQueryRequest) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const { data, isLoading, error } = useQuery({
        queryKey: ['user-list', params, currentLanguage],
        queryFn: () => userService.getUserList(params),
    });
    return { data: data?.data?.data, isLoading, error };
}
//----------------------End----------------------//