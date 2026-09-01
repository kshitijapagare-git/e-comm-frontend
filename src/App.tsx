import { Navigate, NavLink, Route, Routes } from 'react-router-dom'
import { OrderFormPage } from './pages/OrderFormPage'
import { OrdersPage } from './pages/OrdersPage'
import { ProductFormPage } from './pages/ProductFormPage'
import { ProductsPage } from './pages/ProductsPage'

function App() {
  return (
    <div className="app">
      <nav>
        <NavLink to="/products">Products</NavLink>
        <NavLink to="/orders">Orders</NavLink>
      </nav>
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/products" replace />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/products/new" element={<ProductFormPage />} />
          <Route path="/products/:id/edit" element={<ProductFormPage />} />
          <Route path="/orders" element={<OrdersPage />} />
          <Route path="/orders/new" element={<OrderFormPage />} />
          <Route path="/orders/:id/edit" element={<OrderFormPage />} />
        </Routes>
      </main>
    </div>
  )
}

export default App
