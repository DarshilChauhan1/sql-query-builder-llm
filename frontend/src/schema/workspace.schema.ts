import z from "zod";

export const WorkspaceSchema = z.object({
    name: z.string().min(1, "Workspace name is required").max(50, "Name must be less than 50 characters"),
    description: z.string().optional(),
    databaseUrl: z.string().min(1, "Database URL is required").url("Must be a valid URL"),
    dbType: z.enum(['postgres', 'mysql', 'mongodb']),
});

export type CreateWorkSpaceSchema = z.infer<typeof WorkspaceSchema>;