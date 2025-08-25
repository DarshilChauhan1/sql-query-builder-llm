import { z } from "zod";

export const AuthLoginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long')
});

export const AuthRegisterSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters long'),
    email: z.string().email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters long')
});

export type AuthLoginInput = z.infer<typeof AuthLoginSchema>;
export type AuthRegisterInput = z.infer<typeof AuthRegisterSchema>;