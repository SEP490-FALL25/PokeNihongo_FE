
import { BATTLE } from "@constants/battle"

type StatusStyle = {
    colorClass: string
    label: string
}

export type StatusStyleConfig = Record<string, StatusStyle>

const DEFAULT_COLOR_CLASS = "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-600 border-gray-500/40 shadow-sm"
const DEFAULT_LABEL = "Không xác định"

export const BATTLE_STATUS_CONFIG: StatusStyleConfig = {
    [BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.ACTIVE]: {
        colorClass: "bg-gradient-to-r from-green-500/20 to-emerald-500/20 text-green-600 border-green-500/40 shadow-sm",
        label: "Đang diễn ra",
    },
    [BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.PREVIEW]: {
        colorClass: "bg-gradient-to-r from-blue-500/20 to-cyan-500/20 text-blue-600 border-blue-500/40 shadow-sm",
        label: "Xem trước",
    },
    [BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.EXPIRED]: {
        colorClass: "bg-gradient-to-r from-gray-500/20 to-slate-500/20 text-gray-600 border-gray-500/40 shadow-sm",
        label: "Đã kết thúc",
    },
    [BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS.INACTIVE]: {
        colorClass: "bg-gradient-to-r from-red-500/20 to-rose-500/20 text-red-600 border-red-500/40 shadow-sm",
        label: "Không hoạt động",
    },
    DEFAULT: {
        colorClass: DEFAULT_COLOR_CLASS,
        label: DEFAULT_LABEL,
    },
}

export const getStatusBadgeColor = (
    statusOrActive: string | boolean,
    config: StatusStyleConfig = BATTLE_STATUS_CONFIG
) => {
    if (typeof statusOrActive === "boolean") {
        return statusOrActive
            ? "bg-chart-4 text-white"
            : "bg-white border border-black text-foreground hover:bg-white hover:border-black hover:text-foreground"
    }

    return config[statusOrActive]?.colorClass ?? config.DEFAULT?.colorClass ?? DEFAULT_COLOR_CLASS
}

export const getStatusText = (status: string, config: StatusStyleConfig = BATTLE_STATUS_CONFIG) => {
    return config[status]?.label ?? config.DEFAULT?.label ?? status
}
