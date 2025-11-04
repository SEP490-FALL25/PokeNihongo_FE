export const getStatusLabel = (isActive: boolean, t?: (key: string, options?: any) => string) => {
    if (t) {
        return isActive
            ? t('aiCommon.active', { defaultValue: 'Hoạt động' })
            : t('aiCommon.inactive', { defaultValue: 'Không hoạt động' })
    }
    return isActive ? 'Hoạt động' : 'Không hoạt động'
}
