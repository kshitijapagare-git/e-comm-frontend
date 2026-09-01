export type ProductStatus = 'active' | 'inactive'

export interface Product {
  id: string
  name: string
  sku: string
  price: number
  stock: number
  status: ProductStatus
}

export type ProductInput = Omit<Product, 'id'>

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
