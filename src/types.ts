export type ProductStatus = 'active' | 'inactive' | 'archived'

export type ProductUnit = 'unit' | 'kg' | 'g' | 'l' | 'ml' | 'box' | 'pair'

export interface Product {
  id: string
  name: string
  sku: string
  barcode?: string
  price: number
  stock: number
  status: ProductStatus
  categoryId: string
  brand?: string
  supplierId?: string
  costPrice?: number
  taxRate?: number
  lowStockThreshold?: number
  unit?: ProductUnit
  featured?: boolean
  trackInventory?: boolean
  shortDescription?: string
  description?: string
  tags?: string[]
  metaTitle?: string
  metaDescription?: string
  imageUrl?: string
}

export type ProductInput = Omit<Product, 'id'>

export interface Supplier {
  id: string
  name: string
}

export type SupplierInput = Omit<Supplier, 'id'>

export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
}

export type CustomerInput = Omit<Customer, 'id'>

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'

export interface Order {
  id: string
  customerId: string
  productId: string
  quantity: number
  unitPrice: number
  status: OrderStatus
}

export type OrderInput = Omit<Order, 'id'>

export interface Category {
  id: string
  name: string
  description?: string
}

export type CategoryInput = Omit<Category, 'id'>
