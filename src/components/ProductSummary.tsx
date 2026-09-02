import { StatusBadge } from './StatusBadge'
import { useCategories } from '../hooks/useCategories'

interface ProductSummaryProps {
  sku: string
  categoryId: string
  stock: number
  price: number
  status: string
  trackInventory?: boolean
}

export function ProductSummary({
  sku,
  categoryId,
  stock,
  price,
  status,
  trackInventory,
}: ProductSummaryProps) {
  const { categories } = useCategories()
  const categoryName = categories.find((category) => category.id === categoryId)?.name ?? '—'

  return (
    <div className="product-summary">
      <h2>Product summary</h2>
      <dl>
        <div className="product-summary-row">
          <dt>SKU</dt>
          <dd>{sku || '—'}</dd>
        </div>
        <div className="product-summary-row">
          <dt>Category</dt>
          <dd>{categoryName}</dd>
        </div>
        <div className="product-summary-row">
          <dt>Stock</dt>
          <dd>{stock}</dd>
        </div>
        <div className="product-summary-row">
          <dt>Price</dt>
          <dd>${Number.isFinite(price) ? price.toFixed(2) : '0.00'}</dd>
        </div>
        <div className="product-summary-row">
          <dt>Status</dt>
          <dd>
            <StatusBadge status={status} />
          </dd>
        </div>
      </dl>
      {trackInventory && (
        <p className="product-summary-note">
          <strong>Stock Tracking</strong> — Stock will be automatically updated when orders are placed
        </p>
      )}
    </div>
  )
}
