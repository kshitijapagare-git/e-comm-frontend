import type { Order, OrderInput, Product, ProductInput } from '../types'

let products: Product[] = [
  { id: 'p1', name: 'Wireless Mouse', sku: 'SKU-001', price: 25.99, stock: 120, status: 'active' },
  { id: 'p2', name: 'Mechanical Keyboard', sku: 'SKU-002', price: 79.5, stock: 45, status: 'active' },
]

let orders: Order[] = [
  { id: 'o1', customerName: 'Jane Doe', productId: 'p1', quantity: 2, unitPrice: 25.99, status: 'pending' },
]

let nextId = 3

function delay<T>(value: T): Promise<T> {
  return new Promise((resolve) => setTimeout(() => resolve(value), 200))
}

export async function getProducts(): Promise<Product[]> {
  return delay(products)
}

export async function getProduct(id: string): Promise<Product> {
  const product = products.find((p) => p.id === id)
  if (!product) throw new Error(`Product ${id} not found`)
  return delay(product)
}

export async function createProduct(input: ProductInput): Promise<Product> {
  const product: Product = { ...input, id: `p${nextId++}` }
  products = [...products, product]
  return delay(product)
}

export async function updateProduct(id: string, input: ProductInput): Promise<Product> {
  const product: Product = { ...input, id }
  products = products.map((p) => (p.id === id ? product : p))
  return delay(product)
}

export async function deleteProduct(id: string): Promise<void> {
  products = products.filter((p) => p.id !== id)
  return delay(undefined)
}

export async function getOrders(): Promise<Order[]> {
  return delay(orders)
}

export async function getOrder(id: string): Promise<Order> {
  const order = orders.find((o) => o.id === id)
  if (!order) throw new Error(`Order ${id} not found`)
  return delay(order)
}

export async function createOrder(input: OrderInput): Promise<Order> {
  const order: Order = { ...input, id: `o${nextId++}` }
  orders = [...orders, order]
  return delay(order)
}

export async function updateOrder(id: string, input: OrderInput): Promise<Order> {
  const order: Order = { ...input, id }
  orders = orders.map((o) => (o.id === id ? order : o))
  return delay(order)
}

export async function deleteOrder(id: string): Promise<void> {
  orders = orders.filter((o) => o.id !== id)
  return delay(undefined)
}
