import { z } from "zod"

// Base schemas for common fields
export const emailSchema = z.string().email("Please enter a valid email address")
export const passwordSchema = z.string().min(8, "Password must be at least 8 characters")
export const nameSchema = z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters")
export const urlSchema = z.string().url("Please enter a valid URL").optional().or(z.literal(""))
export const doiSchema = z.string().regex(/^10\.\d{4,}\/\S+$/, "Please enter a valid DOI").optional().or(z.literal(""))

// User Authentication Schemas
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required")
})

export const registerSchema = z.object({
  name: nameSchema,
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export const resetPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"]
})

// Organization Schemas
export const organizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(100, "Name must be less than 100 characters"),
  domain: z.string().optional()
})

export const inviteUserSchema = z.object({
  email: emailSchema,
  role: z.enum(["ADMIN", "EDITOR"]).default("EDITOR")
})



// Materials Module Schemas
export const materialCompositionSchema = z.record(
  z.string().min(1, "Material name cannot be empty"),
  z.number().min(0, "Composition must be non-negative").max(100, "Composition cannot exceed 100%")
).refine((data) => {
  const total = Object.values(data).reduce((sum, value) => sum + value, 0)
  return Math.abs(total - 100) < 0.01 // Allow for small floating point errors
}, {
  message: "Total composition must equal 100%"
})

export const processParametersSchema = z.record(
  z.string().min(1, "Parameter name cannot be empty"),
  z.union([z.string(), z.number()])
)

export const predictionInputSchema = z.object({
  materials: materialCompositionSchema,
  parameters: processParametersSchema
})

export const predictionRequestSchema = z.object({
  inputs: z.array(predictionInputSchema).min(1, "At least one input is required").max(100, "Maximum 100 inputs allowed")
})

// File Upload Schemas
export const fileUploadSchema = z.object({
  name: z.string().min(1, "File name is required"),
  type: z.enum(["csv", "pdf", "json", "xlsx", "image"]),
  category: z.enum(["materials", "general"]),
  size: z.number().max(50 * 1024 * 1024, "File size cannot exceed 50MB")
})



// Search Schemas
export const searchSchema = z.object({
  query: z.string().min(1, "Search query is required").max(200, "Search query must be less than 200 characters"),
  filters: z.record(z.string(), z.any()).optional()
})

// Settings Schemas
export const userProfileSchema = z.object({
  name: nameSchema,
  email: emailSchema
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "New passwords do not match",
  path: ["confirmPassword"]
}).refine((data) => data.currentPassword !== data.newPassword, {
  message: "New password must be different from current password",
  path: ["newPassword"]
})

// Export type inferences for TypeScript
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>
export type OrganizationFormData = z.infer<typeof organizationSchema>
export type InviteUserFormData = z.infer<typeof inviteUserSchema>
export type PredictionInputFormData = z.infer<typeof predictionInputSchema>
export type PredictionRequestFormData = z.infer<typeof predictionRequestSchema>
export type FileUploadFormData = z.infer<typeof fileUploadSchema>
export type SearchFormData = z.infer<typeof searchSchema>
export type UserProfileFormData = z.infer<typeof userProfileSchema>
export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>