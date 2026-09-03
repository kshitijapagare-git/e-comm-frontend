import { z } from 'zod'

export const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  supplierId: z.string().optional(),
  price: z
    .number({ required_error: 'Price is required', invalid_type_error: 'Price is required' })
    .min(0, 'Price must be zero or greater'),
  costPrice: z.number().min(0, 'Cost price must be zero or greater').optional(),
  taxRate: z
    .number()
    .min(0, 'Tax rate must be zero or greater')
    .max(100, 'Tax rate must be 100 or less')
    .optional(),
  stock: z
    .number({ required_error: 'Stock quantity is required', invalid_type_error: 'Stock quantity is required' })
    .min(0, 'Stock must be zero or greater'),
  lowStockThreshold: z.number().min(0, 'Low stock threshold must be zero or greater').optional(),
  unit: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  featured: z.boolean().optional(),
  trackInventory: z.boolean().optional(),
  shortDescription: z.string().max(150, 'Short description must be 150 characters or fewer').optional(),
  description: z.string().max(1000, 'Description must be 1000 characters or fewer').optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export type ProductFormValues = z.infer<typeof productSchema>
