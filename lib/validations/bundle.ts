import { z } from "zod";

export const bundleSchema = z.object({
  name: z
    .string()
    .min(1, "Bundle name is required")
    .max(100, "Bundle name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(200, "Short description must be less than 200 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be less than 5000 characters"),
  price: z.number().min(0, "Price must be a positive number"),
  originalPrice: z
    .number()
    .min(0, "Original price must be a positive number")
    .optional(),
  category: z.enum(["frontend", "fullstack", "backend", "mobile"], {
    errorMap: () => ({ message: "Please select a valid category" }),
  }),
  difficulty: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"], {
    errorMap: () => ({ message: "Please select a valid difficulty level" }),
  }),
  setupTime: z.string().optional(),
  estimatedValue: z.string().optional(),
  demoUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  githubUrl: z
    .string()
    .url("Please enter a valid URL")
    .optional()
    .or(z.literal("")),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  tags: z
    .array(z.string())
    .min(1, "At least one tag is required")
    .max(10, "Maximum 10 tags allowed"),
  techStack: z
    .array(z.string())
    .min(1, "At least one technology is required")
    .max(15, "Maximum 15 technologies allowed"),
  features: z
    .array(z.string().min(1, "Feature cannot be empty"))
    .min(1, "At least one feature is required")
    .max(20, "Maximum 20 features allowed"),
  includes: z
    .array(z.string().min(1, "Include item cannot be empty"))
    .min(1, "At least one include item is required")
    .max(20, "Maximum 20 include items allowed"),
  perfects: z
    .array(z.string().min(1, "Perfect item cannot be empty"))
    .min(1, "At least one perfect item is required")
    .max(20, "Maximum 20 perfect items allowed"),
  benefits: z
    .array(z.string().min(1, "Benefit item cannot be empty"))
    .min(1, "At least one benefit item is required")
    .max(20, "Maximum 20 benefit items allowed"),
  setup: z
    .array(
      z.object({
        title: z.string().min(1, "Setup title cannot be empty"),
        description: z.string().min(1, "Setup description cannot be empty"),
      })
    )
    .min(1, "At least one setup step is required")
    .max(10, "Maximum 10 setup steps allowed"),
  images: z
    .array(z.string().url("Invalid image URL"))
    .min(1, "At least one image is required")
    .max(10, "Maximum 10 images allowed"),
});

export type BundleFormData = z.infer<typeof bundleSchema>;

// Schema for form validation (before image upload)
export const bundleFormSchema = z.object({
  name: z
    .string()
    .min(1, "Bundle name is required")
    .max(100, "Bundle name must be less than 100 characters"),
  slug: z
    .string()
    .min(1, "Slug is required")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    ),
  shortDescription: z
    .string()
    .min(1, "Short description is required")
    .max(200, "Short description must be less than 200 characters"),
  description: z
    .string()
    .min(1, "Description is required")
    .max(5000, "Description must be less than 5000 characters"),
  price: z
    .string()
    .min(1, "Price is required")
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      "Price must be a positive number"
    ),
  originalPrice: z
    .string()
    .optional()
    .refine(
      (val) => !val || (!isNaN(Number(val)) && Number(val) > 0),
      "Original price must be a positive number"
    ),
  category: z.string().min(1, "Please select a category"),
  difficulty: z.string().min(1, "Please select a difficulty level"),
  setupTime: z.string().optional(),
  estimatedValue: z.string().optional(),
  demoUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      "Please enter a valid URL"
    ),
  githubUrl: z
    .string()
    .optional()
    .refine(
      (val) => !val || val === "" || z.string().url().safeParse(val).success,
      "Please enter a valid URL"
    ),
  isActive: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  isBestseller: z.boolean().default(false),
  tags: z
    .array(z.string())
    .min(1, "At least one tag is required")
    .max(10, "Maximum 10 tags allowed"),
  techStack: z
    .array(z.string())
    .min(1, "At least one technology is required")
    .max(15, "Maximum 15 technologies allowed"),
  features: z
    .array(z.string().min(1, "Feature cannot be empty"))
    .min(1, "At least one feature is required")
    .max(20, "Maximum 20 features allowed"),
  includes: z
    .array(z.string().min(1, "Include item cannot be empty"))
    .min(1, "At least one include item is required")
    .max(20, "Maximum 20 include items allowed"),
  setup: z
    .array(
      z.object({
        title: z.string().min(1, "Setup title cannot be empty"),
        description: z.string().min(1, "Setup description cannot be empty"),
      })
    )
    .min(1, "At least one setup step is required")
    .max(10, "Maximum 10 setup steps allowed"),
});
