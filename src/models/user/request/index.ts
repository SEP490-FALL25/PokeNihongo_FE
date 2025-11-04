import z from "zod";


/**
 * Login form data request
 */
export const LoginFormDataRequest = z.object({
    email: z.string().email(),
    password: z.string().min(6),
});
export type ILoginFormDataRequest = z.infer<typeof LoginFormDataRequest>;
//-----------------End-Login-Request-----------------//


/**
 * Create User Request
 */
export const CreateUserRequest = z.object({
    email: z.string().email(),
    name: z.string(),
    password: z.string().min(6).optional(),
    roleId: z.number(),
});
export type ICreateUserRequest = z.infer<typeof CreateUserRequest>;
//----------------------End----------------------//