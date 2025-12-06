import React from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import { AuthProvider } from './contexts/AuthContext'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import CarRental from './pages/CarRental'
import AirportTransfer from './pages/AirportTransfer'
import TourDetail from './pages/TourDetail'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'

function App() {
  const location = useLocation()
  const isAdmin = location.pathname.startsWith('/admin')
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50">
        {!isAdmin && <Navbar />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tour/:slug" element={<TourDetail />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/car-rental" element={<CarRental />} />
          <Route path="/airport-transfer" element={<AirportTransfer />} />
          <Route 
            path="/admin/*" 
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
        </Routes>
        {!isAdmin && <Footer />}
      </div>
    </AuthProvider>
  )
}

export default App
