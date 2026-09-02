import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, getProducts } from '../api/client'
import { AvatarTile } from '../components/AvatarTile'
import { Pagination } from '../components/Pagination'
import { StatusBadge } from '../components/StatusBadge'
import { Toolbar } from '../components/Toolbar'
import { useCategories } from '../hooks/useCategories'
import { usePagination } from '../hooks/usePagination'
import type { Product } from '../types'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const { categories } = useCategories()

  function load() {
    getProducts()
      .then(setProducts)
      .catch(() => setError('Failed to load products'))
  }

  useEffect(load, [])

  async function handleDelete(id: string) {
    await deleteProduct(id)
    load()
  }

  function categoryName(categoryId: string) {
    return categories.find((c) => c.id === categoryId)?.name ?? categoryId
  }

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase()
    if (!query) return products
    return products.filter(
      (product) => product.name.toLowerCase().includes(query) || product.sku.toLowerCase().includes(query),
    )
  }, [products, search])

  const { page, setPage, totalPages, pageItems } = usePagination(filtered)

  return (
    <div>
      <h1>Products</h1>
      <Toolbar searchValue={search} onSearchChange={setSearch} searchPlaceholder="Search products…">
        <Link to="/products/new">New product</Link>
      </Toolbar>
      {error && <p role="alert">{error}</p>}
      <table>
        <thead>
          <tr>
            <th className="avatar-col"></th>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Category</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {pageItems.map((product) => (
            <tr key={product.id}>
              <td className="avatar-col">
                <AvatarTile label={product.name} shape="square" />
              </td>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{product.price}</td>
              <td>{product.stock}</td>
              <td>{categoryName(product.categoryId)}</td>
              <td>
                <StatusBadge status={product.status} />
              </td>
              <td>
                <Link to={`/products/${product.id}/edit`}>Edit</Link>{' '}
                <button type="button" onClick={() => handleDelete(product.id)}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  )
}
