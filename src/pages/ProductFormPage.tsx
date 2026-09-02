import { useEffect, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { z } from 'zod'
import { createProduct, getProduct, getSuppliers, updateProduct } from '../api/client'
import { CategoryCombobox } from '../components/CategoryCombobox'
import { ImageDropzone } from '../components/ImageDropzone'
import { PageHeader } from '../components/PageHeader'
import { ProductSummary } from '../components/ProductSummary'
import { TagsInput } from '../components/TagsInput'
import type { ProductInput, ProductUnit, Supplier } from '../types'

const emptyProduct: ProductInput = {
  name: '',
  sku: '',
  barcode: '',
  price: 0,
  costPrice: undefined,
  taxRate: undefined,
  stock: 0,
  lowStockThreshold: undefined,
  unit: undefined,
  status: 'active',
  categoryId: '',
  brand: '',
  supplierId: '',
  featured: false,
  trackInventory: true,
  imageUrl: undefined,
  shortDescription: '',
  description: '',
  tags: [],
  metaTitle: '',
  metaDescription: '',
}

const UNIT_OPTIONS: ProductUnit[] = ['unit', 'kg', 'g', 'l', 'ml', 'box', 'pack']

// Numeric <input> fields registered with { valueAsNumber: true } produce NaN (not
// undefined) when left blank. These helpers normalize that NaN to undefined before
// zod validates, so optional numeric fields stay optional and required ones report a
// proper "required" message instead of a generic type error.
function requiredNumber(requiredMessage: string, minMessage: string) {
  return z.preprocess(
    (val) => (typeof val === 'number' && Number.isNaN(val) ? undefined : val),
    z.number({ required_error: requiredMessage, invalid_type_error: requiredMessage }).min(0, minMessage),
  )
}

function optionalNumber(schema: z.ZodNumber) {
  return z.preprocess(
    (val) => (typeof val === 'number' && Number.isNaN(val) ? undefined : val),
    schema.optional(),
  )
}

const productSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'SKU is required'),
  barcode: z.string().optional(),
  categoryId: z.string().min(1, 'Category is required'),
  brand: z.string().optional(),
  supplierId: z.string().optional(),
  price: requiredNumber('Price is required', 'Price must be 0 or greater'),
  costPrice: optionalNumber(z.number().min(0, 'Cost price must be 0 or greater')),
  taxRate: optionalNumber(
    z.number().min(0, 'Tax rate must be between 0 and 100').max(100, 'Tax rate must be between 0 and 100'),
  ),
  stock: requiredNumber('Stock quantity is required', 'Stock must be 0 or greater'),
  lowStockThreshold: optionalNumber(z.number().min(0, 'Low stock threshold must be 0 or greater')),
  unit: z.enum(['unit', 'kg', 'g', 'l', 'ml', 'box', 'pack']).optional(),
  status: z.enum(['active', 'inactive']),
  featured: z.boolean(),
  trackInventory: z.boolean(),
  imageUrl: z.string().optional(),
  shortDescription: z.string().max(150, 'Short description must be 150 characters or fewer').optional(),
  description: z.string().max(1000, 'Description must be 1000 characters or fewer').optional(),
  tags: z.array(z.string()).optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
})

export function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    trigger,
    formState: { errors, isSubmitting, isValid },
  } = useForm<ProductInput>({
    defaultValues: emptyProduct,
    resolver: zodResolver(productSchema),
    mode: 'onChange',
  })

  useEffect(() => {
    getSuppliers().then(setSuppliers)
  }, [])

  useEffect(() => {
    if (!id) return
    getProduct(id).then((product) => {
      reset(product)
      trigger()
    })
  }, [id, reset, trigger])

  const watchedShortDescription = watch('shortDescription') ?? ''
  const watchedDescription = watch('description') ?? ''
  const watchedSku = watch('sku')
  const watchedCategoryId = watch('categoryId')
  const watchedStock = watch('stock')
  const watchedPrice = watch('price')
  const watchedStatus = watch('status')
  const watchedTrackInventory = watch('trackInventory')

  async function onSubmit(data: ProductInput) {
    setError(null)
    try {
      if (isEdit && id) {
        await updateProduct(id, data)
      } else {
        await createProduct(data)
      }
      navigate('/products')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save product')
    }
  }

  return (
    <div>
      <PageHeader
        breadcrumb={['Products', isEdit ? 'Edit product' : 'New product']}
        title={isEdit ? 'Edit product' : 'New product'}
        subtext={
          isEdit ? 'Update the details for this product' : 'Add a new product to your catalog'
        }
        actions={
          <>
            <button type="button" onClick={() => navigate('/products')}>
              Cancel
            </button>
            <button type="submit" form="product-form" disabled={isSubmitting || !isValid}>
              {isSubmitting ? 'Saving…' : 'Save product'}
            </button>
          </>
        }
      />
      {error && <p role="alert">{error}</p>}
      <form id="product-form" className="product-form-grid" onSubmit={handleSubmit(onSubmit)}>
        <div className="product-form-main">
          <section className="card">
            <h2>Product information</h2>
            <p className="card-subtext">Core details that identify and price this product</p>

            <label>
              Product Name*
              <input required {...register('name')} />
              {errors.name && <span className="field-error">{errors.name.message}</span>}
            </label>

            <label>
              SKU*
              <input required {...register('sku')} />
              {errors.sku && <span className="field-error">{errors.sku.message}</span>}
            </label>

            <label>
              Barcode
              <input {...register('barcode')} />
            </label>

            <label>
              Category*
              <Controller
                name="categoryId"
                control={control}
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
              Price*
              <div className="input-affix">
                <span>$</span>
                <input
                  required
                  type="number"
                  step="0.01"
                  min="0"
                  {...register('price', { valueAsNumber: true })}
                />
              </div>
              {errors.price && <span className="field-error">{errors.price.message}</span>}
            </label>

            <label>
              Cost Price
              <div className="input-affix">
                <span>$</span>
                <input type="number" step="0.01" min="0" {...register('costPrice', { valueAsNumber: true })} />
              </div>
              {errors.costPrice && <span className="field-error">{errors.costPrice.message}</span>}
            </label>

            <label>
              Tax Rate
              <div className="input-affix input-affix-suffix">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  {...register('taxRate', { valueAsNumber: true })}
                />
                <span>%</span>
              </div>
              {errors.taxRate && <span className="field-error">{errors.taxRate.message}</span>}
            </label>

            <label>
              Stock Quantity*
              <input required type="number" min="0" {...register('stock', { valueAsNumber: true })} />
              {errors.stock && <span className="field-error">{errors.stock.message}</span>}
            </label>

            <label>
              Low Stock Threshold
              <input
                type="number"
                min="0"
                {...register('lowStockThreshold', { valueAsNumber: true })}
              />
              <span className="field-help">You'll be alerted when stock reaches this level</span>
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
              Status*
              <select required {...register('status')}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </label>

            <label className="toggle-field">
              <input type="checkbox" {...register('featured')} />
              Featured Product
              <span className="field-help">Show this product on the homepage</span>
            </label>

            <label className="toggle-field">
              <input type="checkbox" {...register('trackInventory')} />
              Track Inventory
            </label>
          </section>

          <section className="card">
            <h2>Additional information</h2>
            <p className="card-subtext">Descriptions, tags, and SEO metadata</p>

            <label>
              Short Description
              <textarea maxLength={150} {...register('shortDescription')} />
              <span className="char-counter">{watchedShortDescription.length} / 150</span>
            </label>

            <label>
              Description
              <textarea maxLength={1000} {...register('description')} />
              <span className="char-counter">{watchedDescription.length} / 1000</span>
            </label>

            <label>
              Tags
              <Controller
                name="tags"
                control={control}
                render={({ field }) => <TagsInput value={field.value ?? []} onChange={field.onChange} />}
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
          </section>
        </div>

        <div className="product-form-side">
          <section className="card">
            <h2>Product Image</h2>
            <Controller
              name="imageUrl"
              control={control}
              render={({ field }) => <ImageDropzone value={field.value} onChange={field.onChange} />}
            />
          </section>

          <section className="card">
            <h2>Product Summary</h2>
            <ProductSummary
              sku={watchedSku}
              categoryId={watchedCategoryId}
              stock={watchedStock}
              price={watchedPrice}
              status={watchedStatus}
              trackInventory={watchedTrackInventory}
            />
          </section>
        </div>
      </form>
    </div>
  )
}
