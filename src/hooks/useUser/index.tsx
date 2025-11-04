import { IQueryRequest } from "@models/common/request";
import { ICreateUserRequest } from "@models/user/request";
import { selectCurrentLanguage } from "@redux/features/language/selector";
import userService from "@services/user";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import { toast } from "react-toastify";

/**
 * Handle User List
 * @param params IQueryRequest
 * @returns 
 */
export const useUserList = (params: IQueryRequest) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    const { data, isLoading, error } = useQuery({
        queryKey: ['user-list', params, currentLanguage],
        queryFn: () => userService.getUserList(params),
    });
    return { data: data?.data?.data, isLoading, error };
}
//----------------------End----------------------//


/**
 * Handle Create User
 */
export const useCreateUser = () => {
    const queryClient = useQueryClient();
    const createUserMutation = useMutation({
        mutationFn: (data: ICreateUserRequest) => userService.createUser(data),
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ['user-list'] });
            toast.success(data?.message || "Tạo người dùng thành công");
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Tạo người dùng thất bại");
        },
    });
    return createUserMutation;
}
//----------------------End----------------------//