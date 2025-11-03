import z from "zod";
import { User } from "../entity";

/**
 * Pagination info
 */
export const PaginationInfo = z.object({
    current: z.number(),
    pageSize: z.number(),
    totalPage: z.number(),
    totalItem: z.number(),
});
export type IPaginationInfo = z.infer<typeof PaginationInfo>;

/**
 * User list response
 */
export const UserListResponse = z.object({
    statusCode: z.number(),
    message: z.string(),
    data: z.object({
        results: z.array(User),
        pagination: PaginationInfo,
    }),
});
export type IUserListResponse = z.infer<typeof UserListResponse>;

