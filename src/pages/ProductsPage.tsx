import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { deleteProduct, getProducts } from '../api/client'
import type { Product } from '../types'

export function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [error, setError] = useState<string | null>(null)

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

  return (
    <div>
      <div className="page-header">
        <h1>Products</h1>
        <Link to="/products/new">New product</Link>
      </div>
      {error && <p role="alert">{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>SKU</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.sku}</td>
              <td>{product.price}</td>
              <td>{product.stock}</td>
              <td>{product.status}</td>
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
    </div>
  )
}
