import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import type { Resolver } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { createProduct, getProduct, getSuppliers, updateProduct } from '../api/client'
import { Card } from '../components/Card'
import { CategoryCombobox } from '../components/CategoryCombobox'
import { ImageDropzone } from '../components/ImageDropzone'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { TagInput } from '../components/TagInput'
import { Toggle } from '../components/Toggle'
import { useCategories } from '../hooks/useCategories'
import type { ProductInput, Supplier } from '../types'

const UNIT_OPTIONS = ['pcs', 'kg', 'g', 'l', 'ml', 'box', 'pack']

const numberOrUndefined = (val: unknown) =>
  typeof val === 'number' && Number.isNaN(val) ? undefined : val

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  supplierId: z.string().optional(),
  price: z.preprocess(
    numberOrUndefined,
    z
      .number({ required_error: 'Price is required', invalid_type_error: 'Price is required' })
      .min(0, 'Price must be 0 or greater'),
  ),
  costPrice: z.preprocess(
    numberOrUndefined,
    z.number().min(0, 'Cost price must be 0 or greater').optional(),
  ),
  taxRatePercent: z.preprocess(
    numberOrUndefined,
    z.number().min(0, 'Tax rate must be 0 or greater').max(100, 'Tax rate cannot exceed 100').optional(),
  ),
  stock: z.preprocess(
    numberOrUndefined,
    z
      .number({ required_error: 'Stock quantity is required', invalid_type_error: 'Stock quantity is required' })
      .min(0, 'Stock must be 0 or greater'),
  ),
  lowStockThreshold: z.preprocess(
    numberOrUndefined,
    z.number().min(0, 'Low stock threshold must be 0 or greater').optional(),
  ),
  unit: z.string().optional(),
  status: z.enum(['active', 'inactive'], { required_error: 'Status is required' }),
  featured: z.boolean(),
  trackInventory: z.boolean(),
  imageUrl: z.string().optional(),
  shortDescription: z.string().max(150, 'Short description must be 150 characters or fewer').optional(),
  description: z.string().max(1000, 'Description must be 1000 characters or fewer').optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

type ProductFormValues = z.infer<typeof productSchema>

const emptyProduct: ProductFormValues = {
  name: '',
  sku: '',
  barcode: '',
  categoryId: '',
  brand: '',
  supplierId: '',
  price: 0,
  costPrice: undefined,
  taxRatePercent: undefined,
  stock: 0,
  lowStockThreshold: undefined,
  unit: '',
  status: 'active',
  featured: false,
  trackInventory: true,
  imageUrl: '',
  shortDescription: '',
  description: '',
  tags: [],
  metaTitle: '',
  metaDescription: '',
}

function zodResolver(schema: typeof productSchema) {
  return (values: unknown) => {
    const result = schema.safeParse(values)
    if (result.success) {
      return { values: result.data, errors: {} }
    }
    const errors: Record<string, { type: string; message: string }> = {}
    for (const issue of result.error.issues) {
      const path = issue.path.join('.')
      if (path && !errors[path]) {
        errors[path] = { type: issue.code, message: issue.message }
      }
    }
    return { values: {}, errors }
  }
}

export function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [submitError, setSubmitError] = useState<string | null>(null)
  const { categories } = useCategories()

  const {
    register,
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema) as unknown as Resolver<ProductFormValues>,
    defaultValues: emptyProduct,
    mode: 'onChange',
  })

  useEffect(() => {
    getSuppliers().then(setSuppliers)
  }, [])

  useEffect(() => {
    if (!id) return
    getProduct(id).then((product) => {
      reset({ ...emptyProduct, ...product, tags: product.tags ?? [] })
    })
  }, [id, reset])

  const watchedSku = watch('sku')
  const watchedCategoryId = watch('categoryId')
  const watchedStock = watch('stock')
  const watchedPrice = watch('price')
  const watchedStatus = watch('status')
  const watchedTrackInventory = watch('trackInventory')
  const watchedShortDescription = watch('shortDescription') ?? ''
  const watchedDescription = watch('description') ?? ''

  const categoryName = categories.find((c) => c.id === watchedCategoryId)?.name ?? '—'

  async function onSubmit(values: ProductFormValues) {
    setSubmitError(null)
    try {
      const payload = values as ProductInput
      if (isEdit && id) {
        await updateProduct(id, payload)
      } else {
        await createProduct(payload)
      }
      navigate('/products')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to save product')
    }
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="product-form">
      <PageHeader
        breadcrumb={[{ label: 'Products', to: '/products' }, { label: isEdit ? 'Edit product' : 'New product' }]}
        title={isEdit ? 'Edit product' : 'New product'}
        subtitle={
          isEdit
            ? 'Update the details for this product'
            : 'Fill in the details to add a new product to your catalog'
        }
        actions={
          <>
            <button type="button" className="btn-secondary" onClick={() => navigate('/products')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={isSubmitting || !isValid}>
              {isSubmitting ? 'Saving…' : 'Save product'}
            </button>
          </>
        }
      />
      {submitError && <p role="alert">{submitError}</p>}
      <div className="product-form-grid">
        <div className="product-form-main">
          <Card title="Product information" subtitle="Basic details about the product">
            <label>
              Product Name<span className="required-marker" aria-hidden="true"> *</span>
              <input {...register('name')} />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </label>
            <label>
              SKU<span className="required-marker" aria-hidden="true"> *</span>
              <input {...register('sku')} />
              {errors.sku && <span className="field-error">{errors.sku.message}</span>}
            </label>
            <label>
              Barcode
              <input {...register('barcode')} />
            </label>
            <label>
              Category<span className="required-marker" aria-hidden="true"> *</span>
              <Controller
                control={control}
                name="categoryId"
                render={({ field }) => <CategoryCombobox value={field.value} onChange={field.onChange} />}
              />
              {errors.categoryId && <span className="field-error">{errors.categoryId.message}</span>}
            </label>
            <label>
              Brand
              <input {...register('brand')} />
            </label>
            <label>
              Supplier
              <select {...register('supplierId')}>
                <option value="">Select a supplier</option>
                {suppliers.map((supplier) => (
                  <option key={supplier.id} value={supplier.id}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Price<span className="required-marker" aria-hidden="true"> *</span>
              <div className="input-affix">
                <span className="input-affix-prefix">$</span>
                <input type="number" step="0.01" min="0" {...register('price', { valueAsNumber: true })} />
              </div>
              {errors.price && <span className="field-error">{errors.price.message}</span>}
            </label>
            <label>
              Cost Price
              <div className="input-affix">
                <span className="input-affix-prefix">$</span>
                <input type="number" step="0.01" min="0" {...register('costPrice', { valueAsNumber: true })} />
              </div>
              {errors.costPrice && <span className="field-error">{errors.costPrice.message}</span>}
            </label>
            <label>
              Tax Rate
              <div className="input-affix">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register('taxRatePercent', { valueAsNumber: true })}
                />
                <span className="input-affix-suffix">%</span>
              </div>
              {errors.taxRatePercent && <span className="field-error">{errors.taxRatePercent.message}</span>}
            </label>
            <label>
              Stock Quantity<span className="required-marker" aria-hidden="true"> *</span>
              <input type="number" min="0" {...register('stock', { valueAsNumber: true })} />
              {errors.stock && <span className="field-error">{errors.stock.message}</span>}
            </label>
            <label>
              Low Stock Threshold
              <input type="number" min="0" {...register('lowStockThreshold', { valueAsNumber: true })} />
              <span className="field-help">You&apos;ll be alerted when stock reaches this level</span>
              {errors.lowStockThreshold && (
                <span className="field-error">{errors.lowStockThreshold.message}</span>
              )}
            </label>
            <label>
              Unit
              <select {...register('unit')}>
                <option value="">Select a unit</option>
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit} value={unit}>
                    {unit}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Status<span className="required-marker" aria-hidden="true"> *</span>
              <select {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
              {errors.status && <span className="field-error">{errors.status.message}</span>}
            </label>
            <Controller
              control={control}
              name="featured"
              render={({ field }) => (
                <Toggle
                  label="Featured Product"
                  helperText="Show this product on the homepage"
                  checked={field.value}
                  onChange={field.onChange}
                />
              )}
            />
            <Controller
              control={control}
              name="trackInventory"
              render={({ field }) => (
                <Toggle label="Track Inventory" checked={field.value} onChange={field.onChange} />
              )}
            />
          </Card>

          <Card title="Additional information" subtitle="Descriptions, tags and SEO metadata">
            <label>
              Short Description
              <textarea maxLength={150} {...register('shortDescription')} />
              <span className="field-help">{watchedShortDescription.length} / 150</span>
              {errors.shortDescription && (
                <span className="field-error">{errors.shortDescription.message}</span>
              )}
            </label>
            <label>
              Description
              <textarea maxLength={1000} {...register('description')} />
              <span className="field-help">{watchedDescription.length} / 1000</span>
              {errors.description && <span className="field-error">{errors.description.message}</span>}
            </label>
            <label>
              Tags
              <Controller
                control={control}
                name="tags"
                render={({ field }) => (
                  <TagInput value={field.value ?? []} onChange={field.onChange} placeholder="Add a tag" />
                )}
              />
            </label>
            <label>
              Meta Title (SEO)
              <input {...register('metaTitle')} />
            </label>
            <label>
              Meta Description (SEO)
              <input {...register('metaDescription')} />
            </label>
          </Card>
        </div>

        <div className="product-form-aside">
          <Card title="Product Image" subtitle="Upload a photo for this product">
            <Controller
              control={control}
              name="imageUrl"
              render={({ field }) => <ImageDropzone value={field.value} onChange={field.onChange} />}
            />
          </Card>

          <Card title="Product Summary" subtitle="Preview of what will be saved">
            <dl className="product-summary">
              <div className="product-summary-row">
                <dt>SKU</dt>
                <dd>{watchedSku || '—'}</dd>
              </div>
              <div className="product-summary-row">
                <dt>Category</dt>
                <dd>{categoryName}</dd>
              </div>
              <div className="product-summary-row">
                <dt>Stock</dt>
                <dd>{Number.isFinite(watchedStock) ? watchedStock : '—'}</dd>
              </div>
              <div className="product-summary-row">
                <dt>Price</dt>
                <dd>{Number.isFinite(watchedPrice) ? `$${watchedPrice.toFixed(2)}` : '—'}</dd>
              </div>
              <div className="product-summary-row">
                <dt>Status</dt>
                <dd>
                  <StatusBadge status={watchedStatus} />
                </dd>
              </div>
            </dl>
            {watchedTrackInventory && (
              <p className="product-summary-note">
                <strong>Stock Tracking</strong> — Stock will be automatically updated when orders are placed
              </p>
            )}
          </Card>
        </div>
      </div>
    </form>
  )
}
