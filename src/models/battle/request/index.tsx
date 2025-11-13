import { BATTLE } from "@constants/battle";
import { TranslationRequest } from "@models/common/request";
import { z } from "zod";

/**
 * Create Battle Leader Board Season Request Schema
 */
export const CreateBattleLeaderBoardSeasonRequestSchema = z
    .object({
        status: z.enum(BATTLE.BATTLE_LIST_LEADER_BOARD_SEASON_STATUS),
        enablePrecreate: z.boolean(),
        precreateBeforeEndDays: z.number(),
        startDate: z.string().min(1, "tournaments.createSeason.errors.startDateRequired"),
        endDate: z.string().min(1, "tournaments.createSeason.errors.endDateRequired"),
        isRandomItemAgain: z.boolean(),
        nameTranslations: z.array(TranslationRequest),
    })
    .refine((data) => {
        if (!data.startDate || !data.endDate) return true
        const start = new Date(data.startDate).getTime()
        const end = new Date(data.endDate).getTime()
        return !Number.isNaN(start) && !Number.isNaN(end) && start <= end
    }, {
        path: ["endDate"],
        message: "tournaments.createSeason.errors.endDateAfterStart",
    })
    .superRefine((data, ctx) => {
        const ensureValue = (lang: "vi" | "en" | "ja", message: string) => {
            const index = data.nameTranslations.findIndex((item) => item.key === lang)
            if (index >= 0 && !data.nameTranslations[index].value.trim()) {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    message,
                    path: ["nameTranslations", index, "value"],
                })
            }
        }

        ensureValue("vi", "tournaments.createSeason.nameRequiredVi")
        ensureValue("en", "tournaments.createSeason.nameRequiredEn")
        ensureValue("ja", "tournaments.createSeason.nameRequiredJa")
    });

export type ICreateBattleLeaderBoardSeasonRequest = z.infer<typeof CreateBattleLeaderBoardSeasonRequestSchema>;
//---------------------End------------------------//