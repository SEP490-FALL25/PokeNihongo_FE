
export const getStatusBadgeColor = (isActive: boolean) => {
    return isActive ? "bg-chart-4 text-white" : "bg-white border border-black text-foreground hover:bg-white hover:border-black hover:text-foreground"
}
