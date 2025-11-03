import z from "zod";

/**
 * Role entity
 */
export const Role = z.object({
    id: z.number(),
    name: z.string(),
    description: z.string().nullable(),
    isActive: z.boolean(),
    deletedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
});
export type IRole = z.infer<typeof Role>;

/**
 * Level entity
 */
export const Level = z.object({
    id: z.number(),
    name: z.string(),
    minExp: z.number(),
    maxExp: z.number(),
}).nullable();
export type ILevel = z.infer<typeof Level>;

/**
 * User entity
 */
export const User = z.object({
    id: z.number(),
    email: z.string(),
    name: z.string(),
    phoneNumber: z.string().nullable(),
    avatar: z.string().nullable(),
    exp: z.number(),
    eloscore: z.number(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'BANNED']),
    levelId: z.number().nullable(),
    roleId: z.number(),
    createdById: z.number().nullable(),
    updatedById: z.number().nullable(),
    deletedById: z.number().nullable(),
    deletedAt: z.string().nullable(),
    createdAt: z.string(),
    updatedAt: z.string(),
    role: Role,
    level: Level.nullable(),
});
export type IUser = z.infer<typeof User>;

