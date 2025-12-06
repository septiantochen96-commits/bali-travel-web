import { useState } from 'react'
import { Routes, Route, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LogOut, Plus, List, Settings, Car } from 'lucide-react'
import TourList from '../../components/admin/TourList'
import TourForm from '../../components/admin/TourForm'
import CarList from '../../components/admin/CarList'
import CarForm from '../../components/admin/CarForm'
import BrandingForm from '../../components/admin/BrandingForm'
import SubcategoryManager from '../../components/admin/SubcategoryManager'
import AirportTransfer from './AirportTransfer'
import AdminSettings from './Settings'

export default function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('tours')

  const handleLogout = async () => {
    await logout()
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Admin Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-serif font-bold text-emerald-700">
                Admin Dashboard
              </h1>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 text-gray-600 hover:text-emerald-600 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar */}
          <div className="lg:w-64">
            <nav className="bg-white rounded-lg shadow-sm p-4">
              <ul className="space-y-2">
                <li>
                  <Link
                    to="/admin/tours"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'tours' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('tours')}
                  >
                    <List className="h-5 w-5" />
                    <span>Tours</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/cars"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'cars' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('cars')}
                  >
                    <Car className="h-5 w-5" />
                    <span>Car Rentals</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/subcategories"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'subcategories' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('subcategories')}
                  >
                    <List className="h-5 w-5" />
                    <span>Subcategories</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/tours/new"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'new_tour' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('new_tour')}
                  >
                    <Plus className="h-5 w-5" />
                    <span>Add New Tour</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/airport-transfer"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'airport' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('airport')}
                  >
                    <Car className="h-5 w-5" />
                    <span>Airport Transfer</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/settings/branding"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'branding' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('branding')}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Branding</span>
                  </Link>
                </li>
                <li>
                  <Link
                    to="/admin/settings"
                    className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                      activeTab === 'settings' 
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                        : 'text-gray-700 hover:bg-gray-50'
                    }`}
                    onClick={() => setActiveTab('settings')}
                  >
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <Routes>
              <Route path="tours" element={<TourList />} />
              <Route path="tours/new" element={<TourForm />} />
              <Route path="tours/edit/:id" element={<TourForm />} />
              <Route path="cars" element={<CarList />} />
              <Route path="cars/new" element={<CarForm />} />
              <Route path="cars/edit/:id" element={<CarForm />} />
              <Route path="subcategories" element={<SubcategoryManager />} />
              <Route path="settings/branding" element={<BrandingForm />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="airport-transfer" element={<AirportTransfer />} />
              <Route path="*" element={<TourList />} />
            </Routes>
          </div>
        </div>
      </div>
    </div>
  )
}
