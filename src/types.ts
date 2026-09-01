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

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'cancelled'

export interface Order {
  id: string
  customerName: string
  productId: string
  quantity: number
  unitPrice: number
  status: OrderStatus
}

export type OrderInput = Omit<Order, 'id'>
