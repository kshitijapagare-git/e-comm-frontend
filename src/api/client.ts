import type { Category, CategoryInput, Customer, CustomerInput, Order, OrderInput, Product, ProductInput, Supplier } from '../types'

let categories: Category[] = [
  { id: 'cat1', name: 'Accessories', description: 'Computer accessories' },
]

let suppliers: Supplier[] = [
  { id: 'sup1', name: 'Acme Supplies' },
  { id: 'sup2', name: 'Global Parts Co.' },
]

let products: Product[] = [
  { id: 'p1', name: 'Wireless Mouse', sku: 'SKU-001', price: 25.99, stock: 120, status: 'active', categoryId: 'cat1' },
  { id: 'p2', name: 'Mechanical Keyboard', sku: 'SKU-002', price: 79.5, stock: 45, status: 'active', categoryId: 'cat1' },
]

let customers: Customer[] = [
  { id: 'c1', name: 'Jane Doe', email: 'jane.doe@example.com', phone: '555-0100', address: '123 Main St' },
]

let orders: Order[] = [
  { id: 'o1', customerId: 'c1', productId: 'p1', quantity: 2, unitPrice: 25.99, status: 'pending' },
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

export async function getCustomers(): Promise<Customer[]> {
  return delay(customers)
}

export async function getCustomer(id: string): Promise<Customer> {
  const customer = customers.find((c) => c.id === id)
  if (!customer) throw new Error(`Customer ${id} not found`)
  return delay(customer)
}

export async function createCustomer(input: CustomerInput): Promise<Customer> {
  const customer: Customer = { ...input, id: `c${nextId++}` }
  customers = [...customers, customer]
  return delay(customer)
}

export async function updateCustomer(id: string, input: CustomerInput): Promise<Customer> {
  const customer: Customer = { ...input, id }
  customers = customers.map((c) => (c.id === id ? customer : c))
  return delay(customer)
}

export async function deleteCustomer(id: string): Promise<void> {
  const referenced = orders.some((o) => o.customerId === id)
  if (referenced) {
    throw new Error(`Customer ${id} is referenced by existing orders`)
  }
  customers = customers.filter((c) => c.id !== id)
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

export async function getSuppliers(): Promise<Supplier[]> {
  return delay(suppliers)
}

export async function getSupplier(id: string): Promise<Supplier> {
  const supplier = suppliers.find((s) => s.id === id)
  if (!supplier) throw new Error(`Supplier ${id} not found`)
  return delay(supplier)
}

export async function uploadProductImage(id: string, file: File): Promise<{ imageUrl: string }> {
  void id
  const imageUrl = URL.createObjectURL(file)
  return delay({ imageUrl })
}

export async function getCategories(): Promise<Category[]> {
  return delay(categories)
}

export async function getCategory(id: string): Promise<Category> {
  const category = categories.find((c) => c.id === id)
  if (!category) throw new Error(`Category ${id} not found`)
  return delay(category)
}

export async function createCategory(input: CategoryInput): Promise<Category> {
  const duplicate = categories.some((c) => c.name === input.name)
  if (duplicate) {
    throw new Error(`Category with name "${input.name}" already exists`)
  }
  const category: Category = { ...input, id: `cat${nextId++}` }
  categories = [...categories, category]
  return delay(category)
}

export async function updateCategory(id: string, input: CategoryInput): Promise<Category> {
  const duplicate = categories.some((c) => c.id !== id && c.name === input.name)
  if (duplicate) {
    throw new Error(`Category with name "${input.name}" already exists`)
  }
  const category: Category = { ...input, id }
  categories = categories.map((c) => (c.id === id ? category : c))
  return delay(category)
}

export async function deleteCategory(id: string): Promise<void> {
  const referenced = products.some((p) => p.categoryId === id)
  if (referenced) {
    throw new Error(`Category ${id} is referenced by existing products`)
  }
  categories = categories.filter((c) => c.id !== id)
  return delay(undefined)
}
