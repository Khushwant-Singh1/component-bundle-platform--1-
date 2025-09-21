import { z } from "zod"

/**
 * Bundle validation schemas
 */
export const createBundleSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .max(100, "Slug must be less than 100 characters")
    .regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(200, "Short description must be less than 200 characters"),
  description: z.string().min(1, "Description is required").max(5000, "Description must be less than 5000 characters"),
  price: z.number().min(0, "Price must be non-negative"),
  originalPrice: z.number().min(0, "Original price must be non-negative").optional(),
  setupTime: z.string().max(50, "Setup time must be less than 50 characters").optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  estimatedValue: z.string().max(50, "Estimated value must be less than 50 characters").optional(),
  category: z.string().min(1, "Category is required").max(50, "Category must be less than 50 characters"),
  demoUrl: z.string().url("Demo URL must be a valid URL").optional().or(z.literal("")),
  githubUrl: z.string().url("GitHub URL must be a valid URL").optional().or(z.literal("")),
  downloadUrl: z.string().url("Download URL must be a valid URL").optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  tags: z.array(z.string()).optional(),
  techStack: z.array(z.string()).optional(),
  features: z.array(z.string()).optional(),
  includes: z.array(z.string()).optional(),
  images: z.array(z.string()).optional(),
})

export const updateBundleSchema = createBundleSchema.partial()

export const bundleQuerySchema = z.object({
  page: z.string().transform(Number).pipe(z.number().min(1)).optional(),
  limit: z.string().transform(Number).pipe(z.number().min(1).max(100)).optional(),
  search: z.string().optional(),
  category: z.string().optional(),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).optional(),
  minPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  maxPrice: z.string().transform(Number).pipe(z.number().min(0)).optional(),
  isActive: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  isFeatured: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  isBestseller: z
    .string()
    .transform((val) => val === "true")
    .pipe(z.boolean())
    .optional(),
  tags: z
    .string()
    .transform((val) => val.split(","))
    .optional(),
  sortBy: z.enum(["name", "price", "createdAt", "updatedAt", "downloadCount", "viewCount"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
})

/**
 * Review validation schemas
 */
export const createReviewSchema = z.object({
  bundleId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().max(100).optional(),
  content: z.string().min(1, "Review content is required").max(1000),
  isPublic: z.boolean().default(true),
})

/**
 * Order validation schemas
 */
export const createOrderSchema = z.object({
  items: z.array(
    z.object({
      bundleId: z.string(),
      quantity: z.number().min(1).default(1),
    }),
  ),
  customerName: z.string().min(1, "Customer name is required"),
  email: z.string().email("Valid email is required"),
  paymentMethod: z.string().min(1, "Payment method is required"),
})

/**
 * Newsletter validation schema
 */
export const newsletterSchema = z.object({
  email: z.string().email("Valid email is required"),
})

/**
 * Contact form validation schema
 */
export const contactSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Valid email is required"),
  company: z.string().max(100).optional(),
  subject: z.enum(["TECHNICAL", "BILLING", "PRESALES", "PARTNERSHIP", "FEEDBACK", "OTHER"]),
  message: z.string().min(1, "Message is required").max(2000),
})
