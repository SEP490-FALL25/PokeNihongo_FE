import { at, byUser } from "@models/common/response";
import z from "zod";

/**
 * Permission Entity Schema
 */
export const RoleEntitySchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    isActive: z.boolean(),
    ...byUser,
    ...at,
});

export type IRoleEntity = z.infer<typeof RoleEntitySchema>;
//----------------------End----------------------//


/**
 * Permission Entity Schema
 */
export const PermissionEntitySchema = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string(),
    module: z.string(),
    path: z.string(),
    method: z.string(),
    ...byUser,
    ...at,
});

export type IPermissionEntity = z.infer<typeof PermissionEntitySchema>;
//----------------------End----------------------//