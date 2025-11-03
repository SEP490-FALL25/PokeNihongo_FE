import { z } from "zod";

import { PaginationMetaSchema, PaginationResponseSchema } from "@models/common/response";
import { PermissionEntitySchema, RoleEntitySchema } from "../entity";


/**
 * Role Response Schema
 */
export const RoleResponseSchema = PaginationResponseSchema.extend({
    results: z.array(RoleEntitySchema),
});

export type IRoleResponse = z.infer<typeof RoleResponseSchema>;
//----------------------End----------------------//


/**
 * Permission Response Schema
 */
export const PermissionResponseSchema = z.object({
    statusCode: z.number().default(200),
    message: z.string(),
    data: z.object({
        permissions: z.object({
            results: z.array(PermissionEntitySchema),
            pagination: PaginationMetaSchema,
        }),
    }),
});

export type IPermissionResponse = z.infer<typeof PermissionResponseSchema>;
//----------------------End----------------------//


