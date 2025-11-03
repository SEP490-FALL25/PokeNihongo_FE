import { ROLE } from "@constants/common";
import z from "zod";

/**
 * Update Role Request Schema
 */
export const UpdateRoleRequestSchema = z.object({
    name: z.enum(ROLE),
    description: z.string(),
    isActive: z.boolean(),
    permissionIds: z.array(z.number()),
});

export type IUpdateRoleRequest = z.infer<typeof UpdateRoleRequestSchema>;
//------------------------End------------------------//