/**
 * Format date to day/month/year
 * @param dateStr 
 * @returns day/month/year
 */
export const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = String(date.getUTCDate()).padStart(2, "0");
    const month = date.toLocaleString("en-US", { month: "2-digit" });
    const year = date.getUTCFullYear();
    return `${day}/${month}/${year} `;
};


export const formatDateTime = (dateString?: string | null) => {
    if (!dateString) return "—"
    try {
        const date = new Date(dateString)
        return date.toLocaleString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
        })
    } catch (error) {
        return dateString || "—"
    }
}

export const formatDateOnly = (dateString?: string | null) => {
    if (!dateString) return "—"
    try {
        const date = new Date(dateString)
        return date.toLocaleDateString("vi-VN", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        })
    } catch (error) {
        return dateString || "—"
    }
}