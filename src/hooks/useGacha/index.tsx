import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { useSelector } from "react-redux";
import { selectCurrentLanguage } from "@redux/features/language/selector";
import gachaService from "@services/gacha";
import dashboardService from "@services/dashboard";
import { IGachaBannerEntity } from "@models/gacha/entity";
import { ICreateGachaItemListRequest, ICreateGachaRequest } from "@models/gacha/request";
import { IDashboardGachaStatsOverviewEntity, IDashboardGachaStatsDetailEntity } from "@models/dashboard/dashboard.entity";

/**
 * Handle Gacha Banner List
 * @param params 
 * @returns 
 */
export const useGachaBannerList = (params: { page?: number; limit?: number; startDate?: string; endDate?: string; status?: string[] }) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    return useQuery<any>({
        queryKey: ["gachaBanners", params, currentLanguage],
        queryFn: async () => {
            const response = await gachaService.getGachaList(params);
            return response.data;
        },
    });
};
//------------------------End------------------------//

/**
 * Handle Get Gacha Banner By ID
 * @param id 
 * @returns 
 */
export const useGachaBannerById = (id: number | null) => {
    const currentLanguage = useSelector(selectCurrentLanguage);
    return useQuery<{ data: IGachaBannerEntity }>({
        queryKey: ["gachaBanner", id, currentLanguage],
        queryFn: async () => {
            if (!id) throw new Error("Gacha banner ID is required");
            const response = await gachaService.getGachaBannerById(id);
            return response.data;
        },
        enabled: !!id,
    });
};
//------------------------End------------------------//

/**
 * Handle Get Prepare Pokemon List
 * @param gachaBannerId 
 * @returns 
 */
export const usePreparePokemonList = (gachaBannerId: number, params?: { rarity?: string[]; types?: number | number[]; nameEn?: string; currentPage?: number; pageSize?: number; page?: number }, enabled?: boolean) => {
    return useQuery<any>({
        queryKey: ["preparePokemonList", gachaBannerId, params],
        queryFn: async () => {
            const response = await gachaService.getPreparePokemonList(gachaBannerId, params);
            return response.data;
        },
        enabled: enabled !== false && !!gachaBannerId,
    });
};
//------------------------End------------------------//


/**
 * Handle Create Gacha Banner
 * @returns useMutation to create gacha banner
 */
export const useCreateGachaBanner = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (data: any) => {
            const response = await gachaService.createGacha(data);
            return response.data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["gachaBanners"] });
            toast.success(data?.message || t('configGacha.createSuccess'));
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || t('configGacha.createError'));
        },
    });
};
//-------------------End-------------------//


/**
 * Handle Update Gacha Banner
 */
export const useUpdateGachaBanner = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async ({ id, data }: { id: number; data: ICreateGachaRequest }) => {
            const response = await gachaService.updateGacha(id, data);
            return response.data;
        },
        onSuccess: (data: any, variables) => {
            toast.success(data?.message || t('common.success'));
            queryClient.invalidateQueries({ queryKey: ["gachaBanners"] });
            if (variables?.id) {
                queryClient.invalidateQueries({ queryKey: ["gachaBanner", variables.id] });
            }
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || t('common.error'));
        },
    });
};
//------------------------End------------------------//



//------------------------------------------------Gacha Item------------------------------------------------//
/**
 * Handle Delete Gacha Item
 * @returns useMutation to delete gacha item
 */
export const useDeleteGachaItem = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();

    return useMutation({
        mutationFn: async (gachaItemId: number) => {
            const response = await gachaService.deleteGachaItem(gachaItemId);
            return response.data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["gachaBanner"] });
            toast.success(data?.message || t('common.success'));
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || t('common.error'));
        },
    });
};
//------------------------End------------------------//


/**
 * Handle Create Gacha Item List
 * @returns useMutation to create gacha item list
 */
export const useCreateGachaItemList = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: async (data: ICreateGachaItemListRequest) => {
            const response = await gachaService.createGachaItemList(data);
            return response.data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["gachaBanner"] });
            toast.success(data?.message || t('common.success'));
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || t('common.error'));
        },
    });
};
//------------------------End------------------------//


/**
 * Handle Update Gacha Item List
 * @returns useMutation to update gacha item list
 */
export const useUpdateGachaItemList = () => {
    const queryClient = useQueryClient();
    const { t } = useTranslation();
    return useMutation({
        mutationFn: async (data: ICreateGachaItemListRequest) => {
            const response = await gachaService.updateGachaItemList(data);
            return response.data;
        },
        onSuccess: (data: any) => {
            queryClient.invalidateQueries({ queryKey: ["gachaBanner"] });
            toast.success(data?.message || t('common.success'));
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || t('common.error'));
        },
    });
};
//------------------------End------------------------//

//------------------------------------------------Dashboard------------------------------------------------//
/**
 * Handle Get Dashboard Gacha Stats Overview
 * @returns 
 */
export const useDashboardGachaStatsOverview = () => {
    return useQuery<{ data: IDashboardGachaStatsOverviewEntity }>({
        queryKey: ["dashboardGachaStatsOverview"],
        queryFn: async () => {
            const response = await dashboardService.getStatsGacha();
            return response.data;
        },
    });
};
//------------------------End------------------------//


/**
 * Handle Get Dashboard Gacha Stats Detail
 * @param gachaBannerId 
 * @returns 
 */
export const useDashboardGachaStatsDetail = (gachaBannerId: number) => {
    return useQuery<{ data: IDashboardGachaStatsDetailEntity }>({
        queryKey: ["dashboardGachaStatsDetail", gachaBannerId],
        queryFn: async () => {
            if (!gachaBannerId) throw new Error("Gacha banner ID is required");
            const response = await dashboardService.getGachaStatsGachaDetail(gachaBannerId);
            return response.data;
        },
        enabled: !!gachaBannerId,
    });
};
//------------------------End------------------------//

//------------------------------------------------End------------------------------------------------//
