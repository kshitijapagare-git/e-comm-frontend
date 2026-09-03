import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate, useParams } from 'react-router-dom'
import { createProduct, getProduct, getSuppliers, updateProduct } from '../api/client'
import { CategoryCombobox } from '../components/CategoryCombobox'
import { ImageDropzone } from '../components/ImageDropzone'
import { PageHeader } from '../components/PageHeader'
import { StatusBadge } from '../components/StatusBadge'
import { TagInput } from '../components/TagInput'
import { useCategories } from '../hooks/useCategories'
import type { ProductInput, Supplier } from '../types'
import { productSchema, type ProductFormValues } from './productFormSchema'

const UNIT_OPTIONS = ['pcs', 'kg', 'g', 'lb', 'oz', 'liter', 'ml', 'box', 'pack']

const emptyProduct: ProductInput = {
  name: '',
  sku: '',
  barcode: '',
  price: 0,
  costPrice: undefined,
  taxRate: undefined,
  stock: 0,
  lowStockThreshold: undefined,
  status: 'active',
  categoryId: '',
  brand: '',
  supplierId: '',
  unit: '',
  featured: false,
  trackInventory: true,
  shortDescription: '',
  description: '',
  tags: [],
  metaTitle: '',
  metaDescription: '',
}

function toOptionalNumber(value: string): number | undefined {
  if (value === '') return undefined
  const parsed = Number(value)
  return Number.isNaN(parsed) ? undefined : parsed
}

export function ProductFormPage() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()
  const { categories } = useCategories()
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [image, setImage] = useState<File | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    control,
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    resolver: zodResolver(productSchema),
    mode: 'onChange',
    defaultValues: emptyProduct,
  })

  useEffect(() => {
    getSuppliers().then(setSuppliers)
  }, [])

  useEffect(() => {
    if (!id) return
    getProduct(id).then((product) => {
      const { id: _productId, ...rest } = product
      reset({ ...emptyProduct, ...rest })
    })
  }, [id, reset])

  async function onSubmit(data: ProductFormValues) {
    setSubmitError(null)
    // zod's required/optional inference needs strictNullChecks, which this
    // project's tsconfig doesn't enable, so z.infer widens every field to
    // optional here even though the resolver has already validated them.
    const payload = data as ProductInput
    try {
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

  const values = watch()
  const summaryCategoryName = categories.find((c) => c.id === values.categoryId)?.name ?? '—'

  return (
    <form className="product-form" onSubmit={handleSubmit(onSubmit)}>
      <PageHeader
        breadcrumbs={[{ label: 'Products', to: '/products' }, { label: isEdit ? 'Edit product' : 'New product' }]}
        title={isEdit ? 'Edit product' : 'New product'}
        subtext="Fill in the details below to keep your catalog accurate and up to date."
        actions={
          <>
            <button type="button" className="btn-secondary" onClick={() => navigate('/products')}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={!isValid || isSubmitting}>
              {isSubmitting ? 'Saving…' : 'Save product'}
            </button>
          </>
        }
      />

      {submitError && <p role="alert">{submitError}</p>}

      <div className="product-form-grid">
        <div className="product-form-main">
          <section className="form-card">
            <div className="form-card-header">
              <h2>Product information</h2>
              <p className="form-card-subtext">Core details that identify and price this product.</p>
            </div>
            <div className="form-grid">
              <label>
                Product Name<span className="required-asterisk">*</span>
                <input {...register('name')} />
                {errors.name && <span className="field-error">{errors.name.message}</span>}
              </label>
              <label>
                SKU<span className="required-asterisk">*</span>
                <input {...register('sku')} />
                {errors.sku && <span className="field-error">{errors.sku.message}</span>}
              </label>
              <label>
                Barcode
                <input {...register('barcode')} />
              </label>
              <label>
                Category<span className="required-asterisk">*</span>
                <Controller
                  name="categoryId"
                  control={control}
                  render={({ field }) => (
                    <CategoryCombobox
                      id="categoryId"
                      name="categoryId"
                      value={field.value}
                      onChange={field.onChange}
                      onBlur={field.onBlur}
                    />
                  )}
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
                Price<span className="required-asterisk">*</span>
                <div className="input-with-affix">
                  <span className="input-affix">$</span>
                  <Controller
                    name="price"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(toOptionalNumber(e.target.value))}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </div>
                {errors.price && <span className="field-error">{errors.price.message}</span>}
              </label>
              <label>
                Cost Price
                <div className="input-with-affix">
                  <span className="input-affix">$</span>
                  <Controller
                    name="costPrice"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(toOptionalNumber(e.target.value))}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                </div>
                {errors.costPrice && <span className="field-error">{errors.costPrice.message}</span>}
              </label>
              <label>
                Tax Rate
                <div className="input-with-affix input-with-affix-suffix">
                  <Controller
                    name="taxRate"
                    control={control}
                    render={({ field }) => (
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={field.value ?? ''}
                        onChange={(e) => field.onChange(toOptionalNumber(e.target.value))}
                        onBlur={field.onBlur}
                      />
                    )}
                  />
                  <span className="input-affix">%</span>
                </div>
                {errors.taxRate && <span className="field-error">{errors.taxRate.message}</span>}
              </label>
              <label>
                Stock Quantity<span className="required-asterisk">*</span>
                <Controller
                  name="stock"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      min="0"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(toOptionalNumber(e.target.value))}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                {errors.stock && <span className="field-error">{errors.stock.message}</span>}
              </label>
              <label>
                Low Stock Threshold
                <Controller
                  name="lowStockThreshold"
                  control={control}
                  render={({ field }) => (
                    <input
                      type="number"
                      min="0"
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(toOptionalNumber(e.target.value))}
                      onBlur={field.onBlur}
                    />
                  )}
                />
                <span className="field-hint">You'll be alerted when stock reaches this level</span>
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
                Status<span className="required-asterisk">*</span>
                <select {...register('status')}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </label>
              <label className="toggle-field">
                <span>Featured Product</span>
                <input type="checkbox" {...register('featured')} />
                <span className="field-hint">Show this product on the homepage</span>
              </label>
              <label className="toggle-field">
                <span>Track Inventory</span>
                <input type="checkbox" {...register('trackInventory')} />
              </label>
            </div>
          </section>

          <section className="form-card">
            <div className="form-card-header">
              <h2>Additional information</h2>
              <p className="form-card-subtext">Optional context, tags and search-engine metadata.</p>
            </div>
            <div className="form-grid">
              <label>
                Short Description
                <textarea maxLength={150} {...register('shortDescription')} />
                <span className="field-hint">{(values.shortDescription ?? '').length} / 150</span>
                {errors.shortDescription && (
                  <span className="field-error">{errors.shortDescription.message}</span>
                )}
              </label>
              <label>
                Description
                <textarea maxLength={1000} {...register('description')} />
                <span className="field-hint">{(values.description ?? '').length} / 1000</span>
                {errors.description && <span className="field-error">{errors.description.message}</span>}
              </label>
              <label>
                Tags
                <Controller
                  name="tags"
                  control={control}
                  render={({ field }) => <TagInput value={field.value ?? []} onChange={field.onChange} />}
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
            </div>
          </section>
        </div>

        <div className="product-form-sidebar">
          <section className="form-card">
            <div className="form-card-header">
              <h2>Product Image</h2>
            </div>
            <ImageDropzone value={image} onChange={setImage} />
          </section>

          <section className="form-card">
            <div className="form-card-header">
              <h2>Product Summary</h2>
            </div>
            <div className="summary-card">
              <div className="summary-row">
                <span className="summary-row-label">SKU</span>
                <span className="summary-row-value">{values.sku || '—'}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row-label">Category</span>
                <span className="summary-row-value">{summaryCategoryName}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row-label">Stock</span>
                <span className="summary-row-value">{values.stock ?? 0}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row-label">Price</span>
                <span className="summary-row-value">${Number(values.price ?? 0).toFixed(2)}</span>
              </div>
              <div className="summary-row">
                <span className="summary-row-label">Status</span>
                <StatusBadge status={values.status ?? 'active'} />
              </div>
            </div>
            {values.trackInventory && (
              <div className="summary-note">
                <strong>Stock Tracking</strong>
                Stock will be automatically updated when orders are placed
              </div>
            )}
          </section>
        </div>
      </div>
    </form>
  )
}
